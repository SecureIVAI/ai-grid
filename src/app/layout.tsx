import Navbar from "../../components/navbar";
import SessionProviderWrapper from "../../components/SessionProviderWrapper";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI-GRID",
  description: "A system to certify safe usage of AI models",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <SessionProviderWrapper>
          <Navbar />
          <main className="pt-16 bg-gray-50 text-gray-900">{children}</main>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
