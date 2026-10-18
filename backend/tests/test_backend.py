import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert data["ml_model_loaded"] is True
    assert "system_architecture" in data
    assert "is_ibm_linuxone" in data
    assert "data_sources" in data
    assert data["data_sources"]["open_meteo"] == "connected"


def test_search_biomes_and_coordinates():
    # 1. Text search via /api/v1/search
    res = client.get("/api/v1/search?q=Amazon")
    assert res.status_code == 200
    results = res.json()
    assert len(results) >= 1
    assert any("Amazon" in r["name"] for r in results)

    # 2. Coordinates search via /api/regions/search
    res_coord = client.get("/api/regions/search?q=-3.46,-62.21")
    assert res_coord.status_code == 200
    coord_results = res_coord.json()
    assert len(coord_results) >= 1
    assert coord_results[0]["type"] == "coordinate"
    assert abs(coord_results[0]["latitude"] - (-3.46)) < 0.01

    # 3. Text search via /api/regions/search
    res_region_search = client.get("/api/regions/search?q=Congo")
    assert res_region_search.status_code == 200
    reg_results = res_region_search.json()
    assert len(reg_results) >= 1
    assert any("Congo" in r["name"] for r in reg_results)

    # 4. Unknown query returns empty list
    res_unknown = client.get("/api/regions/search?q=XYZNonExistentRegion999")
    assert res_unknown.status_code == 200
    assert res_unknown.json() == []


def test_regions_endpoints():
    res = client.get("/api/regions")
    assert res.status_code == 200
    regions = res.json()
    assert len(regions) >= 8

    # Specific region
    res_single = client.get("/api/regions/AMZ-BR-01")
    assert res_single.status_code == 200
    reg = res_single.json()
    assert reg["code"] == "AMZ-BR-01"
    assert "coordinates_polygon" in reg

    # Invalid region 404
    res_invalid = client.get("/api/regions/INVALID-CODE-99")
    assert res_invalid.status_code == 404


def test_region_comprehensive_report():
    res = client.get("/api/regions/AMZ-BR-01/report")
    assert res.status_code == 200
    report = res.json()
    assert report["region_id"] == "AMZ-BR-01"
    assert "coordinates" in report
    assert "risk_assessment" in report
    assert 0.0 <= report["risk_assessment"]["risk_score"] <= 100.0
    assert report["risk_assessment"]["risk_level"] in ["CRITICAL", "HIGH", "MODERATE", "LOW"]
    assert "observed_fire_detections" in report
    assert "meteorology_and_forecast" in report
    assert "forest_health" in report
    assert "contributing_risk_factors" in report
    assert len(report["contributing_risk_factors"]) >= 1
    assert "data_provenance" in report
    assert len(report["data_provenance"]) >= 2
    assert "confidence_and_limitations" in report
    assert "executive_summary_narrative" in report
    assert "[OBSERVED FACTS]" in report["executive_summary_narrative"]
    assert "[AI MODEL ESTIMATES]" in report["executive_summary_narrative"]
    assert "recommended_tactical_interventions" in report
    assert len(report["recommended_tactical_interventions"]) >= 1


def test_environmental_data_and_attributions():
    res = client.get("/api/v1/environmental/AMZ-BR-01")
    assert res.status_code == 200
    data = res.json()
    assert data["region_code"] == "AMZ-BR-01"
    assert "weather" in data
    assert "air_quality" in data
    assert "forest_cover" in data
    assert len(data["attributions"]) >= 2
    # Verify explicit attribution providers
    providers = [a["provider"] for a in data["attributions"]]
    assert any("Open-Meteo" in p for p in providers)
    assert any("Global Forest Watch" in p or "Hansen" in p for p in providers)


def test_fires_endpoint():
    # 1. Global fires
    res_global = client.get("/api/fires")
    assert res_global.status_code == 200
    data = res_global.json()
    assert data["status"] == "LIVE_ACTIVE"
    assert data["total_detections"] >= 1
    assert len(data["fires"]) >= 1
    sample = data["fires"][0]
    assert "latitude" in sample
    assert "longitude" in sample
    assert "frp_mw" in sample
    assert "satellite" in sample

    # 2. Regional fires
    res_regional = client.get("/api/fires?lat=-3.89&lon=-55.39&radius_km=300")
    assert res_regional.status_code == 200
    reg_data = res_regional.json()
    assert "fires" in reg_data
    assert "total_detections" in reg_data


def test_weather_endpoint():
    res = client.get("/api/weather?lat=-3.46&lon=-62.21")
    assert res.status_code == 200
    weather = res.json()
    assert "coordinates" in weather
    assert "weather_observations" in weather
    assert "forecast_24h" in weather
    assert "atmospheric_air_quality" in weather
    assert len(weather["attributions"]) >= 1


def test_layers_catalog_endpoint():
    res = client.get("/api/layers")
    assert res.status_code == 200
    layers_data = res.json()
    assert layers_data["status"] == "ACTIVE"
    assert layers_data["total_layers"] >= 5
    ids = [layer["id"] for layer in layers_data["layers"]]
    assert "forest_boundaries" in ids
    assert "firms_hotspots" in ids
    assert "weather_overlay" in ids
    assert "risk_heatmap" in ids


def test_risk_assessment_and_explainability():
    res = client.get("/api/v1/risk/assess/AMZ-BR-01")
    assert res.status_code == 200
    risk = res.json()
    assert 0.0 <= risk["risk_score"] <= 100.0
    assert risk["risk_level"] in ["CRITICAL", "HIGH", "MODERATE", "LOW"]
    assert risk["model_classification"] == "AI_PREDICTIVE_MODEL"
    assert len(risk["explainable_factors"]) >= 1
    factor = risk["explainable_factors"][0]
    assert "name" in factor
    assert "explanation" in factor
    assert "impact_level" in factor


def test_model_benchmark_endpoint():
    res = client.get("/api/v1/risk/benchmark")
    assert res.status_code == 200
    bench = res.json()
    assert bench["roc_auc"] >= 0.80
    assert bench["r2_score"] >= 0.70
    assert bench["validation_status"] == "VALIDATED_HISTORICAL_BENCHMARK"


def test_linuxone_telemetry():
    res = client.get("/api/v1/linuxone/telemetry")
    assert res.status_code == 200
    telemetry = res.json()
    assert telemetry["status"] == "OPERATIONAL"
    assert "detected_architecture" in telemetry
    assert "byte_order" in telemetry


def test_priority_alerts():
    res = client.get("/api/alerts")
    assert res.status_code == 200
    alerts = res.json()
    assert len(alerts) >= 1
    assert alerts[0]["severity"] in ["CRITICAL", "HIGH", "MODERATE", "LOW"]
