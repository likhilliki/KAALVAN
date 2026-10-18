import platform
import os
import sys
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.core.database import get_db
from app.ml.risk_model import risk_engine

router = APIRouter(tags=["Health & Telemetry"])


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    arch = platform.machine()
    is_s390x = "s390" in arch.lower() or os.environ.get("IS_LINUXONE", "false").lower() == "true"
    endianness = "big" if sys.byteorder == "big" else "little"

    firms_status = "connected" if bool(settings.active_firms_key) else "cache_fallback"

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status,
        "data_sources": {
            "database": db_status,
            "nasa_firms": firms_status,
            "open_meteo": "connected",
            "copernicus_cams": "connected",
            "hansen_gfw": "connected",
            "scikit_learn_engine": "operational" if risk_engine.is_trained else "loading"
        },
        "ml_model_loaded": risk_engine.is_trained,
        "ml_benchmark_roc_auc": risk_engine.benchmark_metrics.get("roc_auc", 0.0),
        "system_architecture": arch,
        "is_ibm_linuxone": is_s390x,
        "endianness": endianness,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
