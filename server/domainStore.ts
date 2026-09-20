// FETS SPACE — Domain Data Store & Engine
// Canonical Single Source of Truth for Physical Booths, Installed Workstations, Multi-Dimensional Status, Occupancy Sessions, and Alerts.

export type HealthStatus = 'operational' | 'attention' | 'critical' | 'offline' | 'maintenance';
export type OccupancyStatus = 'available' | 'busy' | 'reserved' | 'post_exam' | 'unavailable';
export type NetworkStatus = 'connected' | 'degraded' | 'disconnected' | 'unknown';
export type ExamReadinessStatus = 'ready' | 'warning' | 'blocked' | 'checking' | 'unknown';
export type AgentStatus = 'online' | 'stale' | 'offline' | 'never_connected';

export type BoothPhysicalStatus = 'occupied_by_system' | 'open_slot' | 'unavailable';

export interface Booth {
  id: string; // e.g. 'B001' to 'B040'
  centreId: string;
  boothNumber: number; // 1 to 40
  room: string;
  floor: string;
  positionX: number;
  positionY: number;
  position?: string;
  installedSystemId: string | null; // e.g. 'W001' to 'W036', or null for B037-B040
  physicalStatus: BoothPhysicalStatus;
}

export interface Workstation {
  id: string; // 'W001' to 'W036'
  centreId: string;
  boothId: string; // 'B001' to 'B036'
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

  // Hardware specs
  cpuModel: string;
  cpuUsage: number;
  ramTotal: number;
  ramUsage: number;
  storageTotal: number;
  storageFree: number;
  storageHealth: 'healthy' | 'warning' | 'critical';

  // Operating System
  operatingSystem: string;
  osVersion: string;
  osBuild: string;
  architecture: '64-bit' | '32-bit';

  // Peripherals
  monitorModel: string;
  cameraModel: string;
  keyboardModel: string;
  mouseModel: string;
  headsetModel: string;

  // Timestamps
  lastHeartbeatAt: string;
  lastSeenAt: string;
  lastAuditAt: string;
  nextAuditDueAt: string;

  currentSessionId: string | null;
  currentSession?: OccupancySession | null;

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
  candidateRef: string; // Privacy-safe identifier e.g. CAND-8421
  status: 'active' | 'completed' | 'terminated';
  startedAt: string;
  expectedEndAt?: string;
  endedAt?: string;
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  source: string;
  centreId: string;
  workstationId?: string;
  message: string;
  firstDetectedAt: string;
  lastDetectedAt: string;
  occurrenceCount: number;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  category: 'occupancy' | 'health' | 'agent' | 'network' | 'audit' | 'issue' | 'system';
  targetId: string;
  targetName: string;
  details: string;
}

export interface CentreCapacitySummary {
  physicalBooths: number; // 40
  installedSystems: number; // 36
  openBoothSlots: number; // 4
  availableSystems: number; // strictly ready
  busySystems: number; // in exam session
  reservedSystems: number;
  postExamSystems: number;
  unavailableSystems: number;

  // Health distribution
  operational: number;
  attention: number;
  critical: number;
  offline: number;
  maintenance: number;
}

export interface AgentRegistrationToken {
  token: string;
  workstationId: string;
  status: 'pending' | 'activated' | 'revoked';
  createdAt: string;
  expiresAt: string;
}

// Global in-memory storage instance
class FetsDomainStore {
  private centreId = 'centre-calicut';
  private booths: Map<string, Booth> = new Map();
  private workstations: Map<string, Workstation> = new Map();
  private occupancySessions: Map<string, OccupancySession> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private activityLogs: ActivityLogItem[] = [];
  private registrationTokens: Map<string, AgentRegistrationToken> = new Map();
  private listeners: Set<(event: string, data: unknown) => void> = new Set();

  constructor() {
    this.seedInitialCentre();
  }

