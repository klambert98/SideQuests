'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              📷 Portfolio
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-6">
              <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Home
              </Link>
              <Link href="/timeline" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                Timeline
              </Link>
              <Link href="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                About
              </Link>

              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                    Dashboard
                  </Link>
                  <Link href="/logout" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                    Logout
                  </Link>
                </>
              ) : (
                <Link href="/login" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden pb-4 space-y-2">
              <Link href="/" className="block py-2 hover:text-indigo-600">
                Home
              </Link>
              <Link href="/timeline" className="block py-2 hover:text-indigo-600">
                Timeline
              </Link>
              <Link href="/about" className="block py-2 hover:text-indigo-600">
                About
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" className="block py-2 hover:text-indigo-600">
                    Dashboard
                  </Link>
                  <Link href="/logout" className="block py-2 text-indigo-600">
                    Logout
                  </Link>
                </>
              ) : (
                <Link href="/login" className="block py-2 text-indigo-600">
                  Login
                </Link>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-white">
          Welcome to My Portfolio
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          A chronicle of my daily life, travels, and moments worth sharing.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/timeline"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-lg font-semibold"
          >
            View Timeline
          </Link>
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-lg font-semibold"
            >
              Create Entry
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-lg font-semibold"
            >
              Login
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-gray-900 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-blue-50 dark:bg-gray-800 rounded-lg">
              <div className="text-4xl mb-3">📸</div>
              <h3 className="text-xl font-semibold mb-2">Photo & Video</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Upload and organize your photos and videos in beautiful galleries
              </p>
            </div>

            <div className="p-6 bg-green-50 dark:bg-gray-800 rounded-lg">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-xl font-semibold mb-2">Blog Posts</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Share your thoughts, experiences, and daily reflections
              </p>
            </div>

            <div className="p-6 bg-purple-50 dark:bg-gray-800 rounded-lg">
              <div className="text-4xl mb-3">🔗</div>
              <h3 className="text-xl font-semibold mb-2">Embed Content</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Embed Instagram posts, YouTube videos, and other content
              </p>
            </div>

            <div className="p-6 bg-orange-50 dark:bg-gray-800 rounded-lg">
              <div className="text-4xl mb-3">📅</div>
              <h3 className="text-xl font-semibold mb-2">Timeline View</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Browse your memories organized by months and years
              </p>
            </div>

            <div className="p-6 bg-red-50 dark:bg-gray-800 rounded-lg">
              <div className="text-4xl mb-3">🌐</div>
              <h3 className="text-xl font-semibold mb-2">Multi-Device</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create and edit entries from any device with secure login
              </p>
            </div>

            <div className="p-6 bg-indigo-50 dark:bg-gray-800 rounded-lg">
              <div className="text-4xl mb-3">📱</div>
              <h3 className="text-xl font-semibold mb-2">Android App</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your portfolio with a native Android application
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2026 My Personal Portfolio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
