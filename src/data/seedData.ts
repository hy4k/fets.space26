import {
  SystemRecord,
  ExamApplication,
  InstalledExamApp,
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
  SystemLayout,
  DeskGroup,
  Booth,
  Workstation,
  OccupancySession,
  HealthStatus,
  OccupancyStatus,
  NetworkStatus,
  ExamReadinessStatus,
  AgentStatus,
  CandidateIntakeRecord,
  SyncPayloadPackage,
  SyncRosterJob,
  CandidateUploadQueueItem,
  AuditCertificationSpec
} from '../types';

export const CURRENT_USER: User = {
  id: 'usr-001',
  name: 'Lazeem M.',
  email: 'lazeem@fetsspace.internal',
  role: 'admin',
  avatar: 'LM',
  centre: 'Calicut'
};

export const AVAILABLE_USERS: User[] = [
  {
    id: 'usr-001',
    name: 'Lazeem M.',
    email: 'lazeem@fetsspace.internal',
    role: 'admin',
    avatar: 'LM',
    centre: 'Calicut'
  },
  {
    id: 'usr-002',
    name: 'Rahul K. Menon',
    email: 'rahul.m@fetsspace.internal',
    role: 'it_admin',
    avatar: 'RM',
    centre: 'Calicut'
  },
  {
    id: 'usr-003',
    name: 'Sreeram P.',
    email: 'sreeram.p@fetsspace.internal',
    role: 'technician',
    avatar: 'SP',
    centre: 'Calicut'
  },
  {
    id: 'usr-004',
    name: 'Ananya Varma',
    email: 'ananya.v@fetsspace.internal',
    role: 'tca',
    avatar: 'AV',
    centre: 'Calicut'
  },
  {
    id: 'usr-005',
    name: 'Vikramaditya Nair',
    email: 'vikram.nair@fetsspace.internal',
    role: 'manager',
    avatar: 'VN',
    centre: 'Calicut'
  },
  {
    id: 'usr-006',
    name: 'Audit Inspector',
    email: 'auditor@cert-eval.org',
    role: 'viewer',
    avatar: 'AI',
    centre: 'Calicut'
  }
];

export const CURRENT_CENTRE: Centre = {
  id: 'centre-calicut',
  name: 'Calicut',
  code: '4960',
  city: 'Kozhikode (Calicut)',
  state: 'Kerala',
  country: 'India',
  totalWorkstations: 36,
  totalBooths: 40,
  installedSystems: 36,
  openSlots: 4,
  networkSubnet: '192.168.10.0/24',
  location: 'Kozhikode (Calicut), Kerala, India',
  primaryIsp: 'JIO Forun',
  primaryIspPlan: '1 Gbps Plan',
  primaryIspSpeed: '1 Gbps',
  primaryIspIp: '103.141.22.45',
  secondaryIsp: 'Airtel Business Fiber',
  secondaryIspSpeed: '300 Mbps',
  secondaryIspIp: '122.179.48.112',
  secondaryGatewayIp: '192.168.20.1',
  gatewayIp: '192.168.10.1'
};

export const ALL_CENTRES: Centre[] = [
  CURRENT_CENTRE,
  {
    id: 'centre-cochin',
    name: 'Cochin',
    code: '4982',
    city: 'Cochin',
    state: 'Kerala',
    country: 'India',
    totalWorkstations: 60,
    networkSubnet: '192.168.20.0/24',
    location: 'Cochin, Kerala, India',
    primaryIsp: 'JIO Forun',
    primaryIspPlan: '1 Gbps Plan',
    primaryIspSpeed: '1 Gbps',
    primaryIspIp: '103.141.28.90',
    secondaryIsp: 'Asianet Dataline Fiber',
    secondaryIspSpeed: '500 Mbps',
    secondaryIspIp: '117.218.42.15',
    secondaryGatewayIp: '192.168.25.1',
    gatewayIp: '192.168.20.1'
  }
];

export const INITIAL_EXAM_APPLICATIONS: ExamApplication[] = [
  // =========================================================================
  // DIVISION 1: EXAM DELIVERY APPLICATIONS (Installed on Testing Workstations)
  // =========================================================================
  {
    id: 'cma',
    code: 'CMA',
    name: 'CMA US',
    vendor: 'IMA / Prometric & Certiport',
    category: 'delivery',
    currentVersion: '3.4.2',
    expectedVersion: '3.4.2',
    minWindowsVersion: 'Windows 10 Pro 21H2',
    minOs: 'Windows 10 Pro 64-bit',
    minRamGB: 8,
    minStorageGB: 120,
    requiredPeripherals: ['Keyboard', 'Mouse', 'Monitor', 'Calculator Lock'],
    description: 'Certified Management Accountant secure test delivery client with financial calculation sandbox.',
    color: '#0284c7', // sky-600
    installedCount: 36,
    totalSystems: 36,
    lastChecked: '4 mins ago'
  },
  {
    id: 'pv',
    code: 'PV',
    name: 'Pearson VUE',
    vendor: 'Pearson VUE Testing Systems',
    category: 'delivery',
    currentVersion: '4.2.1',
    expectedVersion: '4.2.1',
    minWindowsVersion: 'Windows 10 Pro 22H2',
    minOs: 'Windows 10 Pro 64-bit',
    minRamGB: 8,
    minStorageGB: 128,
    requiredPeripherals: ['Webcam HD', 'Headset with Mic', 'Dual Security Screen Guard'],
    description: 'Athena Secure Testing Environment for Pearson VUE global certification exams.',
    color: '#0d9488', // teal-600
    installedCount: 34,
    totalSystems: 36,
    lastChecked: '2 mins ago'
  },
  {
    id: 'psi',
    code: 'PSI',
    name: 'PSI Exams',
    vendor: 'PSI Services LLC',
    category: 'delivery',
    currentVersion: '3.8.0',
    expectedVersion: '3.8.0',
    minWindowsVersion: 'Windows 10 Pro 21H2',
    minOs: 'Windows 10 Pro 64-bit',
    minRamGB: 8,
    minStorageGB: 100,
    requiredPeripherals: ['Webcam 1080p', 'Microphone', 'Standard QWERTY Keyboard'],
    description: 'PSI Bridge Secure Browser lockdown engine for high-stakes licensure & certifications.',
    color: '#4f46e5', // indigo-600
    installedCount: 34,
    totalSystems: 36,
    lastChecked: '5 mins ago'
  },
  {
    id: 'celpip',
    code: 'CELPIP',
    name: 'CELPIP',
    vendor: 'Paragon Testing Enterprises / Prometric',
    category: 'delivery',
    currentVersion: '2.4.0',
    expectedVersion: '2.4.0',
    minWindowsVersion: 'Windows 10 Pro 22H2',
    minOs: 'Windows 10 Pro 64-bit',
    minRamGB: 8,
    minStorageGB: 128,
    requiredPeripherals: ['Noise-Cancelling Headset', 'High-Gain Microphone', 'Webcam'],
    description: 'Canadian English Language Proficiency Index Program test client with strict audio calibration.',
    color: '#ea580c', // orange-600
    installedCount: 36,
    totalSystems: 36,
    lastChecked: '3 mins ago'
  },
  {
    id: 'itts',
    code: 'ITTS',
    name: 'ITTS Client',
    vendor: 'International Testing & Training Services',
    category: 'delivery',
    currentVersion: '5.1.0',
    expectedVersion: '5.1.0',
    minWindowsVersion: 'Windows 10 Pro 20H2',
    minOs: 'Windows 10 Pro 64-bit',
    minRamGB: 4,
    minStorageGB: 80,
    requiredPeripherals: ['Keyboard', 'Mouse', 'Display 1920x1080'],
    description: 'Universal multi-tenant delivery engine for technical, IT, and university admissions.',
    color: '#16a34a', // green-600
    installedCount: 36,
    totalSystems: 36,
    lastChecked: '1 min ago'
  },

  // =========================================================================
  // DIVISION 2: ADMIN / ADMISSION APPLICATIONS (Installed on Admin Systems)
  // =========================================================================
  {
    id: 'admin-proadmin',
    code: 'PRO',
    name: 'ProAdmin',
    vendor: 'Prometric / Centre Administration',
    category: 'admin_admission',
    currentVersion: '5.2.0',
    expectedVersion: '5.2.0',
    minWindowsVersion: 'Windows 10 Pro 22H2',
    minOs: 'Windows 10 / 11 Pro 64-bit',
    minRamGB: 16,
    minStorageGB: 256,
    requiredPeripherals: ['Dual Monitor Display', 'Master Network Uplink', 'Audio Proctored Headset'],
    description: 'Master proctor administration console for exam session authorization, live station oversight, and incident logging.',
    color: '#4f46e5', // indigo-600
    installedCount: 2,
    totalSystems: 2,
    lastChecked: '4 mins ago',
    eligibleSystemTypes: ['admin_pc']
  },
  {
    id: 'admin-admission-manager',
    code: 'ADM',
    name: 'Admission Manager',
    vendor: 'Pearson VUE / FETS Ops',
    category: 'admin_admission',
    currentVersion: '3.8.4',
    expectedVersion: '3.8.4',
    minWindowsVersion: 'Windows 10 Pro 22H2',
    minOs: 'Windows 10 / 11 Pro 64-bit',
    minRamGB: 8,
    minStorageGB: 128,
    requiredPeripherals: ['Biometric Fingerprint Scanner', 'High-Res Webcam', 'Digital Signature Pad'],
    description: 'Candidate intake terminal, biometric enrollment, live photograph capture, ID document check, and admittance authorization.',
    color: '#0284c7', // sky-600
    installedCount: 2,
    totalSystems: 2,
    lastChecked: '6 mins ago',
    eligibleSystemTypes: ['admin_pc']
  },
  {
    id: 'admin-synchronizer',
    code: 'SYNC',
    name: 'Synchronizer',
    vendor: 'FETS Sync Services / Cloud Ops',
    category: 'admin_admission',
    currentVersion: '2.9.1',
    expectedVersion: '2.9.1',
    minWindowsVersion: 'Windows 10 Pro 22H2',
    minOs: 'Windows 10 / 11 Pro 64-bit',
    minRamGB: 8,
    minStorageGB: 128,
    requiredPeripherals: ['Dedicated Network Interface', 'Encrypted Cache Storage', 'Failover Link'],
    description: 'Automated candidate roster synchronization, exam delivery package cache, biometric template sync, and encrypted result upload service.',
    color: '#0891b2', // cyan-600
    installedCount: 2,
    totalSystems: 2,
    lastChecked: '2 mins ago',
    eligibleSystemTypes: ['admin_pc']
  },
  {
    id: 'admin-registration-manager',
    code: 'REG',
    name: 'Registration Manager',
    vendor: 'ETS / PSI Operations',
    category: 'admin_admission',
    currentVersion: '4.3.0',
    expectedVersion: '4.3.0',
    minWindowsVersion: 'Windows 10 Pro 22H2',
    minOs: 'Windows 10 / 11 Pro 64-bit',
    minRamGB: 8,
    minStorageGB: 128,
    requiredPeripherals: ['Barcode / QR Scanner', 'Document Scanner', 'Roster Receipt Printer'],
    description: 'Candidate registration check-in, schedule roster validation, booth assignment, and locker credential issuer (Regisration Manager).',
    color: '#0d9488', // teal-600
    installedCount: 2,
    totalSystems: 2,
    lastChecked: '5 mins ago',
    eligibleSystemTypes: ['admin_pc']
  }
];

