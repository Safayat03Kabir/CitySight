#!/usr/bin/env node

const axios = require('axios');

// Test the corrected Energy Access Proxy area calculations
async function testCorrectedAreaCalculations() {
  console.log('🧪 Testing Corrected Energy Access Proxy Area Calculations...\n');

  // Test bounds for Singapore (should show realistic percentages, not 100%/200%)
  const singaporeBounds = {
    north: 1.4504,
    south: 1.2966,
    east: 103.9915,
    west: 103.6920
  };

  try {
    console.log('📍 Testing Singapore with corrected area calculations...');
    
    const response = await axios.post('http://localhost:5001/api/energy', {
      bounds: singaporeBounds,
      year: 2024
    });

    if (response.data.success) {
      console.log('✅ Singapore test successful!');
      console.log('\n📊 AREA STATISTICS (Should be realistic now):');
      const stats = response.data.statistics;
      
      console.log(`   Total Geometry Area: ${stats.totalAreaKm2} km²`);
      console.log(`   Analyzable Area: ${stats.analyzableAreaKm2} km²`);
      console.log(`   Analysis Coverage: ${stats.analysisCoverage}%`);
      console.log('\n🏗️ ENERGY ACCESS BREAKDOWN:');
      console.log(`   🔴 Critical Areas: ${stats.criticalAreaKm2} km² (${stats.criticalAreaPct}%)`);
      console.log(`   🟠 Near-Critical Areas: ${stats.nearCriticalAreaKm2} km² (${stats.nearCriticalAreaPct}%)`);
      console.log(`   🟢 Normal Areas: ${stats.normalAreasKm2} km² (${stats.normalAreasPct}%)`);
      
      console.log('\n🔍 VALIDATION CHECKS:');
      const totalPct = stats.criticalAreaPct + stats.nearCriticalAreaPct + stats.normalAreasPct;
      console.log(`   Total Percentage Check: ${totalPct.toFixed(2)}% (should be ~100%)`);
      
      const totalKm2 = stats.criticalAreaKm2 + stats.nearCriticalAreaKm2 + stats.normalAreasKm2;
      console.log(`   Total Area Check: ${totalKm2.toFixed(2)} km² vs Analyzable: ${stats.analyzableAreaKm2} km²`);
      
      console.log('\n🌍 CROSS-CITY METRICS:');
      console.log(`   Energy Deprived (Absolute): ${stats.energyDeprivedPct}% (${stats.energyDeprivedKm2} km²)`);
      
      // Validation
      const isValid = totalPct >= 99 && totalPct <= 101 && 
                     stats.criticalAreaPct < 100 && stats.nearCriticalAreaPct < 100;
      
      if (isValid) {
        console.log('\n✅ VALIDATION PASSED: Area calculations are now realistic!');
      } else {
        console.log('\n❌ VALIDATION FAILED: Still seeing unrealistic percentages');
      }
      
      console.log('\n📈 EXPECTED BEHAVIOR FOR SINGAPORE:');
      console.log('   - Critical areas should be ~10-30% (not 100%)');
      console.log('   - Near-critical should be ~10-30% (not 100%)');
      console.log('   - Total should sum to ~100%');
      console.log('   - Energy deprived should be single digits (~2-5%)');
      
    } else {
      console.error('❌ Test failed:', response.data.error);
    }

  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.data);
    } else {
      console.error('❌ Network Error:', error.message);
    }
  }
}

// Run the test
if (require.main === module) {
  testCorrectedAreaCalculations().catch(console.error);
}

module.exports = { testCorrectedAreaCalculations };