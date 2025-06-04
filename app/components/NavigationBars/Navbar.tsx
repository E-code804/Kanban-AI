"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Navbar() {
  const { data: session } = useSession();

  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-100">
      <span className="font-bold text-black">My App</span>

      <button
        onClick={handleClick}
        className="flex flex-col justify-center items-center cursor-pointer"
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

      <Sidebar />

      {session ? (
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Sign Out
        </button>
      ) : (
        <Link href="/api/auth/signin" className="text-blue-600">
          Sign In
        </Link>
      )}
    </nav>
  );
}
