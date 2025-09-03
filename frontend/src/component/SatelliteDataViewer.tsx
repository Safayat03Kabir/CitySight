// "use client";

// import { useState } from "react";

// interface SatelliteDataViewerProps {
//   city: string;
// }

// export default function SatelliteDataViewer({ city }: SatelliteDataViewerProps) {
//   const [selectedLayer, setSelectedLayer] = useState("vegetation");
//   const [selectedDate, setSelectedDate] = useState("2024-08-15");

//   const dataLayers = [
//     { id: "vegetation", name: "Vegetation Index (NDVI)", color: "green" },
//     { id: "temperature", name: "Land Surface Temperature", color: "red" },
//     { id: "urbanChange", name: "Urban Change Detection", color: "blue" },
//     { id: "airQuality", name: "Air Quality (NO2)", color: "purple" },
//     { id: "water", name: "Water Bodies", color: "cyan" }
//   ];

//   const recentImagery = [
//     { date: "2024-08-15", satellite: "Landsat 9", quality: "High", cloud: "5%" },
//     { date: "2024-08-01", satellite: "Sentinel-2", quality: "Medium", cloud: "15%" },
//     { date: "2024-07-20", satellite: "MODIS", quality: "High", cloud: "8%" },
//     { date: "2024-07-05", satellite: "Landsat 8", quality: "Low", cloud: "45%" }
//   ];

//   const getQualityColor = (quality: string) => {
//     switch (quality.toLowerCase()) {
//       case "high": return "text-green-600 bg-green-100";
//       case "medium": return "text-yellow-600 bg-yellow-100";
//       case "low": return "text-red-600 bg-red-100";
//       default: return "text-gray-600 bg-gray-100";
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <h2 className="text-xl font-semibold text-gray-800 mb-6">Satellite Data Viewer - {city}</h2>
      
//       {/* Layer Selection */}
//       <div className="mb-6">
//         <h3 className="text-lg font-medium text-gray-700 mb-3">Data Layers</h3>
//         <div className="grid grid-cols-1 gap-2">
//           {dataLayers.map((layer) => (
//             <label key={layer.id} className="flex items-center cursor-pointer">
//               <input
//                 type="radio"
//                 name="layer"
//                 value={layer.id}
//                 checked={selectedLayer === layer.id}
//                 onChange={(e) => setSelectedLayer(e.target.value)}
//                 className="mr-3 text-blue-600"
//               />
//               <span className={`w-3 h-3 rounded mr-2 bg-${layer.color}-500`}></span>
//               <span className="text-sm text-gray-700">{layer.name}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       {/* Satellite Map Placeholder */}
//       <div className="mb-6">
//         <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
//           <div className="text-center">
//             <div className="text-4xl mb-2">🛰️</div>
//             <div className="text-gray-600 font-medium">Satellite Imagery View</div>
//             <div className="text-sm text-gray-500">Layer: {dataLayers.find(l => l.id === selectedLayer)?.name}</div>
//             <div className="text-sm text-gray-500">Date: {selectedDate}</div>
//           </div>
//         </div>
//       </div>

//       {/* Controls */}
//       <div className="mb-6">
//         <div className="flex flex-wrap gap-4 items-center">
//           <div className="flex items-center gap-2">
//             <label className="text-sm font-medium text-gray-700">Date:</label>
//             <input
//               type="date"
//               value={selectedDate}
//               onChange={(e) => setSelectedDate(e.target.value)}
//               className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
//             Download Data
//           </button>
//           <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
//             Export Image
//           </button>
//         </div>
//       </div>

