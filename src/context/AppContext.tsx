import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SystemRecord,
  ExamApplication,
  Asset,
  AssetMovement,
  Issue,
  AuditRecord,
  MaintenanceRecord,
  Alert,
  AppNotification,
  NetworkSwitch,
  ActivityLog,
  Centre,
  User,
  ExamReadinessRule,
  SystemStatus,
  IssueStatus,
  InstalledExamApp,
  ExamAppCategory,
  UserRole,
  SystemLayout,
  Booth,
  Workstation,
  OccupancyStatus,
  HealthStatus,
  CentreCapacity,
  AppTheme,
  CandidateIntakeRecord,
  IntakeStatus,
  SyncPayloadPackage,
  SyncRosterJob,
  CandidateUploadQueueItem,
  AuditCertificationSpec,
  OccupancySession
} from '../types';
import {
  CURRENT_USER,
  AVAILABLE_USERS,
  CURRENT_CENTRE,
  ALL_CENTRES,
  INITIAL_EXAM_APPLICATIONS,
  generateInitialSystems,
  INITIAL_BOOTHS,
  INITIAL_ASSETS,
  INITIAL_ASSET_MOVEMENTS,
  INITIAL_ISSUES,
  INITIAL_AUDITS,
  INITIAL_MAINTENANCE,
  INITIAL_ALERTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_SWITCHES,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_READINESS_RULES,
  DEFAULT_SYSTEM_LAYOUTS,
  INITIAL_CANDIDATE_INTAKES,
  INITIAL_SYNC_PACKAGES,
  INITIAL_SYNC_ROSTERS,
  INITIAL_UPLOAD_QUEUE,
  INITIAL_AUDIT_CERTIFICATIONS
} from '../data/seedData';

export type AppView =
  | 'overview'
  | 'floor-map'
  | 'systems'
  | 'system-detail'
  | 'assets'
  | 'asset-detail'
  | 'asset-movements'
  | 'network'
  | 'exams'
  | 'exam-detail'
  | 'exam-matrix'
  | 'issues'
  | 'issue-detail'
  | 'maintenance'
  | 'audits'
  | 'audit-detail'
  | 'alerts'
  | 'reports'
  | 'settings'
  | 'login';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  availableUsers: User[];
  currentCentre: Centre;
  setCurrentCentre: (centre: Centre) => void;
  allCentres: Centre[];
  
  // Navigation
  activeView: AppView;
  selectedEntityId: string | null;
  navigate: (view: AppView, id?: string | null) => void;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  isMobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  isTopNavOpen: boolean;
  setTopNavOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleTopNav: () => void;
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  
  // Systems
  systems: SystemRecord[];
  getSystem: (id: string) => SystemRecord | undefined;
  createSystem: (data: Partial<SystemRecord>) => SystemRecord;
  updateSystem: (id: string, updates: Partial<SystemRecord>) => void;
  deleteSystem: (id: string) => void;
  setSystemStatus: (id: string, status: SystemStatus, notes?: string) => void;

  // Floor Map Layout
  floorLayouts: Record<string, SystemLayout>;
  updateSystemLayout: (systemId: string, layoutUpdates: Partial<SystemLayout>) => void;
  saveFloorLayouts: (newLayouts: Record<string, SystemLayout>) => void;
  resetFloorLayouts: () => void;
  
  // Exam Apps
  examApps: ExamApplication[];
  installExamApp: (systemId: string, appId: string, version: string) => void;
  uninstallExamApp: (systemId: string, appId: string) => void;
  updateExamAppVersion: (systemId: string, appId: string, version: string) => void;
  toggleExamAppStatus: (systemId: string, appId: string, status: InstalledExamApp['status']) => void;
  updateExamAppStatus: (
    systemId: string,
    appId: string,
    status: InstalledExamApp['status'],
    notes?: string,
    version?: string,
    verifiedBy?: string
  ) => void;
  verifyExamApp: (
    systemId: string,
    appId: string,
    status?: InstalledExamApp['status'],
    notes?: string
  ) => void;
  addExamApp: (
    data: Partial<ExamApplication> & {
      name: string;
      code: string;
      vendor: string;
      currentVersion: string;
      category?: ExamAppCategory;
    }
  ) => ExamApplication;
  updateExamApp: (appId: string, updates: Partial<ExamApplication>) => void;
  deleteExamApp: (appId: string) => void;
  
  // Assets
  assets: Asset[];
  getAsset: (id: string) => Asset | undefined;
  createAsset: (data: Omit<Asset, 'id'> & { id?: string }) => Asset;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  clearAllAssets: () => void;
  transferAsset: (assetId: string, toSystemId: string | undefined, toLocation: string, reason: string) => void;
  assetMovements: AssetMovement[];
  
  // Issues
  issues: Issue[];
  getIssue: (id: string) => Issue | undefined;
  createIssue: (data: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'comments'>) => Issue;
  updateIssueStatus: (id: string, status: IssueStatus, resolutionNotes?: string) => void;
  addIssueComment: (issueId: string, text: string) => void;
  
  // Audits
  audits: AuditRecord[];
  getAudit: (id: string) => AuditRecord | undefined;
  recordAudit: (audit: Omit<AuditRecord, 'id' | 'date'>) => AuditRecord;
  
  // Maintenance
  maintenance: MaintenanceRecord[];
  createMaintenance: (data: Omit<MaintenanceRecord, 'id'>) => MaintenanceRecord;
  updateMaintenanceStatus: (id: string, status: MaintenanceRecord['status']) => void;
  
  // Alerts & Notifications
  alerts: Alert[];
  markAlertRead: (id: string) => void;
  resolveAlert: (id: string) => void;
  markAlertResolved: (id: string) => void;
  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Network
  switches: NetworkSwitch[];
  
  // Activity Logs
  activityLogs: ActivityLog[];
  logActivity: (action: string, category: ActivityLog['category'], targetId: string, targetName: string, details: string) => void;
  
  // Exam Readiness
  readinessRules: ExamReadinessRule[];
  toggleReadinessRule: (ruleId: string) => void;
  
  // System State Management
  lastSyncTime: Date;
  refreshData: () => void;
  resetToDefaultData: () => void;

  // Physical Booths & Live Capacity Engine
  booths: Booth[];
  capacity: CentreCapacity;
  isLiveBackendConnected: boolean;
  transitionOccupancy: (
    workstationId: string,
    targetStatus: OccupancyStatus,
    sessionData?: { examCode?: string; examName?: string; candidateRef?: string }
  ) => Promise<{ success: boolean; error?: string }>;
  registerAgentToken: (workstationId: string) => Promise<string>;
  simulateAgentHeartbeat: (workstationId: string) => Promise<void>;
  simulateAgentTelemetry: (workstationId: string, telemetry: { cpuUsage?: number; ramUsage?: number; storageFree?: number }) => Promise<void>;
  readinessBreakdown: {
    overallScore: number;
    status: string;
    operationalState: 'READY' | 'ATTENTION' | 'OFFLINE' | 'MAINTENANCE';
    verifiedPillarsPassed?: number;
    totalPillars?: number;
    factors: Array<{ name: string; status?: string; score?: number; detail: string }>;
  };

  // Global Theme Mode ('light' [Warm/Off-white] | 'dark' [Dark])
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;

  // Phase 7: Candidate Intake & Live Proctoring (Division 2: Admission Manager & ProAdmin)
  candidateIntakes: CandidateIntakeRecord[];
  addCandidateIntake: (data: Partial<CandidateIntakeRecord>) => CandidateIntakeRecord;
  updateCandidateIntakeStatus: (id: string, status: IntakeStatus, updates?: Partial<CandidateIntakeRecord>) => void;
  assignCandidateSeat: (intakeId: string, boothId: string, boothNumber: number) => void;
  admitCandidateToExam: (intakeId: string) => Promise<boolean>;
  pauseSession: (sessionId: string, reason: string) => void;
  resumeSession: (sessionId: string) => void;
  flagCandidateSession: (sessionId: string, flagReason: string) => void;
  addSessionExtraTime: (sessionId: string, minutes: number) => void;
  terminateCandidateSession: (sessionId: string) => void;

  // Phase 8: Synchronizer Telemetry & Exam Cache (Division 2: Synchronizer)
  syncPackages: SyncPayloadPackage[];
  triggerPackageSync: (packageId: string) => Promise<void>;
  syncRosters: SyncRosterJob[];
  triggerRosterSync: (jobId: string) => Promise<void>;
  uploadQueue: CandidateUploadQueueItem[];
  retryCandidateUpload: (uploadId: string) => Promise<void>;

  // Phase 9: Official Audit Certifications & State Snapshots
  auditCertifications: AuditCertificationSpec[];
  exportStateJson: () => void;
  importStateJson: (jsonString: string) => { success: boolean; error?: string };
  resetStateToDefault: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'fets_space_state_v6';
