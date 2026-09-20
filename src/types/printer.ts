// FETS SPACE — Client-side Network Printer Types
// Dedicated to HP Laser MFP 1188fnw (192.168.29.91)

export type DeviceHealthStatus =
  | 'HEALTHY'
  | 'ATTENTION'
  | 'CRITICAL'
  | 'OFFLINE'
  | 'UNKNOWN';

export type PrinterNetworkStatus =
  | 'CONNECTED'
  | 'DEGRADED'
  | 'DISCONNECTED'
  | 'UNKNOWN';

export type PrinterState =
  | 'READY'
  | 'PRINTING'
  | 'PAUSED'
  | 'ERROR'
  | 'PAPER_EMPTY'
  | 'PAPER_JAM'
  | 'DOOR_OPEN'
  | 'TONER_LOW'
  | 'MAINTENANCE'
  | 'UNKNOWN';

export type MonitoringMode = 'AUTO' | 'LIVE_ONLY' | 'DEMO_ONLY';
export type MonitoringProviderType = 'NETWORK_TCP_HTTP' | 'SNMP' | 'IPP' | 'MOCK_DEMO';

export interface PortProbeResult {
  port: number;
  service: string;
  open: boolean;
  responseTimeMs: number | null;
  error?: string;
}

export interface PrinterConsumable {
  name: string;
  type: 'TONER' | 'DRUM' | 'MAINTENANCE_KIT';
  levelPercent: number | null; // null represents NOT AVAILABLE
  status: 'OK' | 'LOW' | 'VERY_LOW' | 'EXHAUSTED' | 'NOT_AVAILABLE';
  modelCode?: string;
  serialNumber?: string;
  estimatedPagesRemaining?: number | null;
}

export interface PrinterPaperTray {
  trayIndex: number;
  name: string;
  status: 'READY' | 'EMPTY' | 'JAMMED' | 'OPEN' | 'UNKNOWN';
  mediaSize: string | null;
  mediaType: string | null;
  capacitySheets: number | null;
}

export interface PrinterTelemetry {
  id: string;
  centreId: string;
  name: string;
  manufacturer: string;
  model: string;
  serialNumber: string | null;
  firmwareVersion: string | null;
  hostname: string;
  ipAddress: string;
  macAddress: string;
  location: string;
  room: string;
  webInterfaceUrl: string;

  healthStatus: DeviceHealthStatus;
  networkStatus: PrinterNetworkStatus;
  printerState: PrinterState;

  isLive: boolean;
  monitoringMode: MonitoringMode;
  provider: MonitoringProviderType;
  responseTimeMs: number | null;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  lastSuccessfulPollAt: string | null;
  lastFailedPollAt: string | null;
  lastCheckedAt: string;
  dataFreshnessSeconds: number;

  portProbes: PortProbeResult[];

  toner: PrinterConsumable | null;
  drum: PrinterConsumable | null;
  trays: PrinterPaperTray[];
  outputTrayStatus: 'READY' | 'FULL' | 'NOT_AVAILABLE';

  queueLength: number | null;
  currentJobName: string | null;
  totalPageCount: number | null;

  errorMessages: string[];
  maintenanceAlert: string | null;
}

export interface PrinterActivityEvent {
  id: string;
  timestamp: string;
  eventType:
    | 'REACHABLE'
    | 'UNREACHABLE'
    | 'STATE_CHANGED'
    | 'TONER_WARNING'
    | 'PAPER_EMPTY'
    | 'PAPER_JAM'
    | 'DOOR_OPEN'
    | 'PRINT_JOB'
    | 'TEST_PRINT'
    | 'CONFIG_UPDATED'
    | 'MAINTENANCE_TICKET';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  ipAddress: string;
}

export interface PrinterMonitoringConfig {
  printerId: string;
  ipAddress: string;
  name: string;
  location: string;
  room: string;
  monitoringEnabled: boolean;
  monitoringMode: MonitoringMode;
  pollIntervalSeconds: number;
  probePorts: number[];
  consecutiveFailureThreshold: number;
}

export type PrintProtocol = 'RAW' | 'IPP' | 'LPD';

export type PrintJobStatus =
  | 'QUEUED'
  | 'SUBMITTED'
  | 'ACCEPTED'
  | 'PRINTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface PrintJob {
  id: string;
  printerId: string;
  submittedBy: string;
  userRole?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  copies: number;
  paperSize?: string;
  orientation?: 'PORTRAIT' | 'LANDSCAPE';
  status: PrintJobStatus;
  protocol: PrintProtocol;
  submittedAt: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  failedAt?: string;
  cancelledAt?: string;
  errorMessage?: string;
  durationSeconds?: number;
  remoteJobId?: string;
}

export interface ConnectionTestResult {
  success: boolean;
  reachable: boolean;
  responseTimeMs: number | null;
  protocol: PrintProtocol;
  port: number;
  printerIdentity: string;
  details: string;
  timestamp: string;
  testedIp: string;
}

export interface QueueStatus {
  isAvailable: boolean;
  currentJobs: number;
  queueLength: number;
  activeJobName: string | null;
  activeJobId?: string | null;
  acceptingJobs: boolean;
  details?: string;
}

export interface PrinterSettingsConfig {
  printerName: string;
  manufacturer: string;
  model: string;
  ipAddress: string;
  connectionType: 'Ethernet' | 'Wi-Fi' | 'USB';
  printProtocol: PrintProtocol;
  port: number;
  enabled: boolean;
  pollIntervalSeconds: number;
  location: string;
  room: string;
}