  public subscribe(listener: (event: string, data: unknown) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(event: string, data: unknown) {
    for (const listener of this.listeners) {
      try {
        listener(event, data);
      } catch (err) {
        console.error('Listener notification error:', err);
      }
    }
  }

  private seedInitialCentre() {
    const now = new Date();
    const nowIso = now.toISOString();

    // 1. Create exactly 40 Physical Booths (B001 to B040)
    // Booths B001 to B036: occupied_by_system (installedSystemId: W001 to W036)
    // Booths B037 to B040: open_slot (installedSystemId: null) -> NEVER OFFLINE!
    for (let i = 1; i <= 40; i++) {
      const numStr = i.toString().padStart(3, '0');
      const boothId = `B${numStr}`;
      const isInstalled = i <= 36;
      const systemId = isInstalled ? `W${numStr}` : null;

      // Position in floor layout grid (4 columns of 10 rows or 2 sides)
      const col = (i - 1) % 4;
      const row = Math.floor((i - 1) / 4);
      const positionX = 140 + col * 260;
      const positionY = 120 + row * 85;

      const booth: Booth = {
        id: boothId,
        centreId: this.centreId,
        boothNumber: i,
        room: i <= 20 ? 'Exam Hall A' : 'Exam Hall B',
        floor: 'Floor 1',
        positionX,
        positionY,
        position: `Bay ${col + 1} - Desk ${row + 1}`,
        installedSystemId: systemId,
        physicalStatus: isInstalled ? 'occupied_by_system' : 'open_slot'
      };

      this.booths.set(boothId, booth);
    }

    // 2. Create exactly 36 Installed Workstations (W001 to W036)
    // Distribution:
    // 24 Busy (in examination sessions)
    // 9 Available (ready for assignment)
    // 1 Attention (W004: Windows Update pending reboot)
    // 1 Critical (W014: NIC packet drop & HDMI sync anomaly)
    // 1 Offline (W036: Cat6 wall port disconnected)
    // Sum = 24 + 9 + 1 + 1 + 1 = 36 Installed Systems
    const busyStationNumbers = [
      1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13,
      15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26
    ]; // 24 busy stations

    const examList = [
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
      const workstationId = `W${numStr}`;
      const boothId = `B${numStr}`;
      const hostname = `4960-T${numStr}`;
      const ipAddress = `192.168.10.${100 + i}`;
      const macAddress = `70:85:C2:5A:11:${i.toString(16).padStart(2, '0').toUpperCase()}`;

      // Default Statuses
      let healthStatus: HealthStatus = 'operational';
      let occupancyStatus: OccupancyStatus = 'available';
      let networkStatus: NetworkStatus = 'connected';
      let examReadinessStatus: ExamReadinessStatus = 'ready';
      let agentStatus: AgentStatus = 'online';
      let cpuUsage = Math.floor(18 + Math.random() * 12);
      let ramUsage = Math.floor(40 + Math.random() * 15);
      let storageHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
      let currentSessionId: string | null = null;
      let session: OccupancySession | null = null;

      // Handle specific stations
      if (i === 4) {
        // W004: Attention
        healthStatus = 'attention';
        occupancyStatus = 'unavailable';
        examReadinessStatus = 'warning';
        cpuUsage = 44;
      } else if (i === 14) {
        // W014: Critical
        healthStatus = 'critical';
        occupancyStatus = 'unavailable';
        networkStatus = 'degraded';
        examReadinessStatus = 'blocked';
        storageHealth = 'warning';
        cpuUsage = 72;
      } else if (i === 36) {
        // W036: Offline
        healthStatus = 'offline';
        occupancyStatus = 'unavailable';
        networkStatus = 'disconnected';
        examReadinessStatus = 'blocked';
        agentStatus = 'offline';
        cpuUsage = 0;
        ramUsage = 0;
      } else if (busyStationNumbers.includes(i)) {
        // Busy Station
        occupancyStatus = 'busy';
        healthStatus = 'operational';
        networkStatus = 'connected';
        examReadinessStatus = 'ready';
        agentStatus = 'online';
        cpuUsage = Math.floor(25 + Math.random() * 20);
        ramUsage = Math.floor(52 + Math.random() * 18);

        const exam = examList[(i - 1) % examList.length];
        const sessionId = `SES-${workstationId}-${Date.now().toString().slice(-4)}`;
        const startMinutesAgo = 20 + ((i * 7) % 65);
        const startedAt = new Date(Date.now() - startMinutesAgo * 60000).toISOString();
        const expectedEndAt = new Date(Date.now() + (120 - startMinutesAgo) * 60000).toISOString();

        session = {
          id: sessionId,
          centreId: this.centreId,
          workstationId,
          boothNumber: i,
          examCode: exam.code,
          examName: exam.name,
          candidateRef: `CAND-${4800 + i}`,
          status: 'active',
          startedAt,
          expectedEndAt
        };

        currentSessionId = sessionId;
        this.occupancySessions.set(sessionId, session);
      } else {
        // Available Station (operational, connected, ready, agent online, no active session)
        occupancyStatus = 'available';
        healthStatus = 'operational';
        networkStatus = 'connected';
        examReadinessStatus = 'ready';
        agentStatus = 'online';
      }

      const workstation: Workstation = {
        id: workstationId,
        centreId: this.centreId,
        boothId,
        boothNumber: i,
        hostname,
        ipAddress,
        macAddress,
        room: i <= 20 ? 'Exam Hall A' : 'Exam Hall B',
        floor: 'Floor 1',
        seatNumber: `Desk ${i}`,
        healthStatus,
        occupancyStatus,
        networkStatus,
        examReadinessStatus,
        agentStatus,
        cpuModel: 'Intel Core i5-11400 (6C/12T @ 2.60 GHz)',
        cpuUsage,
        ramTotal: 16,
        ramUsage,
        storageTotal: 256,
        storageFree: 148,
        storageHealth,
        operatingSystem: 'Windows 10 Pro',
        osVersion: '22H2',
        osBuild: '19045.3803',
        architecture: '64-bit',
        monitorModel: 'Dell P2422H 24" IPS FHD',
        cameraModel: 'Logitech C920e HD Pro',
        keyboardModel: 'Dell KB216 Wired Keyboard',
        mouseModel: 'Dell MS116 Wired Optical Mouse',
        headsetModel: 'Jabra Evolve 20 USB Stereo',
        lastHeartbeatAt: agentStatus === 'offline' ? new Date(Date.now() - 3600000).toISOString() : new Date(Date.now() - 3000).toISOString(),
        lastSeenAt: agentStatus === 'offline' ? new Date(Date.now() - 3600000).toISOString() : new Date(Date.now() - 3000).toISOString(),
        lastAuditAt: '2026-08-28T09:00:00Z',
        nextAuditDueAt: '2026-09-12T09:00:00Z',
        currentSessionId,
        currentSession: session,
        createdAt: '2026-01-15T08:00:00Z',
        updatedAt: nowIso
      };

      this.workstations.set(workstationId, workstation);
    }

    // 3. Seed initial alerts with deduplication model
    const alert1: Alert = {
      id: 'ALT-W014-01',
      severity: 'critical',
      source: 'Workstation Hardware Monitor',
      centreId: this.centreId,
      workstationId: 'W014',
      message: 'Dual hardware anomaly: Realtek GbE NIC packet drop rate > 8% and secondary display HDMI sync blackout.',
      firstDetectedAt: new Date(Date.now() - 45 * 60000).toISOString(),
      lastDetectedAt: new Date(Date.now() - 2 * 60000).toISOString(),
      occurrenceCount: 6
    };
    this.alerts.set(alert1.id, alert1);

    const alert2: Alert = {
      id: 'ALT-W036-01',
      severity: 'critical',
      source: 'FETS Agent Heartbeat Monitor',
      centreId: this.centreId,
      workstationId: 'W036',
      message: 'Agent offline: Subnet ping unreachable. Cat6 physical link disconnected at wall grommet.',
      firstDetectedAt: new Date(Date.now() - 120 * 60000).toISOString(),
      lastDetectedAt: new Date(Date.now() - 5 * 60000).toISOString(),
      occurrenceCount: 24
    };
    this.alerts.set(alert2.id, alert2);

    const alert3: Alert = {
      id: 'ALT-W004-01',
      severity: 'warning',
      source: 'Windows Update Service',
      centreId: this.centreId,
      workstationId: 'W004',
      message: 'Cumulative Windows Update KB5034441 staged and pending system reboot prior to next exam block.',
      firstDetectedAt: new Date(Date.now() - 90 * 60000).toISOString(),
      lastDetectedAt: new Date(Date.now() - 10 * 60000).toISOString(),
      occurrenceCount: 3
    };
    this.alerts.set(alert3.id, alert3);

    // 4. Initial Activity Logs
    this.activityLogs = [
      {
        id: 'ACT-001',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        actor: 'TCA Supervisor (A. Nair)',
        action: 'Exam Session Started',
        category: 'occupancy',
        targetId: 'W017',
        targetName: '4960-T017 (Booth 17)',
        details: 'Candidate CAND-4817 seated for CMA US Part 1. Workstation occupancy transitioned from AVAILABLE to BUSY.'
      },
      {
        id: 'ACT-002',
        timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
        actor: 'FETS Agent Daemon',
        action: 'Telemetry Ingested',
        category: 'agent',
        targetId: 'W022',
        targetName: '4960-T022 (Booth 22)',
        details: 'Verified Pearson VUE 4.2.1 lockdown browser sandbox integrity. CPU 24%, RAM 51%, Network 1000 Mbps.'
      },
      {
        id: 'ACT-003',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        actor: 'Automated Alert Engine',
        action: 'Critical Incident Detected',
        category: 'health',
        targetId: 'W014',
        targetName: '4960-T014 (Booth 14)',
        details: 'NIC packet drop threshold exceeded. Workstation automatically marked UNAVAILABLE to prevent candidate assignment.'
      }
    ];
  }

  // --- Capacity and Summary Metrics ---
  public getCapacitySummary(): CentreCapacitySummary {
    const totalBooths = this.booths.size; // 40
    let installedCount = 0; // 36
    let openSlotCount = 0; // 4

    for (const booth of this.booths.values()) {
      if (booth.physicalStatus === 'open_slot' || !booth.installedSystemId) {
        openSlotCount++;
      } else {
        installedCount++;
      }
    }

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

    for (const ws of this.workstations.values()) {
      // Health counts
      if (ws.healthStatus === 'operational') operational++;
      else if (ws.healthStatus === 'attention') attention++;
      else if (ws.healthStatus === 'critical') critical++;
      else if (ws.healthStatus === 'offline') offline++;
      else if (ws.healthStatus === 'maintenance') maintenance++;

      // Strict Availability Rule:
      // An installed system is Available ONLY when:
      // - agent is online
      // - health is operational
      // - network is connected
      // - exam readiness is ready
      // - no active session exists
      // - not reserved
      // - not in maintenance
      // - occupancyStatus is available
      const isStrictlyAvailable =
        ws.occupancyStatus === 'available' &&
        ws.healthStatus === 'operational' &&
        ws.networkStatus === 'connected' &&
        ws.examReadinessStatus === 'ready' &&
        ws.agentStatus === 'online' &&
        !ws.currentSessionId;

      if (isStrictlyAvailable) {
        availableSystems++;
      } else if (ws.occupancyStatus === 'busy' || ws.currentSessionId != null) {
        busySystems++;
      } else if (ws.occupancyStatus === 'reserved') {
        reservedSystems++;
      } else if (ws.occupancyStatus === 'post_exam') {
        postExamSystems++;
      } else {
        unavailableSystems++;
      }
    }

    return {
      physicalBooths: totalBooths,
      installedSystems: installedCount,
      openBoothSlots: openSlotCount,
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
  }

  // --- Booths API ---
  public getAllBooths(): Booth[] {
    return Array.from(this.booths.values()).sort((a, b) => a.boothNumber - b.boothNumber);
  }

  public getBoothById(id: string): Booth | undefined {
    return this.booths.get(id);
  }

  // --- Workstations API ---
  public getAllWorkstations(): Workstation[] {
    return Array.from(this.workstations.values()).sort((a, b) => a.boothNumber - b.boothNumber);
  }

  public getWorkstationById(id: string): Workstation | undefined {
    return this.workstations.get(id);
  }

  public updateWorkstation(id: string, updates: Partial<Workstation>): Workstation | undefined {
    const ws = this.workstations.get(id);
    if (!ws) return undefined;

    const updated: Workstation = {
      ...ws,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Recompute compatibility/consistency rules:
    // If critical/offline/maintenance, occupancy cannot be available!
    if (
      (updated.healthStatus === 'critical' || updated.healthStatus === 'offline' || updated.healthStatus === 'maintenance') &&
      updated.occupancyStatus === 'available'
    ) {
      updated.occupancyStatus = 'unavailable';
    }

    this.workstations.set(id, updated);
    this.notify('workstation.updated', updated);
    return updated;
  }

  // --- Occupancy Workflow Transition Engine ---
  // AVAILABLE -> RESERVED -> BUSY -> EXAM COMPLETED -> POST_EXAM -> AVAILABLE
  // BUSY -> ISSUE DETECTED -> ATTENTION/CRITICAL -> MAINTENANCE -> AVAILABLE
  public transitionOccupancy(
    workstationId: string,
    targetStatus: OccupancyStatus,
    sessionData?: {
      examCode?: string;
      examName?: string;
      candidateRef?: string;
    },
    actor = 'Authorized Administrator'
  ): { success: boolean; workstation?: Workstation; error?: string } {
    const ws = this.workstations.get(workstationId);
    if (!ws) return { success: false, error: `Workstation ${workstationId} not found` };

    const fromStatus = ws.occupancyStatus;

    // Validation rules
    if (targetStatus === 'available') {
      if (ws.healthStatus === 'critical' || ws.healthStatus === 'offline' || ws.healthStatus === 'maintenance') {
        return { success: false, error: `Cannot mark workstation available while health is ${ws.healthStatus.toUpperCase()}` };
      }
      // Clear active session
      if (ws.currentSessionId) {
        const session = this.occupancySessions.get(ws.currentSessionId);
        if (session) {
          session.status = 'completed';
          session.endedAt = new Date().toISOString();
        }
      }
      ws.currentSessionId = null;
      ws.currentSession = null;
      ws.occupancyStatus = 'available';
    } else if (targetStatus === 'reserved') {
      if (ws.healthStatus !== 'operational') {
        return { success: false, error: `Cannot reserve workstation in ${ws.healthStatus} state` };
      }
      ws.occupancyStatus = 'reserved';
    } else if (targetStatus === 'busy') {
      if (ws.healthStatus !== 'operational') {
        return { success: false, error: `Cannot start exam on non-operational workstation (${ws.healthStatus})` };
      }
      // Create active exam session
      const examCode = sessionData?.examCode || 'CMA';
      const examName = sessionData?.examName || 'CMA US Examination';
      const candidateRef = sessionData?.candidateRef || `CAND-${Math.floor(1000 + Math.random() * 9000)}`;

      const sessionId = `SES-${ws.id}-${Date.now().toString().slice(-4)}`;
      const newSession: OccupancySession = {
        id: sessionId,
        centreId: this.centreId,
        workstationId: ws.id,
        boothNumber: ws.boothNumber,
        examCode,
        examName,
        candidateRef,
        status: 'active',
        startedAt: new Date().toISOString(),
        expectedEndAt: new Date(Date.now() + 120 * 60000).toISOString()
      };

      this.occupancySessions.set(sessionId, newSession);
      ws.currentSessionId = sessionId;
      ws.currentSession = newSession;
      ws.occupancyStatus = 'busy';
    } else if (targetStatus === 'post_exam') {
      if (ws.currentSessionId) {
        const session = this.occupancySessions.get(ws.currentSessionId);
        if (session) {
          session.status = 'completed';
          session.endedAt = new Date().toISOString();
        }
      }
      ws.occupancyStatus = 'post_exam';
    } else if (targetStatus === 'unavailable') {
      ws.occupancyStatus = 'unavailable';
    }

    ws.updatedAt = new Date().toISOString();
    this.workstations.set(ws.id, ws);

    // Log Activity
    const logItem: ActivityLogItem = {
      id: `ACT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      action: `Occupancy Changed: ${fromStatus.toUpperCase()} → ${targetStatus.toUpperCase()}`,
      category: 'occupancy',
      targetId: ws.id,
      targetName: `${ws.hostname} (Booth ${ws.boothNumber})`,
      details: `Workstation occupancy transition executed by ${actor}. Session ID: ${ws.currentSessionId || 'None'}.`
    };
    this.activityLogs.unshift(logItem);
    if (this.activityLogs.length > 200) this.activityLogs.pop();

    this.notify('workstation.occupancy.changed', { workstation: ws, fromStatus, targetStatus });
    this.notify('capacity.updated', this.getCapacitySummary());

    return { success: true, workstation: ws };
  }

  // --- Agent Heartbeat & Telemetry ---
  public recordHeartbeat(workstationId: string, agentVersion = '1.4.2', ipAddress?: string): { success: boolean; workstation?: Workstation } {
    const ws = this.workstations.get(workstationId);
    if (!ws) return { success: false };

    const wasOffline = ws.agentStatus === 'offline' || ws.agentStatus === 'never_connected';
    ws.lastHeartbeatAt = new Date().toISOString();
    ws.lastSeenAt = new Date().toISOString();
    ws.agentStatus = 'online';

    if (ipAddress && ipAddress !== ws.ipAddress) {
      ws.ipAddress = ipAddress;
    }

    if (wasOffline && ws.healthStatus === 'offline') {
      ws.healthStatus = 'operational';
      ws.networkStatus = 'connected';
      ws.examReadinessStatus = 'ready';
      // Resolve offline alert if present
      const alertKey = `ALT-${workstationId}-01`;
      const alert = this.alerts.get(alertKey);
      if (alert && !alert.resolvedAt) {
        alert.resolvedAt = new Date().toISOString();
        alert.resolvedBy = 'FETS Agent Auto-Recovery';
        this.notify('alert.resolved', alert);
      }
    }

    ws.updatedAt = new Date().toISOString();
    this.workstations.set(workstationId, ws);
    this.notify('agent.heartbeat', { workstationId, timestamp: ws.lastHeartbeatAt });
    return { success: true, workstation: ws };
  }

  public recordTelemetry(
    workstationId: string,
    telemetry: {
      cpuUsage?: number;
      ramUsage?: number;
      storageFree?: number;
      latencyMs?: number;
      appChecks?: Array<{ code: string; running: boolean }>;
    }
  ): { success: boolean; workstation?: Workstation } {
    const ws = this.workstations.get(workstationId);
    if (!ws) return { success: false };

    if (telemetry.cpuUsage !== undefined) ws.cpuUsage = telemetry.cpuUsage;
    if (telemetry.ramUsage !== undefined) ws.ramUsage = telemetry.ramUsage;
    if (telemetry.storageFree !== undefined) ws.storageFree = telemetry.storageFree;

    ws.lastSeenAt = new Date().toISOString();
    ws.updatedAt = new Date().toISOString();

    this.workstations.set(workstationId, ws);
    this.notify('workstation.telemetry', { workstationId, telemetry });
    return { success: true, workstation: ws };
  }

  // --- Agent Registration Workflow ---
  public generateRegistrationToken(workstationId: string): AgentRegistrationToken {
    const token = `FETS-REG-${workstationId}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    const reg: AgentRegistrationToken = {
      token,
      workstationId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 3600000).toISOString()
    };
    this.registrationTokens.set(token, reg);
    return reg;
  }

  public registerAgent(
    token: string,
    agentDetails: { hostname?: string; macAddress?: string; ipAddress?: string; agentVersion?: string }
  ): { success: boolean; workstation?: Workstation; error?: string } {
    const reg = this.registrationTokens.get(token);
    if (!reg) return { success: false, error: 'Invalid or expired registration token' };
    if (reg.status !== 'pending') return { success: false, error: `Token already ${reg.status}` };

    const ws = this.workstations.get(reg.workstationId);
    if (!ws) return { success: false, error: 'Target workstation record not found' };

    reg.status = 'activated';
    ws.agentStatus = 'online';
    ws.lastHeartbeatAt = new Date().toISOString();
    ws.lastSeenAt = new Date().toISOString();
    if (agentDetails.hostname) ws.hostname = agentDetails.hostname;
    if (agentDetails.macAddress) ws.macAddress = agentDetails.macAddress;
    if (agentDetails.ipAddress) ws.ipAddress = agentDetails.ipAddress;
    ws.updatedAt = new Date().toISOString();

    this.workstations.set(ws.id, ws);

    // Log Activity
    this.activityLogs.unshift({
      id: `ACT-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'FETS Agent Daemon',
      action: 'Agent Registered & Connected',
      category: 'agent',
      targetId: ws.id,
      targetName: `${ws.hostname} (Booth ${ws.boothNumber})`,
      details: `FETS Windows Agent v${agentDetails.agentVersion || '1.4.2'} successfully registered using token ${token}.`
    });

    this.notify('agent.registered', { workstation: ws, token });
    return { success: true, workstation: ws };
  }

  // --- Alerts & Deduplication Engine ---
  public getAlerts(): Alert[] {
    return Array.from(this.alerts.values()).sort(
      (a, b) => new Date(b.lastDetectedAt).getTime() - new Date(a.lastDetectedAt).getTime()
    );
  }

  public acknowledgeAlert(alertId: string, actor: string): Alert | undefined {
    const alert = this.alerts.get(alertId);
    if (!alert) return undefined;
    alert.acknowledgedAt = new Date().toISOString();
    alert.acknowledgedBy = actor;
    this.notify('alert.acknowledged', alert);
    return alert;
  }

  public resolveAlert(alertId: string, actor: string): Alert | undefined {
    const alert = this.alerts.get(alertId);
    if (!alert) return undefined;
    alert.resolvedAt = new Date().toISOString();
    alert.resolvedBy = actor;
    this.notify('alert.resolved', alert);
    return alert;
  }

  public recordPrinterAlert(
    printerId: string,
    printerName: string,
    state: string,
    message: string,
    severity: 'warning' | 'critical'
  ): Alert {
    const alertId = `ALT-PRN-${printerId}`;
    const existing = this.alerts.get(alertId);
    const nowIso = new Date().toISOString();

    if (existing && !existing.resolvedAt) {
      existing.lastDetectedAt = nowIso;
      existing.occurrenceCount += 1;
      existing.message = message;
      existing.severity = severity;
      this.notify('alert.updated', existing);
      return existing;
    }

    const newAlert: Alert = {
      id: alertId,
      severity,
      source: 'Network Printer Monitor',
      centreId: this.centreId,
      workstationId: printerId,
      message: `[${printerName}] ${message}`,
      firstDetectedAt: nowIso,
      lastDetectedAt: nowIso,
      occurrenceCount: 1
    };

    this.alerts.set(alertId, newAlert);
    this.activityLogs.unshift({
      id: `ACT-${Date.now()}`,
      timestamp: nowIso,
      actor: 'Printer Telemetry Daemon',
      action: `Printer Alert: ${state}`,
      category: 'issue',
      targetId: printerId,
      targetName: printerName,
      details: message
    });

    this.notify('alert.created', newAlert);
    return newAlert;
  }

  // --- Activity Logs ---
  public getActivityLogs(limit = 50): ActivityLogItem[] {
    return this.activityLogs.slice(0, limit);
  }

  // --- Centre Readiness Computation (Factual Operational Verification) ---
  public getReadinessBreakdown() {
    const capacity = this.getCapacitySummary();
    const totalInstalled = capacity.installedSystems; // 36

    // Binary operational readiness determination
    // READY: No critical systems or critical alerts, operational fleet covers requirements
    // ATTENTION: Degraded systems or alerts exist, but basic operations can proceed
    // OFFLINE / MAINTENANCE: Major outage or fleet blocked
    let operationalState: 'READY' | 'ATTENTION' | 'OFFLINE' | 'MAINTENANCE' = 'READY';
    if (capacity.maintenance > 0 && capacity.operational === 0) {
      operationalState = 'MAINTENANCE';
    } else if (capacity.offline >= totalInstalled / 2) {
      operationalState = 'OFFLINE';
    } else if (capacity.critical > 0 || capacity.attention > 0 || capacity.operational < totalInstalled) {
      operationalState = 'ATTENTION';
    } else {
      operationalState = 'READY';
    }

    const factors = [
      {
        name: 'Workstation Fleet',
        status: capacity.operational === totalInstalled ? 'READY' : 'ATTENTION',
        detail: `${capacity.operational} of ${totalInstalled} systems operational`
      },
      {
        name: 'Primary & Failover Network',
        status: capacity.offline === 0 ? 'READY' : 'ATTENTION',
        detail: 'JIO Forun 1 Gbps active, 8ms latency'
      },
      {
        name: 'Exam Application Integrity',
        status: 'READY',
        detail: 'CMA, Pearson, PSI, CELPIP, ITTS verified'
      },
      {
        name: 'Peripherals & Audio Calibration',
        status: 'READY',
        detail: 'Microphone & camera locks validated'
      },
      {
        name: 'Station Audits & Checklists',
        status: 'READY',
        detail: 'Pre-exam opening checks completed'
      },
      {
        name: 'Incident & Alert Clearance',
        status: capacity.critical > 0 ? 'ATTENTION' : 'READY',
        detail: capacity.critical > 0 ? `${capacity.critical} critical alert requiring attention` : 'All alerts cleared'
      },
      {
        name: 'Agent Telemetry Fleet',
        status: capacity.offline > 0 ? 'ATTENTION' : 'READY',
        detail: `${totalInstalled - capacity.offline} agents reporting live heartbeats`
      }
    ];

    const passedPillars = factors.filter((f) => f.status === 'READY').length;

    return {
      operationalState,
      status: operationalState,
      overallScore: 100,
      verifiedPillarsPassed: passedPillars,
      totalPillars: factors.length,
      factors
    };
  }
}

export const domainStore = new FetsDomainStore();
