"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleExploreDashboard = () => {
    router.push('/dashboard');
  };

  const handleLearnMore = () => {
    router.push('/features');
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 px-6 md:px-20 py-20">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-6">
          <span className="text-green-600">City</span><span className="text-blue-600">Sight</span>
        </h1>
        <p className="text-xl text-gray-600 mb-4">
          Smart Urban Planning with NASA Earth Observation Data
        </p>
        <p className="text-lg text-gray-700 mb-8 max-w-3xl">
          Harness the power of satellite data to develop sustainable city growth strategies that protect our environment while enhancing quality of life for urban communities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border-t-4 border-green-500">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-green-600 text-2xl">🌱</span>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Environmental Monitoring</h2>
          <p className="text-gray-600">
            Real-time monitoring of air quality, vegetation health, and urban heat islands using NASA satellite data to ensure sustainable development.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border-t-4 border-blue-500">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-blue-600 text-2xl">🏙️</span>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Urban Growth Analysis</h2>
          <p className="text-gray-600">
            Analyze urban expansion patterns, infrastructure development, and population density to guide smart city planning decisions.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 border-t-4 border-purple-500">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <span className="text-purple-600 text-2xl">🛡️</span>
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Climate Resilience</h2>
          <p className="text-gray-600">
            Build climate-adaptive strategies using weather patterns, flood risk assessment, and natural disaster preparedness data.
          </p>
        </div>
      </div>

      <div className="mt-12 flex gap-4">
        <button 
          onClick={handleExploreDashboard}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
        >
          Explore Dashboard
        </button>
        <button 
          onClick={handleLearnMore}
          className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
        >
          Learn More
        </button>
      </div>
    </div>
  );
}
