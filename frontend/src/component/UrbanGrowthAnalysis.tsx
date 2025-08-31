"use client";

interface UrbanGrowthAnalysisProps {
  city: string;
  timeRange: string;
}

export default function UrbanGrowthAnalysis({ city, timeRange }: UrbanGrowthAnalysisProps) {
  // Mock data - in real implementation, this would come from NASA satellite imagery analysis
  const mockData = {
    urbanExpansion: {
      totalArea: 1245.7,
      growth: 3.8,
      developedLand: 78.2,
      greenSpaces: 21.8
    },
    populationDensity: {
      current: 8456,
      change: 2.3,
      projection: 9200
    },
    infrastructure: {
      roadNetwork: 92.4,
      publicTransit: 68.7,
      utilities: 85.3,
      housing: 73.9
    },
    landUse: [
      { type: "Residential", percentage: 45, color: "bg-blue-500" },
      { type: "Commercial", percentage: 25, color: "bg-purple-500" },
      { type: "Industrial", percentage: 15, color: "bg-gray-500" },
      { type: "Green Spaces", percentage: 15, color: "bg-green-500" }
    ]
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Urban Growth Analysis - {city}</h2>
      
      {/* Urban Expansion Overview */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Urban Expansion</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-800">{mockData.urbanExpansion.totalArea} km²</div>
            <div className="text-sm text-gray-600">Total Urban Area</div>
            <div className="text-sm text-green-600 font-medium">+{mockData.urbanExpansion.growth}% growth</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-800">{mockData.populationDensity.current}</div>
            <div className="text-sm text-gray-600">People per km²</div>
            <div className="text-sm text-blue-600 font-medium">+{mockData.populationDensity.change}% change</div>
          </div>
        </div>
      </div>

      {/* Land Use Distribution */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Land Use Distribution</h3>
        <div className="space-y-3">
          {mockData.landUse.map((item, index) => (
            <div key={index} className="flex items-center">
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{item.type}</span>
                  <span className="text-sm text-gray-600">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${item.color}`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Infrastructure Readiness */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Infrastructure Readiness</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Road Network</span>
            <span className="font-medium text-gray-800">{mockData.infrastructure.roadNetwork}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Public Transit</span>
            <span className="font-medium text-gray-800">{mockData.infrastructure.publicTransit}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Utilities</span>
            <span className="font-medium text-gray-800">{mockData.infrastructure.utilities}%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Housing</span>
            <span className="font-medium text-gray-800">{mockData.infrastructure.housing}%</span>
          </div>
        </div>
      </div>

      {/* Growth Projections */}
      <div className="p-4 bg-green-50 rounded-lg">
        <h4 className="text-sm font-medium text-green-800 mb-2">Growth Projections</h4>
        <div className="text-sm text-green-700 space-y-1">
          <div>Population density projected to reach {mockData.populationDensity.projection} people/km² by 2030</div>
          <div>Recommended: Increase green space allocation by 5% in new developments</div>
          <div>Priority: Enhance public transit infrastructure in high-growth areas</div>
        </div>
      </div>
    </div>
  );
}