// Helper to generate realistic systems
export const generateInitialSystems = (): SystemRecord[] => {
  const list: SystemRecord[] = [];

  // Special System: Admin PC
  list.push({
    id: 'ADM-01',
    name: '4960-ADM01',
    type: 'admin_pc',
    status: 'operational',
    centreId: 'centre-calicut',
    centreName: 'Calicut',
    hardware: {
      processor: 'Intel Core i7-12700',
      ramGB: 16,
      storageGB: 512,
      storageType: 'NVMe',
      monitorModel: 'Dell UltraSharp 27" U2722D',
      cameraModel: 'Logitech Brio 4K',
      keyboardModel: 'Logitech MX Keys',
      mouseModel: 'Logitech MX Master 3S',
      headsetModel: 'Jabra Evolve2 65'
    },
    os: {
      name: 'Windows 11 Pro',
      version: '23H2',
      build: '22631.3007',
      architecture: '64-bit',
      lastUpdateDate: '2026-08-25'
    },
    network: {
      ipAddress: '192.168.10.10',
      macAddress: '70:85:C2:5A:11:00',
      gateway: '192.168.10.1',
      dns: '1.1.1.1, 8.8.8.8',
      switchId: 'SW-01',
      switchPort: 1,
      vlan: 10,
      linkSpeed: '1000 Mbps'
    },
    examApps: [
      { appId: 'admin-proadmin', appName: 'ProAdmin', code: 'PRO', category: 'admin_admission', version: '5.2.0', expectedVersion: '5.2.0', status: 'installed', lastVerified: 'Today, 08:30', verifiedBy: 'Lazeem M.' },
      { appId: 'admin-admission-manager', appName: 'Admission Manager', code: 'ADM', category: 'admin_admission', version: '3.8.4', expectedVersion: '3.8.4', status: 'installed', lastVerified: 'Today, 08:30', verifiedBy: 'Lazeem M.' },
      { appId: 'admin-synchronizer', appName: 'Synchronizer', code: 'SYNC', category: 'admin_admission', version: '2.9.1', expectedVersion: '2.9.1', status: 'installed', lastVerified: 'Today, 08:30', verifiedBy: 'Lazeem M.' },
      { appId: 'admin-registration-manager', appName: 'Registration Manager', code: 'REG', category: 'admin_admission', version: '4.3.0', expectedVersion: '4.3.0', status: 'installed', lastVerified: 'Today, 08:30', verifiedBy: 'Lazeem M.' }
    ],
    assignedAssetIds: ['AST-CMP-001', 'AST-MON-001', 'AST-KEY-001', 'AST-MOU-001'],
    lastUpdated: '1 min ago',
    lastAuditDate: '2026-08-28',
    notes: 'Administrator Control Terminal. Holds master exam rosters.',
    activeIssueCount: 0
  });

  // Special System: Server
  list.push({
    id: 'SRV-01',
    name: '4960-SRV01',
    type: 'server',
    status: 'operational',
    centreId: 'centre-calicut',
    centreName: 'Calicut',
    hardware: {
      processor: 'Intel Xeon E-2388G',
      ramGB: 64,
      storageGB: 2000,
      storageType: 'NVMe',
      monitorModel: 'Rack KVM Console 17"',
      cameraModel: 'N/A'
    },
    os: {
      name: 'Windows Server 2022 Datacenter',
      version: '21H2',
      build: '20348.2227',
      architecture: '64-bit',
      lastUpdateDate: '2026-08-20'
    },
    network: {
      ipAddress: '192.168.10.2',
      macAddress: '00:1E:67:8B:90:FE',
      gateway: '192.168.10.1',
      dns: '127.0.0.1, 1.1.1.1',
      switchId: 'SW-01',
      switchPort: 24,
      vlan: 1,
      linkSpeed: '10000 Mbps'
    },
    examApps: [],
    assignedAssetIds: ['AST-SRV-001'],
    lastUpdated: 'Just now',
    lastAuditDate: '2026-08-25',
    notes: 'Primary Local Cache Server & Active Directory Domain Controller.',
    activeIssueCount: 0
  });

  // Special System: Master Proctor Terminal MW01
  list.push({
    id: 'MW01',
    name: '4960-MW01',
    type: 'admin_pc',
    status: 'operational',
    centreId: 'centre-calicut',
    centreName: 'Calicut',
    hardware: {
      processor: 'Intel Core i5-11400',
      ramGB: 16,
      storageGB: 256,
      storageType: 'SSD',
      monitorModel: 'BENQ GW2480 24"',
      cameraModel: 'A-01 Full HD Pro'
    },
    os: {
      name: 'Windows 10 Pro',
      version: '22H2',
      build: '19045.3803',
      architecture: '64-bit',
      lastUpdateDate: '2026-08-26'
    },
    network: {
      ipAddress: '192.168.10.15',
      macAddress: '70:85:C2:5A:11:02',
      gateway: '192.168.10.1',
      dns: '1.1.1.1, 8.8.8.8',
      switchId: 'SW-01',
      switchPort: 2,
      vlan: 10,
      linkSpeed: '1000 Mbps'
    },
    examApps: [
      { appId: 'admin-proadmin', appName: 'ProAdmin', code: 'PRO', category: 'admin_admission', version: '5.2.0', expectedVersion: '5.2.0', status: 'installed', lastVerified: 'Today, 09:00', verifiedBy: 'Ananya Varma' },
      { appId: 'admin-admission-manager', appName: 'Admission Manager', code: 'ADM', category: 'admin_admission', version: '3.8.4', expectedVersion: '3.8.4', status: 'installed', lastVerified: 'Today, 09:00', verifiedBy: 'Ananya Varma' },
      { appId: 'admin-synchronizer', appName: 'Synchronizer', code: 'SYNC', category: 'admin_admission', version: '2.9.1', expectedVersion: '2.9.1', status: 'installed', lastVerified: 'Today, 09:00', verifiedBy: 'Ananya Varma' },
      { appId: 'admin-registration-manager', appName: 'Registration Manager', code: 'REG', category: 'admin_admission', version: '4.2.8', expectedVersion: '4.3.0', status: 'issue', lastVerified: 'Today, 09:00', verifiedBy: 'Ananya Varma', notes: 'Version mismatch: pending upgrade to v4.3.0' }
    ],
    assignedAssetIds: ['AST-CMP-002', 'AST-MON-002'],
    lastUpdated: '3 mins ago',
    lastAuditDate: '2026-08-29',
    notes: 'Proctor Station 01 / Master Workstation for test admissions.',
    activeIssueCount: 0
  });

  // Workstations W001 to W036 (Exactly 36 installed computer systems)
  // PHYSICAL CAPACITY: 40 booths. SYSTEM CAPACITY: 36 installed systems.
  // Booths 37 to 40 are OPEN SLOTS with no installed system.
  // Workstations W001 to W036 (Exactly 36 installed computer systems)
  // PHYSICAL CAPACITY: 40 booths. SYSTEM CAPACITY: 36 installed systems.
  // Booths 37 to 40 are OPEN SLOTS with no installed system.
  // Dynamic breakdown:
  // 35 OPERATIONAL with Windows 11 Home (8 GB RAM, 128 GB SSD)
  //   - 24 BUSY (currently in examination sessions)
  //   - 11 AVAILABLE (ready for exam assignment)
  // 1 WITHOUT SSD (W036: Hardware pending solid-state drive installation)
  // Total Installed = 35 Operational + 1 Without SSD = 36 Systems
  const busyStationIndices = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
    15, 16, 17, 18, 19, 20, 21, 22, 23, 24
  ];

  const examCatalog = [
    { code: 'CMA', name: 'CMA US Part 1 - Financial Planning & Performance' },
    { code: 'CMA', name: 'CMA US Part 2 - Strategic Financial Management' },
    { code: 'PV', name: 'Pearson VUE - AWS Solutions Architect Associate' },
    { code: 'PV', name: 'Pearson VUE - Cisco CCNA 200-301' },
    { code: 'PSI', name: 'PSI Exams - Project Management Professional (PMP)' },
    { code: 'PSI', name: 'PSI Exams - Certified Information Systems Security' },
    { code: 'CELPIP', name: 'CELPIP General - Listening & Speaking Test' },
    { code: 'ITTS', name: 'ITTS Client - International Technical Assessment' }
  ];

  for (let i = 1; i <= 36; i++) {
    const numStr = i.toString().padStart(3, '0');
    const id = `W${numStr}`;
    const name = `4960-T${numStr}`;
    const ipSuffix = 100 + i;
    const ipAddress = `192.168.10.${ipSuffix}`;
    const switchId = i <= 24 ? 'SW-01' : 'SW-02';
    const switchPort = i <= 24 ? i + 2 : i - 24;

    let status: SystemRecord['status'] = 'operational';
    let healthStatus: HealthStatus = 'operational';
    let occupancyStatus: OccupancyStatus = 'available';
    let networkStatus: NetworkStatus = 'connected';
    let examReadinessStatus: ExamReadinessStatus = 'ready';
    let agentStatus: AgentStatus = 'online';
    let activeIssueCount = 0;
    let notes = 'Standard testing booth workstation.';
    let lastUpdated = `${(i % 12) + 1} minutes ago`;
    let currentSessionId: string | null = null;
    let currentSession: OccupancySession | null = null;
    let cpuUsage = Math.floor(18 + Math.random() * 12);
    let ramUsage = Math.floor(40 + Math.random() * 15);

    // Hardware Specs
    let storageGB = 128;
    let storageType: 'SSD' | 'NVMe' | 'HDD' | 'None' = 'SSD';
    let osName = 'Windows 11 Home';
    let osVersion = '23H2';
    let osBuild = '22631.3007';

    if (i === 36) {
      // Workstation 36: The 1 workstation without SSD
      status = 'attention';
      healthStatus = 'attention';
      occupancyStatus = 'unavailable';
      networkStatus = 'connected';
      examReadinessStatus = 'blocked';
      agentStatus = 'online';
      activeIssueCount = 1;
      cpuUsage = 0;
      ramUsage = 0;
      storageGB = 0;
      storageType = 'None';
      osName = 'No OS (No SSD)';
      osVersion = '—';
      osBuild = '—';
      notes = 'ATTENTION: No SSD installed. Workstation pending 128GB SSD drive installation and Windows 11 Home OS image deployment.';
    } else if (busyStationIndices.includes(i)) {
      status = 'operational';
      healthStatus = 'operational';
      occupancyStatus = 'busy';
      networkStatus = 'connected';
      examReadinessStatus = 'ready';
      agentStatus = 'online';
      cpuUsage = Math.floor(28 + Math.random() * 20);
      ramUsage = Math.floor(52 + Math.random() * 18);

      const exam = examCatalog[(i - 1) % examCatalog.length];
      const sessId = `SES-W${numStr}-${1000 + i}`;
      const startMins = 20 + ((i * 7) % 65);
      currentSessionId = sessId;
      currentSession = {
        id: sessId,
        centreId: 'centre-calicut',
        workstationId: id,
        boothNumber: i,
        examCode: exam.code,
        examName: exam.name,
        candidateRef: `CAND-${4800 + i}`,
        status: 'active',
        startedAt: new Date(Date.now() - startMins * 60000).toISOString(),
        expectedEndAt: new Date(Date.now() + (120 - startMins) * 60000).toISOString()
      };
      notes = `In examination: ${exam.name} (${currentSession.candidateRef})`;
    } else {
      // Available (strictly ready for test assignment)
      status = 'operational';
      healthStatus = 'operational';
      occupancyStatus = 'available';
      networkStatus = 'connected';
      examReadinessStatus = 'ready';
      agentStatus = 'online';
      notes = 'Ready for candidate assignment.';
    }

    // Exam app installations (installed on all 35 operational nodes; missing on W036 awaiting SSD)
    const isNodeWithoutSsd = i === 36;
    const examApps: InstalledExamApp[] = [
      {
        appId: 'cma',
        appName: 'CMA US',
        code: 'CMA',
        category: 'delivery',
        version: isNodeWithoutSsd ? '—' : '3.4.2',
        expectedVersion: '3.4.2',
        status: isNodeWithoutSsd ? 'missing' : 'installed',
        lastVerified: isNodeWithoutSsd ? 'Pending SSD' : 'Today, 08:45',
        verifiedBy: 'System Audit',
        notes: isNodeWithoutSsd ? 'Pending SSD installation' : undefined
      },
      {
        appId: 'pv',
        appName: 'Pearson VUE',
        code: 'PV',
        category: 'delivery',
        version: isNodeWithoutSsd ? '—' : '4.2.1',
        expectedVersion: '4.2.1',
        status: isNodeWithoutSsd ? 'missing' : 'installed',
        lastVerified: isNodeWithoutSsd ? 'Pending SSD' : 'Today, 08:45',
        verifiedBy: 'System Audit',
        notes: isNodeWithoutSsd ? 'Pending SSD installation' : undefined
      },
      {
        appId: 'psi',
        appName: 'PSI Exams',
        code: 'PSI',
        category: 'delivery',
        version: isNodeWithoutSsd ? '—' : '3.8.0',
        expectedVersion: '3.8.0',
        status: isNodeWithoutSsd ? 'missing' : 'installed',
        lastVerified: isNodeWithoutSsd ? 'Pending SSD' : 'Today, 08:40',
        verifiedBy: 'System Audit',
        notes: isNodeWithoutSsd ? 'Pending SSD installation' : undefined
      },
      {
        appId: 'celpip',
        appName: 'CELPIP',
        code: 'CELPIP',
        category: 'delivery',
        version: isNodeWithoutSsd ? '—' : '2.4.0',
        expectedVersion: '2.4.0',
        status: isNodeWithoutSsd ? 'missing' : 'installed',
        lastVerified: isNodeWithoutSsd ? 'Pending SSD' : 'Today, 08:50',
        verifiedBy: 'System Audit',
        notes: isNodeWithoutSsd ? 'Pending SSD installation' : undefined
      },
      {
        appId: 'itts',
        appName: 'ITTS Client',
        code: 'ITTS',
        category: 'delivery',
        version: isNodeWithoutSsd ? '—' : '5.1.0',
        expectedVersion: '5.1.0',
        status: isNodeWithoutSsd ? 'missing' : 'installed',
        lastVerified: isNodeWithoutSsd ? 'Pending SSD' : 'Today, 08:52',
        verifiedBy: 'System Audit',
        notes: isNodeWithoutSsd ? 'Pending SSD installation' : undefined
      }
    ];

    list.push({
      id,
      name,
      type: 'workstation',
      status,
      centreId: 'centre-calicut',
      centreName: 'Calicut',
      boothId: `B${numStr}`,
      boothNumber: i,
      healthStatus,
      occupancyStatus,
      networkStatus,
      examReadinessStatus,
      agentStatus,
      cpuUsage,
      ramUsage,
      storageUsage: isNodeWithoutSsd ? 0 : 42,
      lastHeartbeatAt: 'Just now',
      currentSessionId,
      currentSession,
      hardware: {
        processor: i % 4 === 0 ? 'Intel Core i5-10400' : 'Intel Core i3-10100 @ 3.60GHz',
        ramGB: 8,
        storageGB,
        storageType,
        monitorModel: 'BENQ GW2480 23.8" IPS',
        cameraModel: 'A-01 High-Definition HD',
        keyboardModel: 'Logitech K120 Business',
        mouseModel: 'Logitech B100 Optical',
        headsetModel: 'Jabra UC Voice 150 Duo'
      },
      os: {
        name: osName,
        version: osVersion,
        build: osBuild,
        architecture: '64-bit',
        lastUpdateDate: isNodeWithoutSsd ? '—' : '2026-08-22'
      },
      network: {
        ipAddress,
        macAddress: `70:85:C2:5A:${(i + 15).toString(16).toUpperCase().padStart(2, '0')}:${(i * 3).toString(16).toUpperCase().padStart(2, '0')}`,
        gateway: '192.168.10.1',
        dns: '1.1.1.1, 8.8.8.8',
        switchId,
        switchPort,
        vlan: 10,
        linkSpeed: '1000 Mbps'
      },
      examApps,
      assignedAssetIds: [`AST-CMP-${numStr}`, `AST-MON-${numStr}`, `AST-KEY-${numStr}`, `AST-MOU-${numStr}`, `AST-CAM-${numStr}`, `AST-HED-${numStr}`],
      lastUpdated,
      lastAuditDate: i <= 34 ? '2026-08-29' : '2026-08-15 (Audit Due)',
      notes,
      activeIssueCount
    });
  }

  return list;
};

