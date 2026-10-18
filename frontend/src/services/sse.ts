import type { PriorityAlert } from '../types';

export type AlertStreamCallback = (alert: PriorityAlert) => void;
export type PulseCallback = (pulseData: any) => void;
export type StatusCallback = (connected: boolean) => void;

export class AlertSSEClient {
  private eventSource: EventSource | null = null;
  private alertListeners: Set<AlertStreamCallback> = new Set();
  private pulseListeners: Set<PulseCallback> = new Set();
  private statusListeners: Set<StatusCallback> = new Set();
  private reconnectTimer: any = null;

  connect() {
    if (this.eventSource) {
      this.eventSource.close();
    }

    try {
      const rawBase = (import.meta.env.VITE_API_BASE_URL as string) || '';
      const streamUrl = rawBase ? `${rawBase}/api/alerts/stream` : '/api/alerts/stream';
      this.eventSource = new EventSource(streamUrl);

      this.eventSource.onopen = () => {
        this.notifyStatus(true);
      };

      this.eventSource.addEventListener('alert', (e) => {
        try {
          const alertData: PriorityAlert = JSON.parse(e.data);
          this.alertListeners.forEach((fn) => fn(alertData));
        } catch (err) {
          console.error('Error parsing SSE alert payload:', err);
        }
      });

      this.eventSource.addEventListener('pulse', (e) => {
        try {
          const pulse = JSON.parse(e.data);
          this.pulseListeners.forEach((fn) => fn(pulse));
        } catch (err) {
          console.error('Error parsing SSE pulse payload:', err);
        }
      });

      this.eventSource.onerror = () => {
        this.notifyStatus(false);
        this.eventSource?.close();
        this.eventSource = null;
        // Reconnect after 5 seconds
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = setTimeout(() => this.connect(), 5000);
      };
    } catch (e) {
      console.warn('SSE connection failed, running in polling fallback mode:', e);
      this.notifyStatus(false);
    }
  }

  disconnect() {
    clearTimeout(this.reconnectTimer);
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.notifyStatus(false);
  }

  onAlert(cb: AlertStreamCallback) {
    this.alertListeners.add(cb);
    return () => this.alertListeners.delete(cb);
  }

  onPulse(cb: PulseCallback) {
    this.pulseListeners.add(cb);
    return () => this.pulseListeners.delete(cb);
  }

  onStatusChange(cb: StatusCallback) {
    this.statusListeners.add(cb);
    return () => this.statusListeners.delete(cb);
  }

  private notifyStatus(connected: boolean) {
    this.statusListeners.forEach((fn) => fn(connected));
  }
}

export const alertStream = new AlertSSEClient();
