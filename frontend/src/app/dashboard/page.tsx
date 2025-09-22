"use client";

import { useState, useEffect } from "react";
import EnvironmentalMetrics from "../../component/EnvironmentalMetrics";
import UrbanGrowthAnalysis from "../../component/UrbanGrowthAnalysis";
import EnhancedMapComponent from "../../component/EnhancedMapComponent";

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
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 space-y-8">

        {/* Map Section - Top Priority */}
        <div className={`transition-all duration-1000 delay-200 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="max-w-10xl mx-auto">
            <EnhancedMapComponent />
          </div>
        </div>

        {/* Components */}
        <div className="space-y-8">
          {/* Environmental Metrics */}
          <div className={`transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="transform hover:scale-[1.01] transition-all duration-300">
              <EnvironmentalMetrics city={selectedCity} timeRange={timeRange} />
            </div>
          </div>

          {/* Urban Growth Analysis */}
          <div className={`transition-all duration-1000 delay-400 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="transform hover:scale-[1.01] transition-all duration-300">
              <UrbanGrowthAnalysis city={selectedCity} timeRange={timeRange} />
            </div>
          </div>



        </div>
      </div>
    </div>
  );
}

// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { Chart as ChartJS, registerables } from "chart.js";

// // Theme constants
// const LIGHT_PALETTE = {
//   accent: {
//     green: "#10B981",
//     blue: "#0EA5E9",
//     purple: "#8B5CF6",
//     orange: "#F59E0B",
//     teal: "#14B8A6",
//   },
// };

// type ChartMap = {
//   environmental?: ChartJS;
//   growth?: ChartJS;
//   risk?: ChartJS;
//   energy?: ChartJS;
//   traffic?: ChartJS;
//   sustainability?: ChartJS;
// };

// interface MetricCardProps {
//   title: string;
//   value: number | undefined;
//   unit: string;
//   icon: string;
//   percentage: number;
// }

// interface CircularProgressProps {
//   percentage: number;
//   color: string;
//   size?: number;
//   label: string;
// }

// const Dashboard: React.FC = () => {
//   const [selectedCity, setSelectedCity] = useState("New York");
//   const [timeRange, setTimeRange] = useState("1year");
//   const [isVisible, setIsVisible] = useState(false);
//   const [animatedValues, setAnimatedValues] = useState<Record<string, number>>(
//     {}
//   );

//   // Chart refs
//   const environmentalChartRef = useRef<HTMLCanvasElement | null>(null);
//   const growthChartRef = useRef<HTMLCanvasElement | null>(null);
//   const riskChartRef = useRef<HTMLCanvasElement | null>(null);
//   const energyChartRef = useRef<HTMLCanvasElement | null>(null);
//   const trafficChartRef = useRef<HTMLCanvasElement | null>(null);
//   const sustainabilityChartRef = useRef<HTMLCanvasElement | null>(null);

//   // Chart instances
//   const chartInstances = useRef<ChartMap>({});
//   const registeredRef = useRef(false);

//   useEffect(() => {
//     // Register Chart.js components on the client once
//     if (!registeredRef.current) {
//       ChartJS.register(...registerables);
//       registeredRef.current = true;
//     }

//     setIsVisible(true);

//     // Animate counters
//     const values = {
//       population: 8419000,
//       airQuality: 78,
//       greenSpace: 65,
//       energyEfficiency: 82,
//     };

//     const timers: number[] = [];
//     Object.keys(values).forEach((key) => {
//       let start = 0;
//       const end = (values as any)[key] as number;
//       const duration = 2000;
//       const increment = end / (duration / 16);

//       const id = window.setInterval(() => {
//         start += increment;
//         if (start >= end) {
//           start = end;
//           window.clearInterval(id);
//         }
//         setAnimatedValues((prev) => ({ ...prev, [key]: Math.floor(start) }));
//       }, 16);
//       timers.push(id);
//     });

//     // Initialize charts after a tiny delay (ensures canvas has dimensions)
//     const initTimeout = window.setTimeout(() => {
//       initializeCharts();
//     }, 100);

//     return () => {
//       // Cleanup timers
//       timers.forEach((t) => window.clearInterval(t));
//       window.clearTimeout(initTimeout);
//       // Destroy all charts
//       Object.values(chartInstances.current).forEach((c) => c?.destroy());
//       chartInstances.current = {};
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   useEffect(() => {
//     if (Object.keys(chartInstances.current).length > 0) {
//       updateChartsData();
//     }
//   }, [selectedCity, timeRange]);

//   const cities = [
//     "New York",
//     "Los Angeles",
//     "Chicago",
//     "Houston",
//     "Phoenix",
//     "Philadelphia",
//   ];
//   const timeRanges = [
//     { value: "1month", label: "Last Month" },
//     { value: "3months", label: "Last 3 Months" },
//     { value: "1year", label: "Last Year" },
//     { value: "5years", label: "Last 5 Years" },
//   ];

//   const destroyIfExists = (key: keyof ChartMap) => {
//     chartInstances.current[key]?.destroy();
//     chartInstances.current[key] = undefined;
//   };

//   const initializeCharts = () => {
//     // Environmental Trends Chart
//     if (environmentalChartRef.current) {
//       const ctx = environmentalChartRef.current.getContext("2d");
//       if (ctx) {
//         destroyIfExists("environmental");
//         chartInstances.current.environmental = new ChartJS(ctx, {
//           type: "line",
//           data: {
//             labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
//             datasets: [
//               {
//                 label: "Air Quality",
//                 data: [65, 70, 78, 82, 75, 68],
//                 borderColor: LIGHT_PALETTE.accent.teal,
//                 backgroundColor: `${LIGHT_PALETTE.accent.teal}20`,
//                 fill: true,
//                 tension: 0.4,
//               },
//               {
//                 label: "Temperature",
//                 data: [35, 38, 48, 58, 68, 78],
//                 borderColor: LIGHT_PALETTE.accent.orange,
//                 backgroundColor: `${LIGHT_PALETTE.accent.orange}20`,
//                 fill: true,
//                 tension: 0.4,
//               },
//             ],
//           },
//           options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//               legend: {
//                 labels: {
//                   color: "rgb(55, 65, 81)",
//                 },
//               },
//             },
//             scales: {
//               x: {
//                 grid: {
//                   color: "rgba(229, 231, 235, 0.5)",
//                 },
//                 ticks: { color: "rgb(75, 85, 99)" },
//               },
//               y: {
//                 grid: {
//                   color: "rgba(229, 231, 235, 0.5)",
//                 },
//                 ticks: { color: "rgb(75, 85, 99)" },
//               },
//             },
//           },
//         });
//       }
//     }

//     // Urban Growth Chart
//     if (growthChartRef.current) {
//       const ctx = growthChartRef.current.getContext("2d");
//       if (ctx) {
//         destroyIfExists("growth");
//         chartInstances.current.growth = new ChartJS(ctx, {
//           type: "bar",
//           data: {
//             labels: ["2020", "2021", "2022", "2023", "2024"],
//             datasets: [
//               {
//                 label: "Residential",
//                 data: [12000, 15000, 18000, 22000, 26000],
//                 backgroundColor: LIGHT_PALETTE.accent.blue,
//                 borderRadius: 4,
//               },
//               {
//                 label: "Commercial",
//                 data: [8000, 9500, 11000, 13500, 15000],
//                 backgroundColor: LIGHT_PALETTE.accent.orange,
//                 borderRadius: 4,
//               },
//               {
//                 label: "Industrial",
//                 data: [3000, 3500, 4000, 4800, 5200],
//                 backgroundColor: LIGHT_PALETTE.accent.purple,
//                 borderRadius: 4,
//               },
//             ],
//           },
//           options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//               legend: {
//                 labels: {
//                   color: "rgb(55, 65, 81)",
//                 },
//               },
//             },
//             scales: {
//               x: {
//                 grid: {
//                   color: "rgba(229, 231, 235, 0.5)",
//                 },
//                 ticks: { color: "rgb(75, 85, 99)" },
//               },
//               y: {
//                 grid: {
//                   color: "rgba(229, 231, 235, 0.5)",
//                 },
//                 ticks: { color: "rgb(75, 85, 99)" },
//               },
//             },
//           },
//         });
//       }
//     }

//     // Risk Assessment Chart
//     if (riskChartRef.current) {
//       const ctx = riskChartRef.current.getContext("2d");
//       if (ctx) {
//         destroyIfExists("risk");
//         chartInstances.current.risk = new ChartJS(ctx, {
//           type: "doughnut",
//           data: {
//             labels: ["Low Risk", "Medium Risk", "High Risk", "Critical"],
//             datasets: [
//               {
//                 data: [45, 35, 15, 5],
//                 backgroundColor: [
//                   LIGHT_PALETTE.accent.green,
//                   LIGHT_PALETTE.accent.blue,
//                   LIGHT_PALETTE.accent.orange,
//                   LIGHT_PALETTE.accent.purple,
//                 ],
//                 borderWidth: 0,
//               },
//             ],
//           },
//           options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//               legend: {
//                 position: "bottom",
//                 labels: {
//                   color: "rgb(55, 65, 81)",
//                   padding: 20,
//                   usePointStyle: true,
//                 },
//               },
//             },
//           },
//         });
//       }
//     }

//     // Energy Mix Chart
//     if (energyChartRef.current) {
//       const ctx = energyChartRef.current.getContext("2d");
//       if (ctx) {
//         destroyIfExists("energy");
//         chartInstances.current.energy = new ChartJS(ctx, {
//           type: "pie",
//           data: {
//             labels: ["Solar", "Wind", "Hydro", "Nuclear", "Fossil"],
//             datasets: [
//               {
//                 data: [35, 28, 22, 10, 5],
//                 backgroundColor: [
//                   LIGHT_PALETTE.accent.orange,
//                   LIGHT_PALETTE.accent.blue,
//                   LIGHT_PALETTE.accent.teal,
//                   LIGHT_PALETTE.accent.purple,
//                   "#94A3B8",
//                 ],
//                 borderWidth: 0,
//               },
//             ],
//           },
//           options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//               legend: {
//                 position: "bottom",
//                 labels: {
//                   color: "rgb(55, 65, 81)",
//                   padding: 15,
//                   usePointStyle: true,
//                 },
//               },
//             },
//           },
//         });
//       }
//     }

//     // Traffic Analytics Chart
//     if (trafficChartRef.current) {
//       const ctx = trafficChartRef.current.getContext("2d");
//       if (ctx) {
//         destroyIfExists("traffic");
//         chartInstances.current.traffic = new ChartJS(ctx, {
//           type: "line",
//           data: {
//             labels: ["6AM", "8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM"],
//             datasets: [
//               {
//                 label: "Traffic Volume",
//                 data: [2400, 8500, 4200, 6800, 5200, 9200, 7800, 3500],
//                 borderColor: LIGHT_PALETTE.accent.blue,
//                 backgroundColor: `${LIGHT_PALETTE.accent.blue}20`,
//                 yAxisID: "y",
//                 tension: 0.4,
//               },
//               {
//                 label: "Average Speed",
//                 data: [45, 25, 35, 30, 32, 22, 28, 40],
//                 borderColor: LIGHT_PALETTE.accent.orange,
//                 backgroundColor: `${LIGHT_PALETTE.accent.orange}20`,
//                 yAxisID: "y1",
//                 tension: 0.4,
//                 borderDash: [5, 5],
//               },
//             ],
//           },
//           options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             interaction: { mode: "index", intersect: false },
//             plugins: {
//               legend: {
//                 labels: { color: "rgb(55, 65, 81)" },
//               },
//             },
//             scales: {
//               x: {
//                 grid: { color: "rgba(229, 231, 235, 0.5)" },
//                 ticks: { color: "rgb(75, 85, 99)" },
//               },
//               y: {
//                 type: "linear",
//                 display: true,
//                 position: "left",
//                 grid: { color: "rgba(229, 231, 235, 0.5)" },
//                 ticks: { color: "rgb(75, 85, 99)" },
//               },
//               y1: {
//                 type: "linear",
//                 display: true,
//                 position: "right",
//                 grid: { drawOnChartArea: false },
//                 ticks: { color: "rgb(75, 85, 99)" },
//               },
//             },
//           },
//         });
//       }
//     }

//     // Sustainability Goals Chart
//     if (sustainabilityChartRef.current) {
//       const ctx = sustainabilityChartRef.current.getContext("2d");
//       if (ctx) {
//         destroyIfExists("sustainability");
//         chartInstances.current.sustainability = new ChartJS(ctx, {
//           type: "doughnut",
//           data: {
//             labels: [
//               "Carbon Neutral",
//               "Renewable Energy",
//               "Waste Reduction",
//               "Water Conservation",
//             ],
//             datasets: [
//               {
//                 data: [78, 65, 82, 91],
//                 backgroundColor: [
//                   LIGHT_PALETTE.accent.green,
//                   LIGHT_PALETTE.accent.blue,
//                   LIGHT_PALETTE.accent.orange,
//                   LIGHT_PALETTE.accent.teal,
//                 ],
//                 borderWidth: 0,
//                 cutout: "60%",
//               },
//             ],
//           },
//           options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//               legend: {
//                 position: "bottom",
//                 labels: {
//                   color: "rgb(55, 65, 81)",
//                   padding: 10,
//                   usePointStyle: true,
//                   font: { size: 10 },
//                 },
//               },
//             },
//           },
//         });
//       }
//     }
//   };

//   const updateChartsData = () => {
//     // Hook up to real data later; for now, we just log to show reactivity works.
//     // You can set chartInstances.current.<chart>.data = ...; and call .update();
//     // Example:
//     // chartInstances.current.environmental!.data.datasets[0].data = newValues;
//     // chartInstances.current.environmental!.update();
//     console.log(`Updating data for ${selectedCity} - ${timeRange}`);
//   };

//   const MetricCard: React.FC<MetricCardProps & { color?: string }> = ({
//     title,
//     value,
//     unit,
//     icon,
//     percentage,
//   }) => (
//     <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-emerald-200/20 transform hover:scale-105 transition-all duration-300">
//       <div className="flex items-center justify-between mb-4">
//         <div className="text-gray-700 text-sm font-medium">{title}</div>
//         <div className="text-2xl">{icon}</div>
//       </div>
//       <div className="text-gray-800 text-3xl font-bold mb-2">
//         {(value ?? 0).toLocaleString()}
//         {unit}
//       </div>
//       <div className="flex items-center text-gray-600 text-sm">
//         <div
//           className={`px-2 py-1 rounded-full text-xs ${
//             percentage >= 0
//               ? "bg-emerald-100 text-emerald-700"
//               : "bg-red-100 text-red-700"
//           }`}
//         >
//           {percentage >= 0 ? "↗" : "↘"} {Math.abs(percentage)}%
//         </div>
//         <span className="ml-2">vs last period</span>
//       </div>
//     </div>
//   );

//   const CircularProgress: React.FC<CircularProgressProps> = ({
//     percentage,
//     color,
//     size = 120,
//     label,
//   }) => {
//     const radius = size / 2 - 10;
//     const circumference = 2 * Math.PI * radius;
//     const strokeDashoffset = circumference - (percentage / 100) * circumference;

//     return (
//       <div className="flex flex-col items-center">
//         <div className="relative" style={{ width: size, height: size }}>
//           <svg width={size} height={size} className="transform -rotate-90">
//             <circle
//               cx={size / 2}
//               cy={size / 2}
//               r={radius}
//               stroke="rgba(229, 231, 235, 0.5)"
//               strokeWidth="8"
//               fill="none"
//             />
//             <circle
//               cx={size / 2}
//               cy={size / 2}
//               r={radius}
//               stroke={color}
//               strokeWidth="8"
//               fill="none"
//               strokeLinecap="round"
//               strokeDasharray={circumference}
//               strokeDashoffset={strokeDashoffset}
//               className="transition-all duration-1000 ease-out"
//             />
//           </svg>
//           <div className="absolute inset-0 flex items-center justify-center">
//             <span className="text-xl font-bold text-gray-800">
//               {percentage}%
//             </span>
//           </div>
//         </div>
//         <span className="text-gray-600 text-xs mt-2 text-center">{label}</span>
//       </div>
//     );
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 p-6 relative overflow-hidden">
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
//         <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
//       </div>

//       <div className="fixed left-0 top-0 h-full w-20 bg-white/90 backdrop-blur-lg border-r border-emerald-200/20 flex flex-col items-center py-6 z-50">
//         <div className="text-2xl font-bold text-gray-800 mb-8">🏙️</div>
//         {["🏠", "📊", "🔔", "⚙️", "👤", "📈", "🌍", "📋"].map((icon, i) => (
//           <div
//             key={i}
//             className="w-12 h-12 rounded-xl bg-gray-100/50 hover:bg-gray-200/50 flex items-center justify-center mb-4 cursor-pointer transition-all duration-300 hover:scale-110"
//           >
//             <span className="text-xl">{icon}</span>
//           </div>
//         ))}
//       </div>

//       <div className="ml-24 max-w-7xl mx-auto relative z-10">
//         <div
//           className={`mb-8 transition-all duration-1000 transform ${
//             isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
//           }`}
//         >
//           <div className="flex items-center justify-between mb-6">
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
//               Urban Analytics Hub
//             </h1>
//             <div className="flex items-center gap-4">
//               <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-emerald-200/20">
//                 <span className="text-gray-700 text-sm">🔴 Live Data</span>
//               </div>
//               <div className="text-gray-700">👤 Admin</div>
//             </div>
//           </div>

//           <div className="flex flex-wrap gap-4 items-center">
//             <select
//               value={selectedCity}
//               onChange={(e) => setSelectedCity(e.target.value)}
//               className="bg-white/80 backdrop-blur-sm border border-emerald-200/20 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200"
//             >
//               {cities.map((city) => (
//                 <option key={city} value={city} className="bg-white">
//                   {city}
//                 </option>
//               ))}
//             </select>
//             <select
//               value={timeRange}
//               onChange={(e) => setTimeRange(e.target.value)}
//               className="bg-white/80 backdrop-blur-sm border border-emerald-200/20 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200"
//             >
//               {timeRanges.map((range) => (
//                 <option key={range.value} value={range.value} className="bg-white">
//                   {range.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div
//           className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 transition-all duration-1000 delay-200 transform ${
//             isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
//           }`}
//         >
//           <MetricCard
//             title="Population"
//             value={animatedValues.population}
//             unit=""
//             icon="👥"
//             percentage={12.5}
//           />
//           <MetricCard
//             title="Air Quality Index"
//             value={animatedValues.airQuality}
//             unit="/100"
//             icon="🌬️"
//             percentage={8.2}
//           />
//           <MetricCard
//             title="Green Spaces"
//             value={animatedValues.greenSpace}
//             unit="%"
//             icon="🌳"
//             percentage={-3.1}
//           />
//           <MetricCard
//             title="Energy Efficiency"
//             value={animatedValues.energyEfficiency}
//             unit="%"
//             icon="⚡"
//             percentage={15.7}
//           />
//         </div>

//         <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-emerald-200/20 shadow-lg hover:shadow-xl transition-all duration-300">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-bold text-gray-800">Environmental Trends</h2>
//           </div>
//           <div className="h-80">
//             <canvas ref={environmentalChartRef}></canvas>
//           </div>
//         </div>

//         <div
//           className={`grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 transition-all duration-1000 delay-600 transform ${
//             isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
//           }`}
//         >
//           <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/20 shadow-lg hover:shadow-xl transition-all duration-300">
//             <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//               <span className="mr-2">🏗️</span>
//               Urban Development Progress
//             </h3>
//             <div className="h-64">
//               <canvas ref={growthChartRef}></canvas>
//             </div>
//           </div>

//           <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/20 shadow-lg hover:shadow-xl transition-all duration-300">
//             <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//               <span className="mr-2">⚠️</span>
//               Climate Risk Distribution
//             </h3>
//             <div className="h-64">
//               <canvas ref={riskChartRef}></canvas>
//             </div>
//           </div>
//         </div>

//         <div
//           className={`grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 transition-all duration-1000 delay-800 transform ${
//             isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
//           }`}
//         >
//           <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/20 shadow-lg hover:shadow-xl transition-all duration-300">
//             <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//               <span className="mr-2">⚡</span>
//               Energy Mix
//             </h3>
//             <div className="h-48">
//               <canvas ref={energyChartRef}></canvas>
//             </div>
//           </div>

//           <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/20 shadow-lg hover:shadow-xl transition-all duration-300">
//             <h3 className="text-xl font-bold text-gray-800 mb-4">Sustainability Goals</h3>
//             <div className="grid grid-cols-2 gap-4">
//               <CircularProgress
//                 percentage={78}
//                 color={LIGHT_PALETTE.accent.green}
//                 size={70}
//                 label="Carbon Neutral"
//               />
//               <CircularProgress
//                 percentage={65}
//                 color={LIGHT_PALETTE.accent.blue}
//                 size={70}
//                 label="Renewable Energy"
//               />
//               <CircularProgress
//                 percentage={82}
//                 color={LIGHT_PALETTE.accent.orange}
//                 size={70}
//                 label="Waste Reduction"
//               />
//               <CircularProgress
//                 percentage={91}
//                 color={LIGHT_PALETTE.accent.teal}
//                 size={70}
//                 label="Water Conservation"
//               />
//             </div>
//           </div>

//           <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/20 shadow-lg hover:shadow-xl transition-all duration-300">
//             <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//               <span className="mr-2">🚦</span>
//               Traffic Insights
//             </h3>
//             <div className="h-48">
//               <canvas ref={trafficChartRef}></canvas>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/20 shadow-lg hover:shadow-xl transition-all duration-300">
//           <h3 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h3>
//           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//             {[
//               { label: "Generate Report", icon: "📊", color: "from-emerald-500 to-teal-600" },
//               { label: "Export Data", icon: "📤", color: "from-blue-500 to-cyan-600" },
//               { label: "Set Alerts", icon: "🔔", color: "from-purple-500 to-violet-600" },
//               { label: "Plan Scenario", icon: "🎯", color: "from-orange-500 to-amber-600" },
//             ].map((action, index) => (
//               <button
//                 key={index}
//                 className={`bg-gradient-to-r ${action.color} p-4 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2`}
//               >
//                 <span className="text-xl">{action.icon}</span>
//                 {action.label}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;




// "use client";

// import React, { useState, useEffect } from "react";
// import EnvironmentalMetrics from "../../component/EnvironmentalMetrics";
// import UrbanGrowthAnalysis from "../../component/UrbanGrowthAnalysis";
// import ClimateRiskAssessment from "../../component/ClimateRiskAssessment";
// import SatelliteDataViewer from "../../component/SatelliteDataViewer";

// interface MetricCardProps {
//   title: string;
//   value: number | undefined;
//   unit: string;
//   icon: string;
//   percentage: number;
// }

// const Dashboard: React.FC = () => {
//   const [selectedCity, setSelectedCity] = useState("New York");
//   const [timeRange, setTimeRange] = useState("1year");
//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     setIsVisible(true);
//   }, []);

//   const cities = [
//     "New York",
//     "Los Angeles",
//     "Chicago",
//     "Houston",
//     "Phoenix",
//     "Philadelphia",
//   ];
//   const timeRanges = [
//     { value: "1month", label: "Last Month" },
//     { value: "3months", label: "Last 3 Months" },
//     { value: "1year", label: "Last Year" },
//     { value: "5years", label: "Last 5 Years" },
//   ];

//   const MetricCard: React.FC<MetricCardProps> = ({
//     title,
//     value,
//     unit,
//     icon,
//     percentage,
//   }) => (
//     <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-emerald-200/20 transform hover:scale-105 transition-all duration-300">
//       <div className="flex items-center justify-between mb-4">
//         <div className="text-gray-700 text-sm font-medium">{title}</div>
//         <div className="text-2xl">{icon}</div>
//       </div>
//       <div className="text-gray-800 text-3xl font-bold mb-2">
//         {(value ?? 0).toLocaleString()}
//         {unit}
//       </div>
//       <div className="flex items-center text-gray-600 text-sm">
//         <div
//           className={`px-2 py-1 rounded-full text-xs ${
//             percentage >= 0
//               ? "bg-emerald-100 text-emerald-700"
//               : "bg-red-100 text-red-700"
//           }`}
//         >
//           {percentage >= 0 ? "↗" : "↘"} {Math.abs(percentage)}%
//         </div>
//         <span className="ml-2">vs last period</span>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 p-6 relative overflow-hidden">
//       {/* Background Elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
//         <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
//         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-purple-300 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
//       </div>

//       <div className="max-w-7xl mx-auto relative z-10">
//         {/* Header */}
//         <div
//           className={`mb-8 transition-all duration-1000 transform ${
//             isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
//           }`}
//         >
//           <div className="flex items-center justify-between mb-6">
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
//               Urban Analytics Hub
//             </h1>
//             <div className="flex items-center gap-4">
//               <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 border border-emerald-200/20">
//                 <span className="text-gray-700 text-sm">🔴 Live Data</span>
//               </div>
//               <div className="text-gray-700">👤 Admin</div>
//             </div>
//           </div>

//           <div className="flex flex-wrap gap-4 items-center">
//             <select
//               value={selectedCity}
//               onChange={(e) => setSelectedCity(e.target.value)}
//               className="bg-white/80 backdrop-blur-sm border border-emerald-200/20 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200"
//             >
//               {cities.map((city) => (
//                 <option key={city} value={city} className="bg-white">
//                   {city}
//                 </option>
//               ))}
//             </select>
//             <select
//               value={timeRange}
//               onChange={(e) => setTimeRange(e.target.value)}
//               className="bg-white/80 backdrop-blur-sm border border-emerald-200/20 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all duration-200"
//             >
//               {timeRanges.map((range) => (
//                 <option key={range.value} value={range.value} className="bg-white">
//                   {range.label}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Main Dashboard Content */}
//         <div className={`grid grid-cols-1 gap-8 mb-8 transition-all duration-1000 delay-300 transform ${
//           isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
//         }`}>
//           <div className="transform hover:scale-105 transition-all duration-300">
//             <EnvironmentalMetrics city={selectedCity} timeRange={timeRange} />
//           </div>
//           <div className="transform hover:scale-105 transition-all duration-300">
//             <UrbanGrowthAnalysis city={selectedCity} timeRange={timeRange} />
//           </div>
//         </div>

//         <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 transition-all duration-1000 delay-500 transform ${
//           isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
//         }`}>
//           <div className="transform hover:scale-105 transition-all duration-300">
//             <ClimateRiskAssessment city={selectedCity} />
//           </div>
//           <div className="transform hover:scale-105 transition-all duration-300">
//             <SatelliteDataViewer city={selectedCity} />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;