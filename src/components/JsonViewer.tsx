import React, { useState } from 'react';
import { ParsingResult } from '../types';
import { Copy, Check, Download, Code2, Terminal, ShieldCheck } from 'lucide-react';

interface JsonViewerProps {
  data: ParsingResult;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  // Filter out meta parameters from the strict specification JSON
  const strictOutput = {
    user_profile: data.user_profile,
    intent: data.intent
  };

  const jsonString = JSON.stringify(strictOutput, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yojana_user_profile.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#1E293B] rounded-xl border border-slate-800 shadow-xl overflow-hidden text-slate-200 space-y-0">
      
      {/* Header */}
      <div className="px-5 py-3 bg-slate-800 border-b border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              Structured Extraction (JSON Schema)
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1 lowercase">
                <ShieldCheck className="w-3 h-3" /> valid_schema
              </span>
            </h3>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-700 hover:bg-slate-600 text-[11px] font-bold text-slate-200 transition-all border border-slate-600 uppercase tracking-wider"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-orange-400" />}
            <span>{copied ? 'Copied' : 'Copy Schema'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white font-bold text-[11px] transition-all shadow-xs uppercase tracking-wider"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .json</span>
          </button>
        </div>
      </div>

      {/* Code Editor Display */}
      <div className="p-6 overflow-x-auto font-mono text-xs leading-relaxed bg-[#0F172A] text-emerald-400 max-h-[500px]">
        <pre>{jsonString}</pre>
      </div>

      {/* cURL API Sample Footer */}
      <div className="px-5 py-3.5 bg-slate-900 border-t border-slate-800 text-xs space-y-2">
        <div className="font-bold text-slate-300 flex items-center gap-2 uppercase tracking-wider text-[10px]">
          <Terminal className="w-3.5 h-3.5 text-orange-400" /> API Curl Sample Usage
        </div>
        <div className="bg-[#0F172A] p-3 rounded border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
          curl -X POST http://localhost:3000/api/parse-profile \<br />
          &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
          &nbsp;&nbsp;-d &#123; "input_text": "Mera naam Rajesh Kumar hai. UP Bareilly farmer 1.5 acre zameen BPL" &#125;
        </div>
      </div>

    </div>
  );
};