//       {/* Recent Imagery */}
//       <div className="mb-6">
//         <h3 className="text-lg font-medium text-gray-700 mb-3">Recent Imagery</h3>
//         <div className="space-y-2">
//           {recentImagery.map((image, index) => (
//             <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer">
//               <div className="flex-1">
//                 <div className="flex items-center gap-3">
//                   <span className="font-medium text-gray-800">{image.date}</span>
//                   <span className="text-sm text-gray-600">{image.satellite}</span>
//                   <span className={`text-xs px-2 py-1 rounded-full ${getQualityColor(image.quality)}`}>
//                     {image.quality}
//                   </span>
//                 </div>
//                 <div className="text-xs text-gray-500 mt-1">Cloud cover: {image.cloud}</div>
//               </div>
//               <button 
//                 onClick={() => setSelectedDate(image.date)}
//                 className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//               >
//                 Load
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Data Analysis */}
//       <div className="p-4 bg-blue-50 rounded-lg">
//         <h4 className="text-sm font-medium text-blue-800 mb-2">Current Layer Analysis</h4>
//         <div className="text-sm text-blue-700">
//           {selectedLayer === "vegetation" && (
//             <div>
//               <p>• Vegetation health index: 0.72 (Good)</p>
//               <p>• Green space coverage: 18.5% of urban area</p>
//               <p>• Notable increase in park areas since last year</p>
//             </div>
//           )}
//           {selectedLayer === "temperature" && (
//             <div>
//               <p>• Average surface temperature: 28.5°C</p>
//               <p>• Heat island intensity: +3.2°C above rural areas</p>
//               <p>• Hotspots identified in commercial districts</p>
//             </div>
//           )}
//           {selectedLayer === "urbanChange" && (
//             <div>
//               <p>• Urban expansion: 2.3% increase in built area</p>
//               <p>• Major construction detected in north sector</p>
//               <p>• Conversion of 45 hectares of natural land</p>
//             </div>
//           )}
//           {selectedLayer === "airQuality" && (
//             <div>
//               <p>• NO2 levels: 25.8 µg/m³ (Moderate)</p>
//               <p>• Improvement of 12% from last month</p>
//               <p>• High concentrations near industrial zones</p>
//             </div>
//           )}
//           {selectedLayer === "water" && (
//             <div>
//               <p>• Water body coverage: 8.2% of total area</p>
//               <p>• River water quality: Good</p>
//               <p>• Wetland restoration progress: 65% complete</p>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect, useRef } from "react";
import { Chart as ChartJS, registerables } from "chart.js";

if (typeof window !== "undefined") {
  ChartJS.register(...registerables);
}

interface SatelliteDataViewerProps {
  city: string;
}

