'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

type NavLink = {
  href: string;
  label: string;
  isButton?: boolean;
};

export function Navigation(): JSX.Element {
  const { isAuthenticated } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navLinks: NavLink[] = [
    { href: '/about', label: 'About' },
    { href: '/bucket-list', label: 'Bucket List' },
  ];

  const authLinks: NavLink[] = isAuthenticated
    ? [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/logout', label: 'Logout', isButton: true },
      ]
    : [{ href: '/login', label: 'Login', isButton: true }];

  const allLinks = [...navLinks, ...authLinks];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            📷 Side Quests
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition"
              >
                {link.label}
              </Link>
            ))}

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
          </div>
        )}
      </div>
    </nav>
  );
}
