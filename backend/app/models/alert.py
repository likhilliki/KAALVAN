from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from datetime import datetime
from app.core.database import Base


class AlertRecord(Base):
    __tablename__ = "alert_records"

    id = Column(Integer, primary_key=True, index=True)
    region_code = Column(String(50), index=True, nullable=True)
    alert_type = Column(String(50), nullable=False)  # Thermal Anomaly, Deforestation Surge, Severe Drought, Air Quality Crisis
    severity = Column(String(20), nullable=False)    # Critical, High, Moderate, Low
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    frp_mw = Column(Float, nullable=True)            # Fire Radiative Power (MW)
    confidence = Column(Float, default=85.0)         # Confidence %
    source = Column(String(100), default="NASA FIRMS (VIIRS/MODIS)")
    detected_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)


class HistoricalAudit(Base):
    __tablename__ = "historical_audits"

    id = Column(Integer, primary_key=True, index=True)
    region_code = Column(String(50), index=True, nullable=False)
    year = Column(Integer, nullable=False)
    tree_loss_ha = Column(Float, default=0.0)
    co2_emissions_mt = Column(Float, default=0.0)
    fire_incidents = Column(Integer, default=0)
    drought_index = Column(Float, default=0.0)
    risk_score_avg = Column(Float, default=0.0)
