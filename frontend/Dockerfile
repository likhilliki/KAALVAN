# ==============================================================================
# TerraGuard AI Frontend — Multi-Architecture Containerfile
# Targets: linux/s390x (IBM LinuxONE / zSystems) & linux/amd64
# ==============================================================================

FROM --platform=$TARGETPLATFORM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production Server with Nginx
FROM --platform=$TARGETPLATFORM nginx:alpine-slim AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
