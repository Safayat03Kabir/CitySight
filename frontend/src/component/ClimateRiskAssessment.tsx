"use client";

interface ClimateRiskAssessmentProps {
  city: string;
}

export default function ClimateRiskAssessment({ city }: ClimateRiskAssessmentProps) {
  // Mock data - in real implementation, this would come from climate models and NASA data
  const riskFactors = [
    {
      name: "Flooding",
      level: "High",
      probability: 75,
      impact: "Severe",
      trend: "increasing",
      description: "Sea level rise and extreme precipitation events"
    },
    {
      name: "Heat Waves",
      level: "Medium",
      probability: 60,
      impact: "Moderate",
      trend: "increasing",
      description: "Urban heat island effect amplification"
    },
    {
      name: "Drought",
      level: "Low",
      probability: 25,
      impact: "Minor",
      trend: "stable",
      description: "Water supply disruption potential"
    },
    {
      name: "Storm Surge",
      level: "High",
      probability: 70,
      impact: "Severe",
      trend: "increasing",
      description: "Coastal infrastructure vulnerability"
    }
  ];

  const adaptationMeasures = [
    {
      measure: "Green Infrastructure",
      progress: 65,
      status: "In Progress",
      description: "Rain gardens, permeable pavements, urban forests"
    },
    {
      measure: "Flood Barriers",
      progress: 30,
      status: "Planning",
      description: "Coastal protection and inland flood defenses"
    },
    {
      measure: "Cool Roofs Program",
      progress: 85,
      status: "Active",
      description: "Reflective roofing to reduce heat absorption"
    },
    {
      measure: "Emergency Preparedness",
      progress: 50,
      status: "In Progress",
      description: "Early warning systems and evacuation routes"
    }
  ];

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-100 text-green-800";
      case "in progress": return "bg-blue-100 text-blue-800";
      case "planning": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Climate Risk Assessment - {city}</h2>
      
      {/* Risk Factors */}
      <div className="mb-8">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Climate Risk Factors</h3>
        <div className="space-y-4">
          {riskFactors.map((risk, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-800">{risk.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getRiskColor(risk.level)}`}>
                      {risk.level} Risk
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{risk.description}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-gray-800">{risk.probability}%</div>
                  <div className="text-xs text-gray-500">Probability</div>
                </div>
              </div>
              
              {/* Risk probability bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Risk Probability</span>
                  <span className={risk.trend === 'increasing' ? 'text-red-600' : 'text-green-600'}>
                    {risk.trend === 'increasing' ? '↗️ Increasing' : '➡️ Stable'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      risk.probability >= 70 ? 'bg-red-500' : 
                      risk.probability >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${risk.probability}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Adaptation Measures */}
      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-4">Adaptation Measures</h3>
        <div className="space-y-3">
          {adaptationMeasures.map((measure, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-800">{measure.measure}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(measure.status)}`}>
                      {measure.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{measure.description}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-lg font-bold text-gray-800">{measure.progress}%</div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${measure.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Alert */}
      <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <h4 className="text-sm font-medium text-orange-800 mb-2">⚠️ Priority Actions Required</h4>
        <ul className="text-sm text-orange-700 space-y-1">
          <li>• Accelerate flood barrier construction due to high risk level</li>
          <li>• Expand green infrastructure to combat urban heat island effect</li>
          <li>• Enhance storm surge preparedness for coastal areas</li>
        </ul>
      </div>
    </div>
  );
}
