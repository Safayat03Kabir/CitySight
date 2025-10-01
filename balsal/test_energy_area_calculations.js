/**
 * Test script to verify energy access proxy area calculations
 * Run this to test the enhanced backend area statistics
 */

// Test the energy access API with area calculations
async function testEnergyAreaCalculations() {
  console.log('🔋 Testing Energy Access Proxy Area Calculations...\n');

  // Test bounds for New York City area
  const testBounds = {
    west: -74.25,
    south: 40.49,
    east: -73.70,
    north: 40.91
  };

  try {
    const boundsStr = `${testBounds.west},${testBounds.south},${testBounds.east},${testBounds.north}`;
    const testUrl = `http://localhost:5001/api/energy?bounds=${boundsStr}&year=2024`;
    
    console.log(`📡 Making request to: ${testUrl}`);
    console.log(`📍 Test area: NYC region (${testBounds.west}, ${testBounds.south}, ${testBounds.east}, ${testBounds.north})\n`);

    const response = await fetch(testUrl);
    const data = await response.json();

    if (!response.ok) {
      console.error('❌ API Error:', data);
      return;
    }

    if (data.success && data.statistics) {
      const stats = data.statistics;
      
      console.log('📊 AREA CALCULATION RESULTS:');
      console.log('=' .repeat(50));
      
      // Total area
      console.log(`📏 Total Analysis Area: ${stats.totalAreaKm2} km²`);
      console.log('');
      
      // Critical areas (red zones)
      console.log('🔴 CRITICAL AREAS (Red zones - Highest priority):');
      console.log(`   Size: ${stats.criticalAreaKm2} km²`);
      console.log(`   Percentage: ${stats.criticalAreaPct}%`);
      console.log('');
      
      // Near-critical areas (orange zones)
      console.log('🟠 NEAR-CRITICAL AREAS (Orange zones - Medium priority):');
      console.log(`   Size: ${stats.nearCriticalAreaKm2} km²`);
      console.log(`   Percentage: ${stats.nearCriticalAreaPct}%`);
      console.log('');
      
      // Combined problem areas
      if (stats.totalCriticalAndNearKm2 !== undefined) {
        console.log('⚠️  TOTAL AREAS NEEDING ATTENTION:');
        console.log(`   Size: ${stats.totalCriticalAndNearKm2} km²`);
        console.log(`   Percentage: ${stats.totalCriticalAndNearPct}%`);
        console.log('');
      }
      
      // Normal areas (green zones)
      if (stats.normalAreasKm2 !== undefined) {
        console.log('✅ AREAS WITH ADEQUATE ENERGY ACCESS (Green zones):');
        console.log(`   Size: ${stats.normalAreasKm2} km²`);
        console.log(`   Percentage: ${stats.normalAreasPct}%`);
        console.log('');
      }
      
      // Severity breakdown
      if (stats.severityHistogram) {
        console.log('📈 SEVERITY LEVEL BREAKDOWN:');
        console.log(`   Excellent (Level 0): ${stats.severityHistogram.s0 || 0} pixels`);
        console.log(`   Good (Level 1): ${stats.severityHistogram.s1 || 0} pixels`);
        console.log(`   Moderate (Level 2): ${stats.severityHistogram.s2 || 0} pixels`);
        console.log(`   Concerning (Level 3): ${stats.severityHistogram.s3 || 0} pixels`);
        console.log(`   Critical (Level 4): ${stats.severityHistogram.s4 || 0} pixels`);
        console.log('');
      }
      
      // Area breakdown percentages
      if (stats.areaBreakdown) {
        console.log('🎯 DETAILED AREA BREAKDOWN BY PERCENTAGE:');
        const breakdown = stats.areaBreakdown;
        console.log(`   Excellent areas: ${breakdown.excellent?.percentage || 0}%`);
        console.log(`   Good areas: ${breakdown.good?.percentage || 0}%`);
        console.log(`   Moderate areas: ${breakdown.moderate?.percentage || 0}%`);
        console.log(`   Concerning areas: ${breakdown.concerning?.percentage || 0}%`);
        console.log(`   Critical areas: ${breakdown.critical?.percentage || 0}%`);
        console.log('');
      }
      
      // Verification calculations
      console.log('✅ VERIFICATION:');
      const calculatedTotal = (stats.criticalAreaKm2 || 0) + (stats.nearCriticalAreaKm2 || 0) + (stats.normalAreasKm2 || 0);
      const percentageTotal = (stats.criticalAreaPct || 0) + (stats.nearCriticalAreaPct || 0) + (stats.normalAreasPct || 0);
      console.log(`   Calculated total from components: ${calculatedTotal.toFixed(2)} km² (should match ${stats.totalAreaKm2} km²)`);
      console.log(`   Percentage total: ${percentageTotal.toFixed(1)}% (should be ~100%)`);
      console.log(`   Area calculation accuracy: ${((calculatedTotal / stats.totalAreaKm2) * 100).toFixed(1)}%`);
      
      console.log('\n🎉 Area calculations test completed successfully!');
      console.log('\nℹ️  You can now load the Energy Access layer in the frontend dashboard');
      console.log('   and click "Show Statistics" to see these comprehensive area metrics.');
      
    } else {
      console.error('❌ Failed to get statistics from API response');
      console.log('Response data:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testEnergyAreaCalculations();