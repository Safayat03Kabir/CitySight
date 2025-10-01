// Comprehensive Risk Assessment Formula Analysis
// Testing current calculations and identifying potential issues

console.log("🔍 RISK ASSESSMENT FORMULA ANALYSIS");
console.log("===================================");

// Current formula implementation
const calculateRisk = (population, amenityCount, thresholds) => {
  const populationPer10K = population / 10000;
  const ratio = populationPer10K > 0 ? amenityCount / populationPer10K : 0;
  
  console.log(`Population: ${population.toLocaleString()}`);
  console.log(`Population per 10K: ${populationPer10K.toFixed(2)}`);
  console.log(`Amenity count: ${amenityCount}`);
  console.log(`Ratio formula: ${amenityCount} / ${populationPer10K.toFixed(2)} = ${ratio.toFixed(2)}`);
  
  return ratio;
};

// Test scenarios
const scenarios = [
  {
    name: "Dense Urban (Manhattan-like)",
    population: 150000,
    healthcare: 11,
    police: 2,
    fire_station: 1,
    park: 15
  },
  {
    name: "Medium City",
    population: 50000,
    healthcare: 8,
    police: 3,
    fire_station: 2,
    park: 12
  },
  {
    name: "Small Town", 
    population: 10000,
    healthcare: 5,
    police: 1,
    fire_station: 1,
    park: 8
  },
  {
    name: "Ideal City (Based on Thresholds)",
    population: 100000,
    healthcare: 230, // 23.0 per 10k * 10 = 230 for 100k people
    police: 20,     // 2.0 per 10k * 10 = 20 for 100k people
    fire_station: 15, // 1.5 per 10k * 10 = 15 for 100k people  
    park: 167       // 16.7 per 10k * 10 = 167 for 100k people
  }
];

const thresholds = {
  healthcare: { optimal: 23.0, warning: 12.0, critical: 7.7 },
  police: { optimal: 2.0, warning: 1.0, critical: 0.5 },
  fire_station: { optimal: 1.5, warning: 1.0, critical: 0.5 },
  park: { optimal: 16.7, warning: 10.0, critical: 5.0 }
};

scenarios.forEach((scenario, index) => {
  console.log(`\n📊 SCENARIO ${index + 1}: ${scenario.name}`);
  console.log("=" + "=".repeat(scenario.name.length + 15));
  
  Object.entries(scenario).forEach(([key, value]) => {
    if (key === 'name' || key === 'population') return;
    
    console.log(`\n🏢 ${key.toUpperCase()}:`);
    const ratio = calculateRisk(scenario.population, value, thresholds[key]);
    const threshold = thresholds[key];
    
    let level;
    if (ratio >= threshold.optimal) level = "🟢 OPTIMAL";
    else if (ratio >= threshold.warning) level = "🟡 WARNING"; 
    else level = "🔴 CRITICAL";
    
    console.log(`Expected per 10K: Optimal ≥${threshold.optimal}, Warning ≥${threshold.warning}, Critical ≥${threshold.critical}`);
    console.log(`Actual per 10K: ${ratio.toFixed(2)}`);
    console.log(`Assessment: ${level}`);
  });
});

console.log("\n🔧 FORMULA ANALYSIS");
console.log("==================");

console.log("\n✅ CURRENT FORMULA:");
console.log("ratio = amenityCount / (population / 10000)");
console.log("This gives: facilities per 10,000 people");

console.log("\n🤔 POTENTIAL ISSUES:");
console.log("1. Are the thresholds realistic for different city sizes?");
console.log("2. Should we consider geographic area in the calculation?");
console.log("3. Are we handling edge cases (zero population, zero amenities)?");
console.log("4. Do thresholds scale appropriately for different population densities?");

console.log("\n📐 ALTERNATIVE FORMULAS TO CONSIDER:");
console.log("1. Population per facility: population / amenityCount");
console.log("2. Facility density per km²: amenityCount / area");  
console.log("3. Service coverage radius: sqrt(area / amenityCount)");
console.log("4. Weighted scoring based on multiple factors");

// Test edge cases
console.log("\n⚠️ EDGE CASE TESTING:");
console.log("=====================");

console.log("\nZero population test:");
try {
  const ratio = calculateRisk(0, 5, thresholds.healthcare);
  console.log(`Result: ${ratio} (should be 0)`);
} catch (e) {
  console.log(`Error: ${e.message}`);
}

console.log("\nZero amenities test:");
const ratio = calculateRisk(50000, 0, thresholds.healthcare);
console.log(`Result: ${ratio} (should be 0)`);

console.log("\nVery small population test:");
const smallRatio = calculateRisk(100, 1, thresholds.healthcare);
console.log(`100 people, 1 healthcare: ${smallRatio.toFixed(2)} per 10K (extremely high)`);

console.log("\n🎯 RECOMMENDATIONS:");
console.log("==================");
console.log("1. Current formula appears mathematically correct");
console.log("2. Consider adding minimum population threshold (e.g., 1000 people)");
console.log("3. May need area-based adjustments for very large or small areas");
console.log("4. Thresholds should be validated against real-world city data");