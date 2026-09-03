import { ArgoFloat, ArgoProfile, OceanRegion, OceanRegionStats, Measurement } from '../types';

// Helper to generate realistic depth measurements
function generateDepthMeasurements(
  surfaceTemp: number,
  surfaceSalinity: number,
  isAnomaly: boolean = false,
  tempOffset: number = 0
): Measurement[] {
  const depths = [0, 10, 25, 50, 75, 100, 150, 200, 300, 400, 500, 750, 1000, 1250, 1500, 1750, 2000];
  
  return depths.map((d, index) => {
    // Temperature drops exponentially through the thermocline (100m to 800m) down to deep water (~2-4°C)
    let temp = surfaceTemp + tempOffset;
    if (d > 0 && d <= 100) {
      temp -= (d / 100) * 1.5;
    } else if (d > 100 && d <= 800) {
      const dropRatio = Math.log10(d / 100) / Math.log10(8);
      temp = (surfaceTemp - 1.5 + tempOffset) - dropRatio * (surfaceTemp - 5.5 + tempOffset);
    } else {
      temp = 4.2 - Math.log10(d / 800) * 1.1 + (Math.random() * 0.2 - 0.1);
    }
    
    // Salinity profile: often lower at surface, increases in halocline, stabilizes around 34.5-35.5 PSU
    let salinity = surfaceSalinity;
    if (d > 0 && d <= 300) {
      salinity += Math.sin((d / 300) * Math.PI) * 0.4;
    } else if (d > 300) {
      salinity = surfaceSalinity + 0.3 - (d / 2000) * 0.2;
    }

    // Add subtle noise
    const noiseT = (Math.sin(d / 50) * 0.15);
    const noiseS = (Math.cos(d / 40) * 0.05);

    // Random QC flags (mostly 1 = PASSED, 2% bad = 4)
    const isBad = Math.random() < 0.03 && d > 1200;

    return {
      measurement_id: `m_${d}_${Math.floor(Math.random() * 10000)}`,
      depth_m: d,
      pressure_dbar: Math.round(d * 1.005),
      temperature_c: Number((temp + noiseT).toFixed(2)),
      salinity_psu: Number((salinity + noiseS).toFixed(2)),
      temp_qc: isBad ? 4 : 1,
      salinity_qc: isBad ? 4 : 1,
    };
  });
}

