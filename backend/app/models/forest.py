from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime
from datetime import datetime
from app.core.database import Base


class ForestRegion(Base):
    __tablename__ = "forest_regions"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), index=True, nullable=False)
    country = Column(String(100), index=True, nullable=False)
    biome_type = Column(String(100), nullable=False)  # Tropical Rainforest, Boreal Taiga, Temperate, Mangrove, etc.
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    area_sqkm = Column(Float, nullable=False)
    canopy_loss_pct = Column(Float, default=0.0)
    protected_status = Column(String(100), default="National Park / Protected Area")
    carbon_stock_mt = Column(Float, default=0.0)  # Megatons of carbon stored
    geojson_geometry = Column(Text, nullable=True)  # Polygon GeoJSON string
    critical_threshold = Column(Float, default=70.0)  # Risk threshold for red alert
    created_at = Column(DateTime, default=datetime.utcnow)
