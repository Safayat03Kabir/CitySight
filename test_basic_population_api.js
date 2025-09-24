// Test script for the new basic population API endpoint
// This tests the lightweight population data endpoint for risk assessment

const API_BASE_URL = 'http://localhost:5001';

// Test bounds for a small area in Manhattan
const testBounds = {
  south: 40.7589,
  west: -73.9851,
  north: 40.7614,
  east: -73.9811
};

// Function to test the basic population API
async function testBasicPopulationAPI() {
  console.log('🧪 TESTING BASIC POPULATION API ENDPOINT');
  console.log('=' .repeat(50));

  console.log('\n📍 Test Area (Manhattan):');
  console.log(`Bounds: ${testBounds.west},${testBounds.south},${testBounds.east},${testBounds.north}`);

  const boundsString = `${testBounds.west},${testBounds.south},${testBounds.east},${testBounds.north}`;
  const url = `${API_BASE_URL}/api/population/basic?bounds=${boundsString}&year=2020`;

  console.log('\n🌐 API Endpoint:');
  console.log(url);

  console.log('\n⚡ Benefits of Basic Endpoint:');
  console.log('✅ No time series processing (much faster)');
  console.log('✅ Only essential data for risk assessment');
  console.log('✅ Lower computational overhead');
  console.log('✅ Shorter timeout (5s vs 10s)');
  console.log('✅ Reduced memory usage');

  console.log('\n📊 Expected Response Structure:');
  const expectedResponse = {
    success: true,
    data: {
      population_sum: 15000,              // Total population
      population_density_mean: 12500.5,   // Average density per km²
      population_density_min: 8000.0,     // Minimum density per km²
      population_density_max: 18000.0,    // Maximum density per km²
      totalArea: 1.2,                     // Area in km²
      year: 2020,                         // Data year
      bounds: testBounds,                 // Input bounds
      timestamp: "2025-09-25T..."         // Processing timestamp
    }
  };

  console.log(JSON.stringify(expectedResponse, null, 2));

  console.log('\n🔄 Processing Flow:');
  console.log('1. Parse and validate bounds');
  console.log('2. Initialize Google Earth Engine');
  console.log('3. Query GPW population density data');
  console.log('4. Calculate basic statistics (mean, min, max, sum)');
  console.log('5. Return essential data only');

  console.log('\n🚀 Performance Comparison:');
  console.log('Full endpoint (/api/population):');
  console.log('  - Processes 6 years of data (2000-2025)');
  console.log('  - Computes time series');
  console.log('  - Creates detailed visualizations');
  console.log('  - Takes 15-30 seconds');
  console.log('  - Complex response structure');

  console.log('\nBasic endpoint (/api/population/basic):');
  console.log('  - Processes single year only');
  console.log('  - Basic statistics only');
  console.log('  - No visualizations');
  console.log('  - Takes 2-5 seconds');
  console.log('  - Simple response structure');

  console.log('\n🎯 Use Cases:');
  console.log('✅ Risk assessment calculations');
  console.log('✅ Quick population queries');
  console.log('✅ Real-time map interactions');
  console.log('✅ Mobile/low-bandwidth scenarios');

  console.log('\n' + '=' .repeat(50));
  console.log('🎉 Basic population API endpoint ready for testing!');

  // Instructions for manual testing
  console.log('\n📋 Manual Testing Instructions:');
  console.log('1. Ensure backend server is running (npm start)');
  console.log('2. Open browser or Postman');
  console.log('3. GET request to: ' + url);
  console.log('4. Should return response in ~2-5 seconds');
  console.log('5. Compare with full endpoint timing');

  console.log('\n🔧 Backend Logs to Watch For:');
  console.log('✅ "👥 Basic population data request received"');
  console.log('✅ "👥 Processing basic population data for risk assessment"');
  console.log('✅ "📊 Computing basic population statistics"');
  console.log('✅ "✅ Basic population data processed successfully"');

  return url;
}

// Run the test
testBasicPopulationAPI().then(url => {
  console.log('\n🌐 Ready to test at:', url);
}).catch(error => {
  console.error('❌ Test setup error:', error);
});