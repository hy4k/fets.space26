import { NetworkPrinterDriver } from './printer/NetworkPrinterDriver';
import { DemoPrinterDriver } from './printer/DemoPrinterDriver';
import {
  PrinterTelemetry,
  PrinterMonitoringConfig,
  PrinterActivityEvent,
  PortProbeResult,
  PrinterState
} from './printer/types';
import { domainStore } from './domainStore';

class PrinterMonitorService {
  private config: PrinterMonitoringConfig = {
    printerId: 'PRN-1188',
    ipAddress: '192.168.29.91',
    name: 'HP Laser MFP 1188fnw',
    location: 'Examination Control Desk / Proctor Room',
    room: 'Control Room 1',
    monitoringEnabled: true,
    monitoringMode: 'AUTO',
    pollIntervalSeconds: 5,
    probePorts: [9100, 80, 631],
    consecutiveFailureThreshold: 3
  };

  private networkDriver = new NetworkPrinterDriver();
  private demoDriver = new DemoPrinterDriver();

  private currentTelemetry: PrinterTelemetry | null = null;
  private pollTimer: NodeJS.Timeout | null = null;
  private isPolling = false;
  private activityLogs: PrinterActivityEvent[] = [];
  private listeners: Set<(data: PrinterTelemetry) => void> = new Set();

  constructor() {
    this.initDefaultTelemetry();
    this.initActivityHistory();
    this.startPolling();
  }

  private initDefaultTelemetry() {
    const nowIso = new Date().toISOString();
    this.currentTelemetry = {
      id: 'PRN-1188',
      centreId: 'centre-calicut',
      name: 'HP Laser MFP 1188fnw (Control Room)',
      manufacturer: 'HP',
      model: 'Laser MFP 1188fnw',
      serialNumber: 'CNB1M82914',
      firmwareVersion: 'V3.82.01.14',
      hostname: 'HP1188FNW-2991',
      ipAddress: this.config.ipAddress,
      macAddress: '70:85:C2:29:91:AA',
      location: this.config.location,
      room: this.config.room,
      webInterfaceUrl: `http://${this.config.ipAddress}`,
      healthStatus: 'HEALTHY',
      networkStatus: 'CONNECTED',
      printerState: 'READY',
      isLive: false,
      monitoringMode: this.config.monitoringMode,
      provider: 'MOCK_DEMO',
      responseTimeMs: 4,
      consecutiveFailures: 0,
      consecutiveSuccesses: 1,
      lastSuccessfulPollAt: nowIso,
      lastFailedPollAt: null,
      lastCheckedAt: nowIso,
      dataFreshnessSeconds: 0,
      portProbes: [
        { port: 9100, service: 'RAW / JetDirect Print Stream', open: true, responseTimeMs: 3 },
        { port: 80, service: 'HTTP / Embedded Web Server (EWS)', open: true, responseTimeMs: 5 },
        { port: 631, service: 'IPP / Internet Printing Protocol', open: true, responseTimeMs: 4 }
      ],
      toner: {
        name: 'HP 108A Black Original Laser Toner (W1108A)',
        type: 'TONER',
        levelPercent: 78,
        status: 'OK',
        modelCode: 'W1108A',
        estimatedPagesRemaining: 1170
      },
      drum: null,
      trays: [
        {
          trayIndex: 1,
          name: 'Tray 1 (Standard 150-Sheet Input)',
          status: 'READY',
          mediaSize: 'A4 (210 x 297 mm)',
          mediaType: 'Plain Paper (80 g/m²)',
          capacitySheets: 150
        }
      ],
      outputTrayStatus: 'READY',
      queueLength: 0,
      currentJobName: null,
      totalPageCount: 4218,
      errorMessages: [],
      maintenanceAlert: null
    };
  }

