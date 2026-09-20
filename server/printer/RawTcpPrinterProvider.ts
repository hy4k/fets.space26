import net from 'net';
import {
  PrinterTransportProvider,
  JobSubmissionResult,
  CancelJobResult
} from './PrinterTransportProvider';
import {
  PrintJob,
  ConnectionTestResult,
  QueueStatus,
  PrintProtocol
} from './types';

export class RawTcpPrinterProvider implements PrinterTransportProvider {
  public readonly protocol: PrintProtocol = 'RAW';
  public readonly defaultPort = 9100;
  public readonly name = 'RAW TCP/IP (JetDirect / Port 9100)';

  /**
   * Performs an actual TCP connection test to the printer port (default 9100)
   */
  public testConnection(ip: string, port = this.defaultPort, timeoutMs = 3000): Promise<ConnectionTestResult> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const socket = new net.Socket();
      let resolved = false;

      const finish = (reachable: boolean, errorMsg?: string) => {
        if (resolved) return;
        resolved = true;
        socket.destroy();
        const duration = Date.now() - startTime;

        resolve({
          success: reachable,
          reachable,
          responseTimeMs: reachable ? duration : null,
          protocol: 'RAW',
          port,
          printerIdentity: reachable ? 'HP Laser MFP 1188fnw (RAW Stream)' : 'Unreachable',
          details: reachable
            ? `TCP socket connected to ${ip}:${port} in ${duration}ms (Socket is open & writable)`
            : `Connection failed to ${ip}:${port}: ${errorMsg || 'No response'}`,
          timestamp: new Date().toISOString(),
          testedIp: ip
        });
      };

      socket.setTimeout(timeoutMs);

      socket.once('connect', () => {
        finish(true);
      });

      socket.once('timeout', () => {
        finish(false, `Connection timed out after ${timeoutMs}ms`);
      });

      socket.once('error', (err) => {
        finish(false, err.message);
      });

      try {
        socket.connect(port, ip);
      } catch (err: unknown) {
        finish(false, err instanceof Error ? err.message : 'Socket error');
      }
    });
  }

  /**
   * Submit job payload via RAW TCP socket
   */
  public submitJob(
    ip: string,
    port = this.defaultPort,
    job: PrintJob,
    payload: Buffer,
    timeoutMs = 8000
  ): Promise<JobSubmissionResult> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let hasFinished = false;
      let bytesSent = 0;

      const finish = (result: JobSubmissionResult) => {
        if (hasFinished) return;
        hasFinished = true;
        socket.destroy();
        resolve(result);
      };

      socket.setTimeout(timeoutMs);

      socket.once('timeout', () => {
        finish({
          success: false,
          status: 'FAILED',
          message: `RAW TCP transmission timed out after ${timeoutMs}ms to ${ip}:${port}`,
          error: `Socket timeout (${timeoutMs}ms)`
        });
      });

      socket.once('error', (err) => {
        finish({
          success: false,
          status: 'FAILED',
          message: `RAW TCP socket error: ${err.message}`,
          error: err.message
        });
      });

      socket.once('connect', () => {
        // Write payload to printer
        const canContinue = socket.write(payload, (writeErr) => {
          if (writeErr) {
            return finish({
              success: false,
              status: 'FAILED',
              message: `Error transmitting bytes to printer: ${writeErr.message}`,
              error: writeErr.message
            });
          }

          bytesSent = payload.length;

          // End the stream cleanly to signal job completion to the printer controller
          socket.end(() => {
            finish({
              success: true,
              status: 'ACCEPTED',
              message: `Print job accepted by HP 1188fnw transport on port ${port} (${bytesSent} bytes delivered)`,
              bytesSent
            });
          });
        });

        if (!canContinue) {
          socket.once('drain', () => {
            // Buffer drained
          });
        }
      });

      try {
        socket.connect(port, ip);
      } catch (err: unknown) {
        finish({
          success: false,
          status: 'FAILED',
          message: `Failed to initiate RAW socket to ${ip}:${port}`,
          error: err instanceof Error ? err.message : 'Socket error'
        });
      }
    });
  }

  public cancelJob(): Promise<CancelJobResult> {
    return Promise.resolve({
      supported: false,
      success: false,
      message: 'CANCELLATION NOT AVAILABLE (RAW TCP/IP port 9100 is a stream transport without out-of-band job control)'
    });
  }

  public getQueueStatus(): Promise<QueueStatus> {
    return Promise.resolve({
      isAvailable: false,
      currentJobs: 0,
      queueLength: 0,
      activeJobName: null,
      acceptingJobs: true,
      details: 'NOT AVAILABLE (RAW TCP port 9100 does not report queue metrics)'
    });
  }
}
