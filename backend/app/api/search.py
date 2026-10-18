from fastapi import APIRouter, Query
from typing import List
from app.schemas.forest import SearchResultItem
from app.services.forest_data import search_locations

router = APIRouter(tags=["Search"])


@router.get("/search", response_model=List[SearchResultItem])
def search_endpoint(q: str = Query(..., min_length=1, description="Search query by name, country, biome or lat,lon coordinates")):
    return search_locations(q)