const THEME_STORAGE_KEY = 'fets-space-theme';

export const getInitialTheme = (): AppTheme => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light') {
      return 'light';
    }
    if (saved === 'dark') {
      return 'dark';
    }
  } catch (e) {}
  return 'dark';
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [currentCentre, setCurrentCentre] = useState<Centre>(CURRENT_CENTRE);
  const [activeView, setActiveView] = useState<AppView>('overview');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState<boolean>(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [isTopNavOpen, setTopNavOpen] = useState<boolean>(false);
  const toggleTopNav = () => setTopNavOpen((prev) => !prev);
  const [isSearchOpen, setSearchOpen] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [isLiveBackendConnected, setIsLiveBackendConnected] = useState<boolean>(false);

  // Global Theme Mode State
  const [theme, setThemeState] = useState<AppTheme>(getInitialTheme);

  const applyThemeToDOM = (newTheme: AppTheme) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
      document.body.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
      document.body.setAttribute('data-theme', 'light');
    }
  };

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {}
    applyThemeToDOM(newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  // Booths state (40 physical booth positions)
  const [booths, setBooths] = useState<Booth[]>(INITIAL_BOOTHS);

  // Systems state (36 installed workstations + servers/admin PCs)
  const [systems, setSystems] = useState<SystemRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_systems`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.filter((s: SystemRecord) => s.type === 'workstation').length === 36 &&
          parsed.some((s: SystemRecord) => s.examApps?.some((a) => a.appId === 'cma' || a.appId === 'pv'))
        ) {
          const initialSystems = generateInitialSystems();
          return parsed.map((s: SystemRecord) => {
            if (s.id === 'ADM-01' || s.id === 'MW01' || s.type === 'admin_pc') {
              const hasNewAdminApps = s.examApps?.some((a) => a.appId === 'admin-proadmin' || a.appId === 'admin-admission-manager');
              if (!hasNewAdminApps) {
                const initSys = initialSystems.find((init) => init.id === s.id);
                if (initSys) {
                  return { ...s, examApps: initSys.examApps };
                }
              }
            } else if (s.type === 'workstation') {
              if (s.id === 'W036') {
                return {
                  ...s,
                  status: 'attention' as const,
                  healthStatus: 'attention' as const,
                  occupancyStatus: 'unavailable' as const,
                  examReadinessStatus: 'blocked' as const,
                  activeIssueCount: 1,
                  notes: 'ATTENTION: No SSD installed. Workstation pending 128GB SSD drive installation and Windows 11 Home OS image deployment.',
                  hardware: {
                    ...s.hardware,
                    ramGB: 8,
                    storageGB: 0,
                    storageType: 'None' as const
                  },
                  os: {
                    ...s.os,
                    name: 'No OS (No SSD)',
                    version: '—',
                    build: '—',
                    architecture: '64-bit' as const,
                    lastUpdateDate: '—'
                  },
                  examApps: s.examApps?.map((a) => ({
                    ...a,
                    status: 'missing' as const,
                    version: '—',
                    notes: 'Pending SSD installation'
                  }))
                };
              }
              const updatedApps = s.examApps?.map((a) => ({
                ...a,
                status: 'installed' as const,
                category: a.category || ('delivery' as const)
              }));
              return {
                ...s,
                status: 'operational' as const,
                healthStatus: 'operational' as const,
                activeIssueCount: 0,
                hardware: {
                  ...s.hardware,
                  ramGB: 8,
                  storageGB: 128,
                  storageType: 'SSD' as const
                },
                os: {
                  ...s.os,
                  name: 'Windows 11 Home',
                  version: s.os?.version === '22H2' ? '23H2' : (s.os?.version || '23H2'),
                  build: s.os?.build === '19045.3803' ? '22631.3007' : (s.os?.build || '22631.3007'),
                  architecture: '64-bit' as const,
                  lastUpdateDate: '2026-08-22'
                },
                examApps: updatedApps
              };
            }
            return s;
          });
        }
      } catch (e) {}
    }
    return generateInitialSystems();
  });

  const [readinessBreakdown, setReadinessBreakdown] = useState<{
    overallScore: number;
    status: string;
    operationalState: 'READY' | 'ATTENTION' | 'OFFLINE' | 'MAINTENANCE';
    verifiedPillarsPassed?: number;
    totalPillars?: number;
    factors: Array<{ name: string; status?: string; score?: number; detail: string }>;
  }>({
    overallScore: 100,
    status: 'READY',
    operationalState: 'READY',
    verifiedPillarsPassed: 6,
    totalPillars: 7,
    factors: [
      { name: 'Workstation Fleet', status: 'READY', detail: '35 of 36 systems operational' },
      { name: 'Primary & Failover Network', status: 'READY', detail: 'JIO Forun 1 Gbps active, 8ms latency' },
      { name: 'Exam Application Integrity', status: 'READY', detail: 'CMA, Pearson, PSI, CELPIP, ITTS verified' },
      { name: 'Peripherals & Audio Calibration', status: 'READY', detail: 'Microphone & camera locks validated' },
      { name: 'Station Audits & Checklists', status: 'READY', detail: 'Pre-exam opening checks completed' },
      { name: 'Incident & Alert Clearance', status: 'ATTENTION', detail: '1 workstation pending SSD installation' },
      { name: 'Agent Telemetry Fleet', status: 'READY', detail: '35 agents reporting live heartbeats' }
    ]
  });

  const [floorLayouts, setFloorLayouts] = useState<Record<string, SystemLayout>>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_floorLayouts`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SYSTEM_LAYOUTS, ...parsed };
      } catch (e) {
        return DEFAULT_SYSTEM_LAYOUTS;
      }
    }
    return DEFAULT_SYSTEM_LAYOUTS;
  });

  const [rawExamApps, setRawExamApps] = useState<ExamApplication[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_examApps`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((a: ExamApplication) => a.id === 'cma' || a.id === 'pv')) {
          // Filter out legacy admin apps replaced by the 4 Division 2 applications
          const cleaned = parsed.filter(
            (a: ExamApplication) =>
              a.id !== 'admin-cas' &&
              a.id !== 'admin-reg' &&
              a.id !== 'admin-eac' &&
              a.id !== 'admin-idv' &&
              a.id !== 'cas' &&
              a.id !== 'reg' &&
              a.id !== 'eac' &&
              a.id !== 'idv'
          );
          const existingIds = new Set(cleaned.map((a: ExamApplication) => a.id));
          const missingInitial = INITIAL_EXAM_APPLICATIONS.filter((init) => !existingIds.has(init.id));
          return [...cleaned, ...missingInitial];
        }
      } catch (e) {}
    }
    return INITIAL_EXAM_APPLICATIONS;
  });

  const [assets, setAssets] = useState<Asset[]>(() => {
    // Check if user has already added and saved manual assets
    const saved =
      localStorage.getItem(`${STORAGE_KEY}_manual_assets`) ||
      localStorage.getItem('fets_space_state_v5_manual_assets') ||
      localStorage.getItem('fets_space_state_v4_manual_assets');
    if (saved) {
      try {
        const parsed: Asset[] = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [assetMovements, setAssetMovements] = useState<AssetMovement[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_assetMovements`);
    return saved ? JSON.parse(saved) : INITIAL_ASSET_MOVEMENTS;
  });

  const [issues, setIssues] = useState<Issue[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_issues`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some((iss: Issue) => iss.id === 'ISS-036')) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_ISSUES;
  });

  const [audits, setAudits] = useState<AuditRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audits`);
    return saved ? JSON.parse(saved) : INITIAL_AUDITS;
  });

  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_maintenance`);
    return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE;
  });

  const [alerts, setAlerts] = useState<Alert[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_alerts`);
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [switches] = useState<NetworkSwitch[]>(INITIAL_SWITCHES);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_activityLogs`);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [readinessRules, setReadinessRules] = useState<ExamReadinessRule[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_readinessRules`);
    return saved ? JSON.parse(saved) : INITIAL_READINESS_RULES;
  });

  // Phase 7: Candidate Intake State
  const [candidateIntakes, setCandidateIntakes] = useState<CandidateIntakeRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_candidateIntakes`);
    return saved ? JSON.parse(saved) : INITIAL_CANDIDATE_INTAKES;
  });

  // Phase 8: Synchronizer Telemetry State
  const [syncPackages, setSyncPackages] = useState<SyncPayloadPackage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_syncPackages`);
    return saved ? JSON.parse(saved) : INITIAL_SYNC_PACKAGES;
  });

  const [syncRosters, setSyncRosters] = useState<SyncRosterJob[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_syncRosters`);
    return saved ? JSON.parse(saved) : INITIAL_SYNC_ROSTERS;
  });

  const [uploadQueue, setUploadQueue] = useState<CandidateUploadQueueItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_uploadQueue`);
    return saved ? JSON.parse(saved) : INITIAL_UPLOAD_QUEUE;
  });

  // Phase 9: Audit Certifications
  const [auditCertifications, setAuditCertifications] = useState<AuditCertificationSpec[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_auditCertifications`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_CERTIFICATIONS;
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_systems`, JSON.stringify(systems));
      localStorage.setItem(`${STORAGE_KEY}_examApps`, JSON.stringify(rawExamApps));
      localStorage.setItem(`${STORAGE_KEY}_manual_assets`, JSON.stringify(assets));
      localStorage.setItem(`${STORAGE_KEY}_assetMovements`, JSON.stringify(assetMovements));
      localStorage.setItem(`${STORAGE_KEY}_issues`, JSON.stringify(issues));
      localStorage.setItem(`${STORAGE_KEY}_audits`, JSON.stringify(audits));
      localStorage.setItem(`${STORAGE_KEY}_maintenance`, JSON.stringify(maintenance));
      localStorage.setItem(`${STORAGE_KEY}_alerts`, JSON.stringify(alerts));
      localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
      localStorage.setItem(`${STORAGE_KEY}_activityLogs`, JSON.stringify(activityLogs));
      localStorage.setItem(`${STORAGE_KEY}_readinessRules`, JSON.stringify(readinessRules));
      localStorage.setItem(`${STORAGE_KEY}_candidateIntakes`, JSON.stringify(candidateIntakes));
      localStorage.setItem(`${STORAGE_KEY}_syncPackages`, JSON.stringify(syncPackages));
      localStorage.setItem(`${STORAGE_KEY}_syncRosters`, JSON.stringify(syncRosters));
      localStorage.setItem(`${STORAGE_KEY}_uploadQueue`, JSON.stringify(uploadQueue));
      localStorage.setItem(`${STORAGE_KEY}_auditCertifications`, JSON.stringify(auditCertifications));
    } catch (e) {
      console.warn('Storage sync issue:', e);
    }
  }, [
    systems,
    rawExamApps,
    assets,
    assetMovements,
    issues,
    audits,
    maintenance,
    alerts,
    notifications,
    activityLogs,
    readinessRules,
    candidateIntakes,
    syncPackages,
    syncRosters,
    uploadQueue,
    auditCertifications
  ]);

  // Computed exam applications with live counts derived directly from systems
  // Memoized to prevent circular setState loops (resolving Maximum update depth exceeded)
  const examApps = React.useMemo(() => {
    return rawExamApps.map((app) => {
      let count = 0;
      let total = 0;
      const isAdminApp = app.category === 'admin_admission';

      systems.forEach((sys) => {
        const isEligible = isAdminApp
          ? sys.type === 'admin_pc'
          : sys.type === 'workstation';

        if (isEligible) {
          total++;
          const installed = sys.examApps?.find(
            (a) => (a.appId === app.id || a.code === app.code) && a.status === 'installed'
          );
          if (installed) count++;
        }
      });

      return {
        ...app,
        installedCount: count,
        totalSystems: total || (isAdminApp ? 2 : 36)
      };
    });
  }, [rawExamApps, systems]);

  // Dynamic capacity engine adhering strictly to:
  // 40 Physical Booths vs 36 Installed Systems
  // Booths 37-40 are Open Slots and never counted as offline/critical
  const capacity: CentreCapacity = React.useMemo(() => {
    const physicalBooths = booths.length || 40;
    const installedSystems = systems.filter((s) => s.type === 'workstation').length; // 36
    const openBoothSlots = Math.max(0, physicalBooths - installedSystems); // 4

    let availableSystems = 0;
    let busySystems = 0;
    let reservedSystems = 0;
    let postExamSystems = 0;
    let unavailableSystems = 0;

    let operational = 0;
    let attention = 0;
    let critical = 0;
    let offline = 0;
    let maintenance = 0;

    systems.forEach((sys) => {
      if (sys.type !== 'workstation') return;

      const health = sys.healthStatus || (sys.status as HealthStatus) || 'operational';
      const occupancy = sys.occupancyStatus || 'available';

      if (health === 'operational') operational++;
      else if (health === 'attention') attention++;
      else if (health === 'critical') critical++;
      else if (health === 'offline') offline++;
      else if (health === 'maintenance') maintenance++;

      // Strict Availability Definition:
      // Health operational, occupancy available, network connected, exam ready, agent online, no active session
      const isStrictlyAvailable =
        occupancy === 'available' &&
        health === 'operational' &&
        (sys.networkStatus === 'connected' || !sys.networkStatus) &&
        (sys.examReadinessStatus === 'ready' || !sys.examReadinessStatus) &&
        (sys.agentStatus === 'online' || !sys.agentStatus) &&
        !sys.currentSessionId;

      if (isStrictlyAvailable) {
        availableSystems++;
      } else if (occupancy === 'busy' || sys.currentSessionId != null) {
        busySystems++;
      } else if (occupancy === 'reserved') {
        reservedSystems++;
      } else if (occupancy === 'post_exam') {
        postExamSystems++;
      } else {
        unavailableSystems++;
      }
    });

    return {
      physicalBooths,
      installedSystems,
      openBoothSlots,
      availableSystems,
      busySystems,
      reservedSystems,
      postExamSystems,
      unavailableSystems,
      operational,
      attention,
      critical,
      offline,
      maintenance
    };
  }, [booths, systems]);

  // Initial fetch and SSE live event stream from backend
  useEffect(() => {
    fetch('/api/workstations')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch workstations');
        return res.json();
      })
      .then((workstations: Workstation[]) => {
        if (Array.isArray(workstations) && workstations.length === 36) {
          setSystems((prev) =>
            prev.map((sys) => {
              const ws = workstations.find((w) => w.id === sys.id);
              if (!ws) return sys;
              return {
                ...sys,
                boothId: ws.boothId,
                boothNumber: ws.boothNumber,
                healthStatus: ws.healthStatus,
                occupancyStatus: ws.occupancyStatus,
                networkStatus: ws.networkStatus,
                examReadinessStatus: ws.examReadinessStatus,
                agentStatus: ws.agentStatus,
                cpuUsage: ws.cpuUsage,
                ramUsage: ws.ramUsage,
                currentSessionId: ws.currentSessionId,
                currentSession: ws.currentSession,
                lastHeartbeatAt: ws.lastHeartbeatAt,
                activeIssueCount: typeof ws.activeIssueCount === 'number' ? ws.activeIssueCount : (sys.activeIssueCount ?? 0)
              };
            })
          );
        }
      })
      .catch(() => {});

    fetch('/api/booths')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch booths');
        return res.json();
      })
      .then((boothData: Booth[]) => {
        if (Array.isArray(boothData) && boothData.length === 40) {
          setBooths(boothData);
        }
      })
      .catch(() => {});

    fetch('/api/readiness')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.factors) {
          setReadinessBreakdown({
            overallScore: typeof data.overallScore === 'number' ? data.overallScore : 100,
            status: data.status || data.operationalState || 'READY',
            operationalState: data.operationalState || (data.status as any) || 'READY',
            verifiedPillarsPassed: data.verifiedPillarsPassed,
            totalPillars: data.totalPillars,
            factors: data.factors
          });
        }
      })
      .catch(() => {});

    // SSE Stream for real-time live push updates
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/events');
      es.onopen = () => {
        setIsLiveBackendConnected(true);
      };
      es.onmessage = (event) => {
        try {
          const evt = JSON.parse(event.data);
          if (evt.type === 'workstation.occupancy.changed' || evt.type === 'workstation.updated') {
            const ws: Workstation = evt.payload?.workstation || evt.payload;
            if (ws && ws.id) {
              setSystems((prev) =>
                prev.map((s) =>
                  s.id === ws.id
                    ? {
                        ...s,
                        status: ws.healthStatus || s.status,
                        healthStatus: ws.healthStatus || s.healthStatus,
                        occupancyStatus: ws.occupancyStatus || s.occupancyStatus,
                        networkStatus: ws.networkStatus || s.networkStatus,
                        examReadinessStatus: ws.examReadinessStatus || s.examReadinessStatus,
                        agentStatus: ws.agentStatus || s.agentStatus,
                        cpuUsage: ws.cpuUsage !== undefined ? ws.cpuUsage : s.cpuUsage,
                        ramUsage: ws.ramUsage !== undefined ? ws.ramUsage : s.ramUsage,
                        currentSessionId: ws.currentSessionId !== undefined ? ws.currentSessionId : s.currentSessionId,
                        currentSession: ws.currentSession !== undefined ? ws.currentSession : s.currentSession
                      }
                    : s
                )
              );
            }
          } else if (evt.type === 'activity.logged') {
            const act = evt.payload;
            if (act && act.id) {
              setActivityLogs((prev) => [act, ...prev.filter((p) => p.id !== act.id)]);
            }
          }
        } catch {}
      };
      es.onerror = () => {
        setIsLiveBackendConnected(false);
      };
    } catch {
      setIsLiveBackendConnected(false);
    }

    return () => {
      es?.close();
    };
  }, []);

  const transitionOccupancy = async (
    workstationId: string,
    targetStatus: OccupancyStatus,
    sessionData?: { examCode?: string; examName?: string; candidateRef?: string }
  ) => {
    try {
      const resp = await fetch(`/api/workstations/${workstationId}/occupancy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetStatus,
          sessionData,
          actor: currentUser.name
        })
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        return { success: false, error: data.error || 'Transition failed' };
      }

      const updatedWs = data.workstation;
      setSystems((prev) =>
        prev.map((s) =>
          s.id === workstationId
            ? {
                ...s,
                occupancyStatus: updatedWs.occupancyStatus,
                currentSessionId: updatedWs.currentSessionId,
                currentSession: updatedWs.currentSession
              }
            : s
        )
      );

      logActivity(
        `Occupancy: ${targetStatus.toUpperCase()}`,
        'occupancy',
        workstationId,
        `Workstation ${workstationId}`,
        `Status set to ${targetStatus}. ${sessionData ? `Session for ${sessionData.candidateRef || sessionData.examName}` : ''}`
      );

      return { success: true };
    } catch {
      // Local optimistic fallback
      setSystems((prev) =>
        prev.map((s) =>
          s.id === workstationId
            ? {
                ...s,
                occupancyStatus: targetStatus,
                currentSessionId: targetStatus === 'busy' ? `SES-${workstationId}-${Date.now()}` : null
              }
            : s
        )
      );
      return { success: true };
    }
  };

  const registerAgentToken = async (workstationId: string): Promise<string> => {
    try {
      const resp = await fetch('/api/agents/register-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workstationId, generatedBy: currentUser.name })
      });
      const data = await resp.json();
      return data.token || `REG-TOKEN-${workstationId}-${Date.now()}`;
    } catch {
      return `REG-TOKEN-${workstationId}-${Date.now()}`;
    }
  };

  const simulateAgentHeartbeat = async (workstationId: string): Promise<void> => {
    try {
      await fetch('/api/agents/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workstationId,
          metrics: { cpuUsage: 22, ramUsage: 45, storageFreeGB: 72 }
        })
      });
    } catch {}
  };

  const simulateAgentTelemetry = async (
    workstationId: string,
    telemetry: { cpuUsage?: number; ramUsage?: number; storageFree?: number }
  ): Promise<void> => {
    try {
      await fetch('/api/agents/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workstationId,
          telemetry
        })
      });
    } catch {}
  };

  const navigate = (view: AppView, id: string | null = null) => {
    setActiveView(view);
    setSelectedEntityId(id);
    setMobileSidebarOpen(false);
    setTopNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchRole = (role: UserRole) => {
    const matched = AVAILABLE_USERS.find((u) => u.role === role) || {
      ...currentUser,
      role
    };
    setCurrentUser(matched);
    logActivity('Role Switched', 'system', matched.id, matched.name, `Active session switched to ${role.toUpperCase()} profile`);
  };

  const logActivity = (
    action: string,
    category: ActivityLog['category'],
    targetId: string,
    targetName: string,
    details: string
  ) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: 'Just now',
      actor: currentUser.name,
      action,
      category,
      targetId,
      targetName,
      details
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  const addNotification = (title: string, description: string, category: AppNotification['category'], link?: string) => {
    const newNotif: AppNotification = {
      id: `not-${Date.now()}`,
      title,
      description,
      category,
      timestamp: 'Just now',
      read: false,
      link
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Systems API
  const getSystem = (id: string) => systems.find((s) => s.id === id);

  const createSystem = (data: Partial<SystemRecord>): SystemRecord => {
    const newSystem: SystemRecord = {
      id: data.id || `W${(systems.length + 1).toString().padStart(3, '0')}`,
      name: data.name || `4960-T${(systems.length + 1).toString().padStart(3, '0')}`,
      type: data.type || 'workstation',
      status: data.status || 'operational',
      centreId: currentCentre.id,
      centreName: currentCentre.name,
      hardware: data.hardware || {
        processor: 'Intel Core i3-10100',
        ramGB: 8,
        storageGB: 128,
        storageType: 'SSD',
        monitorModel: 'BENQ GW2480 23.8"',
        cameraModel: 'A-01 HD Pro'
      },
      os: data.os || {
        name: 'Windows 11 Home',
        version: '23H2',
        build: '22631.3007',
        architecture: '64-bit',
        lastUpdateDate: new Date().toISOString().split('T')[0]
      },
      network: data.network || {
        ipAddress: `192.168.10.${100 + systems.length + 1}`,
        macAddress: `70:85:C2:5A:${(systems.length + 1).toString(16).padStart(2, '0')}:01`,
        gateway: '192.168.10.1',
        dns: '1.1.1.1, 8.8.8.8',
        switchId: 'SW-01',
        switchPort: systems.length + 1,
        vlan: 10,
        linkSpeed: '1000 Mbps'
      },
      examApps: data.examApps || INITIAL_EXAM_APPLICATIONS.map((app) => ({
        appId: app.id,
        appName: app.name,
        code: app.code,
        version: app.currentVersion,
        status: 'installed',
        lastVerified: 'Today'
      })),
      assignedAssetIds: data.assignedAssetIds || [],
      lastUpdated: 'Just now',
      notes: data.notes || '',
      activeIssueCount: 0
    };

    setSystems((prev) => [...prev, newSystem]);
    logActivity('System Created', 'system', newSystem.id, newSystem.name, `New system registered at ${currentCentre.name}`);
    addNotification('New System Added', `${newSystem.id} (${newSystem.name}) was provisioned.`, 'system', `/systems/${newSystem.id}`);
    return newSystem;
  };

  const updateSystem = (id: string, updates: Partial<SystemRecord>) => {
    setSystems((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = {
            ...s,
            ...updates,
            lastUpdated: 'Just now'
          };
          return updated;
        }
        return s;
      })
    );
    logActivity('System Updated', 'system', id, id, `Configuration parameters modified`);
  };

  const deleteSystem = (id: string) => {
    setSystems((prev) => prev.filter((s) => s.id !== id));
    logActivity('System Deleted', 'system', id, id, `System removed from active inventory`);
  };

  const setSystemStatus = (id: string, status: SystemStatus, notes?: string) => {
    setSystems((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            status,
            notes: notes ? `${s.notes ? s.notes + ' | ' : ''}${notes}` : s.notes,
            lastUpdated: 'Just now'
          };
        }
        return s;
      })
    );
    logActivity('Status Changed', 'system', id, id, `Status updated to ${status.toUpperCase()}`);
    addNotification(`Status Update: ${id}`, `${id} is now ${status.toUpperCase()}`, 'system', `/systems/${id}`);
  };

  // Floor Map Layout actions
  const updateSystemLayout = (systemId: string, layoutUpdates: Partial<SystemLayout>) => {
    setFloorLayouts((prev) => {
      const oldLayout = prev[systemId] || DEFAULT_SYSTEM_LAYOUTS[systemId];
      const newLayout: SystemLayout = {
        id: oldLayout?.id || `lay-${systemId}`,
        systemId,
        zone: layoutUpdates.zone || oldLayout?.zone || 'LEFT',
        deskId: layoutUpdates.deskId || oldLayout?.deskId || 'DESK-L1',
        row: layoutUpdates.row ?? oldLayout?.row ?? 1,
        col: layoutUpdates.col ?? oldLayout?.col ?? 1,
        positionX: layoutUpdates.positionX !== undefined ? layoutUpdates.positionX : (oldLayout?.positionX ?? 100),
        positionY: layoutUpdates.positionY !== undefined ? layoutUpdates.positionY : (oldLayout?.positionY ?? 100),
        rotation: layoutUpdates.rotation !== undefined ? layoutUpdates.rotation : (oldLayout?.rotation ?? 0),
        mapVisible: layoutUpdates.mapVisible !== undefined ? layoutUpdates.mapVisible : (oldLayout?.mapVisible ?? true),
        updatedAt: new Date().toISOString()
      };
      const updatedMap = {
        ...prev,
        [systemId]: newLayout
      };
      try {
        localStorage.setItem(`${STORAGE_KEY}_floorLayouts`, JSON.stringify(updatedMap));
      } catch (e) {}

      const oldPos = oldLayout ? `(${Math.round(oldLayout.positionX)}, ${Math.round(oldLayout.positionY)}) [${oldLayout.zone}]` : 'N/A';
      const newPos = `(${Math.round(newLayout.positionX)}, ${Math.round(newLayout.positionY)}) [${newLayout.zone}]`;
      logActivity(
        'Floor Map Moved',
        'system',
        systemId,
        systemId,
        `Repositioned ${systemId} from ${oldPos} to ${newPos}`
      );
      return updatedMap;
    });
  };

  const saveFloorLayouts = (newLayouts: Record<string, SystemLayout>) => {
    setFloorLayouts(newLayouts);
    try {
      localStorage.setItem(`${STORAGE_KEY}_floorLayouts`, JSON.stringify(newLayouts));
    } catch (e) {}
    logActivity(
      'Floor Plan Saved',
      'system',
      'FLOOR-PLAN',
      'Lab Floor Map',
      `Saved custom workstation layout coordinates for ${Object.keys(newLayouts).length} systems`
    );
    addNotification('Floor Plan Saved', 'Physical workstation layout positions saved successfully.', 'system');
  };

  const resetFloorLayouts = () => {
    setFloorLayouts(DEFAULT_SYSTEM_LAYOUTS);
    try {
      localStorage.setItem(`${STORAGE_KEY}_floorLayouts`, JSON.stringify(DEFAULT_SYSTEM_LAYOUTS));
    } catch (e) {}
    logActivity(
      'Floor Plan Reset',
      'system',
      'FLOOR-PLAN',
      'Lab Floor Map',
      'Restored workstation positions to default physical room layout'
    );
    addNotification('Floor Plan Reset', 'Restored default physical layout for 40 workstations.', 'system');
  };

  // Exam Applications actions
  const installExamApp = (systemId: string, appId: string, version: string) => {
    const appDef = examApps.find((a) => a.id === appId);
    setSystems((prev) =>
      prev.map((s) => {
        if (s.id === systemId) {
          const existing = s.examApps.filter((a) => a.appId !== appId);
          return {
            ...s,
            examApps: [
              ...existing,
              {
                appId,
                appName: appDef ? appDef.name : appId,
                code: appDef ? appDef.code : appId.toUpperCase(),
                version,
                status: 'installed',
                lastVerified: 'Just now'
              }
            ]
          };
        }
        return s;
      })
    );
    logActivity('Exam Client Installed', 'exam', systemId, systemId, `Installed ${appDef?.name || appId} v${version}`);
  };

  const uninstallExamApp = (systemId: string, appId: string) => {
    setSystems((prev) =>
      prev.map((s) => {
        if (s.id === systemId) {
          return {
            ...s,
            examApps: s.examApps.map((a) =>
              a.appId === appId ? { ...a, status: 'missing', version: '—', lastVerified: 'Just now' } : a
            )
          };
        }
        return s;
      })
    );
    logActivity('Exam Client Removed', 'exam', systemId, systemId, `Uninstalled exam client ${appId}`);
  };

  const updateExamAppVersion = (systemId: string, appId: string, version: string) => {
    setSystems((prev) =>
      prev.map((s) => {
        if (s.id === systemId) {
          return {
            ...s,
            examApps: s.examApps.map((a) =>
              a.appId === appId ? { ...a, version, status: 'installed', lastVerified: 'Just now' } : a
            )
          };
        }
        return s;
      })
    );
    logActivity('Exam Client Updated', 'exam', systemId, systemId, `Updated ${appId} to v${version}`);
  };

  const updateExamAppStatus = (
    systemId: string,
    appId: string,
    status: InstalledExamApp['status'],
    notes?: string,
    version?: string,
    verifiedBy?: string
  ) => {
    const appDef = examApps.find((a) => a.id === appId || a.code === appId.toUpperCase());
    setSystems((prev) =>
      prev.map((s) => {
        if (s.id === systemId) {
          const appExists = s.examApps?.some((a) => a.appId === appId || a.code === appId.toUpperCase());
          let updatedApps: InstalledExamApp[];
          if (appExists) {
            updatedApps = s.examApps.map((a) => {
              if (a.appId === appId || a.code === appId.toUpperCase()) {
                return {
                  ...a,
                  status,
                  version: version !== undefined ? version : a.version,
                  expectedVersion: a.expectedVersion || appDef?.expectedVersion || appDef?.currentVersion,
                  notes: notes !== undefined ? notes : a.notes,
                  verifiedBy: verifiedBy || currentUser.name,
                  lastVerified: 'Just now',
                  lastVerifiedDate: new Date().toISOString().split('T')[0]
                };
              }
              return a;
            });
          } else {
            updatedApps = [
              ...(s.examApps || []),
              {
                appId,
                appName: appDef ? appDef.name : appId,
                code: appDef ? appDef.code : appId.toUpperCase(),
                category: appDef ? appDef.category : s.type === 'admin_pc' ? 'admin_admission' : 'delivery',
                version: version || appDef?.currentVersion || '1.0.0',
                expectedVersion: appDef?.expectedVersion || appDef?.currentVersion || '1.0.0',
                status,
                lastVerified: 'Just now',
                lastVerifiedDate: new Date().toISOString().split('T')[0],
                verifiedBy: verifiedBy || currentUser.name,
                notes
              }
            ];
          }
          return {
            ...s,
            examApps: updatedApps
          };
        }
        return s;
      })
    );
    logActivity('Exam Status Updated', 'exam', systemId, systemId, `Marked ${appDef?.name || appId} as ${status}`);
  };

  const toggleExamAppStatus = (systemId: string, appId: string, status: InstalledExamApp['status']) => {
    updateExamAppStatus(systemId, appId, status);
  };

  const verifyExamApp = (
    systemId: string,
    appId: string,
    status: InstalledExamApp['status'] = 'installed',
    notes?: string
  ) => {
    updateExamAppStatus(systemId, appId, status, notes, undefined, currentUser.name);
  };

  const addExamApp = (
    data: Partial<ExamApplication> & {
      name: string;
      code: string;
      vendor: string;
      currentVersion: string;
      category?: ExamAppCategory;
    }
  ): ExamApplication => {
    const newId = (data.code || data.name).toLowerCase().replace(/[^a-z0-9]/g, '-');
    const category: ExamAppCategory = data.category || 'delivery';
    const newApp: ExamApplication = {
      id: newId,
      name: data.name,
      code: data.code.toUpperCase(),
      vendor: data.vendor,
      category,
      currentVersion: data.currentVersion,
      expectedVersion: data.expectedVersion || data.currentVersion,
      minWindowsVersion: data.minWindowsVersion || 'Windows 10 Pro 64-bit',
      minOs: data.minOs || 'Windows 10 Pro 64-bit',
      minRamGB: data.minRamGB || 8,
      minStorageGB: data.minStorageGB || 128,
      requiredPeripherals: data.requiredPeripherals || ['Keyboard', 'Mouse'],
      description: data.description || `${data.name} Application`,
      color: data.color || (category === 'admin_admission' ? '#4F46E5' : '#059669'),
      installedCount: 0,
      totalSystems: category === 'admin_admission' ? 2 : 36,
      lastChecked: 'Just now',
      enabled: true,
      eligibleSystemTypes: data.eligibleSystemTypes || (category === 'admin_admission' ? ['admin_pc'] : ['workstation'])
    };

    setRawExamApps((prev) => [...prev, newApp]);

    // Assign to eligible systems
    setSystems((prev) =>
      prev.map((s) => {
        const isEligible = category === 'admin_admission' ? s.type === 'admin_pc' : s.type === 'workstation';
        if (isEligible) {
          const alreadyHas = s.examApps?.some((a) => a.appId === newId || a.code === newApp.code);
          if (!alreadyHas) {
            return {
              ...s,
              examApps: [
                ...(s.examApps || []),
                {
                  appId: newId,
                  appName: newApp.name,
                  code: newApp.code,
                  category,
                  version: newApp.currentVersion,
                  expectedVersion: newApp.expectedVersion,
                  status: 'installed' as const,
                  lastVerified: 'Just now',
                  lastVerifiedDate: new Date().toISOString().split('T')[0],
                  verifiedBy: currentUser.name
                }
              ]
            };
          }
        }
        return s;
      })
    );

    logActivity('Exam Application Registered', 'exam', newId, newApp.name, `New ${category} application registered (${newApp.code})`);
    addNotification('Application Registered', `${newApp.name} (${newApp.code}) registered under ${category === 'admin_admission' ? 'Admin/Admission' : 'Exam Delivery'}.`, 'system', '/exams');
    return newApp;
  };

  const updateExamApp = (appId: string, updates: Partial<ExamApplication>) => {
    setRawExamApps((prev) =>
      prev.map((app) => {
        if (app.id === appId) {
          return { ...app, ...updates };
        }
        return app;
      })
    );
    if (updates.expectedVersion || updates.category) {
      setSystems((prev) =>
        prev.map((s) => ({
          ...s,
          examApps: s.examApps?.map((a) =>
            a.appId === appId
              ? {
                  ...a,
                  category: updates.category || a.category,
                  expectedVersion: updates.expectedVersion || a.expectedVersion
                }
              : a
          )
        }))
      );
    }
    logActivity('Exam Application Updated', 'exam', appId, appId, `Application configuration updated`);
  };

  const deleteExamApp = (appId: string) => {
    setRawExamApps((prev) => prev.filter((app) => app.id !== appId));
    setSystems((prev) =>
      prev.map((s) => ({
        ...s,
        examApps: s.examApps?.filter((a) => a.appId !== appId)
      }))
    );
    logActivity('Exam Application Removed', 'exam', appId, appId, `Application removed from registry`);
  };

  // Assets
  const getAsset = (id: string) => assets.find((a) => a.id === id);

  const createAsset = (data: Omit<Asset, 'id'> & { id?: string }): Asset => {
    const categoryPrefix = data.category ? data.category.substring(0, 3).toUpperCase() : 'IT';
    const newId = data.id && data.id.trim()
      ? data.id.trim()
      : `AST-${categoryPrefix}-${(assets.length + 1).toString().padStart(3, '0')}`;

    const newAsset: Asset = {
      ...data,
      id: newId
    };

    setAssets((prev) => [newAsset, ...prev]);

    // If assigned to a system, update the system's assignedAssetIds
    if (data.assignedSystemId) {
      setSystems((prev) =>
        prev.map((s) => (s.id === data.assignedSystemId ? { ...s, assignedAssetIds: Array.from(new Set([...(s.assignedAssetIds || []), newId])) } : s))
      );
    }

    logActivity('Asset Created', 'asset', newId, `${newAsset.brand} ${newAsset.model}`, `New ${data.category} asset registered manually`);
    addNotification('Asset Registered', `Asset ${newId} (${newAsset.brand} ${newAsset.model}) added to inventory.`, 'asset', '/assets');
    return newAsset;
  };

  const deleteAsset = (id: string) => {
    const targetAsset = assets.find((a) => a.id === id);
    setAssets((prev) => prev.filter((a) => a.id !== id));
    // Remove from assigned system if present
    setSystems((prev) =>
      prev.map((s) => (s.assignedAssetIds?.includes(id) ? { ...s, assignedAssetIds: s.assignedAssetIds.filter((aid) => aid !== id) } : s))
    );
    logActivity('Asset Removed', 'asset', id, targetAsset ? `${targetAsset.brand} ${targetAsset.model}` : id, `Asset deleted from inventory list`);
    addNotification('Asset Removed', `Asset ${id} was deleted from inventory.`, 'asset');
  };

  const clearAllAssets = () => {
    setAssets([]);
    // Remove asset associations from systems
    setSystems((prev) =>
      prev.map((s) => (s.assignedAssetIds && s.assignedAssetIds.length > 0 ? { ...s, assignedAssetIds: [] } : s))
    );
    try {
      localStorage.setItem(`${STORAGE_KEY}_manual_assets`, JSON.stringify([]));
      localStorage.removeItem(`${STORAGE_KEY}_assets`);
    } catch (e) {}
    logActivity('Asset List Cleared', 'asset', 'ALL', 'Asset Inventory', 'Completely cleared all assets from the asset list');
    addNotification('Asset List Cleared', 'All assets have been cleared from the asset list.', 'asset');
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          return { ...a, ...updates };
        }
        return a;
      })
    );
    logActivity('Asset Modified', 'asset', id, id, `Asset details updated`);
  };

  const transferAsset = (assetId: string, toSystemId: string | undefined, toLocation: string, reason: string) => {
    const targetAsset = assets.find((a) => a.id === assetId);
    if (!targetAsset) return;

    const fromSystem = targetAsset.assignedSystemId;
    const fromLoc = targetAsset.assignedLocation;
    const toSysObj = toSystemId ? systems.find((s) => s.id === toSystemId) : undefined;

    // Create Movement Record
    const movement: AssetMovement = {
      id: `MOV-${Date.now()}`,
      assetId,
      assetTag: `${targetAsset.id} (${targetAsset.brand} ${targetAsset.model})`,
      assetCategory: targetAsset.category,
      fromSystemId: fromSystem,
      fromSystemName: fromSystem ? systems.find((s) => s.id === fromSystem)?.name : undefined,
      toSystemId,
      toSystemName: toSysObj ? toSysObj.name : undefined,
      fromLocation: fromLoc,
      toLocation,
      reason,
      movedBy: `${currentUser.name} (${currentUser.role.toUpperCase()})`,
      timestamp: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAssetMovements((prev) => [movement, ...prev]);

    // Update asset
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id === assetId) {
          return {
            ...a,
            assignedSystemId: toSystemId,
            assignedSystemName: toSysObj?.name,
            assignedLocation: toLocation,
            status: toSystemId ? 'assigned' : 'available'
          };
        }
        return a;
      })
    );

    // Update assignedAssetIds in systems
    if (fromSystem) {
      setSystems((prev) =>
        prev.map((s) => (s.id === fromSystem ? { ...s, assignedAssetIds: s.assignedAssetIds.filter((aid) => aid !== assetId) } : s))
      );
    }
    if (toSystemId) {
      setSystems((prev) =>
        prev.map((s) => (s.id === toSystemId ? { ...s, assignedAssetIds: [...s.assignedAssetIds, assetId] } : s))
      );
    }

    logActivity('Asset Transferred', 'asset', assetId, targetAsset.id, `Moved from ${fromSystem || fromLoc} to ${toSystemId || toLocation}. Reason: ${reason}`);
    addNotification('Asset Transferred', `${targetAsset.id} transferred to ${toSystemId || toLocation}`, 'asset', `/assets`);
  };

  // Issues
  const getIssue = (id: string) => issues.find((i) => i.id === id);

  const createIssue = (data: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'comments'>): Issue => {
    const newId = `ISS-${(issues.length + 1).toString().padStart(3, '0')}`;
    const newIssue: Issue = {
      ...data,
      id: newId,
      createdAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      updatedAt: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      comments: [
        {
          id: `c-${Date.now()}`,
          author: currentUser.name,
          role: currentUser.role,
          text: `Ticket opened: ${data.description}`,
          timestamp: 'Just now'
        }
      ]
    };

    setIssues((prev) => [newIssue, ...prev]);

    if (data.systemId) {
      setSystems((prev) =>
        prev.map((s) => (s.id === data.systemId ? { ...s, activeIssueCount: s.activeIssueCount + 1 } : s))
      );
    }

    logActivity('Issue Raised', 'issue', newId, data.title, `New ${data.priority.toUpperCase()} issue reported for ${data.systemId || 'Infrastructure'}`);
    addNotification(`New Issue: ${newId}`, `${data.title} (${data.priority.toUpperCase()})`, 'issue', `/issues/${newId}`);

    return newIssue;
  };

  const updateIssueStatus = (id: string, status: IssueStatus, resolutionNotes?: string) => {
    setIssues((prev) =>
      prev.map((i) => {
        if (i.id === id) {
          const resolved = status === 'resolved' || status === 'closed';
          const nowStr = 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return {
            ...i,
            status,
            resolutionNotes: resolutionNotes || i.resolutionNotes,
            resolvedAt: resolved ? nowStr : i.resolvedAt,
            updatedAt: nowStr,
            comments: [
              ...i.comments,
              {
                id: `c-${Date.now()}`,
                author: currentUser.name,
                role: currentUser.role,
                text: `Status changed to ${status.toUpperCase()}${resolutionNotes ? ': ' + resolutionNotes : ''}`,
                timestamp: 'Just now'
              }
            ]
          };
        }
        return i;
      })
    );
    logActivity('Issue Status Updated', 'issue', id, id, `Ticket status changed to ${status.toUpperCase()}`);
  };

  const addIssueComment = (issueId: string, text: string) => {
    setIssues((prev) =>
      prev.map((i) => {
        if (i.id === issueId) {
          return {
            ...i,
            updatedAt: 'Just now',
            comments: [
              ...i.comments,
              {
                id: `c-${Date.now()}`,
                author: currentUser.name,
                role: currentUser.role,
                text,
                timestamp: 'Just now'
              }
            ]
          };
        }
        return i;
      })
    );
    logActivity('Comment Added', 'issue', issueId, issueId, `Added update note to ticket`);
  };

  // Audits
  const getAudit = (id: string) => audits.find((a) => a.id === id);

  const recordAudit = (audit: Omit<AuditRecord, 'id' | 'date'>): AuditRecord => {
    const newId = `AUD-${new Date().toISOString().split('T')[0]}-${(audits.length + 1).toString().padStart(2, '0')}`;
    const newAudit: AuditRecord = {
      ...audit,
      id: newId,
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAudits((prev) => [newAudit, ...prev]);

    // Update system last audit date
    setSystems((prev) =>
      prev.map((s) => {
        if (s.id === audit.systemId) {
          return {
            ...s,
            lastAuditDate: new Date().toISOString().split('T')[0],
            lastUpdated: 'Just now'
          };
        }
        return s;
      })
    );

    logActivity('Audit Completed', 'audit', audit.systemId, audit.systemName, `Audit signed off with status: ${audit.status.toUpperCase()}`);
    addNotification('Audit Completed', `Audit for ${audit.systemId} completed (${audit.status.toUpperCase()})`, 'audit', `/audits`);

    return newAudit;
  };

  // Maintenance
  const createMaintenance = (data: Omit<MaintenanceRecord, 'id'>): MaintenanceRecord => {
    const newId = `MNT-${(maintenance.length + 1).toString().padStart(3, '0')}`;
    const newMnt: MaintenanceRecord = {
      ...data,
      id: newId
    };
    setMaintenance((prev) => [newMnt, ...prev]);
    logActivity('Maintenance Scheduled', 'maintenance', newId, data.title, `Scheduled for ${data.scheduledDate}`);
    return newMnt;
  };

  const updateMaintenanceStatus = (id: string, status: MaintenanceRecord['status']) => {
    setMaintenance((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            status,
            completedDate: status === 'completed' ? 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : m.completedDate
          };
        }
        return m;
      })
    );
    logActivity('Maintenance Updated', 'maintenance', id, id, `Maintenance marked as ${status.toUpperCase()}`);
  };

  // Alerts & Notifications
  const markAlertRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const resolveAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true, read: true } : a)));
    logActivity('Alert Resolved', 'system', id, id, `Operational alert dismissed & resolved`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Readiness Rules
  const toggleReadinessRule = (ruleId: string) => {
    setReadinessRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const refreshData = () => {
    setLastSyncTime(new Date());
    logActivity('Data Refreshed', 'system', 'CENTRE-SYNC', currentCentre.name, 'Heartbeat refresh trigger executed');
  };

  const resetToDefaultData = () => {
    localStorage.clear();
    setSystems(generateInitialSystems());
    setRawExamApps(INITIAL_EXAM_APPLICATIONS);
    setAssets([]);
    setAssetMovements(INITIAL_ASSET_MOVEMENTS);
    setIssues(INITIAL_ISSUES);
    setAudits(INITIAL_AUDITS);
    setMaintenance(INITIAL_MAINTENANCE);
    setAlerts(INITIAL_ALERTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setReadinessRules(INITIAL_READINESS_RULES);
    setCandidateIntakes(INITIAL_CANDIDATE_INTAKES);
    setSyncPackages(INITIAL_SYNC_PACKAGES);
    setSyncRosters(INITIAL_SYNC_ROSTERS);
    setUploadQueue(INITIAL_UPLOAD_QUEUE);
    setAuditCertifications(INITIAL_AUDIT_CERTIFICATIONS);
    setLastSyncTime(new Date());
  };

  const resetStateToDefault = () => {
    resetToDefaultData();
  };

  // Phase 7 Actions: Candidate Intake & Live Proctoring
  const addCandidateIntake = (data: Partial<CandidateIntakeRecord>): CandidateIntakeRecord => {
    const newId = `INT-${(candidateIntakes.length + 4901).toString()}`;
    const newIntake: CandidateIntakeRecord = {
      id: newId,
      candidateRef: data.candidateRef || `CAND-${Math.floor(1000 + Math.random() * 9000)}`,
      candidateName: data.candidateName || 'Candidate',
      scheduledExamCode: data.scheduledExamCode || 'CMA',
      scheduledExamName: data.scheduledExamName || 'Examination',
      scheduledTime: data.scheduledTime || '10:00 AM',
      intakeStatus: data.intakeStatus || 'registered',
      idDocumentType: data.idDocumentType || 'Passport',
      idDocumentVerified: data.idDocumentVerified ?? true,
      photoCaptured: data.photoCaptured ?? false,
      biometricCaptured: data.biometricCaptured ?? false,
      signatureCaptured: data.signatureCaptured ?? false,
      lockerNumber: data.lockerNumber,
      assignedBoothId: data.assignedBoothId,
      assignedBoothNumber: data.assignedBoothNumber,
      checkInTime: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      proctorNotes: data.proctorNotes
    };
    setCandidateIntakes(prev => [newIntake, ...prev]);
    logActivity('Candidate Registered', 'exam', newId, newIntake.candidateName, `Candidate ${newIntake.candidateRef} registered for ${newIntake.scheduledExamCode}`);
    return newIntake;
  };

  const updateCandidateIntakeStatus = (id: string, status: IntakeStatus, updates?: Partial<CandidateIntakeRecord>) => {
    setCandidateIntakes(prev =>
      prev.map(item => (item.id === id ? { ...item, intakeStatus: status, ...(updates || {}) } : item))
    );
  };

  const assignCandidateSeat = (intakeId: string, boothId: string, boothNumber: number) => {
    setCandidateIntakes(prev =>
      prev.map(item =>
        item.id === intakeId
          ? { ...item, assignedBoothId: boothId, assignedBoothNumber: boothNumber, intakeStatus: 'seat_assigned' }
          : item
      )
    );
    logActivity('Seat Assigned', 'exam', intakeId, boothId, `Candidate assigned to Booth ${boothNumber} (${boothId})`);
  };

  const admitCandidateToExam = async (intakeId: string): Promise<boolean> => {
    const intake = candidateIntakes.find(i => i.id === intakeId);
    if (!intake || !intake.assignedBoothId) return false;

    const targetSys = systems.find(s => s.id === intake.assignedBoothId);
    if (!targetSys) return false;

    const newSession: OccupancySession = {
      id: `SES-${intake.assignedBoothId}-${Date.now().toString().slice(-4)}`,
      centreId: currentCentre.id,
      workstationId: targetSys.id,
      boothNumber: targetSys.boothNumber,
      examCode: intake.scheduledExamCode,
      examName: intake.scheduledExamName,
      candidateRef: intake.candidateRef,
      candidateName: intake.candidateName,
      status: 'active',
      startedAt: new Date().toISOString(),
      expectedEndAt: new Date(Date.now() + 120 * 60000).toISOString()
    };

    setSystems(prev =>
      prev.map(sys =>
        sys.id === targetSys.id
          ? {
              ...sys,
              occupancyStatus: 'busy',
              currentSessionId: newSession.id,
              currentSession: newSession,
              notes: `In examination: ${intake.scheduledExamName} (${intake.candidateRef})`
            }
          : sys
      )
    );

    setCandidateIntakes(prev =>
      prev.map(i => (i.id === intakeId ? { ...i, intakeStatus: 'in_exam' } : i))
    );

    logActivity('Candidate Admitted', 'exam', targetSys.id, intake.candidateName, `Session ${newSession.id} started on Booth ${targetSys.boothNumber}`);
    return true;
  };

  const pauseSession = (sessionId: string, reason: string) => {
    setSystems(prev =>
      prev.map(sys => {
        if (sys.currentSession && (sys.currentSession.id === sessionId || sys.currentSessionId === sessionId)) {
          const updatedSession: OccupancySession = {
            ...sys.currentSession,
            status: 'on_break',
            pauseReason: reason
          };
          return {
            ...sys,
            currentSession: updatedSession,
            notes: `Paused: ${reason}`
          };
        }
        return sys;
      })
    );
    logActivity('Session Paused', 'exam', sessionId, sessionId, `Proctor paused session: ${reason}`);
  };

  const resumeSession = (sessionId: string) => {
    setSystems(prev =>
      prev.map(sys => {
        if (sys.currentSession && (sys.currentSession.id === sessionId || sys.currentSessionId === sessionId)) {
          const updatedSession: OccupancySession = {
            ...sys.currentSession,
            status: 'active',
            pauseReason: undefined
          };
          return {
            ...sys,
            currentSession: updatedSession,
            notes: `In examination: ${sys.currentSession.examName} (${sys.currentSession.candidateRef})`
          };
        }
        return sys;
      })
    );
    logActivity('Session Resumed', 'exam', sessionId, sessionId, `Proctor resumed session on station`);
  };

  const flagCandidateSession = (sessionId: string, flagReason: string) => {
    let targetBooth = 0;
    let targetCandidate = '';
    setSystems(prev =>
      prev.map(sys => {
        if (sys.currentSession && (sys.currentSession.id === sessionId || sys.currentSessionId === sessionId)) {
          targetBooth = sys.boothNumber;
          targetCandidate = sys.currentSession.candidateRef;
          const currentFlags = sys.currentSession.flags || [];
          const updatedSession: OccupancySession = {
            ...sys.currentSession,
            status: 'flagged',
            flags: [...currentFlags, flagReason]
          };
          return {
            ...sys,
            currentSession: updatedSession
          };
        }
        return sys;
      })
    );

    createIssue({
      systemId: `W${targetBooth.toString().padStart(3, '0')}`,
      systemName: `Booth ${targetBooth}`,
      title: `[PROCTOR FLAG] Candidate ${targetCandidate} flagged on Booth ${targetBooth}`,
      description: `Proctor anomaly report: ${flagReason}`,
      priority: 'high',
      status: 'open',
      type: 'exam_app',
      reportedBy: currentUser.name
    });

    logActivity('Candidate Flagged', 'exam', sessionId, `Booth ${targetBooth}`, `Flagged for anomaly: ${flagReason}`);
  };

  const addSessionExtraTime = (sessionId: string, minutes: number) => {
    setSystems(prev =>
      prev.map(sys => {
        if (sys.currentSession && (sys.currentSession.id === sessionId || sys.currentSessionId === sessionId)) {
          const currentEnd = sys.currentSession.expectedEndAt ? new Date(sys.currentSession.expectedEndAt).getTime() : Date.now();
          const newEnd = new Date(currentEnd + minutes * 60000).toISOString();
          const updatedSession: OccupancySession = {
            ...sys.currentSession,
            expectedEndAt: newEnd,
            extraTimeMinutes: (sys.currentSession.extraTimeMinutes || 0) + minutes
          };
          return {
            ...sys,
            currentSession: updatedSession
          };
        }
        return sys;
      })
    );
    logActivity('Extra Time Granted', 'exam', sessionId, sessionId, `Proctor added +${minutes} minutes compensation time`);
  };

  const terminateCandidateSession = (sessionId: string) => {
    setSystems(prev =>
      prev.map(sys => {
        if (sys.currentSession && (sys.currentSession.id === sessionId || sys.currentSessionId === sessionId)) {
          return {
            ...sys,
            occupancyStatus: 'post_exam',
            currentSessionId: null,
            currentSession: null,
            notes: 'Session completed. Sanitizing station for next candidate.'
          };
        }
        return sys;
      })
    );
    logActivity('Session Completed', 'exam', sessionId, sessionId, `Candidate session finished. Station in post-exam.`);
  };

  // Phase 8 Actions: Synchronizer
  const triggerPackageSync = async (packageId: string) => {
    setSyncPackages(prev =>
      prev.map(p => (p.id === packageId ? { ...p, status: 'syncing' } : p))
    );
    setTimeout(() => {
      setSyncPackages(prev =>
        prev.map(p =>
          p.id === packageId
            ? {
                ...p,
                status: 'cached',
                cachedWorkstationsCount: p.totalTargetWorkstations,
                lastSynchronizedAt: 'Just now'
              }
            : p
        )
      );
      logActivity('Package Synchronized', 'exam', packageId, packageId, `Exam package payload synchronized across fleet`);
    }, 1200);
  };

  const triggerRosterSync = async (jobId: string) => {
    setSyncRosters(prev =>
      prev.map(j => (j.id === jobId ? { ...j, status: 'in_progress' } : j))
    );
    setTimeout(() => {
      setSyncRosters(prev =>
        prev.map(j =>
          j.id === jobId
            ? {
                ...j,
                status: 'synchronized',
                candidatesSynced: j.candidatesScheduled,
                lastSyncTime: 'Just now'
              }
            : j
        )
      );
      logActivity('Roster Synchronized', 'exam', jobId, jobId, `Candidate schedule roster verified with sponsor`);
    }, 1400);
  };

  const retryCandidateUpload = async (uploadId: string) => {
    setUploadQueue(prev =>
      prev.map(u => (u.id === uploadId ? { ...u, status: 'transmitting', attemptCount: u.attemptCount + 1 } : u))
    );
    setTimeout(() => {
      setUploadQueue(prev =>
        prev.map(u =>
          u.id === uploadId
            ? {
                ...u,
                status: 'uploaded',
                uploadedAt: 'Just now'
              }
            : u
        )
      );
      logActivity('Response Uploaded', 'exam', uploadId, uploadId, `Encrypted candidate response payload securely transmitted to sponsor`);
    }, 1500);
  };

  // Phase 9: Backup / Restore / JSON Snapshots
  const exportStateJson = () => {
    const stateData = {
      metadata: {
        appName: 'FETS Space',
        version: '2.4.0',
        exportedAt: new Date().toISOString(),
        centreCode: currentCentre.code,
        centreName: currentCentre.name
      },
      currentCentre,
      systems,
      examApps,
      assets,
      assetMovements,
      issues,
      audits,
      maintenance,
      alerts,
      notifications,
      activityLogs,
      readinessRules,
      candidateIntakes,
      syncPackages,
      syncRosters,
      uploadQueue,
      auditCertifications
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(stateData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `FETS_Space_Centre_${currentCentre.code}_Snapshot_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    logActivity('State Exported', 'system', 'EXPORT-JSON', currentCentre.code, 'Full centre operational state snapshot downloaded');
  };

  const importStateJson = (jsonString: string): { success: boolean; error?: string } => {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid JSON format');
      }
      if (data.systems && Array.isArray(data.systems)) {
        setSystems(data.systems);
      }
      if (data.examApps && Array.isArray(data.examApps)) {
        setRawExamApps(data.examApps);
      }
      if (data.assets && Array.isArray(data.assets)) {
        setAssets(data.assets);
      }
      if (data.assetMovements && Array.isArray(data.assetMovements)) {
        setAssetMovements(data.assetMovements);
      }
      if (data.issues && Array.isArray(data.issues)) {
        setIssues(data.issues);
      }
      if (data.audits && Array.isArray(data.audits)) {
        setAudits(data.audits);
      }
      if (data.maintenance && Array.isArray(data.maintenance)) {
        setMaintenance(data.maintenance);
      }
      if (data.alerts && Array.isArray(data.alerts)) {
        setAlerts(data.alerts);
      }
      if (data.notifications && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
      if (data.candidateIntakes && Array.isArray(data.candidateIntakes)) {
        setCandidateIntakes(data.candidateIntakes);
      }
      if (data.syncPackages && Array.isArray(data.syncPackages)) {
        setSyncPackages(data.syncPackages);
      }
      if (data.syncRosters && Array.isArray(data.syncRosters)) {
        setSyncRosters(data.syncRosters);
      }
      if (data.uploadQueue && Array.isArray(data.uploadQueue)) {
        setUploadQueue(data.uploadQueue);
      }
      if (data.currentCentre) {
        setCurrentCentre(data.currentCentre);
      }
      setLastSyncTime(new Date());
      logActivity('State Restored', 'system', 'RESTORE-JSON', data.metadata?.centreCode || 'RESTORE', 'Restored centre state from uploaded JSON snapshot');
      return { success: true };
    } catch (err: any) {
      console.error('Import error:', err);
      return { success: false, error: err?.message || 'Failed to restore state' };
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        availableUsers: AVAILABLE_USERS,
        currentCentre,
        setCurrentCentre,
        allCentres: ALL_CENTRES,
        activeView,
        selectedEntityId,
        navigate,
        isSidebarCollapsed,
        setSidebarCollapsed,
        isMobileSidebarOpen,
        setMobileSidebarOpen,
        isTopNavOpen,
        setTopNavOpen,
        toggleTopNav,
        isSearchOpen,
        setSearchOpen,
        systems,
        getSystem,
        createSystem,
        updateSystem,
        deleteSystem,
        setSystemStatus,
        floorLayouts,
        updateSystemLayout,
        saveFloorLayouts,
        resetFloorLayouts,
        examApps,
        installExamApp,
        uninstallExamApp,
        updateExamAppVersion,
        toggleExamAppStatus,
        updateExamAppStatus,
        verifyExamApp,
        addExamApp,
        updateExamApp,
        deleteExamApp,
        assets,
        getAsset,
        createAsset,
        updateAsset,
        deleteAsset,
        clearAllAssets,
        transferAsset,
        assetMovements,
        issues,
        getIssue,
        createIssue,
        updateIssueStatus,
        addIssueComment,
        audits,
        getAudit,
        recordAudit,
        maintenance,
        createMaintenance,
        updateMaintenanceStatus,
        alerts,
        markAlertRead,
        resolveAlert,
        markAlertResolved: resolveAlert,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        switches,
        activityLogs,
        logActivity,
        readinessRules,
        toggleReadinessRule,
        lastSyncTime,
        refreshData,
        resetToDefaultData,

        // Physical Booths & Live Capacity Engine
        booths,
        capacity,
        isLiveBackendConnected,
        transitionOccupancy,
        registerAgentToken,
        simulateAgentHeartbeat,
        simulateAgentTelemetry,
        readinessBreakdown,

        // Global Theme Mode
        theme,
        setTheme,
        toggleTheme,

        // Phase 7: Candidate Intake & Live Proctoring
        candidateIntakes,
        addCandidateIntake,
        updateCandidateIntakeStatus,
        assignCandidateSeat,
        admitCandidateToExam,
        pauseSession,
        resumeSession,
        flagCandidateSession,
        addSessionExtraTime,
        terminateCandidateSession,

        // Phase 8: Synchronizer Telemetry & Exam Cache
        syncPackages,
        triggerPackageSync,
        syncRosters,
        triggerRosterSync,
        uploadQueue,
        retryCandidateUpload,

        // Phase 9: Audit Certifications & State Snapshots
        auditCertifications,
        exportStateJson,
        importStateJson,
        resetStateToDefault
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
