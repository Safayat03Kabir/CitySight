"use client";

import { useState } from "react";

interface SatelliteDataViewerProps {
  city: string;
}

export default function SatelliteDataViewer({ city }: SatelliteDataViewerProps) {
  const [selectedLayer, setSelectedLayer] = useState("vegetation");
  const [selectedDate, setSelectedDate] = useState("2024-08-15");

  const dataLayers = [
    { id: "vegetation", name: "Vegetation Index (NDVI)", color: "green" },
    { id: "temperature", name: "Land Surface Temperature", color: "red" },
    { id: "urbanChange", name: "Urban Change Detection", color: "blue" },
    { id: "airQuality", name: "Air Quality (NO2)", color: "purple" },
    { id: "water", name: "Water Bodies", color: "cyan" }
  ];

  const recentImagery = [
    { date: "2024-08-15", satellite: "Landsat 9", quality: "High", cloud: "5%" },
    { date: "2024-08-01", satellite: "Sentinel-2", quality: "Medium", cloud: "15%" },
    { date: "2024-07-20", satellite: "MODIS", quality: "High", cloud: "8%" },
    { date: "2024-07-05", satellite: "Landsat 8", quality: "Low", cloud: "45%" }
  ];

  const getQualityColor = (quality: string) => {
    switch (quality.toLowerCase()) {
      case "high": return "text-green-600 bg-green-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Satellite Data Viewer - {city}</h2>
      
      {/* Layer Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Data Layers</h3>
        <div className="grid grid-cols-1 gap-2">
          {dataLayers.map((layer) => (
            <label key={layer.id} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="layer"
                value={layer.id}
                checked={selectedLayer === layer.id}
                onChange={(e) => setSelectedLayer(e.target.value)}
                className="mr-3 text-blue-600"
              />
              <span className={`w-3 h-3 rounded mr-2 bg-${layer.color}-500`}></span>
              <span className="text-sm text-gray-700">{layer.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Satellite Map Placeholder */}
      <div className="mb-6">
        <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
          <div className="text-center">
            <div className="text-4xl mb-2">🛰️</div>
            <div className="text-gray-600 font-medium">Satellite Imagery View</div>
            <div className="text-sm text-gray-500">Layer: {dataLayers.find(l => l.id === selectedLayer)?.name}</div>
            <div className="text-sm text-gray-500">Date: {selectedDate}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
            Download Data
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
            Export Image
          </button>
        </div>
      </div>

      {/* Recent Imagery */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Recent Imagery</h3>
        <div className="space-y-2">
          {recentImagery.map((image, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-800">{image.date}</span>
                  <span className="text-sm text-gray-600">{image.satellite}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getQualityColor(image.quality)}`}>
                    {image.quality}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">Cloud cover: {image.cloud}</div>
              </div>
              <button 
                onClick={() => setSelectedDate(image.date)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Load
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Analysis */}
      <div className="p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Current Layer Analysis</h4>
        <div className="text-sm text-blue-700">
          {selectedLayer === "vegetation" && (
            <div>
              <p>• Vegetation health index: 0.72 (Good)</p>
              <p>• Green space coverage: 18.5% of urban area</p>
              <p>• Notable increase in park areas since last year</p>
            </div>
          )}
          {selectedLayer === "temperature" && (
            <div>
              <p>• Average surface temperature: 28.5°C</p>
              <p>• Heat island intensity: +3.2°C above rural areas</p>
              <p>• Hotspots identified in commercial districts</p>
            </div>
          )}
          {selectedLayer === "urbanChange" && (
            <div>
              <p>• Urban expansion: 2.3% increase in built area</p>
              <p>• Major construction detected in north sector</p>
              <p>• Conversion of 45 hectares of natural land</p>
            </div>
          )}
          {selectedLayer === "airQuality" && (
            <div>
              <p>• NO2 levels: 25.8 µg/m³ (Moderate)</p>
              <p>• Improvement of 12% from last month</p>
              <p>• High concentrations near industrial zones</p>
            </div>
          )}
          {selectedLayer === "water" && (
            <div>
              <p>• Water body coverage: 8.2% of total area</p>
              <p>• River water quality: Good</p>
              <p>• Wetland restoration progress: 65% complete</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