// 40 Physical Booths (B001 to B040)
// B001 to B036: occupied_by_system (installed with W001 to W036)
// B037 to B040: open_slot (NO installed computer system, NEVER offline/critical)
export const INITIAL_BOOTHS: Booth[] = Array.from({ length: 40 }, (_, idx) => {
  const boothNumber = idx + 1;
  const numStr = boothNumber.toString().padStart(3, '0');
  const isInstalled = boothNumber <= 36;
  const col = (boothNumber - 1) % 4;
  const row = Math.floor((boothNumber - 1) / 4);

  return {
    id: `B${numStr}`,
    centreId: 'centre-calicut',
    boothNumber,
    room: boothNumber <= 20 ? 'Exam Hall A' : 'Exam Hall B',
    floor: 'Floor 1',
    positionX: 140 + col * 260,
    positionY: 120 + row * 85,
    position: `Bay ${col + 1} - Desk ${row + 1}`,
    installedSystemId: isInstalled ? `W${numStr}` : null,
    physicalStatus: isInstalled ? 'occupied_by_system' : 'open_slot'
  };
});

export const INITIAL_ASSETS: Asset[] = [
  // Computers
  ...Array.from({ length: 36 }, (_, idx) => {
    const num = (idx + 1).toString().padStart(3, '0');
    return {
      id: `AST-CMP-${num}`,
      category: 'computer' as const,
      brand: 'HP',
      model: 'ProDesk 400 G7 SFF',
      serialNumber: `HP-SN-4960-${num}`,
      status: 'assigned' as const,
      assignedLocation: 'Testing Lab A',
      assignedSystemId: `W${num}`,
      assignedSystemName: `4960-T${num}`,
      purchaseDate: '2024-03-15',
      warrantyExpiry: '2027-03-15',
      notes: 'Standard 8GB Core i3 workstation chassis.',
      condition: 'good' as const
    };
  }),

  // Monitors
  ...Array.from({ length: 40 }, (_, idx) => {
    const num = (idx + 1).toString().padStart(3, '0');
    const isSpare = idx >= 36;
    return {
      id: `AST-MON-${num}`,
      category: 'monitor' as const,
      brand: 'BENQ',
      model: 'GW2480 23.8" Eye-Care',
      serialNumber: `BNQ-GW-${num}-99`,
      status: isSpare ? ('available' as const) : ('assigned' as const),
      assignedLocation: isSpare ? 'IT Store Room' : 'Testing Lab A',
      assignedSystemId: isSpare ? undefined : `W${num}`,
      assignedSystemName: isSpare ? undefined : `4960-T${num}`,
      purchaseDate: '2024-03-15',
      warrantyExpiry: '2027-03-15',
      notes: isSpare ? 'Spare calibrated monitor on stand.' : 'Fitted with privacy filter.',
      condition: 'excellent' as const
    };
  }),

  // Keyboards & Mice
  ...Array.from({ length: 10 }, (_, idx) => {
    const num = (idx + 1).toString().padStart(3, '0');
    return {
      id: `AST-KEY-${num}`,
      category: 'keyboard' as const,
      brand: 'Logitech',
      model: 'K120 USB Standard QWERTY',
      serialNumber: `LOG-K120-${num}`,
      status: 'assigned' as const,
      assignedLocation: 'Testing Lab A',
      assignedSystemId: `W${num}`,
      assignedSystemName: `4960-T${num}`,
      purchaseDate: '2024-03-15',
      warrantyExpiry: '2026-03-15',
      condition: 'good' as const
    };
  }),

  // Webcams
  ...Array.from({ length: 40 }, (_, idx) => {
    const num = (idx + 1).toString().padStart(3, '0');
    const isSpare = idx >= 36;
    return {
      id: `AST-CAM-${num}`,
      category: 'camera' as const,
      brand: 'Logitech / A-01',
      model: 'HD Pro C920 / A-01',
      serialNumber: `CAM-SN-${num}`,
      status: isSpare ? ('available' as const) : ('assigned' as const),
      assignedLocation: isSpare ? 'IT Store Room' : 'Testing Lab A',
      assignedSystemId: isSpare ? undefined : `W${num}`,
      assignedSystemName: isSpare ? undefined : `4960-T${num}`,
      purchaseDate: '2024-04-10',
      warrantyExpiry: '2026-04-10',
      condition: 'good' as const
    };
  }),

  // Headsets
  ...Array.from({ length: 40 }, (_, idx) => {
    const num = (idx + 1).toString().padStart(3, '0');
    const isSpare = idx >= 36;
    return {
      id: `AST-HED-${num}`,
      category: 'headset' as const,
      brand: 'Jabra',
      model: 'UC Voice 150 Duo USB',
      serialNumber: `JAB-150-${num}`,
      status: isSpare ? ('available' as const) : ('assigned' as const),
      assignedLocation: isSpare ? 'IT Store Room' : 'Testing Lab A',
      assignedSystemId: isSpare ? undefined : `W${num}`,
      assignedSystemName: isSpare ? undefined : `4960-T${num}`,
      purchaseDate: '2024-03-15',
      warrantyExpiry: '2026-03-15',
      condition: idx === 32 ? ('fair' as const) : ('good' as const)
    };
  }),

  // CCTV Cameras
  {
    id: 'AST-CCTV-001',
    category: 'cctv',
    brand: 'Hikvision',
    model: 'DS-2CD2143G2-I Dome 4MP',
    serialNumber: 'HIK-4MP-001',
    status: 'assigned',
    assignedLocation: 'Testing Lab A - North Ceiling',
    purchaseDate: '2023-11-10',
    warrantyExpiry: '2026-11-10',
    notes: 'Overlooks booths W001 to W018. 24/7 NVR recording active.',
    condition: 'excellent'
  },
  {
    id: 'AST-CCTV-002',
    category: 'cctv',
    brand: 'Hikvision',
    model: 'DS-2CD2143G2-I Dome 4MP',
    serialNumber: 'HIK-4MP-002',
    status: 'assigned',
    assignedLocation: 'Testing Lab A - South Ceiling',
    purchaseDate: '2023-11-10',
    warrantyExpiry: '2026-11-10',
    notes: 'Overlooks booths W019 to W036. 24/7 NVR recording active.',
    condition: 'excellent'
  },
  {
    id: 'AST-CCTV-003',
    category: 'cctv',
    brand: 'Hikvision',
    model: 'DS-2CD2043G2-I Bullet 4MP',
    serialNumber: 'HIK-4MP-003',
    status: 'assigned',
    assignedLocation: 'Reception / Registration Desk',
    purchaseDate: '2023-11-10',
    warrantyExpiry: '2026-11-10',
    notes: 'Monitors candidate check-in and biometric verification.',
    condition: 'excellent'
  },

  // Switches
  {
    id: 'AST-SW-001',
    category: 'switch',
    brand: 'Cisco Catalyst',
    model: 'C1000-24T-4G-L Gigabit Switch',
    serialNumber: 'FOC2441C001',
    status: 'assigned',
    assignedLocation: 'Server Rack 01 - Unit 4',
    purchaseDate: '2023-09-01',
    warrantyExpiry: '2028-09-01',
    notes: 'Primary Switch SW-01 (Feeds W001-W020 + Servers).',
    condition: 'excellent'
  },
  {
    id: 'AST-SW-002',
    category: 'switch',
    brand: 'Cisco Catalyst',
    model: 'C1000-24T-4G-L Gigabit Switch',
    serialNumber: 'FOC2441C002',
    status: 'assigned',
    assignedLocation: 'Server Rack 01 - Unit 6',
    purchaseDate: '2023-09-01',
    warrantyExpiry: '2028-09-01',
    notes: 'Secondary Switch SW-02 (Feeds W021-W040).',
    condition: 'excellent'
  },

  // Printers (Admin, Proctor Desk, and Reception Spares)
  {
    id: 'AST-PRN-001',
    category: 'printer',
    brand: 'HP',
    model: 'Laser MFP 1188fnw Multifunction Network Laser Printer',
    serialNumber: 'CNB1M82914',
    status: 'assigned',
    assignedLocation: 'Examination Control Desk / Proctor Room',
    assignedSystemId: 'P001',
    assignedSystemName: '4960-PROCTOR-01',
    purchaseDate: '2024-01-15',
    warrantyExpiry: '2027-01-15',
    notes: 'Primary exam roster, candidate hall ticket, and score report network printer. Direct Ethernet connection at static IP 192.168.29.91 (TCP Ports 9100/80/631).',
    condition: 'excellent'
  },
  {
    id: 'AST-PRN-002',
    category: 'printer',
    brand: 'Canon',
    model: 'imageCLASS LBP6030w Desktop Laser Printer',
    serialNumber: 'KNB5512809',
    status: 'assigned',
    assignedLocation: 'Reception / Candidate Verification Desk',
    assignedSystemId: 'ADM-01',
    assignedSystemName: '4960-ADMIN-FRONT',
    purchaseDate: '2023-10-12',
    warrantyExpiry: '2026-10-12',
    notes: 'High-speed candidate hall ticket and identity token slip printer. Dedicated USB link.',
    condition: 'good'
  },
  {
    id: 'AST-PRN-003',
    category: 'printer',
    brand: 'Brother',
    model: 'HL-L2321D Compact Monochrome Laser Printer',
    serialNumber: 'E78411D4N123891',
    status: 'available',
    assignedLocation: 'Store Room / Spares Rack A',
    purchaseDate: '2024-04-20',
    warrantyExpiry: '2027-04-20',
    notes: 'Hot spare backup laser printer pre-loaded with high-yield toner cartridge.',
    condition: 'excellent'
  }
];

