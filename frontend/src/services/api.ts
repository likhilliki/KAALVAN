import type {
  ForestRegion,
  SearchResult,
  EnvironmentalReport,
  RiskAssessment,
  ModelBenchmark,
  PriorityAlert,
  LinuxONETelemetry,
  FirmsThermalAnomaly,
  ComprehensiveRegionalReport,
  MapLayerItem
} from '../types';

const RAW_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '';
const API_BASE = RAW_BASE ? `${RAW_BASE}/api` : '/api';
const HEALTH_URL = RAW_BASE ? `${RAW_BASE}/health` : '/health';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText || response.statusText}`);
    }
    return response.json();
  } catch (err: any) {
    clearTimeout(timeoutId);
    // If external direct IP failed or timed out, retry via local Vite proxy
    if (RAW_BASE && url.startsWith(RAW_BASE)) {
      try {
        const proxyUrl = url.replace(RAW_BASE, '');
        const retryResp = await fetch(proxyUrl, options);
        if (retryResp.ok) {
          return retryResp.json();
        }
      } catch {
        // Fall through to throw original error
      }
    }
    throw err;
  }
}

export const api = {
  async getHealth() {
    return fetchJson<{
      status: string;
      service: string;
      version: string;
      database: string;
      ml_model_loaded: boolean;
      system_architecture: string;
      is_ibm_linuxone: boolean;
      data_sources?: Record<string, string>;
    }>(HEALTH_URL);
  },

  async getRegions(): Promise<ForestRegion[]> {
    return fetchJson<ForestRegion[]>(`${API_BASE}/regions`);
  },

  async getRegion(code: string): Promise<ForestRegion> {
    return fetchJson<ForestRegion>(`${API_BASE}/regions/${encodeURIComponent(code)}`);
  },

  async getRegionReport(code: string): Promise<ComprehensiveRegionalReport> {
    return fetchJson<ComprehensiveRegionalReport>(`${API_BASE}/regions/${encodeURIComponent(code)}/report`);
  },

  async search(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];
    return fetchJson<SearchResult[]>(`${API_BASE}/regions/search?q=${encodeURIComponent(query)}`);
  },

  async getEnvironmentalData(code: string): Promise<EnvironmentalReport> {
    return fetchJson<EnvironmentalReport>(`${API_BASE}/environmental/${encodeURIComponent(code)}`);
  },

  async getGlobalHotspots(): Promise<FirmsThermalAnomaly[]> {
    return fetchJson<FirmsThermalAnomaly[]>(`${API_BASE}/environmental/hotspots/global`);
  },

  async getFires(lat?: number, lon?: number, radiusKm: number = 300): Promise<{
    status: string;
    total_detections: number;
    fires: FirmsThermalAnomaly[];
  }> {
    const params = lat !== undefined && lon !== undefined
      ? `?lat=${lat}&lon=${lon}&radius_km=${radiusKm}`
      : '';
    return fetchJson<{
      status: string;
      total_detections: number;
      fires: FirmsThermalAnomaly[];
    }>(`${API_BASE}/fires${params}`);
  },

  async getWeather(lat: number, lon: number): Promise<any> {
    return fetchJson<any>(`${API_BASE}/weather?lat=${lat}&lon=${lon}`);
  },

  async getLayers(): Promise<{ status: string; total_layers: number; layers: MapLayerItem[] }> {
    return fetchJson<{ status: string; total_layers: number; layers: MapLayerItem[] }>(`${API_BASE}/layers`);
  },

  async getRiskAssessment(code: string): Promise<RiskAssessment> {
    return fetchJson<RiskAssessment>(`${API_BASE}/risk/assess/${encodeURIComponent(code)}`);
  },

  async getModelBenchmark(): Promise<ModelBenchmark> {
    return fetchJson<ModelBenchmark>(`${API_BASE}/risk/benchmark`);
  },

  async getAlerts(): Promise<PriorityAlert[]> {
    return fetchJson<PriorityAlert[]>(`${API_BASE}/alerts`);
  },

  async getLinuxONETelemetry(): Promise<LinuxONETelemetry> {
    return fetchJson<LinuxONETelemetry>(`${API_BASE}/linuxone/telemetry`);
  }
};

