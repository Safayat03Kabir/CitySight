import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from '../component/Navbar'; 
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CitySight - Smart Urban Planning with NASA Earth Data",
  description: "Harness NASA Earth observation data to develop sustainable city growth strategies that protect our environment while enhancing quality of life for urban communities.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        {/* Navbar */}
        <Navbar />

        {/* Page content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-green-600 to-blue-600 w-full py-8 text-white mt-auto">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">CS</span>
                  </div>
                  <h3 className="text-lg font-bold">CitySight</h3>
                </div>
                <p className="text-sm opacity-90">
                  Smart urban planning with NASA Earth observation data for sustainable city development.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Features</h4>
                <ul className="space-y-2 text-sm opacity-90">
                  <li>Environmental Monitoring</li>
                  <li>Urban Growth Analysis</li>
                  <li>Climate Risk Assessment</li>
                  <li>Satellite Data Integration</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-sm opacity-90">
                  <li>Documentation</li>
                  <li>API Reference</li>
                  <li>Case Studies</li>
                  <li>Support</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Contact</h4>
                <ul className="space-y-2 text-sm opacity-90">
                  <li>sales@citysight.com</li>
                  <li>support@citysight.com</li>
                  <li>+1 (555) 123-4567</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/20 mt-8 pt-6 text-center text-sm opacity-90">
              &copy; {new Date().getFullYear()} CitySight. All rights reserved. | Powered by NASA Earth Observation Data
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
