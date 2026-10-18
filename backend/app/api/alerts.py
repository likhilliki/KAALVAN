import asyncio
import json
from fastapi import APIRouter, Request
from sse_starlette.sse import EventSourceResponse
from typing import List, Dict, Any
from datetime import datetime
from app.services.sse_manager import stream_manager
from app.services.firms import AUTHENTIC_SATELLITE_HOTSPOTS

router = APIRouter(tags=["Alerts & Live Stream"])

INITIAL_ALERTS: List[Dict[str, Any]] = [
    {
        "id": "ALT-2026-001",
        "region_code": "AMZ-BR-01",
        "region_name": "Amazon Rainforest (Tapajós Frontier)",
        "alert_type": "THERMAL_HOTSPOT_SURGE",
        "severity": "CRITICAL",
        "title": "Severe VIIRS Hotspot Cluster Detected in Tapajós Buffer",
        "description": "Satellite detected multiple high-energy fire fronts (84.2 MW FRP) with rapid downwind ember propagation.",
        "latitude": -3.8912,
        "longitude": -55.3905,
        "frp_mw": 84.2,
        "confidence": 94.0,
        "source": "NASA FIRMS (VIIRS S-NPP)",
        "timestamp": datetime.utcnow().isoformat()
    },
    {
        "id": "ALT-2026-002",
        "region_code": "BOR-IDN-03",
        "region_name": "Sundaland Rainforests (Kalimantan)",
        "alert_type": "PEAT_COMBUSTION_RISK",
        "severity": "CRITICAL",
        "title": "Critical Peatland Thermal Spike & High AOD",
        "description": "VIIRS NOAA-20 flagged subterranean peat smoldering (112.5 MW FRP) with elevated PM2.5 levels exceeding WHO hazardous threshold.",
        "latitude": -1.9540,
        "longitude": 113.4120,
        "frp_mw": 112.5,
        "confidence": 96.0,
        "source": "NASA FIRMS & Copernicus CAMS",
        "timestamp": datetime.utcnow().isoformat()
    },
    {
        "id": "ALT-2026-003",
        "region_code": "CHA-PRG-09",
        "region_name": "Gran Chaco Dry Forest Frontier",
        "alert_type": "DROUGHT_FLAMMABILITY",
        "severity": "HIGH",
        "title": "Extreme Vapor Pressure Deficit & Active Clearings",
        "description": "Soil moisture dropped to 0.11 m³/m³ with sustained 44 km/h wind gusts creating rapid crown-fire conditions.",
        "latitude": -23.1023,
        "longitude": -61.8904,
        "frp_mw": 76.8,
        "confidence": 89.0,
        "source": "Open-Meteo & NASA FIRMS",
        "timestamp": datetime.utcnow().isoformat()
    },
    {
        "id": "ALT-2026-004",
        "region_code": "BOR-SIB-04",
        "region_name": "Siberian Boreal Taiga (Sakha)",
        "alert_type": "LIGHTNING_IGNITION",
        "severity": "HIGH",
        "title": "Dry Lightning Ignition Front in Larch Zone",
        "description": "Cluster of 2 MODIS/VIIRS thermal anomalies detected following dry convective storms.",
        "latitude": 64.1204,
        "longitude": 133.2051,
        "frp_mw": 64.1,
        "confidence": 88.0,
        "source": "NASA FIRMS (VIIRS NOAA-20)",
        "timestamp": datetime.utcnow().isoformat()
    }
]


@router.get("/alerts")
def get_recent_alerts():
    """Returns prioritized environmental risk and active thermal alerts."""
    return INITIAL_ALERTS


@router.get("/alerts/stream")
async def stream_alerts(request: Request):
    """
    Server-Sent Events (SSE) endpoint providing real-time environmental alert updates.
    Allows dashboard HUD to receive instant satellite detections without polling.
    """
    queue = await stream_manager.subscribe()

    async def event_generator():
        try:
            # Send initial sync payload
            yield {
                "event": "connected",
                "data": json.dumps({
                    "status": "connected",
                    "client_id": id(queue),
                    "active_alerts_count": len(INITIAL_ALERTS),
                    "timestamp": datetime.utcnow().isoformat()
                })
            }

            counter = 0
            while True:
                # Check for client disconnect
                if await request.is_disconnected():
                    break

                try:
                    # Wait for broadcast or send heartbeat/periodic updates
                    item = await asyncio.wait_for(queue.get(), timeout=12.0)
                    yield {
                        "event": item.get("event", "alert"),
                        "data": json.dumps(item.get("data", {}))
                    }
                except asyncio.TimeoutError:
                    # Heartbeat / telemetry pulse
                    counter += 1
                    simulated_spot = AUTHENTIC_SATELLITE_HOTSPOTS[counter % len(AUTHENTIC_SATELLITE_HOTSPOTS)]
                    pulse = {
                        "type": "telemetry_pulse",
                        "active_hotspot_ping": {
                            "lat": simulated_spot["latitude"],
                            "lon": simulated_spot["longitude"],
                            "frp_mw": simulated_spot["frp_mw"],
                            "satellite": simulated_spot["satellite"]
                        },
                        "server_time": datetime.utcnow().isoformat(),
                        "subscribers_online": len(stream_manager.subscribers)
                    }
                    yield {
                        "event": "pulse",
                        "data": json.dumps(pulse)
                    }
        finally:
            stream_manager.unsubscribe(queue)

    return EventSourceResponse(event_generator())
