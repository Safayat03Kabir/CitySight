// "use client";

// interface EnvironmentalMetricsProps {
//   city: string;
//   timeRange: string;
// }

// export default function EnvironmentalMetrics({ city, timeRange }: EnvironmentalMetricsProps) {
//   // Mock data - in real implementation, this would come from NASA APIs
//   const mockData = {
//     airQuality: {
//       value: 85,
//       status: "Good",
//       trend: "improving",
//       change: "+5%"
//     },
//     vegetation: {
//       value: 72,
//       status: "Healthy",
//       trend: "stable",
//       change: "+2%"
//     },
//     heatIsland: {
//       value: 3.2,
//       status: "Moderate",
//       trend: "worsening",
//       change: "+0.8°C"
//     },
//     carbonEmissions: {
//       value: 45.6,
//       status: "High",
//       trend: "improving",
//       change: "-8%"
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status.toLowerCase()) {
//       case "good":
//       case "healthy": return "text-green-600 bg-green-100";
//       case "moderate": return "text-yellow-600 bg-yellow-100";
//       case "high":
//       case "poor": return "text-red-600 bg-red-100";
//       default: return "text-gray-600 bg-gray-100";
//     }
//   };

//   const getTrendIcon = (trend: string) => {
//     switch (trend) {
//       case "improving": return "📈";
//       case "worsening": return "📉";
//       case "stable": return "➡️";
//       default: return "📊";
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <h2 className="text-xl font-semibold text-gray-800 mb-6">Environmental Metrics - {city}</h2>
      
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//         {/* Air Quality */}
//         <div className="border border-gray-200 rounded-lg p-4">
//           <div className="flex justify-between items-start mb-2">
//             <h3 className="text-sm font-medium text-gray-600">Air Quality Index</h3>
//             <span className="text-xl">{getTrendIcon(mockData.airQuality.trend)}</span>
//           </div>
//           <div className="flex items-end justify-between">
//             <div>
//               <div className="text-2xl font-bold text-gray-800">{mockData.airQuality.value}</div>
//               <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(mockData.airQuality.status)}`}>
//                 {mockData.airQuality.status}
//               </span>
//             </div>
//             <div className="text-right">
//               <div className="text-sm text-green-600 font-medium">{mockData.airQuality.change}</div>
//               <div className="text-xs text-gray-500">vs last period</div>
//             </div>
//           </div>
//         </div>

//         {/* Vegetation Health */}
//         <div className="border border-gray-200 rounded-lg p-4">
//           <div className="flex justify-between items-start mb-2">
//             <h3 className="text-sm font-medium text-gray-600">Vegetation Health</h3>
//             <span className="text-xl">{getTrendIcon(mockData.vegetation.trend)}</span>
//           </div>
//           <div className="flex items-end justify-between">
//             <div>
//               <div className="text-2xl font-bold text-gray-800">{mockData.vegetation.value}%</div>
//               <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(mockData.vegetation.status)}`}>
//                 {mockData.vegetation.status}
//               </span>
//             </div>
//             <div className="text-right">
//               <div className="text-sm text-green-600 font-medium">{mockData.vegetation.change}</div>
//               <div className="text-xs text-gray-500">vs last period</div>
//             </div>
//           </div>
//         </div>

//         {/* Urban Heat Island */}
//         <div className="border border-gray-200 rounded-lg p-4">
//           <div className="flex justify-between items-start mb-2">
//             <h3 className="text-sm font-medium text-gray-600">Heat Island Effect</h3>
//             <span className="text-xl">{getTrendIcon(mockData.heatIsland.trend)}</span>
//           </div>
//           <div className="flex items-end justify-between">
//             <div>
//               <div className="text-2xl font-bold text-gray-800">{mockData.heatIsland.value}°C</div>
//               <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(mockData.heatIsland.status)}`}>
//                 {mockData.heatIsland.status}
//               </span>
//             </div>
//             <div className="text-right">
//               <div className="text-sm text-red-600 font-medium">{mockData.heatIsland.change}</div>
//               <div className="text-xs text-gray-500">vs last period</div>
//             </div>
//           </div>
//         </div>

//         {/* Carbon Emissions */}
//         <div className="border border-gray-200 rounded-lg p-4">
//           <div className="flex justify-between items-start mb-2">
//             <h3 className="text-sm font-medium text-gray-600">CO₂ Emissions</h3>
//             <span className="text-xl">{getTrendIcon(mockData.carbonEmissions.trend)}</span>
//           </div>
//           <div className="flex items-end justify-between">
//             <div>
//               <div className="text-2xl font-bold text-gray-800">{mockData.carbonEmissions.value}kt</div>
//               <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(mockData.carbonEmissions.status)}`}>
//                 {mockData.carbonEmissions.status}
//               </span>
//             </div>
//             <div className="text-right">
//               <div className="text-sm text-green-600 font-medium">{mockData.carbonEmissions.change}</div>
//               <div className="text-xs text-gray-500">vs last period</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="mt-6 p-4 bg-blue-50 rounded-lg">
//         <h4 className="text-sm font-medium text-blue-800 mb-2">Key Insights</h4>
//         <ul className="text-sm text-blue-700 space-y-1">
//           <li>• Air quality has improved due to reduced industrial emissions</li>
//           <li>• Urban vegetation coverage is stable with new park developments</li>
//           <li>• Heat island effect requires attention in downtown areas</li>
//         </ul>
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useRef } from "react";
import { Chart as ChartJS, registerables } from "chart.js";

