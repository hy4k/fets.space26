import path from 'path';
import {
  PrinterSettingsConfig,
  PrintProtocol,
  PrintJob,
  PrintJobStatus,
  ConnectionTestResult,
  QueueStatus,
  PrinterActivityEvent
} from './types';
import {
  PrinterTransportProvider,
  JobSubmissionResult,
  CancelJobResult
} from './PrinterTransportProvider';
import { RawTcpPrinterProvider } from './RawTcpPrinterProvider';
import { IppPrinterProvider } from './IppPrinterProvider';
import { LpdPrinterProvider } from './LpdPrinterProvider';

type SSEListener = (event: { type: string; data: unknown }) => void;

export class PrinterService {
  private static instance: PrinterService | null = null;

  private config: PrinterSettingsConfig = {
    printerName: 'Network Printer (Admin Office)',
    manufacturer: 'HP',
    model: 'HP Laser MFP 1188fnw',
    ipAddress: '192.168.29.91',
    connectionType: 'Ethernet',
    printProtocol: 'RAW',
    port: 9100,
    enabled: true,
    pollIntervalSeconds: 30,
    location: 'Admin Office',
    room: 'Admin Block 1'
  };

  private providers: Record<PrintProtocol, PrinterTransportProvider>;
  private jobs: PrintJob[] = [];
  private listeners: Set<SSEListener> = new Set();
  private activityLogs: PrinterActivityEvent[] = [];

  private constructor() {
    this.providers = {
      RAW: new RawTcpPrinterProvider(),
      IPP: new IppPrinterProvider(),
      LPD: new LpdPrinterProvider()
    };
  }

  public static getInstance(): PrinterService {
    if (!PrinterService.instance) {
      PrinterService.instance = new PrinterService();
    }
    return PrinterService.instance;
  }

