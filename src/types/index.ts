export type SystemType = 'workstation' | 'server' | 'admin_pc' | 'other';
export type SystemStatus = 'operational' | 'attention' | 'critical' | 'offline' | 'maintenance';

// Multi-dimensional status model
export type HealthStatus = 'operational' | 'attention' | 'critical' | 'offline' | 'maintenance';
export type OccupancyStatus = 'available' | 'busy' | 'reserved' | 'post_exam' | 'unavailable';
export type NetworkStatus = 'connected' | 'degraded' | 'disconnected' | 'unknown';
export type ExamReadinessStatus = 'ready' | 'warning' | 'blocked' | 'checking' | 'unknown';
export type AgentStatus = 'online' | 'stale' | 'offline' | 'never_connected';

// Booth Physical Status
export type BoothPhysicalStatus = 'occupied_by_system' | 'open_slot' | 'unavailable';

export interface Booth {
  id: string; // e.g. 'B001', 'B037'
  centreId: string;
  boothNumber: number; // 1 to 40
  room: string;
  floor: string;
  positionX: number;
  positionY: number;
  position?: string;
  installedSystemId: string | null; // e.g. 'W001' or null for B037-B040
  physicalStatus: BoothPhysicalStatus;
}

export interface Workstation {
  id: string; // e.g. 'W001'
  centreId: string;
  boothId: string; // e.g. 'B001'
  boothNumber: number;
  hostname: string; // e.g. '4960-T001'
  ipAddress: string;
  macAddress: string;
  room: string;
  floor: string;
  seatNumber: string;

  // Multi-dimensional Status
  healthStatus: HealthStatus;
  occupancyStatus: OccupancyStatus;
  networkStatus: NetworkStatus;
  examReadinessStatus: ExamReadinessStatus;
  agentStatus: AgentStatus;

  // Hardware
  cpuModel: string;
  cpuUsage: number; // 0-100%
  ramTotal: number; // GB
  ramUsage: number; // 0-100%
  storageTotal: number; // GB
  storageFree: number; // GB
  storageHealth: 'healthy' | 'warning' | 'critical';

  // Operating System
  operatingSystem: string;
  osVersion: string;
  osBuild: string;
  architecture: '64-bit' | '32-bit';

  // Peripherals
  monitorModel: string;
  cameraModel: string;
  keyboardModel?: string;
  mouseModel?: string;
  headsetModel?: string;

  // Heartbeat & Audit Timestamps
  lastHeartbeatAt: string;
  lastSeenAt: string;
  lastAuditAt?: string;
  nextAuditDueAt?: string;

  currentSessionId?: string | null;
  currentSession?: OccupancySession | null;
  activeIssueCount?: number;

  createdAt: string;
  updatedAt: string;
}

export interface OccupancySession {
  id: string;
  centreId: string;
  workstationId: string;
  boothNumber: number;
  examCode: string;
  examName: string;
  candidateRef: string; // Privacy-safe identifier e.g. CAND-7821
  candidateName?: string;
  status: 'active' | 'completed' | 'terminated' | 'on_break' | 'flagged';
  startedAt: string;
  expectedEndAt?: string;
  endedAt?: string;
  pauseReason?: string;
  flags?: string[];
  extraTimeMinutes?: number;
}

export type IntakeStatus = 'registered' | 'photo_captured' | 'biometric_verified' | 'seat_assigned' | 'in_exam' | 'completed';

export interface CandidateIntakeRecord {
  id: string; // e.g. 'INT-4912'
  candidateRef: string; // 'CAND-4912'
  candidateName: string;
  scheduledExamCode: string;
  scheduledExamName: string;
  scheduledTime: string;
  intakeStatus: IntakeStatus;
  idDocumentType: 'Passport' | 'National ID' | 'Driving License' | 'Voter ID';
  idDocumentVerified: boolean;
  photoCaptured: boolean;
  biometricCaptured: boolean;
  signatureCaptured: boolean;
  lockerNumber?: string;
  assignedBoothId?: string; // e.g. 'W008'
  assignedBoothNumber?: number;
  checkInTime?: string;
  proctorNotes?: string;
}

