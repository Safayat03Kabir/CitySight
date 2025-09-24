"use client";

import { useState, useEffect } from "react";
import MonitoringMapComponent from "../../component/MonitoringMapComponent";

export default function Monitoring() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedStation, setSelectedStation] = useState<any>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const monitoringStations: any[] = [
    // Removed hardcoded stations - stations should come from real data source
  ];


  const handleStationClick = (station: any) => {
    setSelectedStation(station);
    console.log('Selected station:', station);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-sky-50 p-6 relative overflow-hidden">
      {/* Enhanced Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating monitoring elements */}
        <div className="absolute top-20 left-16 text-6xl animate-float opacity-60">📊</div>
        <div className="absolute top-32 right-24 text-4xl animate-sway opacity-50">🌍</div>
        <div className="absolute bottom-40 left-20 text-5xl animate-wave opacity-55">📈</div>
        <div className="absolute top-60 left-1/3 text-3xl animate-twinkle opacity-45">🔍</div>
        <div className="absolute bottom-60 right-32 text-5xl animate-spiral opacity-50">📡</div>
        <div className="absolute top-96 right-1/4 text-4xl animate-zigzag opacity-40">⚡</div>
        <div className="absolute bottom-32 left-1/2 text-6xl animate-heartbeat opacity-35">💚</div>
        <div className="absolute top-40 left-3/4 text-3xl animate-float opacity-60">🌡️</div>
        <div className="absolute bottom-80 right-16 text-4xl animate-sway opacity-45">🌿</div>
        <div className="absolute top-80 left-8 text-5xl animate-wave opacity-50">💧</div>
        
        {/* Geometric shapes */}
        <div className="absolute top-24 right-40 w-16 h-16 bg-teal-200 rounded-lg transform rotate-45 animate-float opacity-30"></div>
        <div className="absolute bottom-48 left-32 w-20 h-20 bg-sky-200 rounded-full animate-sway opacity-25"></div>
        <div className="absolute top-56 right-8 w-12 h-12 bg-emerald-200 rounded-full animate-twinkle opacity-35"></div>
        <div className="absolute bottom-24 right-1/3 w-14 h-14 bg-cyan-200 transform rotate-12 animate-spiral opacity-30"></div>
        <div className="absolute top-72 left-1/4 w-18 h-18 bg-teal-300 rounded-lg animate-zigzag opacity-25"></div>
        
        {/* Wave patterns */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="w-full mx-auto relative z-10">
        {/* Monitoring Map */}
        <div className={`mb-8 transition-all duration-1000 delay-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <MonitoringMapComponent 
            stations={monitoringStations}
            onStationClick={handleStationClick}
            selectedStation={selectedStation}
          />
        </div>
      </div>
    </div>
  );
}
