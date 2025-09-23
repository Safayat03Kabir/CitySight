// Example usage of the hospital functionality
// This can be copied and used in any Leaflet map component

/**
 * Example of how to use the hospital functionality standalone
 */
async function addHospitalsToMap(map) {
  try {
    // Get current map bounds
    const bounds = map.getBounds();
    const bbox = {
      south: bounds.getSouth(),
      west: bounds.getWest(),
      north: bounds.getNorth(),
      east: bounds.getEast()
    };

    console.log('Fetching hospitals for bbox:', bbox);

    // Fetch hospitals from Overpass API
    const hospitals = await fetchHospitalsInBbox(bbox);
    
    if (hospitals.length === 0) {
      console.log('No hospitals found in current view');
      return null;
    }

    // Render hospitals with 5km radius circles
    const hospitalLayer = await renderHospitalsAndBuffers(map, hospitals, {
      radiusMeters: 5000,
      color: '#d00',
      fillColor: '#d00',
      fillOpacity: 0.1
    });

    // Add to map
    hospitalLayer.addTo(map);
    
    console.log(`Added ${hospitals.length} hospitals to map`);
    return hospitalLayer;

  } catch (error) {
    console.error('Error adding hospitals:', error);
    throw error;
  }
}

/**
 * Usage example with toggle button
 */
function createHospitalToggle(map) {
  let hospitalLayer = null;
  let isShowing = false;

  const toggleButton = document.createElement('button');
  toggleButton.innerHTML = '🏥 Show Hospitals';
  toggleButton.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1000;
    background: white;
    border: 1px solid #ccc;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
  `;

  toggleButton.onclick = async () => {
    try {
      if (isShowing && hospitalLayer) {
        // Hide hospitals
        map.removeLayer(hospitalLayer);
        hospitalLayer = null;
        isShowing = false;
        toggleButton.innerHTML = '🏥 Show Hospitals';
      } else {
        // Show hospitals
        toggleButton.innerHTML = '⏳ Loading...';
        hospitalLayer = await addHospitalsToMap(map);
        isShowing = true;
        toggleButton.innerHTML = '🏥 Hide Hospitals';
      }
    } catch (error) {
      console.error('Toggle error:', error);
      toggleButton.innerHTML = '❌ Error';
      setTimeout(() => {
        toggleButton.innerHTML = '🏥 Show Hospitals';
      }, 2000);
    }
  };

  // Add button to map container
  map.getContainer().parentNode.style.position = 'relative';
  map.getContainer().parentNode.appendChild(toggleButton);

  return {
    toggle: () => toggleButton.click(),
    remove: () => toggleButton.remove(),
    isShowing: () => isShowing
  };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    addHospitalsToMap,
    createHospitalToggle
  };
}