# TerraGuard AI — IBM LinuxONE Deployment & Architecture Guide

> **IBM LinuxONE Datathon Edition**  
> **Platform Target:** IBM LinuxONE III / LinuxONE 4 (`s390x` architecture)  
> **Supported Environments:** Red Hat OpenShift on IBM LinuxONE, LinuxONE Community Cloud (VM), Docker/Podman Container Runtimes.

---

## 1. Architectural Value: Why IBM LinuxONE?

TerraGuard AI is engineered to ingest, cross-reference, and evaluate planetary-scale geospatial datasets in near-real-time:
- **NASA FIRMS** satellite thermal anomalies (VIIRS 375m & MODIS 1km).
- **Open-Meteo** high-resolution global numerical weather models (ECMWF & NOAA GFS).
- **Hansen Global Forest Watch (GFW)** 30-meter canopy loss matrices.

### Key LinuxONE Architecture Advantages:
1. **IBM Telum On-Chip AI Acceleration (NNPA - Neural Network Processing Assist):**
   - The IBM Telum processor integrates an on-chip AI accelerator delivering up to 6 TFLOPS of compute directly on the silicon die.
   - Unlike x86 architectures that depend on external GPU buses (introducing PCI-e latency and power overhead), Telum executes machine learning inference (such as Scikit-Learn ensembles, Random Forests, and Gradient Boosting) directly adjacent to main memory caches.
2. **Confidential Computing via IBM Secure Execution:**
   - Protects sensitive geospatial coordinates, ranger patrol positions, and critical environmental assets inside encrypted virtual trust domains (KVM-based Secure Guests), inaccessible even to hypervisor administrators.
3. **CPACF (Central Processor Assist for Cryptographic Functions):**
   - Wire-speed hardware encryption for all satellite data transfers (TLS 1.3 / AES-256-GCM / SHA-512) with minimal CPU cycle consumption.
4. **Resilience & SLA:**
   - Engineered for 99.999% uptime with redundant array of independent memory (RAIM) and dynamic partition re-routing.

---

## 2. Choosing Your Deployment Path

TerraGuard AI automatically adapts based on the environment provided during the datathon:

| Environment | When to Use | Execution Command |
| :--- | :--- | :--- |
| **Path A: Red Hat OpenShift** | Datathon supplies an OpenShift cluster login | `bash linuxone/deploy-linuxone.sh` (or `oc apply -f linuxone/openshift/`) |
| **Path B: Docker / Podman** | LinuxONE VM with Docker or Podman installed | `docker compose -f docker-compose.linuxone.yml up -d` |
| **Path C: LinuxONE VM (Baremetal)** | LinuxONE Community Cloud RHEL/Ubuntu VM | `bash linuxone/deploy-linuxone.sh` |
| **Path D: Local Laptop Dev** | Windows/macOS/Linux for review & testing | `python -m uvicorn app.main:app` & `npm run dev` |

---

## 3. Step-by-Step Deployment Instructions

### Prerequisites
1. Ensure you have cloned the repository:
   ```bash
   git clone <repo-url> terraguard-ai
   cd terraguard-ai
   ```
2. Verify system architecture:
   ```bash
   uname -m
   # Outputs "s390x" on LinuxONE, or "x86_64" on standard PCs
   ```

---

### Option A: 1-Click Automated Script (Recommended)

Run the included automated deployment assistant:
```bash
chmod +x linuxone/deploy-linuxone.sh
./linuxone/deploy-linuxone.sh
```
The script automatically:
1. Verifies hardware endianness and CPU architecture.
2. Identifies if OpenShift CLI (`oc`), Docker, Podman, or native Python is active.
3. Deploys the PostGIS database, seeds initial forest biomes, and spins up the FastAPI backend.
4. Executes an automated health audit against `http://localhost:8000/health`.

---

### Option B: Docker / Podman on LinuxONE

1. Configure environment variables in `backend/.env`:
   ```bash
   cp backend/.env.example backend/.env
   # Optionally add your NASA_FIRMS_MAP_KEY if available
   ```

2. Build and launch with `docker-compose.linuxone.yml`:
   ```bash
   docker compose -f docker-compose.linuxone.yml up -d --build
   ```

3. Inspect running containers:
   ```bash
   docker ps
   # Expected containers:
   # - terraguard-linuxone-backend (Port 8000)
   # - terraguard-linuxone-frontend (Port 80)
   # - terraguard-linuxone-db (Port 5432)
   ```

4. Stream backend logs:
   ```bash
   docker logs -f terraguard-linuxone-backend
   ```

---

### Option C: Red Hat OpenShift on IBM LinuxONE

1. Log into your datathon OpenShift cluster:
   ```bash
   oc login --token=<YOUR_TOKEN> --server=<YOUR_OPENSHIFT_SERVER>
   ```

2. Create project namespace:
   ```bash
   oc new-project terraguard-ai
   ```

3. Apply Kubernetes & OpenShift manifests:
   ```bash
   oc apply -f linuxone/k8s/postgis-statefulset.yaml
   oc apply -f linuxone/openshift/backend-dc.yaml
   oc apply -f linuxone/openshift/route.yaml
   ```

4. Retrieve your public secure HTTPS URL:
   ```bash
   oc get route terraguard-route -n terraguard-ai
   ```

---

## 4. Verification & Testing

Once deployed on LinuxONE, test the following endpoints to prove functionality:

### 1. Health & Mainframe Telemetry:
```bash
curl -s http://localhost:8000/health | jq .
```
Expected output:
```json
{
  "status": "healthy",
  "service": "TerraGuard AI",
  "version": "1.0.0",
  "database": "connected",
  "ml_model_loaded": true,
  "system_architecture": "s390x",
  "is_ibm_linuxone": true,
  "endianness": "big"
}
```

### 2. Live Environmental Intelligence (Amazon Basin):
```bash
curl -s http://localhost:8000/api/v1/environmental/AMZ-BR-01 | jq .
```

### 3. AI Risk Inference & Explainability:
```bash
curl -s http://localhost:8000/api/v1/risk/assess/AMZ-BR-01 | jq .
```

### 4. Interactive OpenAPI Documentation:
Visit `http://<your-linuxone-ip>:8000/docs` in your browser.

---

## 5. Security & Credentials Notice for Datathon Judges

- **Zero Credentials Exposure:** No secret keys or passwords are exposed in the client React bundle. All external queries to NASA FIRMS and Open-Meteo are reverse-proxied and cached through the Python backend.
- **Graceful Fallbacks:** If a free NASA FIRMS MAP_KEY is not configured in `.env`, the engine seamlessly transitions to authentic open NRT feeds and verified satellite orbits, guaranteeing zero downtime during demonstrations.
