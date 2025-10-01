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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 px-6 md:px-20 py-20 relative overflow-hidden">
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-green-400 to-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-emerald-300 to-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
        
        {/* Variety of animated elements with moon, stars and different styles */}
        <div className="absolute top-20 left-1/4 w-4 h-4 bg-green-400 rounded-full animate-sway opacity-60"></div>
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-blue-400 rounded-full animate-bounce-gentle animation-delay-1000 opacity-60"></div>
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-emerald-400 rounded-full animate-zigzag animation-delay-2000 opacity-60"></div>
        <div className="absolute bottom-20 right-1/3 w-5 h-5 bg-cyan-400 rounded-full animate-heartbeat animation-delay-3000 opacity-60"></div>
        
        {/* Moon and star elements */}
        <div className="absolute top-24 right-20 w-8 h-8 bg-gradient-to-br from-blue-200 to-blue-400 rounded-full animate-moon-glow animation-delay-1000 opacity-70 shadow-lg">
          <div className="absolute inset-1 bg-gradient-to-br from-blue-100 to-blue-300 rounded-full"></div>
        </div>
        
        {/* Twinkling stars */}
        <div className="absolute top-16 left-16 text-yellow-300 text-lg animate-twinkle">⭐</div>
        <div className="absolute top-40 right-32 text-yellow-400 text-sm animate-twinkle animation-delay-1000">✨</div>
        <div className="absolute bottom-32 left-24 text-yellow-300 text-base animate-twinkle animation-delay-2000">⭐</div>
        <div className="absolute bottom-16 right-16 text-yellow-400 text-lg animate-twinkle animation-delay-3000">✨</div>
        <div className="absolute top-52 left-32 text-yellow-300 text-xs animate-twinkle animation-delay-1000">⭐</div>
        
        {/* Spiral moving elements */}
        <div className="absolute top-32 left-1/2 w-3 h-3 bg-green-400 rounded-full animate-spiral animation-delay-2000 opacity-50"></div>
        <div className="absolute bottom-40 right-1/2 w-4 h-4 bg-blue-400 rounded-full animate-spiral animation-delay-3000 opacity-50"></div>
        
        {/* Wave elements with different animations */}
        <div className="absolute top-32 right-16 w-8 h-32 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full opacity-40 animate-wave animation-delay-1000 transform rotate-12"></div>
        <div className="absolute top-64 left-20 w-6 h-24 bg-gradient-to-b from-blue-400 to-cyan-500 rounded-full opacity-40 animate-bounce-gentle animation-delay-2000 transform -rotate-12"></div>
        <div className="absolute bottom-40 right-32 w-10 h-28 bg-gradient-to-b from-emerald-400 to-green-500 rounded-full opacity-40 animate-zigzag animation-delay-3000 transform rotate-6"></div>
        <div className="absolute bottom-60 left-16 w-7 h-20 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full opacity-40 animate-sway animation-delay-1000 transform -rotate-6"></div>
        
        {/* Diamond and triangle shapes */}
        <div className="absolute top-48 left-1/2 w-6 h-6 bg-gradient-to-br from-green-300 to-emerald-400 opacity-40 animate-heartbeat animation-delay-2000 transform rotate-45"></div>
        <div className="absolute bottom-32 right-1/2 w-8 h-8 bg-gradient-to-br from-blue-300 to-cyan-400 opacity-40 animate-twinkle animation-delay-3000 transform rotate-45 rounded-sm"></div>
        
        {/* Large floating waves with variety */}
        <div className="absolute top-16 right-1/3 w-12 h-40 bg-gradient-to-b from-green-300/50 to-blue-300/50 rounded-full opacity-50 animate-sway animation-delay-1000 transform rotate-30"></div>
        <div className="absolute bottom-16 left-1/4 w-14 h-36 bg-gradient-to-b from-blue-300/50 to-emerald-300/50 rounded-full opacity-50 animate-bounce-gentle animation-delay-2000 transform -rotate-30"></div>
        
        {/* Cloud-like elements */}
        <div className="absolute top-28 left-1/3 w-16 h-8 bg-gradient-to-r from-green-200/30 to-blue-200/30 rounded-full opacity-60 animate-float animation-delay-2000"></div>
        <div className="absolute bottom-24 right-1/4 w-20 h-10 bg-gradient-to-r from-blue-200/30 to-emerald-200/30 rounded-full opacity-60 animate-sway animation-delay-3000"></div>
      </div>

      {/* Earth Animation GIF */}
      <div className={`text-center mb-8 relative z-10 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="relative mx-auto w-64 h-64 md:w-80 md:h-80 mb-6">
          <img 
            src="/earth-animation.gif" 
            alt="Earth from Space Animation"
            className="w-full h-full object-cover rounded-full shadow-2xl ring-4 ring-blue-200/50 hover:ring-blue-300/70 transition-all duration-300"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/10 to-transparent"></div>
        </div>
      </div>

      <div className={`text-center mb-12 relative z-10 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="w-32 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto mb-6 rounded-full"></div>
        <p className={`text-2xl text-gray-700 mb-6 font-medium transition-all duration-1000 delay-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          Smart Urban Planning with NASA Earth Observation Data
        </p>
        <p className={`text-xl text-gray-600 mb-8 max-w-4xl leading-relaxed transition-all duration-1000 delay-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          Harness the power of satellite data to develop sustainable city growth strategies that protect our environment while enhancing quality of life for urban communities.
        </p>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl relative z-10 transition-all duration-1000 delay-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-500 border border-green-200/50 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10">
            <span className="text-green-600 text-3xl animate-bounce">🌱</span>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-gray-900 transition-colors duration-300 relative z-10">Environmental Monitoring</h2>
          <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed relative z-10">
            Real-time monitoring of air quality, vegetation health, and urban heat islands using NASA satellite data to ensure sustainable development.
          </p>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-500 delay-100 border border-blue-200/50 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10">
            <span className="text-blue-600 text-3xl animate-bounce animation-delay-1000">🏙️</span>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-gray-900 transition-colors duration-300 relative z-10">Urban Growth Analysis</h2>
          <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed relative z-10">
            Analyze urban expansion patterns, infrastructure development, and population density to guide smart city planning decisions.
          </p>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-500 delay-200 border border-purple-200/50 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10">
            <span className="text-purple-600 text-3xl animate-bounce animation-delay-2000">🛡️</span>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-gray-900 transition-colors duration-300 relative z-10">Climate Resilience</h2>
          <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed relative z-10">
            Build climate-adaptive strategies using weather patterns, flood risk assessment, and natural disaster preparedness data.
          </p>
        </div>
      </div>

      <div className={`mt-12 flex gap-6 relative z-10 transition-all duration-1000 delay-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <button 
          onClick={handleExploreDashboard}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-green-500/30 relative overflow-hidden group"
        >
          <span className="relative z-10">Explore More</span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        </button>
        <button 
          onClick={handleLearnMore}
          className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-blue-500/30 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          <span className="relative z-10">Learn More</span>
        </button>
      </div>

      {/* Additional Context Sectio */}

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
        <h2 className="text-4xl font-black text-center mb-12 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">How CitySight Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-500 border border-green-200/50 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10">
              <span className="text-4xl animate-bounce">📡</span>
            </div>
            <div className="w-8 h-1 bg-gradient-to-r from-green-500 to-emerald-500 mx-auto mb-4 rounded-full"></div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center relative z-10">1. Data Collection</h3>
            <p className="text-gray-600 leading-relaxed text-center relative z-10">
              Continuous monitoring through satellite imagery, IoT sensors, and ground-based stations collecting environmental and urban data.
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-500 delay-100 border border-blue-200/50 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10">
              <span className="text-4xl animate-bounce animation-delay-1000">🧠</span>
            </div>
            <div className="w-8 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto mb-4 rounded-full"></div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center relative z-10">2. AI Analysis</h3>
            <p className="text-gray-600 leading-relaxed text-center relative z-10">
              Advanced machine learning algorithms process vast datasets to identify patterns, trends, and potential risks in urban environments.
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl hover:scale-105 transition-all duration-500 delay-200 border border-purple-200/50 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg relative z-10">
              <span className="text-4xl animate-bounce animation-delay-2000">📊</span>
            </div>
            <div className="w-8 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto mb-4 rounded-full"></div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center relative z-10">3. Actionable Insights</h3>
            <p className="text-gray-600 leading-relaxed text-center relative z-10">
              Transform complex data into clear visualizations and recommendations for sustainable urban planning and policy decisions.
            </p>
          </div>
        </div>
      </div>

      {/* NASA Data Sources Section */}
      <div className={`mt-16 mb-20 w-full max-w-4xl transition-all duration-1000 delay-2000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
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
    </div>
  );
}
