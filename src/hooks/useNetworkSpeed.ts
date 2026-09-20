import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { NetworkOverview, NetworkTelemetryStatus, NetworkMonitoringConfig } from '../types';

export function useNetworkSpeed() {
  const [networkData, setNetworkData] = useState<NetworkOverview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSseConnected, setIsSseConnected] = useState<boolean>(false);
  const [tick, setTick] = useState<number>(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Background ticker so timestamps increment without triggering effects on networkData
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => (t + 1) % 10000);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute relative time text directly as a derived value
  const timeAgoText = useMemo(() => {
    if (!networkData?.lastUpdatedAt) {
      return 'Syncing...';
    }
    void tick;

    const diffSec = Math.max(0, Math.floor((Date.now() - new Date(networkData.lastUpdatedAt).getTime()) / 1000));

    if (networkData?.status === 'unavailable') {
      return 'Source unreachable';
    } else if (networkData?.status === 'stale') {
      return `Lapsed ${diffSec}s • Telemetry Stale`;
    } else if (networkData?.status === 'zero') {
      return 'Zero Traffic • Idle';
    } else if (diffSec <= 1) {
      return 'Live • Just now';
    } else if (diffSec < 60) {
      return `Live • ${diffSec}s lapse`;
    } else if (diffSec < 3600) {
      const mins = Math.floor(diffSec / 60);
      return `Updated ${mins}m ago`;
    } else {
      const hrs = Math.floor(diffSec / 3600);
      return `Updated ${hrs}h ago`;
    }
  }, [networkData?.lastUpdatedAt, networkData?.status, tick]);

  // Direct fetch function
  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch('/api/network/overview');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data: NetworkOverview = await res.json();
          setNetworkData(data);
          setIsLoading(false);
          return data;
        }
      }
    } catch {
      // If server unreachable
      setNetworkData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          status: 'unavailable'
        };
      });
      setIsLoading(false);
    }
    return null;
  }, []);

  // Instant live poll trigger (forces immediate fresh sample on the server)
  const pollNow = useCallback(async () => {
    try {
      const res = await fetch('/api/network/poll', { method: 'POST' });
      if (res.ok) {
        const data: NetworkOverview = await res.json();
        setNetworkData(data);
        setIsLoading(false);
        return data;
      }
    } catch {
      return await fetchOverview();
    }
    return null;
  }, [fetchOverview]);

  // Connect to SSE stream with polling fallback
  useEffect(() => {
    let isMounted = true;

    // Initial fetch to load data immediately
    fetchOverview();

    // Setup SSE
    try {
      const es = new EventSource('/api/network/stream');
      eventSourceRef.current = es;

      es.onopen = () => {
        if (isMounted) setIsSseConnected(true);
      };

      es.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const data: NetworkOverview = JSON.parse(event.data);
          setNetworkData(data);
          setIsLoading(false);
        } catch {
          // Parsing error fallback
        }
      };

      es.onerror = () => {
        if (isMounted) {
          setIsSseConnected(false);
          // Fallback to polling every 2 seconds if SSE disconnects
          if (!pollTimerRef.current) {
            pollTimerRef.current = setInterval(fetchOverview, 2000);
          }
        }
      };
    } catch {
      // EventSource not supported or failed: fallback to polling
      pollTimerRef.current = setInterval(fetchOverview, 2000);
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
  }, [fetchOverview]);

  // Update Config
  const updateConfig = async (newConfig: Partial<NetworkMonitoringConfig>) => {
    try {
      const res = await fetch('/api/network/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig)
      });
      if (res.ok) {
        await fetchOverview();
        return true;
      }
    } catch {
      // Error handling
    }
    return false;
  };

  // Simulate State (active, stale_simulated, unavailable_simulated, zero_simulated)
  const simulateState = async (state: 'active' | 'stale_simulated' | 'unavailable_simulated' | 'zero_simulated') => {
    try {
      const res = await fetch('/api/network/simulate-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: state })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.overview) {
          setNetworkData(json.overview);
        } else {
          await fetchOverview();
        }
        return true;
      }
    } catch {
      // Error
    }
    return false;
  };

  return {
    networkData,
    isLoading,
    isSseConnected,
    timeAgoText,
    refresh: pollNow,
    pollNow,
    fetchOverview,
    updateConfig,
    simulateState
  };
}
