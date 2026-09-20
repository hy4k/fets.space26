// FETS SPACE — Network Printer Subsystem Domain Types
// High-fidelity data structures for HP Laser MFP 1188fnw (192.168.29.91) and generic network printers

export type NetworkDeviceType =
  | 'WORKSTATION'
  | 'PRINTER'
  | 'SWITCH'
  | 'ROUTER'
  | 'SERVER'
  | 'CCTV'
  | 'DVR'
  | 'ACCESS_POINT'
  | 'OTHER';

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

export interface InfrastructureDevice {
  id: string;
  centreId: string;
  name: string;
  type: NetworkDeviceType;
  manufacturer: string;
  model: string;
  hostname: string;
  ipAddress: string;
  macAddress: string;
  location: string;
  room: string;
  healthStatus: DeviceHealthStatus;
  networkStatus: PrinterNetworkStatus;
  lastSeenAt: string;
  lastCheckedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PortProbeResult {
  port: number;
  service: string; // e.g. 'RAW / JetDirect (9100)', 'HTTP / EWS (80)', 'IPP (631)'
  open: boolean;
  responseTimeMs: number | null;
  error?: string;
}

export interface PrinterConsumable {
  name: string; // e.g. "Black Toner Cartridge W1108A"
  type: 'TONER' | 'DRUM' | 'MAINTENANCE_KIT';
  levelPercent: number | null; // null if NOT AVAILABLE
  status: 'OK' | 'LOW' | 'VERY_LOW' | 'EXHAUSTED' | 'NOT_AVAILABLE';
  modelCode?: string;
  serialNumber?: string;
  estimatedPagesRemaining?: number | null;
}

export interface PrinterPaperTray {
  trayIndex: number;
  name: string; // e.g. "Tray 1 (Manual/Standard Feed)"
  status: 'READY' | 'EMPTY' | 'JAMMED' | 'OPEN' | 'UNKNOWN';
  mediaSize: string | null; // e.g. "A4" or null if NOT AVAILABLE
  mediaType: string | null; // e.g. "Plain Paper (75-90 g/m²)" or null
  capacitySheets: number | null;
}

export interface PrinterTelemetry {
  // Device identity
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

  // Multi-dimensional status
  healthStatus: DeviceHealthStatus;
  networkStatus: PrinterNetworkStatus;
  printerState: PrinterState;
  
  // Monitoring telemetry
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

  // Port Diagnostics
  portProbes: PortProbeResult[];

  // Consumables & Paper (Nullable where unsupported)
  toner: PrinterConsumable | null;
  drum: PrinterConsumable | null;
  trays: PrinterPaperTray[];
  outputTrayStatus: 'READY' | 'FULL' | 'NOT_AVAILABLE';

  // Queue & Counters
  queueLength: number | null;
  currentJobName: string | null;
  totalPageCount: number | null;

  // Active Alert Flags
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
  probePorts: number[]; // e.g. [9100, 80, 631]
  consecutiveFailureThreshold: number; // e.g. 3
}

// Supported print transport protocols
export type PrintProtocol = 'RAW' | 'IPP' | 'LPD';

// Print Job Lifecycle Statuses
export type PrintJobStatus =
  | 'QUEUED'
  | 'SUBMITTED'
  | 'ACCEPTED'
  | 'PRINTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

// Domain model for print jobs
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

// Connection test result from transport probe
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

// Real queue status
export interface QueueStatus {
  isAvailable: boolean;
  currentJobs: number;
  queueLength: number;
  activeJobName: string | null;
  activeJobId?: string | null;
  acceptingJobs: boolean;
  details?: string;
}

// Printer Configuration Settings
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
