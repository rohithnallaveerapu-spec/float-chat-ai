import { StructuredQuery, QueryIntent } from '../types';

export function classifyIntent(prompt: string): { intent: QueryIntent; structured: StructuredQuery } {
  const p = prompt.toLowerCase();

  let intent: QueryIntent = 'PROFILE_ANALYSIS';
  let vis: StructuredQuery['visualization'] = 'depth_profile';
  let region: string = 'Arabian Sea';
  let secondaryRegion: string | undefined = undefined;
  let param: StructuredQuery['parameter'] = 'both';

  // Region detection
  if (p.includes('bay of bengal')) {
    region = 'Bay of Bengal';
  } else if (p.includes('arabian sea')) {
    region = 'Arabian Sea';
  } else if (p.includes('north atlantic')) {
    region = 'North Atlantic';
  } else if (p.includes('indian ocean')) {
    region = 'Indian Ocean';
  } else if (p.includes('southern ocean')) {
    region = 'Southern Ocean';
  } else if (p.includes('equatorial pacific') || p.includes('pacific')) {
    region = 'Equatorial Pacific';
  } else if (p.includes('arctic')) {
    region = 'Arctic Ocean';
  } else if (p.includes('mediterranean')) {
    region = 'Mediterranean Sea';
  }

  // Secondary region for comparison
  if (p.includes('compare') || p.includes('vs') || p.includes('versus') || p.includes('two oceans') || p.includes('both regions')) {
    if (p.includes('bay of bengal') && p.includes('arabian sea')) {
      region = 'Arabian Sea';
      secondaryRegion = 'Bay of Bengal';
    } else if (p.includes('north atlantic') && (p.includes('arabian sea') || p.includes('bay of bengal'))) {
      region = 'North Atlantic';
      secondaryRegion = p.includes('bay of bengal') ? 'Bay of Bengal' : 'Arabian Sea';
    } else if (!secondaryRegion) {
      // Default ocean pair if general comparison requested
      if (region === 'Bay of Bengal') {
        secondaryRegion = 'Arabian Sea';
      } else {
        region = 'Arabian Sea';
        secondaryRegion = 'Bay of Bengal';
      }
    }
    intent = 'REGION_COMPARISON';
    vis = 'comparative_anomaly';
  }

  // Parameter detection (with common typo resilience e.g. "salanity", "psu")
  if ((p.includes('salinity') || p.includes('salanity') || p.includes('psu') || p.includes('salt')) && !(p.includes('temp') || p.includes('heat') || p.includes('thermal'))) {
    param = 'salinity';
  } else if (p.includes('temp') || p.includes('heat') || p.includes('thermal')) {
    param = 'temperature';
  }

  // Time Window / Time Series detection (e.g. "last 3 month", "last 3 mounth", "6 months", "time series")
  let timeRangeLabel = 'Last 12 Months';
  let startDate = '2024-03-01';
  let endDate = '2025-03-01';

  if (p.match(/3\s*(?:month|mounth|mo)/) || p.includes('last 3')) {
    timeRangeLabel = 'Last 3 Months';
    startDate = '2024-12-01';
    endDate = '2025-03-01';
    intent = 'TIME_SERIES';
    vis = 'time_series';
  } else if (p.match(/6\s*(?:month|mounth|mo)/) || p.includes('last 6')) {
    timeRangeLabel = 'Last 6 Months';
    startDate = '2024-09-01';
    endDate = '2025-03-01';
    intent = 'TIME_SERIES';
    vis = 'time_series';
  } else if (p.match(/1\s*(?:month|mounth|mo)/) || p.includes('last month') || p.includes('last 1')) {
    timeRangeLabel = 'Last 1 Month';
    startDate = '2025-02-01';
    endDate = '2025-03-01';
    intent = 'TIME_SERIES';
    vis = 'time_series';
  } else if (p.match(/12\s*(?:month|mounth|mo)/) || p.includes('last year') || p.includes('1 year')) {
    timeRangeLabel = 'Last 12 Months';
    startDate = '2024-03-01';
    endDate = '2025-03-01';
    intent = 'TIME_SERIES';
    vis = 'time_series';
  }

  // Intent & Visualization mapping
  if (p.includes('anomaly') || p.includes('unusual') || p.includes('deviation')) {
    intent = 'ANOMALY_DETECTION';
    vis = secondaryRegion ? 'comparative_anomaly' : 'anomaly_map';
  } else if (p.includes('trajectory') || p.includes('path') || p.includes('track')) {
    intent = 'FLOAT_TRAJECTORY';
    vis = 'trajectory';
  } else if (p.includes('map') || p.includes('show argo floats') || p.includes('where are') || p.includes('find floats')) {
    intent = 'FLOAT_SEARCH';
    vis = 'spatial_map';
  } else if (p.includes('time') || p.includes('change') || p.includes('trend') || p.includes('january') || p.includes('2025') || p.includes('depths') || p.includes('10m')) {
    intent = 'TIME_SERIES';
    vis = 'time_series';
  } else if (p.includes('compare') || secondaryRegion) {
    intent = 'REGION_COMPARISON';
    vis = 'comparative_anomaly';
  }

  // Extract float ID if mentioned
  const floatMatch = prompt.match(/\b\d{7}\b/);
  const floatIds = floatMatch ? [floatMatch[0]] : undefined;

  // Extract Latitudes and Longitudes (e.g. "lat 15 lon 64", "15.4N, 68.2E", "lat 10 to 20, lon 60 to 80")
  let centerLat: number | undefined = undefined;
  let centerLon: number | undefined = undefined;
  let latMin: number | undefined = undefined;
  let latMax: number | undefined = undefined;
  let lonMin: number | undefined = undefined;
  let lonMax: number | undefined = undefined;

  // Pattern 1: Lat range "lat 10 to 20" or "latitude 10-20"
  const latRangeMatch = p.match(/(?:lat|latitude)\s*(?:between|from)?\s*(-?\d+\.?\d*)\s*(?:to|-|and)\s*(-?\d+\.?\d*)/i);
  if (latRangeMatch) {
    const l1 = parseFloat(latRangeMatch[1]);
    const l2 = parseFloat(latRangeMatch[2]);
    latMin = Math.min(l1, l2);
    latMax = Math.max(l1, l2);
    centerLat = (latMin + latMax) / 2;
  }

  // Pattern 2: Lon range "lon 60 to 80" or "longitude 60-80"
  const lonRangeMatch = p.match(/(?:lon|long|longitude)\s*(?:between|from)?\s*(-?\d+\.?\d*)\s*(?:to|-|and)\s*(-?\d+\.?\d*)/i);
  if (lonRangeMatch) {
    const l1 = parseFloat(lonRangeMatch[1]);
    const l2 = parseFloat(lonRangeMatch[2]);
    lonMin = Math.min(l1, l2);
    lonMax = Math.max(l1, l2);
    centerLon = (lonMin + lonMax) / 2;
  }

  // Pattern 3: Single Lat/Lon points "lat 15.4", "lon 68.2" or "15.4N, 68.2E" or "lat: 15, lon: 65"
  if (centerLat === undefined) {
    const singleLatMatch = p.match(/(?:lat|latitude)\s*[:=]?\s*(-?\d+\.?\d*)\s*([ns])?/i) || p.match(/(-?\d+\.?\d*)\s*°?\s*([ns])/i);
    if (singleLatMatch) {
      let val = parseFloat(singleLatMatch[1]);
      if (singleLatMatch[2] && singleLatMatch[2].toLowerCase() === 's') val = -val;
      centerLat = val;
    }
  }

  if (centerLon === undefined) {
    const singleLonMatch = p.match(/(?:lon|long|longitude)\s*[:=]?\s*(-?\d+\.?\d*)\s*([ew])?/i) || p.match(/(-?\d+\.?\d*)\s*°?\s*([ew])/i);
    if (singleLonMatch) {
      let val = parseFloat(singleLonMatch[1]);
      if (singleLonMatch[2] && singleLonMatch[2].toLowerCase() === 'w') val = -val;
      centerLon = val;
    }
  }

  // Pattern 4: Coordinate pair e.g. "15.42, 68.18"
  if (centerLat === undefined && centerLon === undefined) {
    const coordPairMatch = p.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
    if (coordPairMatch) {
      centerLat = parseFloat(coordPairMatch[1]);
      centerLon = parseFloat(coordPairMatch[2]);
    }
  }

  // If explicit lat/lon coordinates detected, switch intent and visualization
  if (centerLat !== undefined || centerLon !== undefined || latMin !== undefined) {
    intent = 'SPATIAL_ANALYSIS';
    vis = 'spatial_map';
  }

  const structured: StructuredQuery = {
    parameter: param,
    region,
    secondary_region: secondaryRegion,
    start_date: startDate,
    end_date: endDate,
    time_range_label: timeRangeLabel,
    depth_min: 0,
    depth_max: 2000,
    float_ids: floatIds,
    aggregation: intent === 'ANOMALY_DETECTION' ? 'anomaly' : 'average',
    group_by: vis === 'time_series' ? 'date' : 'depth',
    visualization: vis,
    center_lat: centerLat,
    center_lon: centerLon,
    lat_min: latMin,
    lat_max: latMax,
    lon_min: lonMin,
    lon_max: lonMax,
    spatial_radius_km: (centerLat !== undefined || centerLon !== undefined) ? 500 : undefined,
  };

  return { intent, structured };
}
