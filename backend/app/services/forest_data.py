import json
from typing import List, Dict, Any, Optional
from datetime import datetime

# Authentic Global Forest Biomes, Protected Areas, and Critical Environmental Frontiers
GLOBAL_FORESTS: List[Dict[str, Any]] = [
    {
        "code": "AMZ-BR-01",
        "name": "Amazon Rainforest (Tapajós Frontier)",
        "country": "Brazil",
        "biome_type": "Tropical Rainforest",
        "latitude": -3.4653,
        "longitude": -62.2159,
        "area_sqkm": 5500000.0,
        "canopy_loss_pct": 17.8,
        "protected_status": "Indigenous Territory & Conservation Units",
        "carbon_stock_mt": 123000.0,
        "critical_threshold": 65.0,
        "coordinates_polygon": [
            [-68.5, -0.5], [-55.0, -2.0], [-51.0, -8.0], [-56.0, -12.5],
            [-65.0, -11.0], [-73.0, -5.0], [-68.5, -0.5]
        ]
    },
    {
        "code": "CGO-DRC-02",
        "name": "Congo Basin (Salonga - Virunga)",
        "country": "Democratic Republic of the Congo",
        "biome_type": "Tropical Moist Broadleaf",
        "latitude": -0.2280,
        "longitude": 21.0500,
        "area_sqkm": 3700000.0,
        "canopy_loss_pct": 9.4,
        "protected_status": "UNESCO World Heritage Site",
        "carbon_stock_mt": 85000.0,
        "critical_threshold": 60.0,
        "coordinates_polygon": [
            [15.0, 4.0], [28.0, 3.5], [30.0, -3.0], [25.0, -6.0],
            [17.0, -4.5], [14.0, 0.5], [15.0, 4.0]
        ]
    },
    {
        "code": "BOR-IDN-03",
        "name": "Sundaland Rainforests (Kalimantan & Borneo)",
        "country": "Indonesia",
        "biome_type": "Tropical Peat Swamp & Lowland Forest",
        "latitude": 0.9619,
        "longitude": 114.5548,
        "area_sqkm": 743330.0,
        "canopy_loss_pct": 34.2,
        "protected_status": "National Park & Peatland Sanctuary",
        "carbon_stock_mt": 42000.0,
        "critical_threshold": 55.0,
        "coordinates_polygon": [
            [109.0, 2.5], [117.5, 4.0], [118.0, -2.5], [115.0, -4.0],
            [110.0, -3.0], [108.5, 0.5], [109.0, 2.5]
        ]
    },
    {
        "code": "BOR-SIB-04",
        "name": "Siberian Boreal Taiga (Sakha Larch Belt)",
        "country": "Russia",
        "biome_type": "Boreal Coniferous Forest (Taiga)",
        "latitude": 62.0355,
        "longitude": 129.6755,
        "area_sqkm": 6000000.0,
        "canopy_loss_pct": 12.1,
        "protected_status": "Strict Nature Reserve (Zapovednik)",
        "carbon_stock_mt": 140000.0,
        "critical_threshold": 70.0,
        "coordinates_polygon": [
            [115.0, 68.0], [140.0, 67.0], [145.0, 58.0], [125.0, 55.0],
            [110.0, 60.0], [115.0, 68.0]
        ]
    },
    {
        "code": "CAN-BOR-05",
        "name": "Canadian Boreal Forest (Athabasca)",
        "country": "Canada",
        "biome_type": "North American Boreal Forest",
        "latitude": 56.1304,
        "longitude": -106.3468,
        "area_sqkm": 5520000.0,
        "canopy_loss_pct": 8.7,
        "protected_status": "National Park & Provincial Reserve",
        "carbon_stock_mt": 118000.0,
        "critical_threshold": 68.0,
        "coordinates_polygon": [
            [-125.0, 62.0], [-95.0, 58.0], [-85.0, 50.0], [-105.0, 50.0],
            [-120.0, 55.0], [-125.0, 62.0]
        ]
    },
    {
        "code": "VAL-CHL-06",
        "name": "Valdivian Temperate Rainforest",
        "country": "Chile / Argentina",
        "biome_type": "Temperate Broadleaf & Mixed Forest",
        "latitude": -39.8142,
        "longitude": -73.2459,
        "area_sqkm": 248100.0,
        "canopy_loss_pct": 15.6,
        "protected_status": "Biosphere Reserve",
        "carbon_stock_mt": 9800.0,
        "critical_threshold": 62.0,
        "coordinates_polygon": [
            [-74.5, -36.0], [-71.5, -37.0], [-71.0, -44.0], [-74.0, -43.5],
            [-74.5, -36.0]
        ]
    },
    {
        "code": "DAI-AUS-07",
        "name": "Daintree Rainforest & Wet Tropics",
        "country": "Australia",
        "biome_type": "Tropical Rainforest",
        "latitude": -16.1700,
        "longitude": 145.4185,
        "area_sqkm": 12000.0,
        "canopy_loss_pct": 6.3,
        "protected_status": "UNESCO World Heritage Site",
        "carbon_stock_mt": 1450.0,
        "critical_threshold": 55.0,
        "coordinates_polygon": [
            [144.8, -15.5], [145.8, -15.8], [146.0, -18.5], [145.2, -18.2],
            [144.8, -15.5]
        ]
    },
    {
        "code": "ATL-BRA-08",
        "name": "Atlantic Forest (Mata Atlântica Hotspot)",
        "country": "Brazil",
        "biome_type": "Tropical Moist & Subtropical Forest",
        "latitude": -22.9068,
        "longitude": -43.1729,
        "area_sqkm": 1110182.0,
        "canopy_loss_pct": 78.5,
        "protected_status": "Critical Biodiversity Hotspot",
        "carbon_stock_mt": 31000.0,
        "critical_threshold": 75.0,
        "coordinates_polygon": [
            [-52.0, -14.0], [-39.0, -13.0], [-41.0, -23.0], [-48.0, -28.0],
            [-54.0, -26.0], [-52.0, -14.0]
        ]
    },
    {
        "code": "CHA-PRG-09",
        "name": "Gran Chaco Dry Forest Frontier",
        "country": "Paraguay / Argentina",
        "biome_type": "Tropical & Subtropical Dry Broadleaf",
        "latitude": -21.5000,
        "longitude": -60.5000,
        "area_sqkm": 647000.0,
        "canopy_loss_pct": 28.9,
        "protected_status": "Deforestation Hotspot",
        "carbon_stock_mt": 14200.0,
        "critical_threshold": 68.0,
        "coordinates_polygon": [
            [-63.0, -18.0], [-57.5, -19.5], [-58.0, -26.0], [-64.0, -25.5],
            [-63.0, -18.0]
        ]
    },
    {
        "code": "MAD-MDG-10",
        "name": "Madagascar Lowland & Eastern Rainforests",
        "country": "Madagascar",
        "biome_type": "Madagascar Subhumid & Lowland Forest",
        "latitude": -18.7669,
        "longitude": 46.8691,
        "area_sqkm": 112000.0,
        "canopy_loss_pct": 44.0,
        "protected_status": "Critically Endangered Endemic Flora Reserve",
        "carbon_stock_mt": 4800.0,
        "critical_threshold": 70.0,
        "coordinates_polygon": [
            [48.0, -12.5], [50.5, -15.0], [48.0, -24.5], [46.5, -23.0],
            [47.5, -17.0], [48.0, -12.5]
        ]
    }
]


