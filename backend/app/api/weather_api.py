from fastapi import APIRouter, Query, HTTPException
from typing import Optional, Dict, Any
from datetime import datetime
from app.services.weather import fetch_weather_and_air_quality

router = APIRouter(tags=["Meteorology & Air Quality"])


@router.get("/weather")
async def get_weather(
    lat: float = Query(..., ge=-90.0, le=90.0, description="Latitude coordinate"),
    lon: float = Query(..., ge=-180.0, le=180.0, description="Longitude coordinate")
):
    """
    Returns real-time surface meteorology, fire weather indices, and atmospheric air quality:
    - High-Resolution ECMWF IFS & NOAA GFS Surface Meteorology (Temp, Humidity, Wind, Soil Moisture, VPD)
    - Canadian Forest Fire Weather Index (FWI) computed under van Wagner (1987) standard
    - 24h Forward Atmospheric Forecast (Max Temp, Rain Probability)
    - Copernicus CAMS Air Quality (PM2.5, PM10, European AQI, CO, NO2)
    - Explicit Source Attributions, timestamps, and data freshness
    """
    result = await fetch_weather_and_air_quality(lat, lon)
    weather = result["weather"]
    air_quality = result["air_quality"]
    attributions = result["attributions"]

    return {
        "coordinates": {
            "latitude": lat,
            "longitude": lon
        },
        "weather_observations": {
            "status": weather.status,
            "temperature_c": weather.temperature_c,
            "relative_humidity_pct": weather.relative_humidity_pct,
            "wind_speed_kmh": weather.wind_speed_kmh,
            "wind_gusts_kmh": weather.wind_gusts_kmh,
            "precipitation_mm": weather.precipitation_mm,
            "surface_soil_moisture_m3": weather.soil_moisture_surface_m3,
            "vapor_pressure_deficit_kpa": weather.vapor_pressure_deficit_kpa,
            "fire_weather_index_fwi": weather.fire_weather_index,
            "observation_timestamp": weather.observation_timestamp
        },
        "forecast_24h": {
            "forecast_max_temp_c": weather.forecast_max_temp_c,
            "precipitation_probability_pct": weather.forecast_rain_prob_pct,
            "label": "24h Forward Model [FORECAST]"
        },
        "atmospheric_air_quality": {
            "status": air_quality.status,
            "pm2_5_ugm3": air_quality.pm2_5_ugm3,
            "pm10_ugm3": air_quality.pm10_ugm3,
            "carbon_monoxide_ugm3": air_quality.carbon_monoxide_ugm3,
            "nitrogen_dioxide_ugm3": air_quality.nitrogen_dioxide_ugm3,
            "european_aqi": air_quality.european_aqi,
            "aerosol_optical_depth_550nm": air_quality.aerosol_optical_depth,
            "observation_timestamp": air_quality.observation_timestamp
        },
        "attributions": attributions,
        "fetched_at": datetime.utcnow().isoformat() + "Z"
    }
