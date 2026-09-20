import {
  PrintProtocol,
  PrintJob,
  PrintJobStatus,
  ConnectionTestResult,
  QueueStatus,
  PrinterState
} from './types';

export interface JobSubmissionResult {
  success: boolean;
  status: PrintJobStatus; // 'ACCEPTED' | 'COMPLETED' | 'FAILED'
  remoteJobId?: string;
  message: string;
  bytesSent?: number;
  error?: string;
}

export interface CancelJobResult {
  supported: boolean;
  success: boolean;
  message: string;
}

export interface PrinterTransportProvider {
  readonly protocol: PrintProtocol;
  readonly defaultPort: number;
  readonly name: string;

  /**
   * Perform genuine protocol connection attempt
   */
  testConnection(ip: string, port: number, timeoutMs?: number): Promise<ConnectionTestResult>;

  /**
   * Submit formatted print payload to printer transport
   */
  submitJob(
    ip: string,
    port: number,
    job: PrintJob,
    payload: Buffer,
    timeoutMs?: number
  ): Promise<JobSubmissionResult>;

  /**
   * Cancel an in-flight or remote queued job if supported by protocol
   */
  cancelJob?(
    ip: string,
    port: number,
    jobId: string,
    remoteJobId?: string
  ): Promise<CancelJobResult>;

  /**
   * Query real queue status where supported
   */
  getQueueStatus?(ip: string, port: number): Promise<QueueStatus>;

  /**
   * Query device state via protocol if available
   */
  getDeviceState?(ip: string, port: number): Promise<{ state: PrinterState; details?: string }>;
}
