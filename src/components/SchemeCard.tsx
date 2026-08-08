import React from 'react';
import { SchemeMatch } from '../types';
import { CheckCircle2, AlertTriangle, ExternalLink, FileText, ChevronRight, Sparkles, Building2 } from 'lucide-react';

interface SchemeCardProps {
  match: SchemeMatch;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({ match }) => {
  const { scheme, status, matchScore, metCriteria, unmetCriteria, missingDataWarnings, counterfactualSuggestions } = match;

  let badgeColor = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
  let badgeLabel = 'Eligible (High Match)';

  if (status === 'conditional') {
    badgeColor = 'bg-orange-100 dark:bg-orange-950/80 text-orange-900 dark:text-orange-300 border-orange-300 dark:border-orange-800';
    badgeLabel = 'Likely Eligible / Conditional';
  } else if (status === 'ineligible') {
    badgeColor = 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    badgeLabel = 'Criteria Ineligible';
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all p-5 flex flex-col justify-between space-y-4">
      
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-1">
              <Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500" /> {scheme.level} Scheme • {scheme.sector.toUpperCase()}
            </span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">
              {scheme.name}
            </h3>
            <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 font-hindi mt-0.5">
              {scheme.hindiName}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className={`px-2.5 py-0.5 rounded border text-xs font-bold ${badgeColor}`}>
              {matchScore}% Match
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase">
              {badgeLabel}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mt-2 leading-relaxed">
          {scheme.description}
        </p>
      </div>

      {/* Benefits Box - Accent Callout */}
      <div className="p-3 bg-orange-50 dark:bg-orange-950/40 border-l-4 border-orange-500 rounded-r-lg">
        <div className="text-[10px] font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider flex items-center gap-1 mb-0.5">
          <Sparkles className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" /> Key Yojana Benefits
        </div>
        <div className="text-xs font-bold text-orange-950 dark:text-orange-100">
          {scheme.benefits}
        </div>
      </div>

      {/* Criteria Breakdown */}
      <div className="space-y-2 text-xs">
        {/* Met Criteria */}
        {metCriteria.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              ✓ Verified Eligibility Criteria ({metCriteria.length})
            </span>
            <ul className="space-y-1">
              {metCriteria.map((criterion, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Unmet Criteria */}
        {unmetCriteria.length > 0 && (
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">
              ✕ Ineligible Criteria ({unmetCriteria.length})
            </span>
            <ul className="space-y-1">
              {unmetCriteria.map((criterion, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-rose-800 dark:text-rose-300 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Counterfactual Explanation Box */}
        {counterfactualSuggestions && counterfactualSuggestions.length > 0 && (
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/80 rounded-lg space-y-1 my-1">
            <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider flex items-center gap-1">
              💡 Counterfactual Advice (What exact change qualifies you)
            </span>
            <ul className="space-y-1">
              {counterfactualSuggestions.map((suggestion, idx) => (
                <li key={idx} className="text-[11px] text-blue-900 dark:text-blue-200 leading-snug">
                  • {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Missing Warnings */}
        {missingDataWarnings.length > 0 && (
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider block">
              ! Unspecified Attributes ({missingDataWarnings.length})
            </span>
            <ul className="space-y-1">
              {missingDataWarnings.map((warning, idx) => (
                <li key={idx} className="text-orange-900 dark:text-orange-200 text-[11px] bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-800">
                  • {warning}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Required Documents */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1.5">
          <FileText className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Required Application Documents
        </div>
        <div className="flex flex-wrap gap-1">
          {scheme.requiredDocuments.map((doc, idx) => (
            <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-medium">
              {doc}
            </span>
          ))}
        </div>
      </div>

      {/* Official Portal Button */}
      <div className="pt-2">
        <a
          href={scheme.officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-lg bg-[#1E293B] hover:bg-slate-800 dark:bg-orange-500 dark:hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-xs"
        >
          <span>Apply on Official Portal ({scheme.name.split(' ')[0]})</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

    </div>
  );
};

