"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import Sidebar from "./Sidebar/Sidebar";

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Fixed Navbar at top */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-white shadow-md border-b border-gray-200">
        {/* Left side - Hamburger menu */}
        <button
          onClick={handleClick}
          className="flex flex-col justify-center items-center cursor-pointer p-2 hover:bg-gray-100 rounded-md transition-colors duration-200"
          aria-label="Toggle menu"
        >
          <span
            className={`hamburger ${
              isOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"
            }`}
          ></span>
          <span
            className={`hamburger my-0.5 ${isOpen ? "opacity-0" : "opacity-100"}`}
          ></span>
          <span
            className={`hamburger ${
              isOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"
            }`}
          ></span>
        </button>

        {/* Center - Logo */}
        <div className="flex items-center">
          <div className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg mr-2">
            <div className="w-4 h-4 bg-white rounded-sm flex items-center justify-center">
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-sm"></div>
            </div>
          </div>
          <span className="font-bold text-gray-900 text-lg">Kanban AI</span>
        </div>

        {/* Right side - Auth */}
        {session ? (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="cursor-pointer bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm"
          >
            Sign Out
          </button>
        ) : (
          <Link
            href="/api/auth/signin"
            className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-sm"
          >
            Sign In
          </Link>
        )}
      </nav>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-40 transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sliding Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onClose={closeSidebar} />
      </div>

      {/* Spacer to push content below fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}
