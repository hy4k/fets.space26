import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { networkMonitor } from './server/networkMonitor';
import { printerMonitor } from './server/printerMonitor';
import { PrinterService } from './server/printer/PrinterService';
import { domainStore } from './server/domainStore';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FETS SPACE IT Operations Platform',
    timestamp: new Date().toISOString(),
    centre: 'Calicut Centre (4960)'
  });
});

// Real-Time Server-Sent Events (SSE) Stream for FETS SPACE Platform Events
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial snapshot
  const initialData = {
    type: 'init',
    capacity: domainStore.getCapacitySummary(),
    timestamp: new Date().toISOString()
  };
  res.write(`data: ${JSON.stringify(initialData)}\n\n`);

  // Unsubscribe handler
  const unsubscribe = domainStore.subscribe((event, payload) => {
    try {
      res.write(`data: ${JSON.stringify({ type: event, payload, timestamp: new Date().toISOString() })}\n\n`);
    } catch {
      // Stream closed
    }
  });

  // Heartbeat keep-alive every 15s
  const keepAlive = setInterval(() => {
    try {
      res.write(`: keepalive ${Date.now()}\n\n`);
    } catch {
      clearInterval(keepAlive);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(keepAlive);
    unsubscribe();
    res.end();
  });
});

// Capacity Summary Endpoint (Physical Booths: 40, Installed: 36, Open Slots: 4, Available, Busy)
app.get('/api/capacity', (req, res) => {
  res.json(domainStore.getCapacitySummary());
});

// Summary Stats Endpoint (Dynamic from Domain Store)
app.get('/api/stats', (req, res) => {
  const cap = domainStore.getCapacitySummary();
  res.json({
    centre: 'Calicut Centre',
    physicalBooths: cap.physicalBooths,
    installedSystems: cap.installedSystems,
    openBoothSlots: cap.openBoothSlots,
    availableSystems: cap.availableSystems,
    busySystems: cap.busySystems,
    operational: cap.operational,
    attention: cap.attention,
    critical: cap.critical,
    offline: cap.offline,
    maintenance: cap.maintenance,
    auditsDue: 2,
    activeIssues: cap.critical + cap.attention,
    assetsCount: 153,
    examApps: [
      { name: 'CMA US', coverage: 100, installed: cap.installedSystems, total: cap.installedSystems },
      { name: 'Pearson VUE', coverage: 97, installed: cap.installedSystems - 1, total: cap.installedSystems },
      { name: 'PSI Exams', coverage: 95, installed: cap.installedSystems - 2, total: cap.installedSystems },
      { name: 'CELPIP', coverage: 100, installed: cap.installedSystems, total: cap.installedSystems },
      { name: 'ITTS Client', coverage: 100, installed: cap.installedSystems, total: cap.installedSystems }
    ]
  });
});

// Booths Endpoints
app.get('/api/booths', (req, res) => {
  res.json(domainStore.getAllBooths());
});

app.get('/api/booths/:id', (req, res) => {
  const booth = domainStore.getBoothById(req.params.id);
  if (!booth) return res.status(404).json({ error: 'Booth not found' });
  res.json(booth);
});

// Workstations Endpoints
app.get('/api/workstations', (req, res) => {
  res.json(domainStore.getAllWorkstations());
});

app.get('/api/workstations/:id', (req, res) => {
  const ws = domainStore.getWorkstationById(req.params.id);
  if (!ws) return res.status(404).json({ error: 'Workstation not found' });
  res.json(ws);
});