export const INITIAL_ASSET_MOVEMENTS: AssetMovement[] = [
  {
    id: 'MOV-001',
    assetId: 'AST-MON-014',
    assetTag: 'MON-014 (BENQ GW2480)',
    assetCategory: 'monitor',
    fromSystemId: 'W001',
    fromSystemName: '4960-T001',
    toSystemId: 'W017',
    toSystemName: '4960-T017',
    fromLocation: 'Testing Lab A - Booth 01',
    toLocation: 'Testing Lab A - Booth 17',
    reason: 'Replacement for flickering display on W017',
    movedBy: 'Rahul K. Menon (IT Admin)',
    timestamp: '2026-08-29 11:10'
  },
  {
    id: 'MOV-002',
    assetId: 'AST-KEY-031',
    assetTag: 'KEY-031 (Logitech K120)',
    assetCategory: 'keyboard',
    fromLocation: 'IT Store Room',
    toSystemId: 'W004',
    toSystemName: '4960-T004',
    toLocation: 'Testing Lab A - Booth 04',
    reason: 'Sticky spacebar key replacement before session',
    movedBy: 'Sreeram P. (Technician)',
    timestamp: '2026-08-28 16:45'
  },
  {
    id: 'MOV-003',
    assetId: 'AST-HED-033',
    assetTag: 'HED-033 (Jabra UC 150)',
    assetCategory: 'headset',
    fromSystemId: 'W033',
    fromSystemName: '4960-T033',
    fromLocation: 'Testing Lab A - Booth 33',
    toLocation: 'IT Store Room (Under Inspection)',
    reason: 'Audio crackling check - swapped with spare HED-041',
    movedBy: 'Lazeem M. (Lazeem)',
    timestamp: '2026-08-28 09:20'
  },
  {
    id: 'MOV-004',
    assetId: 'AST-CMP-019',
    assetTag: 'CMP-019 (HP ProDesk 400)',
    assetCategory: 'computer',
    fromSystemId: 'W019',
    fromSystemName: '4960-T019',
    fromLocation: 'Testing Lab A - Booth 19',
    toLocation: 'Hardware Workshop Bench',
    reason: 'RAM module upgrade & heatsink repasting',
    movedBy: 'Sreeram P. (Technician)',
    timestamp: '2026-08-27 14:00'
  },
  {
    id: 'MOV-005',
    assetId: 'AST-CAM-005',
    assetTag: 'CAM-005 (Logitech C920)',
    assetCategory: 'camera',
    fromSystemId: 'W005',
    fromSystemName: '4960-T005',
    toSystemId: 'W002',
    toSystemName: '4960-T002',
    fromLocation: 'Testing Lab A',
    toLocation: 'Testing Lab A',
    reason: 'Camera angle calibration adjustment',
    movedBy: 'Ananya Varma (TCA)',
    timestamp: '2026-08-26 10:15'
  }
];

