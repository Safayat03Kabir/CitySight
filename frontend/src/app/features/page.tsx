"use client";

import { useState, useEffect } from "react";

export default function Features() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);
  const features = [
    {
      title: "Real-time Environmental Monitoring",
      description: "Monitor air quality, temperature, humidity, and vegetation health using NASA satellite data and ground sensors.",
      icon: "🌍",
      benefits: [
        "24/7 environmental data collection",
        "Early warning system for pollution events",
        "Integration with NASA Earth observation systems",
        "Automated alerts and notifications"
      ]
    },
    {
      title: "Urban Growth Analysis",
      description: "Analyze urban expansion patterns, infrastructure development, and land use changes over time.",
      icon: "🏗️",
      benefits: [
        "Historical urban development tracking",
        "Population density analysis",
        "Infrastructure capacity assessment",
        "Smart growth pattern identification"
      ]
    },
    {
      title: "Climate Risk Assessment",
      description: "Evaluate climate vulnerabilities and develop adaptation strategies for urban resilience.",
      icon: "⛈️",
      benefits: [
        "Flood risk mapping and analysis",
        "Heat island effect monitoring",
        "Extreme weather preparedness",
        "Climate adaptation planning"
      ]
    },
    {
      title: "Satellite Data Integration",
      description: "Access and analyze multiple satellite data sources for comprehensive city insights.",
      icon: "🛰️",
      benefits: [
        "Landsat and Sentinel imagery",
        "MODIS environmental data",
        "Real-time change detection",
        "Multi-spectral analysis tools"
      ]
    },
    {
      title: "Smart Planning Tools",
      description: "AI-powered tools for optimizing urban development and infrastructure planning.",
      icon: "🧠",
      benefits: [
        "Land use optimization algorithms",
        "Traffic flow simulation",
        "Green infrastructure planning",
        "Sustainable development scoring"
      ]
    },
    {
      title: "Interactive Dashboards",
      description: "Comprehensive visualization tools for data-driven decision making.",
      icon: "📊",
      benefits: [
        "Customizable monitoring dashboards",
        "Real-time data visualization",
        "Trend analysis and forecasting",
        "Export and reporting capabilities"
      ]
    }
  ];

  const caseStudies = [
    {
      city: "Miami, FL",
      challenge: "Sea level rise and flooding",
      solution: "Implemented green infrastructure and early warning systems",
      result: "30% reduction in flood damage, improved emergency response time",
      image: "🌊"
    },
    {
      city: "Phoenix, AZ",
      challenge: "Urban heat island effect",
      solution: "Cool roof programs and urban forest expansion",
      result: "4°C temperature reduction in target areas, 20% energy savings",
      image: "🌡️"
    },
    {
      city: "Portland, OR",
      challenge: "Air quality management",
      solution: "Real-time monitoring and traffic optimization",
      result: "25% improvement in air quality index, reduced respiratory issues",
      image: "💨"
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
            CitySight Features & Capabilities
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Leverage the power of NASA Earth observation data and advanced analytics to build sustainable, resilient cities that thrive in the face of climate change.
          </p>
        </div>

        {/* Core Features */}
        <div className={`mb-20 transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 group border-t-4 border-green-500" style={{animationDelay: `${index * 100}ms`}}>
                <div className="text-4xl mb-4 group-hover:animate-bounce">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4 group-hover:text-green-600 transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2 animate-pulse">✓</span>
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
