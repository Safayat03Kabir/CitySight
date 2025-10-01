  /**
   * Get Energy Access Proxy data using built-up + nighttime lights analysis (REFACTORED)
   * @param {Object} bounds - Bounding box { west, south, east, north }
   * @param {number} year - Year for analysis (default: 2024)
   * @returns {Promise<Object>} - Energy access proxy data with PNG overlay
   */
  async getEnergyAccessProxyRefactored(bounds, year = 2024) {
    await this.initialize();

    const geometry = ee.Geometry.Rectangle([bounds.west, bounds.south, bounds.east, bounds.north]);
    const analysisScale = 250; // meters
    const crs = 'EPSG:4326';   // only for viz if needed

    console.log(`🔋 Processing Energy Access Proxy for bounds:`, bounds, `Year: ${year}`);

    // Helper: area reducer (m²) at analysisScale
    const areaReducer = (imgMask) =>
      ee.Image.pixelArea()
        .updateMask(imgMask)
        .reduceRegion({
          reducer: ee.Reducer.sum(),
          geometry,
          scale: analysisScale,
          maxPixels: 1e13,
          tileScale: 4
        })
        .getNumber('area');

    try {
      // ---------- DATASETS ----------
      // VIIRS annual (with fallback year)
      const viirs = (y) =>
        ee.ImageCollection('NOAA/VIIRS/DNB/ANNUAL_V22')
          .filterDate(`${y}-01-01`, `${y + 1}-01-01`)
          .select('median');

      const viirsMain = viirs(year);
      const viirsFallback = viirs(year - 1);
      const viirsUse = ee.ImageCollection(
        ee.Algorithms.If(viirsMain.size().gt(0), viirsMain,
          ee.Algorithms.If(viirsFallback.size().gt(0), viirsFallback, viirs(year - 2))
        )
      );

      const ntl = viirsUse.mosaic().rename('ntl').clip(geometry); // no reproject here

      // Validate nighttime lights availability
      const ntlCount = await new Promise((resolve, reject) => {
        viirsUse.size().getInfo((v, e) => e ? reject(e) : resolve(v));
      });
      
      if (!ntlCount) {
        throw new Error(`No VIIRS annual lights available for ${year}, ${year-1}, or ${year-2}. Try a different year or region.`);
      }
      
      console.log(`📡 Using VIIRS nighttime lights data (${ntlCount} images available)`);

      // GHSL built surface (area-preserving coarsen to ~250m)
      const builtSurfaceRaw = ee.Image('JRC/GHSL/P2023A/GHS_BUILT_S/2020').select('built_surface').clip(geometry);
      const builtSurface250 = builtSurfaceRaw
        .reduceResolution({ reducer: ee.Reducer.sum(), maxPixels: 1024 }) // sum preserves area
        .reproject({ crs: builtSurfaceRaw.projection() }); // keep native for now

      // Built volume (optional in index; leave at native, only use scale in reducers)
      const builtVolume = ee.Image('JRC/GHSL/P2023A/GHS_BUILT_V/2020')
        .select('built_volume_total')
        .clip(geometry);

      // JRC water mask
      const water = ee.Image('JRC/GSW1_4/GlobalSurfaceWater').select('occurrence').clip(geometry);
      const landMask = water.lt(50); // <50% occurrence

      // Pixel area at analysis scale to compute consistent fractions
      const pixelArea250 = ee.Image.pixelArea();

      // Built fraction (0..1), use area-consistent numerator/denominator
      const builtFrac = builtSurface250.divide(pixelArea250).clamp(0, 1).rename('builtFrac');

      // Mask: land AND at least 2–3% built to avoid hole-punching
      const builtMask = builtFrac.gt(0.03);
      const analysisMask = builtMask.and(landMask);

      console.log('📊 Datasets loaded, computing robust indicators...');

      // ---------- ROBUST RESCALE ----------
      const robustRescale01 = (img, mask, pLow = 10, pHigh = 90) => {
        const band = img.bandNames().get(0);
        const masked = img.updateMask(mask);
        const stats = masked.reduceRegion({
          reducer: ee.Reducer.percentile([pLow, pHigh]),
          geometry, scale: analysisScale, maxPixels: 1e13, tileScale: 4
        });
        const lo = ee.Number(stats.get(ee.String(band).cat(`_p${pLow}`)));
        const hi = ee.Number(stats.get(ee.String(band).cat(`_p${pHigh}`)));
        const rng = hi.subtract(lo);

        // Fallback to min/max if percentiles collapse
        const minmax = masked.reduceRegion({
          reducer: ee.Reducer.minMax(),
          geometry, scale: analysisScale, maxPixels: 1e13, tileScale: 4
        });
        const minV = ee.Number(minmax.get(ee.String(band).cat('_min')));
        const maxV = ee.Number(minmax.get(ee.String(band).cat('_max')));
        const safeLo = ee.Number(ee.Algorithms.If(rng.lte(0), minV, lo));
        const safeRng = ee.Number(ee.Algorithms.If(rng.lte(0), maxV.subtract(minV), rng)).max(1e-6);

        return img.subtract(safeLo).divide(safeRng).clamp(0, 1);
      };

      // ---------- EAP ----------
      const ntlLog = ntl.add(1).log().rename('ntlLog');
      const ntlLogScaled = robustRescale01(ntlLog, analysisMask, 10, 99);
      const lightsLack = ee.Image(1).subtract(ntlLogScaled).rename('lightsLack');

      const builtSurfaceScaled = robustRescale01(builtSurfaceRaw, analysisMask, 10, 90);
      const builtVolumeScaled = robustRescale01(builtVolume, analysisMask, 10, 90);
      const builtIndex = builtSurfaceScaled.multiply(0.6).add(builtVolumeScaled.multiply(0.4)).sqrt().rename('builtIndex');

      const eap = builtIndex.multiply(lightsLack).rename('EAP').updateMask(analysisMask);

      console.log('⚡ Computing improved Energy Access Proxy...');

      // Smooth lightly
      const eapSm = eap.focal_mean({ kernel: ee.Kernel.square({ radius: 1 }), iterations: 1 });

      // Coverage validation
      const analyzableAreaM2 = await new Promise((res, rej) =>
        areaReducer(analysisMask).getInfo((v, e) => e ? rej(e) : res(v || 0))
      );
      const totalAreaM2 = await new Promise((res, rej) =>
        geometry.area().getInfo((v, e) => e ? rej(e) : res(v || 0))
      );
      const coverage = analyzableAreaM2 / Math.max(totalAreaM2, 1);
      
      if (coverage < 0.3) {
        throw new Error(`Too little analyzable land/built area (${(coverage * 100).toFixed(1)}%). Refine AOI or relax masks.`);
      }
      
      console.log(`📊 Analysis coverage: ${(coverage * 100).toFixed(1)}% of total area`);

      // ---------- QUANTILES (with fallback) ----------
      const qs = eapSm.reduceRegion({
        reducer: ee.Reducer.percentile([10, 30, 50, 70, 90]),
        geometry, scale: analysisScale, maxPixels: 1e13, tileScale: 4
      });
      const q20 = ee.Number(qs.get('EAP_p10'));
      const q40 = ee.Number(qs.get('EAP_p30'));
      const q60 = ee.Number(qs.get('EAP_p50'));
      const q80 = ee.Number(qs.get('EAP_p70'));
      const eMinMax = eapSm.reduceRegion({
        reducer: ee.Reducer.minMax(),
        geometry, scale: analysisScale, maxPixels: 1e13, tileScale: 4
      });
      const eMin = ee.Number(eMinMax.get('EAP_min'));
      const eMax = ee.Number(eMinMax.get('EAP_max'));
      const width = eMax.subtract(eMin).divide(5);

      const degenerate = q80.subtract(q20).lte(1e-6);
      const finalQ20 = ee.Number(ee.Algorithms.If(degenerate, eMin.add(width), q20));
      const finalQ40 = ee.Number(ee.Algorithms.If(degenerate, eMin.add(width.multiply(2)), q40));
      const finalQ60 = ee.Number(ee.Algorithms.If(degenerate, eMin.add(width.multiply(3)), q60));
      const finalQ80 = ee.Number(ee.Algorithms.If(degenerate, eMin.add(width.multiply(4)), q80));

      // ---------- SEVERITY (0..4) ----------
      const severity = eapSm.expression(
        '(e <= q20) ? 0 : (e <= q40) ? 1 : (e <= q60) ? 2 : (e <= q80) ? 3 : 4',
        { e: eapSm, q20: finalQ20, q40: finalQ40, q60: finalQ60, q80: finalQ80 }
      ).rename('severity').updateMask(analysisMask);

      // ---------- AREAS (km²) ----------
      // analyzable area (land ∧ built)
      const analyzableAreaKm2 = (analyzableAreaM2 || 0) / 1e6;

      // AOI area (pure geometry)
      const totalAreaKm2 = (totalAreaM2 || 0) / 1e6;

      // class masks
      const criticalMask = eapSm.gte(finalQ80); // top 20%
      const nearMask = eapSm.gte(finalQ60).and(eapSm.lt(finalQ80)); // 60–80%

      // helper to km²
      const areaKm2 = async (maskImage) => {
        const m2 = await new Promise((res, rej) =>
          areaReducer(maskImage).getInfo((v, e) => e ? rej(e) : res(v || 0))
        );
        return (m2 || 0) / 1e6;
      };

      const [criticalKm2, nearKm2] = await Promise.all([
        areaKm2(criticalMask.and(analysisMask)), 
        areaKm2(nearMask.and(analysisMask))
      ]);
      const normalKm2 = Math.max(0, analyzableAreaKm2 - criticalKm2 - nearKm2);

      const pct = (partKm2) => analyzableAreaKm2 > 0 ? +(100 * partKm2 / analyzableAreaKm2).toFixed(1) : 0;

      // Area-based severity breakdown
      const sevAreasKm2 = {};
      for (let i = 0; i < 5; i++) {
        // mask where severity == i
        const mask = severity.eq(i);
        sevAreasKm2[i] = await areaKm2(mask);
      }
      const sevPercents = {};
      for (let i = 0; i < 5; i++) {
        sevPercents[i] = pct(sevAreasKm2[i]);
      }

      // Absolute classification for cross-city comparison
      const deprived = eapSm.gt(0.6)
        .and(ntlLogScaled.lt(0.3))
        .and(builtIndex.gt(0.4));
      
      const deprivedKm2 = await areaKm2(deprived);
      const deprivedPct = pct(deprivedKm2);

      console.log(`📏 Total area: ${totalAreaKm2.toFixed(1)} km² | Analyzable: ${analyzableAreaKm2.toFixed(1)} km²`);
      console.log(`🔴 Critical areas: ${criticalKm2.toFixed(1)} km² (${pct(criticalKm2)}%)`);
      console.log(`🟠 Near-critical areas: ${nearKm2.toFixed(1)} km² (${pct(nearKm2)}%)`);
      console.log(`🟢 Normal areas: ${normalKm2.toFixed(1)} km² (${pct(normalKm2)}%)`);
      console.log(`🏗️ Energy-deprived built areas: ${deprivedPct}% (${deprivedKm2.toFixed(1)} km²)`);

      // ---------- VIZ (continuous) ----------
      const eapForViz = eapSm.unmask(0); // fill masked pixels with low value (green end)
      const eapVis = { min: 0, max: 1, palette: ['#1a9850', '#66bd63', '#a6d96a', '#ffffbf', '#fdae61', '#f46d43', '#d73027'] };
      const visImage = eapForViz.visualize(eapVis);

      console.log('🖼️ Generating visualization...');
      const imageUrl = await new Promise((resolve, reject) => {
        visImage.getThumbURL(
          { region: geometry, dimensions: 1024, format: 'png' },
          (url, error) => (error ? reject(error) : resolve(url))
        );
      });

      console.log('✅ Energy Access Proxy analysis complete');

      // ---------- RETURN ----------
      return {
        success: true,
        layerType: 'energy',
        imageUrl,
        overlayBounds: {
          southwest: { lat: bounds.south, lng: bounds.west },
          northeast: { lat: bounds.north, lng: bounds.east }
        },
        attribution: 'VIIRS V22 (NOAA), GHSL 2023A (JRC), JRC GSW 1.4',
        timestamp: new Date().toISOString(),
        statistics: {
          totalAreaKm2: +totalAreaKm2.toFixed(1),           // AOI size
          analyzableAreaKm2: +analyzableAreaKm2.toFixed(1), // built ∧ land (what percentages use)
          criticalAreaKm2: +criticalKm2.toFixed(1),
          criticalAreaPct: pct(criticalKm2),
          nearCriticalAreaKm2: +nearKm2.toFixed(1),
          nearCriticalAreaPct: pct(nearKm2),
          normalAreasKm2: +normalKm2.toFixed(1),
          normalAreasPct: +(100 - pct(criticalKm2) - pct(nearKm2)).toFixed(1),
          // Cross-city comparison metric
          energyDeprivedPct: +deprivedPct.toFixed(2),
          energyDeprivedKm2: +deprivedKm2.toFixed(2),
          // Coverage and data quality
          analysisCoverage: +((coverage * 100).toFixed(1)),
          dataYear: year,
          // Additional legacy fields for compatibility
          totalCriticalAndNearKm2: +(criticalKm2 + nearKm2).toFixed(1),
          totalCriticalAndNearPct: +(pct(criticalKm2) + pct(nearKm2)).toFixed(1),

          // 5-class severity (area-based)
          areaBreakdown: {
            excellent: { km2: +sevAreasKm2[0].toFixed(1), percentage: sevPercents[0] },
            good:      { km2: +sevAreasKm2[1].toFixed(1), percentage: sevPercents[1] },
            moderate:  { km2: +sevAreasKm2[2].toFixed(1), percentage: sevPercents[2] },
            concerning:{ km2: +sevAreasKm2[3].toFixed(1), percentage: sevPercents[3] },
            critical:  { km2: +sevAreasKm2[4].toFixed(1), percentage: sevPercents[4] }
          }
        },
        metadata: {
          dataSource: 'VIIRS+GHSL+GSW',
          resolution: `${analysisScale}m`,
          yearPeriod: `${year}`,
          algorithm: 'EAP = sqrt(0.6*BuiltSurfaceScaled + 0.4*BuiltVolumeScaled) * (1 - NTL_log_scaled)',
          method: 'Quantile classification with robust rescaling; area-based stats',
          notes: 'Viz unmasked to fill non-analyzed pixels with neutral color (green end)',
          qualityMetrics: {
            coveragePercent: +((coverage * 100).toFixed(1)),
            ntlImagesUsed: ntlCount,
            degeneratePercentiles: false
          }
        }
      };

    } catch (error) {
      console.error('❌ Error in Energy Access Proxy analysis:', error);
      
      if (error.message.includes('User memory limit exceeded')) {
        throw new Error('Area too large for processing. Please try a smaller region.');
      } else if (error.message.includes('Computation timed out')) {
        throw new Error('Processing timed out. Please try a smaller area.');
      } else {
        throw new Error(`Failed to process energy access data: ${error.message}`);
      }
    }
  }