export const INITIAL_ISSUES: Issue[] = [
  {
    id: 'ISS-036',
    title: 'W036 No SSD installed - pending solid-state drive installation',
    description: 'Workstation 36 chassis has no primary SSD installed. Requisitioned 128GB SSD drive from inventory. Staged for physical mounting and Windows 11 Home OS image deployment.',
    type: 'hardware',
    priority: 'high',
    status: 'open',
    systemId: 'W036',
    systemName: '4960-T036',
    reportedBy: 'Lazeem M.',
    assignedTo: 'Sreeram P.',
    createdAt: '2026-08-30 06:00',
    updatedAt: '2026-08-30 06:30',
    comments: [
      {
        id: 'c-36',
        author: 'Sreeram P.',
        role: 'it_admin',
        text: 'New 128GB SSD drive allocated from IT storeroom. Ready for installation and Windows 11 Home staging.',
        timestamp: '2026-08-30 06:30'
      }
    ]
  },
  {
    id: 'ISS-014',
    title: 'W014 Realtek GbE NIC and proctor display sync (Resolved)',
    description: 'Realtek PCIe GbE Controller packet drops and proctor screen sync blackout resolved after NIC replacement and cable reseat.',
    type: 'network',
    priority: 'high',
    status: 'resolved',
    systemId: 'W014',
    systemName: '4960-T014',
    reportedBy: 'Lazeem M.',
    assignedTo: 'Sreeram P.',
    createdAt: '2026-08-29 16:15',
    updatedAt: '2026-08-30 05:30',
    resolvedAt: '2026-08-30 05:30',
    resolutionNotes: 'Installed replacement Intel GbE adapter and verified 0% packet loss. Workstation operational.',
    comments: []
  },
  {
    id: 'ISS-004',
    title: 'W004 Windows 11 Cumulative Update reboot (Resolved)',
    description: 'Security patch installed overnight. Workstation clean reboot and post-boot lockdown verified.',
    type: 'software',
    priority: 'medium',
    status: 'resolved',
    systemId: 'W004',
    systemName: '4960-T004',
    reportedBy: 'Lazeem M.',
    assignedTo: 'Sreeram P.',
    createdAt: '2026-08-29 20:00',
    updatedAt: '2026-08-30 05:45',
    resolvedAt: '2026-08-30 05:45',
    resolutionNotes: 'Clean restart completed. Windows 11 Home Build 22631 verified and test browser lockdown operational.',
    comments: []
  },
  {
    id: 'ISS-003',
    title: 'W027 Pearson VUE client version update (Resolved)',
    description: 'Pearson VUE Athena client updated to version 4.2.1.',
    type: 'exam_app',
    priority: 'high',
    status: 'resolved',
    systemId: 'W027',
    systemName: '4960-T027',
    reportedBy: 'Ananya Varma',
    assignedTo: 'Rahul K. Menon',
    createdAt: '2026-08-29 18:20',
    updatedAt: '2026-08-30 05:50',
    resolvedAt: '2026-08-30 05:50',
    resolutionNotes: 'Updated to Pearson VUE v4.2.1 and verified against production test bank.',
    comments: []
  },
  {
    id: 'ISS-001',
    title: 'W005 SSD SMART degradation and bad sectors (Resolved)',
    description: 'Storage diagnostic tool reported uncorrectable sector count > 48 on primary 128GB SSD. Cloned and replaced with new Kingston SSD.',
    type: 'hardware',
    priority: 'critical',
    status: 'resolved',
    systemId: 'W005',
    systemName: '4960-T005',
    reportedBy: 'Lazeem M.',
    assignedTo: 'Sreeram P.',
    createdAt: '2026-08-29 14:15',
    updatedAt: '2026-08-29 16:30',
    resolvedAt: '2026-08-29 16:30',
    resolutionNotes: 'Successfully cloned system image to spare 128GB SSD. System verified operational.',
    comments: []
  }
];

export const DEFAULT_DESK_GROUPS: DeskGroup[] = [
  { id: 'DESK-L1', name: 'Left Bay 1', zone: 'LEFT', label: 'Left Section (01–05)', systemIds: ['W001', 'W002', 'W003', 'W004', 'W005'] },
  { id: 'DESK-L2', name: 'Left Bay 2', zone: 'LEFT', label: 'Left Section (06–10)', systemIds: ['W006', 'W007', 'W008', 'W009', 'W010'] },
  { id: 'DESK-L3', name: 'Left Bay 3', zone: 'LEFT', label: 'Left Section (11–15)', systemIds: ['W011', 'W012', 'W013', 'W014', 'W015'] },
  { id: 'DESK-C1', name: 'Centre Island West', zone: 'CENTER', label: 'Centre Section West (16–22)', systemIds: ['W016', 'W017', 'W018', 'W019', 'W020', 'W021', 'W022'] },
  { id: 'DESK-C2', name: 'Centre Island East', zone: 'CENTER', label: 'Centre Section East (23–29)', systemIds: ['W023', 'W024', 'W025', 'W026', 'W027', 'W028', 'W029'] },
  { id: 'DESK-R1', name: 'Right Bank A', zone: 'RIGHT', label: 'Right Section (30–35)', systemIds: ['W030', 'W031', 'W032', 'W033', 'W034', 'W035'] },
  { id: 'DESK-R2', name: 'Right Bank B', zone: 'RIGHT', label: 'Right Section (36–40)', systemIds: ['W036', 'W037', 'W038', 'W039', 'W040'] },
  { id: 'DESK-ADM', name: 'Proctor & Admin Station', zone: 'ADMIN', label: 'Admin Station', systemIds: ['ADM-01', 'MW01'] },
  { id: 'RACK-SRV', name: 'Server NOC Enclosure', zone: 'SERVER', label: 'Server Rack', systemIds: ['SRV-01'] }
];

export const generateDefaultLayouts = (): Record<string, SystemLayout> => {
  const layouts: Record<string, SystemLayout> = {};

  // Admin & Server
  layouts['ADM-01'] = {
    id: 'lay-ADM-01',
    systemId: 'ADM-01',
    zone: 'ADMIN',
    deskId: 'DESK-ADM',
    row: 1,
    col: 1,
    positionX: 790,
    positionY: 70,
    rotation: 0,
    mapVisible: true
  };

  layouts['MW01'] = {
    id: 'lay-MW01',
    systemId: 'MW01',
    zone: 'ADMIN',
    deskId: 'DESK-ADM',
    row: 1,
    col: 2,
    positionX: 910,
    positionY: 70,
    rotation: 0,
    mapVisible: true
  };

  layouts['SRV-01'] = {
    id: 'lay-SRV-01',
    systemId: 'SRV-01',
    zone: 'SERVER',
    deskId: 'RACK-SRV',
    row: 1,
    col: 1,
    positionX: 160,
    positionY: 70,
    rotation: 0,
    mapVisible: true
  };

  // LEFT ZONE: W001 to W015 (15 workstations)
  // Bay 1: W001-W005 (arranged vertically on desk Bay 1)
  for (let i = 1; i <= 5; i++) {
    const sid = `W${i.toString().padStart(3, '0')}`;
    layouts[sid] = {
      id: `lay-${sid}`,
      systemId: sid,
      zone: 'LEFT',
      deskId: 'DESK-L1',
      row: i,
      col: 1,
      positionX: 80,
      positionY: 140 + (i - 1) * 56,
      rotation: 0,
      mapVisible: true
    };
  }

  // Bay 2: W006-W010
  for (let i = 6; i <= 10; i++) {
    const sid = `W${i.toString().padStart(3, '0')}`;
    layouts[sid] = {
      id: `lay-${sid}`,
      systemId: sid,
      zone: 'LEFT',
      deskId: 'DESK-L2',
      row: i - 5,
      col: 1,
      positionX: 80,
      positionY: 450 + (i - 6) * 56,
      rotation: 0,
      mapVisible: true
    };
  }

  // Bay 3: W011-W015 (Parallel booth run)
  for (let i = 11; i <= 15; i++) {
    const sid = `W${i.toString().padStart(3, '0')}`;
    layouts[sid] = {
      id: `lay-${sid}`,
      systemId: sid,
      zone: 'LEFT',
      deskId: 'DESK-L3',
      row: i - 10,
      col: 2,
      positionX: 190,
      positionY: 450 + (i - 11) * 56,
      rotation: 0,
      mapVisible: true
    };
  }

  // CENTRE ZONE: W016 to W029 (14 workstations)
  // Continuous physical desk arrangement in the central area
  // West-facing row: W016 to W022 (7 workstations)
  for (let i = 16; i <= 22; i++) {
    const sid = `W${i.toString().padStart(3, '0')}`;
    layouts[sid] = {
      id: `lay-${sid}`,
      systemId: sid,
      zone: 'CENTER',
      deskId: 'DESK-C1',
      row: i - 15,
      col: 1,
      positionX: 420,
      positionY: 175 + (i - 16) * 74,
      rotation: 0,
      mapVisible: true
    };
  }

  // East-facing row: W023 to W029 (7 workstations)
  for (let i = 23; i <= 29; i++) {
    const sid = `W${i.toString().padStart(3, '0')}`;
    layouts[sid] = {
      id: `lay-${sid}`,
      systemId: sid,
      zone: 'CENTER',
      deskId: 'DESK-C2',
      row: i - 22,
      col: 2,
      positionX: 535,
      positionY: 175 + (i - 23) * 74,
      rotation: 0,
      mapVisible: true
    };
  }

  // RIGHT ZONE: W030 to W040 (11 workstations)
  // Middle-right area
  // Desk Bank R1: W030 to W035 (6 workstations)
  for (let i = 30; i <= 35; i++) {
    const sid = `W${i.toString().padStart(3, '0')}`;
    layouts[sid] = {
      id: `lay-${sid}`,
      systemId: sid,
      zone: 'RIGHT',
      deskId: 'DESK-R1',
      row: i - 29,
      col: 1,
      positionX: 775,
      positionY: 205 + (i - 30) * 74,
      rotation: 0,
      mapVisible: true
    };
  }

  // Desk Bank R2: Booths 36 to 40
  // Booth 36 has installed system W036. Booths 37 to 40 are Open Booth Slots (No system).
  for (let i = 36; i <= 40; i++) {
    const sid = `W${i.toString().padStart(3, '0')}`;
    const bid = `B${i.toString().padStart(3, '0')}`;
    const layoutItem = {
      id: `lay-${bid}`,
      systemId: i === 36 ? sid : bid,
      zone: 'RIGHT' as const,
      deskId: 'DESK-R2',
      row: i - 35,
      col: 2,
      positionX: 890,
      positionY: 205 + (i - 36) * 74,
      rotation: 0,
      mapVisible: true
    };
    layouts[sid] = layoutItem;
    layouts[bid] = layoutItem;
  }

  return layouts;
};

export const DEFAULT_SYSTEM_LAYOUTS = generateDefaultLayouts();