export interface SyncPayloadPackage {
  id: string;
  examId: string;
  examName: string;
  vendor: string;
  version: string;
  packageSizeBytes: number;
  packageSizeFormatted: string;
  sha256Hash: string;
  cachedWorkstationsCount: number;
  totalTargetWorkstations: number;
  status: 'cached' | 'syncing' | 'delta_pending' | 'error';
  lastSynchronizedAt: string;
}

export interface SyncRosterJob {
  id: string;
  sponsor: string;
  sessionSlot: string;
  candidatesScheduled: number;
  candidatesSynced: number;
  status: 'synchronized' | 'in_progress' | 'pending' | 'failed';
  lastSyncTime: string;
  nextScheduledSync: string;
  securityHash: string;
}

export interface CandidateUploadQueueItem {
  id: string;
  candidateRef: string;
  workstationId: string;
  examName: string;
  packageRef: string;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  encryptionStandard: string;
  status: 'uploaded' | 'transmitting' | 'queued' | 'retry';
  uploadedAt?: string;
  queuedAt: string;
  attemptCount: number;
}

export interface AuditCertificationSpec {
  id: string;
  sponsorName: string;
  accreditationTitle: string;
  certificationNumber: string;
  validUntil: string;
  leadAuditor: string;
  tcaSignOff: string;
  itAdminSignOff: string;
  inspectionDate: string;
  overallScore: number;
  status: 'compliant' | 'provisional' | 'action_required';
  requirements: {
    category: string;
    description: string;
    standard: string;
    passed: boolean;
    measuredValue: string;
  }[];
}

export interface AgentRegistration {
  token: string;
  workstationId: string;
  status: 'pending' | 'activated' | 'revoked';
  createdAt: string;
  expiresAt: string;
  agentVersion?: string;
}

export interface CentreCapacity {
  physicalBooths: number; // 40
  installedSystems: number; // 36
  openBoothSlots: number; // 4
  availableSystems: number; // strictly available for test assignment
  busySystems: number; // currently in examination
  reservedSystems: number;
  postExamSystems: number;
  unavailableSystems: number;

  // Health distribution of installed systems
  operational: number;
  attention: number;
  critical: number;
  offline: number;
  maintenance: number;
}

export type UserRole = 'admin' | 'it_admin' | 'technician' | 'tca' | 'manager' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  centre: string;
}

export interface Centre {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  country: string;
  totalWorkstations: number;
  totalBooths?: number;
  installedSystems?: number;
  openSlots?: number;
  networkSubnet: string;
  location?: string;
  primaryIsp?: string;
  primaryIspPlan?: string;
  primaryIspSpeed?: string;
  primaryIspIp?: string;
  secondaryIsp?: string;
  secondaryIspSpeed?: string;
  secondaryIspIp?: string;
  secondaryGatewayIp?: string;
  gatewayIp?: string;
}

export type ExamAppCategory = 'delivery' | 'admin_admission' | 'unclassified';

export interface InstalledExamApp {
  appId: string;
  appName: string;
  code: string;
  category?: ExamAppCategory;
  version: string;
  expectedVersion?: string;
  status: 'installed' | 'missing' | 'issue' | 'not_checked' | 'not_verified';
  lastVerified: string;
  lastVerifiedDate?: string;
  verifiedBy?: string;
  notes?: string;
}

export interface SystemHardware {
  processor: string;
  ramGB: number;
  storageGB: number;
  storageType: 'SSD' | 'NVMe' | 'HDD' | 'None';
  monitorModel: string;
  cameraModel: string;
  keyboardModel?: string;
  mouseModel?: string;
  headsetModel?: string;
  cpuBrand?: string;
}

