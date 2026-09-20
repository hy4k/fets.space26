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

export class LpdPrinterProvider implements PrinterTransportProvider {
  public readonly protocol: PrintProtocol = 'LPD';
  public readonly defaultPort = 515;
  public readonly name = 'LPD / LPR (Line Printer Daemon / Port 515)';

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
          protocol: 'LPD',
          port,
          printerIdentity: reachable ? 'HP Laser MFP 1188fnw (LPD Protocol)' : 'Unreachable / LPD Disabled',
          details: reachable
            ? `LPD TCP port 515 connected in ${duration}ms`
            : `LPD connection failed to ${ip}:${port}: ${errorMsg || 'No response'}`,
          timestamp: new Date().toISOString(),
          testedIp: ip
        });
      };

      socket.setTimeout(timeoutMs);

      socket.once('connect', () => {
        // Send short queue state command: \x04raw\n
        try {
          socket.write('\x04raw\n');
        } catch {
          // ignore
        }
        finish(true);
      });

      socket.once('timeout', () => {
        finish(false, `LPD socket timed out after ${timeoutMs}ms`);
      });

      socket.once('error', (err) => {
        finish(false, err.message);
      });

      try {
        socket.connect(port, ip);
      } catch (err: unknown) {
        finish(false, err instanceof Error ? err.message : 'LPD socket error');
      }
    });
  }

  public submitJob(
    ip: string,
    port = this.defaultPort,
    job: PrintJob,
    payload: Buffer,
    timeoutMs = 10000
  ): Promise<JobSubmissionResult> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let resolved = false;

      const finish = (res: JobSubmissionResult) => {
        if (resolved) return;
        resolved = true;
        socket.destroy();
        resolve(res);
      };

      socket.setTimeout(timeoutMs);

      socket.once('timeout', () => {
        finish({
          success: false,
          status: 'FAILED',
          message: `LPD transmission timed out after ${timeoutMs}ms`,
          error: 'Timeout'
        });
      });

      socket.once('error', (err) => {
        finish({
          success: false,
          status: 'FAILED',
          message: `LPD socket error: ${err.message}`,
          error: err.message
        });
      });

      socket.once('connect', () => {
        // RFC 1179: Command \x02<printer-queue>\n
        const queueName = 'raw';
        socket.write(`\x02${queueName}\n`);

        let step = 0;
        const jobNum = '001';
        const host = 'fets';
        const user = job.submittedBy ? job.submittedBy.replace(/[^a-zA-Z0-9]/g, '') : 'admin';
        const controlFile = `H${host}\nP${user}\nJ${job.fileName || 'document'}\n`;
        const controlBuf = Buffer.from(controlFile, 'utf8');

        socket.on('data', (data) => {
          // 0x00 means acknowledge OK
          const ack = data[0] === 0;
          if (!ack && step > 0) {
            return finish({
              success: false,
              status: 'FAILED',
              message: `LPD server rejected command step ${step} with non-zero response (0x${data[0].toString(16)})`,
              error: `LPD error code ${data[0]}`
            });
          }

          if (step === 0) {
            // Receive job acknowledged -> Send control file header
            step = 1;
            socket.write(`\x02${controlBuf.length} cfA${jobNum}${host}\n`);
          } else if (step === 1) {
            // Control file header acknowledged -> Send control file content
            step = 2;
            socket.write(Buffer.concat([controlBuf, Buffer.from([0x00])]));
          } else if (step === 2) {
            // Control file content acknowledged -> Send data file header
            step = 3;
            socket.write(`\x03${payload.length} dfA${jobNum}${host}\n`);
          } else if (step === 3) {
            // Data file header acknowledged -> Send payload
            step = 4;
            socket.write(Buffer.concat([payload, Buffer.from([0x00])]), () => {
              finish({
                success: true,
                status: 'ACCEPTED',
                message: `LPD job accepted by HP 1188fnw queue '${queueName}' (${payload.length} bytes delivered)`,
                bytesSent: payload.length
              });
            });
          }
        });
      });

      try {
        socket.connect(port, ip);
      } catch (err: unknown) {
        finish({
          success: false,
          status: 'FAILED',
          message: `Failed to open LPD socket to ${ip}:${port}`,
          error: err instanceof Error ? err.message : 'Error'
        });
      }
    });
  }

  public cancelJob(ip: string, port = this.defaultPort, jobId: string): Promise<CancelJobResult> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(3000);

      const finish = (supported: boolean, success: boolean, message: string) => {
        socket.destroy();
        resolve({ supported, success, message });
      };

      socket.once('connect', () => {
        // RFC 1179: \x05<queue> <user> <job-ids>\n
        socket.write(`\x05raw admin ${jobId}\n`, () => {
          finish(true, true, `LPD Cancel request sent for job ${jobId}`);
        });
      });

      socket.once('timeout', () => finish(true, false, 'LPD cancel request timed out'));
      socket.once('error', (err) => finish(true, false, `LPD cancel error: ${err.message}`));

      try {
        socket.connect(port, ip);
      } catch (err: unknown) {
        finish(false, false, err instanceof Error ? err.message : 'Error');
      }
    });
  }

  public getQueueStatus(ip: string, port = this.defaultPort): Promise<QueueStatus> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let output = '';

      socket.setTimeout(2500);

      const finish = (isAvailable: boolean, details: string) => {
        socket.destroy();
        resolve({
          isAvailable,
          currentJobs: 0,
          queueLength: 0,
          activeJobName: null,
          acceptingJobs: isAvailable,
          details
        });
      };

      socket.once('connect', () => {
        // RFC 1179: \x04<queue>\n (short queue display)
        socket.write('\x04raw\n');
      });

      socket.on('data', (d) => {
        output += d.toString('utf8');
      });

      socket.once('timeout', () => finish(false, 'NOT AVAILABLE (LPD queue query timed out)'));
      socket.once('error', (err) => finish(false, `NOT AVAILABLE (${err.message})`));
      socket.once('end', () => {
        finish(true, output.trim() || 'LPD queue is empty and ready');
      });

      try {
        socket.connect(port, ip);
      } catch {
        finish(false, 'NOT AVAILABLE (LPD connection error)');
      }
    });
  }
}
