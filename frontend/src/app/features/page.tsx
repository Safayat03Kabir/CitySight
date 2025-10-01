"use client";

import { useState, useEffect } from "react";

export default function Features() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  const coreFeatures = [
    {
      title: "Urban Heat Island Analysis",
      description: "Real-time Land Surface Temperature analysis using NASA Landsat 8/9 Collection 2 thermal data with urban/rural heat island intensity calculations.",
      icon: "🔥",
      datasets: ["Landsat 8/9 Collection 2 Level 2", "MODIS Land Cover MCD12Q1"],
      benefits: [
        "Hot season (April-June) composite analysis",
        "30-meter spatial resolution thermal mapping",
        "Automated urban vs rural temperature comparison",
        "Quality filtering with cloud masking"
      ]
    },
    {
      title: "Air Quality Monitoring",
      description: "Atmospheric pollution analysis using ESA Sentinel-5P TROPOMI Level 3 products for comprehensive air quality assessment.",
      icon: "💨",
      datasets: ["Sentinel-5P TROPOMI", "MODIS MCD12Q1"],
      benefits: [
        "NO₂, CO, SO₂ concentration mapping",
        "1113.2m spatial resolution coverage",
        "Real-time processing with 3-7 day delay",
        "Quality-filtered atmospheric observations"
      ]
    },
    {
      title: "Energy Access Proxy Analysis",
      description: "Advanced energy access assessment combining VIIRS nighttime lights with GHSL built surface data for infrastructure energy analysis.",
      icon: "⚡",
      datasets: ["VIIRS V22 Annual", "GHSL 2023A Built Surface", "JRC Global Surface Water"],
      benefits: [
        "5-level severity classification system",
        "Critical and concerning area identification",
        "Absolute energy deprivation metrics",
        "Cross-city comparison capabilities"
      ]
    },
    {
      title: "Population Density Mapping",
      description: "Demographic analysis using NASA SEDAC Gridded Population of World (GPW) v4.11 for population-based infrastructure planning.",
      icon: "🧑‍🧑‍🧒‍🧒",
      datasets: ["NASA SEDAC GPW v4.11", "CIESIN Population Density"],
      benefits: [
        "Multi-year population data (2000-2025)",
        "30 arc-second (~1km) resolution",
        "UN-adjusted census-based estimates",
        "Population density and growth analysis"
      ]
    },
    {
      title: "Infrastructure Risk Assessment",
      description: "Comprehensive infrastructure adequacy analysis combining population data with OpenStreetMap amenity mapping for service coverage evaluation.",
      icon: "🏥",
      datasets: ["NASA SEDAC GPW", "OpenStreetMap Overpass API"],
      benefits: [
        "Healthcare, emergency services, and parks analysis",
        "Population-weighted service ratios",
        "Risk level classification (optimal/warning/critical)",
        "Infrastructure gap identification"
      ]
    },
    {
      title: "Climate Resilience Analysis",
      description: "Multi-parameter environmental assessment integrating satellite observations for comprehensive climate vulnerability evaluation.",
      icon: "🌦️",
      datasets: ["MODIS Land Cover", "SMAP Soil Moisture", "NASA Earth Observations"],
      benefits: [
        "Land cover change detection",
        "Soil moisture and drought indicators",
        "Vegetation health assessment",
        "Climate adaptation planning support"
      ]
    }
  ];

  const nasaDatasets = [
    {
      name: "Landsat 8/9 Collection 2",
      description: "Land Surface Temperature thermal bands for heat island analysis",
      icon: "🛰️",
      resolution: "30m",
      coverage: "Global, 16-day repeat"
    },
    {
      name: "VIIRS DNB Annual V22",
      description: "Nighttime lights data for energy access and urbanization analysis", 
      icon: "🌃",
      resolution: "463m",
      coverage: "Global, Annual composite"
    },
    {
      name: "MODIS Terra/Aqua",
      description: "Land cover classification and environmental monitoring",
      icon: "🌍", 
      resolution: "500m",
      coverage: "Global, Daily"
    },
    {
      name: "SEDAC GPW v4.11",
      description: "Gridded Population of World for demographic analysis",
      icon: "🗺️",
      resolution: "1km",
      coverage: "Global, Multi-year"
    },
    {
      name: "Sentinel-5P TROPOMI",
      description: "Atmospheric trace gas concentrations for air quality",
      icon: "🌬️",
      resolution: "1113m",
      coverage: "Global, Daily"
    },
    {
      name: "JRC Global Surface Water",
      description: "Water occurrence and surface water dynamics",
      icon: "💧",
      resolution: "30m", 
      coverage: "Global, Multi-temporal"
    }
  ];

  const analysisCapabilities = [
    {
      title: "Multi-City Analysis", 
      description: "Pre-configured analysis for major global cities",
      cities: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "Singapore"]
    },
    {
      title: "Custom Area Analysis",
      description: "User-defined geographic bounds analysis",
      features: ["Interactive map selection", "Bounding box definition", "Custom region analysis"]
    },
    {
      title: "Time Series Analysis", 
      description: "Historical trend analysis and temporal monitoring",
      features: ["Multi-year comparisons", "Seasonal analysis", "Change detection"]
    },
    {
      title: "Real-time Processing",
      description: "On-demand satellite data processing via Google Earth Engine", 
      features: ["Live data queries", "Quality filtering", "Cloud masking"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-sky-50 py-20 px-6 md:px-20 relative overflow-hidden">
      {/* Enhanced Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating feature elements */}
        <div className="absolute top-20 left-16 text-6xl animate-float opacity-60">⭐</div>
        <div className="absolute top-36 right-20 text-4xl animate-sway opacity-50">🚀</div>
        <div className="absolute bottom-36 left-28 text-5xl animate-wave opacity-55">🔧</div>
        <div className="absolute top-68 left-1/4 text-3xl animate-twinkle opacity-45">💡</div>
        <div className="absolute bottom-52 right-32 text-5xl animate-spiral opacity-50">🎯</div>
        <div className="absolute top-92 right-1/3 text-4xl animate-zigzag opacity-40">⚡</div>
        <div className="absolute bottom-44 left-1/2 text-6xl animate-heartbeat opacity-35">💎</div>
        <div className="absolute top-56 left-3/4 text-3xl animate-float opacity-60">🛰️</div>
        <div className="absolute bottom-68 right-24 text-4xl animate-sway opacity-45">🌟</div>
        <div className="absolute top-80 left-16 text-5xl animate-wave opacity-50">🎨</div>
        
        {/* Geometric shapes for features */}
        <div className="absolute top-32 right-40 w-16 h-16 bg-teal-200 rounded-lg transform rotate-45 animate-float opacity-30"></div>
        <div className="absolute bottom-48 left-40 w-20 h-20 bg-sky-200 rounded-full animate-sway opacity-25"></div>
        <div className="absolute top-64 right-16 w-12 h-12 bg-emerald-200 rounded-full animate-twinkle opacity-35"></div>
        <div className="absolute bottom-32 right-1/4 w-14 h-14 bg-cyan-200 transform rotate-12 animate-spiral opacity-30"></div>
        <div className="absolute top-88 left-1/3 w-18 h-18 bg-teal-300 rounded-lg animate-zigzag opacity-25"></div>
        
        {/* Wave patterns */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-sky-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-4xl font-bold text-gray-800 mb-6 animate-fadeInUp">
            CitySight: NASA Space Apps Challenge 2024
          </h1>
          <div className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full mb-6">
            🚀 <span className="ml-2 font-semibold">NASA Space Apps Challenge Entry</span>
          </div>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Advanced urban environmental monitoring platform leveraging NASA Earth observation satellites, 
            Google Earth Engine processing, and cutting-edge geospatial analysis to deliver actionable insights 
            for sustainable city planning and climate resilience.
          </p>
        </div>

        {/* NASA Datasets Section */}
        <div className={`mb-20 transition-all duration-1000 delay-200 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">🛰️ NASA Earth Observation Data Sources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nasaDatasets.map((dataset, index) => (
              <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-blue-100">
                <div className="text-3xl mb-3">{dataset.icon}</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{dataset.name}</h3>
                <p className="text-gray-600 mb-4 text-sm">{dataset.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="bg-blue-100 px-3 py-1 rounded-full text-blue-700 font-medium">
                    {dataset.resolution}
                  </span>
                  <span className="text-gray-500">{dataset.coverage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Core Analysis Features */}
        <div className={`mb-20 transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">🔬 Advanced Analysis Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coreFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 group border-l-4 border-green-500">
                <div className="flex items-start mb-4">
                  <div className="text-4xl mr-4 group-hover:animate-pulse">{feature.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                  </div>
                </div>
                
                {/* Dataset Tags */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">📡 Data Sources:</h4>
                  <div className="flex flex-wrap gap-2">
                    {feature.datasets.map((dataset, idx) => (
                      <span key={idx} className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs px-3 py-1 rounded-full font-medium">
                        {dataset}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start">
                      <span className="text-green-500 mr-3 text-lg">•</span>
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Capabilities */}
        <div className={`mb-20 transition-all duration-1000 delay-400 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">⚡ Platform Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analysisCapabilities.map((capability, index) => (
              <div key={index} className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl shadow-lg p-6 text-center border border-teal-100 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{capability.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{capability.description}</p>
                
                {capability.cities && (
                  <div className="space-y-1">
                    {capability.cities.slice(0, 3).map((city, idx) => (
                      <div key={idx} className="text-xs text-gray-500">{city}</div>
                    ))}
                    <div className="text-xs text-teal-600 font-medium">+{capability.cities.length - 3} more cities</div>
                  </div>
                )}
                
                {capability.features && (
                  <div className="space-y-1">
                    {capability.features.map((featureItem, idx) => (
                      <div key={idx} className="text-xs text-gray-600 flex items-center justify-center">
                        <span className="w-1 h-1 bg-teal-400 rounded-full mr-2"></span>
                        {featureItem}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Technical Architecture */}
        <div className={`mb-20 transition-all duration-1000 delay-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">🏗️ Technical Implementation</h2>
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Backend */}
              <div className="text-center">
                <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">⚙️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Backend Processing</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• Node.js + Express API</div>
                  <div>• Google Earth Engine Integration</div>
                  <div>• Real-time Satellite Data Processing</div>
                  <div>• RESTful API Architecture</div>
                </div>
              </div>

              {/* Data Processing */}
              <div className="text-center">
                <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🛰️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Data Processing</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• Cloud-based GEE Processing</div>
                  <div>• Quality Filtering & Masking</div>
                  <div>• Temporal Compositing</div>
                  <div>• Multi-spectral Analysis</div>
                </div>
              </div>

              {/* Frontend */}
              <div className="text-center">
                <div className="bg-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🖥️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Frontend Interface</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>• React + TypeScript</div>
                  <div>• Interactive Leaflet Maps</div>
                  <div>• Real-time Visualization</div>
                  <div>• Responsive Design</div>
                </div>
              </div>
              
            </div>

            {/* Data Flow */}
            <div className="mt-12 bg-white rounded-xl p-6 shadow-inner">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">📊 Data Processing Pipeline</h3>
              <div className="flex items-center justify-between text-sm">
                <div className="text-center flex-1">
                  <div className="bg-yellow-100 p-3 rounded-lg mb-2">
                    <span className="text-yellow-700 font-medium">🛰️ NASA Satellites</span>
                  </div>
                  <div className="text-gray-600">Raw Earth Observation Data</div>
                </div>
                <div className="mx-4 text-2xl text-gray-400">→</div>
                <div className="text-center flex-1">
                  <div className="bg-green-100 p-3 rounded-lg mb-2">
                    <span className="text-green-700 font-medium">⚡ Google Earth Engine</span>
                  </div>
                  <div className="text-gray-600">Cloud Processing & Analysis</div>
                </div>
                <div className="mx-4 text-2xl text-gray-400">→</div>
                <div className="text-center flex-1">
                  <div className="bg-blue-100 p-3 rounded-lg mb-2">
                    <span className="text-blue-700 font-medium">🌐 CitySight Platform</span>
                  </div>
                  <div className="text-gray-600">Interactive Visualizations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
