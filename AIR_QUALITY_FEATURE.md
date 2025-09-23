# Air Quality Data Feature

This document describes the newly implemented air quality data feature that works alongside the existing heat island analysis in CitySight.

## Overview

The air quality feature provides the same functionality as the heat data feature but for atmospheric pollution data, specifically:
- NO₂ (Nitrogen Dioxide) concentration analysis
- CO (Carbon Monoxide) detection  
- SO₂ (Sulfur Dioxide) monitoring
- Urban vs Rural air quality comparison

## Backend Implementation

### Services
- **`airQualityService.js`** - Google Earth Engine service for Sentinel-5P TROPOMI data
- **`airQualityController.js`** - HTTP request handlers for air quality endpoints
- **`airQualityRoutes.js`** - Express routes for air quality API

### API Endpoints

All endpoints follow the same pattern as heat data:

1. **Custom Area Analysis**
   ```
   GET /api/airquality?bounds=west,south,east,north&startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
   ```

2. **Predefined City Analysis**
   ```
   GET /api/airquality/city/{cityName}?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
   ```

3. **API Information**
   ```
   GET /api/airquality/info
   ```

4. **Supported Cities**
   ```
   GET /api/airquality/cities
   ```

### Example Usage

```javascript
// Get air quality for New York City
const response = await fetch('/api/airquality/city/New York?startDate=2024-01-01&endDate=2024-08-01');
const data = await response.json();

// Get air quality for custom area
const response2 = await fetch('/api/airquality?bounds=-74.1,40.6,-73.9,40.8');
const data2 = await response2.json();
```

## Frontend Implementation

### Services
- **`airQualityService.js`** - Frontend service for API communication

### Components
- **`EnhancedMapComponent.tsx`** - Updated to support both heat and air quality data

### UI Features

1. **Data Type Toggle** - Switch between heat island and air quality analysis
2. **Map Overlays** - Visual representation of pollution concentration
3. **Statistics Display** - Urban vs rural comparison, data quality metrics
4. **City Quick Access** - Predefined buttons for major cities

## How to Use

1. **Dashboard Access**: Navigate to `/dashboard` in the application
2. **Select Data Type**: Use the toggle to switch between "Heat Island Data" and "Air Quality Data"
3. **Load Data**: 
   - Click "Show Air Quality" to analyze current map view
   - Use city buttons (New York, Los Angeles, Chicago) for quick access
4. **View Results**: Pollution concentration overlay and detailed statistics will be displayed

## Data Sources

- **Satellite Data**: ESA Sentinel-5P TROPOMI Level 3 products
- **Land Cover**: MODIS MCD12Q1 for urban/rural classification
- **Spatial Resolution**: 1113.2 meters
- **Temporal Coverage**: April 2018 - Present (3-7 day delay)

## Key Features

- **Real-time Processing**: Data processed on-demand using Google Earth Engine
- **Quality Filtering**: Extreme values filtered, cloud-free observations prioritized
- **Urban Heat Island Analysis**: Automatic urban vs rural comparison
- **Interactive Maps**: Leaflet-based visualization with opacity controls
- **Comprehensive Statistics**: Pollution metrics, data quality indicators
- **Export Capabilities**: PNG thumbnails generated for each analysis

## Technical Notes

- Air quality data has coarser spatial resolution (1113.2m) compared to heat data (30m)
- Processing time may be longer for air quality due to atmospheric data complexity
- NO₂ is the primary pollutant visualized (most reliable for urban analysis)
- CO and SO₂ data available in statistics but not primarily visualized

## Supported Cities

- New York
- Los Angeles  
- Chicago
- Houston
- Phoenix
- Philadelphia

The same city bounds are used for both heat and air quality analysis to enable direct comparison.