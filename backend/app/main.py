from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import json
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models.forest import ForestRegion
from app.models.alert import AlertRecord
from app.services.forest_data import GLOBAL_FORESTS
from app.api.health import router as health_router
from app.api.search import router as search_router
from app.api.regions import router as regions_router
from app.api.environmental import router as environmental_router
from app.api.risk import router as risk_router
from app.api.alerts import router as alerts_router, INITIAL_ALERTS
from app.api.linuxone import router as linuxone_router
from app.api.fires import router as fires_router
from app.api.weather_api import router as weather_router
from app.api.layers import router as layers_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("terraguard.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables created
    logger.info("Initializing TerraGuard database schema...")
    Base.metadata.create_all(bind=engine)

    # Seed default regions and initial alerts if empty
    db = SessionLocal()
    try:
        region_count = db.query(ForestRegion).count()
        if region_count == 0:
            logger.info("Seeding initial global forest biomes into database...")
            for f in GLOBAL_FORESTS:
                coords_json = json.dumps(f.get("coordinates_polygon", []))
                reg = ForestRegion(
                    code=f["code"],
                    name=f["name"],
                    country=f["country"],
                    biome_type=f["biome_type"],
                    latitude=f["latitude"],
                    longitude=f["longitude"],
                    area_sqkm=f["area_sqkm"],
                    canopy_loss_pct=f.get("canopy_loss_pct", 0.0),
                    protected_status=f.get("protected_status", "Protected"),
                    carbon_stock_mt=f.get("carbon_stock_mt", 0.0),
                    geojson_geometry=coords_json,
                    critical_threshold=f.get("critical_threshold", 70.0)
                )
                db.add(reg)
            db.commit()
            logger.info("Forest biomes seeded successfully.")

        alert_count = db.query(AlertRecord).count()
        if alert_count == 0:
            logger.info("Seeding initial priority alerts...")
            for a in INITIAL_ALERTS:
                alt = AlertRecord(
                    region_code=a.get("region_code"),
                    alert_type=a.get("alert_type", "THERMAL_HOTSPOT"),
                    severity=a.get("severity", "HIGH"),
                    title=a.get("title", "Active Hotspot Detected"),
                    description=a.get("description"),
                    latitude=a.get("latitude", 0.0),
                    longitude=a.get("longitude", 0.0),
                    frp_mw=a.get("frp_mw"),
                    confidence=a.get("confidence", 85.0),
                    source=a.get("source", "NASA FIRMS")
                )
                db.add(alt)
            db.commit()
            logger.info("Priority alerts seeded successfully.")
    except Exception as e:
        logger.error(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

    yield
    logger.info("KAALVAN backend shutting down cleanly.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="KAALVAN — The Forest’s Last Line of Defense. AI-powered planetary forest intelligence and environmental threat detection platform for IBM LinuxONE.",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local Vite dev server and LinuxONE reverse proxy
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers for both /api and /api/v1
app.include_router(health_router, prefix="")
app.include_router(health_router, prefix="/api")
app.include_router(health_router, prefix=settings.API_V1_STR)

# Standard endpoints under /api
app.include_router(regions_router, prefix="/api")
app.include_router(search_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(fires_router, prefix="/api")
app.include_router(weather_router, prefix="/api")
app.include_router(layers_router, prefix="/api")
app.include_router(environmental_router, prefix="/api")
app.include_router(risk_router, prefix="/api")
app.include_router(linuxone_router, prefix="/api")

# Backward-compatible endpoints under /api/v1
app.include_router(regions_router, prefix=settings.API_V1_STR)
app.include_router(search_router, prefix=settings.API_V1_STR)
app.include_router(alerts_router, prefix=settings.API_V1_STR)
app.include_router(fires_router, prefix=settings.API_V1_STR)
app.include_router(weather_router, prefix=settings.API_V1_STR)
app.include_router(layers_router, prefix=settings.API_V1_STR)
app.include_router(environmental_router, prefix=settings.API_V1_STR)
app.include_router(risk_router, prefix=settings.API_V1_STR)
app.include_router(linuxone_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "tagline": "The Forest’s Last Line of Defense — AI-Powered Planetary Forest Intelligence & Environmental Threat Detection",
        "documentation": "/docs",
        "health": "/health",
        "api_v1": settings.API_V1_STR,
        "target_platform": "IBM LinuxONE (s390x) & Hybrid Cloud"
    }
