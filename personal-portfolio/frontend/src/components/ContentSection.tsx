'use client';

type ContentSectionProps = {
  children: React.ReactNode;
  maxWidth?: string;
  padding?: string;
  className?: string;
};

export function ContentSection({
  children,
  maxWidth = 'max-w-6xl',
  padding = 'py-16 md:py-24',
  className = '',
}: ContentSectionProps) {
  return (
    <section className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 ${padding} ${className}`}>
      {children}
    </section>
  );
}
