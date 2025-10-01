"use client";

import { useState, useEffect } from "react";
import BuildHomeRiskTool from "../../component/BuildHomeRiskTool";
import ClimateResilienceAnalyzer from "../../component/ClimateResilienceAnalyzer";

export default function Planning() {
  const [isVisible, setIsVisible] = useState(false);
  const [showRiskTool, setShowRiskTool] = useState(false);
  const [showClimateAnalyzer, setShowClimateAnalyzer] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const planningTools = [
    {
      id: "build-home-risk",
      name: "Build Home Risk Assessment",
      description: "Analyze environmental and geological risks for home construction using satellite data",
      icon: "🏠",
      status: "Available",
      category: "Risk Analysis"
    },
    {
      id: "land-use-optimizer",
      name: "Climate Resilience Analyzer", 
      description: "Assess climate risks, vulnerabilities, and adaptation strategies using real environmental data",
      icon: "🗺️",
      status: "Available",
      category: "Climate Resilience"
    }
    
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available": return "bg-green-100 text-green-800";
      case "beta": return "bg-blue-100 text-blue-800";
      case "coming soon": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleToolClick = (toolId: string) => {
    switch (toolId) {
      case "build-home-risk":
        setShowRiskTool(true);
        break;
      case "land-use-optimizer":
        setShowClimateAnalyzer(true);
        break;
      default:
        // Handle other tools
        console.log(`Opening tool: ${toolId}`);
        break;
    }
  };

  if (showRiskTool) {
    return <BuildHomeRiskTool onClose={() => setShowRiskTool(false)} />;
  }

  if (showClimateAnalyzer) {
    return <ClimateResilienceAnalyzer onClose={() => setShowClimateAnalyzer(false)} />;
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating tool elements */}
        <div className="absolute top-16 left-20 text-6xl animate-float opacity-60">🛠️</div>
        <div className="absolute top-40 right-16 text-4xl animate-sway opacity-50">�</div>
        <div className="absolute bottom-32 left-24 text-5xl animate-wave opacity-55">�</div>
        <div className="absolute top-64 left-1/4 text-3xl animate-twinkle opacity-45">🌡️</div>
        <div className="absolute bottom-56 right-28 text-5xl animate-spiral opacity-50">🗺️</div>
        <div className="absolute top-88 right-1/3 text-4xl animate-zigzag opacity-40">⚙️</div>
        <div className="absolute bottom-40 left-1/2 text-6xl animate-heartbeat opacity-35">📈</div>
        <div className="absolute top-52 left-3/4 text-3xl animate-float opacity-60">🌱</div>
        <div className="absolute bottom-72 right-20 text-4xl animate-sway opacity-45">🚨</div>
        <div className="absolute top-76 left-12 text-5xl animate-wave opacity-50">�</div>
        
        {/* Geometric shapes */}
        <div className="absolute top-28 right-36 w-16 h-16 bg-purple-200 rounded-lg transform rotate-45 animate-float opacity-30"></div>
        <div className="absolute bottom-44 left-36 w-20 h-20 bg-indigo-200 rounded-full animate-sway opacity-25"></div>
        <div className="absolute top-60 right-12 w-12 h-12 bg-blue-200 rounded-full animate-twinkle opacity-35"></div>
        <div className="absolute bottom-28 right-1/4 w-14 h-14 bg-violet-200 transform rotate-12 animate-spiral opacity-30"></div>
        <div className="absolute top-84 left-1/3 w-18 h-18 bg-purple-300 rounded-lg animate-zigzag opacity-25"></div>
        
        {/* Wave patterns */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className={`mb-8 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-4xl font-bold text-gray-800 mb-4 animate-fadeInUp">🛠️ Planning Tools</h1>
          <p className="text-gray-600 text-lg">
            Advanced tools for urban planning, risk assessment, and sustainable development using NASA Earth observation data and AI-powered analytics.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {planningTools.map((tool) => (
              <div 
                key={tool.id} 
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-gray-100"
                onClick={() => handleToolClick(tool.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{tool.icon}</div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(tool.status)}`}>
                      {tool.status}
                    </span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                      {tool.category}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{tool.name}</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{tool.description}</p>
                
                <div className="flex items-center justify-between">
                  <button 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                    disabled={tool.status === "Coming Soon"}
                  >
                    {tool.status === "Coming Soon" ? "Coming Soon" : "Launch Tool"}
                  </button>
                  <div className="text-xs text-gray-500">
                    {tool.status === "Available" && "Ready to use"}
                    {tool.status === "Beta" && "Beta version"}
                    {tool.status === "Coming Soon" && "In development"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
