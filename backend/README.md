# CitySight Heat Island API

A backend API for urban heat island analysis using Google Earth Engine and Landsat satellite data.

## Features

- **Real-time Heat Island Analysis**: Generate heat island maps using Landsat thermal data
- **Google Earth Engine Integration**: Leverage GEE's satellite data processing capabilities
- **Multiple Query Options**: Support for custom bounding boxes or predefined cities
- **High-Quality Data**: Uses Landsat Collection 2 Level 2 thermal data with quality filtering
- **Urban/Rural Analysis**: Calculates heat island intensity comparing urban vs rural temperatures

## API Endpoints

### Heat Data Endpoints

#### Get Heat Data for Custom Area
```
GET /api/heat?bounds=west,south,east,north&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

**Example:**
```
GET /api/heat?bounds=-74.1,40.6,-73.9,40.8&startDate=2024-01-01&endDate=2024-08-01
```

#### Get Heat Data for Predefined City
```
GET /api/heat/city/{cityName}?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
```

**Example:**
```
GET /api/heat/city/New York?startDate=2024-01-01&endDate=2024-08-01
```

#### Get Supported Cities
```
GET /api/heat/cities
```

#### Get API Information
```
GET /api/heat/info
```

### Supported Cities
- New York
- Los Angeles  
- Chicago
- Houston
- Phoenix
- Philadelphia

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Set up Google Earth Engine**
   - Place your GEE service account JSON in `config/gee-service-account.json`
   - Ensure the service account has Earth Engine access

4. **Start the Server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

5. **Test the API**
   ```bash
   curl http://localhost:5000/health
   curl "http://localhost:5000/api/heat?bounds=-74.1,40.6,-73.9,40.8"
   ```

## Response Format

### Successful Response
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://earthengine.googleapis.com/...",
    "bounds": {"west": -74.1, "south": 40.6, "east": -73.9, "north": 40.8},
    "statistics": {
      "urbanMeanC": 32.5,
      "ruralMeanC": 28.3,
      "heatIslandIntensity": 4.2,
      "imageCount": 15
    },
    "visualizationParams": {
      "min": 25,
      "max": 45, 
      "palette": ["blue","cyan","green","yellow","orange","red"]
    },
    "overlayBounds": {
      "northeast": {"lat": 40.8, "lng": -73.9},
      "southwest": {"lat": 40.6, "lng": -74.1}
    }
  },
  "metadata": {
    "requestId": "heat_1234567890",
    "dataQuality": "excellent",
    "processingTime": "2024-01-15T10:30:00Z"
  }
}
```

## Data Processing

- **Satellite Data**: Landsat 8/9 Collection 2 Level 2 thermal bands
- **Quality Filtering**: Cloud cover <20%, QA pixel masking applied
- **Temporal Composite**: Median of hot season (April-June) observations
- **Spatial Resolution**: 30 meters
- **Temperature Conversion**: Thermal digital numbers converted to Celsius
- **Urban Classification**: MODIS land cover data for urban/rural masking

## Error Handling

The API provides detailed error responses with appropriate HTTP status codes:

- `400` - Bad Request (invalid parameters)
- `404` - Not Found (no data available)
- `408` - Request Timeout (processing timeout)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `503` - Service Unavailable (GEE authentication issues)

## Rate Limiting

- 100 requests per IP per 15 minutes
- Processing-intensive requests may have additional throttling

## Environment Variables

```bash
PORT=5000                                    # Server port
NODE_ENV=development                         # Environment
FRONTEND_URL=http://localhost:3000          # CORS origin
GEE_SERVICE_ACCOUNT_PATH=./config/gee-service-account.json
```

## Integration with Frontend

The API is designed to work with mapping libraries like Leaflet. The response includes:

- `imageUrl`: Direct URL to the heat map image
- `overlayBounds`: Geographic bounds for map overlay
- `visualizationParams`: Color scale information for legends
- `statistics`: Temperature statistics for display

### Example Frontend Integration (Leaflet)

```javascript
// Fetch heat data
const response = await fetch('/api/heat/city/New York');
const data = await response.json();

// Add to Leaflet map
const imageOverlay = L.imageOverlay(
  data.data.imageUrl,
  [
    [data.data.overlayBounds.southwest.lat, data.data.overlayBounds.southwest.lng],
    [data.data.overlayBounds.northeast.lat, data.data.overlayBounds.northeast.lng]
  ],
  { opacity: 0.7 }
).addTo(map);
```

## Troubleshooting

### Common Issues

1. **GEE Authentication Error**
   - Verify service account JSON is correct
   - Ensure the service account has Earth Engine access
   - Check project permissions

2. **No Data Available**
   - Try different date ranges
   - Verify coordinates are valid
   - Check if area has satellite coverage

3. **Processing Timeout**
   - Reduce area size
   - Try shorter date ranges
   - Use more recent dates for better performance

## License

MIT License