app.patch('/api/workstations/:id', (req, res) => {
  const updated = domainStore.updateWorkstation(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Workstation not found' });
  res.json(updated);
});

// Occupancy Transition API
app.post('/api/workstations/:id/occupancy', (req, res) => {
  const { targetStatus, sessionData, actor } = req.body;
  const result = domainStore.transitionOccupancy(req.params.id, targetStatus, sessionData, actor);
  if (!result.success) {
    return res.status(400).json({ error: result.error });
  }
  res.json({ success: true, workstation: result.workstation });
});

// Agent Management Endpoints
app.post('/api/agents/register-token', (req, res) => {
  const { workstationId } = req.body;
  if (!workstationId) return res.status(400).json({ error: 'workstationId is required' });
  const tokenRecord = domainStore.generateRegistrationToken(workstationId);
  res.json(tokenRecord);
});

app.post('/api/agents/register', (req, res) => {
  const { token, hostname, macAddress, ipAddress, agentVersion } = req.body;
  if (!token) return res.status(400).json({ error: 'token is required' });
  const result = domainStore.registerAgent(token, { hostname, macAddress, ipAddress, agentVersion });
  if (!result.success) return res.status(400).json({ error: result.error });
  res.json({ success: true, workstation: result.workstation });
});

app.post('/api/agents/heartbeat', (req, res) => {
  const { workstationId, agentVersion, ipAddress } = req.body;
  if (!workstationId) return res.status(400).json({ error: 'workstationId is required' });
  const result = domainStore.recordHeartbeat(workstationId, agentVersion, ipAddress);
  if (!result.success) return res.status(404).json({ error: 'Workstation not found' });
  res.json({ success: true, workstation: result.workstation });
});

app.post('/api/agents/telemetry', (req, res) => {
  const { workstationId, cpuUsage, ramUsage, storageFree, latencyMs, appChecks } = req.body;
  if (!workstationId) return res.status(400).json({ error: 'workstationId is required' });
  const result = domainStore.recordTelemetry(workstationId, { cpuUsage, ramUsage, storageFree, latencyMs, appChecks });
  if (!result.success) return res.status(404).json({ error: 'Workstation not found' });
  res.json({ success: true, workstation: result.workstation });
});

// Alerts API
app.get('/api/alerts', (req, res) => {
  res.json(domainStore.getAlerts());
});

app.post('/api/alerts/:id/acknowledge', (req, res) => {
  const { actor = 'Operator' } = req.body;
  const alert = domainStore.acknowledgeAlert(req.params.id, actor);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  res.json(alert);
});

app.post('/api/alerts/:id/resolve', (req, res) => {
  const { actor = 'Operator' } = req.body;
  const alert = domainStore.resolveAlert(req.params.id, actor);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  res.json(alert);
});

// Centre Readiness API
app.get('/api/readiness', (req, res) => {
  res.json(domainStore.getReadinessBreakdown());
});

// Activity Logs API
app.get('/api/activity', (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  res.json(domainStore.getActivityLogs(limit));
});

// Network Speed & Centre Throughput Telemetry API
app.get('/api/network/overview', (req, res) => {
  res.json(networkMonitor.getOverview());
});

// Immediate measurement trigger endpoint for instant refresh
app.post(['/api/network/poll', '/api/network/refresh'], (req, res) => {
  const overview = networkMonitor.triggerImmediateMeasurement();
  res.json(overview);
});

// Real-Time Server-Sent Events (SSE) Stream for Network Speed Telemetry
app.get('/api/network/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send current overview immediately upon connection
  const sendOverview = (data = networkMonitor.getOverview()) => {
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch {
      // Client closed
    }
  };

  sendOverview();

  // Instantaneous push whenever a new measurement is calculated
  const onMeasurement = (data: any) => {
    sendOverview(data);
  };
  networkMonitor.on('measurement', onMeasurement);

  // Heartbeat/interval push according to configured refreshInterval
  let interval = setInterval(() => {
    sendOverview();
  }, Math.max(1000, (networkMonitor.getConfig().refreshInterval || 1) * 1000));

  const onConfigChanged = () => {
    clearInterval(interval);
    interval = setInterval(() => {
      sendOverview();
    }, Math.max(1000, (networkMonitor.getConfig().refreshInterval || 1) * 1000));
  };
  networkMonitor.on('configChanged', onConfigChanged);

  req.on('close', () => {
    networkMonitor.off('measurement', onMeasurement);
    networkMonitor.off('configChanged', onConfigChanged);
    clearInterval(interval);
    res.end();
  });
});

// Network Monitoring Configuration Endpoints
app.get('/api/network/config', (req, res) => {
  res.json(networkMonitor.getConfig());
});

app.post('/api/network/config', (req, res) => {
  const updated = networkMonitor.updateConfig(req.body);
  res.json(updated);
});

// Diagnostic simulation endpoint to verify stale/unavailable/zero states
app.post('/api/network/simulate-state', (req, res) => {
  const { status } = req.body;
  if (['active', 'stale_simulated', 'unavailable_simulated', 'zero_simulated'].includes(status)) {
    networkMonitor.updateConfig({ status });
    return res.json({ success: true, status, overview: networkMonitor.getOverview() });
  }
  res.status(400).json({ error: 'Invalid state' });
});

