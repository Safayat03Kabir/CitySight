# CitySight Frontend-Backend Integration Demo

This document demonstrates the exact data flow between frontend and backend as implemented.

## 1. Frontend Request Examples

### A. Custom Bounds Request
```javascript
// Example 1: Custom area bounds
const bounds = {
  west: -74.1,
  south: 40.6, 
  east: -73.9,
  north: 40.8
};

const startDate = "2024-01-01";
const endDate = "2024-08-01";

// Frontend sends request
const response = await fetch(
  `/api/heat?bounds=${bounds.west},${bounds.south},${bounds.east},${bounds.north}&startDate=${startDate}&endDate=${endDate}`
);
// URL: /api/heat?bounds=-74.1,40.6,-73.9,40.8&startDate=2024-01-01&endDate=2024-08-01
```

### B. City-Based Request
```javascript
// Example 2: Predefined city
const response = await fetch(
  `/api/heat/city/New York?startDate=${startDate}&endDate=${endDate}`
);
// URL: /api/heat/city/New York?startDate=2024-01-01&endDate=2024-08-01
```

## 2. Backend Response Format

### Complete Response Structure
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://earthengine.googleapis.com/v1alpha/projects/your-project/thumbnails/abcd1234:getPixels",
    "bounds": {
      "west": -74.1,
      "south": 40.6,
      "east": -73.9,
      "north": 40.8
    },
    "statistics": {
      "urbanMeanC": 32.5,
      "ruralMeanC": 28.3,
      "heatIslandIntensity": 4.2,
      "minTempC": 25.1,
      "maxTempC": 45.8,
      "imageCount": 15,
      "qualityScore": "excellent"
    },
    "visualizationParams": {
      "min": 25,
      "max": 45,
      "palette": ["blue", "cyan", "green", "yellow", "orange", "red"]
    },
    "overlayBounds": {
      "northeast": {
        "lat": 40.8,
        "lng": -73.9
      },
      "southwest": {
        "lat": 40.6,
        "lng": -74.1
      }
    },
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-08-01",
      "actualStart": "2024-01-15",
      "actualEnd": "2024-07-28"
    }
  },
  "metadata": {
    "requestId": "heat_1727123456789",
    "timestamp": "2024-09-23T15:30:45Z",
    "processingTime": "3.2s",
    "dataSource": "Landsat 8/9 Collection 2",
    "resolution": "30m",
    "cloudCoverThreshold": "20%"
  }
}
```

## 3. Frontend Processing Implementation

### A. HeatService Class Usage
```javascript
// Using the HeatService for requests
import { HeatService } from '../services/heatService';

// Method 1: Custom bounds
const bounds = { west: -74.1, south: 40.6, east: -73.9, north: 40.8 };
const response = await HeatService.getHeatData(bounds, "2024-01-01", "2024-08-01");

// Method 2: City name
const response = await HeatService.getCityHeatData("New York", "2024-01-01", "2024-08-01");
```

### B. Map Overlay Integration
```javascript
// Processing the response for Leaflet map overlay
if (response.success && response.data) {
  // Add heat overlay to map
  const overlay = L.imageOverlay(
    response.data.imageUrl,
    [
      [response.data.overlayBounds.southwest.lat, response.data.overlayBounds.southwest.lng],
      [response.data.overlayBounds.northeast.lat, response.data.overlayBounds.northeast.lng]
    ],
    { opacity: 0.7 }
  ).addTo(map);
  
  // Display statistics
  console.log('Heat Island Intensity:', response.data.statistics.heatIslandIntensity + '°C');
  console.log('Urban Temperature:', response.data.statistics.urbanMeanC + '°C');
  console.log('Rural Temperature:', response.data.statistics.ruralMeanC + '°C');
}
```

## 4. Components Created

### Frontend Components:
- **EnhancedMapComponent.tsx** - Main map interface with heat data integration
- **HeatService.js** - API client for backend communication

### Backend Components:
- **server.js** - Express server with heat API endpoints
- **services/geeService.js** - Google Earth Engine integration
- **controllers/heatController.js** - API request/response handling
- **routes/heatRoutes.js** - Route definitions

## 5. Data Flow Summary

```
1. User clicks "Analyze Current View" or city button
2. Frontend gets map bounds or uses predefined city coordinates
3. HeatService.getHeatData() or HeatService.getCityHeatData() called
4. Request sent: GET /api/heat?bounds=... or GET /api/heat/city/...
5. Backend processes request through heatController
6. geeService queries Google Earth Engine for satellite data
7. Backend returns JSON with imageUrl, statistics, bounds, metadata
8. Frontend receives response and validates structure
9. EnhancedMapComponent adds image overlay to Leaflet map
10. Statistics dashboard displays temperature data and metadata
```

## 6. Key Features Implemented

✅ **Exact Request Format** - Matches specified bounds and city request patterns
✅ **Complete Response Handling** - Processes all fields in the response JSON
✅ **Type Safety** - TypeScript interfaces for all data structures
✅ **Error Handling** - Comprehensive error states and user feedback
✅ **Loading States** - Visual feedback during API calls
✅ **Statistics Display** - All temperature data, quality scores, and metadata
✅ **Map Integration** - Heat layer overlays with proper bounds
✅ **Multiple Input Methods** - Both custom bounds and predefined cities

## 7. Testing the Integration

### Start Backend:
```bash
cd backend
npm start
```

### Start Frontend:
```bash
cd frontend
npm run dev
```

### Test Endpoints:
```bash
# Test custom bounds
curl "http://localhost:5000/api/heat?bounds=-74.1,40.6,-73.9,40.8&startDate=2024-01-01&endDate=2024-08-01"

# Test city endpoint
curl "http://localhost:5000/api/heat/city/New York?startDate=2024-01-01&endDate=2024-08-01"
```

The frontend is now fully configured to send and receive data in the exact format you specified!