export interface SystemOperatingSystem {
  name: string;
  version: string;
  build: string;
  architecture: '64-bit' | '32-bit';
  lastUpdateDate: string;
}

export interface SystemNetwork {
  ipAddress: string;
  macAddress: string;
  gateway: string;
  dns: string;
  switchId: string;
  switchPort: number;
  vlan: number;
  linkSpeed: string;
}

export interface SystemRecord {
  id: string;
  name: string;
  type: SystemType;
  status: SystemStatus;
  centreId: string;
  centreName: string;
  boothId?: string;
  boothNumber?: number;
  healthStatus?: HealthStatus;
  occupancyStatus?: OccupancyStatus;
  networkStatus?: NetworkStatus;
  examReadinessStatus?: ExamReadinessStatus;
  agentStatus?: AgentStatus;
  cpuUsage?: number;
  ramUsage?: number;
  storageUsage?: number;
  lastHeartbeatAt?: string;
  currentSessionId?: string | null;
  currentSession?: OccupancySession | null;
  hardware: SystemHardware;
  os: SystemOperatingSystem;
  network: SystemNetwork;
  examApps: InstalledExamApp[];
  assignedAssetIds: string[];
  lastUpdated: string;
  lastAuditDate?: string;
  notes?: string;
  activeIssueCount: number;
}

export interface ExamApplication {
  id: string;
  code: string;
  name: string;
  vendor: string;
  category: ExamAppCategory;
  currentVersion: string;
  expectedVersion?: string;
  minWindowsVersion: string;
  minOs?: string;
  minRamGB: number;
  minStorageGB: number;
  requiredPeripherals: string[];
  description: string;
  color: string;
  installedCount: number;
  totalSystems: number;
  lastChecked: string;
  enabled?: boolean;
  eligibleSystemTypes?: ('workstation' | 'admin_pc' | 'server')[];
}

export type AssetCategory =
  | 'computer'
  | 'monitor'
  | 'keyboard'
  | 'mouse'
  | 'headset'
  | 'camera'
  | 'cctv'
  | 'switch'
  | 'printer'
  | 'cable'
  | 'other';

export type AssetStatus = 'available' | 'assigned' | 'in_repair' | 'maintenance' | 'retired' | 'lost';

export interface Asset {
  id: string;
  category: AssetCategory;
  brand: string;
  model: string;
  serialNumber: string;
  status: AssetStatus;
  assignedLocation: string;
  assignedSystemId?: string;
  assignedSystemName?: string;
  purchaseDate: string;
  warrantyExpiry: string;
  notes?: string;
  condition?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface AssetMovement {
  id: string;
  assetId: string;
  assetTag: string;
  assetCategory: AssetCategory;
  fromSystemId?: string;
  fromSystemName?: string;
  toSystemId?: string;
  toSystemName?: string;
  fromLocation: string;
  toLocation: string;
  reason: string;
  movedBy: string;
  timestamp: string;
}

export type IssueType = 'hardware' | 'software' | 'exam_app' | 'network' | 'peripheral' | 'other';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface IssueComment {
  id: string;
  author: string;
  role: string;
  text: string;
  timestamp: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  type: IssueType;
  priority: IssuePriority;
  status: IssueStatus;
  systemId?: string;
  systemName?: string;
  reportedBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  comments: IssueComment[];
  resolutionNotes?: string;
  attachments?: string[];
}

export interface AuditChecklistItem {
  id: string;
  category: string;
  item: string;
  status: 'pass' | 'fail' | 'na';
  notes?: string;
}

export interface AuditRecord {
  id: string;
  systemId: string;
  systemName: string;
  auditor: string;
  auditorRole: string;
  date: string;
  status: 'passed' | 'failed' | 'needs_attention';
  checklist: AuditChecklistItem[];
  notes: string;
  durationMinutes: number;
}

export interface MaintenanceRecord {
  id: string;
  title: string;
  type: 'preventive' | 'corrective' | 'upgrade' | 'patch';
  systemIds: string[];
  scheduledDate: string;
  completedDate?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  technician: string;
  description: string;
  notes?: string;
}

export interface Alert {
  id: string;
  type: 'critical' | 'attention' | 'offline' | 'info';
  title: string;
  message: string;
  systemId?: string;
  systemName?: string;
  entityType?: 'system' | 'asset' | 'issue' | 'exam' | 'audit';
  entityId?: string;
  timestamp: string;
  read: boolean;
  resolved: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  category: 'issue' | 'audit' | 'asset' | 'system' | 'readiness';
  timestamp: string;
  read: boolean;
  link?: string;
}

export interface SwitchPort {
  portNumber: number;
  status: 'connected' | 'empty' | 'disabled';
  connectedSystemId?: string;
  connectedSystemName?: string;
  speed: string;
  vlan: number;
  poe: boolean;
}

export interface NetworkSwitch {
  id: string;
  name: string;
  model: string;
  ipAddress: string;
  macAddress: string;
  location: string;
  totalPorts: number;
  ports: SwitchPort[];
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  category: 'system' | 'asset' | 'exam' | 'issue' | 'audit' | 'maintenance' | 'network' | 'occupancy';
  targetId: string;
  targetName: string;
  details: string;
}

export interface ExamReadinessRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  ruleType: 'online' | 'app_installed' | 'version_match' | 'ram_check' | 'storage_check' | 'windows_version' | 'peripherals';
}

