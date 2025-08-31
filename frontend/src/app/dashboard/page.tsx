"use client";

import { useState } from "react";
import EnvironmentalMetrics from "../../component/EnvironmentalMetrics";
import UrbanGrowthAnalysis from "../../component/UrbanGrowthAnalysis";
import ClimateRiskAssessment from "../../component/ClimateRiskAssessment";
import SatelliteDataViewer from "../../component/SatelliteDataViewer";

export default function Dashboard() {
  const [selectedCity, setSelectedCity] = useState("New York");
  const [timeRange, setTimeRange] = useState("1year");

  const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia"];
  const timeRanges = [
    { value: "1month", label: "Last Month" },
    { value: "3months", label: "Last 3 Months" },
    { value: "1year", label: "Last Year" },
    { value: "5years", label: "Last 5 Years" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Urban Planning Dashboard</h1>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">City:</label>
              <select 
                value={selectedCity} 
                onChange={(e) => setSelectedCity(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 gap-8 mb-8">
          <EnvironmentalMetrics city={selectedCity} timeRange={timeRange} />
          <UrbanGrowthAnalysis city={selectedCity} timeRange={timeRange} />
        </div>

        <div className="grid grid-cols-1 gap-8 mb-8">
          <ClimateRiskAssessment city={selectedCity} />
          <SatelliteDataViewer city={selectedCity} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors">
              Generate Report
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
              Export Data
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors">
              Set Alerts
            </button>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors">
              Plan Scenario
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
