// Simple test script to verify time series functionality
const geeService = require('./services/geeService');

async function testTimeSeries() {
  try {
    console.log('🧪 Testing time series functionality...');
    
    // Test with a small area around NYC
    const bounds = {
      west: -74.01,
      south: 40.7,
      east: -73.99,
      north: 40.71
    };
    
    console.log('📍 Testing area:', bounds);
    
    // Test the main heat data function which should now include time series
    const result = await geeService.getHeatIslandData(bounds, '2023-01-01', '2024-08-01');
    
    console.log('✅ Heat data request successful');
    console.log('📊 Time series included:', !!result.timeSeries);
    console.log('📈 Time series length:', result.timeSeries ? result.timeSeries.length : 0);
    
    if (result.timeSeries && result.timeSeries.length > 0) {
      console.log('📅 Sample time series data:');
      result.timeSeries.slice(0, 3).forEach(point => {
        console.log(`  ${point.year}: ${point.meanC ? point.meanC.toFixed(2) + '°C' : 'No data'} (${point.sampleCount} images, hasData: ${point.hasData})`);
      });
    }
    
    console.log('🎉 Time series test completed successfully!');
    
  } catch (error) {
    console.error('❌ Time series test failed:', error.message);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testTimeSeries().then(() => {
    console.log('🏁 Test finished');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Test crashed:', error);
    process.exit(1);
  });
}

module.exports = { testTimeSeries };