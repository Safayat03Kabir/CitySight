// "use client";

// interface UrbanGrowthAnalysisProps {
//   city: string;
//   timeRange: string;
// }

// export default function UrbanGrowthAnalysis({ city, timeRange }: UrbanGrowthAnalysisProps) {
//   // Mock data - in real implementation, this would come from NASA satellite imagery analysis
//   const mockData = {
//     urbanExpansion: {
//       totalArea: 1245.7,
//       growth: 3.8,
//       developedLand: 78.2,
//       greenSpaces: 21.8
//     },
//     populationDensity: {
//       current: 8456,
//       change: 2.3,
//       projection: 9200
//     },
//     infrastructure: {
//       roadNetwork: 92.4,
//       publicTransit: 68.7,
//       utilities: 85.3,
//       housing: 73.9
//     },
//     landUse: [
//       { type: "Residential", percentage: 45, color: "bg-blue-500" },
//       { type: "Commercial", percentage: 25, color: "bg-purple-500" },
//       { type: "Industrial", percentage: 15, color: "bg-gray-500" },
//       { type: "Green Spaces", percentage: 15, color: "bg-green-500" }
//     ]
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <h2 className="text-xl font-semibold text-gray-800 mb-6">Urban Growth Analysis - {city}</h2>
      
//       {/* Urban Expansion Overview */}
//       <div className="mb-6">
//         <h3 className="text-lg font-medium text-gray-700 mb-3">Urban Expansion</h3>
//         <div className="grid grid-cols-2 gap-4">
//           <div className="bg-gray-50 rounded-lg p-4">
//             <div className="text-2xl font-bold text-gray-800">{mockData.urbanExpansion.totalArea} km²</div>
//             <div className="text-sm text-gray-600">Total Urban Area</div>
//             <div className="text-sm text-green-600 font-medium">+{mockData.urbanExpansion.growth}% growth</div>
//           </div>
//           <div className="bg-gray-50 rounded-lg p-4">
//             <div className="text-2xl font-bold text-gray-800">{mockData.populationDensity.current}</div>
//             <div className="text-sm text-gray-600">People per km²</div>
//             <div className="text-sm text-blue-600 font-medium">+{mockData.populationDensity.change}% change</div>
//           </div>
//         </div>
//       </div>

//       {/* Land Use Distribution */}
//       <div className="mb-6">
//         <h3 className="text-lg font-medium text-gray-700 mb-3">Land Use Distribution</h3>
//         <div className="space-y-3">
//           {mockData.landUse.map((item, index) => (
//             <div key={index} className="flex items-center">
//               <div className="flex-1">
//                 <div className="flex justify-between items-center mb-1">
//                   <span className="text-sm font-medium text-gray-700">{item.type}</span>
//                   <span className="text-sm text-gray-600">{item.percentage}%</span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div 
//                     className={`h-2 rounded-full ${item.color}`}
//                     style={{ width: `${item.percentage}%` }}
//                   ></div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Infrastructure Readiness */}
//       <div className="mb-6">
//         <h3 className="text-lg font-medium text-gray-700 mb-3">Infrastructure Readiness</h3>
//         <div className="grid grid-cols-2 gap-3">
//           <div className="flex justify-between items-center">
//             <span className="text-sm text-gray-600">Road Network</span>
//             <span className="font-medium text-gray-800">{mockData.infrastructure.roadNetwork}%</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-sm text-gray-600">Public Transit</span>
//             <span className="font-medium text-gray-800">{mockData.infrastructure.publicTransit}%</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-sm text-gray-600">Utilities</span>
//             <span className="font-medium text-gray-800">{mockData.infrastructure.utilities}%</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-sm text-gray-600">Housing</span>
//             <span className="font-medium text-gray-800">{mockData.infrastructure.housing}%</span>
//           </div>
//         </div>
//       </div>