export const DEMO_FLOATS: ArgoFloat[] = [
  {
    float_id: '2901234',
    platform_number: 'WM0-2901234',
    ocean_region: 'Arabian Sea',
    country: 'India',
    institution: 'INCOIS / NIO',
    status: 'ACTIVE',
    deployment_date: '2023-04-12',
    lat: 15.42,
    lon: 64.18,
    latest_observation: '2025-03-28T14:30:00Z',
    latest_temp_c: 26.8,
    latest_salinity_psu: 36.2,
    latest_depth_m: 5,
    total_profiles: 142,
    temp_range: [4.1, 28.5],
    salinity_range: [34.8, 36.8],
    qc_status: 'PASSED',
    trajectory: [
      { timestamp: '2025-02-28T10:00:00Z', lat: 14.80, lon: 63.20, cycle_number: 138, depth_m: 5 },
      { timestamp: '2025-03-08T10:00:00Z', lat: 15.02, lon: 63.55, cycle_number: 139, depth_m: 5 },
      { timestamp: '2025-03-18T10:00:00Z', lat: 15.25, lon: 63.88, cycle_number: 140, depth_m: 5 },
      { timestamp: '2025-03-28T14:30:00Z', lat: 15.42, lon: 64.18, cycle_number: 141, depth_m: 5 },
    ]
  },
  {
    float_id: '5906214',
    platform_number: 'WMO-5906214',
    ocean_region: 'North Atlantic',
    country: 'USA',
    institution: 'NOAA / AOML',
    status: 'ACTIVE',
    deployment_date: '2022-09-18',
    lat: 38.50,
    lon: -42.10,
    latest_observation: '2025-03-29T08:15:00Z',
    latest_temp_c: 21.4,
    latest_salinity_psu: 35.8,
    latest_depth_m: 10,
    total_profiles: 210,
    temp_range: [3.8, 23.2],
    salinity_range: [34.9, 36.1],
    qc_status: 'PASSED',
    trajectory: [
      { timestamp: '2025-02-27T08:00:00Z', lat: 37.90, lon: -43.20, cycle_number: 206, depth_m: 10 },
      { timestamp: '2025-03-09T08:00:00Z', lat: 38.10, lon: -42.80, cycle_number: 207, depth_m: 10 },
      { timestamp: '2025-03-19T08:00:00Z', lat: 38.32, lon: -42.45, cycle_number: 208, depth_m: 10 },
      { timestamp: '2025-03-29T08:15:00Z', lat: 38.50, lon: -42.10, cycle_number: 209, depth_m: 10 },
    ]
  },
  {
    float_id: '2904581',
    platform_number: 'WMO-2904581',
    ocean_region: 'Bay of Bengal',
    country: 'India',
    institution: 'NIOT / INCOIS',
    status: 'ACTIVE',
    deployment_date: '2023-11-05',
    lat: 13.12,
    lon: 87.45,
    latest_observation: '2025-03-27T18:00:00Z',
    latest_temp_c: 28.2,
    latest_salinity_psu: 33.4,
    latest_depth_m: 5,
    total_profiles: 98,
    temp_range: [4.5, 29.8],
    salinity_range: [32.1, 35.1],
    qc_status: 'PASSED',
    trajectory: [
      { timestamp: '2025-02-25T18:00:00Z', lat: 12.65, lon: 86.80, cycle_number: 94, depth_m: 5 },
      { timestamp: '2025-03-07T18:00:00Z', lat: 12.80, lon: 87.05, cycle_number: 95, depth_m: 5 },
      { timestamp: '2025-03-17T18:00:00Z', lat: 12.98, lon: 87.25, cycle_number: 96, depth_m: 5 },
      { timestamp: '2025-03-27T18:00:00Z', lat: 13.12, lon: 87.45, cycle_number: 97, depth_m: 5 },
    ]
  },
  {
    float_id: '7901300',
    platform_number: 'WMO-7901300',
    ocean_region: 'Southern Ocean',
    country: 'Australia',
    institution: 'CSIRO / Bureau of Meteorology',
    status: 'ACTIVE',
    deployment_date: '2021-01-20',
    lat: -54.20,
    lon: 112.50,
    latest_observation: '2025-03-29T02:40:00Z',
    latest_temp_c: 4.8,
    latest_salinity_psu: 33.9,
    latest_depth_m: 10,
    total_profiles: 312,
    temp_range: [1.2, 8.5],
    salinity_range: [33.4, 34.7],
    qc_status: 'PASSED',
    trajectory: [
      { timestamp: '2025-03-01T02:00:00Z', lat: -54.80, lon: 111.20, cycle_number: 308, depth_m: 10 },
      { timestamp: '2025-03-11T02:00:00Z', lat: -54.60, lon: 111.70, cycle_number: 309, depth_m: 10 },
      { timestamp: '2025-03-20T02:00:00Z', lat: -54.40, lon: 112.10, cycle_number: 310, depth_m: 10 },
      { timestamp: '2025-03-29T02:40:00Z', lat: -54.20, lon: 112.50, cycle_number: 311, depth_m: 10 },
    ]
  },
  {
    float_id: '6903241',
    platform_number: 'WMO-6903241',
    ocean_region: 'Equatorial Pacific',
    country: 'France',
    institution: 'Ifremer / Argo France',
    status: 'ACTIVE',
    deployment_date: '2022-03-15',
    lat: 1.20,
    lon: -140.30,
    latest_observation: '2025-03-26T11:20:00Z',
    latest_temp_c: 27.4,
    latest_salinity_psu: 35.1,
    latest_depth_m: 5,
    total_profiles: 185,
    temp_range: [4.0, 29.2],
    salinity_range: [34.5, 35.6],
    qc_status: 'DELAYED',
    trajectory: [
      { timestamp: '2025-02-24T11:00:00Z', lat: 1.05, lon: -141.50, cycle_number: 181, depth_m: 5 },
      { timestamp: '2025-03-06T11:00:00Z', lat: 1.10, lon: -141.10, cycle_number: 182, depth_m: 5 },
      { timestamp: '2025-03-16T11:00:00Z', lat: 1.15, lon: -140.70, cycle_number: 183, depth_m: 5 },
      { timestamp: '2025-03-26T11:20:00Z', lat: 1.20, lon: -140.30, cycle_number: 184, depth_m: 5 },
    ]
  },
  {
    float_id: '4903322',
    platform_number: 'WMO-4903322',
    ocean_region: 'Arctic Ocean',
    country: 'Canada',
    institution: 'DFO Canada',
    status: 'ACTIVE',
    deployment_date: '2023-08-14',
    lat: 78.40,
    lon: -125.10,
    latest_observation: '2025-03-28T05:00:00Z',
    latest_temp_c: 0.4,
    latest_salinity_psu: 31.8,
    latest_depth_m: 5,
    total_profiles: 76,
    temp_range: [-1.8, 3.2],
    salinity_range: [30.5, 34.6],
    qc_status: 'PASSED',
    trajectory: [
      { timestamp: '2025-02-26T05:00:00Z', lat: 78.10, lon: -126.20, cycle_number: 72, depth_m: 5 },
      { timestamp: '2025-03-08T05:00:00Z', lat: 78.22, lon: -125.80, cycle_number: 73, depth_m: 5 },
      { timestamp: '2025-03-18T05:00:00Z', lat: 78.32, lon: -125.40, cycle_number: 74, depth_m: 5 },
      { timestamp: '2025-03-28T05:00:00Z', lat: 78.40, lon: -125.10, cycle_number: 75, depth_m: 5 },
    ]
  },
  {
    float_id: '3901988',
    platform_number: 'WMO-3901988',
    ocean_region: 'Subarctic Pacific',
    country: 'Japan',
    institution: 'JAMSTEC',
    status: 'ACTIVE',
    deployment_date: '2022-06-30',
    lat: 50.15,
    lon: 165.40,
    latest_observation: '2025-03-29T16:00:00Z',
    latest_temp_c: 11.2,
    latest_salinity_psu: 33.1,
    latest_depth_m: 5,
    total_profiles: 164,
    temp_range: [2.1, 14.5],
    salinity_range: [32.4, 34.5],
    qc_status: 'PASSED',
    trajectory: [
      { timestamp: '2025-02-27T16:00:00Z', lat: 49.80, lon: 164.20, cycle_number: 160, depth_m: 5 },
      { timestamp: '2025-03-09T16:00:00Z', lat: 49.92, lon: 164.60, cycle_number: 161, depth_m: 5 },
      { timestamp: '2025-03-19T16:00:00Z', lat: 50.04, lon: 165.00, cycle_number: 162, depth_m: 5 },
      { timestamp: '2025-03-29T16:00:00Z', lat: 50.15, lon: 165.40, cycle_number: 163, depth_m: 5 },
    ]
  },
  {
    float_id: '1902410',
    platform_number: 'WMO-1902410',
    ocean_region: 'Mediterranean Sea',
    country: 'Italy',
    institution: 'OGS Trieste',
    status: 'ACTIVE',
    deployment_date: '2023-01-10',
    lat: 36.80,
    lon: 18.20,
    latest_observation: '2025-03-29T20:10:00Z',
    latest_temp_c: 18.5,
    latest_salinity_psu: 38.6,
    latest_depth_m: 5,
    total_profiles: 124,
    temp_range: [13.2, 26.4],
    salinity_range: [37.8, 39.1],
    qc_status: 'PASSED',
    trajectory: [
      { timestamp: '2025-03-01T20:00:00Z', lat: 36.50, lon: 17.60, cycle_number: 120, depth_m: 5 },
      { timestamp: '2025-03-10T20:00:00Z', lat: 36.62, lon: 17.80, cycle_number: 121, depth_m: 5 },
      { timestamp: '2025-03-19T20:00:00Z', lat: 36.71, lon: 18.00, cycle_number: 122, depth_m: 5 },
      { timestamp: '2025-03-29T20:10:00Z', lat: 36.80, lon: 18.20, cycle_number: 123, depth_m: 5 },
    ]
  }
];

