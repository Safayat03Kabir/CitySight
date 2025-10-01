#!/usr/bin/env node

/**
 * Test script to verify the robust energy access analysis
 * Tests different scenarios including water-heavy and sparse urban areas
 */

// Use backend's axios
const axios = require('./backend/node_modules/axios');

const BASE_URL = 'http://localhost:5001/api/energy';

// Test scenarios
const testCases = [
  {
    name: 'NYC (Dense Urban)',
    bounds: '-74.1,40.6,-73.9,40.8',
    year: 2024,
    expectedStage: 'strict',
    expectedSoftWeighting: false
  },
  {
    name: 'London (Water/Greenspace Heavy)',
    bounds: '-0.3,51.4,0.1,51.6',
    year: 2024,
    expectedStage: 'balanced|permissive',
    expectedSoftWeighting: 'maybe'
  },
  {
    name: 'Rural Area (Low Built Coverage)',
    bounds: '-100.0,35.0,-99.8,35.2',
    year: 2024,
    expectedStage: 'permissive',
    expectedSoftWeighting: true
  }
];

async function testEnergyAPI() {
  console.log('🧪 Testing Robust Energy Access Analysis\n');
  
  for (const testCase of testCases) {
    console.log(`📍 Testing: ${testCase.name}`);
    console.log(`   Bounds: ${testCase.bounds}`);
    
    try {
      const url = `${BASE_URL}?bounds=${testCase.bounds}&year=${testCase.year}`;
      const startTime = Date.now();
      
      const response = await axios.get(url);
      const duration = Date.now() - startTime;
      
      if (response.status === 200) {
        const data = response.data;
        const diag = data.diagnostics || {};
        
        console.log(`   ✅ Status: ${response.status} (${duration}ms)`);
        console.log(`   📊 Stage: ${diag.chosenStage}`);
        console.log(`   📏 Coverage: ${diag.coverage || 'unknown'}`);
        console.log(`   🔄 Soft Weighting: ${diag.usedSoftWeighting || false}`);
        console.log(`   📈 Status: ${diag.status || 'unknown'}`);
        console.log(`   🎯 Analyzable Area: ${diag.analyzableKm2 || 0} km²`);
        
        // Check if image URL was generated
        if (data.imageUrl) {
          console.log(`   🖼️ Image generated: ✅`);
        } else {
          console.log(`   🖼️ Image generated: ❌`);
        }
        
        // Check statistics
        const stats = data.statistics || {};
        console.log(`   📊 Critical Area: ${stats.criticalAreaKm2 || 0} km² (${stats.criticalAreaPct || 0}%)`);
        
      } else {
        console.log(`   ❌ Status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.response?.status || 'Network'} - ${error.response?.data?.message || error.message}`);
    }
    
    console.log(''); // Empty line for readability
  }
  
  console.log('🏁 Testing complete!');
}

// Run tests
testEnergyAPI().catch(console.error);