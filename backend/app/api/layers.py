from fastapi import APIRouter
from typing import List, Dict, Any
from datetime import datetime

router = APIRouter(tags=["Geospatial Spatial Layers"])


LAYERS_CATALOG: List[Dict[str, Any]] = [
    {
        "id": "forest_boundaries",
        "name": "Forest & Protected Frontiers",
        "category": "boundaries",
        "provider": "World Database on Protected Areas (WDPA) & Hansen GFW v1.11",
        "spatial_resolution": "30m ground sampling / Vector Polygon",
        "temporal_resolution": "Annual synthesis (2024-2025)",
        "status": "ACTIVE",
        "default_enabled": True,
        "description": "Authentic territorial polygons for planetary biomes, national parks, and indigenous reserve boundaries.",
        "license": "Open Data Commons Open Database License (ODbL)"
    },
    {
        "id": "firms_hotspots",
        "name": "NASA FIRMS Active Fire Detections",
        "category": "thermal_anomalies",
        "provider": "NASA Earth Science Data Systems (EOSDIS)",
        "spatial_resolution": "375m (VIIRS I-Band) / 1km (MODIS)",
        "temporal_resolution": "Near Real-Time (1-3 hours orbit latency)",
        "status": "ACTIVE",
        "default_enabled": True,
        "description": "Satellite thermal infrared detections capturing high-temperature combustion fronts and Fire Radiative Power (MW).",
        "license": "NASA Open Data Policy (Earth Science Data Systems)"
    },
    {
        "id": "weather_overlay",
        "name": "Surface Meteorology & Wind Vectors",
        "category": "atmospheric",
        "provider": "Open-Meteo / ECMWF IFS & NOAA GFS",
        "spatial_resolution": "0.25° (~25km) global grid",
        "temporal_resolution": "Hourly updates with 24h forward forecast",
        "status": "ACTIVE",
        "default_enabled": False,
        "description": "High-resolution temperature, relative humidity, sustained wind velocity, gusts, and vapor pressure deficit.",
        "license": "Creative Commons Attribution 4.0 International (CC BY 4.0)"
    },
    {
        "id": "risk_heatmap",
        "name": "TerraGuard AI Fire Risk & Spread Vectors",
        "category": "predictive_ai",
        "provider": "TerraGuard AI (IBM LinuxONE Scikit-Learn Engine)",
        "spatial_resolution": "Multi-factor biome polygon & sector grid",
        "temporal_resolution": "Real-time on-demand inference",
        "status": "ACTIVE",
        "default_enabled": True,
        "description": "Validated ensemble machine learning model evaluating flammability risk (0-100), 24h spread probability, and canopy stress.",
        "license": "TerraGuard AI Open Research Model (Apache 2.0)"
    },
    {
        "id": "vegetation_health",
        "name": "Canopy Density & Carbon Stock",
        "category": "biosphere",
        "provider": "Hansen / University of Maryland & Copernicus GLC",
        "spatial_resolution": "30m Landsat/Sentinel synthesis",
        "temporal_resolution": "Annual multi-sensor composite",
        "status": "ACTIVE",
        "default_enabled": True,
        "description": "Tree canopy percentage, cumulative deforestation loss rate, and metric tons of stored carbon biomass.",
        "license": "Creative Commons Attribution 4.0 (CC BY 4.0)"
    },
    {
        "id": "night_atmosphere",
        "name": "Earth at Night & Twilight Atmosphere",
        "category": "basemap",
        "provider": "NASA Black Marble / Suomi NPP Day-Night Band (DNB)",
        "spatial_resolution": "500m global composite",
        "temporal_resolution": "Static annual nighttime lights mosaic",
        "status": "ACTIVE",
        "default_enabled": False,
        "description": "City lights, human settlements, and night atmosphere illumination.",
        "license": "NASA Earth Observatory Public Domain"
    }
]


@router.get("/layers")
def get_layers_catalog():
    """
    Returns the comprehensive catalog of active spatial map layers.
    Includes layer metadata, provider attribution, spatial/temporal resolution, and licenses.
    """
    return {
        "status": "ACTIVE",
        "total_layers": len(LAYERS_CATALOG),
        "layers": LAYERS_CATALOG,
        "catalog_timestamp": datetime.utcnow().isoformat() + "Z"
    }
