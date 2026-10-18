from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class RiskFactor(BaseModel):
    name: str                        # e.g., "Soil Moisture Deficit", "Vapor Pressure Deficit", "Thermal Anomaly Clustering"
    weight_pct: float                # Feature contribution percentage
    observed_metric: str             # e.g., "0.14 m³/m³ (-62% below median)"
    impact_level: str                # "CRITICAL", "HIGH", "MODERATE", "NEUTRAL", "PROTECTIVE"
    explanation: str                 # Domain explanation for environmental decision-makers


class ModelEvaluationBenchmark(BaseModel):
    model_name: str
    model_type: str = "Scikit-Learn Calibrated Gradient Boosting & Random Forest Ensemble"
    training_dataset: str = "NASA FIRMS (VIIRS 375m) & Open-Meteo Multi-Year Historical (2020-2025)"
    evaluation_sample_size: int
    roc_auc: float
    f1_score: float
    r2_score: float
    mean_absolute_error: float
    validation_status: str = "VALIDATED_HISTORICAL_BENCHMARK"
    last_benchmarked: str


class RiskAssessment(BaseModel):
    region_code: str
    risk_score: float               # 0 to 100
    risk_level: str                 # "CRITICAL" (Red), "HIGH" (Orange), "MODERATE" (Amber), "LOW" (Emerald)
    stress_index: float             # 0 to 100 (Canopy physiological stress)
    fire_spread_risk_24h: float     # 0 to 100
    model_classification: str       # "AI_PREDICTIVE_MODEL" (Validated against historical data)
    confidence_score: float         # 0.0 to 1.0 (e.g. 0.89)
    explainable_factors: List[RiskFactor] = []
    evaluation_benchmark: Optional[ModelEvaluationBenchmark] = None
    recommended_interventions: List[str] = []
    assessed_at: str