export const DEMO_REGION_STATS: Record<OceanRegion, OceanRegionStats> = {
  'Arabian Sea': {
    region: 'Arabian Sea',
    active_floats: 74,
    avg_surface_temp_c: 26.8,
    avg_salinity_psu: 36.2,
    temperature_anomaly_c: 1.1,
    data_quality_pass_rate: 98.4,
    lat_bounds: [8, 24],
    lon_bounds: [50, 78],
  },
  'Bay of Bengal': {
    region: 'Bay of Bengal',
    active_floats: 62,
    avg_surface_temp_c: 28.2,
    avg_salinity_psu: 33.4,
    temperature_anomaly_c: 1.3,
    data_quality_pass_rate: 97.9,
    lat_bounds: [5, 23],
    lon_bounds: [80, 98],
  },
  'Indian Ocean': {
    region: 'Indian Ocean',
    active_floats: 420,
    avg_surface_temp_c: 25.4,
    avg_salinity_psu: 35.1,
    temperature_anomaly_c: 0.9,
    data_quality_pass_rate: 98.8,
    lat_bounds: [-45, 25],
    lon_bounds: [20, 120],
  },
  'North Atlantic': {
    region: 'North Atlantic',
    active_floats: 890,
    avg_surface_temp_c: 19.8,
    avg_salinity_psu: 35.8,
    temperature_anomaly_c: 2.4,
    data_quality_pass_rate: 99.1,
    lat_bounds: [0, 60],
    lon_bounds: [-80, 0],
  },
  'South Atlantic': {
    region: 'South Atlantic',
    active_floats: 380,
    avg_surface_temp_c: 18.2,
    avg_salinity_psu: 35.4,
    temperature_anomaly_c: 0.6,
    data_quality_pass_rate: 98.2,
    lat_bounds: [-60, 0],
    lon_bounds: [-70, 20],
  },
  'Equatorial Pacific': {
    region: 'Equatorial Pacific',
    active_floats: 650,
    avg_surface_temp_c: 27.4,
    avg_salinity_psu: 35.1,
    temperature_anomaly_c: 1.4,
    data_quality_pass_rate: 98.0,
    lat_bounds: [-10, 10],
    lon_bounds: [120, -80],
  },
  'Southern Ocean': {
    region: 'Southern Ocean',
    active_floats: 580,
    avg_surface_temp_c: 4.8,
    avg_salinity_psu: 33.9,
    temperature_anomaly_c: 0.8,
    data_quality_pass_rate: 96.5,
    lat_bounds: [-80, -50],
    lon_bounds: [-180, 180],
  },
  'Arctic Ocean': {
    region: 'Arctic Ocean',
    active_floats: 110,
    avg_surface_temp_c: 0.4,
    avg_salinity_psu: 31.8,
    temperature_anomaly_c: 0.4,
    data_quality_pass_rate: 95.2,
    lat_bounds: [66, 90],
    lon_bounds: [-180, 180],
  },
  'Subarctic Pacific': {
    region: 'Subarctic Pacific',
    active_floats: 230,
    avg_surface_temp_c: 11.2,
    avg_salinity_psu: 33.1,
    temperature_anomaly_c: 0.7,
    data_quality_pass_rate: 98.1,
    lat_bounds: [40, 66],
    lon_bounds: [140, -120],
  },
  'Mediterranean Sea': {
    region: 'Mediterranean Sea',
    active_floats: 140,
    avg_surface_temp_c: 18.5,
    avg_salinity_psu: 38.6,
    temperature_anomaly_c: 1.2,
    data_quality_pass_rate: 99.0,
    lat_bounds: [30, 46],
    lon_bounds: [-6, 36],
  },
  'Caribbean Sea': {
    region: 'Caribbean Sea',
    active_floats: 85,
    avg_surface_temp_c: 27.6,
    avg_salinity_psu: 36.1,
    temperature_anomaly_c: 1.1,
    data_quality_pass_rate: 98.7,
    lat_bounds: [9, 22],
    lon_bounds: [-88, -60],
  }
};

