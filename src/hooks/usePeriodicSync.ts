import { useState, useEffect, useCallback, useRef } from 'react';
import { Scheme, PresetSample } from '../types';
import { INDIAN_SCHEMES, PRESET_SAMPLES } from '../data/schemes';

export interface SyncState {
  schemes: Scheme[];
  presetSamples: PresetSample[];
  lastSyncedAt: Date | null;
  lastSuccessfulExternalSyncTime: string | null;
  isSyncing: boolean;
  autoSyncEnabled: boolean;
  syncIntervalSeconds: number;
  syncError: string | null;
  syncNotification: string | null;
  totalSchemesCount: number;
  totalPresetsCount: number;
  syncSource: string;
  isCachedFallback: boolean;
  externalSourceUrl: string;
  changeReport: {
    addedSchemes: number;
    updatedSchemes: number;
    totalSchemes: number;
    summary: string;
  } | null;
}

export function usePeriodicSync(intervalSeconds: number = 30) {
  const [schemes, setSchemes] = useState<Scheme[]>(INDIAN_SCHEMES);
  const [presetSamples, setPresetSamples] = useState<PresetSample[]>(PRESET_SAMPLES);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [lastSuccessfulExternalSyncTime, setLastSuccessfulExternalSyncTime] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);
  const [syncSource, setSyncSource] = useState<string>('Local Cached Scheme Registry');
  const [isCachedFallback, setIsCachedFallback] = useState<boolean>(true);
  const [externalSourceUrl, setExternalSourceUrl] = useState<string>('');
  const [changeReport, setChangeReport] = useState<SyncState['changeReport']>(null);

  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchLatestData = useCallback(async (isManual: boolean = false) => {
    setIsSyncing(true);
    setSyncError(null);

    try {
      const res = await fetch('/api/schemes/sync');
      if (!res.ok) {
        throw new Error(`Sync server responded with status ${res.status}`);
      }

      const data = await res.json();

      if (data.schemes && Array.isArray(data.schemes)) {
        setSchemes(data.schemes);
      }

      if (data.presetSamples && Array.isArray(data.presetSamples)) {
        setPresetSamples(data.presetSamples);
      }

      if (data.source) {
        setSyncSource(data.source);
      }

      setIsCachedFallback(Boolean(data.isCachedFallback));
      setExternalSourceUrl(data.externalSourceUrl || '');
      setLastSuccessfulExternalSyncTime(data.lastSuccessfulExternalSyncTime || null);

      if (data.changeReport) {
        setChangeReport(data.changeReport);
      }

      const now = new Date();
      setLastSyncedAt(now);

      if (data.lastSyncError) {
        setSyncError(`External fetch offline (${data.lastSyncError}). Using local cached snapshot.`);
      }

      const summaryMsg = data.changeReport?.summary || 
        `Fetched ${data.totalSchemes || data.schemes?.length || 0} schemes`;
      
      setSyncNotification(summaryMsg);

      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
      notificationTimeoutRef.current = setTimeout(() => {
        setSyncNotification(null);
      }, 5000);

    } catch (err: any) {
      console.warn('Periodic sync notice:', err.message || err);
      setSyncError(`Sync offline: ${err.message || 'Server unreachable'}`);
      setIsCachedFallback(true);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Periodic background timer effect
  useEffect(() => {
    // Initial fetch on mount
    fetchLatestData(false);

    if (!autoSyncEnabled) return;

    const intervalId = setInterval(() => {
      fetchLatestData(false);
    }, intervalSeconds * 1000);

    return () => {
      clearInterval(intervalId);
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [autoSyncEnabled, intervalSeconds, fetchLatestData]);

  const toggleAutoSync = () => {
    setAutoSyncEnabled(prev => !prev);
  };

  const manualSync = () => {
    fetchLatestData(true);
  };

  return {
    schemes,
    presetSamples,
    lastSyncedAt,
    lastSuccessfulExternalSyncTime,
    isSyncing,
    autoSyncEnabled,
    syncIntervalSeconds: intervalSeconds,
    syncError,
    syncNotification,
    totalSchemesCount: schemes.length,
    totalPresetsCount: presetSamples.length,
    syncSource,
    isCachedFallback,
    externalSourceUrl,
    changeReport,
    toggleAutoSync,
    manualSync
  };
}
