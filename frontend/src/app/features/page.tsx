"use client";

export default function Features() {
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
    <div className="min-h-screen bg-gray-50 py-20 px-6 md:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            CitySight Features & Capabilities
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Leverage the power of NASA Earth observation data and advanced analytics to build sustainable, resilient cities that thrive in the face of climate change.
          </p>
        </div>

        {/* Core Features */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Core Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* NASA Data Sources */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">NASA Data Sources</h2>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🛰️</div>
                <h4 className="font-semibold text-gray-800 mb-2">Landsat</h4>
                <p className="text-sm text-gray-600">Land surface imaging and change detection</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🌍</div>
                <h4 className="font-semibold text-gray-800 mb-2">MODIS</h4>
                <p className="text-sm text-gray-600">Environmental monitoring and climate data</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🌊</div>
                <h4 className="font-semibold text-gray-800 mb-2">Sentinel</h4>
                <p className="text-sm text-gray-600">High-resolution Earth observation</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="font-semibold text-gray-800 mb-2">GPM</h4>
                <p className="text-sm text-gray-600">Precipitation and weather patterns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Case Studies */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Success Stories</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {caseStudies.map((study, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-4xl text-center mb-4">{study.image}</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{study.city}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-red-600 mb-1">Challenge:</h4>
                    <p className="text-sm text-gray-700">{study.challenge}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-600 mb-1">Solution:</h4>
                    <p className="text-sm text-gray-700">{study.solution}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-green-600 mb-1">Result:</h4>
                    <p className="text-sm text-gray-700">{study.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Specifications */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Technical Specifications</h2>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Data Processing</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Real-time satellite data ingestion</li>
                  <li>• Cloud-based processing infrastructure</li>
                  <li>• Machine learning algorithms for pattern recognition</li>
                  <li>• Automated quality control and validation</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-4">System Integration</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• RESTful API for third-party integration</li>
                  <li>• Compatible with existing city databases</li>
                  <li>• Mobile-responsive web interface</li>
                  <li>• Scalable architecture for growing cities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-green-600 to-blue-600 rounded-xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your City?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join cities worldwide using CitySight to build sustainable, resilient urban environments.
          </p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Request Demo
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
