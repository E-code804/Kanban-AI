"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="flex items-center justify-between p-4 bg-gray-100">
      <span className="font-bold">My App</span>

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
