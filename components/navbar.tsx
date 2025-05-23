"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/" className="flex items-center gap-5">
              <Image
                src="/logo.png"
                alt="AI-GRID logo"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                AI-GRID
              </span>
            </Link>
          </div>

          <div className="flex items-center">
            {session ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  {session.user?.name}
                </span>
                <button
                  onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/signin"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
