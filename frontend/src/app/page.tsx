'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/Button';
import { Footer } from '@/components/Footer';
import { TimelineEntryCard } from '@/components/TimelineEntryCard';

type TimelineEntry = {
  id: string;
  title: string;
  summary?: string;
  views?: number;
  comments_count?: number;
  tags?: string[];
  media?: { length: number }[];
  embeds?: { length: number }[];
  entryDate: string | Date;
  dateLabel: string;
  day: string;
  year: string;
};

type MonthGroup = {
  key: string;
  label: string;
  monthNumber: number;
  entries: TimelineEntry[];
};

type YearGroup = {
  year: string;
  months: MonthGroup[];
};

const normalizeTimeline = (raw: any): TimelineEntry[] => {
  const list: TimelineEntry[] = [];

  Object.entries(raw || {}).forEach(([year, months]) => {
    Object.entries(months as Record<string, any[]>).forEach(([month, entries]) => {
      const safeEntries = Array.isArray(entries) ? entries : [];

      safeEntries.forEach((entry: any) => {
        const date = new Date(entry.entryDate || entry.date || `${year}-${month}-01`);

        list.push({
          ...entry,
          dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          day: date.toLocaleDateString('en-US', { day: '2-digit' }),
          year: date.getFullYear().toString(),
          entryDate: date.toISOString(),
        });
      });
    });
  });

  return list.sort(
    (a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime(),
  );
};

const groupTimeline = (entries: TimelineEntry[]): YearGroup[] => {
  const byYear: Record<string, YearGroup> = {};

  entries.forEach((entry) => {
    const date = new Date(entry.entryDate);
    const year = date.getFullYear().toString();
    const monthNumber = date.getMonth();
    const monthKey = `${year}-${monthNumber + 1}`;
    const monthLabel = date.toLocaleDateString('en-US', { month: 'long' });

    if (!byYear[year]) {
      byYear[year] = { year, months: [] };
    }

    const yearGroup = byYear[year];
    let monthGroup = yearGroup.months.find((m) => m.key === monthKey);

    if (!monthGroup) {
      monthGroup = { key: monthKey, label: monthLabel, monthNumber, entries: [] };
      yearGroup.months.push(monthGroup);
    }

    monthGroup.entries.push(entry);
  });

  return Object.values(byYear)
    .map((yearGroup) => ({
      ...yearGroup,
      months: yearGroup.months
        .map((m) => ({
          ...m,
          entries: [...m.entries].sort(
            (a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime(),
          ),
        }))
        .sort((a, b) => b.monthNumber - a.monthNumber),
    }))
    .sort((a, b) => parseInt(b.year, 10) - parseInt(a.year, 10));
};

export default function Home() {
  useAuth();
  const [timelineEntries, setTimelineEntries] = useState<TimelineEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [collapsedYears, setCollapsedYears] = useState<Record<string, boolean>>({});
  const [collapsedMonths, setCollapsedMonths] = useState<Record<string, boolean>>({});
  const [activeMonthKey, setActiveMonthKey] = useState<string | null>(null);
  const [activeYear, setActiveYear] = useState<string | null>(null);
  const monthRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const loadTimeline = async () => {
      try {
        const data = await api.entries.getTimeline();
        setTimelineEntries(normalizeTimeline(data));
      } catch (error) {
        console.error('Failed to load timeline', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTimeline();
  }, []);

  const entriesToRender = timelineEntries.length > 0 ? timelineEntries : [];

  const groupedTimeline = useMemo(() => groupTimeline(entriesToRender), [entriesToRender]);

  const monthLabels = useMemo(() => {
    const map: Record<string, string> = {};
    groupedTimeline.forEach((year) => {
      year.months.forEach((month) => {
        map[month.key] = month.label;
      });
    });
    return map;
  }, [groupedTimeline]);

  useEffect(() => {
    setCollapsedYears((prev) => {
      const next = { ...prev };
      let changed = false;

      groupedTimeline.forEach((year) => {
        if (next[year.year] === undefined) {
          const hasAllMonths = year.months.length >= 12;
          next[year.year] = hasAllMonths;
          changed = true;
        }
      });

      return changed ? next : prev;
    });

    setCollapsedMonths((prev) => {
      const next = { ...prev };
      let changed = false;

      groupedTimeline.forEach((year) => {
        year.months.forEach((month) => {
          if (next[month.key] === undefined) {
            next[month.key] = month.entries.length > 15;
            changed = true;
          }
        });
      });

      return changed ? next : prev;
    });
  }, [groupedTimeline]);

  useEffect(() => {
    if (!groupedTimeline.length) return undefined;

    if (!activeMonthKey) {
      const firstMonth = groupedTimeline[0]?.months?.[0];
      if (firstMonth) {
        setActiveMonthKey(firstMonth.key);
        setActiveYear(groupedTimeline[0].year);
      }
    }

    let ticking = false;

    const updateActiveByScroll = () => {
      ticking = false;
      const centerY = window.scrollY + window.innerHeight / 2;
      let bestKey: string | null = null;
      let bestYear: string | null = null;
      let bestDistance = Number.POSITIVE_INFINITY;

      groupedTimeline.forEach((year) => {
        year.months.forEach((month) => {
          const el = monthRefs.current[month.key];
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const mid = window.scrollY + rect.top + rect.height / 2;
          const distance = Math.abs(mid - centerY);
          if (distance < bestDistance) {
            bestDistance = distance;
            bestKey = month.key;
            bestYear = year.year;
          }
        });
      });

      if (bestKey && bestKey !== activeMonthKey) setActiveMonthKey(bestKey);
      if (bestYear && bestYear !== activeYear) setActiveYear(bestYear);
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateActiveByScroll);
        ticking = true;
      }
    };

    updateActiveByScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [groupedTimeline, activeMonthKey, activeYear]);

  const toggleYear = (year: string) => {
    setCollapsedYears((prev) => ({ ...prev, [year]: !prev[year] }));
  };

  const toggleMonth = (key: string) => {
    setCollapsedMonths((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleYearKeyToggle = (event: React.KeyboardEvent, year: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleYear(year);
    }
  };

  const handleMonthKeyToggle = (event: React.KeyboardEvent, key: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleMonth(key);
    }
  };

  const activeMonthLabel = activeMonthKey ? monthLabels[activeMonthKey] ?? 'Month' : 'Month';
  const activeYearLabel = activeYear ?? 'Year';
  const activeMonthCollapsed = activeMonthKey ? collapsedMonths[activeMonthKey] : false;
  const activeYearCollapsed = activeYear ? collapsedYears[activeYear] : false;

  const getGradientColor = (entryIndex: number, totalEntries: number) => {
    const progress = totalEntries > 1 ? entryIndex / (totalEntries - 1) : 0;
    
    // Rainbow gradient matching the background line (using 300-weight colors for light mode)
    const stops = [
      { r: 216, g: 180, b: 254 },   // purple-300
      { r: 147, g: 197, b: 253 },   // blue-300
      { r: 103, g: 232, b: 249 },   // cyan-300
      { r: 134, g: 239, b: 172 },   // green-300
      { r: 253, g: 224, b: 71 },    // yellow-300
      { r: 253, g: 186, b: 116 },   // orange-300
      { r: 252, g: 165, b: 165 },   // red-300
    ];

    const scaledProgress = progress * (stops.length - 1);
    const index = Math.floor(scaledProgress);
    const localProgress = scaledProgress - index;

    const startColor = stops[Math.min(index, stops.length - 1)];
    const endColor = stops[Math.min(index + 1, stops.length - 1)];

    const r = Math.round(startColor.r + (endColor.r - startColor.r) * localProgress);
    const g = Math.round(startColor.g + (endColor.g - startColor.g) * localProgress);
    const b = Math.round(startColor.b + (endColor.b - startColor.b) * localProgress);

    return {
      dotColor: `rgb(${r}, ${g}, ${b})`,
      ringColor: `rgba(${r}, ${g}, ${b}, 0.3)`,
    };
  };

  const renderCard = (entry: TimelineEntry) => (
    <TimelineEntryCard entry={entry as any} />
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/70 via-purple-50/60 to-transparent dark:from-indigo-950/60 dark:via-indigo-900/40" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center relative">
          <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-semibold shadow-sm dark:bg-indigo-900/40 dark:text-indigo-100">
            Daily moments • Travel • Life
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-gray-900 dark:text-white mt-6">
            A living timeline of the moments that matter
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mt-4 max-w-3xl mx-auto">
            Scroll through a continuous, center-line timeline of photos, notes, and memories. Designed to feel like paging through a beautifully bound journal—now front and center on the home screen.
          </p>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="bg-white dark:bg-gray-950 py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="pointer-events-none absolute left-1/2 top-0 hidden md:block h-full w-px -translate-x-1/2 bg-gradient-to-b from-purple-300 via-blue-300 via-cyan-300 via-green-300 via-yellow-300 via-orange-300 to-red-300 dark:from-purple-700 dark:via-blue-700 dark:via-cyan-700 dark:via-green-700 dark:via-yellow-700 dark:via-orange-700 dark:to-red-700" />

            {isLoading ? (
              <div className="space-y-10">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-start gap-6">
                    <div className="md:pr-8 animate-pulse">
                      <div className="h-32 rounded-2xl bg-gray-200 dark:bg-gray-800" />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-indigo-300 dark:bg-indigo-700" />
                      <div className="hidden md:block h-24 w-px bg-indigo-100 dark:bg-indigo-800" />
                    </div>
                    <div className="md:pl-8 hidden md:block animate-pulse">
                      <div className="h-32 rounded-2xl bg-gray-200 dark:bg-gray-800" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-12">
                {(() => {
                  let entryIndex = 0;
                  const totalEntries = groupedTimeline.reduce((sum, y) => sum + y.months.reduce((mSum, m) => mSum + m.entries.length, 0), 0);

                  return groupedTimeline.map((year) => {
                    const yearEntryCount = year.months.reduce((sum, m) => sum + m.entries.length, 0);
                    const isYearCollapsed = collapsedYears[year.year];

                    return (
                      <div key={year.year} className="space-y-6">
                        <div
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 cursor-pointer select-none rounded-xl transition hover:bg-indigo-50/60 dark:hover:bg-indigo-950/50"
                          role="button"
                          tabIndex={0}
                          aria-expanded={!isYearCollapsed}
                          onClick={() => toggleYear(year.year)}
                          onKeyDown={(e) => handleYearKeyToggle(e, year.year)}
                        >
                          <div>
                            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-300 tracking-[0.2em] uppercase">{year.year}</p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{year.months.length} month{year.months.length !== 1 ? 's' : ''} • {yearEntryCount} entr{yearEntryCount === 1 ? 'y' : 'ies'}</p>
                          </div>
                        </div>

                        {!isYearCollapsed && (
                          <div className="space-y-8">
                            {year.months.map((month) => {
                              const isMonthCollapsed = collapsedMonths[month.key];
                              const monthGradientColor = getGradientColor(entryIndex, totalEntries);

                              return (
                                <div
                                  key={month.key}
                                  className="space-y-4"
                                  ref={(el) => {
                                    monthRefs.current[month.key] = el;
                                  }}
                                  data-month-key={month.key}
                                  data-year={year.year}
                                >
                                  <div
                                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 cursor-pointer select-none rounded-xl transition hover:bg-indigo-50/60 dark:hover:bg-indigo-950/50"
                                    role="button"
                                    tabIndex={0}
                                    aria-expanded={!isMonthCollapsed}
                                    onClick={() => toggleMonth(month.key)}
                                    onKeyDown={(e) => handleMonthKeyToggle(e, month.key)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <span 
                                        className="inline-flex h-3 w-3 rounded-full" 
                                        style={{ backgroundColor: monthGradientColor.dotColor }}
                                      />
                                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{month.label}</h3>
                                      <span className="text-sm text-gray-500 dark:text-gray-400">{month.entries.length} entr{month.entries.length === 1 ? 'y' : 'ies'}</span>
                                    </div>
                                  </div>

                                  {isMonthCollapsed ? null : (
                                    <div className="space-y-10">
                                      {month.entries.map((entry) => {
                                        const isLeft = entryIndex % 2 === 0;
                                        const currentEntryIndex = entryIndex;
                                        entryIndex += 1;
                                        const gradientColor = getGradientColor(currentEntryIndex, totalEntries);

                                        return (
                                          <div key={entry.id} className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-start gap-6">
                                            <div className={`${isLeft ? 'md:pr-8 md:order-1' : 'md:order-3 md:pl-8 md:col-start-3'} order-2`}>{renderCard(entry)}</div>

                                            <div className="order-1 md:order-2 md:col-start-2 flex flex-col items-center gap-2 self-stretch relative">
                                              <div 
                                                className="w-4 h-4 rounded-full ring-4 z-10" 
                                                style={{ 
                                                  backgroundColor: gradientColor.dotColor,
                                                  boxShadow: `0 0 0 4px ${gradientColor.ringColor}`
                                                }}
                                              />
                                              <span className="hidden md:inline text-xs font-medium text-gray-500 dark:text-gray-400 z-10">{entry.dateLabel}</span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        </div>
      </section>

      {!isLoading && groupedTimeline.length > 0 && (
        <div className="hidden md:flex fixed bottom-6 right-4 md:bottom-8 md:right-8 z-50 flex-col gap-3">
          <Button
            variant="secondary"
            disabled={!activeMonthKey}
            onClick={() => activeMonthKey && toggleMonth(activeMonthKey)}
            className="min-w-[210px]"
          >
            {activeMonthCollapsed ? `Expand ${activeMonthLabel}` : `Collapse ${activeMonthLabel}`}
          </Button>

          <Button
            variant="secondary"
            disabled={!activeYear}
            onClick={() => activeYear && toggleYear(activeYear)}
            className="min-w-[210px]"
          >
            {activeYearCollapsed ? `Expand ${activeYearLabel}` : `Collapse ${activeYearLabel}`}
          </Button>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
