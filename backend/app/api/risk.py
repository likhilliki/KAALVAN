from fastapi import APIRouter, HTTPException
from datetime import datetime
from app.services.forest_data import get_forest_by_code
from app.services.weather import fetch_weather_and_air_quality
from app.services.firms import fetch_firms_hotspots
from app.ml.risk_model import risk_engine
from app.schemas.risk import RiskAssessment, ModelEvaluationBenchmark

router = APIRouter(tags=["AI Risk Engine"])


@router.get("/risk/assess/{code}", response_model=RiskAssessment)
async def assess_forest_risk(code: str):
    """
    Executes real-time multi-factor risk inference using the validated Scikit-learn
    gradient boosting & random forest ensemble model.
    Returns:
    - Calibrated Risk Score (0-100) & Categorical Risk Level
    - Canopy Physiological Stress Index (0-100)
    - 24h Fire Spread Probability
    - Explainable Factor Contributions (XAI)
    - Model Performance Metrics evaluated against historical benchmarks
    """
    forest = get_forest_by_code(code)
    if not forest:
        raise HTTPException(status_code=404, detail=f"Forest region '{code}' not found")

    lat = forest["latitude"]
    lon = forest["longitude"]

    # Ingest live features
    weather_res = await fetch_weather_and_air_quality(lat, lon)
    weather = weather_res["weather"].model_dump()

    firms_res = await fetch_firms_hotspots(lat, lon, radius_km=300.0)
    hotspots = [h.model_dump() for h in firms_res["anomalies"]]

    canopy_loss = forest.get("canopy_loss_pct", 15.0)

    assessment = risk_engine.assess_region(
        region_code=forest["code"],
        weather=weather,
        hotspots=hotspots,
        forest_canopy_loss_pct=canopy_loss
    )

    return assessment


@router.get("/risk/benchmark", response_model=ModelEvaluationBenchmark)
def get_benchmark_report():
    """Returns validated historical performance metrics for the AI Risk Engine."""
    return ModelEvaluationBenchmark(**risk_engine.benchmark_metrics)
