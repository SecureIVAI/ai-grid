"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React from "react";

export default function Home() {
  const router = useRouter();
  const { data: session } = useSession();

  return (
    <div className="flex flex-col items-center justify-start pt-24 min-h-screen bg-gray-50 text-center p-4">
      <h1 className="text-5xl font-bold text-gray-900 mb-6">
        AI-GRID
      </h1>
      <p className="text-xl text-gray-700 max-w-2xl mb-8">
        AI-GRID helps organizations of all sizes achieve <strong>ISO 42001 compliance</strong>.  
        Our survey adapts to your responses, guiding you through a tailored compliance process.
      </p>
      {session ? (
      <button
        onClick={() => router.push("/survey/context")}
        className="px-8 py-3 text-lg font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        Start Survey
      </button>)
      :
      (<button
        onClick={() => router.push("/signin")}
        className="px-8 py-3 text-lg font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >Sign in to complete evaluation</button>)}
    </div>
  );
}