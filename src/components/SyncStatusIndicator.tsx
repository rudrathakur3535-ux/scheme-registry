import React, { useState, useEffect } from 'react';
import { RefreshCw, Radio, CheckCircle2, Wifi, WifiOff, Clock, Database, AlertTriangle } from 'lucide-react';

interface SyncStatusIndicatorProps {
  lastSyncedAt: Date | null;
  lastSuccessfulExternalSyncTime?: string | null;
  isSyncing: boolean;
  autoSyncEnabled: boolean;
  syncNotification: string | null;
  syncError: string | null;
  totalSchemesCount: number;
  totalPresetsCount: number;
  syncSource: string;
  isCachedFallback?: boolean;
  externalSourceUrl?: string;
  changeReport?: {
    addedSchemes: number;
    updatedSchemes: number;
    totalSchemes: number;
    summary: string;
  } | null;
  onManualSync: () => void;
  onToggleAutoSync: () => void;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  lastSyncedAt,
  lastSuccessfulExternalSyncTime,
  isSyncing,
  autoSyncEnabled,
  syncNotification,
  syncError,
  totalSchemesCount,
  totalPresetsCount,
  syncSource,
  isCachedFallback = true,
  externalSourceUrl,
  changeReport,
  onManualSync,
  onToggleAutoSync,
}) => {
  const [timeAgo, setTimeAgo] = useState<string>('Just now');

  useEffect(() => {
    if (!lastSyncedAt) return;

    const updateAgo = () => {
      const seconds = Math.floor((new Date().getTime() - lastSyncedAt.getTime()) / 1000);
      if (seconds < 5) {
        setTimeAgo('Just now');
      } else if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`);
      } else {
        const mins = Math.floor(seconds / 60);
        setTimeAgo(`${mins}m ago`);
      }
    };

    updateAgo();
    const interval = setInterval(updateAgo, 3000);
    return () => clearInterval(interval);
  }, [lastSyncedAt]);

  return (
    <div className="bg-slate-900/95 text-slate-200 border border-slate-800 rounded-xl p-3.5 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
      
      {/* Sync Status Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          {isSyncing ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
            </span>
          ) : !isCachedFallback ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          ) : (
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80"></span>
          )}

          <div className="flex flex-col">
            <span className="text-[11px] font-bold tracking-wider uppercase text-slate-200 flex items-center gap-1.5">
              {isSyncing ? (
                <>
                  <Radio className="w-3.5 h-3.5 text-orange-400 animate-spin" />
                  <span>Checking External Registry...</span>
                </>
              ) : !isCachedFallback ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">External Dataset Synced</span>
                </>
              ) : (
                <>
                  <Database className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300">Using Local Cached Dataset</span>
                </>
              )}
            </span>

            <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3 text-slate-500 shrink-0" />
              <span>Source: <strong className="text-slate-300">{syncSource}</strong></span>
              <span className="text-slate-600">•</span>
              <span>Checked: <strong className="text-slate-300">{lastSyncedAt ? timeAgo : 'Initializing'}</strong></span>
            </span>
          </div>
        </div>

        {/* Total Stats Count Pill */}
        <div className="hidden md:flex items-center gap-2 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700/60 text-[11px]">
          <span className="font-semibold text-orange-400">{totalSchemesCount} Yojanas</span>
          <span className="text-slate-600">•</span>
          <span className="font-semibold text-blue-400">{totalPresetsCount} Test Profiles</span>
        </div>
      </div>

      {/* Sync Notification / Error message if active */}
      {syncNotification && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-300 bg-emerald-950/70 border border-emerald-800/80 px-3 py-1 rounded-lg animate-fade-in max-w-md truncate">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="truncate">{syncNotification}</span>
        </div>
      )}

      {syncError && !syncNotification && (
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-300 bg-amber-950/70 border border-amber-800/80 px-3 py-1 rounded-lg max-w-md truncate">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{syncError}</span>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleAutoSync}
          title={autoSyncEnabled ? "Pause periodic background sync (30s)" : "Resume periodic background sync (30s)"}
          className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer border ${
            autoSyncEnabled
              ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              : 'bg-orange-500 text-white border-orange-400 hover:bg-orange-600'
          }`}
        >
          {autoSyncEnabled ? 'Auto (30s)' : 'Enable Auto-Sync'}
        </button>

        <button
          onClick={onManualSync}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] rounded-lg transition-all shadow-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>

    </div>
  );
};
