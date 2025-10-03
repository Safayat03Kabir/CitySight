"use client";
import Link from "next/link";
import CitySight3DLogo from "./CitySight3DLogo";

export default function Navbar() {
  return (
    <nav className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-2xl px-8 py-5 flex justify-between items-center backdrop-blur-sm border-b border-white/10 relative overflow-hidden">
      {/* Subtle animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 animate-pulse"></div>
      
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 transform relative overflow-hidden">
          {/* Earth and Satellite Logo */}
          <svg width="32" height="32" viewBox="0 0 32 32" className="relative z-10">
            {/* Earth base */}
            <circle cx="16" cy="16" r="12" fill="url(#earthGradient)" className="drop-shadow-sm"/>
            
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
              <radialGradient id="earthGradient" cx="0.3" cy="0.3">
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
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight drop-shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
          <span className="text-teal-300 hover:text-teal-200 transition-colors duration-300 drop-shadow-lg">City</span>
          <span className="text-sky-300 hover:text-sky-200 transition-colors duration-300 drop-shadow-lg">Sight</span>
        </h1>
         {/* <CitySight3DLogo /> */}
      </div>
      
      <ul className="flex gap-8 relative z-10">
        <li>
          <Link href="/" className="relative px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105 transform">
            <span className="relative z-10 text-lg font-medium hover:text-green-200 hover:text-xl transition-all duration-300">Home</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard" className="relative px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105 transform">
            <span className="relative z-10 text-lg font-medium hover:text-blue-200 hover:text-xl transition-all duration-300">Enviroment</span>
          </Link>
        </li>
        <li>
          <Link href="/monitoring" className="relative px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105 transform">
            <span className="relative z-10 text-lg font-medium hover:text-emerald-200 hover:text-xl transition-all duration-300">Infrastructure</span>
          </Link>
        </li>
        <li>
          <Link href="/planning" className="relative px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105 transform">
            <span className="relative z-10 text-lg font-medium hover:text-cyan-200 hover:text-xl transition-all duration-300">Planning</span>
          </Link>
        </li>
        <li>
          <Link href="/features" className="relative px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105 transform">
            <span className="relative z-10 text-lg font-medium hover:text-blue-200 hover:text-xl transition-all duration-300">About</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
