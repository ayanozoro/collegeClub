import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and Description */}
          <div>
            <h3 className="text-2xl font-bold text-indigo-400 mb-4">🎓 CollegeClubs</h3>
            <p className="text-gray-300">
              Discover and join exciting college clubs and events. Connect with like-minded students and make the most of your college experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-indigo-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/clubs" className="text-gray-300 hover:text-indigo-400 transition">
                  Clubs
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-300 hover:text-indigo-400 transition">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-300 hover:text-indigo-400 transition">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <p className="text-gray-300 mb-2">Email: info@collegeclubs.com</p>
            <p className="text-gray-300 mb-2">Phone: (123) 456-7890</p>
            <p className="text-gray-300">Address: 123 College Ave, City, State 12345</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            &copy; {new Date().getFullYear()} CollegeClubs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
