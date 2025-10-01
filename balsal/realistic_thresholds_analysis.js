// Real-world Urban Planning Standards Research
// Comparing our thresholds with actual city benchmarks

console.log("🌍 REAL-WORLD URBAN INFRASTRUCTURE BENCHMARKS");
console.log("=============================================");

// Research from WHO, UN-Habitat, and major cities
const realWorldStandards = {
  healthcare: {
    who: "2.3 hospital beds per 1000 people (developed countries)",
    reality: "Hospitals: 1 per 50,000-100,000 people, Primary care: 1 per 2,000-5,000",
    ourCurrent: "23 per 10k = 1 per 435 people (WAY TOO HIGH)",
    suggested: "Hospitals: 0.5-2 per 10k, Clinics: 5-10 per 10k, Combined: 5.5-12 per 10k"
  },
  police: {
    standard: "2-3 officers per 1000 people, stations serve 20k-50k people",
    reality: "1 police station per 25,000-50,000 people",
    ourCurrent: "2 per 10k = 1 per 5,000 people (reasonable)",
    suggested: "0.2-0.8 per 10k people"
  },
  fire: {
    nfpa: "4-6 minute response time, stations serve 5k-15k people",
    reality: "1 fire station per 7,000-15,000 people",
    ourCurrent: "1.5 per 10k = 1 per 6,667 people (reasonable)",
    suggested: "0.7-1.4 per 10k people"
  },
  parks: {
    nrpa: "6.25-10.5 acres per 1000 people",
    who: "9 m² green space per person minimum",
    reality: "1 neighborhood park per 3,000-6,000 people",
    ourCurrent: "16.7 per 10k = 1 per 599 people (too high)",
    suggested: "1.7-3.3 per 10k people"
  }
};

console.log("\n📊 CURRENT vs REALISTIC THRESHOLDS:");
console.log("===================================");

Object.entries(realWorldStandards).forEach(([service, data]) => {
  console.log(`\n🏢 ${service.toUpperCase()}:`);
  console.log(`Real-world: ${data.reality}`);
  console.log(`Our current: ${data.ourCurrent}`);
  console.log(`Suggested: ${data.suggested}`);
});

console.log("\n🔧 RECOMMENDED NEW THRESHOLDS (per 10,000 people):");
console.log("=================================================");

const newThresholds = {
  healthcare: {
    optimal: 12.0,   // Excellent: 1 hospital per 50k + 1 clinic per 1k = 0.2 + 10 = 10.2 ≈ 12
    warning: 7.0,    // Adequate: 1 hospital per 100k + 1 clinic per 2k = 0.1 + 5 = 5.1 ≈ 7  
    critical: 3.0    // Minimal: 1 hospital per 100k + 1 clinic per 5k = 0.1 + 2 = 2.1 ≈ 3
  },
  police: {
    optimal: 0.8,    // 1 per 12.5k people (excellent coverage)
    warning: 0.4,    // 1 per 25k people (standard coverage)
    critical: 0.2    // 1 per 50k people (minimal coverage)
  },
  fire_station: {
    optimal: 1.4,    // 1 per 7k people (excellent response time)
    warning: 1.0,    // 1 per 10k people (adequate response time)
    critical: 0.7    // 1 per 14k people (acceptable response time)
  },
  park: {
    optimal: 3.3,    // 1 per 3k people (excellent access)
    warning: 2.0,    // 1 per 5k people (good access)
    critical: 1.7    // 1 per 6k people (minimal access)
  }
};

console.log(JSON.stringify(newThresholds, null, 2));

// Test new thresholds with real scenarios
console.log("\n🧪 TESTING NEW THRESHOLDS:");
console.log("==========================");

const testScenarios = [
  {
    name: "Manhattan (High Density)",
    population: 150000,
    healthcare: 50, // 25 hospitals + 75 clinics = realistic for Manhattan
    police: 8,      // NYPD has many precincts
    fire_station: 15, // FDNY has many stations
    park: 200       // Many small parks
  },
  {
    name: "Medium City",
    population: 50000,
    healthcare: 15, // 2 hospitals + 20 clinics
    police: 2,      // 2 police stations
    fire_station: 4, // 4 fire stations
    park: 15        // 15 parks
  }
];

testScenarios.forEach(scenario => {
  console.log(`\n📍 ${scenario.name} (Pop: ${scenario.population.toLocaleString()})`);
  
  Object.entries(newThresholds).forEach(([service, thresholds]) => {
    const count = scenario[service];
    const ratio = count / (scenario.population / 10000);
    
    let level = "🔴 Critical";
    if (ratio >= thresholds.optimal) level = "🟢 Optimal";
    else if (ratio >= thresholds.warning) level = "🟡 Warning";
    
    console.log(`${service}: ${count} facilities = ${ratio.toFixed(1)}/10k → ${level}`);
  });
});