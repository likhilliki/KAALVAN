from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class SourceAttribution(BaseModel):
    provider: str            # e.g., "NASA FIRMS", "Open-Meteo", "Copernicus/GFW"
    dataset: str             # e.g., "VIIRS S-NPP 375m", "ECMWF IFS / GFS Seamless"
    observation_time: str    # ISO timestamp or UTC observation string
    last_refresh_time: str   # ISO timestamp of backend fetch
    status: str              # "LIVE_ACTIVE", "CACHED_AUTHENTIC", "API_DEGRADED", "UNAVAILABLE"
    api_endpoint: Optional[str] = None
    license: Optional[str] = "Open Geospatial Research / Attribution Required"


class FirmsThermalAnomaly(BaseModel):
    latitude: float
    longitude: float
    brightness_kelvin: Optional[float] = None
    frp_mw: Optional[float] = None             # Fire Radiative Power (MW)
    confidence: Optional[str] = "nominal"     # "low", "nominal", "high" or %
    satellite: str = "VIIRS (NOAA-20)"        # VIIRS / MODIS
    acquisition_date: str
    acquisition_time: str
    daynight: str = "D"
    observation_time: Optional[str] = None    # UTC observation timestamp
    fetch_time: Optional[str] = None          # Backend API fetch timestamp
    observation_age_hours: Optional[float] = None  # Age of observation relative to fetch


class WeatherData(BaseModel):
    status: str = "LIVE_ACTIVE"  # LIVE_ACTIVE, CACHED, UNAVAILABLE
    temperature_c: Optional[float] = None
    relative_humidity_pct: Optional[float] = None
    wind_speed_kmh: Optional[float] = None
    wind_gusts_kmh: Optional[float] = None
    precipitation_mm: Optional[float] = None
    soil_moisture_surface_m3: Optional[float] = None
    vapor_pressure_deficit_kpa: Optional[float] = None
    fire_weather_index: Optional[float] = None
    forecast_max_temp_c: Optional[float] = None
    forecast_rain_prob_pct: Optional[float] = None
    observation_timestamp: Optional[str] = None


class AirQualityData(BaseModel):
    status: str = "LIVE_ACTIVE"
    pm2_5_ugm3: Optional[float] = None
    pm10_ugm3: Optional[float] = None
    carbon_monoxide_ugm3: Optional[float] = None
    nitrogen_dioxide_ugm3: Optional[float] = None
    european_aqi: Optional[int] = None
    aerosol_optical_depth: Optional[float] = None
    observation_timestamp: Optional[str] = None


class ForestCoverStats(BaseModel):
    status: str = "LIVE_ACTIVE"
    primary_forest_area_sqkm: float
    canopy_density_pct: float
    tree_loss_rate_annual_pct: float
    historical_loss_hectares_5yr: float
    carbon_stock_density_t_ha: float
    protected_area_overlap_pct: float
    source: str = "Hansen Global Forest Watch (GFW) / Hansen v1.11 / Copernicus GLC"


class EnvironmentalReport(BaseModel):
    region_code: str
    region_name: str
    country: str
    latitude: float
    longitude: float
    weather: WeatherData
    air_quality: AirQualityData
    thermal_anomalies: List[FirmsThermalAnomaly] = []
    forest_cover: ForestCoverStats
    attributions: List[SourceAttribution] = []
    generated_at: str
