# TerraGuard AI — IBM LinuxONE Implementation Plan

> **Goal:** Build a production-ready, dark cinematic 3D Earth command center for global forest monitoring and environmental early warning, powered by a FastAPI/Scikit-learn backend optimized for IBM LinuxONE (s390x).

**Architecture:**
- **Frontend:** React 19 + TypeScript + Vite + CesiumJS + Tailwind CSS. Single-page 3D globe command center with translucent glassmorphic HUD overlays, top geospatial search, floating intelligence card, layer manager, and historical timeline.
- **Backend:** Python 3.11 + FastAPI + SQLAlchemy + PostGIS (with automatic SQLite fallback for local running) + Scikit-learn explainable AI risk engine + Server-Sent Events (SSE) live alert stream.
- **Live Environmental Data:** NASA FIRMS satellite fire detections (VIIRS/MODIS), Open-Meteo meteorology and air quality APIs, Hansen Global Forest Watch canopy loss data.
- **IBM LinuxONE Target:** Multi-architecture containerization (`linux/s390x` & `linux/amd64`), Docker Compose, Kubernetes/OpenShift deployment manifests, and IBM Telum AI acceleration guidelines.

---

## Task Breakdown & Development Phases

### Phase 1: Workspace & Backend Foundation
- [x] Inspect local toolchains (Python 3.11, Node 22, npm 11, Docker available).
- [ ] Initialize Python backend directory `backend/`:
  - `requirements.txt` with s390x-compatible dependencies (`fastapi`, `uvicorn`, `pydantic`, `httpx`, `scikit-learn`, `numpy`, `pandas`, `sqlalchemy`, `pytest`).
  - Configuration (`app/core/config.py`) loading `.env` with API keys and fallback modes.
  - SQLite/PostGIS database models (`app/models/forest.py`, `app/models/alert.py`).
  - Modular routers: health, search, regions, environmental data, risk assessment, and SSE stream.
  - Automated tests with Pytest (`backend/tests/`).

### Phase 2: Live Ingestion & Explainable AI Risk Engine
- [ ] NASA FIRMS client (`app/services/firms.py`):
  - Fetches satellite thermal anomalies; supports API key with fallback to open feeds and cached authentic datasets.
  - Computes Fire Radiative Power (FRP), confidence metrics, and cluster radius.
- [ ] Open-Meteo client (`app/services/weather.py`):
  - Real-time weather, forecast, and air quality (PM2.5, CO, soil moisture, wind speed/gusts).
- [ ] Scikit-learn Risk & Stress Engine (`app/ml/risk_model.py`):
  - Calibrated multi-factor risk assessment (Fire Weather Index, drought severity, canopy vulnerability, hotspot proximity).
  - Train/evaluation script (`backend/scripts/evaluate_model.py`) reporting R², ROC-AUC, MAE against historical benchmarks.
  - Explainable AI breakdown with feature attribution and confidence interval.

### Phase 3: Frontend 3D Earth Command Center (Vite + React + CesiumJS)
- [ ] Scaffold Vite React TypeScript project in `frontend/`.
- [ ] Install CesiumJS (`cesium`), Lucide icons (`lucide-react`), Tailwind CSS, and configure Vite Cesium plugin/assets.
- [ ] Implement Cinematic 3D Earth Viewer (`src/components/GlobeViewer.tsx`):
  - Dark cinematic theme, realistic atmosphere, lighting, and starfield.
  - Mapped global forest biomes (Amazon, Congo, Boreal Taiga, Sundaland, Valdivian, Daintree).
  - Vector boundaries and glowing risk overlays (Red for Critical, Orange for High, Amber for Moderate, Green for Low).
- [ ] Implement Top Geospatial Search Bar (`src/components/SearchBar.tsx`):
  - Instant fuzzy search across biomes, protected areas, countries, and lat/lon coordinate jumping.
- [ ] Floating Glassmorphism Intelligence Card (`src/components/IntelligenceCard.tsx`):
  - Compact translucent overlay directly on top of the 3D globe.
  - Real-time FIRMS fire hotspots, weather/soil metrics, canopy loss %, and AI Risk gauge.
  - Explainable risk factor breakdown with confidence scores.
  - Clear tags: `[OBSERVED]`, `[FORECAST]`, `[AI PREDICTION]`.
  - Source attribution and refresh timestamps.
- [ ] Control Panels & Overlays:
  - Priority Alert Stream HUD (`src/components/AlertPanel.tsx`) connected to backend SSE.
  - Layer Manager (`src/components/LayerControls.tsx`) toggling Thermal Hotspots, Forest Canopy, Wind/Weather, Risk Heatmap.
  - Historical Timeline Slider (`src/components/TimelineSlider.tsx`).

### Phase 4: IBM LinuxONE Enterprise Integration
- [ ] Multi-architecture Dockerfile (`backend/Dockerfile` and `frontend/Dockerfile`):
  - Target `linux/s390x` (IBM zSystems / LinuxONE) and `linux/amd64`.
  - Minimal Alpine/Debian base with pre-built wheels and security hardening.
- [ ] Orchestration:
  - `docker-compose.yml` for unified local and production LinuxONE deployment.
  - OpenShift / Kubernetes manifests (`linuxone/k8s/`).
  - Automated deployment script `deploy-linuxone.sh`.
  - Architecture compatibility guide `docs/LINUXONE_DEPLOYMENT.md` detailing endianness, s390x acceleration, and VM/OpenShift provisioning.

### Phase 5: Verification, Testing & Polish
- [ ] Run backend automated tests (pytest).
- [ ] Run frontend build and typecheck (`npm run build`).
- [ ] Test live data fallback & offline resilience.
- [ ] Comprehensive verification checklist report.
