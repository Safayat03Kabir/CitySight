"use client";

import { useState } from "react";

export default function Monitoring() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("realtime");

  const monitoringStations = [
    {
      id: 1,
      name: "Downtown Station",
      type: "Air Quality",
      status: "Online",
      lastUpdate: "2 min ago",
      coordinates: "40.7128, -74.0060",
      readings: {
        pm25: 15.2,
        pm10: 23.4,
        no2: 25.8,
        o3: 42.1
      }
    },
    {
      id: 2,
      name: "Central Park",
      type: "Environmental",
      status: "Online",
      lastUpdate: "1 min ago",
      coordinates: "40.7851, -73.9683",
      readings: {
        temperature: 24.5,
        humidity: 68,
        soilMoisture: 45.2,
        uv: 6.8
      }
    },
    {
      id: 3,
      name: "Industrial Zone",
      type: "Emissions",
      status: "Warning",
      lastUpdate: "5 min ago",
      coordinates: "40.6892, -74.0445",
      readings: {
        co2: 420.5,
        ch4: 1.95,
        no2: 68.3,
        so2: 12.4
      }
    }
  ];

  const alerts = [
    {
      id: 1,
      type: "High Priority",
      message: "Air quality deteriorating in Industrial Zone",
      timestamp: "10 minutes ago",
      status: "Active"
    },
    {
      id: 2,
      type: "Medium Priority",
      message: "Urban heat island effect detected in downtown",
      timestamp: "2 hours ago",
      status: "Investigating"
    },
    {
      id: 3,
      type: "Low Priority",
      message: "Vegetation stress in eastern districts",
      timestamp: "1 day ago",
      status: "Monitoring"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "online": return "bg-green-100 text-green-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      case "offline": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getAlertColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "high priority": return "border-l-red-500 bg-red-50";
      case "medium priority": return "border-l-yellow-500 bg-yellow-50";
      case "low priority": return "border-l-blue-500 bg-blue-50";
      default: return "border-l-gray-500 bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Environmental Monitoring</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Update Frequency:</span>
            <select 
              value={selectedTimeframe} 
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="realtime">Real-time</option>
              <option value="5min">Every 5 minutes</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
            </select>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Alerts</h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className={`border-l-4 p-4 rounded-r-lg ${getAlertColor(alert.type)}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800">{alert.type}</span>
                      <span className="text-xs px-2 py-1 bg-white rounded-full border">
                        {alert.status}
                      </span>
                    </div>
                    <p className="text-gray-700">{alert.message}</p>
                    <p className="text-sm text-gray-500 mt-1">{alert.timestamp}</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monitoring Stations */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Monitoring Stations</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {monitoringStations.map((station) => (
              <div key={station.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{station.name}</h3>
                    <p className="text-sm text-gray-600">{station.type}</p>
                    <p className="text-xs text-gray-500">{station.coordinates}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(station.status)}`}>
                    {station.status}
                  </span>
                </div>

                <div className="space-y-3">
                  {Object.entries(station.readings).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="font-medium text-gray-800">
                        {value} {getUnit(key)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">Last updated: {station.lastUpdate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Charts Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Real-time Trends</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Air Quality Index</h3>
              <div className="bg-gradient-to-r from-green-100 to-yellow-100 h-32 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800">78</div>
                  <div className="text-sm text-gray-600">Moderate</div>
                  <div className="text-xs text-green-600">↗️ Improving</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Temperature Monitoring</h3>
              <div className="bg-gradient-to-r from-blue-100 to-red-100 h-32 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800">24.5°C</div>
                  <div className="text-sm text-gray-600">Current Temp</div>
                  <div className="text-xs text-blue-600">➡️ Stable</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md transition-colors">
              Download Report
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md transition-colors">
              Set Alert Threshold
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md transition-colors">
              View Historical Data
            </button>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-md transition-colors">
              Configure Stations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getUnit(parameter: string): string {
  const units: { [key: string]: string } = {
    pm25: "µg/m³",
    pm10: "µg/m³",
    no2: "µg/m³",
    o3: "µg/m³",
    so2: "µg/m³",
    co2: "ppm",
    ch4: "ppm",
    temperature: "°C",
    humidity: "%",
    soilMoisture: "%",
    uv: "index"
  };
  return units[parameter] || "";
}
