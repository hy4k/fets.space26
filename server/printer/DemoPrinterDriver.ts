import {
  PrinterMonitoringProvider,
  ReachabilityResult
} from './PrinterMonitoringProvider';
import {
  PrinterTelemetry,
  PortProbeResult,
  MonitoringProviderType,
  PrinterState,
  DeviceHealthStatus,
  PrinterNetworkStatus
} from './types';

export class DemoPrinterDriver implements PrinterMonitoringProvider {
  public readonly providerType: MonitoringProviderType = 'MOCK_DEMO';
  public readonly name = 'HP Laser MFP 1188fnw Emulation Driver';

  private simulatedState: PrinterState = 'READY';
  private tonerPercent: number = 74;
  private totalPages: number = 4280;
  private currentJob: string | null = null;
  private queueCount: number = 0;

  public setSimulatedState(state: PrinterState): void {
    this.simulatedState = state;
    if (state === 'PRINTING') {
      this.currentJob = 'CMA_US_Candidate_Roster_Shift_1.pdf';
      this.queueCount = 2;
    } else {
      this.currentJob = null;
      this.queueCount = 0;
    }
  }

  public getSimulatedState(): PrinterState {
    return this.simulatedState;
  }

  public async checkReachability(ipAddress: string, ports = [9100, 80, 631]): Promise<ReachabilityResult> {
    if (this.simulatedState === 'UNKNOWN' && ipAddress === '0.0.0.0') {
      return {
        isReachable: false,
        responseTimeMs: null,
        portProbes: ports.map((p) => ({
          port: p,
          service: p === 9100 ? 'RAW' : p === 80 ? 'HTTP' : 'IPP',
          open: false,
          responseTimeMs: null,
          error: 'Connection refused'
        })),
        error: 'Device not responding'
      };
    }

    const probes: PortProbeResult[] = [
      {
        port: 9100,
        service: 'RAW / JetDirect Print Stream',
        open: true,
        responseTimeMs: 3
      },
      {
        port: 80,
        service: 'HTTP / Embedded Web Server (EWS)',
        open: true,
        responseTimeMs: 5
      },
      {
        port: 631,
        service: 'IPP / Internet Printing Protocol',
        open: true,
        responseTimeMs: 4
      }
    ];

    return {
      isReachable: true,
      responseTimeMs: 4,
      portProbes: probes
    };
  }

  public async fetchTelemetry(ipAddress: string): Promise<PrinterTelemetry> {
    const nowIso = new Date().toISOString();

    let healthStatus: DeviceHealthStatus = 'HEALTHY';
    let networkStatus: PrinterNetworkStatus = 'CONNECTED';
    const errorMessages: string[] = [];
    let maintenanceAlert: string | null = null;
    let trayStatus: 'READY' | 'EMPTY' | 'JAMMED' | 'OPEN' | 'UNKNOWN' = 'READY';

    switch (this.simulatedState) {
      case 'PRINTING':
        healthStatus = 'HEALTHY';
        break;
      case 'PAPER_EMPTY':
        healthStatus = 'ATTENTION';
        trayStatus = 'EMPTY';
        errorMessages.push('Tray 1 is empty. Load A4 plain paper to resume printing.');
        maintenanceAlert = 'Replenish Paper Tray 1 with 80 g/m² A4 sheets.';
        break;
      case 'PAPER_JAM':
        healthStatus = 'CRITICAL';
        trayStatus = 'JAMMED';
        errorMessages.push('Paper jam in internal cartridge transfer area. Open front door and clear media.');
        maintenanceAlert = 'Clear Paper Jam in feed roller assembly.';
        break;
      case 'DOOR_OPEN':
        healthStatus = 'ATTENTION';
        trayStatus = 'OPEN';
        errorMessages.push('Front access cover is open. Close cover securely.');
        break;
      case 'TONER_LOW':
        healthStatus = 'ATTENTION';
        errorMessages.push('Toner cartridge is very low (Estimated <10%). Order replacement HP 108A.');
        maintenanceAlert = 'Have spare toner W1108A ready at Examination Control Desk.';
        break;
      case 'MAINTENANCE':
        healthStatus = 'ATTENTION';
        maintenanceAlert = 'Scheduled 5,000-page roller inspection due.';
        break;
      case 'READY':
      default:
        healthStatus = 'HEALTHY';
        break;
    }

    const tonerVal = this.simulatedState === 'TONER_LOW' ? 8 : this.tonerPercent;

    return {
      id: 'PRN-1188',
      centreId: 'centre-calicut',
      name: 'HP Laser MFP 1188fnw (Control Room)',
      manufacturer: 'HP',
      model: 'Laser MFP 1188fnw',
      serialNumber: 'CNB1M82914',
      firmwareVersion: 'V3.82.01.14',
      hostname: 'HP1188FNW-2991',
      ipAddress,
      macAddress: '70:85:C2:29:91:AA',
      location: 'Examination Control Desk / Proctor Room',
      room: 'Control Room 1',
      webInterfaceUrl: `http://${ipAddress}`,
      healthStatus,
      networkStatus,
      printerState: this.simulatedState,
      isLive: false, // Marked false in demo driver to distinguish from real physical device
      monitoringMode: 'DEMO_ONLY',
      provider: this.providerType,
      responseTimeMs: 4,
      consecutiveFailures: 0,
      consecutiveSuccesses: 24,
      lastSuccessfulPollAt: nowIso,
      lastFailedPollAt: null,
      lastCheckedAt: nowIso,
      dataFreshnessSeconds: 0,
      portProbes: [
        {
          port: 9100,
          service: 'RAW / JetDirect Print Stream',
          open: true,
          responseTimeMs: 3
        },
        {
          port: 80,
          service: 'HTTP / Embedded Web Server (EWS)',
          open: true,
          responseTimeMs: 5
        },
        {
          port: 631,
          service: 'IPP / Internet Printing Protocol',
          open: true,
          responseTimeMs: 4
        }
      ],
      toner: {
        name: 'HP 108A Black Original Laser Toner (W1108A)',
        type: 'TONER',
        levelPercent: tonerVal,
        status: tonerVal <= 10 ? 'LOW' : 'OK',
        modelCode: 'W1108A',
        estimatedPagesRemaining: Math.round((tonerVal / 100) * 1500)
      },
      drum: null, // Integrated into HP 1108A cartridge
      trays: [
        {
          trayIndex: 1,
          name: 'Tray 1 (Standard 150-Sheet Input)',
          status: trayStatus,
          mediaSize: 'A4 (210 x 297 mm)',
          mediaType: 'Plain Paper (80 g/m²)',
          capacitySheets: 150
        }
      ],
      outputTrayStatus: 'READY',
      queueLength: this.queueCount,
      currentJobName: this.currentJob,
      totalPageCount: this.totalPages,
      errorMessages,
      maintenanceAlert
    };
  }

  public async sendTestJob(ipAddress: string, title = 'FETS SPACE System Test Token'): Promise<{ success: boolean; message: string; jobId?: string }> {
    this.totalPages += 1;
    this.simulatedState = 'PRINTING';
    this.currentJob = title;
    this.queueCount = 1;

    setTimeout(() => {
      this.simulatedState = 'READY';
      this.currentJob = null;
      this.queueCount = 0;
    }, 4000);

    return {
      success: true,
      message: `Test token queued for transmission to ${ipAddress} (Simulated Demo Mode).`,
      jobId: `TEST-${Date.now().toString().slice(-5)}`
    };
  }
}
