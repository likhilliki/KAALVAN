from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime


class ForestRegionBase(BaseModel):
    code: str
    name: str
    country: str
    biome_type: str
    latitude: float
    longitude: float
    area_sqkm: float
    canopy_loss_pct: float = 0.0
    protected_status: str = "Protected Area"
    carbon_stock_mt: float = 0.0
    critical_threshold: float = 70.0


class ForestRegionResponse(ForestRegionBase):
    id: int
    geojson_geometry: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SearchResultItem(BaseModel):
    id: Optional[int] = None
    code: Optional[str] = None
    name: str
    country: Optional[str] = None
    type: str  # "biome", "protected_area", "country", "coordinate"
    latitude: float
    longitude: float
    description: Optional[str] = None
    highlight_color: Optional[str] = None
