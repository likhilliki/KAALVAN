export interface ForestRegion {
  code: string;
  name: string;
  country: string;
  biome_type: string;
  latitude: float;
  longitude: float;
  area_sqkm: number;
  canopy_loss_pct: number;
  protected_status: string;
  carbon_stock_mt: number;
  critical_threshold: number;
  coordinates_polygon?: [number, number][];
}

export type float = number;

export interface SearchResult {
  id: number | null;
  code: string | null;
  name: string;
  country: string | null;
  type: string; // "biome" | "coordinate" | "protected_area"
  latitude: number;
  longitude: number;
  description: string | null;
  highlight_color: string | null;
}

export interface WeatherData {
  status: string;
  temperature_c?: number;
  relative_humidity_pct?: number;
  wind_speed_kmh?: number;
  wind_gusts_kmh?: number;
  precipitation_mm?: number;
  soil_moisture_surface_m3?: number;
  vapor_pressure_deficit_kpa?: number;
  fire_weather_index?: number;
  forecast_max_temp_c?: number;
  forecast_rain_prob_pct?: number;
  observation_timestamp?: string;
}

export interface AirQualityData {
  status: string;
  pm2_5_ugm3?: number;
  pm10_ugm3?: number;
  carbon_monoxide_ugm3?: number;
  nitrogen_dioxide_ugm3?: number;
  european_aqi?: number;
  aerosol_optical_depth?: number;
  observation_timestamp?: string;
}

export interface FirmsThermalAnomaly {
  latitude: number;
  longitude: number;
  brightness_kelvin?: number;
  frp_mw?: number;
  confidence?: string;
  satellite: string;
  acquisition_date: string;
  acquisition_time: string;
  daynight: string;
}

export interface ForestCoverStats {
  status: string;
  primary_forest_area_sqkm: number;
  canopy_density_pct: number;
  tree_loss_rate_annual_pct: number;
  historical_loss_hectares_5yr: number;
  carbon_stock_density_t_ha: number;
  protected_area_overlap_pct: number;
  source: string;
}

export interface SourceAttribution {
  provider: string;
  dataset: string;
  observation_time: string;
  last_refresh_time: string;
  status: string;
  api_endpoint?: string;
  license?: string;
}

export interface EnvironmentalReport {
  region_code: string;
  region_name: string;
  country: string;
  latitude: number;
  longitude: number;
  weather: WeatherData;
  air_quality: AirQualityData;
  thermal_anomalies: FirmsThermalAnomaly[];
  forest_cover: ForestCoverStats;
  attributions: SourceAttribution[];
  generated_at: string;
}

export interface RiskFactor {
  name: string;
  weight_pct: number;
  observed_metric: string;
  impact_level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'NEUTRAL' | 'PROTECTIVE';
  explanation: string;
}

export interface ModelBenchmark {
  model_name: string;
  model_type: string;
  training_dataset: string;
  evaluation_sample_size: number;
  roc_auc: number;
  f1_score: number;
  r2_score: number;
  mean_absolute_error: number;
  validation_status: string;
  last_benchmarked: string;
}

export interface RiskAssessment {
  region_code: string;
  risk_score: number;
  risk_level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  stress_index: number;
  fire_spread_risk_24h: number;
  model_classification: string;
  confidence_score: number;
  explainable_factors: RiskFactor[];
  evaluation_benchmark?: ModelBenchmark;
  recommended_interventions: string[];
  assessed_at: string;
}

export interface PriorityAlert {
  id: string;
  region_code: string;
  region_name: string;
  alert_type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  frp_mw?: number;
  confidence: number;
  source: string;
  timestamp: string;
}

export interface LinuxONETelemetry {
  status: string;
  platform_name: string;
  detected_architecture: string;
  is_s390x_native: boolean;
  byte_order: string;
  processor_model: string;
  ai_on_chip_acceleration: string;
  confidential_computing: string;
  memory_integrity: string;
  container_runtime: string;
  orchestration_target: string;
  enterprise_resilience: string;
  timestamp: string;
}

export interface ActiveLayers {
  firmsHotspots: boolean;
  riskHeatmap: boolean;
  forestCanopy: boolean;
  weatherOverlay: boolean;
  nightAtmosphere: boolean;
  forestBoundaries: boolean;
  protectedAreas: boolean;
  satelliteFires: boolean;
  vegetationHealth: boolean;
  environmentalRisk: boolean;
}

export interface ComprehensiveRegionalReport {
  region_id: string;
  region_code: string;
  region_name: string;
  country: string;
  biome_type: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  area_sqkm: number;
  protected_status: string;
  carbon_stock_mt: number;
  risk_assessment: {
    risk_score: number;
    risk_level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
    canopy_stress_index: number;
    fire_spread_risk_24h_pct: number;
    model_confidence_pct: number;
    model_classification: string;
    explainable_factors: RiskFactor[];
  };
  observed_fire_detections: {
    status: string;
    detections_count: number;
    highest_frp_mw: number;
    recent_hotspots: FirmsThermalAnomaly[];
  };
  meteorology_and_forecast: {
    observed: Record<string, any>;
    forecast_24h: Record<string, any>;
    air_quality_cams: Record<string, any>;
  };
  forest_health: ForestCoverStats;
  contributing_risk_factors: RiskFactor[];
  data_provenance: SourceAttribution[];
  confidence_and_limitations: {
    overall_data_coverage_pct: number;
    confidence_score: number;
    limitations: string[];
  };
  executive_summary_narrative: string;
  recommended_tactical_interventions: string[];
  report_generated_at: string;
}

export interface MapLayerItem {
  id: string;
  name: string;
  category: string;
  provider: string;
  spatial_resolution: string;
  temporal_resolution: string;
  status: string;
  default_enabled: boolean;
  description: string;
  license: string;
}