export interface ExamReadinessCheckResult {
  systemId: string;
  systemName: string;
  status: 'ready' | 'attention' | 'not_ready';
  passedRules: string[];
  failedRules: string[];
  warnings: string[];
}

// Floor Map Layout Types
export type FloorZone = 'LEFT' | 'CENTER' | 'RIGHT' | 'ADMIN' | 'SERVER';

export interface SystemLayout {
  id: string;
  systemId: string;
  zone: FloorZone;
  deskId: string;
  row?: number;
  col?: number;
  positionX: number; // in pixels relative to floor canvas (e.g. 0 to 1200)
  positionY: number; // in pixels relative to floor canvas (e.g. 0 to 900)
  rotation?: number; // 0, 90, 180, 270 degrees
  mapVisible: boolean;
  updatedAt?: string;
}

export interface DeskGroup {
  id: string;
  name: string;
  zone: FloorZone;
  label: string;
  systemIds: string[];
}

export interface FloorMapConfig {
  roomName: string;
  centreCode: string;
  canvasWidth: number;
  canvasHeight: number;
  gridSnap: boolean;
  gridSize: number;
}

// Centre-Wide Live Network Speed & Monitoring Telemetry
export type NetworkMonitoringSourceType =
  | 'Admin Server'
  | 'Gateway'
  | 'Router'
  | 'Dedicated Monitoring Host'
  | 'Custom Interface';

export type NetworkTelemetryStatus = 'live' | 'recent' | 'stale' | 'unavailable' | 'zero';

export interface NetworkMonitoringConfig {
  monitoringSource: NetworkMonitoringSourceType;
  interfaceName: string;
  linkSpeed: string;
  status: 'active' | 'stale_simulated' | 'unavailable_simulated' | 'zero_simulated';
  refreshInterval: number;
  connectedSystems: number;
}

export interface NetworkSpeedReading {
  timestamp: string;
  downloadMbps: number;
  uploadMbps: number;
}

export interface NetworkOverview {
  downloadMbps: number;
  uploadMbps: number;
  monitoringSource: NetworkMonitoringSourceType;
  interface: string;
  linkSpeed: string;
  status: NetworkTelemetryStatus;
  lastUpdatedAt: string;
  dataFreshnessSeconds: number;
  connectedSystems: number;
  rawCounters?: {
    bytesReceived: number;
    bytesSent: number;
    elapsedSeconds: number;
  };
  recentReadings: NetworkSpeedReading[];
}

export * from './printer';

export type AppTheme = 'light' | 'dark';

