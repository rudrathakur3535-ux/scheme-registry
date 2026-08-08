import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { ProfileCard } from './components/ProfileCard';
import { SchemeCard } from './components/SchemeCard';
import { JsonViewer } from './components/JsonViewer';
import { DocumentChecklist } from './components/DocumentChecklist';
import { SyncStatusIndicator } from './components/SyncStatusIndicator';
import { UserProfile, UserIntent, ParsingResult, TargetSector, SchemeMatch } from './types';
import { matchSchemes } from './utils/matcher';
import { PRESET_SAMPLES } from './data/schemes';
import { usePeriodicSync } from './hooks/usePeriodicSync';
import { sanitizeUserInput } from './utils/privacyGuard';
import { Filter, Search, Sparkles, AlertCircle, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

export default function App() {
  const syncState = usePeriodicSync(30); // 30-second periodic background sync
  const [activeTab, setActiveTab] = useState<'matches' | 'profile' | 'json' | 'docs'>('matches');
  const [inputText, setInputText] = useState<string>(PRESET_SAMPLES[0].rawInput);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [parsedResult, setParsedResult] = useState<ParsingResult | null>(null);
  const [parsedBy, setParsedBy] = useState<string>('Initialization Preset');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Global Theme Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('yojana_theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  useEffect(() => {
    localStorage.setItem('yojana_theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Filter & PII Guard States
  const [sectorFilter, setSectorFilter] = useState<TargetSector>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'eligible' | 'conditional' | 'ineligible'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [piiAlert, setPiiAlert] = useState<string | null>(null);

  // Function to request API profile extraction
  const handleParse = async (textToParse: string) => {
    if (!textToParse || !textToParse.trim()) return;

    // Apply Client-Side PII Privacy Guardrail
    const { sanitizedText, redactedTypes } = sanitizeUserInput(textToParse);
    if (redactedTypes.length > 0) {
      setInputText(sanitizedText);
      setPiiAlert(`Privacy Guardrail Active: Redacted ${redactedTypes.join(', ')} before sending to AI engine.`);
    } else {
      setPiiAlert(null);
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/parse-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input_text: sanitizedText.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();

      if (data.user_profile && data.intent) {
        setParsedResult({
          user_profile: data.user_profile,
          intent: data.intent
        });
        setParsedBy(data._parsed_by || 'gemini-3.6-flash');
      } else {
        throw new Error('Invalid JSON structure returned by server.');
      }
    } catch (err: any) {
      console.error('Parse error:', err);
      setErrorMessage(err?.message || 'Failed to parse user profile. Please check network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial parse on mount with default farmer preset
  useEffect(() => {
    handleParse(PRESET_SAMPLES[0].rawInput);
  }, []);

  // Sync profile update if user edits attributes manually in ProfileCard
  const handleUpdateProfile = (updatedProfile: UserProfile, updatedIntent: UserIntent) => {
    if (parsedResult) {
      setParsedResult({
        ...parsedResult,
        user_profile: updatedProfile,
        intent: updatedIntent
      });
      setParsedBy('Manual User Edit');
    }
  };

  // Calculate Matches dynamically based on current user_profile and intent against live synced schemes
  const schemeMatches: SchemeMatch[] = useMemo(() => {
    if (!parsedResult) return [];
    return matchSchemes(parsedResult.user_profile, parsedResult.intent, syncState.schemes);
  }, [parsedResult, syncState.schemes]);

  // Filtered Matches
  const filteredMatches = useMemo(() => {
    return schemeMatches.filter(m => {
      // Sector filter
      if (sectorFilter !== 'all' && m.scheme.sector !== sectorFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all' && m.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = m.scheme.name.toLowerCase().includes(q) || m.scheme.hindiName.toLowerCase().includes(q);
        const descMatch = m.scheme.description.toLowerCase().includes(q);
        return titleMatch || descMatch;
      }
      return true;
    });
  }, [schemeMatches, sectorFilter, statusFilter, searchQuery]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#F8FAFC] text-slate-900'} flex flex-col font-sans selection:bg-orange-500 selection:text-white transition-colors duration-200`}>
      
      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        matchesCount={schemeMatches.filter(m => m.status !== 'ineligible').length}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-5 flex-1">
        
        {/* Background Sync Indicator Bar */}
        <SyncStatusIndicator
          lastSyncedAt={syncState.lastSyncedAt}
          lastSuccessfulExternalSyncTime={syncState.lastSuccessfulExternalSyncTime}
          isSyncing={syncState.isSyncing}
          autoSyncEnabled={syncState.autoSyncEnabled}
          syncNotification={syncState.syncNotification}
          syncError={syncState.syncError}
          totalSchemesCount={syncState.totalSchemesCount}
          totalPresetsCount={syncState.totalPresetsCount}
          syncSource={syncState.syncSource}
          isCachedFallback={syncState.isCachedFallback}
          externalSourceUrl={syncState.externalSourceUrl}
          changeReport={syncState.changeReport}
          onManualSync={syncState.manualSync}
          onToggleAutoSync={syncState.toggleAutoSync}
        />

        {/* Client-Side PII Guardrail Active Alert */}
        {piiAlert && (
          <div className="bg-indigo-950/80 border border-indigo-800 text-indigo-200 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs animate-fade-in shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-medium">{piiAlert}</span>
            </div>
            <button 
              onClick={() => setPiiAlert(null)}
              className="text-indigo-400 hover:text-indigo-200 text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Top Input Panel */}
        <InputPanel
          inputText={inputText}
          setInputText={setInputText}
          onParse={handleParse}
          isLoading={isLoading}
          presetSamples={syncState.presetSamples}
        />

        {/* Potential Matches Highlight Alert Bar */}
        {parsedResult && activeTab === 'matches' && (
          <div className="min-h-16 py-3 bg-orange-50 dark:bg-orange-950/40 border-l-4 border-orange-500 rounded-r-xl flex items-center px-6 gap-4 shadow-2xs">
            <div className="bg-orange-100 dark:bg-orange-900/60 p-2 rounded-full shrink-0">
              <Sparkles className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider">
                Potential Scheme Matches Found ({schemeMatches.filter(m => m.status !== 'ineligible').length} Yojanas)
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-200 font-medium">
                User profile evaluated for PM-Kisan, Ayushman Bharat, PMAY, MGNREGA, and state welfare programs.
              </p>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab View Switcher */}
        {parsedResult && (
          <div className="space-y-6">
            
            {/* VIEW 1: ELIGIBLE YOJANAS MATCHES */}
            {activeTab === 'matches' && (
              <div className="space-y-4">
                
                {/* Sector & Search Filters Bar */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  
                  {/* Sector Filter Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
                    <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-wider shrink-0 flex items-center gap-1 mr-1">
                      <Filter className="w-3 h-3 text-orange-500" /> Sector:
                    </span>
                    {(['all', 'agriculture', 'education', 'housing', 'health', 'finance'] as TargetSector[]).map(s => (
                      <button
                        key={s}
                        onClick={() => setSectorFilter(s)}
                        className={`px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 capitalize ${
                          sectorFilter === s
                            ? 'bg-[#1E293B] dark:bg-orange-500 text-orange-400 dark:text-white font-bold shadow-2xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>

                  {/* Search Box & Status Filter */}
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Search schemes..."
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value as any)}
                      className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1.5 font-semibold"
                    >
                      <option value="all">All Match Status</option>
                      <option value="eligible">High Match (&gt;80%)</option>
                      <option value="conditional">Conditional</option>
                      <option value="ineligible">Ineligible</option>
                    </select>
                  </div>

                </div>

                {/* Scheme Cards Grid */}
                {filteredMatches.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 p-12 rounded-xl border border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 space-y-2">
                    <Layers className="w-8 h-8 mx-auto text-slate-400 dark:text-slate-600" />
                    <p className="font-semibold text-sm">No schemes match your current filter criteria.</p>
                    <button
                      onClick={() => { setSectorFilter('all'); setStatusFilter('all'); setSearchQuery(''); }}
                      className="text-xs font-bold text-orange-600 dark:text-orange-400 underline"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredMatches.map(match => (
                      <SchemeCard key={match.scheme.id} match={match} />
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* VIEW 2: EXTRACTED PROFILE & ATTRIBUTES */}
            {activeTab === 'profile' && (
              <ProfileCard
                profile={parsedResult.user_profile}
                intent={parsedResult.intent}
                onUpdateProfile={handleUpdateProfile}
                parsedBy={parsedBy}
              />
            )}

            {/* VIEW 3: STRICT JSON SCHEMA INSPECTOR */}
            {activeTab === 'json' && (
              <JsonViewer data={parsedResult} />
            )}

            {/* VIEW 4: CONSOLIDATED DOCUMENT CHECKLIST */}
            {activeTab === 'docs' && (
              <DocumentChecklist matches={schemeMatches} />
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="h-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-auto">
        <div className="flex gap-6">
          <span className="font-bold text-slate-700 dark:text-slate-300">PROCESSOR_ID: NIC_DB_PARSER_09</span>
          <span>LATENCY: 420ms</span>
          <span>TOKENS: 154</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          <span>ENCRYPTED_SSL_TRANSIT</span>
        </div>
      </footer>

    </div>
  );
}

