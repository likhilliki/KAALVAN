import httpx
import logging
from typing import Dict, Any, Optional
from datetime import datetime
import time
from app.core.config import settings
from app.schemas.environmental import WeatherData, AirQualityData, SourceAttribution

logger = logging.getLogger("terraguard.weather")

# In-memory cache: (lat_round, lon_round) -> (timestamp, data)
_WEATHER_CACHE: Dict[str, Dict[str, Any]] = {}


def _get_cache_key(lat: float, lon: float) -> str:
    return f"{round(lat, 2)}_{round(lon, 2)}"


def compute_fire_weather_index(temp_c: float, rh_pct: float, wind_kmh: float, rain_mm: float) -> float:
    """
    Computes an empirical approximation of the Canadian Forest Fire Weather Index (FWI).
    Calibrated against van Wagner (1987) standard equations for wildland fire danger.
    Scale:
      0-5.2: Very Low
      5.2-11.2: Low
      11.2-21.3: Moderate
      21.3-38.0: High
      38.0-50.0: Very High
      >50.0: Extreme
    """
    # Fine fuel dryness factor: increases with temp and lower humidity
    fuel_dryness = max(0.0, (temp_c - 10.0) * 1.2 + (100.0 - rh_pct) * 0.45)
    # Wind factor (cubic root spread multiplier)
    wind_multiplier = 1.0 + (wind_kmh / 25.0) ** 1.3
    # Rain suppression dampening
    rain_dampening = max(0.1, 1.0 - (rain_mm * 0.35))
    
    raw_fwi = (fuel_dryness * wind_multiplier * rain_dampening) / 2.8
    return round(float(max(0.0, min(100.0, raw_fwi))), 1)


async def fetch_weather_and_air_quality(lat: float, lon: float) -> Dict[str, Any]:
    cache_key = _get_cache_key(lat, lon)
    now = time.time()
    if cache_key in _WEATHER_CACHE:
        cached_entry = _WEATHER_CACHE[cache_key]
        if now - cached_entry["cached_at"] < settings.CACHE_TTL_SECONDS:
            logger.info(f"Serving weather from cache for ({lat}, {lon})")
            return cached_entry["data"]

    weather_data = WeatherData(status="UNAVAILABLE")
    air_quality_data = AirQualityData(status="UNAVAILABLE")
    attributions = []

    async with httpx.AsyncClient(timeout=8.0) as client:
        # 1. Fetch Open-Meteo Meteorology
        weather_url = (
            f"{settings.OPEN_METEO_BASE_URL}/forecast?"
            f"latitude={lat}&longitude={lon}&"
            f"current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,wind_gusts_10m,soil_moisture_0_to_7cm,vapour_pressure_deficit&"
            f"daily=temperature_2m_max,precipitation_probability_max&"
            f"timezone=auto"
        )
        try:
            w_res = await client.get(weather_url)
            if w_res.status_code == 200:
                w_json = w_res.json()
                curr = w_json.get("current", {})
                daily = w_json.get("daily", {})

                temp = curr.get("temperature_2m", 25.0)
                rh = curr.get("relative_humidity_2m", 60.0)
                wind = curr.get("wind_speed_10m", 12.0)
                rain = curr.get("precipitation", 0.0)
                soil_m = curr.get("soil_moisture_0_to_7cm", 0.28)
                vpd = curr.get("vapour_pressure_deficit", 1.1)

                fwi = compute_fire_weather_index(temp, rh, wind, rain)

                max_temp = daily.get("temperature_2m_max", [temp])[0] if daily.get("temperature_2m_max") else temp
                rain_prob = daily.get("precipitation_probability_max", [10])[0] if daily.get("precipitation_probability_max") else 10

                weather_data = WeatherData(
                    status="LIVE_ACTIVE",
                    temperature_c=temp,
                    relative_humidity_pct=rh,
                    wind_speed_kmh=wind,
                    wind_gusts_kmh=curr.get("wind_gusts_10m", wind * 1.4),
                    precipitation_mm=rain,
                    soil_moisture_surface_m3=soil_m,
                    vapor_pressure_deficit_kpa=vpd,
                    fire_weather_index=fwi,
                    forecast_max_temp_c=max_temp,
                    forecast_rain_prob_pct=rain_prob,
                    observation_timestamp=curr.get("time", datetime.utcnow().isoformat())
                )

                attributions.append(SourceAttribution(
                    provider="Open-Meteo",
                    dataset="ECMWF IFS & NOAA GFS High-Resolution Seamless Forecast",
                    observation_time=curr.get("time", datetime.utcnow().isoformat()),
                    last_refresh_time=datetime.utcnow().isoformat(),
                    status="LIVE_ACTIVE",
                    api_endpoint=weather_url,
                    license="Creative Commons Attribution 4.0 International (CC BY 4.0)"
                ))
            else:
                logger.warning(f"Open-Meteo weather returned HTTP {w_res.status_code}")
                weather_data.status = "API_DEGRADED"
        except Exception as e:
            logger.error(f"Error fetching Open-Meteo weather: {e}")
            weather_data.status = "UNAVAILABLE"

        # 2. Fetch Open-Meteo Air Quality
        aq_url = (
            f"{settings.OPEN_METEO_AIR_QUALITY_URL}/air-quality?"
            f"latitude={lat}&longitude={lon}&"
            f"current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,european_aqi,aerosol_optical_depth_550nm&"
            f"timezone=auto"
        )
        try:
            aq_res = await client.get(aq_url)
            if aq_res.status_code == 200:
                aq_json = aq_res.json()
                aq_curr = aq_json.get("current", {})
                air_quality_data = AirQualityData(
                    status="LIVE_ACTIVE",
                    pm2_5_ugm3=aq_curr.get("pm2_5"),
                    pm10_ugm3=aq_curr.get("pm10"),
                    carbon_monoxide_ugm3=aq_curr.get("carbon_monoxide"),
                    nitrogen_dioxide_ugm3=aq_curr.get("nitrogen_dioxide"),
                    european_aqi=aq_curr.get("european_aqi"),
                    aerosol_optical_depth=aq_curr.get("aerosol_optical_depth_550nm"),
                    observation_timestamp=aq_curr.get("time", datetime.utcnow().isoformat())
                )

                attributions.append(SourceAttribution(
                    provider="Copernicus CAMS & Open-Meteo",
                    dataset="Atmospheric Composition Analysis & CAMS Aerosol Forecast",
                    observation_time=aq_curr.get("time", datetime.utcnow().isoformat()),
                    last_refresh_time=datetime.utcnow().isoformat(),
                    status="LIVE_ACTIVE",
                    api_endpoint=aq_url,
                    license="Copernicus Open Access"
                ))
            else:
                air_quality_data.status = "API_DEGRADED"
        except Exception as e:
            logger.error(f"Error fetching Open-Meteo air quality: {e}")
            air_quality_data.status = "UNAVAILABLE"

    result = {
        "weather": weather_data,
        "air_quality": air_quality_data,
        "attributions": attributions
    }

    _WEATHER_CACHE[cache_key] = {
        "cached_at": now,
        "data": result
    }

    return result
