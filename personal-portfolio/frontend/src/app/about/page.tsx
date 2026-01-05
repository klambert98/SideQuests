'use client';

import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ContentSection } from '@/components/ContentSection';
import Link from 'next/link';

// Note: Metadata must be exported from a server component or layout file
// This is a client component due to Navigation, so metadata should go in layout.tsx

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navigation />

      {/* About Section */}
      <ContentSection maxWidth="max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-12 items-start">
          {/* Profile Image Placeholder */}
          <div className="flex flex-col items-center md:items-start">
            <div className="w-64 h-64 md:w-full md:h-auto md:aspect-square rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 border-4 border-white dark:border-gray-800 shadow-xl flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-6xl mb-3">📸</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your selfie goes here</p>
              </div>
            </div>
          </div>

          {/* About Content */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
                About Me
              </h1>
              <div className="h-1 w-20 bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 rounded-full"></div>
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Hi! I&apos;m on a journey to document life&apos;s adventures, big and small. This site is my digital scrapbook—a place where I capture the moments, experiences, and side quests that make life colorful.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                Why I Built This
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                I wanted a space that goes beyond social media&apos;s highlight reels. This is where I can authentically share my experiences—from everyday moments to major milestones. It&apos;s a timeline of my life that I control, own, and can look back on years from now.
              </p>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                My Side Quest Goals
              </h2>
              <ul className="space-y-3 text-gray-700 dark:text-gray-300">
                <li className="flex items-start gap-3">
                  <span className="text-xl">🎯</span>
                  <span><strong>Document everything:</strong> From morning coffee thoughts to epic travel adventures, I want to capture it all in one beautiful, organized timeline.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🌍</span>
                  <span><strong>Complete my bucket list:</strong> Check out the <Link href="/bucket-list" className="text-indigo-600 dark:text-indigo-400 hover:underline">Bucket List</Link> page to see what I&apos;m working toward—and follow along as I tick items off.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">📸</span>
                  <span><strong>Build a visual legacy:</strong> Photos, videos, and stories that tell my unique story—organized chronologically and beautifully presented.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🚀</span>
                  <span><strong>Stay curious:</strong> Every day is an opportunity for a new side quest. Whether it&apos;s learning something new, trying a new hobby, or exploring a new place, I&apos;m here for it.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl">🎨</span>
                  <span><strong>Express creativity:</strong> This site itself is a creative project—constantly evolving with new features, designs, and ways to tell my story.</span>
                </li>
              </ul>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
                Join the Journey
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Thanks for stopping by! Feel free to explore the <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">timeline</Link> to see what I&apos;ve been up to, or check out my <Link href="/bucket-list" className="text-indigo-600 dark:text-indigo-400 hover:underline">bucket list</Link> to see what&apos;s next on the horizon.
              </p>
            </div>
          </div>
        </div>
      </ContentSection>

      <Footer />
    </div>
  );
}
