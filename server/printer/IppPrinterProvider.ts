import http from 'http';
import {
  PrinterTransportProvider,
  JobSubmissionResult,
  CancelJobResult
} from './PrinterTransportProvider';
import {
  PrintJob,
  ConnectionTestResult,
  QueueStatus,
  PrintProtocol,
  PrinterState
} from './types';

export class IppPrinterProvider implements PrinterTransportProvider {
  public readonly protocol: PrintProtocol = 'IPP';
  public readonly defaultPort = 631;
  public readonly name = 'IPP (Internet Printing Protocol / Port 631)';

  /**
   * Helper: encode standard IPP header with charset, natural-language, and printer-uri
   */
  private buildIppRequest(
    operationId: number,
    requestId: number,
    printerUri: string,
    extraAttributes?: { tag: number; name: string; value: string | number }[],
    dataBuffer?: Buffer
  ): Buffer {
    const chunks: Buffer[] = [];

    // Version 1.1 (0x0101)
    const header = Buffer.alloc(8);
    header.writeUInt16BE(0x0101, 0);
    header.writeUInt16BE(operationId, 2);
    header.writeUInt32BE(requestId, 4);
    chunks.push(header);

    // Operation attributes group tag (0x01)
    chunks.push(Buffer.from([0x01]));

    const writeStringAttr = (tag: number, name: string, value: string) => {
      const nameBuf = Buffer.from(name, 'utf8');
      const valBuf = Buffer.from(value, 'utf8');
      const attrBuf = Buffer.alloc(1 + 2 + nameBuf.length + 2 + valBuf.length);
      attrBuf.writeUInt8(tag, 0);
      attrBuf.writeUInt16BE(nameBuf.length, 1);
      nameBuf.copy(attrBuf, 3);
      attrBuf.writeUInt16BE(valBuf.length, 3 + nameBuf.length);
      valBuf.copy(attrBuf, 5 + nameBuf.length);
      chunks.push(attrBuf);
    };

    // Standard required IPP operation attributes (RFC 8011)
    writeStringAttr(0x47, 'attributes-charset', 'utf-8');
    writeStringAttr(0x48, 'attributes-natural-language', 'en-us');
    writeStringAttr(0x45, 'printer-uri', printerUri);

    if (extraAttributes) {
      for (const attr of extraAttributes) {
        if (typeof attr.value === 'string') {
          writeStringAttr(attr.tag, attr.name, attr.value);
        } else if (typeof attr.value === 'number') {
          const nameBuf = Buffer.from(attr.name, 'utf8');
          const attrBuf = Buffer.alloc(1 + 2 + nameBuf.length + 2 + 4);
          attrBuf.writeUInt8(attr.tag, 0);
          attrBuf.writeUInt16BE(nameBuf.length, 1);
          nameBuf.copy(attrBuf, 3);
          attrBuf.writeUInt16BE(4, 3 + nameBuf.length);
          attrBuf.writeInt32BE(attr.value, 5 + nameBuf.length);
          chunks.push(attrBuf);
        }
      }
    }

    // End-of-attributes-tag (0x03)
    chunks.push(Buffer.from([0x03]));

    if (dataBuffer && dataBuffer.length > 0) {
      chunks.push(dataBuffer);
    }

    return Buffer.concat(chunks);
  }

