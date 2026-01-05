'use client';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-black text-white py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Branding */}
          <div>
            <h3 className="text-lg font-bold mb-2">📷 Side Quests</h3>
            <p className="text-gray-400 text-sm">Documenting life&apos;s adventures, one day at a time.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="/" className="hover:text-indigo-400 transition">
                  Timeline
                </a>
              </li>
              <li>
                <a href="/about" className="hover:text-indigo-400 transition">
                  About
                </a>
              </li>
              <li>
                <a href="/bucket-list" className="hover:text-indigo-400 transition">
                  Bucket List
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#" className="hover:text-indigo-400 transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400 transition">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} My Side Quests. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
