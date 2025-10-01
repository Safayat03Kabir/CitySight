// Test the improved Energy Access Proxy with area calculations
// This tests the fixes for: area calculations, built surface coarsening, continuous visualization

const axios = require('axios');

async function testEnergyAccessProxy() {
  const baseUrl = 'http://localhost:5001';
  
  console.log('🧪 Testing Enhanced Energy Access Proxy...\n');

  // Test 1: Singapore city bounds (should show realistic percentages)
  console.log('📍 Test 1: Singapore City Energy Access Analysis');
  console.log('Expected: Critical ~10-25%, Near-Critical ~15-30%, total ~100%');
  
  const singaporeBounds = {
    west: 103.605,
    south: 1.225, 
    east: 104.005,
    north: 1.475
  };

  try {
    const start = Date.now();
    
    const response = await axios.get(`${baseUrl}/api/energy`, {
      params: {
        bounds: `${singaporeBounds.west},${singaporeBounds.south},${singaporeBounds.east},${singaporeBounds.north}`,
        year: 2024
      },
      timeout: 180000 // 3 minutes
    });

    const data = response.data;
    const elapsed = Date.now() - start;

    console.log(`⏱️ Processing time: ${elapsed}ms`);
    console.log(`✅ Success: ${data.success}`);
    console.log(`🖼️ Image URL generated: ${data.imageUrl ? 'Yes' : 'No'}`);
    
    if (data.statistics) {
      const stats = data.statistics;
      console.log('\n📊 AREA STATISTICS:');
      console.log(`Total area: ${stats.totalAreaKm2} km²`);
      console.log(`Analyzable area: ${stats.analyzableAreaKm2} km²`);
      console.log(`Analysis coverage: ${stats.analysisCoverage}%`);
      
      console.log('\n🎯 ENERGY ACCESS CLASSIFICATION:');
      console.log(`🔴 Critical areas: ${stats.criticalAreaKm2} km² (${stats.criticalAreaPct}%)`);
      console.log(`🟠 Near-critical areas: ${stats.nearCriticalAreaKm2} km² (${stats.nearCriticalAreaPct}%)`);
      console.log(`🟢 Normal areas: ${stats.normalAreasKm2} km² (${stats.normalAreasPct}%)`);
      console.log(`🏗️ Energy-deprived areas: ${stats.energyDeprivedPct}% (${stats.energyDeprivedKm2} km²)`);
      
      if (stats.areaBreakdown) {
        console.log('\n📈 5-CLASS SEVERITY BREAKDOWN:');
        const breakdown = stats.areaBreakdown;
        console.log(`Excellent: ${breakdown.excellent.km2} km² (${breakdown.excellent.percentage}%)`);
        console.log(`Good: ${breakdown.good.km2} km² (${breakdown.good.percentage}%)`);
        console.log(`Moderate: ${breakdown.moderate.km2} km² (${breakdown.moderate.percentage}%)`);
        console.log(`Concerning: ${breakdown.concerning.km2} km² (${breakdown.concerning.percentage}%)`);
        console.log(`Critical: ${breakdown.critical.km2} km² (${breakdown.critical.percentage}%)`);
      }
    }
    
    if (data.metadata) {
      console.log('\n🔧 TECHNICAL DETAILS:');
      console.log(`Algorithm: ${data.metadata.algorithm}`);
      console.log(`Resolution: ${data.metadata.resolution}`);
      console.log(`Data source: ${data.metadata.dataSource}`);
      console.log(`Method: ${data.metadata.method}`);
      console.log(`NTL images used: ${data.metadata.qualityMetrics.ntlImagesUsed}`);
    }

    // Validation checks
    console.log('\n✅ VALIDATION CHECKS:');
    
    // Check 1: Percentages should sum to ~100%
    if (data.statistics) {
      const totalPct = data.statistics.criticalAreaPct + 
                      data.statistics.nearCriticalAreaPct + 
                      data.statistics.normalAreasPct;
      const pctCheck = Math.abs(totalPct - 100) < 1;
      console.log(`Percentages sum to 100%: ${pctCheck ? '✅' : '❌'} (${totalPct.toFixed(1)}%)`);
      
      // Check 2: Critical areas shouldn't be 100% (old bug)
      const criticalNotBroken = data.statistics.criticalAreaPct < 90;
      console.log(`Critical areas < 90%: ${criticalNotBroken ? '✅' : '❌'} (${data.statistics.criticalAreaPct}%)`);
      
      // Check 3: Area-based calculations should be reasonable for Singapore
      const realisticCritical = data.statistics.criticalAreaPct >= 5 && data.statistics.criticalAreaPct <= 40;
      console.log(`Realistic critical %: ${realisticCritical ? '✅' : '❌'} (${data.statistics.criticalAreaPct}%)`);
      
      // Check 4: Coverage should be good
      const goodCoverage = data.statistics.analysisCoverage > 30;
      console.log(`Analysis coverage > 30%: ${goodCoverage ? '✅' : '❌'} (${data.statistics.analysisCoverage}%)`);
    }

    console.log(`\n🔗 Preview image URL: ${data.imageUrl}`);

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }

  // Test 2: Smaller area to verify continuous visualization
  console.log('\n\n📍 Test 2: Small Area Test (Central Singapore)');
  console.log('Testing continuous visualization and area preservation...');
  
  try {
    const smallBounds = {
      west: 103.82,
      south: 1.27,
      east: 103.87,
      north: 1.32
    };

    const response = await axios.get(`${baseUrl}/api/energy`, {
      params: {
        bounds: `${smallBounds.west},${smallBounds.south},${smallBounds.east},${smallBounds.north}`,
        year: 2024
      },
      timeout: 120000
    });

    const data = response.data;
    console.log(`✅ Small area success: ${data.success}`);
    console.log(`📊 Total area: ${data.statistics?.totalAreaKm2} km²`);
    console.log(`📊 Analyzable: ${data.statistics?.analyzableAreaKm2} km²`);
    console.log(`🎯 Critical: ${data.statistics?.criticalAreaPct}%`);

  } catch (error) {
    console.error('❌ Small area test failed:', error.response?.data?.error || error.message);
  }
}

// Run the test
testEnergyAccessProxy().catch(console.error);