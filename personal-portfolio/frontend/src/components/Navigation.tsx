'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useState, useRef, useEffect } from 'react';

type NavLink = {
  href: string;
  label: string;
  isButton?: boolean;
};

export function Navigation(): JSX.Element {
  const { isAuthenticated, user } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showDashboardDropdown, setShowDashboardDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDashboardDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks: NavLink[] = [
    { href: '/about', label: 'About' },
    { href: '/bucket-list', label: 'Bucket List' },
  ];

  const authLinks: NavLink[] = !isAuthenticated ? [{ href: '/login', label: 'Login', isButton: true }] : [];

  const allLinks = [...navLinks, ...authLinks];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            📷 Side Quests
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDashboardDropdown(!showDashboardDropdown)}
                  className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  Dashboard
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDashboardDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <Link
                      href="/dashboard/new-post"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      onClick={() => setShowDashboardDropdown(false)}
                    >
                      ✏️ Add New Post
                    </Link>
                    <Link
                      href="/dashboard/metrics"
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                      onClick={() => setShowDashboardDropdown(false)}
                    >
                      📊 Metrics
                    </Link>
                  </div>
                )}
              </div>
            )}

            {authLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  link.isButton
                    ? 'px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition'
                    : 'hover:text-indigo-600 dark:hover:text-indigo-400 transition'
                }
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && user && (
              <div className="flex items-center gap-3">
                <span className="text-gray-700 dark:text-gray-300">
                  Hi, {user.name || 'User'}!
                </span>
                <Link
                  href="/logout"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  Logout
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden pb-4 space-y-2">
            {isAuthenticated && user && (
              <div className="py-2 px-2 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-700 dark:text-gray-300">
                  Hi, {user.name || 'User'}!
                </span>
              </div>
            )}
            {allLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={link.isButton ? 'block py-2 text-indigo-600' : 'block py-2 hover:text-indigo-600'}
                onClick={() => setShowMobileMenu(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <div className="px-2 py-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Dashboard
                </div>
                <Link
                  href="/dashboard/new-post"
                  className="block py-2 pl-4 hover:text-indigo-600"
                  onClick={() => setShowMobileMenu(false)}
                >
                  ✏️ Add New Post
                </Link>
                <Link
                  href="/dashboard/metrics"
                  className="block py-2 pl-4 hover:text-indigo-600"
                  onClick={() => setShowMobileMenu(false)}
                >
                  📊 Metrics
                </Link>
                <Link
                  href="/logout"
                  className="block py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Logout
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
