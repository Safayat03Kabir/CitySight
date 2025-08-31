"use client";

interface EnvironmentalMetricsProps {
  city: string;
  timeRange: string;
}

export default function EnvironmentalMetrics({ city, timeRange }: EnvironmentalMetricsProps) {
  // Mock data - in real implementation, this would come from NASA APIs
  const mockData = {
    airQuality: {
      value: 85,
      status: "Good",
      trend: "improving",
      change: "+5%"
    },
    vegetation: {
      value: 72,
      status: "Healthy",
      trend: "stable",
      change: "+2%"
    },
    heatIsland: {
      value: 3.2,
      status: "Moderate",
      trend: "worsening",
      change: "+0.8°C"
    },
    carbonEmissions: {
      value: 45.6,
      status: "High",
      trend: "improving",
      change: "-8%"
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "good":
      case "healthy": return "text-green-600 bg-green-100";
      case "moderate": return "text-yellow-600 bg-yellow-100";
      case "high":
      case "poor": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving": return "📈";
      case "worsening": return "📉";
      case "stable": return "➡️";
      default: return "📊";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Environmental Metrics - {city}</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Air Quality */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-gray-600">Air Quality Index</h3>
            <span className="text-xl">{getTrendIcon(mockData.airQuality.trend)}</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-800">{mockData.airQuality.value}</div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(mockData.airQuality.status)}`}>
                {mockData.airQuality.status}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600 font-medium">{mockData.airQuality.change}</div>
              <div className="text-xs text-gray-500">vs last period</div>
            </div>
          </div>
        </div>

        {/* Vegetation Health */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-gray-600">Vegetation Health</h3>
            <span className="text-xl">{getTrendIcon(mockData.vegetation.trend)}</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-800">{mockData.vegetation.value}%</div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(mockData.vegetation.status)}`}>
                {mockData.vegetation.status}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600 font-medium">{mockData.vegetation.change}</div>
              <div className="text-xs text-gray-500">vs last period</div>
            </div>
          </div>
        </div>

        {/* Urban Heat Island */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-gray-600">Heat Island Effect</h3>
            <span className="text-xl">{getTrendIcon(mockData.heatIsland.trend)}</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-800">{mockData.heatIsland.value}°C</div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(mockData.heatIsland.status)}`}>
                {mockData.heatIsland.status}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-red-600 font-medium">{mockData.heatIsland.change}</div>
              <div className="text-xs text-gray-500">vs last period</div>
            </div>
          </div>
        </div>

        {/* Carbon Emissions */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-sm font-medium text-gray-600">CO₂ Emissions</h3>
            <span className="text-xl">{getTrendIcon(mockData.carbonEmissions.trend)}</span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-800">{mockData.carbonEmissions.value}kt</div>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(mockData.carbonEmissions.status)}`}>
                {mockData.carbonEmissions.status}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-600 font-medium">{mockData.carbonEmissions.change}</div>
              <div className="text-xs text-gray-500">vs last period</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Key Insights</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Air quality has improved due to reduced industrial emissions</li>
          <li>• Urban vegetation coverage is stable with new park developments</li>
          <li>• Heat island effect requires attention in downtown areas</li>
        </ul>
      </div>
    </div>
  );
}
