import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import NotistackProvider from "./components/NotistackProvider";

// Import AG Grid module registration
import "../lib/ag-grid-modules";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PropNet",
  description: "Property Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NotistackProvider>
          <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
              <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <h1 className="text-4xl font-serif text-gray-900">PropNet</h1>
                  </div>
                  <div className="flex items-center space-x-4">

                  </div>
                </div>
              </div>
            </header>

            <div className="flex">
              {/* Sidebar */}
              <Sidebar />

              {/* Main content */}
              <main className="flex-1 p-6">
                {children}
              </main>
            </div>
          </div>
        </NotistackProvider>
      </body>
    </html>
  );
}
