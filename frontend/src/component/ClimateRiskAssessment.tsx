// "use client";

// interface ClimateRiskAssessmentProps {
//   city: string;
// }

// export default function ClimateRiskAssessment({ city }: ClimateRiskAssessmentProps) {
//   // Mock data - in real implementation, this would come from climate models and NASA data
//   const riskFactors = [
//     {
//       name: "Flooding",
//       level: "High",
//       probability: 75,
//       impact: "Severe",
//       trend: "increasing",
//       description: "Sea level rise and extreme precipitation events"
//     },
//     {
//       name: "Heat Waves",
//       level: "Medium",
//       probability: 60,
//       impact: "Moderate",
//       trend: "increasing",
//       description: "Urban heat island effect amplification"
//     },
//     {
//       name: "Drought",
//       level: "Low",
//       probability: 25,
//       impact: "Minor",
//       trend: "stable",
//       description: "Water supply disruption potential"
//     },
//     {
//       name: "Storm Surge",
//       level: "High",
//       probability: 70,
//       impact: "Severe",
//       trend: "increasing",
//       description: "Coastal infrastructure vulnerability"
//     }
//   ];

//   const adaptationMeasures = [
//     {
//       measure: "Green Infrastructure",
//       progress: 65,
//       status: "In Progress",
//       description: "Rain gardens, permeable pavements, urban forests"
//     },
//     {
//       measure: "Flood Barriers",
//       progress: 30,
//       status: "Planning",
//       description: "Coastal protection and inland flood defenses"
//     },
//     {
//       measure: "Cool Roofs Program",
//       progress: 85,
//       status: "Active",
//       description: "Reflective roofing to reduce heat absorption"
//     },
//     {
//       measure: "Emergency Preparedness",
//       progress: 50,
//       status: "In Progress",
//       description: "Early warning systems and evacuation routes"
//     }
//   ];

//   const getRiskColor = (level: string) => {
//     switch (level.toLowerCase()) {
//       case "high": return "bg-red-100 text-red-800 border-red-200";
//       case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
//       case "low": return "bg-green-100 text-green-800 border-green-200";
//       default: return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status.toLowerCase()) {
//       case "active": return "bg-green-100 text-green-800";
//       case "in progress": return "bg-blue-100 text-blue-800";
//       case "planning": return "bg-yellow-100 text-yellow-800";
//       default: return "bg-gray-100 text-gray-800";
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <h2 className="text-xl font-semibold text-gray-800 mb-6">Climate Risk Assessment - {city}</h2>
      
//       {/* Risk Factors */}
//       <div className="mb-8">
//         <h3 className="text-lg font-medium text-gray-700 mb-4">Climate Risk Factors</h3>
//         <div className="space-y-4">
//           {riskFactors.map((risk, index) => (
//             <div key={index} className="border border-gray-200 rounded-lg p-4">
//               <div className="flex justify-between items-start mb-2">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2 mb-1">
//                     <h4 className="font-medium text-gray-800">{risk.name}</h4>
//                     <span className={`text-xs px-2 py-1 rounded-full border ${getRiskColor(risk.level)}`}>
//                       {risk.level} Risk
//                     </span>
//                   </div>
//                   <p className="text-sm text-gray-600">{risk.description}</p>
//                 </div>
//                 <div className="text-right ml-4">
//                   <div className="text-lg font-bold text-gray-800">{risk.probability}%</div>
//                   <div className="text-xs text-gray-500">Probability</div>
//                 </div>
//               </div>
              
//               {/* Risk probability bar */}
//               <div className="mt-3">
//                 <div className="flex justify-between text-xs text-gray-600 mb-1">
//                   <span>Risk Probability</span>
//                   <span className={risk.trend === 'increasing' ? 'text-red-600' : 'text-green-600'}>
//                     {risk.trend === 'increasing' ? '↗️ Increasing' : '➡️ Stable'}
//                   </span>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div 
//                     className={`h-2 rounded-full ${
//                       risk.probability >= 70 ? 'bg-red-500' : 
//                       risk.probability >= 40 ? 'bg-yellow-500' : 'bg-green-500'
//                     }`}
//                     style={{ width: `${risk.probability}%` }}
//                   ></div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Adaptation Measures */}
//       <div>
//         <h3 className="text-lg font-medium text-gray-700 mb-4">Adaptation Measures</h3>
//         <div className="space-y-3">
//           {adaptationMeasures.map((measure, index) => (
//             <div key={index} className="border border-gray-200 rounded-lg p-4">
//               <div className="flex justify-between items-start mb-2">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2 mb-1">
//                     <h4 className="font-medium text-gray-800">{measure.measure}</h4>
//                     <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(measure.status)}`}>
//                       {measure.status}
//                     </span>
//                   </div>
//                   <p className="text-sm text-gray-600">{measure.description}</p>
//                 </div>
//                 <div className="text-right ml-4">
//                   <div className="text-lg font-bold text-gray-800">{measure.progress}%</div>
//                   <div className="text-xs text-gray-500">Complete</div>
//                 </div>
//               </div>
              