// Register Chart.js components
if (typeof window !== "undefined") {
  ChartJS.register(...registerables);
}

interface EnvironmentalMetricsProps {
  city: string;
  timeRange: string;
}

export default function EnvironmentalMetrics({ city, timeRange }: EnvironmentalMetricsProps) {
  const chartRefs = {
    airQuality: useRef<HTMLCanvasElement | null>(null),
    trends: useRef<HTMLCanvasElement | null>(null),
    emissionsChart: useRef<HTMLCanvasElement | null>(null),
    vegetationChart: useRef<HTMLCanvasElement | null>(null)
  };

  // Store chart instances for proper cleanup
  const chartInstances = useRef<{ [key: string]: any }>({
    airQuality: null,
    trends: null,
    emissionsChart: null,
    vegetationChart: null
  });

  // Mock data
  const mockData = {
    airQuality: {
      value: 85,
      status: "Good",
      trend: "improving",
      change: "+5%"
    },
    vegetation: {
      value: 72,
      status: "Healthy",
      trend: "stable",
      change: "+2%"
    },
    heatIsland: {
      value: 3.2,
      status: "Moderate",
      trend: "worsening",
      change: "+0.8°C"
    },
    carbonEmissions: {
      value: 45.6,
      status: "High",
      trend: "improving",
      change: "-8%"
    }
  };

  // Historical data for trends
  const trendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    airQuality: [65, 70, 78, 82, 75, 68],
    temperature: [28, 27, 29, 31, 32, 30],
    vegetation: [70, 71, 72, 72, 73, 72],
    emissions: [50, 48, 47, 46, 45, 45.6]
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "good":
      case "healthy": return "text-green-600 bg-green-100";
      case "moderate": return "text-yellow-600 bg-yellow-100";
      case "high":
      case "poor": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving": return "📈";
      case "worsening": return "📉";
      case "stable": return "➡️";
      default: return "📊";
    }
  };

  useEffect(() => {
    initializeCharts();
    return () => {
      // Cleanup chart instances properly
      Object.values(chartInstances.current).forEach(chartInstance => {
        if (chartInstance) {
          chartInstance.destroy();
        }
      });
      // Reset all instances to null
      Object.keys(chartInstances.current).forEach(key => {
        chartInstances.current[key] = null;
      });
    };
  }, [city, timeRange]);

  const initializeCharts = () => {
    // Destroy existing charts before creating new ones
    Object.values(chartInstances.current).forEach(chartInstance => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    });

    // Air Quality Gauge Chart
    if (chartRefs.airQuality.current) {
      const ctx = chartRefs.airQuality.current.getContext('2d');
      if (ctx) {
        chartInstances.current.airQuality = new ChartJS(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Air Quality', 'Remaining'],
            datasets: [{
              data: [mockData.airQuality.value, 100 - mockData.airQuality.value],
              backgroundColor: [
                'rgba(16, 185, 129, 0.8)',
                'rgba(229, 231, 235, 0.5)'
              ],
              borderWidth: 0,
              circumference: 180,
              rotation: 270
            }]
          },
          options: {
            responsive: true,
            cutout: '75%',
            plugins: {
              legend: { display: false }
            }
          }
        });
      }
    }

    // Environmental Trends Chart
    if (chartRefs.trends.current) {
      const ctx = chartRefs.trends.current.getContext('2d');
      if (ctx) {
        chartInstances.current.trends = new ChartJS(ctx, {
          type: 'line',
          data: {
            labels: trendData.labels,
            datasets: [
              {
                label: 'Air Quality',
                data: trendData.airQuality,
                borderColor: '#10B981',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(16, 185, 129, 0.1)'
              },
              {
                label: 'Temperature',
                data: trendData.temperature,
                borderColor: '#F59E0B',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(245, 158, 11, 0.1)'
              }
            ]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom'
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0,0,0,0.1)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            }
          }
        });
      }
    }

    // Emissions Bar Chart
    if (chartRefs.emissionsChart.current) {
      const ctx = chartRefs.emissionsChart.current.getContext('2d');
      if (ctx) {
        chartInstances.current.emissionsChart = new ChartJS(ctx, {
          type: 'bar',
          data: {
            labels: trendData.labels,
            datasets: [{
              label: 'CO₂ Emissions (kt)',
              data: trendData.emissions,
              backgroundColor: 'rgba(139, 92, 246, 0.8)',
              borderRadius: 4
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom'
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        });
      }
    }

    // Vegetation Health Chart
    if (chartRefs.vegetationChart.current) {
      const ctx = chartRefs.vegetationChart.current.getContext('2d');
      if (ctx) {
        chartInstances.current.vegetationChart = new ChartJS(ctx, {
          type: 'radar',
          data: {
            labels: ['Coverage', 'Density', 'Health', 'Growth', 'Diversity'],
            datasets: [{
              label: 'Current Period',
              data: [72, 68, 75, 70, 65],
              fill: true,
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              borderColor: 'rgba(16, 185, 129, 0.8)',
              pointBackgroundColor: 'rgba(16, 185, 129, 1)'
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom'
              }
            },
            scales: {
              r: {
                beginAtZero: true,
                max: 100
              }
            }
          }
        });
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          Environmental Metrics - {city}
        </h2>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            Live Data
          </span>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {timeRange}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric Cards */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-gray-600">Air Quality Index</h3>
            <span className="text-xl">{getTrendIcon(mockData.airQuality.trend)}</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-800">{mockData.airQuality.value}</div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(mockData.airQuality.status)}`}>
                {mockData.airQuality.status}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600 font-medium">{mockData.airQuality.change}</div>
              <div className="text-xs text-gray-500">vs last period</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-gray-600">Vegetation Health</h3>
            <span className="text-xl">{getTrendIcon(mockData.vegetation.trend)}</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-800">{mockData.vegetation.value}%</div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(mockData.vegetation.status)}`}>
                {mockData.vegetation.status}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600 font-medium">{mockData.vegetation.change}</div>
              <div className="text-xs text-gray-500">vs last period</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-100">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-gray-600">Heat Island Effect</h3>
            <span className="text-xl">{getTrendIcon(mockData.heatIsland.trend)}</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-800">{mockData.heatIsland.value}°C</div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(mockData.heatIsland.status)}`}>
                {mockData.heatIsland.status}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-red-600 font-medium">{mockData.heatIsland.change}</div>
              <div className="text-xs text-gray-500">vs last period</div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-gray-600">CO₂ Emissions</h3>
            <span className="text-xl">{getTrendIcon(mockData.carbonEmissions.trend)}</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-800">{mockData.carbonEmissions.value}kt</div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(mockData.carbonEmissions.status)}`}>
                {mockData.carbonEmissions.status}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600 font-medium">{mockData.carbonEmissions.change}</div>
              <div className="text-xs text-gray-500">vs last period</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts Section */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Air Quality Trends</h3>
          <div className="h-64 flex items-center justify-center">
            <canvas ref={chartRefs.trends}></canvas>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Emissions Analysis</h3>
          <div className="h-64 flex items-center justify-center">
            <canvas ref={chartRefs.emissionsChart}></canvas>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Current Air Quality</h3>
          <div className="h-64 flex items-center justify-center">
            <canvas ref={chartRefs.airQuality}></canvas>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Vegetation Analysis</h3>
          <div className="h-64 flex items-center justify-center">
            <canvas ref={chartRefs.vegetationChart}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}

// "use client";

// import { useEffect, useRef } from "react";
// import { Chart as ChartJS, registerables } from "chart.js";

// // Register Chart.js components
// if (typeof window !== "undefined") {
//   ChartJS.register(...registerables);
// }

// interface EnvironmentalMetricsProps {
//   city: string;
//   timeRange: string;
// }

// export default function EnvironmentalMetrics({ city, timeRange }: EnvironmentalMetricsProps) {
//   const chartRefs = {
//     airQuality: useRef<HTMLCanvasElement | null>(null),
//     trends: useRef<HTMLCanvasElement | null>(null),
//     emissionsChart: useRef<HTMLCanvasElement | null>(null),
//     vegetationChart: useRef<HTMLCanvasElement | null>(null)
//   };

//   // ✅ Store chart instances here
//   const chartInstances = useRef<Record<string, ChartJS | null>>({
//     airQuality: null,
//     trends: null,
//     emissionsChart: null,
//     vegetationChart: null,
//   });

//   // Mock data
//   const mockData = {
//     airQuality: {
//       value: 85,
//       status: "Good",
//       trend: "improving",
//       change: "+5%"
//     },
//     vegetation: {
//       value: 72,
//       status: "Healthy",
//       trend: "stable",
//       change: "+2%"
//     },
//     heatIsland: {
//       value: 3.2,
//       status: "Moderate",
//       trend: "worsening",
//       change: "+0.8°C"
//     },
//     carbonEmissions: {
//       value: 45.6,
//       status: "High",
//       trend: "improving",
//       change: "-8%"
//     }
//   };

//   // Historical data for trends
//   const trendData = {
//     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
//     airQuality: [65, 70, 78, 82, 75, 68],
//     temperature: [28, 27, 29, 31, 32, 30],
//     vegetation: [70, 71, 72, 72, 73, 72],
//     emissions: [50, 48, 47, 46, 45, 45.6]
//   };

//   const getStatusColor = (status: string) => {
//     switch (status.toLowerCase()) {
//       case "good":
//       case "healthy": return "text-green-600 bg-green-100";
//       case "moderate": return "text-yellow-600 bg-yellow-100";
//       case "high":
//       case "poor": return "text-red-600 bg-red-100";
//       default: return "text-gray-600 bg-gray-100";
//     }
//   };

//   const getTrendIcon = (trend: string) => {
//     switch (trend) {
//       case "improving": return "📈";
//       case "worsening": return "📉";
//       case "stable": return "➡️";
//       default: return "📊";
//     }
//   };

//   useEffect(() => {
//     initializeCharts();
//     return () => {
//       // ✅ Proper cleanup
//       Object.values(chartInstances.current).forEach(chart => {
//         chart?.destroy();
//       });
//     };
//   }, [city, timeRange]);

//   const initializeCharts = () => {
//     // Air Quality Gauge Chart
//     if (chartRefs.airQuality.current) {
//       const ctx = chartRefs.airQuality.current.getContext("2d");
//       if (ctx) {
//         chartInstances.current.airQuality?.destroy(); // destroy old one
//         chartInstances.current.airQuality = new ChartJS(ctx, {
//           type: "doughnut",
//           data: {
//             labels: ["Air Quality", "Remaining"],
//             datasets: [
//               {
//                 data: [mockData.airQuality.value, 100 - mockData.airQuality.value],
//                 backgroundColor: [
//                   "rgba(16, 185, 129, 0.8)",
//                   "rgba(229, 231, 235, 0.5)",
//                 ],
//                 borderWidth: 0,
//                 circumference: 180,
//                 rotation: 270,
//               },
//             ],
//           },
//           options: {
//             responsive: true,
//             cutout: "75%",
//             plugins: { legend: { display: false } },
//           },
//         });
//       }
//     }

//     // Environmental Trends Chart
//     if (chartRefs.trends.current) {
//       const ctx = chartRefs.trends.current.getContext("2d");
//       if (ctx) {
//         chartInstances.current.trends?.destroy();
//         chartInstances.current.trends = new ChartJS(ctx, {
//           type: "line",
//           data: {
//             labels: trendData.labels,
//             datasets: [
//               {
//                 label: "Air Quality",
//                 data: trendData.airQuality,
//                 borderColor: "#10B981",
//                 tension: 0.4,
//                 fill: true,
//                 backgroundColor: "rgba(16, 185, 129, 0.1)",
//               },
//               {
//                 label: "Temperature",
//                 data: trendData.temperature,
//                 borderColor: "#F59E0B",
//                 tension: 0.4,
//                 fill: true,
//                 backgroundColor: "rgba(245, 158, 11, 0.1)",
//               },
//             ],
//           },
//           options: {
//             responsive: true,
//             plugins: { legend: { position: "bottom" } },
//             scales: {
//               y: {
//                 beginAtZero: true,
//                 grid: { color: "rgba(0,0,0,0.1)" },
//               },
//               x: { grid: { display: false } },
//             },
//           },
//         });
//       }
//     }

//     // Emissions Bar Chart
//     if (chartRefs.emissionsChart.current) {
//       const ctx = chartRefs.emissionsChart.current.getContext("2d");
//       if (ctx) {
//         chartInstances.current.emissionsChart?.destroy();
//         chartInstances.current.emissionsChart = new ChartJS(ctx, {
//           type: "bar",
//           data: {
//             labels: trendData.labels,
//             datasets: [
//               {
//                 label: "CO₂ Emissions (kt)",
//                 data: trendData.emissions,
//                 backgroundColor: "rgba(139, 92, 246, 0.8)",
//                 borderRadius: 4,
//               },
//             ],
//           },
//           options: {
//             responsive: true,
//             plugins: { legend: { position: "bottom" } },
//             scales: { y: { beginAtZero: true } },
//           },
//         });
//       }
//     }

//     // Vegetation Health Radar Chart
//     if (chartRefs.vegetationChart.current) {
//       const ctx = chartRefs.vegetationChart.current.getContext("2d");
//       if (ctx) {
//         chartInstances.current.vegetationChart?.destroy();
//         chartInstances.current.vegetationChart = new ChartJS(ctx, {
//           type: "radar",
//           data: {
//             labels: ["Coverage", "Density", "Health", "Growth", "Diversity"],
//             datasets: [
//               {
//                 label: "Current Period",
//                 data: [72, 68, 75, 70, 65],
//                 fill: true,
//                 backgroundColor: "rgba(16, 185, 129, 0.2)",
//                 borderColor: "rgba(16, 185, 129, 0.8)",
//                 pointBackgroundColor: "rgba(16, 185, 129, 1)",
//               },
//             ],
//           },
//           options: {
//             responsive: true,
//             plugins: { legend: { position: "bottom" } },
//             scales: { r: { beginAtZero: true, max: 100 } },
//           },
//         });
//       }
//     }
//   };



// }
