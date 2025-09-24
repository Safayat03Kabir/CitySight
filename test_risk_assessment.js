// Test script for Population-Based Infrastructure Risk Assessment
// This demonstrates the risk assessment functionality with sample data

// Sample population data (typical for Manhattan area)
const samplePopulationData = {
  population_density_max: 75000,
  population_density_mean: 45000,
  population_density_min: 15000,
  population_sum: 150000,
  totalArea: 5.2,
  imageUrl: "sample-population-data-url"
};

// Sample amenity counts for the area
const sampleAmenityCounts = {
  healthcare: 11, // Combined hospitals (3) + clinics (8) = 11 total healthcare facilities
  police: 2,
  fire_station: 1,
  park: 15
};

// Risk assessment thresholds (per 10,000 people) - Updated with realistic urban planning data
const AMENITY_RISK_THRESHOLDS = {
  healthcare: {
    optimal: 12.0,   // Excellent: ~1 hospital per 50k + 1 clinic per 1k = 12 per 10k
    warning: 7.0,    // Adequate: ~1 hospital per 100k + 1 clinic per 2k = 7 per 10k
    critical: 3.0    // Minimal: ~1 hospital per 100k + 1 clinic per 5k = 3 per 10k
  },
  police: {
    optimal: 0.8,    // 1 per 12,500 people (excellent urban coverage)
    warning: 0.4,    // 1 per 25,000 people (standard coverage)
    critical: 0.2    // 1 per 50,000 people (minimal coverage)
  },
  fire_station: {
    optimal: 1.4,    // 1 per 7,000 people (excellent 4-6 min response time)
    warning: 1.0,    // 1 per 10,000 people (adequate response time)
    critical: 0.7    // 1 per 14,000 people (acceptable response time)
  },
  park: {
    optimal: 3.3,    // 1 per 3,000 people (excellent access to green space)
    warning: 2.0,    // 1 per 5,000 people (good access)
    critical: 1.7    // 1 per 6,000 people (minimal access)
  }
};

// Calculate risk assessment function
function calculateRiskAssessment(population, amenityCounts) {
  const assessments = [];
  const populationPer10K = population / 10000;
  
  Object.entries(amenityCounts).forEach(([amenityType, count]) => {
    const thresholds = AMENITY_RISK_THRESHOLDS[amenityType];
    const ratio = populationPer10K > 0 ? count / populationPer10K : 0;
    
    let riskLevel, message;
    
    if (ratio >= thresholds.optimal) {
      riskLevel = 'optimal';
      message = `Excellent coverage with ${ratio.toFixed(1)} ${amenityType.replace('_', ' ')}s per 10,000 people`;
    } else if (ratio >= thresholds.warning) {
      riskLevel = 'warning';
      message = `Adequate coverage with ${ratio.toFixed(1)} ${amenityType.replace('_', ' ')}s per 10,000 people`;
    } else {
      riskLevel = 'critical';
      message = `Insufficient coverage with only ${ratio.toFixed(1)} ${amenityType.replace('_', ' ')}s per 10,000 people`;
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
}

// Run the test
console.log('🔍 POPULATION-BASED INFRASTRUCTURE RISK ASSESSMENT TEST');
console.log('=' .repeat(60));

console.log('\n📊 POPULATION DATA:');
console.log(`Total Population: ${samplePopulationData.population_sum.toLocaleString()}`);
console.log(`Average Density: ${samplePopulationData.population_density_mean.toLocaleString()}/km²`);
console.log(`Max Density: ${samplePopulationData.population_density_max.toLocaleString()}/km²`);
console.log(`Area: ${samplePopulationData.totalArea} km²`);

console.log('\n🏢 AMENITY COUNTS:');
Object.entries(sampleAmenityCounts).forEach(([type, count]) => {
  console.log(`${type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${count}`);
});

console.log('\n⚠️ RISK ASSESSMENTS:');
const assessments = calculateRiskAssessment(samplePopulationData.population_sum, sampleAmenityCounts);

assessments.forEach(assessment => {
  const icon = assessment.riskLevel === 'optimal' ? '✅' : 
               assessment.riskLevel === 'warning' ? '⚠️' : '🚨';
  
  console.log(`${icon} ${assessment.amenityType}:`);
  console.log(`   ${assessment.message}`);
  console.log(`   Count: ${assessment.count}, Ratio: ${assessment.ratio.toFixed(2)}/10k people`);
  console.log('');
});

console.log('📈 OVERALL SUMMARY:');
const summary = {
  optimal: assessments.filter(a => a.riskLevel === 'optimal').length,
  warning: assessments.filter(a => a.riskLevel === 'warning').length,
  critical: assessments.filter(a => a.riskLevel === 'critical').length
};

console.log(`✅ Optimal: ${summary.optimal}`);
console.log(`⚠️ Warning: ${summary.warning}`);
console.log(`🚨 Critical: ${summary.critical}`);

console.log('\n' + '=' .repeat(60));
console.log('Test completed successfully! 🎉');

// Example API calls that would be made in the real implementation
console.log('\n🌐 EXAMPLE API CALLS:');
console.log('Population Data:', 'GET /api/population?bounds=-74.1,40.6,-73.9,40.8&year=2020');
console.log('OSM Healthcare:', 'POST https://overpass-api.de/api/interpreter');
console.log('OSM Parks:', 'POST https://overpass-api.de/api/interpreter');
console.log('OSM Police:', 'POST https://overpass-api.de/api/interpreter');
console.log('OSM Fire Stations:', 'POST https://overpass-api.de/api/interpreter');