//               {/* Progress bar */}
//               <div className="mt-3">
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div 
//                     className="h-2 rounded-full bg-blue-500"
//                     style={{ width: `${measure.progress}%` }}
//                   ></div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Summary Alert */}
//       <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
//         <h4 className="text-sm font-medium text-orange-800 mb-2">⚠️ Priority Actions Required</h4>
//         <ul className="text-sm text-orange-700 space-y-1">
//           <li>• Accelerate flood barrier construction due to high risk level</li>
//           <li>• Expand green infrastructure to combat urban heat island effect</li>
//           <li>• Enhance storm surge preparedness for coastal areas</li>
//         </ul>
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useRef } from "react";
import { Chart as ChartJS, registerables } from "chart.js";

if (typeof window !== "undefined") {
  ChartJS.register(...registerables);
}

interface ClimateRiskAssessmentProps {
  city: string;
}

export default function ClimateRiskAssessment({ city }: ClimateRiskAssessmentProps) {
  const chartRefs = {
    riskPieChart: useRef<HTMLCanvasElement | null>(null),
    probabilityChart: useRef<HTMLCanvasElement | null>(null),
    adaptationChart: useRef<HTMLCanvasElement | null>(null),
    trendChart: useRef<HTMLCanvasElement | null>(null)
  };

  const chartInstances = useRef<{ [key: string]: ChartJS | undefined }>({});

  // Mock data
  const riskFactors = [
    {
      name: "Flooding",
      level: "High",
      probability: 75,
      impact: "Severe",
      trend: "increasing",
      description: "Sea level rise and extreme precipitation events"
    },
    {
      name: "Heat Waves",
      level: "Medium",
      probability: 60,
      impact: "Moderate",
      trend: "increasing",
      description: "Urban heat island effect amplification"
    },
    {
      name: "Drought",
      level: "Low",
      probability: 25,
      impact: "Minor",
      trend: "stable",
      description: "Water supply disruption potential"
    },
    {
      name: "Storm Surge",
      level: "High",
      probability: 70,
      impact: "Severe",
      trend: "increasing",
      description: "Coastal infrastructure vulnerability"
    }
  ];

  const adaptationMeasures = [
    {
      measure: "Green Infrastructure",
      progress: 65,
      status: "In Progress",
      description: "Rain gardens, permeable pavements, urban forests"
    },
    {
      measure: "Flood Barriers",
      progress: 30,
      status: "Planning",
      description: "Coastal protection and inland flood defenses"
    },
    {
      measure: "Cool Roofs Program",
      progress: 85,
      status: "Active",
      description: "Reflective roofing to reduce heat absorption"
    },
    {
      measure: "Emergency Preparedness",
      progress: 50,
      status: "In Progress",
      description: "Early warning systems and evacuation routes"
    }
  ];

  // Historical trend data
  const trendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    flooding: [65, 68, 70, 72, 74, 75],
    heatWaves: [50, 52, 55, 58, 59, 60],
    drought: [30, 28, 27, 26, 25, 25],
    stormSurge: [60, 62, 65, 67, 69, 70]
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800";
      case "in progress": return "bg-blue-100 text-blue-800";
      case "planning": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
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
  }, [city]);

  const initializeCharts = () => {
    // Risk Distribution Pie Chart
    if (chartRefs.riskPieChart.current) {
      const ctx = chartRefs.riskPieChart.current.getContext('2d');
      if (ctx) {
        if (chartInstances.current.riskPie) chartInstances.current.riskPie.destroy();
        chartInstances.current.riskPie = new ChartJS(ctx, {
          type: 'doughnut',
          data: {
            labels: riskFactors.map(risk => risk.name),
            datasets: [{
              data: riskFactors.map(risk => risk.probability),
              backgroundColor: [
                'rgba(239, 68, 68, 0.8)',
                'rgba(245, 158, 11, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(99, 102, 241, 0.8)'
              ],
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  padding: 20
                }
              }
            },
            cutout: '60%'
          }
        });
      }
    }

    // Risk Probability Bar Chart
    if (chartRefs.probabilityChart.current) {
      const ctx = chartRefs.probabilityChart.current.getContext('2d');
      if (ctx) {
        if (chartInstances.current.probability) chartInstances.current.probability.destroy();
        chartInstances.current.probability = new ChartJS(ctx, {
          type: 'bar',
          data: {
            labels: riskFactors.map(risk => risk.name),
            datasets: [{
              label: 'Risk Probability (%)',
              data: riskFactors.map(risk => risk.probability),
              backgroundColor: riskFactors.map(risk => 
                risk.level === 'High' ? 'rgba(239, 68, 68, 0.8)' :
                risk.level === 'Medium' ? 'rgba(245, 158, 11, 0.8)' :
                'rgba(16, 185, 129, 0.8)'
              ),
              borderRadius: 8
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
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

    // Adaptation Progress Radar Chart
    if (chartRefs.adaptationChart.current) {
      const ctx = chartRefs.adaptationChart.current.getContext('2d');
      if (ctx) {
        if (chartInstances.current.adaptation) chartInstances.current.adaptation.destroy();
        chartInstances.current.adaptation = new ChartJS(ctx, {
          type: 'radar',
          data: {
            labels: adaptationMeasures.map(measure => measure.measure),
            datasets: [{
              label: 'Progress (%)',
              data: adaptationMeasures.map(measure => measure.progress),
              fill: true,
              backgroundColor: 'rgba(147, 51, 234, 0.2)',
              borderColor: 'rgba(147, 51, 234, 0.8)',
              pointBackgroundColor: 'rgba(147, 51, 234, 1)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(147, 51, 234, 1)'
            }]
          },
          options: {
            responsive: true,
            scales: {
              r: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  stepSize: 20
                }
              }
            }
          }
        });
      }
    }

    // Risk Trends Line Chart
    if (chartRefs.trendChart.current) {
      const ctx = chartRefs.trendChart.current.getContext('2d');
      if (ctx) {
        if (chartInstances.current.trend) chartInstances.current.trend.destroy();
        chartInstances.current.trend = new ChartJS(ctx, {
          type: 'line',
          data: {
            labels: trendData.labels,
            datasets: [
              {
                label: 'Flooding',
                data: trendData.flooding,
                borderColor: 'rgba(239, 68, 68, 0.8)',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(239, 68, 68, 0.1)'
              },
              {
                label: 'Heat Waves',
                data: trendData.heatWaves,
                borderColor: 'rgba(245, 158, 11, 0.8)',
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
        <h2 className="text-xl font-semibold text-gray-800">Climate Risk Assessment - {city}</h2>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">High Priority</span>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Live Data</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Risk Distribution</h3>
          <div className="h-64">
            <canvas ref={chartRefs.riskPieChart}></canvas>
          </div>
        </div>

        {/* Risk Probability */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Risk Probability Analysis</h3>
          <div className="h-64">
            <canvas ref={chartRefs.probabilityChart}></canvas>
          </div>
        </div>

        {/* Risk Trends */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Risk Trends Over Time</h3>
          <div className="h-64">
            <canvas ref={chartRefs.trendChart}></canvas>
          </div>
        </div>

        {/* Adaptation Progress */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Adaptation Measures Progress</h3>
          <div className="h-64">
            <canvas ref={chartRefs.adaptationChart}></canvas>
          </div>
        </div>
      </div>

      {/* Risk Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {riskFactors.map((risk, index) => (
          <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-800">{risk.name}</h4>
                <span className={`text-xs px-2 py-1 rounded-full border ${getRiskColor(risk.level)}`}>
                  {risk.level} Risk
                </span>
              </div>
              <div className="text-lg font-bold text-gray-800">{risk.probability}%</div>
            </div>
            <p className="text-sm text-gray-600">{risk.description}</p>
          </div>
        ))}
      </div>

      {/* Priority Actions */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
        <h4 className="text-sm font-medium text-orange-800 mb-3">⚠️ Priority Actions Required</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { action: 'Accelerate flood barrier construction', icon: '🏗️' },
            { action: 'Expand green infrastructure', icon: '🌳' },
            { action: 'Enhance storm surge preparedness', icon: '🌊' }
          ].map((item, index) => (
            <div key={index} className="bg-white/50 rounded-lg p-3 border border-orange-200">
              <div className="flex items-center gap-2">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm text-orange-800">{item.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}