export default function SatelliteDataViewer({ city }: SatelliteDataViewerProps) {
  const [selectedLayer, setSelectedLayer] = useState("vegetation");
  const [selectedDate, setSelectedDate] = useState("2024-08-15");

  const chartRefs = {
    trendChart: useRef<HTMLCanvasElement | null>(null),
    distributionChart: useRef<HTMLCanvasElement | null>(null),
    coverageChart: useRef<HTMLCanvasElement | null>(null)
  };

  const chartInstances = useRef<{ [key: string]: ChartJS | undefined }>({});

  // Data definitions
  const dataLayers = [
    { id: "vegetation", name: "Vegetation Index (NDVI)", color: "emerald" },
    { id: "temperature", name: "Land Surface Temperature", color: "red" },
    { id: "urbanChange", name: "Urban Change Detection", color: "blue" },
    { id: "airQuality", name: "Air Quality (NO2)", color: "purple" },
    { id: "water", name: "Water Bodies", color: "cyan" }
  ];

  const layerData = {
    vegetation: {
      trend: [0.65, 0.68, 0.70, 0.71, 0.72, 0.72],
      distribution: [75, 65, 82, 78, 70],
      coverage: [45, 30, 15, 10]
    },
    temperature: {
      trend: [25.2, 26.1, 27.3, 28.0, 28.3, 28.5],
      distribution: [80, 85, 75, 82, 78],
      coverage: [35, 40, 15, 10]
    },
    urbanChange: {
      trend: [42, 45, 48, 50, 52, 55],
      distribution: [60, 75, 85, 70, 65],
      coverage: [50, 25, 15, 10]
    },
    airQuality: {
      trend: [32, 30, 28, 27, 26, 25.8],
      distribution: [70, 65, 75, 80, 72],
      coverage: [40, 35, 15, 10]
    },
    water: {
      trend: [8.0, 8.1, 8.2, 8.2, 8.2, 8.2],
      distribution: [85, 80, 75, 70, 82],
      coverage: [30, 45, 15, 10]
    }
  };

  const timeLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const regionLabels = ['North', 'South', 'East', 'West', 'Central'];
  const coverageLabels = ['Urban', 'Natural', 'Water', 'Other'];

  const recentImagery = [
    { date: "2024-08-15", satellite: "Landsat 9", quality: "High", cloud: "5%" },
    { date: "2024-08-01", satellite: "Sentinel-2", quality: "Medium", cloud: "15%" },
    { date: "2024-07-20", satellite: "MODIS", quality: "High", cloud: "8%" },
    { date: "2024-07-05", satellite: "Landsat 8", quality: "Low", cloud: "45%" }
  ];

  const getQualityColor = (quality: string) => {
    switch (quality.toLowerCase()) {
      case "high": return "text-emerald-600 bg-emerald-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "low": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  useEffect(() => {
    initializeCharts();
    return () => {
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) chart.destroy();
      });
      chartInstances.current = {};
    };
  }, [selectedLayer]);

  const initializeCharts = () => {
    if (chartRefs.trendChart.current) {
      const ctx = chartRefs.trendChart.current.getContext('2d');
      if (ctx) {
        if (chartInstances.current.trend) chartInstances.current.trend.destroy();
        chartInstances.current.trend = new ChartJS(ctx, {
          type: 'line',
          data: {
            labels: timeLabels,
            datasets: [{
              label: `${dataLayers.find(l => l.id === selectedLayer)?.name} Trend`,
              data: layerData[selectedLayer as keyof typeof layerData].trend,
              borderColor: `rgba(${selectedLayer === 'vegetation' ? '16, 185, 129' : 
                          selectedLayer === 'temperature' ? '239, 68, 68' : 
                          '99, 102, 241'}, 0.8)`,
              backgroundColor: `rgba(${selectedLayer === 'vegetation' ? '16, 185, 129' : 
                              selectedLayer === 'temperature' ? '239, 68, 68' : 
                              '99, 102, 241'}, 0.1)`,
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                position: 'bottom',
                align: 'center',
                labels: {
                  boxWidth: 15,
                  padding: 15,
                  font: {
                    size: 12
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: false,
                grid: {
                  drawBorder: false,
                  color: 'rgba(0,0,0,0.05)'
                },
                ticks: {
                  font: {
                    size: 11
                  }
                }
              },
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  font: {
                    size: 11
                  }
                }
              }
            }
          }
        });
      }
    }

    if (chartRefs.distributionChart.current) {
      const ctx = chartRefs.distributionChart.current.getContext('2d');
      if (ctx) {
        if (chartInstances.current.distribution) chartInstances.current.distribution.destroy();
        chartInstances.current.distribution = new ChartJS(ctx, {
          type: 'radar',
          data: {
            labels: regionLabels,
            datasets: [{
              label: 'Regional Distribution',
              data: layerData[selectedLayer as keyof typeof layerData].distribution,
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              borderColor: 'rgba(99, 102, 241, 0.8)',
              pointBackgroundColor: 'rgba(99, 102, 241, 1)',
              pointHoverBackgroundColor: '#fff',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              r: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  stepSize: 20,
                  backdropPadding: 5,
                  font: {
                    size: 11
                  }
                },
                grid: {
                  color: 'rgba(0,0,0,0.05)'
                },
                pointLabels: {
                  font: {
                    size: 11
                  }
                }
              }
            }
          }
        });
      }
    }

    if (chartRefs.coverageChart.current) {
      const ctx = chartRefs.coverageChart.current.getContext('2d');
      if (ctx) {
        if (chartInstances.current.coverage) chartInstances.current.coverage.destroy();
        chartInstances.current.coverage = new ChartJS(ctx, {
          type: 'doughnut',
          data: {
            labels: coverageLabels,
            datasets: [{
              data: layerData[selectedLayer as keyof typeof layerData].coverage,
              backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(99, 102, 241, 0.8)',
                'rgba(107, 114, 128, 0.8)'
              ],
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
              legend: {
                position: 'bottom',
                align: 'center',
                labels: {
                  boxWidth: 12,
                  padding: 15,
                  font: {
                    size: 11
                  }
                }
              }
            },
            cutout: '70%'
          }
        });
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-2xl p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Satellite Analytics
          </h2>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            {city} • Real-time Analysis
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="px-4 py-1.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 rounded-full text-sm font-medium border border-blue-200/50">
            🛰️ Live Feed
          </span>
          <span className="px-4 py-1.5 bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200/50">
            📅 {selectedDate}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Layer Selection */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Data Layers
            </h3>
            <div className="space-y-2">
              {dataLayers.map((layer) => (
                <label 
                  key={layer.id} 
                  className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200
                    ${selectedLayer === layer.id 
                      ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200/50' 
                      : 'hover:bg-gray-50/50'}`}
                >
                  <input
                    type="radio"
                    name="layer"
                    value={layer.id}
                    checked={selectedLayer === layer.id}
                    onChange={(e) => setSelectedLayer(e.target.value)}
                    className="mr-3 text-blue-600"
                  />
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full bg-${layer.color}-500`}></span>
                    <span className="text-sm text-gray-700 font-medium">{layer.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Controls
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date Selection</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white/50"
                />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 flex items-center justify-center gap-2">
                  <span>📥</span> Download Data
                </button>
                <button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-200 flex items-center justify-center gap-2">
                  <span>📊</span> Generate Report
                </button>
              </div>
            </div>
          </div>

          {/* Recent Imagery */}
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Recent Captures
            </h3>
            <div className="space-y-3">
              {recentImagery.map((image, index) => (
                <div 
                  key={index}
                  onClick={() => setSelectedDate(image.date)}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-200/50 hover:bg-white/50 cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg">📸</div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{image.date}</div>
                      <div className="text-xs text-gray-500">{image.satellite}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getQualityColor(image.quality)}`}>
                      {image.quality}
                    </span>
                    <span className="text-xs text-gray-500">{image.cloud}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main View Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Satellite View */}
          <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-cyan-900 rounded-2xl p-1">
            <div className="aspect-video relative overflow-hidden rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10"></div>
              <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm">
                <div className="text-center text-white">
                  <div className="text-5xl mb-4 animate-pulse">🛰️</div>
                  <div className="font-bold text-xl mb-1">Satellite View</div>
                  <div className="text-sm text-blue-200">
                    {dataLayers.find(l => l.id === selectedLayer)?.name}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2 bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Temporal Analysis
              </h3>
              <div className="flex items-center justify-center">
                <div className="w-full max-w-4xl h-[280px] px-4">
                  <canvas ref={chartRefs.trendChart}></canvas>
                </div>
              </div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Regional Distribution
              </h3>
              <div className="flex items-center justify-center">
                <div className="w-full max-w-xs h-[200px] px-4">
                  <canvas ref={chartRefs.distributionChart}></canvas>
                </div>
              </div>
            </div>
            <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Coverage Analysis
              </h3>
              <div className="flex items-center justify-center">
                <div className="w-full max-w-xs h-[200px] px-4">
                  <canvas ref={chartRefs.coverageChart}></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-2xl p-6 border border-blue-200/50">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-semibold text-blue-900 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            Analysis Results
          </h4>
          <span className="px-3 py-1 bg-blue-500/10 text-blue-700 rounded-full text-xs font-medium border border-blue-200/50 animate-pulse">
            Live Updates
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {selectedLayer === "vegetation" && (
            <>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-emerald-100/50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌳</span>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Vegetation Health</div>
                    <div className="text-lg font-bold text-emerald-600">0.72</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-emerald-100/50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🌿</span>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Green Coverage</div>
                    <div className="text-lg font-bold text-emerald-600">18.5%</div>
                  </div>
                </div>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-emerald-100/50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📈</span>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Growth Rate</div>
                    <div className="text-lg font-bold text-emerald-600">+2.3%</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Chart as ChartJS, registerables } from "chart.js";

// // Register Chart.js components
// if (typeof window !== "undefined") {
//   ChartJS.register(...registerables);
// }

// interface SatelliteDataViewerProps {
//   city: string;
// }

// export default function SatelliteDataViewer({ city }: SatelliteDataViewerProps) {
//   const [selectedLayer, setSelectedLayer] = useState("vegetation");
//   const [selectedDate, setSelectedDate] = useState("2024-08-15");

//   const chartRefs = {
//     trendChart: useRef<HTMLCanvasElement | null>(null),
//     distributionChart: useRef<HTMLCanvasElement | null>(null),
//     qualityChart: useRef<HTMLCanvasElement | null>(null),
//     coverageChart: useRef<HTMLCanvasElement | null>(null)
//   };

//   const chartInstances = useRef<{ [key: string]: ChartJS | undefined }>({});

//   const dataLayers = [
//     { id: "vegetation", name: "Vegetation Index (NDVI)", color: "green" },
//     { id: "temperature", name: "Land Surface Temperature", color: "red" },
//     { id: "urbanChange", name: "Urban Change Detection", color: "blue" },
//     { id: "airQuality", name: "Air Quality (NO2)", color: "purple" },
//     { id: "water", name: "Water Bodies", color: "cyan" }
//   ];

//   const recentImagery = [
//     { date: "2024-08-15", satellite: "Landsat 9", quality: "High", cloud: "5%" },
//     { date: "2024-08-01", satellite: "Sentinel-2", quality: "Medium", cloud: "15%" },
//     { date: "2024-07-20", satellite: "MODIS", quality: "High", cloud: "8%" },
//     { date: "2024-07-05", satellite: "Landsat 8", quality: "Low", cloud: "45%" }
//   ];

//   // Historical data for charts
//   const layerData = {
//     vegetation: {
//       trend: [0.65, 0.68, 0.70, 0.71, 0.72, 0.72],
//       distribution: [75, 65, 82, 78, 70],
//       coverage: [45, 30, 15, 10]
//     },
//     temperature: {
//       trend: [25.2, 26.1, 27.3, 28.0, 28.3, 28.5],
//       distribution: [80, 85, 75, 82, 78],
//       coverage: [35, 40, 15, 10]
//     },
//     urbanChange: {
//       trend: [42, 45, 48, 50, 52, 55],
//       distribution: [60, 75, 85, 70, 65],
//       coverage: [50, 25, 15, 10]
//     },
//     airQuality: {
//       trend: [32, 30, 28, 27, 26, 25.8],
//       distribution: [70, 65, 75, 80, 72],
//       coverage: [40, 35, 15, 10]
//     },
//     water: {
//       trend: [8.0, 8.1, 8.2, 8.2, 8.2, 8.2],
//       distribution: [85, 80, 75, 70, 82],
//       coverage: [30, 45, 15, 10]
//     }
//   };

//   const timeLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
//   const regionLabels = ['North', 'South', 'East', 'West', 'Central'];
//   const coverageLabels = ['Urban', 'Natural', 'Water', 'Other'];

//   const getQualityColor = (quality: string) => {
//     switch (quality.toLowerCase()) {
//       case "high": return "text-green-600 bg-green-100";
//       case "medium": return "text-yellow-600 bg-yellow-100";
//       case "low": return "text-red-600 bg-red-100";
//       default: return "text-gray-600 bg-gray-100";
//     }
//   };

//   useEffect(() => {
//     initializeCharts();
//     return () => {
//       Object.values(chartInstances.current).forEach(chart => {
//         if (chart) chart.destroy();
//       });
//       chartInstances.current = {};
//     };
//   }, [selectedLayer]);

//   const initializeCharts = () => {
//     // Trend Chart
//     if (chartRefs.trendChart.current) {
//       const ctx = chartRefs.trendChart.current.getContext('2d');
//       if (ctx) {
//         if (chartInstances.current.trend) chartInstances.current.trend.destroy();
//         chartInstances.current.trend = new ChartJS(ctx, {
//           type: 'line',
//           data: {
//             labels: timeLabels,
//             datasets: [{
//               label: `${dataLayers.find(l => l.id === selectedLayer)?.name} Trend`,
//               data: layerData[selectedLayer as keyof typeof layerData].trend,
//               borderColor: `rgba(${selectedLayer === 'vegetation' ? '16, 185, 129' : 
//                           selectedLayer === 'temperature' ? '239, 68, 68' : 
//                           '99, 102, 241'}, 0.8)`,
//               backgroundColor: `rgba(${selectedLayer === 'vegetation' ? '16, 185, 129' : 
//                               selectedLayer === 'temperature' ? '239, 68, 68' : 
//                               '99, 102, 241'}, 0.1)`,
//               tension: 0.4,
//               fill: true
//             }]
//           },
//           options: {
//             responsive: true,
//             plugins: { legend: { position: 'bottom' } },
//             scales: { y: { beginAtZero: false } }
//           }
//         });
//       }
//     }

//     // Distribution Chart
//     if (chartRefs.distributionChart.current) {
//       const ctx = chartRefs.distributionChart.current.getContext('2d');
//       if (ctx) {
//         if (chartInstances.current.distribution) chartInstances.current.distribution.destroy();
//         chartInstances.current.distribution = new ChartJS(ctx, {
//           type: 'radar',
//           data: {
//             labels: regionLabels,
//             datasets: [{
//               label: 'Regional Distribution',
//               data: layerData[selectedLayer as keyof typeof layerData].distribution,
//               backgroundColor: 'rgba(147, 51, 234, 0.2)',
//               borderColor: 'rgba(147, 51, 234, 0.8)',
//               pointBackgroundColor: 'rgba(147, 51, 234, 1)'
//             }]
//           },
//           options: {
//             responsive: true,
//             scales: {
//               r: { beginAtZero: true, max: 100 }
//             }
//           }
//         });
//       }
//     }

//     // Coverage Chart
//     if (chartRefs.coverageChart.current) {
//       const ctx = chartRefs.coverageChart.current.getContext('2d');
//       if (ctx) {
//         if (chartInstances.current.coverage) chartInstances.current.coverage.destroy();
//         chartInstances.current.coverage = new ChartJS(ctx, {
//           type: 'doughnut',
//           data: {
//             labels: coverageLabels,
//             datasets: [{
//               data: layerData[selectedLayer as keyof typeof layerData].coverage,
//               backgroundColor: [
//                 'rgba(59, 130, 246, 0.8)',
//                 'rgba(16, 185, 129, 0.8)',
//                 'rgba(147, 51, 234, 0.8)',
//                 'rgba(107, 114, 128, 0.8)'
//               ],
//               borderWidth: 2,
//               borderColor: '#ffffff'
//             }]
//           },
//           options: {
//             responsive: true,
//             plugins: {
//               legend: { position: 'bottom' }
//             },
//             cutout: '65%'
//           }
//         });
//       }
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <h2 className="text-xl font-semibold text-gray-800">Satellite Data Viewer - {city}</h2>
//         <div className="flex gap-2">
//           <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Live Feed</span>
//           <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
//             {selectedDate}
//           </span>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left Sidebar */}
//         <div className="space-y-6">
//           {/* Layer Selection */}
//           <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
//             <h3 className="text-sm font-medium text-gray-700 mb-4">Data Layers</h3>
//             <div className="space-y-2">
//               {dataLayers.map((layer) => (
//                 <label 
//                   key={layer.id} 
//                   className="flex items-center p-2 rounded-lg cursor-pointer hover:bg-gray-50"
//                 >
//                   <input
//                     type="radio"
//                     name="layer"
//                     value={layer.id}
//                     checked={selectedLayer === layer.id}
//                     onChange={(e) => setSelectedLayer(e.target.value)}
//                     className="mr-3 text-blue-600"
//                   />
//                   <span className={`w-3 h-3 rounded mr-2 bg-${layer.color}-500`}></span>
//                   <span className="text-sm text-gray-700">{layer.name}</span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* Controls */}
//           <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
//             <h3 className="text-sm font-medium text-gray-700 mb-4">Controls</h3>
//             <div className="space-y-4">
//               <div className="flex items-center gap-2">
//                 <label className="text-sm font-medium text-gray-700">Date:</label>
//                 <input
//                   type="date"
//                   value={selectedDate}
//                   onChange={(e) => setSelectedDate(e.target.value)}
//                   className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//               <div className="grid grid-cols-2 gap-2">
//                 <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
//                   Download Data
//                 </button>
//                 <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
//                   Export Image
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Satellite View */}
//           <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-xl p-6 text-white">
//             <div className="aspect-video relative overflow-hidden rounded-lg">
//               <div className="absolute inset-0 bg-gradient-to-br from-green-100/10 to-blue-100/10"></div>
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <div className="text-center">
//                   <div className="text-4xl mb-2">🛰️</div>
//                   <div className="font-medium">Satellite Imagery View</div>
//                   <div className="text-sm opacity-80">
//                     {dataLayers.find(l => l.id === selectedLayer)?.name}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Charts Grid */}
//           <div className="grid grid-cols-2 gap-6">
//             <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
//               <h3 className="text-sm font-medium text-gray-700 mb-4">Temporal Analysis</h3>
//               <div className="h-48">
//                 <canvas ref={chartRefs.trendChart}></canvas>
//               </div>
//             </div>
//             <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
//               <h3 className="text-sm font-medium text-gray-700 mb-4">Regional Distribution</h3>
//               <div className="h-48">
//                 <canvas ref={chartRefs.distributionChart}></canvas>
//               </div>
//             </div>
//             <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
//               <h3 className="text-sm font-medium text-gray-700 mb-4">Coverage Analysis</h3>
//               <div className="h-48">
//                 <canvas ref={chartRefs.coverageChart}></canvas>
//               </div>
//             </div>
//             <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
//               <h3 className="text-sm font-medium text-gray-700 mb-4">Recent Imagery</h3>
//               <div className="space-y-2 h-48 overflow-auto">
//                 {recentImagery.map((image, index) => (
//                   <div 
//                     key={index}
//                     className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
//                     onClick={() => setSelectedDate(image.date)}
//                   >
//                     <div className="flex items-center gap-2">
//                       <div className="text-lg">📸</div>
//                       <div>
//                         <div className="text-sm font-medium text-gray-800">{image.date}</div>
//                         <div className="text-xs text-gray-600">{image.satellite}</div>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span className={`text-xs px-2 py-1 rounded-full ${getQualityColor(image.quality)}`}>
//                         {image.quality}
//                       </span>
//                       <span className="text-xs text-gray-500">
//                         {image.cloud}
//                       </span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Analysis Panel */}
//       <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
//         <div className="flex items-center justify-between mb-4">
//           <h4 className="text-sm font-medium text-blue-800">Analysis Results</h4>
//           <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
//             Auto-updated
//           </span>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {selectedLayer === "vegetation" && (
//             <>
//               <div className="bg-white/50 rounded-lg p-3 border border-blue-200">
//                 <div className="flex items-center gap-2">
//                   <span className="text-xl">🌳</span>
//                   <span className="text-sm text-blue-800">
//                     Vegetation health index: 0.72 (Good)
//                   </span>
//                 </div>
//               </div>
//               <div className="bg-white/50 rounded-lg p-3 border border-blue-200">
//                 <div className="flex items-center gap-2">
//                   <span className="text-xl">🌿</span>
//                   <span className="text-sm text-blue-800">
//                     Green space coverage: 18.5%
//                   </span>
//                 </div>
//               </div>
//               <div className="bg-white/50 rounded-lg p-3 border border-blue-200">
//                 <div className="flex items-center gap-2">
//                   <span className="text-xl">📈</span>
//                   <span className="text-sm text-blue-800">
//                     Notable increase in park areas
//                   </span>
//                 </div>
//               </div>
//             </>
//           )}
//           {/* Similar blocks for other layers... */}
//         </div>
//       </div>
//     </div>
//   );
// }

// "use client";

// import { useState, useEffect, useRef } from "react";
// import { Chart as ChartJS, registerables } from "chart.js";

// // Register Chart.js components
// if (typeof window !== "undefined") {
//   ChartJS.register(...registerables);
// }

// interface SatelliteDataViewerProps {
//   city: string;
// }

// export default function SatelliteDataViewer({ city }: SatelliteDataViewerProps) {
//   const [selectedLayer, setSelectedLayer] = useState("vegetation");
//   const [selectedDate, setSelectedDate] = useState("2024-08-15");

//   const chartRefs = {
//     trendChart: useRef<HTMLCanvasElement | null>(null),
//     distributionChart: useRef<HTMLCanvasElement | null>(null),
//     coverageChart: useRef<HTMLCanvasElement | null>(null)
//   };

//   const chartInstances = useRef<{ [key: string]: ChartJS | undefined }>({});

//   // Data definitions
//   const dataLayers = [
//     { id: "vegetation", name: "Vegetation Index (NDVI)", color: "emerald" },
//     { id: "temperature", name: "Land Surface Temperature", color: "red" },
//     { id: "urbanChange", name: "Urban Change Detection", color: "blue" },
//     { id: "airQuality", name: "Air Quality (NO2)", color: "purple" },
//     { id: "water", name: "Water Bodies", color: "cyan" }
//   ];

//   const layerData = {
//     vegetation: {
//       trend: [0.65, 0.68, 0.70, 0.71, 0.72, 0.72],
//       distribution: [75, 65, 82, 78, 70],
//       coverage: [45, 30, 15, 10]
//     },
//     temperature: {
//       trend: [25.2, 26.1, 27.3, 28.0, 28.3, 28.5],
//       distribution: [80, 85, 75, 82, 78],
//       coverage: [35, 40, 15, 10]
//     },
//     urbanChange: {
//       trend: [42, 45, 48, 50, 52, 55],
//       distribution: [60, 75, 85, 70, 65],
//       coverage: [50, 25, 15, 10]
//     },
//     airQuality: {
//       trend: [32, 30, 28, 27, 26, 25.8],
//       distribution: [70, 65, 75, 80, 72],
//       coverage: [40, 35, 15, 10]
//     },
//     water: {
//       trend: [8.0, 8.1, 8.2, 8.2, 8.2, 8.2],
//       distribution: [85, 80, 75, 70, 82],
//       coverage: [30, 45, 15, 10]
//     }
//   };

//   const timeLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
//   const regionLabels = ['North', 'South', 'East', 'West', 'Central'];
//   const coverageLabels = ['Urban', 'Natural', 'Water', 'Other'];

//   useEffect(() => {
//     initializeCharts();
//     return () => {
//       Object.values(chartInstances.current).forEach(chart => {
//         if (chart) chart.destroy();
//       });
//       chartInstances.current = {};
//     };
//   }, [selectedLayer]);

//   const initializeCharts = () => {
//     if (chartRefs.trendChart.current) {
//       const ctx = chartRefs.trendChart.current.getContext('2d');
//       if (ctx) {
//         if (chartInstances.current.trend) chartInstances.current.trend.destroy();
//         chartInstances.current.trend = new ChartJS(ctx, {
//           type: 'line',
//           data: {
//             labels: timeLabels,
//             datasets: [{
//               label: `${dataLayers.find(l => l.id === selectedLayer)?.name} Trend`,
//               data: layerData[selectedLayer as keyof typeof layerData].trend,
//               borderColor: `rgba(${selectedLayer === 'vegetation' ? '16, 185, 129' : 
//                           selectedLayer === 'temperature' ? '239, 68, 68' : 
//                           '99, 102, 241'}, 0.8)`,
//               backgroundColor: `rgba(${selectedLayer === 'vegetation' ? '16, 185, 129' : 
//                               selectedLayer === 'temperature' ? '239, 68, 68' : 
//                               '99, 102, 241'}, 0.1)`,
//               tension: 0.4,
//               fill: true
//             }]
//           },
//           options: {
//             responsive: true,
//             maintainAspectRatio: true,
//             plugins: {
//               legend: {
//                 position: 'bottom',
//                 align: 'center',
//                 labels: {
//                   padding: 20,
//                   usePointStyle: true
//                 }
//               }
//             },
//             scales: {
//               y: {
//                 beginAtZero: false,
//                 grid: {
//                   drawBorder: false,
//                   color: 'rgba(0,0,0,0.05)'
//                 }
//               },
//               x: {
//                 grid: {
//                   display: false
//                 }
//               }
//             }
//           }
//         });
//       }
//     }

//     if (chartRefs.distributionChart.current) {
//       const ctx = chartRefs.distributionChart.current.getContext('2d');
//       if (ctx) {
//         if (chartInstances.current.distribution) chartInstances.current.distribution.destroy();
//         chartInstances.current.distribution = new ChartJS(ctx, {
//           type: 'radar',
//           data: {
//             labels: regionLabels,
//             datasets: [{
//               label: 'Regional Distribution',
//               data: layerData[selectedLayer as keyof typeof layerData].distribution,
//               backgroundColor: 'rgba(99, 102, 241, 0.2)',
//               borderColor: 'rgba(99, 102, 241, 0.8)',
//               pointBackgroundColor: 'rgba(99, 102, 241, 1)',
//               pointHoverBackgroundColor: '#fff'
//             }]
//           },
//           options: {
//             responsive: true,
//             maintainAspectRatio: true,
//             plugins: {
//               legend: {
//                 position: 'bottom',
//                 align: 'center',
//                 labels: {
//                   padding: 20,
//                   usePointStyle: true
//                 }
//               }
//             },
//             scales: {
//               r: {
//                 beginAtZero: true,
//                 max: 100,
//                 ticks: {
//                   stepSize: 20,
//                   backdropPadding: 5
//                 },
//                 grid: {
//                   color: 'rgba(0,0,0,0.05)'
//                 }
//               }
//             }
//           }
//         });
//       }
//     }

//     if (chartRefs.coverageChart.current) {
//       const ctx = chartRefs.coverageChart.current.getContext('2d');
//       if (ctx) {
//         if (chartInstances.current.coverage) chartInstances.current.coverage.destroy();
//         chartInstances.current.coverage = new ChartJS(ctx, {
//           type: 'doughnut',
//           data: {
//             labels: coverageLabels,
//             datasets: [{
//               data: layerData[selectedLayer as keyof typeof layerData].coverage,
//               backgroundColor: [
//                 'rgba(59, 130, 246, 0.8)',
//                 'rgba(16, 185, 129, 0.8)',
//                 'rgba(99, 102, 241, 0.8)',
//                 'rgba(107, 114, 128, 0.8)'
//               ],
//               borderWidth: 2,
//               borderColor: '#ffffff'
//             }]
//           },
//           options: {
//             responsive: true,
//             maintainAspectRatio: true,
//             plugins: {
//               legend: {
//                 position: 'bottom',
//                 align: 'center',
//                 labels: {
//                   padding: 20,
//                   usePointStyle: true
//                 }
//               }
//             },
//             cutout: '65%',
//             layout: {
//               padding: {
//                 top: 20,
//                 bottom: 20
//               }
//             }
//           }
//         });
//       }
//     }
//   };

//   return (
//     <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-2xl p-8">
//       {/* Header Section */}
//       <div className="mb-8">
//         <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
//           Satellite Analytics • {city}
//         </h2>
//         <div className="flex gap-3 mt-2">
//           <span className="px-4 py-1.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 rounded-full text-sm font-medium">
//             🛰️ Live Feed
//           </span>
//           <span className="px-4 py-1.5 bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-700 rounded-full text-sm font-medium">
//             📅 {selectedDate}
//           </span>
//         </div>
//       </div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//         {/* Left Sidebar */}
//         <div className="lg:col-span-1">
//           {/* Layer Selection */}
//           <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50 mb-6">
//             <h3 className="text-sm font-semibold text-gray-700 mb-4">Data Layers</h3>
//             <div className="space-y-2">
//               {dataLayers.map((layer) => (
//                 <label 
//                   key={layer.id} 
//                   className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200
//                     ${selectedLayer === layer.id 
//                       ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-200/50' 
//                       : 'hover:bg-gray-50/50'}`}
//                 >
//                   <input
//                     type="radio"
//                     name="layer"
//                     value={layer.id}
//                     checked={selectedLayer === layer.id}
//                     onChange={(e) => setSelectedLayer(e.target.value)}
//                     className="mr-3 text-blue-600"
//                   />
//                   <span className="text-sm text-gray-700">{layer.name}</span>
//                 </label>
//               ))}
//             </div>
//           </div>

//           {/* Date Selection */}
//           <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50">
//             <h3 className="text-sm font-semibold text-gray-700 mb-4">Time Controls</h3>
//             <div className="space-y-4">
//               <input
//                 type="date"
//                 value={selectedDate}
//                 onChange={(e) => setSelectedDate(e.target.value)}
//                 className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
//               />
//               <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200">
//                 Update View
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Main Charts Area */}
//         <div className="lg:col-span-3 space-y-6">
//           {/* Trend Chart */}
//           <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50">
//             <h3 className="text-sm font-semibold text-gray-700 mb-4">Temporal Analysis</h3>
//             <div className="flex items-center justify-center h-64">
//               <div className="w-full max-w-3xl">
//                 <canvas ref={chartRefs.trendChart}></canvas>
//               </div>
//             </div>
//           </div>

//           {/* Distribution and Coverage Charts */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50">
//               <h3 className="text-sm font-semibold text-gray-700 mb-4">Regional Distribution</h3>
//               <div className="flex items-center justify-center h-48">
//                 <div className="w-full max-w-xs">
//                   <canvas ref={chartRefs.distributionChart}></canvas>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50">
//               <h3 className="text-sm font-semibold text-gray-700 mb-4">Coverage Analysis</h3>
//               <div className="flex items-center justify-center h-48">
//                 <div className="w-full max-w-xs">
//                   <canvas ref={chartRefs.coverageChart}></canvas>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }