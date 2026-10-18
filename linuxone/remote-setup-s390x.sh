#!/usr/bin/env bash
# ==============================================================================
# KAALVAN — IBM LinuxONE (s390x) Automated Provisioning & Systemd Setup
# Targets: RHEL 9.8 / RHEL 8 / SLES / Ubuntu on s390x architecture
# ==============================================================================

set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}======================================================================${NC}"
echo -e "${CYAN}   KAALVAN — IBM LinuxONE (s390x) Server Provisioning & Deployment   ${NC}"
echo -e "${CYAN}======================================================================${NC}"

# 1. Architecture Verification
ARCH=$(uname -m)
echo -e "▶ Detected Architecture: ${ARCH}"
if [ "${ARCH}" != "s390x" ]; then
    echo -e "${RED}✖ Warning: Host architecture is '${ARCH}', not native 's390x'.${NC}"
else
    echo -e "${GREEN}✔ Confirmed IBM zSystems / LinuxONE (s390x) mainframe architecture.${NC}"
fi

# 2. Hostname & OS Verification
echo -e "▶ Hostname: $(hostname -f 2>/dev/null || hostname)"
if [ -f /etc/os-release ]; then
    . /etc/os-release
    echo -e "▶ Operating System: ${PRETTY_NAME:-Linux}"
fi

# 3. Create Application Directory
APP_DIR="/opt/kaalvan/backend"
echo -e "\n▶ Provisioning destination directory at ${APP_DIR}..."
mkdir -p "${APP_DIR}"

# If tarball is extracted here or in /tmp, sync files
if [ -d "/tmp/kaalvan_backend" ]; then
    cp -r /tmp/kaalvan_backend/* "${APP_DIR}/"
fi

cd "${APP_DIR}"

# 4. Configure Python Virtual Environment
echo -e "\n▶ Configuring Python virtual environment..."
if command -v dnf &> /dev/null; then
    echo "Ensuring Python 3 & build dependencies are present..."
    dnf install -y python3 python3-pip python3-devel gcc gcc-c++ || true
elif command -v apt-get &> /dev/null; then
    apt-get update -y && apt-get install -y python3 python3-pip python3-venv build-essential || true
fi

python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

# 5. Configure Production Environment File
if [ ! -f .env ]; then
    cat << 'EOF' > .env
PROJECT_NAME="KAALVAN"
ENVIRONMENT="production"
PORT=8000
HOST="0.0.0.0"
DATABASE_URL="sqlite:///./terraguard.db"
NASA_FIRMS_MAP_KEY="8dd0127265e38c76e2b5880b758bb17e"
OPEN_METEO_BASE_URL="https://api.open-meteo.com/v1"
OPEN_METEO_AIR_QUALITY_URL="https://air-quality-api.open-meteo.com/v1"
CACHE_TTL_SECONDS=600
CORS_ORIGINS="*"
LINUXONE_TELEMETRY=true
EOF
    echo -e "${GREEN}✔ Created production .env file.${NC}"
fi

# 6. Install Systemd Service
echo -e "\n▶ Installing systemd service..."
cat << 'EOF' > /etc/systemd/system/kaalvan.service
[Unit]
Description=KAALVAN Planetary Environmental Intelligence Backend (IBM LinuxONE s390x)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/kaalvan/backend
EnvironmentFile=/opt/kaalvan/backend/.env
ExecStart=/opt/kaalvan/backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
Restart=always
RestartSec=5s
LimitNOFILE=65536
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable kaalvan.service
systemctl restart kaalvan.service

echo -e "${GREEN}✔ kaalvan.service enabled and started.${NC}"

# 7. Local Health Audit
echo -e "\n▶ Verifying local health check..."
sleep 4
if curl -s -f http://127.0.0.1:8000/health > /tmp/kaalvan_health.json; then
    echo -e "${GREEN}✔ Health Check PASSED on http://127.0.0.1:8000/health${NC}"
    cat /tmp/kaalvan_health.json
else
    echo -e "${YELLOW}ℹ Health check still warming up. Checking service status:${NC}"
    systemctl status kaalvan.service --no-pager || true
fi

# 8. Firewall & Network Audit
echo -e "\n▶ Investigating Network & Firewall Configuration..."
if command -v firewall-cmd &> /dev/null && systemctl is-active firewalld &> /dev/null; then
    echo "Firewalld is active."
    echo "Currently open ports: $(firewall-cmd --list-ports)"
else
    echo "Firewalld not active or iptables/cloud security groups managing ingress."
fi

echo -e "\n${GREEN}======================================================================${NC}"
echo -e "${GREEN}   KAALVAN BACKEND DEPLOYMENT COMPLETE ON IBM LINUXONE (s390x)        ${NC}"
echo -e "${GREEN}======================================================================${NC}"