export const INITIAL_AUDITS: AuditRecord[] = [
  {
    id: 'AUD-2026-08-29-01',
    systemId: 'W001',
    systemName: '4960-T001',
    auditor: 'Lazeem M.',
    auditorRole: 'Lazeem',
    date: '2026-08-29 09:24',
    status: 'passed',
    checklist: [
      { id: 'chk-1', category: 'Physical & Peripherals', item: 'Keyboard, mouse, monitor, headset sanitized & functional', status: 'pass' },
      { id: 'chk-2', category: 'Display & Vision', item: 'Resolution 1920x1080 @ 60Hz, privacy screen aligned', status: 'pass' },
      { id: 'chk-3', category: 'Operating System', item: 'Windows 11 Home 23H2, no pending reboots, BitLocker verified', status: 'pass' },
      { id: 'chk-4', category: 'Exam Clients', item: 'CMA, Pearson VUE, PSI, CELPIP, ITTS launched & verified', status: 'pass' },
      { id: 'chk-5', category: 'Network & Security', item: 'VLAN 10 isolated, static IP mapped, latency < 2ms to gateway', status: 'pass' }
    ],
    notes: 'All 5 exam clients executed test suites with 0 latency deviations. Booth fully certified.',
    durationMinutes: 12
  },
  {
    id: 'AUD-2026-08-29-02',
    systemId: 'W002',
    systemName: '4960-T002',
    auditor: 'Lazeem M.',
    auditorRole: 'Lazeem',
    date: '2026-08-29 09:40',
    status: 'passed',
    checklist: [
      { id: 'chk-1', category: 'Physical & Peripherals', item: 'Keyboard, mouse, monitor, headset sanitized & functional', status: 'pass' },
      { id: 'chk-2', category: 'Display & Vision', item: 'Resolution 1920x1080 @ 60Hz, privacy screen aligned', status: 'pass' },
      { id: 'chk-3', category: 'Operating System', item: 'Windows 11 Home 23H2, no pending reboots, BitLocker verified', status: 'pass' },
      { id: 'chk-4', category: 'Exam Clients', item: 'CMA, Pearson VUE, PSI, CELPIP, ITTS launched & verified', status: 'pass' },
      { id: 'chk-5', category: 'Network & Security', item: 'VLAN 10 isolated, static IP mapped, latency < 2ms to gateway', status: 'pass' }
    ],
    notes: 'Webcam focus calibrated. All exam software verified.',
    durationMinutes: 10
  },
  {
    id: 'AUD-2026-08-29-03',
    systemId: 'W005',
    systemName: '4960-T005',
    auditor: 'Rahul K. Menon',
    auditorRole: 'IT Administrator',
    date: '2026-08-29 10:15',
    status: 'failed',
    checklist: [
      { id: 'chk-1', category: 'Physical & Peripherals', item: 'Keyboard, mouse, monitor, headset sanitized & functional', status: 'pass' },
      { id: 'chk-2', category: 'Display & Vision', item: 'Resolution 1920x1080 @ 60Hz, privacy screen aligned', status: 'pass' },
      { id: 'chk-3', category: 'Operating System', item: 'Windows 11 Home 23H2, no pending reboots, BitLocker verified', status: 'fail', notes: 'Disk I/O latency spike detected during BitLocker health check.' },
      { id: 'chk-4', category: 'Exam Clients', item: 'CMA, Pearson VUE, PSI, CELPIP, ITTS launched & verified', status: 'pass' },
      { id: 'chk-5', category: 'Network & Security', item: 'VLAN 10 isolated, static IP mapped, latency < 2ms to gateway', status: 'pass' }
    ],
    notes: 'System failed OS check due to disk SMART bad sector alerts. Ticket ISS-001 raised.',
    durationMinutes: 18
  },
  {
    id: 'AUD-2026-08-28-04',
    systemId: 'W027',
    systemName: '4960-T027',
    auditor: 'Ananya Varma',
    auditorRole: 'TCA',
    date: '2026-08-28 17:30',
    status: 'needs_attention',
    checklist: [
      { id: 'chk-1', category: 'Physical & Peripherals', item: 'Keyboard, mouse, monitor, headset sanitized & functional', status: 'pass' },
      { id: 'chk-2', category: 'Display & Vision', item: 'Resolution 1920x1080 @ 60Hz, privacy screen aligned', status: 'pass' },
      { id: 'chk-3', category: 'Operating System', item: 'Windows 11 Home 23H2, no pending reboots, BitLocker verified', status: 'pass' },
      { id: 'chk-4', category: 'Exam Clients', item: 'CMA, Pearson VUE, PSI, CELPIP, ITTS launched & verified', status: 'fail', notes: 'Pearson VUE client is outdated (v4.1.8 instead of v4.2.1).' },
      { id: 'chk-5', category: 'Network & Security', item: 'VLAN 10 isolated, static IP mapped, latency < 2ms to gateway', status: 'pass' }
    ],
    notes: 'Requires Pearson VUE update before next PV exam cycle.',
    durationMinutes: 15
  }
];

export const INITIAL_MAINTENANCE: MaintenanceRecord[] = [
  {
    id: 'MNT-001',
    title: 'Calicut Lab A Workstation RAM Upgrade & Dust Clean',
    type: 'upgrade',
    systemIds: ['W019', 'W020', 'W021', 'W022'],
    scheduledDate: '2026-09-02 18:00',
    status: 'scheduled',
    technician: 'Sreeram P.',
    description: 'Install secondary 8GB DDR4 DIMM modules (upgrading to 16GB) and compressed air cleaning of CPU heat sinks.',
    notes: 'Parts staged in workshop.'
  },
  {
    id: 'MNT-002',
    title: 'Monthly Network Switch Firmware & Port Security Audit',
    type: 'preventive',
    systemIds: ['SW-01', 'SW-02'],
    scheduledDate: '2026-09-05 20:00',
    status: 'scheduled',
    technician: 'Rahul K. Menon',
    description: 'Upgrade Cisco Catalyst 1000 IOS release and verify 802.1X sticky MAC limits.',
    notes: 'Requires 15 minute lab maintenance window.'
  },
  {
    id: 'MNT-003',
    title: 'Emergency SSD Clone & Replacement for W005',
    type: 'corrective',
    systemIds: ['W005'],
    scheduledDate: '2026-08-30 08:00',
    status: 'in_progress',
    technician: 'Sreeram P.',
    description: 'Hot-swap SSD, restore master testing image with Sysprep and register machine certificate.',
    notes: 'Target completion before 09:30 AM.'
  },
  {
    id: 'MNT-004',
    title: 'Bi-Weekly Sanitization & Headset Acoustic Calibration',
    type: 'preventive',
    systemIds: Array.from({ length: 40 }, (_, i) => `W${(i + 1).toString().padStart(3, '0')}`),
    scheduledDate: '2026-08-25 17:00',
    completedDate: '2026-08-25 19:30',
    status: 'completed',
    technician: 'Ananya Varma & Sreeram P.',
    description: 'Acoustic calibration on all 40 Jabra headsets using sound pressure analyzer. UV sanitation.',
    notes: 'Completed successfully. W033 was flagged for follow-up.'
  }
];

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'ALT-001',
    type: 'critical',
    title: 'W005: Hardware SSD degradation',
    message: 'Storage SMART reported bad sectors > threshold. Replace drive immediately.',
    systemId: 'W005',
    systemName: '4960-T005',
    entityType: 'system',
    entityId: 'W005',
    timestamp: '20 mins ago',
    read: false,
    resolved: false
  },
  {
    id: 'ALT-002',
    type: 'info',
    title: 'W012: Link restored & heartbeat verified',
    message: 'Workstation re-connected to port SW-01 #14. Diagnostics passed.',
    systemId: 'W012',
    systemName: '4960-T012',
    entityType: 'system',
    entityId: 'W012',
    timestamp: 'Just now',
    read: true,
    resolved: true
  },
  {
    id: 'ALT-003',
    type: 'attention',
    title: 'W027: Pearson VUE version mismatch',
    message: 'Running v4.1.8 instead of target 4.2.1. Update required before morning shift.',
    systemId: 'W027',
    systemName: '4960-T027',
    entityType: 'exam',
    entityId: 'pv',
    timestamp: '1 hour ago',
    read: false,
    resolved: false
  },
  {
    id: 'ALT-004',
    type: 'attention',
    title: 'W004: Windows update pending reboot',
    message: 'KB5034441 cumulative security patch installed and pending restart.',
    systemId: 'W004',
    systemName: '4960-T004',
    entityType: 'system',
    entityId: 'W004',
    timestamp: '2 hours ago',
    read: true,
    resolved: false
  },
  {
    id: 'ALT-005',
    type: 'info',
    title: 'Audits due for 4 workstations',
    message: 'Workstations W037, W038, W039, W040 have audits due (> 14 days).',
    entityType: 'audit',
    timestamp: '3 hours ago',
    read: true,
    resolved: false
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'NOT-001',
    title: 'Critical Hardware Alert Raised',
    description: 'Lazeem M. opened critical issue ISS-001 for W005 (SSD SMART).',
    category: 'issue',
    timestamp: '25 mins ago',
    read: false,
    link: '/issues/ISS-001'
  },
  {
    id: 'NOT-002',
    title: 'Audit Completed: W001',
    description: 'Lazeem M. passed comprehensive audit on Workstation 4960-T001.',
    category: 'audit',
    timestamp: '45 mins ago',
    read: false,
    link: '/audits'
  },
  {
    id: 'NOT-003',
    title: 'Asset Transfer Logged',
    description: 'MON-014 moved from W001 to W017 by Rahul K. Menon.',
    category: 'asset',
    timestamp: 'Yesterday at 11:10',
    read: true,
    link: '/assets'
  },
  {
    id: 'NOT-004',
    title: 'Exam Application Audit Done',
    description: 'Pearson VUE delivery audit: 38 Verified, 1 Attention, 1 Not Installed.',
    category: 'system',
    timestamp: 'Yesterday at 18:00',
    read: true,
    link: '/exams'
  }
];