  public getConfig(): PrinterSettingsConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<PrinterSettingsConfig>): PrinterSettingsConfig {
    if (newConfig.printProtocol && ['RAW', 'IPP', 'LPD'].includes(newConfig.printProtocol)) {
      this.config.printProtocol = newConfig.printProtocol;
      // Adjust default port if protocol changed and port was not explicitly set
      if (!newConfig.port) {
        if (newConfig.printProtocol === 'RAW') this.config.port = 9100;
        else if (newConfig.printProtocol === 'IPP') this.config.port = 631;
        else if (newConfig.printProtocol === 'LPD') this.config.port = 515;
      }
    }

    if (newConfig.port !== undefined && typeof newConfig.port === 'number') {
      this.config.port = newConfig.port;
    }

    if (newConfig.ipAddress) {
      this.config.ipAddress = newConfig.ipAddress.trim();
    }

    if (newConfig.printerName) this.config.printerName = newConfig.printerName.trim();
    if (newConfig.manufacturer) this.config.manufacturer = newConfig.manufacturer.trim();
    if (newConfig.model) this.config.model = newConfig.model.trim();
    if (newConfig.enabled !== undefined) this.config.enabled = !!newConfig.enabled;
    if (newConfig.pollIntervalSeconds) this.config.pollIntervalSeconds = Number(newConfig.pollIntervalSeconds);
    if (newConfig.location) this.config.location = newConfig.location.trim();
    if (newConfig.room) this.config.room = newConfig.room.trim();

    this.logActivity('CONFIG_UPDATED', 'INFO', 'Printer Configuration Updated', `Protocol set to ${this.config.printProtocol} (Port ${this.config.port})`);
    this.broadcast('printer.updated', { config: this.config });

    return this.getConfig();
  }

  public getProvider(protocol: PrintProtocol = this.config.printProtocol): PrinterTransportProvider {
    return this.providers[protocol] || this.providers.RAW;
  }

  public subscribe(listener: SSEListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private broadcast(type: string, data: unknown): void {
    for (const listener of this.listeners) {
      try {
        listener({ type, data });
      } catch {
        // Ignore dead listener
      }
    }
  }

  public logActivity(
    eventType: PrinterActivityEvent['eventType'],
    severity: 'INFO' | 'WARNING' | 'CRITICAL',
    title: string,
    description: string
  ): void {
    const entry: PrinterActivityEvent = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      eventType,
      severity,
      title,
      description,
      ipAddress: this.config.ipAddress
    };
    this.activityLogs.unshift(entry);
    if (this.activityLogs.length > 200) {
      this.activityLogs.pop();
    }
  }

  public getActivityLogs(limit = 50): PrinterActivityEvent[] {
    return this.activityLogs.slice(0, limit);
  }

  /**
   * Real connection test to printer using specified or active protocol
   */
  public async testConnection(protocolOverride?: PrintProtocol, portOverride?: number): Promise<ConnectionTestResult> {
    const protocol = protocolOverride || this.config.printProtocol;
    const port = portOverride || (protocolOverride ? (protocolOverride === 'RAW' ? 9100 : protocolOverride === 'IPP' ? 631 : 515) : this.config.port);
    const provider = this.getProvider(protocol);

    const result = await provider.testConnection(this.config.ipAddress, port, 3000);

    if (result.success) {
      this.logActivity(
        'REACHABLE',
        'INFO',
        'Printer Connection Test Succeeded',
        `Successfully connected to ${this.config.ipAddress}:${port} via ${protocol} in ${result.responseTimeMs}ms`
      );
    } else {
      this.logActivity(
        'UNREACHABLE',
        'WARNING',
        'Printer Connection Test Failed',
        `Connection failed to ${this.config.ipAddress}:${port} via ${protocol}: ${result.details}`
      );
    }

    return result;
  }

  /**
   * Submit a FETS SPACE Connection Test Page
   */
  public async printTestPage(submittedBy = 'Admin', userRole = 'IT_ADMIN'): Promise<{
    success: boolean;
    job: PrintJob;
    result: JobSubmissionResult;
  }> {
    const protocol = this.config.printProtocol;
    const port = this.config.port;
    const provider = this.getProvider(protocol);

    const jobId = `PJ-${new Date().getFullYear()}-${String(this.jobs.length + 1).padStart(4, '0')}`;
    const timestamp = new Date().toISOString();

    const job: PrintJob = {
      id: jobId,
      printerId: 'PRN-1188',
      submittedBy,
      userRole,
      fileName: 'FETS_Test_Page.pdf',
      fileSize: 1024,
      fileType: 'pdf',
      copies: 1,
      paperSize: 'A4',
      orientation: 'PORTRAIT',
      status: 'SUBMITTED',
      protocol,
      submittedAt: timestamp
    };

    this.jobs.unshift(job);
    this.broadcast('printjob.created', { job });

    // Build standard PJL / text test document payload
    const testPageContent = this.generateTestPageStream(jobId, submittedBy);
    const startTime = Date.now();

    const submissionResult = await provider.submitJob(
      this.config.ipAddress,
      port,
      job,
      testPageContent,
      8000
    );

    const duration = Math.round((Date.now() - startTime) / 1000);
    job.durationSeconds = duration;

    if (submissionResult.success) {
      job.status = submissionResult.status; // 'ACCEPTED'
      job.acceptedAt = new Date().toISOString();
      job.remoteJobId = submissionResult.remoteJobId;

      this.logActivity(
        'TEST_PRINT',
        'INFO',
        'Test Page Printed',
        `Test page ${jobId} accepted by HP Laser MFP 1188fnw via ${protocol}:${port}`
      );
      this.broadcast('printjob.accepted', { job, submissionResult });
    } else {
      job.status = 'FAILED';
      job.failedAt = new Date().toISOString();
      job.errorMessage = submissionResult.error || submissionResult.message;

      this.logActivity(
        'PRINT_JOB',
        'CRITICAL',
        'Test Print Failed',
        `Test print ${jobId} failed on HP Laser MFP 1188fnw (${protocol}:${port}): ${job.errorMessage}`
      );
      this.broadcast('printjob.failed', { job, submissionResult });
    }

    return {
      success: submissionResult.success,
      job,
      result: submissionResult
    };
  }

  /**
   * Submit an uploaded document for printing
   */
  public async printDocument(params: {
    fileBuffer: Buffer;
    fileName: string;
    fileSize: number;
    fileType: string;
    copies: number;
    paperSize?: string;
    orientation?: 'PORTRAIT' | 'LANDSCAPE';
    submittedBy: string;
    userRole: string;
  }): Promise<{
    success: boolean;
    job: PrintJob;
    result: JobSubmissionResult;
  }> {
    const {
      fileBuffer,
      fileName,
      fileSize,
      fileType,
      copies,
      paperSize = 'A4',
      orientation = 'PORTRAIT',
      submittedBy,
      userRole
    } = params;

    // Security validation: Validate PDF MIME/magic bytes
    const cleanFileName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_');
    if (!cleanFileName.toLowerCase().endsWith('.pdf')) {
      throw new Error('Security Error: Only PDF documents (.pdf) are allowed for printing');
    }

    if (fileBuffer.length < 5 || fileBuffer.toString('ascii', 0, 5) !== '%PDF-') {
      throw new Error('Validation Error: File does not contain valid PDF magic header (%PDF-)');
    }

    const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB limit
    if (fileBuffer.length > MAX_SIZE_BYTES) {
      throw new Error(`File size (${(fileBuffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds 20MB limit`);
    }

    const validCopies = Math.max(1, Math.min(99, Math.floor(copies || 1)));

    const protocol = this.config.printProtocol;
    const port = this.config.port;
    const provider = this.getProvider(protocol);

    const jobId = `PJ-${new Date().getFullYear()}-${String(this.jobs.length + 1).padStart(4, '0')}`;
    const timestamp = new Date().toISOString();

    const job: PrintJob = {
      id: jobId,
      printerId: 'PRN-1188',
      submittedBy: submittedBy || 'Operator',
      userRole,
      fileName: cleanFileName,
      fileSize: fileBuffer.length,
      fileType: 'pdf',
      copies: validCopies,
      paperSize,
      orientation,
      status: 'SUBMITTED',
      protocol,
      submittedAt: timestamp
    };

    this.jobs.unshift(job);
    this.broadcast('printjob.created', { job });

    const startTime = Date.now();
    const submissionResult = await provider.submitJob(
      this.config.ipAddress,
      port,
      job,
      fileBuffer,
      15000
    );

    const duration = Math.round((Date.now() - startTime) / 1000);
    job.durationSeconds = duration;

    if (submissionResult.success) {
      job.status = submissionResult.status; // 'ACCEPTED'
      job.acceptedAt = new Date().toISOString();
      job.remoteJobId = submissionResult.remoteJobId;

      this.logActivity(
        'PRINT_JOB',
        'INFO',
        'Document Submitted to Printer',
        `Document "${cleanFileName}" (${validCopies} copy) accepted by HP 1188fnw via ${protocol}:${port}`
      );
      this.broadcast('printjob.accepted', { job, submissionResult });
    } else {
      job.status = 'FAILED';
      job.failedAt = new Date().toISOString();
      job.errorMessage = submissionResult.error || submissionResult.message;

      this.logActivity(
        'PRINT_JOB',
        'WARNING',
        'Print Document Submission Failed',
        `Document "${cleanFileName}" failed to submit to HP 1188fnw (${protocol}): ${job.errorMessage}`
      );
      this.broadcast('printjob.failed', { job, submissionResult });
    }

    return {
      success: submissionResult.success,
      job,
      result: submissionResult
    };
  }

  public async cancelJob(jobId: string, user = 'Admin'): Promise<CancelJobResult> {
    const job = this.jobs.find((j) => j.id === jobId);
    if (!job) {
      return { supported: false, success: false, message: 'Print job not found' };
    }

    if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(job.status)) {
      return { supported: false, success: false, message: `Job is already in terminal state ${job.status}` };
    }

    const provider = this.getProvider(job.protocol);
    if (!provider.cancelJob) {
      return {
        supported: false,
        success: false,
        message: 'CANCELLATION NOT AVAILABLE (Transport protocol does not support remote job cancellation)'
      };
    }

    const cancelResult = await provider.cancelJob(this.config.ipAddress, this.config.port, jobId, job.remoteJobId);

    if (cancelResult.success) {
      job.status = 'CANCELLED';
      job.cancelledAt = new Date().toISOString();
      this.logActivity('PRINT_JOB', 'WARNING', 'Job Cancelled', `Print job ${jobId} cancelled by ${user}`);
      this.broadcast('printjob.cancelled', { job });
    }

    return cancelResult;
  }

  public async getQueueStatus(): Promise<QueueStatus> {
    const provider = this.getProvider(this.config.printProtocol);
    if (provider.getQueueStatus) {
      return await provider.getQueueStatus(this.config.ipAddress, this.config.port);
    }
    return {
      isAvailable: false,
      currentJobs: 0,
      queueLength: 0,
      activeJobName: null,
      acceptingJobs: true,
      details: 'NOT AVAILABLE'
    };
  }

  public getJobs(): PrintJob[] {
    return [...this.jobs];
  }

  public getJob(id: string): PrintJob | undefined {
    return this.jobs.find((j) => j.id === id);
  }

  /**
   * Generates a standard PJL / PCL text stream for HP Laser MFP 1188fnw
   */
  private generateTestPageStream(jobId: string, operator: string): Buffer {
    const dateStr = new Date().toLocaleString('en-US', { timeZoneName: 'short' });
    const textLines = [
      '================================================================================',
      '                          FETS SPACE CENTRE OPERATIONS                         ',
      '                        PRINTER CONNECTION TEST PAGE                            ',
      '================================================================================',
      '',
      `Job Identifier  : ${jobId}`,
      `Printer Name    : ${this.config.printerName}`,
      `Manufacturer    : ${this.config.manufacturer}`,
      `Hardware Model  : ${this.config.model}`,
      `IPv4 Address    : ${this.config.ipAddress}`,
      `Connection Type : ${this.config.connectionType}`,
      `Print Protocol  : ${this.config.printProtocol} (Port ${this.config.port})`,
      `Centre Location : ${this.config.location} [${this.config.room}]`,
      `Submitted By    : ${operator}`,
      `Submission Date : ${dateStr}`,
      '',
      '--------------------------------------------------------------------------------',
      '                          VERIFICATION STATUS                                   ',
      '--------------------------------------------------------------------------------',
      'Reachability   : CONFIRMED (TCP / IP Socket Active)',
      'Transport State: ACCEPTED BY PRINTER HARDWARE QUEUE',
      'Output Result  : SUCCESS (Physical paper delivery confirmed)',
      '',
      '+------------------------------------------------------------------------------+',
      '| [X] ALIGNMENT GRID TEST:                                                     |',
      '| +--------------------------------------------------------------------------+ |',
      '| | FETS SPACE - Test Pattern 01 | 1200 DPI Laser Engine Calibration Pass   | |',
      '| +--------------------------------------------------------------------------+ |',
      '+------------------------------------------------------------------------------+',
      '',
      '*** END OF TEST PRINT ***',
      '\x0C' // Form Feed
    ].join('\r\n');

    // Wrap with PJL (Printer Job Language) header and footer
    const pjlHeader = [
      '\x1B%-12345X@PJL',
      '@PJL JOB NAME = "FETS_SPACE_TEST_PAGE"',
      '@PJL SET COPIES = 1',
      '@PJL ENTER LANGUAGE = PCL',
      ''
    ].join('\r\n');

    const pjlFooter = [
      '',
      '\x1B%-12345X@PJL EOJ',
      '\x1B%-12345X'
    ].join('\r\n');

    return Buffer.concat([
      Buffer.from(pjlHeader, 'binary'),
      Buffer.from(textLines, 'utf8'),
      Buffer.from(pjlFooter, 'binary')
    ]);
  }
}
