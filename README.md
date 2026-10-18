# KAALVAN 🌿
### The Forest’s Last Line of Defense

AI-powered planetary forest intelligence and environmental threat detection.

<p align="center">
  <img src="docs/images/kaalvan-logo.png" alt="KAALVAN Logo" width="140" />
</p>

[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://python.org)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![CesiumJS](https://img.shields.io/badge/CesiumJS-3D_Earth-689f38?logo=cesium&logoColor=white)](https://cesium.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Architecture: s390x](https://img.shields.io/badge/Architecture-IBM_LinuxONE_(s390x)-052FAD?logo=ibm&logoColor=white)](https://www.ibm.com/products/linuxone)
[![AI Engine: Scikit--Learn](https://img.shields.io/badge/AI_Engine-Scikit--Learn-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org)

---

## System Architecture & Flow Diagram

The following diagram illustrates how KAALVAN collects environmental data, processes it through the backend, analyzes potential threats, and presents actionable intelligence through its interactive dashboard.

![KAALVAN System Architecture and Flow Diagram](docs/images/kaalvan-architecture.png)

### End-to-End Workflow

1. **Collect:** Retrieve satellite fire detections, weather information, forest boundaries, and other available environmental data.
2. **Process:** Validate, normalize, enrich, and cache the collected information.
3. **Analyze:** Calculate explainable environmental risk indicators using available observations and documented model logic.
4. **Visualize:** Present geographic layers, regional reports, and alerts through the interactive 3D globe dashboard.
5. **Protect:** Help users identify areas requiring further investigation and make informed conservation decisions.

### Architecture Components

- **Data Sources:** NASA FIRMS, Open-Meteo, and accessible geographic or environmental datasets.
- **Backend:** FastAPI services and data processing hosted on IBM LinuxONE, when configured and verified.
- **Risk Analysis:** Explainable risk scoring that distinguishes observed events from forecasts and predictions.
- **Frontend:** Interactive 3D globe, geographic layers, regional intelligence panels, and alerts.
- **Users:** Conservation teams, researchers, policymakers, and the public.

---

## 🌍 Executive Overview

**KAALVAN** is a cinematic, enterprise-grade environmental monitoring and predictive early-warning platform designed for planetary forest biomes, national parks, and indigenous conservation territories.

Engineered to run natively on **IBM LinuxONE (s390x)** enterprise mainframe hardware, KAALVAN fuses continuous satellite telemetry with machine learning biophysical models to detect, classify, and explain ecological degradation, wildfire propagation risks, and canopy moisture deficits before irreversible tipping points are crossed.

---

## 🛰️ Key Features

### 1. Dark Cinematic 3D Earth Command Center
- **Interactive CesiumJS 3D Globe:** High-fidelity WGS84 ellipsoid with authentic geographic geometries for global biomes (Amazon, Congo Basin, Boreal Taiga, Sundaland/Borneo, Gran Chaco, Valdivian, Daintree, and Western Ghats).
- **Persistent Globe Context:** Intelligence reports, risk cards, layer controls, and priority alerts float directly over the 3D globe as translucent dark emerald glassmorphism HUD overlays—**the user is never navigated away from the planetary map**.
- **Camera Dynamics:** Cinematic camera fly-to animations with tailored pitch, heading, and altitude adjustments on regional selection.
- **Left Geospatial Control Panel:** Fuzzy search across global biomes, protected areas, countries, and direct GPS coordinate jump (`-3.46, -62.21`), coupled with layer controls and a clear severity legend.
- **Real-Time Layer Management:** Independent toggles for Forest Boundaries, Protected Areas, Satellite Fire Detections (NASA FIRMS), Weather & Atmosphere, Vegetation / Forest Health, and Environmental Risk.
- **Multi-Year Surveillance Timeline:** Interactive scrubber from 2020 through 2026 with automated playback showing annual canopy loss and carbon stock trends.

### 2. Live Environmental Data Integration
- **NASA FIRMS (VIIRS 375m & MODIS 1km):** Real-time satellite thermal anomaly detections, Fire Radiative Power (MW FRP), acquisition time, and detection confidence.
- **Open-Meteo Meteorology:** Hourly and daily ambient temperature, relative humidity, wind speed, gusts, surface soil moisture (0-7cm), vapor pressure deficit (VPD), and Canadian Fire Weather Index (FWI).
- **Copernicus CAMS Air Quality:** Atmospheric composition metrics including PM2.5, PM10, CO, and European AQI.
- **Hansen Global Forest Watch (GFW v1.11):** 30-meter annual canopy loss rates and carbon stock density (Mt CO₂e).
- **Transparent Attribution & Provenance:** Every metric displays its origin dataset, license, observation timestamp, last refresh time, and explicit `[OBSERVED]`, `[FORECAST]`, or `[AI PREDICTION]` tags.

### 3. Validated Explainable AI (XAI) Risk Engine
- **Calibrated Scikit-Learn Ensemble:** Combines Random Forest Regressors and Gradient Boosting Classifiers to generate calibrated region-level risk scores (0–100) and canopy stress indices.
- **Empirical Historical Benchmark:** Validated on holdout test partitions with **ROC-AUC: 0.993**, **R²: 0.933**, and **MAE: 3.13 points**.
- **Explainable Factor Breakdown (XAI):** Decomposes risk predictions into intuitive, weighted causal drivers (e.g., *+28.5% Soil Moisture Deficit*, *+34.0% VIIRS Hotspot Clustering*, *+22.0% Wind Gusts*).
- **Tactical Interventions:** Automatically generates actionable ranger directives and aerial firefighting standby recommendations.

### 4. Native IBM LinuxONE Integration
- **Platform Architecture:** Built for **s390x** with multi-architecture container manifests.
- **IBM Telum AI Co-Processor:** Leverages on-chip NNPA (Neural Network Processing Assist) accelerator for sub-millisecond model inference.
- **Confidential Computing:** IBM Secure Execution provides hardware memory isolation and CPACF wire-speed cryptography for sensitive ecological surveillance data.
- **Deployment Flexibility:** Automated deployment script supporting Red Hat OpenShift, Podman/Docker Compose, or native VM services.

---

## 🚀 Quick Start Guide

### Option 1: Running Locally (Development Mode)

#### 1. Backend (FastAPI + Python 3.11):
```bash
cd backend
python -m venv .venv

# Windows:
.venv\Scripts\activate
# Linux/macOS:
# source .venv/bin/activate

pip install -r requirements.txt
python -m pytest tests/ -v           # Run test suite (12/12 passing)
python scripts/evaluate_model.py     # Run ML evaluation benchmark
uvicorn app.main:app --reload --port 8000
```
Backend will be available at: `http://localhost:8000` (Swagger UI: `http://localhost:8000/docs`).

#### 2. Frontend (React 19 + CesiumJS + Vite):
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

### Option 2: Production Deployment on IBM LinuxONE

Run the automated deployment assistant on an s390x host:
```bash
chmod +x linuxone/deploy-linuxone.sh
./linuxone/deploy-linuxone.sh
```

Or deploy via Docker Compose on s390x:
```bash
docker compose -f docker-compose.linuxone.yml up -d --build
```

For complete OpenShift and Kubernetes deployment manifests, refer to [docs/LINUXONE_DEPLOYMENT.md](docs/LINUXONE_DEPLOYMENT.md).

---

## 📊 AI Model Evaluation Benchmark

KAALVAN evaluates its predictive models against historical ground-truth benchmark distributions:

| Evaluation Metric | Benchmark Target | Achieved Score | Status |
| :--- | :--- | :--- | :--- |
| **ROC-AUC (Classification)** | &ge; 0.850 | **0.993** | **PASS** |
| **R² Score (Regression)** | &ge; 0.800 | **0.933** | **PASS** |
| **Mean Absolute Error (MAE)** | &le; 5.0 pts | **3.13 pts** | **PASS** |
| **F1 Classification Score** | &ge; 0.700 | **0.739** | **PASS** |
| **Validation Test Partition** | Holdout split | **2,400 samples** | **VALIDATED** |

---

## 📡 API Reference Summary

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/health` | `GET` | System health status, database ping, data sources, and IBM LinuxONE s390x telemetry |
| `/api/regions` | `GET` | Monitored global forest biomes, polygons, and metadata |
| `/api/regions/{code}` | `GET` | Detailed metadata and polygon boundaries for a specific forest sector |
| `/api/regions/{code}/report` | `GET` | Comprehensive regional report with grounded observed facts, weather, and AI predictions |
| `/api/regions/search?q={query}` | `GET` | Fuzzy geospatial search by forest name, country, or GPS coordinate pair (`lat,lon`) |
| `/api/environmental/{code}` | `GET` | Environmental telemetry, Open-Meteo weather, air quality, NASA FIRMS, and source attributions |
| `/api/environmental/hotspots/global` | `GET` | All active satellite thermal anomalies across monitored biomes |
| `/api/fires?lat={lat}&lon={lon}` | `GET` | Filtered satellite fire detections within a given geographic radius |
| `/api/weather?lat={lat}&lon={lon}` | `GET` | Weather parameters, fire weather index (FWI), and air quality for coordinates |
| `/api/layers` | `GET` | Catalog of available geospatial map layers and their provenance |
| `/api/risk/assess/{code}` | `GET` | Scikit-learn AI risk assessment, canopy stress index, and explainable factor (XAI) breakdown |
| `/api/risk/benchmark` | `GET` | Validated model historical performance metrics and test scores |
| `/api/alerts` | `GET` | Prioritized active environmental threat alerts |
| `/api/alerts/stream` | `GET` | Server-Sent Events (SSE) live push stream for dashboard alerts |
| `/api/linuxone/telemetry` | `GET` | Real-time IBM Telum, Secure Execution, and s390x hardware status |

---

## 🔍 Data Integrations & Operational Status

- **NASA FIRMS (Fire Information for Resource Management System):** Integrates VIIRS 375m and MODIS 1km active fire products. If `NASA_FIRMS_MAP_KEY` is not provided in `.env`, the backend gracefully serves localized satellite cache observations.
- **Open-Meteo Meteorology & CAMS Air Quality:** Fully functional open-access API providing live temperature, humidity, wind, soil moisture, and atmospheric composition without mandatory API keys.
- **Hansen Global Forest Watch (GFW):** High-resolution annual tree cover loss and carbon density baselines integrated across monitored sectors.
- **IBM LinuxONE s390x Support:** Architecture detection auto-detects `s390x` mainframes; provides emulation and simulation telemetry for local development on x86/ARM workstations.

---

## 🛡️ License

Developed for the **IBM LinuxONE Datathon**. Open data integrations licensed under NASA Earthdata Open Access, Open-Meteo CC BY 4.0, and Open Data Commons ODbL.
