// src/hooks/useMonitoring.ts - Custom hook for monitoring data
import { useState, useEffect, useCallback } from 'react';
import { MonitoringResponse, monitoringServices } from '../pages/Modules/Dashboard/services/monitoring.services';

interface UseMonitoringOptions {
  accountId: string;
  clientId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

interface UseMonitoringReturn {
  data: MonitoringResponse | null;
  loading: boolean;
  error: string | null;
  lastRefresh: Date | null;
  refresh: (forceRefresh?: boolean) => Promise<void>;
  clearError: () => void;
}

export const useMonitoring = ({
  accountId,
  clientId,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds default
}: UseMonitoringOptions): UseMonitoringReturn => {
  const [data, setData] = useState<MonitoringResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchData = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await monitoringServices.getDevicesMonitoringWithRefresh(
        accountId,
        clientId,
        forceRefresh
      );
      
      setData(response);
      setLastRefresh(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch monitoring data';
      setError(errorMessage);
      console.error('Monitoring fetch error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [accountId, clientId]);

  const refresh = useCallback(async (forceRefresh: boolean = false) => {
    await fetchData(forceRefresh);
  }, [fetchData]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (accountId) {
      fetchData();
    }
  }, [accountId, fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh || !accountId) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, accountId, fetchData]);

  return {
    data,
    loading,
    error,
    lastRefresh,
    refresh,
    clearError,
  };
};