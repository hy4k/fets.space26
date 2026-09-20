import {
  PrinterTelemetry,
  PortProbeResult,
  MonitoringProviderType
} from './types';

export interface ReachabilityResult {
  isReachable: boolean;
  responseTimeMs: number | null;
  portProbes: PortProbeResult[];
  error?: string;
}

export interface PrinterMonitoringProvider {
  readonly providerType: MonitoringProviderType;
  readonly name: string;

  /**
   * Probe device reachability via network sockets / ping
   */
  checkReachability(ipAddress: string, ports: number[], timeoutMs?: number): Promise<ReachabilityResult>;

  /**
   * Fetch full printer status and hardware telemetry
   */
  fetchTelemetry(ipAddress: string): Promise<PrinterTelemetry>;

  /**
   * Send a test print command (or simulated diagnostic token job)
   */
  sendTestJob(ipAddress: string, title?: string): Promise<{ success: boolean; message: string; jobId?: string }>;
}