export const INITIAL_SWITCHES: NetworkSwitch[] = [
  {
    id: 'SW-01',
    name: 'Lab A Core Switch 01',
    model: 'Cisco Catalyst C1000-24T-4G-L',
    ipAddress: '192.168.10.250',
    macAddress: 'F8:66:F2:1A:44:01',
    location: 'Rack 01 - Unit 4 (Top)',
    totalPorts: 24,
    ports: [
      { portNumber: 1, status: 'connected', connectedSystemId: 'ADM-01', connectedSystemName: '4960-ADM01', speed: '1000 Mbps', vlan: 10, poe: false },
      { portNumber: 2, status: 'connected', connectedSystemId: 'MW01', connectedSystemName: '4960-MW01', speed: '1000 Mbps', vlan: 10, poe: false },
      ...Array.from({ length: 20 }, (_, i) => {
        const num = (i + 1).toString().padStart(3, '0');
        return {
          portNumber: i + 3,
          status: 'connected' as const,
          connectedSystemId: `W${num}`,
          connectedSystemName: `4960-T${num}`,
          speed: '1000 Mbps',
          vlan: 10,
          poe: false
        };
      }),
      { portNumber: 23, status: 'empty', speed: 'N/A', vlan: 10, poe: false },
      { portNumber: 24, status: 'connected', connectedSystemId: 'SRV-01', connectedSystemName: '4960-SRV01 (Server Uplink)', speed: '10000 Mbps', vlan: 1, poe: false }
    ]
  },
  {
    id: 'SW-02',
    name: 'Lab A Distribution Switch 02',
    model: 'Cisco Catalyst C1000-24T-4G-L',
    ipAddress: '192.168.10.251',
    macAddress: 'F8:66:F2:1A:44:02',
    location: 'Rack 01 - Unit 6 (Bottom)',
    totalPorts: 24,
    ports: [
      ...Array.from({ length: 16 }, (_, i) => {
        const num = (i + 21).toString().padStart(3, '0');
        return {
          portNumber: i + 1,
          status: 'connected' as const,
          connectedSystemId: `W${num}`,
          connectedSystemName: `4960-T${num}`,
          speed: '1000 Mbps',
          vlan: 10,
          poe: false
        };
      }),
      { portNumber: 17, status: 'empty', speed: 'N/A', vlan: 10, poe: false },
      { portNumber: 18, status: 'empty', speed: 'N/A', vlan: 10, poe: false },
      { portNumber: 19, status: 'empty', speed: 'N/A', vlan: 10, poe: false },
      { portNumber: 20, status: 'empty', speed: 'N/A', vlan: 10, poe: false },
      { portNumber: 21, status: 'connected', connectedSystemName: 'CCTV Dome 01', speed: '100 Mbps', vlan: 50, poe: true },
      { portNumber: 22, status: 'connected', connectedSystemName: 'CCTV Dome 02', speed: '100 Mbps', vlan: 50, poe: true },
      { portNumber: 23, status: 'empty', speed: 'N/A', vlan: 10, poe: false },
      { portNumber: 24, status: 'connected', connectedSystemName: 'Trunk to SW-01', speed: '10000 Mbps', vlan: 1, poe: false }
    ]
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act-001',
    timestamp: 'Today, 09:24',
    actor: 'Lazeem M.',
    action: 'Audit Completed',
    category: 'audit',
    targetId: 'W001',
    targetName: '4960-T001',
    details: 'Completed comprehensive inspection. 5/5 checklist passed.'
  },
  {
    id: 'act-002',
    timestamp: 'Today, 05:18',
    actor: 'System Daemon',
    action: 'Status Change',
    category: 'system',
    targetId: 'W012',
    targetName: '4960-T012',
    details: 'Heartbeat lost. System marked Offline.'
  },
  {
    id: 'act-003',
    timestamp: 'Today, 04:15',
    actor: 'Lazeem M.',
    action: 'Issue Created',
    category: 'issue',
    targetId: 'W005',
    targetName: '4960-T005',
    details: 'Opened Critical issue ISS-001: SSD SMART bad sectors.'
  },
  {
    id: 'act-004',
    timestamp: '1 hour ago',
    actor: 'Ananya Varma',
    action: 'Exam Check',
    category: 'exam',
    targetId: 'pv',
    targetName: 'Pearson VUE',
    details: 'System application verification completed. 38/40 verified.'
  },
  {
    id: 'act-005',
    timestamp: '2 hours ago',
    actor: 'Vikram Mehta',
    action: 'Software Update',
    category: 'exam',
    targetId: 'W001',
    targetName: '4960-T001',
    details: 'Pearson VUE Athena client upgraded to v4.2.1.'
  },
  {
    id: 'act-006',
    timestamp: '29 Aug, 11:10',
    actor: 'Rahul K. Menon',
    action: 'Asset Transferred',
    category: 'asset',
    targetId: 'AST-MON-014',
    targetName: 'MON-014',
    details: 'Replaced monitor on W017 with spare from W001.'
  },
  {
    id: 'act-007',
    timestamp: '27 Aug, 14:40',
    actor: 'Sreeram P.',
    action: 'Issue Resolved',
    category: 'issue',
    targetId: 'ISS-005',
    targetName: 'W033 Audio Discrepancy',
    details: 'Replaced headset with AST-HED-041. CELPIP audio test passed.'
  },
  {
    id: 'act-008',
    timestamp: '25 Aug, 19:30',
    actor: 'Ananya Varma',
    action: 'Maintenance Completed',
    category: 'maintenance',
    targetId: 'MNT-004',
    targetName: 'Lab A Headset Calibration',
    details: 'Completed acoustic calibration on 40 Jabra headsets.'
  }
];

export const INITIAL_READINESS_RULES: ExamReadinessRule[] = [
  {
    id: 'rule-online',
    name: 'System Must Be Online',
    description: 'Workstation is responsive with active network link and status not offline.',
    enabled: true,
    ruleType: 'online'
  },
  {
    id: 'rule-app-installed',
    name: 'Exam Application Must Be Installed',
    description: 'The selected exam client package is present on the workstation.',
    enabled: true,
    ruleType: 'app_installed'
  },
  {
    id: 'rule-version-match',
    name: 'Latest Certified Client Version',
    description: 'Installed version matches or exceeds the mandatory vendor certified version.',
    enabled: true,
    ruleType: 'version_match'
  },
  {
    id: 'rule-ram-check',
    name: 'Minimum 8 GB RAM Verified',
    description: 'Workstation meets memory threshold required for exam lock-down sandbox.',
    enabled: true,
    ruleType: 'ram_check'
  },
  {
    id: 'rule-storage-check',
    name: 'Minimum 100 GB Storage Available',
    description: 'Sufficient disk capacity for temporary exam cache, logs, and video buffers.',
    enabled: true,
    ruleType: 'storage_check'
  },
  {
    id: 'rule-windows-ver',
    name: 'Approved Windows OS Build',
    description: 'Running 64-bit Windows 11 Home 22H2+ or Windows 11 Pro.',
    enabled: true,
    ruleType: 'windows_version'
  },
  {
    id: 'rule-peripherals',
    name: 'Required Peripherals Connected',
    description: 'Hardware assets for monitor, keyboard, mouse, camera, and headset assigned.',
    enabled: true,
    ruleType: 'peripherals'
  }
];

// Phase 7: Candidate Intake Records (Admission Manager & Registration Manager)
export const INITIAL_CANDIDATE_INTAKES: CandidateIntakeRecord[] = [
  {
    id: 'INT-4901',
    candidateRef: 'CAND-4901',
    candidateName: 'Rahul K. Nambiar',
    scheduledExamCode: 'CMA',
    scheduledExamName: 'CMA US - Part 1 Financial Reporting',
    scheduledTime: '09:00 AM',
    intakeStatus: 'in_exam',
    idDocumentType: 'Passport',
    idDocumentVerified: true,
    photoCaptured: true,
    biometricCaptured: true,
    signatureCaptured: true,
    lockerNumber: 'LKR-04',
    assignedBoothId: 'W002',
    assignedBoothNumber: 2,
    checkInTime: 'Today, 08:24 AM'
  },
  {
    id: 'INT-4902',
    candidateRef: 'CAND-4902',
    candidateName: 'Aiswarya Menon',
    scheduledExamCode: 'PV',
    scheduledExamName: 'AWS Certified Solutions Architect (PV)',
    scheduledTime: '09:15 AM',
    intakeStatus: 'in_exam',
    idDocumentType: 'National ID',
    idDocumentVerified: true,
    photoCaptured: true,
    biometricCaptured: true,
    signatureCaptured: true,
    lockerNumber: 'LKR-07',
    assignedBoothId: 'W005',
    assignedBoothNumber: 5,
    checkInTime: 'Today, 08:35 AM'
  },
  {
    id: 'INT-4903',
    candidateRef: 'CAND-4903',
    candidateName: 'Fahad Mohammed',
    scheduledExamCode: 'PSI',
    scheduledExamName: 'USMLE Step 1 Clinical Knowledge (PSI)',
    scheduledTime: '09:30 AM',
    intakeStatus: 'seat_assigned',
    idDocumentType: 'Passport',
    idDocumentVerified: true,
    photoCaptured: true,
    biometricCaptured: true,
    signatureCaptured: true,
    lockerNumber: 'LKR-12',
    assignedBoothId: 'W018',
    assignedBoothNumber: 18,
    checkInTime: 'Today, 09:02 AM',
    proctorNotes: 'Escorting candidate to Booth 18 for lockdown initialization'
  },
  {
    id: 'INT-4904',
    candidateRef: 'CAND-4904',
    candidateName: 'Sneha Rajeev',
    scheduledExamCode: 'CELPIP',
    scheduledExamName: 'CELPIP General English Examination',
    scheduledTime: '10:00 AM',
    intakeStatus: 'biometric_verified',
    idDocumentType: 'National ID',
    idDocumentVerified: true,
    photoCaptured: true,
    biometricCaptured: true,
    signatureCaptured: true,
    lockerNumber: 'LKR-15',
    checkInTime: 'Today, 09:18 AM'
  },
  {
    id: 'INT-4905',
    candidateRef: 'CAND-4905',
    candidateName: 'Adarsh P. Nair',
    scheduledExamCode: 'ITTS',
    scheduledExamName: 'ITTS Professional Licensure Test',
    scheduledTime: '10:30 AM',
    intakeStatus: 'photo_captured',
    idDocumentType: 'Driving License',
    idDocumentVerified: true,
    photoCaptured: true,
    biometricCaptured: false,
    signatureCaptured: false,
    checkInTime: 'Today, 09:25 AM'
  },
  {
    id: 'INT-4906',
    candidateRef: 'CAND-4906',
    candidateName: 'Meera V. Pillai',
    scheduledExamCode: 'CMA',
    scheduledExamName: 'CMA US - Part 2 Strategic Management',
    scheduledTime: '11:00 AM',
    intakeStatus: 'registered',
    idDocumentType: 'Passport',
    idDocumentVerified: true,
    photoCaptured: false,
    biometricCaptured: false,
    signatureCaptured: false,
    checkInTime: 'Today, 09:30 AM'
  }
];