// ============================================================
// Network Printer Functional Subsystem (HP Laser MFP 1188fnw)
// ============================================================

const printerService = PrinterService.getInstance();

// 1. Connection Testing Endpoint
app.post('/api/printer/test-connection', async (req, res) => {
  const { protocol, port } = req.body;
  try {
    const result = await printerService.testConnection(protocol, port ? Number(port) : undefined);
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Connection test failed';
    res.status(500).json({
      success: false,
      reachable: false,
      responseTimeMs: null,
      protocol: protocol || printerService.getConfig().printProtocol,
      port: port || printerService.getConfig().port,
      printerIdentity: 'Unreachable',
      details: msg,
      timestamp: new Date().toISOString(),
      testedIp: printerService.getConfig().ipAddress
    });
  }
});

// 2. Printer Telemetry & Overview
app.get('/api/printer/status', (req, res) => {
  res.json(printerMonitor.getTelemetry());
});

app.get('/api/printers', (req, res) => {
  res.json([printerMonitor.getTelemetry()]);
});

// 3. Test Page Printing Endpoint
app.post(['/api/printer/print-test', '/api/printer/test', '/api/printer/test-print'], async (req, res) => {
  const { submittedBy = 'Admin', userRole = 'IT_ADMIN' } = req.body;
  
  // RBAC Permission Check
  const authorizedRoles = ['SUPER_ADMIN', 'IT_ADMIN', 'CENTRE_MANAGER', 'TECHNICIAN', 'TCA'];
  if (userRole && !authorizedRoles.includes(userRole.toUpperCase())) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: Role '${userRole}' is not authorized to submit print jobs.`
    });
  }

  try {
    const response = await printerService.printTestPage(submittedBy, userRole);
    res.json(response);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Print test execution failed';
    res.status(500).json({ success: false, error: msg });
  }
});

// 4. Document Printing Endpoint (PDF upload)
app.post('/api/printer/print-document', async (req, res) => {
  const {
    fileBase64,
    fileName,
    fileSize,
    fileType,
    copies = 1,
    paperSize = 'A4',
    orientation = 'PORTRAIT',
    submittedBy = 'Admin',
    userRole = 'IT_ADMIN'
  } = req.body;

  // RBAC Permission Check
  const authorizedRoles = ['SUPER_ADMIN', 'IT_ADMIN', 'CENTRE_MANAGER', 'TECHNICIAN', 'TCA'];
  if (userRole && !authorizedRoles.includes(userRole.toUpperCase())) {
    return res.status(403).json({
      success: false,
      error: `Access Denied: Role '${userRole}' is not authorized to print documents.`
    });
  }

  if (!fileBase64 || !fileName) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: fileBase64 and fileName must be provided.'
    });
  }

  try {
    const fileBuffer = Buffer.from(fileBase64, 'base64');
    const result = await printerService.printDocument({
      fileBuffer,
      fileName,
      fileSize: fileSize || fileBuffer.length,
      fileType: fileType || 'pdf',
      copies: Number(copies) || 1,
      paperSize,
      orientation,
      submittedBy,
      userRole
    });

    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Document printing failed';
    res.status(400).json({ success: false, error: msg });
  }
});

// 5. Print Job History & Tracking Endpoints
app.get('/api/printer/jobs', (req, res) => {
  res.json(printerService.getJobs());
});

app.get('/api/printer/jobs/:id', (req, res) => {
  const job = printerService.getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Print job not found' });
  res.json(job);
});

// 6. Cancel Print Job Endpoint
app.post('/api/printer/jobs/:id/cancel', async (req, res) => {
  const { user = 'Admin' } = req.body;
  const result = await printerService.cancelJob(req.params.id, user);
  res.json(result);
});

// 7. Real Printer Queue Endpoint
app.get('/api/printer/queue', async (req, res) => {
  const queue = await printerService.getQueueStatus();
  res.json(queue);
});

// 8. Printer Configuration Endpoints
app.get('/api/printer/config', (req, res) => {
  res.json(printerService.getConfig());
});

app.post('/api/printer/config', (req, res) => {
  const { userRole = 'IT_ADMIN' } = req.body;
  const adminRoles = ['SUPER_ADMIN', 'IT_ADMIN', 'CENTRE_MANAGER'];
  if (userRole && !adminRoles.includes(userRole.toUpperCase())) {
    return res.status(403).json({ error: 'Unauthorized: Only Administrators can modify printer protocol settings' });
  }

  const updatedConfig = printerService.updateConfig(req.body);
  printerMonitor.updateConfig({
    ipAddress: updatedConfig.ipAddress,
    pollIntervalSeconds: updatedConfig.pollIntervalSeconds
  });
  res.json(updatedConfig);
});

// 9. Real-Time Server-Sent Events (SSE) Stream
app.get('/api/printer/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Send initial state immediately
  try {
    const data = printerMonitor.getTelemetry();
    res.write(`data: ${JSON.stringify({ type: 'printer.telemetry', data })}\n\n`);
  } catch {
    // Client closed
  }

  // Subscribe to monitor notifications
  const unsubMonitor = printerMonitor.subscribe((data) => {
    try {
      res.write(`data: ${JSON.stringify({ type: 'printer.telemetry', data })}\n\n`);
    } catch {
      // Stream error
    }
  });

  // Subscribe to printer service events (job created, accepted, completed, failed, cancelled)
  const unsubService = printerService.subscribe((event) => {
    try {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    } catch {
      // Stream error
    }
  });

  const keepAlive = setInterval(() => {
    try {
      res.write(`: keepalive ${Date.now()}\n\n`);
    } catch {
      clearInterval(keepAlive);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(keepAlive);
    unsubMonitor();
    unsubService();
    res.end();
  });
});

// 10. Diagnostics and Activity Logs
app.post('/api/printer/probe', async (req, res) => {
  const { ipAddress, ports } = req.body;
  const probeResults = await printerMonitor.probeDevice(ipAddress, ports);
  res.json({ success: true, portProbes: probeResults });
});

app.post('/api/printer/refresh', async (req, res) => {
  const updated = await printerMonitor.pollDevice();
  res.json(updated);
});

app.post('/api/printer/simulate-state', async (req, res) => {
  const { state } = req.body;
  const validStates = ['READY', 'PRINTING', 'PAPER_EMPTY', 'PAPER_JAM', 'DOOR_OPEN', 'TONER_LOW', 'MAINTENANCE'];
  if (!validStates.includes(state)) {
    return res.status(400).json({ error: `Invalid state. Supported: ${validStates.join(', ')}` });
  }
  const result = await printerMonitor.simulateState(state);
  res.json({ success: true, state, telemetry: result });
});

app.get('/api/printer/activity', (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 30;
  // Merge logs from printerService and printerMonitor
  const serviceLogs = printerService.getActivityLogs(limit);
  const monitorLogs = printerMonitor.getActivityLogs(limit);
  const allLogs = [...serviceLogs, ...monitorLogs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);
  res.json(allLogs);
});

// Diagnostic Ping API
app.post('/api/systems/:id/ping', (req, res) => {
  const { id } = req.params;
  const isOffline = id === 'W012';
  
  if (isOffline) {
    return res.status(503).json({
      systemId: id,
      status: 'offline',
      latencyMs: null,
      message: 'Request timed out. 100% packet loss.',
      timestamp: new Date().toISOString()
    });
  }

  const latency = Math.floor(Math.random() * 3) + 1; // 1-3ms
  res.json({
    systemId: id,
    status: 'operational',
    latencyMs: latency,
    message: `Active ICMP reply: 64 bytes in ${latency}ms. Link 1000Mbps Full-Duplex.`,
    timestamp: new Date().toISOString()
  });
});

// Export CSV Endpoint
app.get('/api/export/:type', (req, res) => {
  const { type } = req.params;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="fets_space_${type}_export.csv"`);
  
  if (type === 'systems') {
    let csv = 'Workstation ID,Booth,Hostname,Health,Occupancy,Network,Readiness,Agent,RAM (GB),Storage (GB),OS,IP Address,MAC Address\n';
    const workstations = domainStore.getAllWorkstations();
    for (const ws of workstations) {
      csv += `${ws.id},Booth ${ws.boothNumber},${ws.hostname},${ws.healthStatus},${ws.occupancyStatus},${ws.networkStatus},${ws.examReadinessStatus},${ws.agentStatus},${ws.ramTotal},${ws.storageTotal},${ws.operatingSystem},${ws.ipAddress},${ws.macAddress}\n`;
    }
    return res.send(csv);
  }
  
  res.send('Entity,Status,Date\nSample,OK,2026-08-30\n');
});

// Vite Middleware for Development / Static serving for Production
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FETS SPACE server listening on port ${PORT}`);
  });
}

start();
