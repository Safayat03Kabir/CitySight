"use client";
import React from 'react';

const CitySight3DLogo: React.FC = () => {
  return (
    <div className="relative group cursor-pointer">
      {/* Main 3D Text Container - Navbar optimized */}
      <div className="relative transform-gpu transition-all duration-500 ease-out group-hover:scale-105">
        {/* Subtle glow for navbar */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-300/20 via-teal-300/20 to-cyan-300/20 blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-500 rounded-lg"></div>
        
        {/* Modern navbar title */}
        <h1 className="relative text-2xl lg:text-3xl font-black tracking-wide text-white transform-gpu transition-all duration-500 ease-out group-hover:text-emerald-100"
            style={{
              fontFamily: '"Inter", "SF Pro Display", system-ui, sans-serif',
              fontWeight: '900',
              textShadow: `
                0 0 20px rgba(255, 255, 255, 0.3),
                0 0 40px rgba(16, 185, 129, 0.2),
                0 4px 8px rgba(0, 0, 0, 0.3),
                2px 2px 0px rgba(16, 185, 129, 0.4),
                4px 4px 0px rgba(6, 182, 212, 0.3)
              `,
              filter: 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.3))'
            }}>
          
          {/* "City" with modern float animation */}
          <span className="inline-block relative">
            <span className="inline-block transform transition-all duration-300 group-hover:translate-y-[-2px] group-hover:text-emerald-200 animate-subtle-float-1">C</span>
            <span className="inline-block transform transition-all duration-300 group-hover:translate-y-[-3px] group-hover:text-emerald-200 animate-subtle-float-2">i</span>
            <span className="inline-block transform transition-all duration-300 group-hover:translate-y-[-1px] group-hover:text-emerald-200 animate-subtle-float-3">t</span>
            <span className="inline-block transform transition-all duration-300 group-hover:translate-y-[-4px] group-hover:text-emerald-200 animate-subtle-float-4">y</span>
          </span>
          
          {/* "Sight" with gradient and wave */}
          <span className="inline-block ml-1 bg-gradient-to-r from-teal-800 via-cyan-800 to-blue-900 bg-clip-text text-transparent transform transition-all duration-500  origin-bottom-left">
            <span className="inline-block animate-gentle-wave-1 hover:animate-pulse">S</span>
            <span className="inline-block animate-gentle-wave-2 hover:animate-pulse">i</span>
            <span className="inline-block animate-gentle-wave-3 hover:animate-pulse">g</span>
            <span className="inline-block animate-gentle-wave-4 hover:animate-pulse">h</span>
            <span className="inline-block animate-gentle-wave-5 hover:animate-pulse">t</span>
          </span>
        </h1>
        
        {/* Modern underline animation */}
        <div className="absolute -bottom-1 left-0 w-full h-0.5 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-600 to-cyan-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-600 ease-out origin-left rounded-full"></div>
          <div className="absolute top-0 left-0 w-3 h-0.5 bg-white/60 rounded-full animate-slide-smooth opacity-70"></div>
        </div>
        
        {/* Minimal floating particles for navbar */}
        <div className="absolute inset-0 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute -top-1 left-8 w-1 h-1 bg-emerald-300 rounded-full animate-gentle-float opacity-80"></div>
          <div className="absolute -top-1 right-8 w-1 h-1 bg-cyan-300 rounded-full animate-gentle-float-delayed opacity-70"></div>
          <div className="absolute bottom-0 left-1/2 w-0.5 h-0.5 bg-teal-300 rounded-full animate-gentle-pulse opacity-60"></div>
        </div>
        
        {/* Subtle shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1200 ease-in-out"></div>
      </div>
      
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        
        @keyframes subtle-float-1 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-1px); }
        }
        
        @keyframes subtle-float-2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        
        @keyframes subtle-float-3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-0.5px); }
        }
        
        @keyframes subtle-float-4 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-1.5px); }
        }
        
        @keyframes gentle-wave-1 {
          0%, 100% { transform: translateY(0px); }
          25% { transform: translateY(-1px); }
        }
        
        @keyframes gentle-wave-2 {
          0%, 100% { transform: translateY(0px); }
          35% { transform: translateY(-1px); }
        }
        
        @keyframes gentle-wave-3 {
          0%, 100% { transform: translateY(0px); }
          45% { transform: translateY(-1px); }
        }
        
        @keyframes gentle-wave-4 {
          0%, 100% { transform: translateY(0px); }
          55% { transform: translateY(-1px); }
        }
        
        @keyframes gentle-wave-5 {
          0%, 100% { transform: translateY(0px); }
          65% { transform: translateY(-1px); }
        }
        
        @keyframes slide-smooth {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(500%); }
        }
        
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-2px) scale(1.1); }
        }
        
        @keyframes gentle-float-delayed {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-1px) scale(1.05); }
        }
        
        @keyframes gentle-pulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        .animate-subtle-float-1 { animation: subtle-float-1 4s ease-in-out infinite; }
        .animate-subtle-float-2 { animation: subtle-float-2 4s ease-in-out infinite 0.3s; }
        .animate-subtle-float-3 { animation: subtle-float-3 4s ease-in-out infinite 0.6s; }
        .animate-subtle-float-4 { animation: subtle-float-4 4s ease-in-out infinite 0.9s; }
        
        .animate-gentle-wave-1 { animation: gentle-wave-1 3s ease-in-out infinite; }
        .animate-gentle-wave-2 { animation: gentle-wave-2 3s ease-in-out infinite 0.2s; }
        .animate-gentle-wave-3 { animation: gentle-wave-3 3s ease-in-out infinite 0.4s; }
        .animate-gentle-wave-4 { animation: gentle-wave-4 3s ease-in-out infinite 0.6s; }
        .animate-gentle-wave-5 { animation: gentle-wave-5 3s ease-in-out infinite 0.8s; }
        
        .animate-slide-smooth { animation: slide-smooth 4s ease-in-out infinite; }
        .animate-gentle-float { animation: gentle-float 3s ease-in-out infinite; }
        .animate-gentle-float-delayed { animation: gentle-float-delayed 3s ease-in-out infinite 1s; }
        .animate-gentle-pulse { animation: gentle-pulse 2s ease-in-out infinite; }
        
        @media (max-width: 768px) {
          h1 {
            font-size: 1.25rem;
          }
        }
        
        @media (max-width: 640px) {
          h1 {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CitySight3DLogo;