// Phase 8: Synchronizer Telemetry (Division 2: Synchronizer)
export const INITIAL_SYNC_PACKAGES: SyncPayloadPackage[] = [
  {
    id: 'pkg-cma',
    examId: 'cma',
    examName: 'CMA US Examination Suite',
    vendor: 'Prometric / IMA',
    version: '3.4.0',
    packageSizeBytes: 1420000000,
    packageSizeFormatted: '1.42 GB',
    sha256Hash: 'a8f9c2d1e0b53498a72cf5021e149cb2407519e489c629ad276081e285a82ef0',
    cachedWorkstationsCount: 40,
    totalTargetWorkstations: 40,
    status: 'cached',
    lastSynchronizedAt: 'Today, 07:15 AM'
  },
  {
    id: 'pkg-pv',
    examId: 'pv',
    examName: 'Pearson VUE Secure Browser',
    vendor: 'Pearson VUE',
    version: '4.2.1',
    packageSizeBytes: 2180000000,
    packageSizeFormatted: '2.18 GB',
    sha256Hash: '4e7b1a99f6c0382901ef871b65e23901bca7624d081f9a1120ec591b72e18590',
    cachedWorkstationsCount: 38,
    totalTargetWorkstations: 40,
    status: 'delta_pending',
    lastSynchronizedAt: 'Today, 08:00 AM'
  },
  {
    id: 'pkg-psi',
    examId: 'psi',
    examName: 'PSI Bridge Secure Delivery',
    vendor: 'PSI Services',
    version: '2.1.0',
    packageSizeBytes: 980000000,
    packageSizeFormatted: '980 MB',
    sha256Hash: '810fa2bc4501289de6b91024fe8102381ab9c02e119401feaa8190302bf1481e',
    cachedWorkstationsCount: 40,
    totalTargetWorkstations: 40,
    status: 'cached',
    lastSynchronizedAt: 'Today, 07:45 AM'
  },
  {
    id: 'pkg-celpip',
    examId: 'celpip',
    examName: 'CELPIP Candidate Client',
    vendor: 'Paragon Testing / Prometric',
    version: '1.6.5',
    packageSizeBytes: 1120000000,
    packageSizeFormatted: '1.12 GB',
    sha256Hash: '19ab20cf8170295efb91024e819a71025a1e2049bf6102830e01290fe389271a',
    cachedWorkstationsCount: 40,
    totalTargetWorkstations: 40,
    status: 'cached',
    lastSynchronizedAt: 'Today, 07:30 AM'
  },
  {
    id: 'pkg-itts',
    examId: 'itts',
    examName: 'ITTS Secure Testing Engine',
    vendor: 'ITTS Delivery Network',
    version: '5.0.2',
    packageSizeBytes: 860000000,
    packageSizeFormatted: '860 MB',
    sha256Hash: 'f72b901a28cb019e58201fae29081e7401cba602819fe0281bca01284e90218f',
    cachedWorkstationsCount: 40,
    totalTargetWorkstations: 40,
    status: 'cached',
    lastSynchronizedAt: 'Today, 07:00 AM'
  }
];

export const INITIAL_SYNC_ROSTERS: SyncRosterJob[] = [
  {
    id: 'SYNC-RST-01',
    sponsor: 'Pearson VUE Cloud Central',
    sessionSlot: 'Slot 1 (09:00 - 13:00)',
    candidatesScheduled: 18,
    candidatesSynced: 18,
    status: 'synchronized',
    lastSyncTime: 'Today, 08:30 AM',
    nextScheduledSync: 'Today, 12:30 PM',
    securityHash: 'PV-RST-89A02B-VALID'
  },
  {
    id: 'SYNC-RST-02',
    sponsor: 'Prometric DeliverNet',
    sessionSlot: 'Slot 1 (09:00 - 13:00)',
    candidatesScheduled: 12,
    candidatesSynced: 12,
    status: 'synchronized',
    lastSyncTime: 'Today, 08:35 AM',
    nextScheduledSync: 'Today, 12:45 PM',
    securityHash: 'PROM-RST-144F2C-VALID'
  },
  {
    id: 'SYNC-RST-03',
    sponsor: 'PSI SecureSync',
    sessionSlot: 'Slot 2 (14:00 - 18:00)',
    candidatesScheduled: 8,
    candidatesSynced: 8,
    status: 'synchronized',
    lastSyncTime: 'Today, 08:40 AM',
    nextScheduledSync: 'Today, 13:00 PM',
    securityHash: 'PSI-RST-678B1A-VALID'
  },
  {
    id: 'SYNC-RST-04',
    sponsor: 'Paragon / CELPIP Central',
    sessionSlot: 'Slot 2 (14:00 - 17:30)',
    candidatesScheduled: 10,
    candidatesSynced: 6,
    status: 'in_progress',
    lastSyncTime: 'Today, 09:15 AM',
    nextScheduledSync: 'Today, 13:15 PM',
    securityHash: 'CEL-RST-PENDING-4'
  }
];

export const INITIAL_UPLOAD_QUEUE: CandidateUploadQueueItem[] = [
  {
    id: 'UPL-001',
    candidateRef: 'CAND-4814',
    workstationId: 'W014',
    examName: 'CMA US - Part 1',
    packageRef: 'PKG-CAND-4814-RESP.enc',
    fileSizeBytes: 14200000,
    fileSizeFormatted: '14.2 MB',
    encryptionStandard: 'AES-256-GCM',
    status: 'uploaded',
    uploadedAt: 'Today, 08:45 AM',
    queuedAt: 'Today, 08:43 AM',
    attemptCount: 1
  },
  {
    id: 'UPL-002',
    candidateRef: 'CAND-4820',
    workstationId: 'W020',
    examName: 'Pearson VUE AWS Solutions Architect',
    packageRef: 'PKG-CAND-4820-RESP.enc',
    fileSizeBytes: 28400000,
    fileSizeFormatted: '28.4 MB',
    encryptionStandard: 'RSA-4096 / AES-256',
    status: 'uploaded',
    uploadedAt: 'Today, 09:05 AM',
    queuedAt: 'Today, 09:04 AM',
    attemptCount: 1
  },
  {
    id: 'UPL-003',
    candidateRef: 'CAND-4808',
    workstationId: 'W008',
    examName: 'PSI USMLE Step 1 - Block 1',
    packageRef: 'PKG-CAND-4808-RESP.enc',
    fileSizeBytes: 42100000,
    fileSizeFormatted: '42.1 MB',
    encryptionStandard: 'AES-256-GCM',
    status: 'transmitting',
    queuedAt: 'Today, 09:28 AM',
    attemptCount: 1
  }
];

// Phase 9: Official Audit Certifications
export const INITIAL_AUDIT_CERTIFICATIONS: AuditCertificationSpec[] = [
  {
    id: 'CERT-PVTC-4960',
    sponsorName: 'Pearson VUE Authorized Test Centre',
    accreditationTitle: 'PVTC-Select High-Stakes Certification',
    certificationNumber: 'PVTC-IND-CAL-4960-A1',
    validUntil: '31 December 2027',
    leadAuditor: 'Vikram Sengupta (Senior Regional Quality Assurance Inspector)',
    tcaSignOff: 'Lazeem M. (Certified Chief TCA #8849)',
    itAdminSignOff: 'Ananya Varma (Certified Systems Engineer)',
    inspectionDate: 'Today, 10 September 2026',
    overallScore: 100,
    status: 'compliant',
    requirements: [
      {
        category: 'Network & Connectivity',
        description: 'Dual dedicated ISP connections with automatic hardware failover gateway',
        standard: 'Primary >= 500 Mbps, Backup >= 100 Mbps, Latency < 45ms',
        passed: true,
        measuredValue: 'JIO Leased Line (1 Gbps) + Airtel Fiber (300 Mbps), 14ms latency'
      },
      {
        category: 'Workstation Hardware & OS',
        description: 'Approved Windows 11 Home 64-bit builds with 8 GB RAM and >= 100 GB SSD storage',
        standard: 'Lockdown sandbox compatibility, USB port lockouts active',
        passed: true,
        measuredValue: 'Intel Core i5-10400 / i3-10100, 8 GB DDR4, 128 GB SSD across all candidate nodes'
      },
      {
        category: 'Physical Booth & Sightlines',
        description: 'Minimum 1.2m booth partition separation, unobstructed proctor glass view, ergonomic chair',
        standard: '40 Physical booths with acoustic acoustic privacy panels',
        passed: true,
        measuredValue: '40 Booths in Calicut Testing Hall A with privacy divider baffles'
      },
      {
        category: 'Division 2 Admin Stations',
        description: 'Dedicated ProAdmin, Admission Manager, Synchronizer, and Registration Manager stations',
        standard: 'Segregated proctoring PCs (ADM-01 & MW01) with biometric and photo intake hardware',
        passed: true,
        measuredValue: 'ADM-01 and MW01 configured with digital signature pad, HD webcam, and fingerprint scanner'
      },
      {
        category: 'Power & Physical Security',
        description: 'Online double-conversion UPS backup guaranteeing 60+ minutes runtime on utility loss',
        standard: 'Zero cutover switch time (< 0ms online inverter transfer)',
        passed: true,
        measuredValue: 'APC Galaxy 15 kVA Online 3-Phase UPS with diesel generator backup'
      },
      {
        category: 'Candidate Intake & Lockers',
        description: 'Individual keyless electronic lockboxes and metal-free testing zone isolation',
        standard: 'Secure locker room adjacent to intake desk',
        passed: true,
        measuredValue: '48 Secure keyless lockers (LKR-01 to LKR-48) with registration voucher matching'
      }
    ]
  },
  {
    id: 'CERT-PROM-4960',
    sponsorName: 'Prometric Premier Testing Facility',
    accreditationTitle: 'Prometric Global Quality Benchmark Level 1',
    certificationNumber: 'PROM-QAC-4960-2026',
    validUntil: '15 August 2027',
    leadAuditor: 'Kavitha Swaminathan (Audit Lead, South Asia)',
    tcaSignOff: 'Lazeem M. (Chief Administrator)',
    itAdminSignOff: 'Ananya Varma (IT Systems Specialist)',
    inspectionDate: 'Today, 10 September 2026',
    overallScore: 100,
    status: 'compliant',
    requirements: [
      {
        category: 'DeliverNet Synchronizer',
        description: 'Synchronizer daemon active on Master Admin workstation with encrypted peer-caching',
        standard: 'Local SHA-256 package verification before scheduled testing window',
        passed: true,
        measuredValue: 'Synchronizer v2.9.1 verified with 100% test payload cache'
      },
      {
        category: 'Surveillance & Audio Recording',
        description: 'Full-room HD CCTV continuous NVR recording with 90-day retention and audio pickup',
        standard: 'Zero blind spots across all 40 candidate stations',
        passed: true,
        measuredValue: '8x 4K Hikvision wide-angle dome cameras covering all seating rows'
      },
      {
        category: 'ProAdmin Station',
        description: 'Master proctor workstation running ProAdmin with candidate control and timer override',
        standard: 'Real-time session pausing, incident logging, and extra time authorization',
        passed: true,
        measuredValue: 'ProAdmin v5.2.0 installed on ADM-01 with dual-monitor proctor setup'
      }
    ]
  }
];