//       {/* Growth Projections */}
//       <div className="p-4 bg-green-50 rounded-lg">
//         <h4 className="text-sm font-medium text-green-800 mb-2">Growth Projections</h4>
//         <div className="text-sm text-green-700 space-y-1">
//           <div>Population density projected to reach {mockData.populationDensity.projection} people/km² by 2030</div>
//           <div>Recommended: Increase green space allocation by 5% in new developments</div>
//           <div>Priority: Enhance public transit infrastructure in high-growth areas</div>
//         </div>
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

interface UrbanGrowthAnalysisProps {
  city: string;
  timeRange: string;
}

export default function UrbanGrowthAnalysis({ city, timeRange }: UrbanGrowthAnalysisProps) {
  const chartRefs = {
    landUseChart: useRef<HTMLCanvasElement | null>(null),
    growthTrendChart: useRef<HTMLCanvasElement | null>(null),
    infrastructureChart: useRef<HTMLCanvasElement | null>(null),
    populationChart: useRef<HTMLCanvasElement | null>(null)
  };

  const chartInstances = useRef<{ [key: string]: ChartJS | undefined }>({});

  // Mock data
  const mockData = {
    urbanExpansion: {
      totalArea: 1245.7,
      growth: 3.8,
      developedLand: 78.2,
      greenSpaces: 21.8
    },
    populationDensity: {
      current: 8456,
      change: 2.3,
      projection: 9200
    },
    infrastructure: {
      roadNetwork: 92.4,
      publicTransit: 68.7,
      utilities: 85.3,
      housing: 73.9
    },
    landUse: [
      { type: "Residential", percentage: 45, color: "bg-blue-500" },
      { type: "Commercial", percentage: 25, color: "bg-purple-500" },
      { type: "Industrial", percentage: 15, color: "bg-gray-500" },
      { type: "Green Spaces", percentage: 15, color: "bg-green-500" }
    ]
  };

  // Historical trend data for visualizations
  const trendData = {
    labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
    urbanGrowth: [1150, 1180, 1200, 1220, 1235, 1245.7],
    population: [7800, 8000, 8150, 8280, 8350, 8456],
    projectedPopulation: [8456, 8600, 8750, 8900, 9050, 9200]
  };

  useEffect(() => {
    initializeCharts();
    return () => {
      Object.values(chartInstances.current).forEach(chart => {
        if (chart) chart.destroy();
      });
      chartInstances.current = {};
    };
  }, [city, timeRange]);

  const initializeCharts = () => {
    // Land Use Distribution Chart
    if (chartRefs.landUseChart.current) {
      const ctx = chartRefs.landUseChart.current.getContext('2d');
      if (ctx) {
        if (chartInstances.current.landUse) chartInstances.current.landUse.destroy();
        chartInstances.current.landUse = new ChartJS(ctx, {
          type: 'doughnut',
          data: {
            labels: mockData.landUse.map(item => item.type),
            datasets: [{
              data: mockData.landUse.map(item => item.percentage),
              backgroundColor: [
                'rgba(59, 130, 246, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(107, 114, 128, 0.8)',
                'rgba(16, 185, 129, 0.8)'
              ],
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: { position: 'bottom', labels: { usePointStyle: true } }
            },
            cutout: '65%'
          }
        });
      }
    }

    // Urban Growth Trend Chart
    if (chartRefs.growthTrendChart.current) {
      const ctx = chartRefs.growthTrendChart.current.getContext('2d');
      if (ctx) {
        if (chartInstances.current.growthTrend) chartInstances.current.growthTrend.destroy();
        chartInstances.current.growthTrend = new ChartJS(ctx, {
          type: 'line',
          data: {
            labels: trendData.labels,
            datasets: [{
              label: 'Urban Area (km²)',
              data: trendData.urbanGrowth,
              borderColor: 'rgba(16, 185, 129, 0.8)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { beginAtZero: false } }
          }
        });
      }
    }

    // Infrastructure Radar Chart
    if (chartRefs.infrastructureChart.current) {
      const ctx = chartRefs.infrastructureChart.current.getContext('2d');
      if (ctx) {
        if (chartInstances.current.infrastructure) chartInstances.current.infrastructure.destroy();
        chartInstances.current.infrastructure = new ChartJS(ctx, {
          type: 'radar',
          data: {
            labels: ['Road Network', 'Public Transit', 'Utilities', 'Housing'],
            datasets: [{
              label: 'Readiness (%)',
              data: [
                mockData.infrastructure.roadNetwork,
                mockData.infrastructure.publicTransit,
                mockData.infrastructure.utilities,
                mockData.infrastructure.housing
              ],
              backgroundColor: 'rgba(147, 51, 234, 0.2)',
              borderColor: 'rgba(147, 51, 234, 0.8)',
              pointBackgroundColor: 'rgba(147, 51, 234, 1)'
            }]
          },
          options: {
            responsive: true,
            scales: { r: { beginAtZero: true, max: 100 } }
          }
        });
      }
    }

    // Population Projection Chart
    if (chartRefs.populationChart.current) {
      const ctx = chartRefs.populationChart.current.getContext('2d');
      if (ctx) {
        if (chartInstances.current.population) chartInstances.current.population.destroy();
        chartInstances.current.population = new ChartJS(ctx, {
          type: 'bar',
          data: {
            labels: trendData.labels,
            datasets: [
              {
                label: 'Current Population',
                data: trendData.population,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderRadius: 4
              },
              {
                label: 'Projected Population',
                data: trendData.projectedPopulation,
                backgroundColor: 'rgba(139, 92, 246, 0.8)',
                borderRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } },
            scales: { y: { beginAtZero: false } }
          }
        });
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Urban Growth Analysis - {city}</h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{timeRange}</span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Live Data</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="text-2xl font-bold text-gray-800">{mockData.urbanExpansion.totalArea} km²</div>
          <div className="text-sm text-gray-600">Total Urban Area</div>
          <div className="text-sm text-green-600 font-medium">+{mockData.urbanExpansion.growth}% growth</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <div className="text-2xl font-bold text-gray-800">{mockData.populationDensity.current}</div>
          <div className="text-sm text-gray-600">People per km²</div>
          <div className="text-sm text-blue-600 font-medium">+{mockData.populationDensity.change}% change</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="text-2xl font-bold text-gray-800">{mockData.urbanExpansion.developedLand}%</div>
          <div className="text-sm text-gray-600">Developed Land</div>
          <div className="text-sm text-emerald-600 font-medium">Urban Coverage</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-100">
          <div className="text-2xl font-bold text-gray-800">{mockData.urbanExpansion.greenSpaces}%</div>
          <div className="text-sm text-gray-600">Green Spaces</div>
          <div className="text-sm text-amber-600 font-medium">Preservation Area</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Land Use Distribution</h3>
          <div className="h-64">
            <canvas ref={chartRefs.landUseChart}></canvas>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Urban Growth Trend</h3>
          <div className="h-64">
            <canvas ref={chartRefs.growthTrendChart}></canvas>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Infrastructure Readiness</h3>
          <div className="h-64">
            <canvas ref={chartRefs.infrastructureChart}></canvas>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Population Projection</h3>
          <div className="h-64">
            <canvas ref={chartRefs.populationChart}></canvas>
          </div>
        </div>
      </div>

      {/* Growth Projections */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
        <h4 className="text-sm font-medium text-green-800 mb-4">Growth Insights & Recommendations</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2">
              <span className="text-xl">📈</span>
              <span className="text-sm text-green-800">
                Population density projected: {mockData.populationDensity.projection} people/km² by 2030
              </span>
            </div>
          </div>
          <div className="bg-white/50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌳</span>
              <span className="text-sm text-green-800">
                Recommended: Increase green space by 5%
              </span>
            </div>
          </div>
          <div className="bg-white/50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2">
              <span className="text-xl">🚊</span>
              <span className="text-sm text-green-800">
                Priority: Enhance public transit infrastructure
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}