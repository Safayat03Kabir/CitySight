"use client";

import { useState, useEffect } from "react";
import EnvironmentalMetrics from "../../component/EnvironmentalMetrics";
import UrbanGrowthAnalysis from "../../component/UrbanGrowthAnalysis";
import ClimateRiskAssessment from "../../component/ClimateRiskAssessment";
import SatelliteDataViewer from "../../component/SatelliteDataViewer";

export default function Dashboard() {
  const [selectedCity, setSelectedCity] = useState("New York");
  const [timeRange, setTimeRange] = useState("1year");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia"];
  const timeRanges = [
    { value: "1month", label: "Last Month" },
    { value: "3months", label: "Last 3 Months" },
    { value: "1year", label: "Last Year" },
    { value: "5years", label: "Last 5 Years" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 p-6 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
        
        {/* Floating geometric shapes for dashboard */}
        <div className="absolute top-20 left-1/4 w-4 h-4 bg-emerald-400 rounded-full animate-bounce-gentle opacity-60"></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-cyan-400 rounded-full animate-spiral animation-delay-1000 opacity-60"></div>
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-purple-400 rounded-full animate-twinkle animation-delay-2000 opacity-60"></div>
        <div className="absolute bottom-20 right-1/3 w-5 h-5 bg-pink-400 rounded-full animate-heartbeat animation-delay-3000 opacity-60"></div>
        
        {/* Chart-like elements for dashboard theme */}
        <div className="absolute top-24 right-20 text-green-300 text-2xl animate-twinkle">📊</div>
        <div className="absolute top-40 left-32 text-blue-400 text-lg animate-twinkle animation-delay-1000">📈</div>
        <div className="absolute bottom-32 right-24 text-purple-300 text-xl animate-twinkle animation-delay-2000">💹</div>
        <div className="absolute bottom-16 left-16 text-emerald-400 text-lg animate-twinkle animation-delay-3000">🗂️</div>
        
        {/* Data visualization waves */}
        <div className="absolute top-32 right-16 w-8 h-32 bg-gradient-to-b from-emerald-400 to-green-500 rounded-full opacity-40 animate-wave animation-delay-1000 transform rotate-12"></div>
        <div className="absolute top-64 left-20 w-6 h-24 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full opacity-40 animate-zigzag animation-delay-2000 transform -rotate-12"></div>
        <div className="absolute bottom-40 right-32 w-10 h-28 bg-gradient-to-b from-purple-400 to-pink-500 rounded-full opacity-40 animate-sway animation-delay-3000 transform rotate-6"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className={`mb-8 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-3xl font-bold text-gray-800 mb-4 animate-fadeInUp">Urban Planning Dashboard</h1>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">City:</label>
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
              >
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Time Range:</label>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className={`grid grid-cols-1 gap-8 mb-8 transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="transform hover:scale-105 transition-all duration-300">
            <EnvironmentalMetrics city={selectedCity} timeRange={timeRange} />
          </div>
          <div className="transform hover:scale-105 transition-all duration-300">
            <UrbanGrowthAnalysis city={selectedCity} timeRange={timeRange} />
          </div>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 transition-all duration-1000 delay-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="transform hover:scale-105 transition-all duration-300">
            <ClimateRiskAssessment city={selectedCity} />
          </div>
          <div className="transform hover:scale-105 transition-all duration-300">
            <SatelliteDataViewer city={selectedCity} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`bg-white rounded-lg shadow-md p-6 transition-all duration-1000 delay-700 transform hover:shadow-xl ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              Generate Report
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              Export Data
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              Set Alerts
            </button>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
              Plan Scenario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