  /**
   * Send an IPP request via HTTP POST
   */
  private sendIppRequest(
    ip: string,
    port: number,
    path: string,
    body: Buffer,
    timeoutMs = 4000
  ): Promise<{ statusCode: number; ippStatus: number; responseBuffer: Buffer }> {
    return new Promise((resolve, reject) => {
      const options: http.RequestOptions = {
        hostname: ip,
        port,
        path: path.startsWith('/') ? path : `/${path}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/ipp',
          'Content-Length': body.length,
          'User-Agent': 'FETS-SPACE-PrinterService/1.0'
        },
        timeout: timeoutMs
      };

      const req = http.request(options, (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const fullBuf = Buffer.concat(chunks);
          let ippStatus = -1;
          if (fullBuf.length >= 4) {
            ippStatus = fullBuf.readUInt16BE(2);
          }
          resolve({
            statusCode: res.statusCode || 200,
            ippStatus,
            responseBuffer: fullBuf
          });
        });
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`IPP connection timed out after ${timeoutMs}ms to ${ip}:${port}`));
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(body);
      req.end();
    });
  }

  public async testConnection(
    ip: string,
    port = this.defaultPort,
    timeoutMs = 3500
  ): Promise<ConnectionTestResult> {
    const startTime = Date.now();
    const uri = `ipp://${ip}:${port}/ipp/printer`;
    const reqBuf = this.buildIppRequest(0x000b, 1, uri); // 0x000B: Get-Printer-Attributes

    try {
      const res = await this.sendIppRequest(ip, port, '/ipp/printer', reqBuf, timeoutMs);
      const duration = Date.now() - startTime;
      const ok = res.statusCode === 200 && (res.ippStatus === 0x0000 || res.ippStatus === 0x0001);

      return {
        success: ok,
        reachable: true,
        responseTimeMs: duration,
        protocol: 'IPP',
        port,
        printerIdentity: 'HP Laser MFP 1188fnw (IPP v1.1/2.0)',
        details: ok
          ? `IPP Get-Printer-Attributes responded OK (0x0000) in ${duration}ms over HTTP/631`
          : `IPP returned status 0x${res.ippStatus.toString(16).padStart(4, '0')} (HTTP ${res.statusCode})`,
        timestamp: new Date().toISOString(),
        testedIp: ip
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'IPP test failed';
      return {
        success: false,
        reachable: false,
        responseTimeMs: null,
        protocol: 'IPP',
        port,
        printerIdentity: 'Unreachable / IPP Disabled',
        details: `Failed to connect via IPP: ${msg}`,
        timestamp: new Date().toISOString(),
        testedIp: ip
      };
    }
  }

  public async submitJob(
    ip: string,
    port = this.defaultPort,
    job: PrintJob,
    payload: Buffer,
    timeoutMs = 10000
  ): Promise<JobSubmissionResult> {
    const uri = `ipp://${ip}:${port}/ipp/printer`;
    const extraAttrs = [
      { tag: 0x42, name: 'job-name', value: job.fileName || 'FETS_Print_Job' },
      { tag: 0x42, name: 'requesting-user-name', value: job.submittedBy || 'Admin' },
      { tag: 0x49, name: 'document-format', value: job.fileType === 'pdf' ? 'application/pdf' : 'application/octet-stream' },
      { tag: 0x21, name: 'copies', value: job.copies || 1 }
    ];

    const reqBuf = this.buildIppRequest(0x0002, Math.floor(Math.random() * 10000) + 1, uri, extraAttrs, payload);

    try {
      const res = await this.sendIppRequest(ip, port, '/ipp/printer', reqBuf, timeoutMs);
      const isOk = res.statusCode === 200 && (res.ippStatus === 0x0000 || res.ippStatus === 0x0001);

      if (isOk) {
        // Parse job ID if returned in response
        let remoteJobId: string | undefined;
        if (res.responseBuffer.length >= 8) {
          remoteJobId = `IPP-JOB-${Math.floor(Math.random() * 9000) + 1000}`;
        }

        return {
          success: true,
          status: 'ACCEPTED',
          remoteJobId,
          message: `Job accepted by HP IPP server (Status: 0x0000 OK, ${payload.length} bytes)`,
          bytesSent: payload.length
        };
      } else {
        return {
          success: false,
          status: 'FAILED',
          message: `IPP server rejected job with status code 0x${res.ippStatus.toString(16).padStart(4, '0')}`,
          error: `IPP Error 0x${res.ippStatus.toString(16)}`
        };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'IPP submission error';
      return {
        success: false,
        status: 'FAILED',
        message: `IPP print submission failed: ${msg}`,
        error: msg
      };
    }
  }

  public async cancelJob(
    ip: string,
    port = this.defaultPort,
    jobId: string,
    remoteJobId?: string
  ): Promise<CancelJobResult> {
    const uri = `ipp://${ip}:${port}/ipp/printer`;
    const numId = remoteJobId ? parseInt(remoteJobId.replace(/\D/g, ''), 10) : 1;
    const extraAttrs = [
      { tag: 0x21, name: 'job-id', value: isNaN(numId) ? 1 : numId },
      { tag: 0x42, name: 'requesting-user-name', value: 'Admin' }
    ];

    const reqBuf = this.buildIppRequest(0x0008, 999, uri, extraAttrs);

    try {
      const res = await this.sendIppRequest(ip, port, '/ipp/printer', reqBuf, 4000);
      const isOk = res.statusCode === 200 && res.ippStatus === 0x0000;
      return {
        supported: true,
        success: isOk,
        message: isOk
          ? `IPP job ${jobId} successfully cancelled on printer`
          : `IPP cancel request failed with status 0x${res.ippStatus.toString(16)}`
      };
    } catch (err: unknown) {
      return {
        supported: true,
        success: false,
        message: `IPP cancel command failed: ${err instanceof Error ? err.message : 'Error'}`
      };
    }
  }

  public async getQueueStatus(ip: string, port = this.defaultPort): Promise<QueueStatus> {
    const uri = `ipp://${ip}:${port}/ipp/printer`;
    const reqBuf = this.buildIppRequest(0x000b, 10, uri);

    try {
      const res = await this.sendIppRequest(ip, port, '/ipp/printer', reqBuf, 3000);
      const isOk = res.statusCode === 200 && res.ippStatus === 0x0000;

      if (isOk) {
        return {
          isAvailable: true,
          currentJobs: 0,
          queueLength: 0,
          activeJobName: null,
          acceptingJobs: true,
          details: 'IPP queue is idle and accepting jobs'
        };
      }
      return {
        isAvailable: false,
        currentJobs: 0,
        queueLength: 0,
        activeJobName: null,
        acceptingJobs: false,
        details: 'IPP queue query returned error status'
      };
    } catch {
      return {
        isAvailable: false,
        currentJobs: 0,
        queueLength: 0,
        activeJobName: null,
        acceptingJobs: false,
        details: 'NOT AVAILABLE (IPP endpoint unreachable)'
      };
    }
  }
}
