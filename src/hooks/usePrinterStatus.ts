import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  PrinterTelemetry,
  PortProbeResult,
  PrinterState,
  PrinterMonitoringConfig,
  PrintJob,
  ConnectionTestResult,
  QueueStatus,
  PrinterSettingsConfig,
  PrintProtocol
} from '../types';

async function parseJson<T>(res: Response): Promise<T | null> {
  try {
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function usePrinterStatus() {
  const [printerData, setPrinterData] = useState<PrinterTelemetry | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSseConnected, setIsSseConnected] = useState<boolean>(false);
  const [tick, setTick] = useState<number>(0);
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [isPrintingTest, setIsPrintingTest] = useState<boolean>(false);
  const [isTestingConnection, setIsTestingConnection] = useState<boolean>(false);
  const [connectionTestResult, setConnectionTestResult] = useState<ConnectionTestResult | null>(null);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [printerConfig, setPrinterConfig] = useState<PrinterSettingsConfig | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Background ticker for timeAgoText without triggering effects on printerData
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => (t + 1) % 10000);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Purely derived timeAgo text
  const timeAgoText = useMemo(() => {
    if (!printerData?.lastCheckedAt) {
      return 'Syncing...';
    }
    void tick;

    const diffSec = Math.max(
      0,
      Math.floor((Date.now() - new Date(printerData.lastCheckedAt).getTime()) / 1000)
    );

    if (printerData.healthStatus === 'OFFLINE' && !printerData.isLive) {
      return diffSec < 10 ? 'Unreachable' : `Unreachable (${diffSec}s ago)`;
    } else if (diffSec < 2) {
      return 'Just now';
    } else if (diffSec < 60) {
      return `Updated ${diffSec}s ago`;
    } else if (diffSec < 3600) {
      const mins = Math.floor(diffSec / 60);
      return `Updated ${mins}m ago`;
    } else {
      const hrs = Math.floor(diffSec / 3600);
      return `Updated ${hrs}h ago`;
    }
  }, [printerData?.lastCheckedAt, printerData?.healthStatus, printerData?.isLive, tick]);

  // Fetch printer telemetry status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/printer/status');
      const data = await parseJson<PrinterTelemetry>(res);
      if (data) {
        setPrinterData(data);
        setIsLoading(false);
      }
    } catch {
      setPrinterData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          networkStatus: 'DISCONNECTED',
          healthStatus: 'OFFLINE'
        };
      });
      setIsLoading(false);
    }
  }, []);

  // Fetch print jobs history
  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/printer/jobs');
      const data = await parseJson<PrintJob[]>(res);
      if (data && Array.isArray(data)) {
        setPrintJobs(data);
      }
    } catch (e) {
      console.error('Failed to fetch print jobs', e);
    }
  }, []);

  // Fetch printer queue
  const fetchQueue = useCallback(async () => {
    try {
      const res = await fetch('/api/printer/queue');
      const data = await parseJson<QueueStatus>(res);
      if (data) {
        setQueueStatus(data);
      }
    } catch (e) {
      console.error('Failed to fetch printer queue', e);
    }
  }, []);

  // Fetch printer settings config
  const fetchPrinterConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/printer/config');
      const data = await parseJson<PrinterSettingsConfig>(res);
      if (data) {
        setPrinterConfig(data);
      }
    } catch (e) {
      console.error('Failed to fetch printer config', e);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStatus();
    fetchJobs();
    fetchQueue();
    fetchPrinterConfig();
  }, [fetchStatus, fetchJobs, fetchQueue, fetchPrinterConfig]);

  // Connect to SSE stream with polling fallback
  useEffect(() => {
    let isMounted = true;

    try {
      const es = new EventSource('/api/printer/stream');
      eventSourceRef.current = es;

      es.onopen = () => {
        if (isMounted) setIsSseConnected(true);
      };

      es.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'printer.telemetry') {
            setPrinterData(payload.data);
            setIsLoading(false);
          } else if (payload.type === 'printjob.created' && payload.data?.job) {
            setPrintJobs((prev) => [payload.data.job, ...prev.filter((j) => j.id !== payload.data.job.id)]);
          } else if (
            (payload.type === 'printjob.accepted' ||
              payload.type === 'printjob.completed' ||
              payload.type === 'printjob.failed' ||
              payload.type === 'printjob.cancelled') &&
            payload.data?.job
          ) {
            setPrintJobs((prev) =>
              prev.map((j) => (j.id === payload.data.job.id ? payload.data.job : j))
            );
          } else if (payload.type === 'printer.updated' && payload.data?.config) {
            setPrinterConfig(payload.data.config);
          } else if (payload.id && payload.ipAddress) {
            // Legacy / direct telemetry payload
            setPrinterData(payload);
            setIsLoading(false);
          }
        } catch {
          // Parse error fallback
        }
      };

      es.onerror = () => {
        if (isMounted) {
          setIsSseConnected(false);
          if (!pollTimerRef.current) {
            pollTimerRef.current = setInterval(() => {
              fetchStatus();
              fetchJobs();
            }, 6000);
          }
        }
      };
    } catch {
      pollTimerRef.current = setInterval(() => {
        fetchStatus();
        fetchJobs();
      }, 6000);
    }

    return () => {
      isMounted = false;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [fetchStatus, fetchJobs]);

  // Test Connection
  const testConnection = async (protocol?: PrintProtocol, port?: number): Promise<ConnectionTestResult> => {
    setIsTestingConnection(true);
    try {
      const res = await fetch('/api/printer/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocol, port })
      });
      const data = await parseJson<ConnectionTestResult>(res);
      if (data) {
        setConnectionTestResult(data);
        await fetchStatus();
        return data;
      }
      throw new Error('Non-JSON or invalid response received');
    } catch (err: unknown) {
      const fallback: ConnectionTestResult = {
        success: false,
        reachable: false,
        responseTimeMs: null,
        protocol: protocol || printerConfig?.printProtocol || 'RAW',
        port: port || printerConfig?.port || 9100,
        printerIdentity: 'Unreachable',
        details: err instanceof Error ? err.message : 'Network request failed',
        timestamp: new Date().toISOString(),
        testedIp: printerConfig?.ipAddress || '192.168.29.91'
      };
      setConnectionTestResult(fallback);
      return fallback;
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Print Test Page
  const printTestPage = async (
    submittedBy = 'Admin',
    userRole = 'IT_ADMIN'
  ): Promise<{ success: boolean; job?: PrintJob; result?: { message: string; status?: string } }> => {
    setIsPrintingTest(true);
    try {
      const res = await fetch('/api/printer/print-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submittedBy, userRole })
      });
      const data = await parseJson<{ success: boolean; job?: PrintJob; result?: { message: string; status?: string } }>(res);
      if (data) {
        if (data.job) {
          setPrintJobs((prev) => [data.job!, ...prev.filter((j) => j.id !== data.job!.id)]);
        }
        await fetchStatus();
        await fetchQueue();
        return data;
      }
      return {
        success: false,
        result: { message: 'Failed to parse printer response' }
      };
    } catch (e: unknown) {
      return {
        success: false,
        result: { message: e instanceof Error ? e.message : 'Failed to trigger test print' }
      };
    } finally {
      setIsPrintingTest(false);
    }
  };

  // Print Document (PDF)
  const printDocument = async (params: {
    file: File;
    copies: number;
    paperSize?: string;
    orientation?: 'PORTRAIT' | 'LANDSCAPE';
    submittedBy?: string;
    userRole?: string;
  }): Promise<{ success: boolean; job?: PrintJob; error?: string; result?: { message: string } }> => {
    const { file, copies, paperSize, orientation, submittedBy, userRole } = params;

    // Convert file to Base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = reader.result as string;
        const b64 = res.split(',')[1] || '';
        resolve(b64);
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });

    try {
      const res = await fetch('/api/printer/print-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileBase64: base64,
          fileName: file.name,
          fileSize: file.size,
          fileType: 'pdf',
          copies,
          paperSize,
          orientation,
          submittedBy: submittedBy || 'Admin',
          userRole: userRole || 'IT_ADMIN'
        })
      });

      const data = await parseJson<{ success?: boolean; job?: PrintJob; error?: string; result?: { message: string } }>(res);
      if (res.ok && data) {
        if (data.job) {
          setPrintJobs((prev) => [data.job!, ...prev.filter((j) => j.id !== data.job!.id)]);
        }
        await fetchQueue();
        return { success: true, job: data.job, result: data.result };
      } else {
        return { success: false, error: data?.error || 'Failed to submit document' };
      }
    } catch (e: unknown) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Network request error'
      };
    }
  };

  // Cancel Job
  const cancelJob = async (jobId: string, user = 'Admin'): Promise<{ supported: boolean; success: boolean; message: string }> => {
    try {
      const res = await fetch(`/api/printer/jobs/${jobId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user })
      });
      const data = await parseJson<{ supported: boolean; success: boolean; message: string }>(res);
      await fetchJobs();
      await fetchQueue();
      return data || { supported: false, success: false, message: 'Invalid response from server' };
    } catch (e: unknown) {
      return {
        supported: false,
        success: false,
        message: e instanceof Error ? e.message : 'Cancel request failed'
      };
    }
  };

  // Update printer settings config
  const updatePrinterConfig = async (newConfig: Partial<PrinterSettingsConfig>, userRole = 'IT_ADMIN'): Promise<boolean> => {
    try {
      const res = await fetch('/api/printer/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newConfig, userRole })
      });
      if (res.ok) {
        const data = await parseJson<PrinterSettingsConfig>(res);
        if (data) {
          setPrinterConfig(data);
          await fetchStatus();
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  // Refresh
  const refresh = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/printer/refresh', { method: 'POST' });
      if (res.ok) {
        const data = await parseJson<PrinterTelemetry>(res);
        if (data) {
          setPrinterData(data);
        }
      }
      await fetchJobs();
      await fetchQueue();
    } catch (e) {
      console.error('Refresh failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Port Probe
  const probe = async (ipAddress?: string, ports?: number[]): Promise<PortProbeResult[]> => {
    setIsProbing(true);
    try {
      const res = await fetch('/api/printer/probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ipAddress, ports })
      });
      if (res.ok) {
        const result = await parseJson<{ portProbes?: PortProbeResult[] }>(res);
        await fetchStatus();
        return result?.portProbes || [];
      }
    } catch (e) {
      console.error('Port probe failed', e);
    } finally {
      setIsProbing(false);
    }
    return [];
  };

  // Simulate State (testing)
  const simulateState = async (state: PrinterState) => {
    try {
      const res = await fetch('/api/printer/simulate-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state })
      });
      if (res.ok) {
        const result = await parseJson<{ telemetry?: PrinterTelemetry }>(res);
        if (result?.telemetry) setPrinterData(result.telemetry);
      }
    } catch (e) {
      console.error('Simulate state failed', e);
    }
  };

  const updateConfig = async (config: Partial<PrinterMonitoringConfig>) => {
    try {
      const res = await fetch('/api/printer/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        await fetchStatus();
      }
    } catch (e) {
      console.error('Update config failed', e);
    }
  };

  return {
    printerData,
    isLoading,
    isSseConnected,
    timeAgoText,
    isProbing,
    isPrintingTest,
    isTestingConnection,
    connectionTestResult,
    printJobs,
    queueStatus,
    printerConfig,
    refresh,
    probe,
    testConnection,
    printTestPage,
    sendTestPrint: printTestPage,
    printDocument,
    cancelJob,
    fetchJobs,
    fetchQueue,
    updatePrinterConfig,
    simulateState,
    updateConfig
  };
}
