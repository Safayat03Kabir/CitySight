"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleExploreDashboard = () => {
    router.push('/dashboard');
  };

  const handleLearnMore = () => {
    router.push('/features');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 px-6 md:px-20 py-20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className={`text-center mb-12 relative z-10 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-800 mb-6 animate-fadeInUp">
          <span className="text-green-600 hover:text-green-500 transition-colors duration-300">City</span>
          <span className="text-blue-600 hover:text-blue-500 transition-colors duration-300">Sight</span>
        </h1>
        <p className={`text-xl text-gray-600 mb-4 transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          Smart Urban Planning with NASA Earth Observation Data
        </p>
        <p className={`text-lg text-gray-700 mb-8 max-w-3xl transition-all duration-1000 delay-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          Harness the power of satellite data to develop sustainable city growth strategies that protect our environment while enhancing quality of life for urban communities.
        </p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl relative z-10 transition-all duration-1000 delay-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 border-t-4 border-green-500 group">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors duration-300">
            <span className="text-green-600 text-2xl animate-bounce">🌱</span>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-gray-900 transition-colors duration-300">Environmental Monitoring</h2>
          <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
            Real-time monitoring of air quality, vegetation health, and urban heat islands using NASA satellite data to ensure sustainable development.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 delay-100 border-t-4 border-blue-500 group">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors duration-300">
            <span className="text-blue-600 text-2xl animate-bounce animation-delay-1000">🏙️</span>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-gray-900 transition-colors duration-300">Urban Growth Analysis</h2>
          <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
            Analyze urban expansion patterns, infrastructure development, and population density to guide smart city planning decisions.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 delay-200 border-t-4 border-purple-500 group">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors duration-300">
            <span className="text-purple-600 text-2xl animate-bounce animation-delay-2000">🛡️</span>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-gray-900 transition-colors duration-300">Climate Resilience</h2>
          <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
            Build climate-adaptive strategies using weather patterns, flood risk assessment, and natural disaster preparedness data.
          </p>
        </div>
      </div>

      <div className={`mt-12 flex gap-4 relative z-10 transition-all duration-1000 delay-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <button 
          onClick={handleExploreDashboard}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-green-500/25"
        >
          Explore Dashboard
        </button>
        <button 
          onClick={handleLearnMore}
          className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-blue-500/25"
        >
          Learn More
        </button>
      </div>

      {/* Additional Context Sections */}
      
      {/* Statistics Section */}
      <div className={`mt-20 w-full max-w-6xl transition-all duration-1000 delay-1200 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-green-200/50">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Global Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-green-600 mb-2 animate-pulse">500+</div>
              <div className="text-gray-700 font-medium">Cities Monitored</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-blue-600 mb-2 animate-pulse animation-delay-1000">15TB</div>
              <div className="text-gray-700 font-medium">Daily Data Processed</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-purple-600 mb-2 animate-pulse animation-delay-2000">99.9%</div>
              <div className="text-gray-700 font-medium">Uptime Reliability</div>
            </div>
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold text-green-600 mb-2 animate-pulse animation-delay-4000">25%</div>
              <div className="text-gray-700 font-medium">Average Emission Reduction</div>
            </div>
          </div>
        </div>
      </div>

      {/* NASA Partnership Section */}
      <div className={`mt-16 w-full max-w-6xl transition-all duration-1000 delay-1400 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="text-6xl animate-float">🛰️</div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-4">Powered by NASA Earth Science</h2>
              <p className="text-lg opacity-90 mb-4">
                CitySight leverages cutting-edge satellite technology and Earth observation data from NASA's extensive satellite constellation, including Landsat, MODIS, and Sentinel missions.
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">Landsat 8/9</span>
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">MODIS Terra/Aqua</span>
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">Sentinel-2</span>
                <span className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">GPM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className={`mt-16 w-full max-w-6xl transition-all duration-1000 delay-1600 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How CitySight Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center group">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl animate-bounce">📡</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">1. Data Collection</h3>
            <p className="text-gray-600">
              Continuous monitoring through satellite imagery, IoT sensors, and ground-based stations collecting environmental and urban data.
            </p>
          </div>
          <div className="text-center group">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl animate-bounce animation-delay-1000">🧠</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">2. AI Analysis</h3>
            <p className="text-gray-600">
              Advanced machine learning algorithms process vast datasets to identify patterns, trends, and potential risks in urban environments.
            </p>
          </div>
          <div className="text-center group">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
              <span className="text-3xl animate-bounce animation-delay-2000">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">3. Actionable Insights</h3>
            <p className="text-gray-600">
              Transform complex data into clear visualizations and recommendations for sustainable urban planning and policy decisions.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className={`mt-16 w-full max-w-6xl transition-all duration-1000 delay-1800 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">What Urban Planners Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
            <div className="mb-4">
              <div className="flex text-yellow-400 mb-2">
                <span>⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-700 italic">
                "CitySight has revolutionized how we approach urban development. The real-time environmental data helps us make informed decisions that benefit both our community and the environment."
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-green-600 font-bold">SM</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Sarah Martinez</div>
                <div className="text-sm text-gray-600">Chief Urban Planner, Austin</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500">
            <div className="mb-4">
              <div className="flex text-yellow-400 mb-2">
                <span>⭐⭐⭐⭐⭐</span>
              </div>
              <p className="text-gray-700 italic">
                "The climate risk assessment features have been invaluable for our coastal management strategy. We've reduced flood damage by 40% using CitySight's predictive analytics."
              </p>
            </div>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 font-bold">DL</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Dr. Lisa Chen</div>
                <div className="text-sm text-gray-600">Environmental Director, Miami</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className={`mt-16 mb-20 w-full max-w-4xl transition-all duration-1000 delay-2000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl shadow-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your City?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of cities worldwide using CitySight to build sustainable, resilient urban environments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Schedule Demo
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 transition-all duration-300 transform hover:scale-105">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
