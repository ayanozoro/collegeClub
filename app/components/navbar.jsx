"use client";
import { useState } from "react";
import { Menu, X, User, Home, Users, Calendar, Plus, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignOutButton, SignInButton } from "@clerk/nextjs";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { isSignedIn, user } = useUser(); // Clerk user hook
  const pathname = usePathname();

  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Clubs", href: "/clubs", icon: Users },
    { name: "Events", href: "/events", icon: Calendar },
    { name: "Create", href: "/create", icon: Plus },
    { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  ];

  return (
    <nav className="fixed w-full top-0 z-50 bg-white/30 backdrop-blur-md shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          🎓 CollegeClubs
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 items-center">
          {navLinks.map((link) => (
            (link.name !== "Add Event" || isSignedIn) && (
              <Link
                key={link.name}
                href={link.href}
                className={pathname === link.href ? "bg-indigo-600 text-white font-medium transition-colors px-3 py-2 rounded flex items-center" : "text-gray-800 hover:text-indigo-600 font-medium transition-colors flex items-center"}
              >
                <link.icon size={20} className="mr-2" /> {link.name}
              </Link>
            )
          ))}

          {/* User Icon */}
          {isSignedIn ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="text-gray-800 hover:text-indigo-600 transition-colors"
              >
                <User size={24} />
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setShowDropdown(false)}>
                    Profile
                  </Link>
                  <SignOutButton>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setShowDropdown(false)}>
                      Logout
                    </button>
                  </SignOutButton>
                </div>
              )}
            </div>
          ) : (
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition" suppressHydrationWarning>
                Login
              </button>
            </SignInButton>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-gray-800"
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/80 backdrop-blur-md shadow-md">
          <div className="flex flex-col space-y-4 px-6 py-4">
            {navLinks.map((link) => (
              (link.name !== "Add Event" || isSignedIn) && (
                <Link
                  key={link.name}
                  href={link.href}
                  className={pathname === link.href ? "bg-indigo-600 text-white font-medium transition-colors px-3 py-2 rounded flex items-center" : "text-gray-800 hover:text-indigo-600 font-medium transition-colors flex items-center"}
                  onClick={() => setIsOpen(false)}
                >
                  <link.icon size={20} className="mr-2" /> {link.name}
                </Link>
              )
            ))}

            {/* User Options in Mobile */}
            {isSignedIn ? (
              <>
                <Link href="/profile" className="text-gray-800 hover:text-indigo-600 font-medium transition-colors" onClick={() => setIsOpen(false)}>
                  Profile
                </Link>
                <Link href="/registered-events" className="text-gray-800 hover:text-indigo-600 font-medium transition-colors" onClick={() => setIsOpen(false)}>
                  Registered Events
                </Link>
                <SignOutButton>
                  <button className="block w-full text-left text-gray-800 hover:text-indigo-600 font-medium transition-colors" onClick={() => setIsOpen(false)}>
                    Logout
                  </button>
                </SignOutButton>
              </>
            ) : (
              <SignInButton mode="modal">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-center"
                  suppressHydrationWarning
                >
                  Login
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
