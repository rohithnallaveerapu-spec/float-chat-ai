export type OceanRegion =
  | 'Arabian Sea'
  | 'Bay of Bengal'
  | 'Indian Ocean'
  | 'North Atlantic'
  | 'South Atlantic'
  | 'Equatorial Pacific'
  | 'Southern Ocean'
  | 'Arctic Ocean'
  | 'Subarctic Pacific'
  | 'Mediterranean Sea'
  | 'Caribbean Sea';

export type QueryIntent =
  | 'FLOAT_SEARCH'
  | 'FLOAT_TRAJECTORY'
  | 'PROFILE_ANALYSIS'
  | 'TEMPERATURE_ANALYSIS'
  | 'SALINITY_ANALYSIS'
  | 'PRESSURE_DEPTH_ANALYSIS'
  | 'TIME_SERIES'
  | 'SPATIAL_ANALYSIS'
  | 'REGION_COMPARISON'
  | 'ANOMALY_DETECTION'
  | 'STATISTICAL_ANALYSIS'
  | 'DATASET_INFORMATION'
  | 'GENERAL_OCEANOGRAPHY';

export type QCStatus = 'PASSED' | 'DELAYED' | 'EXCLUDED';

export interface TrajectoryPoint {
  timestamp: string;
  lat: number;
  lon: number;
  cycle_number: number;
  depth_m: number;
}

export interface ArgoFloat {
  float_id: string; // e.g. "2901234"
  platform_number: string;
  ocean_region: OceanRegion;
  country: string;
  institution: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DELAYED';
  deployment_date: string;
  lat: number;
  lon: number;
  latest_observation: string;
  latest_temp_c: number;
  latest_salinity_psu: number;
  latest_depth_m: number;
  total_profiles: number;
  temp_range: [number, number];
  salinity_range: [number, number];
  qc_status: QCStatus;
  trajectory: TrajectoryPoint[];
}

export interface Measurement {
  measurement_id: string;
  depth_m: number;
  pressure_dbar: number;
  temperature_c: number;
  salinity_psu: number;
  temp_qc: number; // 1 = good, 2 = probably good, 4 = bad
  salinity_qc: number;
}

export interface ArgoProfile {
  profile_id: string;
  float_id: string;
  timestamp: string;
  lat: number;
  lon: number;
  cycle_number: number;
  ocean_region: OceanRegion;
  measurements: Measurement[];
  mixed_layer_depth_m: number;
  thermocline_depth_m: [number, number];
  qc_status: QCStatus;
  excluded_measurements_count: number;
}

export interface StructuredQuery {
  parameter: 'temperature' | 'salinity' | 'pressure' | 'both' | 'all';
  region?: OceanRegion | string;
  secondary_region?: OceanRegion | string;
  start_date?: string;
  end_date?: string;
  depth_min?: number | null;
  depth_max?: number | null;
  float_ids?: string[];
  aggregation?: 'average' | 'median' | 'min' | 'max' | 'anomaly' | 'comparison' | 'raw';
  group_by?: 'date' | 'depth' | 'region' | 'float';
  visualization: 'depth_profile' | 'time_series' | 'spatial_map' | 'trajectory' | 'anomaly_map' | 'comparative_anomaly' | 'bio_distribution' | 'bar_chart';
  spatial_radius_km?: number;
  center_lat?: number;
  center_lon?: number;
  lat_min?: number;
  lat_max?: number;
  lon_min?: number;
  lon_max?: number;
  time_range_label?: string;
}

export interface VisualizationSpec {
  visualization_type: StructuredQuery['visualization'];
  title: string;
  x_label?: string;
  y_label?: string;
  unit_x?: string;
  unit_y?: string;
  invert_y_axis?: boolean;
  series?: Array<{
    name: string;
    color?: string;
    data: Array<Record<string, number | string>>;
  }>;
  map_center?: [number, number];
  map_zoom?: number;
  highlight_floats?: string[];
  anomaly_delta_c?: number;
  baseline_temp_c?: number;
  notes?: string;
}

export interface DataProvenance {
  source_dataset: string;
  data_provider: string;
  query_timestamp: string;
  profiles_analyzed: number;
  floats_involved: number;
  total_observations: number;
  excluded_qc_count: number;
  processing_latency_ms: number;
  filters_applied: string[];
  generated_sql: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  intent?: QueryIntent;
  structuredQuery?: StructuredQuery;
  resultSummary?: {
    profiles_analyzed: number;
    floats_involved: number;
    mean_value?: string;
    depth_range?: string;
    date_range?: string;
  };
  visualizationSpec?: VisualizationSpec;
  explanation?: string;
  provenance?: DataProvenance;
  followUpSuggestions?: string[];
  generatedImage?: {
    url: string;
    prompt: string;
    aspectRatio?: string;
  };
  isDemo?: boolean;
}

export interface SavedQuery {
  id: string;
  name: string;
  userPrompt: string;
  timestamp: string;
  structuredQuery: StructuredQuery;
}

export interface OceanRegionStats {
  region: OceanRegion;
  active_floats: number;
  avg_surface_temp_c: number;
  avg_salinity_psu: number;
  temperature_anomaly_c: number;
  data_quality_pass_rate: number;
  lat_bounds: [number, number];
  lon_bounds: [number, number];
}