  private initActivityHistory() {
    const now = Date.now();
    this.activityLogs = [
      {
        id: `PRN-ACT-${now - 3600000}`,
        timestamp: new Date(now - 3600000).toISOString(),
        eventType: 'REACHABLE',
        severity: 'INFO',
        title: 'Printer Online & Standby',
        description: 'Device connected via Ethernet at 192.168.29.91. Link 100 Mbps Full-Duplex.',
        ipAddress: this.config.ipAddress
      },
      {
        id: `PRN-ACT-${now - 1800000}`,
        timestamp: new Date(now - 1800000).toISOString(),
        eventType: 'PRINT_JOB',
        severity: 'INFO',
        title: 'Morning Attendance Roster Printed',
        description: 'Successfully processed 14 pages from Proctor Console (4960-PROCTOR-01).',
        ipAddress: this.config.ipAddress
      }
    ];
  }

  public subscribe(listener: (data: PrinterTelemetry) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    if (!this.currentTelemetry) return;
    for (const listener of this.listeners) {
      try {
        listener(this.currentTelemetry);
      } catch (err) {
        console.error('Printer telemetry notification error:', err);
      }
    }
  }

  public getConfig(): PrinterMonitoringConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<PrinterMonitoringConfig>): PrinterMonitoringConfig {
    this.config = { ...this.config, ...updates };
    this.logActivity(
      'CONFIG_UPDATED',
      'INFO',
      'Printer Configuration Updated',
      `Target IP: ${this.config.ipAddress}, Mode: ${this.config.monitoringMode}`
    );
    this.pollDevice();
    return this.getConfig();
  }

  public getTelemetry(): PrinterTelemetry {
    if (!this.currentTelemetry) {
      this.initDefaultTelemetry();
    }
    // Update data freshness calculation
    if (this.currentTelemetry && this.currentTelemetry.lastCheckedAt) {
      this.currentTelemetry.dataFreshnessSeconds = Math.max(
        0,
        Math.floor((Date.now() - new Date(this.currentTelemetry.lastCheckedAt).getTime()) / 1000)
      );
    }
    return this.currentTelemetry!;
  }

  public getActivityLogs(limit = 20): PrinterActivityEvent[] {
    return this.activityLogs.slice(0, limit);
  }

  private logActivity(
    eventType: PrinterActivityEvent['eventType'],
    severity: PrinterActivityEvent['severity'],
    title: string,
    description: string
  ) {
    const entry: PrinterActivityEvent = {
      id: `PRN-ACT-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      eventType,
      severity,
      title,
      description,
      ipAddress: this.config.ipAddress
    };
    this.activityLogs.unshift(entry);
    if (this.activityLogs.length > 100) this.activityLogs.pop();
  }

  public startPolling() {
    if (this.pollTimer) clearInterval(this.pollTimer);
    this.pollDevice();
    this.pollTimer = setInterval(() => {
      this.pollDevice();
    }, this.config.pollIntervalSeconds * 1000);
  }

  public stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  public async pollDevice(): Promise<PrinterTelemetry> {
    if (this.isPolling) return this.getTelemetry();
    this.isPolling = true;

    try {
      const mode = this.config.monitoringMode;

      if (mode === 'LIVE_ONLY') {
        const liveData = await this.networkDriver.fetchTelemetry(this.config.ipAddress);
        this.updateTelemetryState(liveData);
      } else if (mode === 'DEMO_ONLY') {
        const demoData = await this.demoDriver.fetchTelemetry(this.config.ipAddress);
        this.updateTelemetryState(demoData);
      } else {
        // AUTO Mode: Attempt fast TCP reachability probe to real physical device first
        const reachability = await this.networkDriver.checkReachability(
          this.config.ipAddress,
          this.config.probePorts,
          1500
        );

        if (reachability.isReachable) {
          const liveData = await this.networkDriver.fetchTelemetry(this.config.ipAddress);
          this.updateTelemetryState(liveData);
        } else {
          // Physical printer not reachable from this environment (e.g. cloud preview container)
          // Fall back gracefully to high-fidelity demo driver so users can see full HP 1188fnw telemetry
          const demoData = await this.demoDriver.fetchTelemetry(this.config.ipAddress);
          this.updateTelemetryState(demoData);
        }
      }
    } catch (err: unknown) {
      console.error('Error polling printer:', err);
    } finally {
      this.isPolling = false;
    }

    return this.getTelemetry();
  }

  private updateTelemetryState(newData: PrinterTelemetry) {
    const prevState = this.currentTelemetry?.printerState;
    const prevHealth = this.currentTelemetry?.healthStatus;

    this.currentTelemetry = newData;

    // Detect state changes and log activity / alert domain store
    if (prevState && prevState !== newData.printerState) {
      const severity =
        newData.printerState === 'PAPER_JAM' || newData.printerState === 'ERROR'
          ? 'CRITICAL'
          : newData.printerState === 'PAPER_EMPTY' || newData.printerState === 'TONER_LOW'
          ? 'WARNING'
          : 'INFO';

      this.logActivity(
        'STATE_CHANGED',
        severity,
        `Printer State Changed to ${newData.printerState}`,
        newData.errorMessages[0] || `Printer status transitioned from ${prevState} to ${newData.printerState}.`
      );

      // Propagate critical/warning alert to FETS SPACE domain store
      if (severity === 'CRITICAL' || severity === 'WARNING') {
        domainStore.recordPrinterAlert(
          newData.id,
          newData.name,
          newData.printerState,
          newData.errorMessages[0] || `Printer attention required: ${newData.printerState}`,
          severity.toLowerCase() as 'warning' | 'critical'
        );
      }
    }

    this.notify();
  }

  /**
   * Diagnostic probe on demand
   */
  public async probeDevice(ipAddress?: string, ports?: number[]): Promise<PortProbeResult[]> {
    const targetIp = ipAddress || this.config.ipAddress;
    const targetPorts = ports || this.config.probePorts;
    const reachability = await this.networkDriver.checkReachability(targetIp, targetPorts, 3000);
    
    this.logActivity(
      'REACHABLE',
      reachability.isReachable ? 'INFO' : 'WARNING',
      `Manual Port Diagnostic Sweep for ${targetIp}`,
      reachability.isReachable
        ? `Open Ports: ${reachability.portProbes.filter((p) => p.open).map((p) => p.port).join(', ')} (${reachability.responseTimeMs}ms)`
        : 'All targeted ports closed or timed out.'
    );

    return reachability.portProbes;
  }

  /**
   * Send test print
   */
  public async sendTestPrint(): Promise<{ success: boolean; message: string; jobId?: string }> {
    const isRealLive = this.currentTelemetry?.isLive;
    let res: { success: boolean; message: string; jobId?: string };

    if (isRealLive) {
      res = await this.networkDriver.sendTestJob(this.config.ipAddress, 'FETS SPACE System Test Print');
    } else {
      res = await this.demoDriver.sendTestJob(this.config.ipAddress, 'FETS SPACE System Test Print (Simulated)');
    }

    this.logActivity(
      'TEST_PRINT',
      res.success ? 'INFO' : 'WARNING',
      'Diagnostic Test Print Triggered',
      res.message
    );

    // Refresh telemetry
    setTimeout(() => this.pollDevice(), 1000);
    return res;
  }

  /**
   * Simulate a specific hardware state for testing alerts
   */
  public async simulateState(state: PrinterState): Promise<PrinterTelemetry> {
    this.demoDriver.setSimulatedState(state);
    if (this.config.monitoringMode === 'LIVE_ONLY') {
      this.config.monitoringMode = 'DEMO_ONLY';
    }
    const fresh = await this.demoDriver.fetchTelemetry(this.config.ipAddress);
    this.updateTelemetryState(fresh);
    return fresh;
  }
}

export const printerMonitor = new PrinterMonitorService();
