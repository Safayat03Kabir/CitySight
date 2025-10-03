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
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50`}
      >
        {/* Navbar */}
        <Navbar />

        {/* Page content with seamless transition */}
        <main className="flex-1 relative">
          {children}
        </main>

        {/* Enhanced Footer with animated background */}
        <footer className="bg-gradient-to-r from-green-600 to-blue-600 w-full py-12 text-white mt-auto relative overflow-hidden">
          {/* Animated background elements matching the website style */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -left-10 w-48 h-48 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-full mix-blend-multiply filter blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-gradient-to-br from-blue-400/30 to-cyan-500/30 rounded-full mix-blend-multiply filter blur-2xl animate-pulse animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full mix-blend-multiply filter blur-2xl animate-pulse animation-delay-4000"></div>
            
            {/* Floating elements */}
            <div className="absolute top-8 left-1/4 w-3 h-3 bg-green-300/50 rounded-full animate-sway opacity-60"></div>
            <div className="absolute top-16 right-1/4 w-4 h-4 bg-blue-300/50 rounded-full animate-bounce-gentle animation-delay-1000 opacity-60"></div>
            <div className="absolute bottom-16 left-1/3 w-2 h-2 bg-emerald-300/50 rounded-full animate-float animation-delay-2000 opacity-60"></div>
            <div className="absolute bottom-8 right-1/3 w-3 h-3 bg-cyan-300/50 rounded-full animate-heartbeat animation-delay-3000 opacity-60"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 transform relative overflow-hidden">
                    {/* Earth and Satellite Logo */}
                    <svg width="32" height="32" viewBox="0 0 32 32" className="relative z-10">
                      {/* Earth base */}
                      <circle cx="16" cy="16" r="12" fill="url(#earthGradientFooter)" className="drop-shadow-sm"/>
                      
                      {/* Continents/land masses */}
                      <path d="M8 12 C10 10, 14 11, 16 13 C18 11, 22 12, 24 14 C23 18, 20 20, 18 19 C16 21, 12 20, 10 18 C8 16, 8 14, 8 12 Z" fill="#2d5016" opacity="0.7"/>
                      <path d="M6 20 C8 18, 12 19, 14 21 C16 19, 20 20, 22 22 C21 24, 18 25, 16 24 C14 25, 10 24, 8 22 C6 22, 6 21, 6 20 Z" fill="#2d5016" opacity="0.6"/>
                      <circle cx="12" cy="8" r="2" fill="#2d5016" opacity="0.5"/>
                      <circle cx="22" cy="10" r="1.5" fill="#2d5016" opacity="0.6"/>
                      
                      {/* Atmosphere glow */}
                      <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1"/>
                      
                      {/* Satellite */}
                      <g transform="translate(26, 6)">
                        <rect x="-1" y="-0.5" width="2" height="1" fill="#e5e7eb" rx="0.2"/>
                        <rect x="-2" y="-0.2" width="1" height="0.4" fill="#60a5fa"/>
                        <rect x="1" y="-0.2" width="1" height="0.4" fill="#60a5fa"/>
                      </g>
                      
                      {/* Satellite orbit path */}
                      <circle cx="16" cy="16" r="15" fill="none" stroke="rgba(96, 165, 250, 0.2)" strokeWidth="0.5" strokeDasharray="2,2" className="animate-spin" style={{animationDuration: '20s'}}/>
                      
                      {/* Data transmission lines */}
                      <path d="M26 6 Q20 10, 16 16" stroke="rgba(34, 197, 94, 0.4)" strokeWidth="0.8" fill="none" strokeDasharray="1,1" className="animate-pulse"/>
                      
                      {/* City buildings silhouette at bottom */}
                      <g transform="translate(6, 25)">
                        <rect x="0" y="0" width="2" height="3" fill="rgba(31, 41, 55, 0.6)" rx="0.2"/>
                        <rect x="3" y="-1" width="1.5" height="4" fill="rgba(31, 41, 55, 0.6)" rx="0.2"/>
                        <rect x="5" y="1" width="2" height="2" fill="rgba(31, 41, 55, 0.6)" rx="0.2"/>
                        <rect x="8" y="-0.5" width="1.5" height="3.5" fill="rgba(31, 41, 55, 0.6)" rx="0.2"/>
                        <rect x="10" y="0.5" width="2" height="2.5" fill="rgba(31, 41, 55, 0.6)" rx="0.2"/>
                        <rect x="13" y="-1" width="1.5" height="4" fill="rgba(31, 41, 55, 0.6)" rx="0.2"/>
                        <rect x="15" y="0" width="2" height="3" fill="rgba(31, 41, 55, 0.6)" rx="0.2"/>
                        <rect x="18" y="1" width="1.5" height="2" fill="rgba(31, 41, 55, 0.6)" rx="0.2"/>
                      </g>
                      
                      {/* Gradient definitions */}
                      <defs>
                        <radialGradient id="earthGradientFooter" cx="0.3" cy="0.3">
                          <stop offset="0%" stopColor="#22c55e"/>
                          <stop offset="40%" stopColor="#16a34a"/>
                          <stop offset="80%" stopColor="#15803d"/>
                          <stop offset="100%" stopColor="#166534"/>
                        </radialGradient>
                      </defs>
                    </svg>
                    
                    {/* Subtle background animation */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">
                    <span className="text-teal-200 hover:text-teal-100 transition-colors duration-300">City</span>
                    <span className="text-sky-200 hover:text-sky-100 transition-colors duration-300">Sight</span>
                  </h3>
                </div>
                <p className="text-sm opacity-90 leading-relaxed hover:opacity-100 transition-opacity duration-300">
                  Smart urban planning with NASA Earth observation data for sustainable city development.
                </p>
              </div>
              
              <div className="transform hover:scale-105 transition-all duration-300">
                <h4 className="font-semibold mb-6 text-lg text-green-200">Features</h4>
                <ul className="space-y-3 text-sm">
                  <li className="hover:text-green-200 hover:translate-x-2 transition-all duration-300 cursor-pointer flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                    Environmental Monitoring
                  </li>
                  <li className="hover:text-blue-200 hover:translate-x-2 transition-all duration-300 cursor-pointer flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                    Urban Growth Analysis
                  </li>
                  <li className="hover:text-emerald-200 hover:translate-x-2 transition-all duration-300 cursor-pointer flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-300 rounded-full"></span>
                    Climate Risk Assessment
                  </li>
                  <li className="hover:text-cyan-200 hover:translate-x-2 transition-all duration-300 cursor-pointer flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-300 rounded-full"></span>
                    Satellite Data Integration
                  </li>
                </ul>
              </div>

              <div className="transform hover:scale-105 transition-all duration-300">
                <h4 className="font-semibold mb-6 text-lg text-blue-200">Data Sources</h4>
                <ul className="space-y-3 text-sm">
                  <li className="hover:text-green-200 hover:translate-x-2 transition-all duration-300 cursor-pointer flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-300 rounded-full"></span>
                    NASA Earth Observation
                  </li>
                  <li className="hover:text-blue-200 hover:translate-x-2 transition-all duration-300 cursor-pointer flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-300 rounded-full"></span>
                    Satellite Imagery
                  </li>
                  <li className="hover:text-emerald-200 hover:translate-x-2 transition-all duration-300 cursor-pointer flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-300 rounded-full"></span>
                    Climate Data
                  </li>
                  <li className="hover:text-cyan-200 hover:translate-x-2 transition-all duration-300 cursor-pointer flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-300 rounded-full"></span>
                    Urban Analytics
                  </li>
                </ul>
              </div>

              <div className="transform hover:scale-105 transition-all duration-300">
                <h4 className="font-semibold mb-6 text-lg text-emerald-200">Connect</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 hover:translate-x-2 transition-all duration-300 cursor-pointer">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm">🌍</span>
                    </div>
                    <span className="text-sm hover:text-green-200 transition-colors duration-300">Global Impact</span>
                  </div>
                  <div className="flex items-center gap-3 hover:translate-x-2 transition-all duration-300 cursor-pointer">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm">🚀</span>
                    </div>
                    <span className="text-sm hover:text-blue-200 transition-colors duration-300">Innovation Hub</span>
                  </div>
                  <div className="flex items-center gap-3 hover:translate-x-2 transition-all duration-300 cursor-pointer">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm">🤝</span>
                    </div>
                    <span className="text-sm hover:text-emerald-200 transition-colors duration-300">Community</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-white/20 mt-12 pt-8 text-center">
              <div className="w-24 h-1 bg-gradient-to-r from-green-300 to-blue-300 mx-auto mb-6 rounded-full"></div>
              <p className="text-sm opacity-90 hover:opacity-100 transition-opacity duration-300">
                &copy; {new Date().getFullYear()} CitySight. All rights reserved. | Powered by NASA Earth Observation Data
              </p>
              <div className="flex justify-center gap-6 mt-4">
                <span className="text-green-300 text-lg animate-twinkle">⭐</span>
                <span className="text-blue-300 text-lg animate-twinkle animation-delay-1000">✨</span>
                <span className="text-emerald-300 text-lg animate-twinkle animation-delay-2000">🌟</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