def get_all_forests() -> List[Dict[str, Any]]:
    return GLOBAL_FORESTS


def get_forest_by_code(code: str) -> Optional[Dict[str, Any]]:
    for f in GLOBAL_FORESTS:
        if f["code"].lower() == code.lower():
            return f
    return None


def search_locations(query: str) -> List[Dict[str, Any]]:
    q = query.strip().lower()
    if not q:
        return []

    # Check coordinate search e.g. "-3.46, -62.21" or "3.46 -62.21"
    coord_parts = q.replace(",", " ").split()
    if len(coord_parts) == 2:
        try:
            lat = float(coord_parts[0])
            lon = float(coord_parts[1])
            if -90 <= lat <= 90 and -180 <= lon <= 180:
                return [{
                    "id": None,
                    "code": f"COORD_{lat:.2f}_{lon:.2f}",
                    "name": f"Coordinate Location ({lat:.4f}°, {lon:.4f}°)",
                    "country": "Custom Coordinate",
                    "type": "coordinate",
                    "latitude": lat,
                    "longitude": lon,
                    "description": f"Target coordinates {lat:.4f}, {lon:.4f}",
                    "highlight_color": "#06b6d4"
                }]
        except ValueError:
            pass

    results = []
    for f in GLOBAL_FORESTS:
        score = 0
        if q in f["name"].lower():
            score += 10
        if q in f["country"].lower():
            score += 5
        if q in f["biome_type"].lower():
            score += 4
        if q in f["code"].lower():
            score += 8
        if q in f.get("protected_status", "").lower():
            score += 3

        if score > 0:
            results.append({
                "id": None,
                "code": f["code"],
                "name": f["name"],
                "country": f["country"],
                "type": "biome",
                "latitude": f["latitude"],
                "longitude": f["longitude"],
                "description": f"{f['biome_type']} • {f['country']} • {f['area_sqkm']:,.0f} km²",
                "highlight_color": "#10b981" if f["critical_threshold"] < 60 else ("#f97316" if f["critical_threshold"] < 70 else "#ef4444")
            })

    return results
