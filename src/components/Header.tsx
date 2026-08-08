import React from 'react';
import { ShieldCheck, Sparkles, FileCode2, BookOpenText, FileCheck, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  activeTab: 'matches' | 'profile' | 'json' | 'docs';
  setActiveTab: (tab: 'matches' | 'profile' | 'json' | 'docs') => void;
  matchesCount: number;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  matchesCount,
  darkMode,
  toggleDarkMode,
}) => {
  return (
    <header className="bg-[#1E293B] text-white shadow-md sticky top-0 z-40 border-b border-slate-700/50">
      {/* Top Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-amber-500 to-blue-600"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-lg shadow-sm">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">
                YojanaAI: Eligibility Engine
              </h1>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                v2.4.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              Govt. of India • Welfare Schemes Parser & Matcher
            </p>
          </div>
        </div>

        {/* System Status, Navigation Tabs & Theme Toggle */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-3">
          
          <div className="hidden lg:flex items-center gap-3 border-r border-slate-700 pr-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-[11px] font-medium text-slate-300 uppercase tracking-wider">SYSTEM ONLINE</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('matches')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'matches'
                  ? 'bg-orange-500 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Eligible Yojanas</span>
              <span className={`px-1.5 py-0.2 text-[10px] rounded font-bold ${
                activeTab === 'matches' ? 'bg-slate-900 text-orange-300' : 'bg-slate-800 text-slate-300'
              }`}>
                {matchesCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-orange-500 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpenText className="w-3.5 h-3.5" />
              <span>Extracted Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'json'
                  ? 'bg-orange-500 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Raw JSON</span>
            </button>

            <button
              onClick={() => setActiveTab('docs')}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'docs'
                  ? 'bg-orange-500 text-white font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Documents</span>
            </button>
          </div>

          {/* Global Light / Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle dark mode"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            {darkMode ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline text-amber-300">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-400" />
                <span className="hidden sm:inline text-blue-300">Dark</span>
              </>
            )}
          </button>

        </div>

      </div>
    </header>
  );
};


