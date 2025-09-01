"use client";

import { useState, useEffect } from "react";

export default function Planning() {
  const [selectedScenario, setSelectedScenario] = useState("sustainable");
  const [timeHorizon, setTimeHorizon] = useState("2030");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scenarios = [
    {
      id: "sustainable",
      name: "Sustainable Growth",
      description: "Emphasizes green infrastructure and environmental protection",
      metrics: {
        greenSpace: "+25%",
        carbonReduction: "-30%",
        airQuality: "+40%",
        energyEfficiency: "+35%"
      }
    },
    {
      id: "economic",
      name: "Economic Development",
      description: "Focuses on economic growth and job creation",
      metrics: {
        jobCreation: "+45%",
        revenue: "+60%",
        population: "+20%",
        infrastructure: "+50%"
      }
    },
    {
      id: "resilient",
      name: "Climate Resilient",
      description: "Prioritizes climate adaptation and disaster preparedness",
      metrics: {
        floodProtection: "+80%",
        heatReduction: "-25%",
        emergencyPrep: "+90%",
        adaptation: "+70%"
      }
    }
  ];

  const planningTools = [
    {
      name: "Land Use Optimizer",
      description: "AI-powered tool to optimize land allocation based on multiple criteria",
      status: "Available",
      icon: "🗺️"
    },
    {
      name: "Climate Impact Simulator",
      description: "Simulate future climate scenarios and their urban impacts",
      status: "Available",
      icon: "🌡️"
    },
    {
      name: "Green Infrastructure Planner",
      description: "Design sustainable infrastructure solutions",
      status: "Available",
      icon: "🌱"
    },
    {
      name: "Population Growth Predictor",
      description: "Forecast demographic changes and housing needs",
      status: "Beta",
      icon: "👥"
    }
  ];

  const activeProjects = [
    {
      id: 1,
      name: "Riverfront Redevelopment",
      area: "Downtown Waterfront",
      progress: 75,
      phase: "Construction",
      budget: "$125M",
      completion: "Q2 2025",
      sustainability: "High"
    },
    {
      id: 2,
      name: "Green Corridor Initiative",
      area: "City-wide",
      progress: 40,
      phase: "Planning",
      budget: "$80M",
      completion: "Q4 2026",
      sustainability: "Very High"
    },
    {
      id: 3,
      name: "Smart Transit Hub",
      area: "Central District",
      progress: 90,
      phase: "Final Testing",
      budget: "$200M",
      completion: "Q1 2025",
      sustainability: "Medium"
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

  const getSustainabilityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "very high": return "bg-green-500";
      case "high": return "bg-green-400";
      case "medium": return "bg-yellow-400";
      case "low": return "bg-red-400";
      default: return "bg-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-sky-50 p-6 relative overflow-hidden">
      {/* Enhanced Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating planning elements */}
        <div className="absolute top-16 left-20 text-6xl animate-float opacity-60">🏗️</div>
        <div className="absolute top-40 right-16 text-4xl animate-sway opacity-50">🏙️</div>
        <div className="absolute bottom-32 left-24 text-5xl animate-wave opacity-55">📐</div>
        <div className="absolute top-64 left-1/4 text-3xl animate-twinkle opacity-45">🗺️</div>
        <div className="absolute bottom-56 right-28 text-5xl animate-spiral opacity-50">🌱</div>
        <div className="absolute top-88 right-1/3 text-4xl animate-zigzag opacity-40">⚙️</div>
        <div className="absolute bottom-40 left-1/2 text-6xl animate-heartbeat opacity-35">🏡</div>
        <div className="absolute top-52 left-3/4 text-3xl animate-float opacity-60">📊</div>
        <div className="absolute bottom-72 right-20 text-4xl animate-sway opacity-45">🌳</div>
        <div className="absolute top-76 left-12 text-5xl animate-wave opacity-50">🚇</div>
        
        {/* Geometric shapes for planning */}
        <div className="absolute top-28 right-36 w-16 h-16 bg-teal-200 rounded-lg transform rotate-45 animate-float opacity-30"></div>
        <div className="absolute bottom-44 left-36 w-20 h-20 bg-sky-200 rounded-full animate-sway opacity-25"></div>
        <div className="absolute top-60 right-12 w-12 h-12 bg-emerald-200 rounded-full animate-twinkle opacity-35"></div>
        <div className="absolute bottom-28 right-1/4 w-14 h-14 bg-cyan-200 transform rotate-12 animate-spiral opacity-30"></div>
        <div className="absolute top-84 left-1/3 w-18 h-18 bg-teal-300 rounded-lg animate-zigzag opacity-25"></div>
        
        {/* Wave patterns */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className={`mb-8 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-3xl font-bold text-gray-800 mb-4 animate-fadeInUp">Urban Planning & Development</h1>
          <p className="text-gray-600">
            Design sustainable city growth strategies using NASA Earth observation data and predictive modeling.
          </p>
        </div>

        {/* Scenario Planning */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Development Scenarios</h2>
            <select 
              value={timeHorizon} 
              onChange={(e) => setTimeHorizon(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="2030">2030 Projection</option>
              <option value="2040">2040 Projection</option>
              <option value="2050">2050 Projection</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {scenarios.map((scenario) => (
              <div 
                key={scenario.id}
                className={`bg-white rounded-lg shadow-md p-6 cursor-pointer border-2 transition-colors ${
                  selectedScenario === scenario.id ? 'border-blue-500' : 'border-transparent'
                }`}
                onClick={() => setSelectedScenario(scenario.id)}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{scenario.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{scenario.description}</p>
                
                <div className="space-y-2">
                  {Object.entries(scenario.metrics).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className={`text-sm font-medium ${
                        value.startsWith('+') ? 'text-green-600' : 
                        value.startsWith('-') ? 'text-blue-600' : 'text-gray-800'
                      }`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Planning Tools */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Planning Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {planningTools.map((tool, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{tool.icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium text-gray-800">{tool.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(tool.status)}`}>
                        {tool.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
                      Launch Tool
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Projects */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Development Projects</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Area
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phase
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sustainability
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activeProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-500">Completion: {project.completion}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.area}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.phase}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {project.budget}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getSustainabilityColor(project.sustainability)}`}>
                          {project.sustainability}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                        <button className="text-green-600 hover:text-green-900">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Planning Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md transition-colors">
              Create New Project
            </button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md transition-colors">
              Run Scenario Analysis
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-md transition-colors">
              Generate Master Plan
            </button>
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-md transition-colors">
              Export Planning Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