// Generate realistic depth profile for a float
export function getFloatProfile(floatId: string, customTempOffset: number = 0): ArgoProfile {
  const fl = DEMO_FLOATS.find(f => f.float_id === floatId) || DEMO_FLOATS[0];
  const measurements = generateDepthMeasurements(fl.latest_temp_c, fl.latest_salinity_psu, false, customTempOffset);

  return {
    profile_id: `prof_${fl.float_id}_${fl.total_profiles}`,
    float_id: fl.float_id,
    timestamp: fl.latest_observation,
    lat: fl.lat,
    lon: fl.lon,
    cycle_number: fl.total_profiles,
    ocean_region: fl.ocean_region,
    measurements,
    mixed_layer_depth_m: 42,
    thermocline_depth_m: [120, 650],
    qc_status: fl.qc_status,
    excluded_measurements_count: measurements.filter(m => m.temp_qc > 2 || m.salinity_qc > 2).length,
  };
}

// Pre-configured Hackathon Demo Queries
export const DEMO_PRESET_QUERIES = [
  {
    id: 'demo-1',
    title: '🌊 Explore Indian Ocean Floats',
    prompt: 'Show ARGO floats in the Indian Ocean.',
    category: 'Spatial Exploration',
  },
  {
    id: 'demo-2',
    title: '🌡 Arabian Sea Temperature Profiles',
    prompt: 'Show temperature profiles for floats in the Arabian Sea during March 2025.',
    category: 'Vertical Profiles',
  },
  {
    id: 'demo-3',
    title: '🧂 Salinity Comparison',
    prompt: 'Compare salinity profiles between the Arabian Sea and Bay of Bengal.',
    category: 'Multi-Region Comparison',
  },
  {
    id: 'demo-4',
    title: '📍 Float Trajectory',
    prompt: 'Show the trajectory of float 2901234.',
    category: 'Float Tracking',
  },
  {
    id: 'demo-5',
    title: '🚨 Temperature Anomaly Analysis',
    prompt: 'Find unusual temperature values and anomalies in the North Atlantic.',
    category: 'Anomaly Detection',
  },
  {
    id: 'demo-6',
    title: '📊 Multi-Depth Time Series',
    prompt: 'Compare temperature at 10m, 50m, 100m and 500m depth.',
    category: 'Time Series',
  }
];
