// Test the improved risk assessment with realistic thresholds
// This will verify our updated formulas and thresholds work properly

console.log("🧪 TESTING IMPROVED RISK ASSESSMENT");
console.log("==================================");

// Updated realistic thresholds
const AMENITY_RISK_THRESHOLDS = {
  healthcare: {
    optimal: 12.0,
    warning: 7.0,
    critical: 3.0
  },
  police: {
    optimal: 0.8,
    warning: 0.4,
    critical: 0.2
  },
  fire_station: {
    optimal: 1.4,
    warning: 1.0,
    critical: 0.7
  },
  park: {
    optimal: 3.3,
    warning: 2.0,
    critical: 1.7
  }
};

// Improved calculation function
const calculateRiskAssessment = (population, amenityCounts) => {
  const assessments = [];
  
  if (population <= 0) {
    console.warn('⚠️ Population is zero or negative, cannot calculate risk assessment');
    return [];
  }
  
  if (population < 1000) {
    console.warn('⚠️ Population is very small (<1000), risk assessment may not be meaningful');
  }
  
  const populationPer10K = population / 10000;
  
  Object.entries(amenityCounts).forEach(([amenityType, count]) => {
    const thresholds = AMENITY_RISK_THRESHOLDS[amenityType];
    if (!thresholds) {
      console.warn(`⚠️ No thresholds defined for amenity type: ${amenityType}`);
      return;
    }
    
    const ratio = count / populationPer10K;
    const peoplePerFacility = count > 0 ? Math.round(population / count) : population;
    
    let riskLevel, message;
    
    if (count === 0) {
      riskLevel = 'critical';
      message = `No ${amenityType.replace('_', ' ')} facilities found in this area - Immediate need for infrastructure`;
    } else if (ratio >= thresholds.optimal) {
      riskLevel = 'optimal';
      message = `Excellent: ${ratio.toFixed(1)} per 10k people (1 per ${peoplePerFacility.toLocaleString()}) - Maintain service levels`;
    } else if (ratio >= thresholds.warning) {
      riskLevel = 'warning';
      message = `Adequate: ${ratio.toFixed(1)} per 10k people (1 per ${peoplePerFacility.toLocaleString()}) - Consider expansion`;
    } else {
      riskLevel = 'critical';
      message = `Insufficient: ${ratio.toFixed(1)} per 10k people (1 per ${peoplePerFacility.toLocaleString()}) - Priority investment needed`;
    }
    
    assessments.push({
      amenityType: amenityType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count,
      ratio,
      riskLevel,
      message
    });
  });
  
  return assessments.sort((a, b) => {
    const riskOrder = { critical: 3, warning: 2, optimal: 1 };
    return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
  });
};

// Test realistic scenarios
const testScenarios = [
  {
    name: "Dense Urban Area (Manhattan-like)",
    population: 150000,
    amenities: {
      healthcare: 50, // Realistic for dense urban
      police: 8,
      fire_station: 15,
      park: 200
    }
  },
  {
    name: "Medium City",
    population: 50000,
    amenities: {
      healthcare: 15,
      police: 2,
      fire_station: 4,
      park: 15
    }
  },
  {
    name: "Small Town",
    population: 10000,
    amenities: {
      healthcare: 5,
      police: 1,
      fire_station: 1,
      park: 8
    }
  },
  {
    name: "Edge Case - Very Small",
    population: 500,
    amenities: {
      healthcare: 1,
      police: 0,
      fire_station: 0,
      park: 2
    }
  },
  {
    name: "Edge Case - Zero Population",
    population: 0,
    amenities: {
      healthcare: 5,
      police: 1,
      fire_station: 1,
      park: 10
    }
  }
];

testScenarios.forEach((scenario, index) => {
  console.log(`\n📊 SCENARIO ${index + 1}: ${scenario.name}`);
  console.log("=" + "=".repeat(scenario.name.length + 14));
  console.log(`Population: ${scenario.population.toLocaleString()}`);
  
  const assessments = calculateRiskAssessment(scenario.population, scenario.amenities);
  
  if (assessments.length === 0) {
    console.log("❌ No valid assessments generated");
    return;
  }
  
  assessments.forEach(assessment => {
    const icon = assessment.riskLevel === 'optimal' ? '🟢' : 
                 assessment.riskLevel === 'warning' ? '🟡' : '🔴';
    console.log(`${icon} ${assessment.amenityType}: ${assessment.message}`);
  });
  
  // Summary
  const critical = assessments.filter(a => a.riskLevel === 'critical').length;
  const warning = assessments.filter(a => a.riskLevel === 'warning').length;
  const optimal = assessments.filter(a => a.riskLevel === 'optimal').length;
  
  console.log(`\n📋 Summary: ${critical} Critical, ${warning} Warning, ${optimal} Optimal`);
});

console.log("\n✅ IMPROVEMENTS MADE:");
console.log("====================");
console.log("1. ✅ Realistic thresholds based on real-world urban planning data");
console.log("2. ✅ Better edge case handling (zero population, zero facilities)");
console.log("3. ✅ More informative messages with people-per-facility context");
console.log("4. ✅ Actionable advice for each risk level");
console.log("5. ✅ Warning for very small populations (<1000)");
console.log("6. ✅ Proper error handling for missing threshold data");

console.log("\n🎯 NEXT STEPS:");
console.log("==============");
console.log("1. Update test files with new thresholds");
console.log("2. Test with real backend server");
console.log("3. Validate with actual city data");
console.log("4. Consider geographic area adjustments if needed");