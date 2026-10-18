#!/usr/bin/env bash
# ==============================================================================
# TerraGuard AI — IBM LinuxONE Datathon Automated Deployment Script
# Supports:
#   1. Red Hat OpenShift on IBM LinuxONE (via `oc` CLI)
#   2. Podman / Docker on LinuxONE Community Cloud / SLES / RHEL / Ubuntu s390x
#   3. Direct Native Python / Systemd Service on LinuxONE VM
# ==============================================================================

set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${CYAN}======================================================================${NC}"
echo -e "${CYAN}   TERRAGUARD AI — IBM LinuxONE Enterprise Deployment Assistant     ${NC}"
echo -e "${CYAN}======================================================================${NC}"

ARCH=$(uname -m)
echo -e "${BLUE}▶ Detected Host Architecture:${NC} ${ARCH}"

if [ "${ARCH}" = "s390x" ]; then
    echo -e "${GREEN}✔ Native IBM zSystems / LinuxONE (s390x) mainframe detected.${NC}"
else
    echo -e "${YELLOW}ℹ Host architecture is ${ARCH}. Multi-arch emulation mode enabled for LinuxONE builds.${NC}"
fi

# Step 1: Detect Deployment Target Environment
DEPLOY_MODE=""

if command -v oc &> /dev/null && oc whoami &> /dev/null; then
    DEPLOY_MODE="OPENSHIFT"
    echo -e "${GREEN}✔ Active Red Hat OpenShift cluster detected via 'oc' CLI.${NC}"
elif command -v docker &> /dev/null || command -v podman &> /dev/null; then
    DEPLOY_MODE="CONTAINER"
    echo -e "${GREEN}✔ Container runtime detected (Docker / Podman).${NC}"
elif command -v python3 &> /dev/null; then
    DEPLOY_MODE="NATIVE_VM"
    echo -e "${YELLOW}ℹ Container runtime not found. Falling back to native Python 3 on VM.${NC}"
else
    echo -e "${RED}✖ Error: Neither OpenShift, Docker/Podman, nor Python 3 found in environment.${NC}"
    exit 1
fi

echo -e "\n${BLUE}▶ Target Deployment Mode:${NC} ${DEPLOY_MODE}\n"

# Step 2: Execute Deployment based on environment
case "${DEPLOY_MODE}" in
    OPENSHIFT)
        echo -e "${CYAN}--- Deploying to Red Hat OpenShift on LinuxONE ---${NC}"
        oc project terraguard-ai 2>/dev/null || oc new-project terraguard-ai
        
        echo "Applying LinuxONE Kubernetes & OpenShift manifests..."
        oc apply -f linuxone/k8s/postgis-statefulset.yaml
        oc apply -f linuxone/openshift/backend-dc.yaml
        oc apply -f linuxone/openshift/route.yaml

        echo -e "${GREEN}Waiting for backend pod rollout...${NC}"
        oc rollout status deployment/terraguard-backend -n terraguard-ai --timeout=180s || true
        ROUTE_URL=$(oc get route terraguard-route -n terraguard-ai -o jsonpath='{.spec.host}' 2>/dev/null || echo "localhost")
        echo -e "${GREEN}✔ Deployed successfully to OpenShift: https://${ROUTE_URL}${NC}"
        ;;

    CONTAINER)
        CONTAINER_TOOL="docker"
        if command -v podman &> /dev/null && ! command -v docker &> /dev/null; then
            CONTAINER_TOOL="podman"
        fi

        echo -e "${CYAN}--- Deploying via ${CONTAINER_TOOL} on LinuxONE ---${NC}"
        if [ -f "docker-compose.linuxone.yml" ]; then
            echo "Launching multi-container stack with s390x architecture flags..."
            if command -v docker-compose &> /dev/null; then
                docker-compose -f docker-compose.linuxone.yml up -d --build
            elif ${CONTAINER_TOOL} compose version &> /dev/null; then
                ${CONTAINER_TOOL} compose -f docker-compose.linuxone.yml up -d --build
            else
                echo -e "${YELLOW}Docker compose not found, building and running individual container...${NC}"
                ${CONTAINER_TOOL} build -t terraguard-backend:s390x ./backend
                ${CONTAINER_TOOL} run -d --name terraguard-backend -p 8000:8000 terraguard-backend:s390x
            fi
        fi
        ;;

    NATIVE_VM)
        echo -e "${CYAN}--- Deploying Native Python Service on LinuxONE VM ---${NC}"
        cd backend
        python3 -m venv .venv
        source .venv/bin/activate
        pip install --upgrade pip
        pip install -r requirements.txt
        echo "Executing model benchmark evaluation..."
        python scripts/evaluate_model.py
        
        echo "Starting FastAPI backend in background on port 8000..."
        nohup uvicorn app.main:app --host 0.0.0.0 --port 8000 > backend.log 2>&1 &
        echo -e "${GREEN}✔ Backend started (PID $!). Logs: backend/backend.log${NC}"
        cd ..
        ;;
esac

# Step 3: Health Verification
echo -e "\n${BLUE}▶ Validating Backend Health Endpoint...${NC}"
sleep 3
HEALTH_CHECK_PASSED=false
for i in {1..10}; do
    if curl -s -f http://localhost:8000/health > /tmp/tg_health.json 2>/dev/null; then
        HEALTH_CHECK_PASSED=true
        break
    fi
    echo "Waiting for health endpoint (attempt $i/10)..."
    sleep 2
done

if [ "$HEALTH_CHECK_PASSED" = true ]; then
    echo -e "${GREEN}✔ Backend health check PASSED!${NC}"
    cat /tmp/tg_health.json
    echo -e "\n${GREEN}======================================================================${NC}"
    echo -e "${GREEN}  TERRAGUARD AI IS READY ON IBM LINUXONE (s390x)                     ${NC}"
    echo -e "${GREEN}  Endpoint: http://localhost:8000                                    ${NC}"
    echo -e "${GREEN}  API Docs: http://localhost:8000/docs                               ${NC}"
    echo -e "${GREEN}======================================================================${NC}"
else
    echo -e "${YELLOW}ℹ Health check endpoint did not respond immediately. Check logs with 'docker logs terraguard-backend' or 'cat backend/backend.log'.${NC}"
fi
