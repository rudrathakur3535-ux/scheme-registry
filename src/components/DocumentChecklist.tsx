import React from 'react';
import { SchemeMatch } from '../types';
import { FileCheck, Building, HelpCircle, ExternalLink } from 'lucide-react';

interface DocumentChecklistProps {
  matches: SchemeMatch[];
}

export const DocumentChecklist: React.FC<DocumentChecklistProps> = ({ matches }) => {
  // Aggregate all unique documents from top eligible / conditional schemes
  const eligibleMatches = matches.filter(m => m.status !== 'ineligible');
  
  const docMap = new Map<string, string[]>();

  eligibleMatches.forEach(m => {
    m.scheme.requiredDocuments.forEach(doc => {
      const existing = docMap.get(doc) || [];
      existing.push(m.scheme.name);
      docMap.set(doc, existing);
    });
  });

  const uniqueDocs = Array.from(docMap.entries());

  const getDocAuthority = (docName: string) => {
    if (docName.includes('Aadhaar')) return 'UIDAI Portal / Aadhaar Kendra';
    if (docName.includes('Income') || docName.includes('Caste') || docName.includes('Domicile')) return 'Tehsil Office / State E-District Portal / Jan Seva Kendra';
    if (docName.includes('Land') || docName.includes('Khasra')) return 'Revenue Department / Bhulekh Portal (Land Records)';
    if (docName.includes('BPL') || docName.includes('Ration')) return 'Food & Civil Supplies Dept / Gram Panchayat';
    if (docName.includes('Bank') || docName.includes('Passbook')) return 'Nationalized Bank Branch (Aadhaar & NPCI Linked)';
    if (docName.includes('Skill') || docName.includes('Trade')) return 'MSME Portal / District Industries Centre (DIC)';
    return 'Common Service Centre (CSC) / Nearest Tehsil';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      
      {/* Panel Top Header Bar */}
      <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h2 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Consolidated Required Documents Checklist
        </h2>
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {uniqueDocs.length} Total Unique Documents
        </span>
      </div>

      <div className="p-5 space-y-5">
        {uniqueDocs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs font-medium">
            No eligible schemes selected yet. Enter a user profile to generate the document checklist.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uniqueDocs.map(([docName, schemeList], idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-[10px] font-black border border-emerald-200 dark:border-emerald-800">
                      {idx + 1}
                    </span>
                    {docName}
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 pl-7">
                  <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-200">
                    <Building className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                    <span>Issuing Authority: {getDocAuthority(docName)}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Required for: <span className="font-semibold text-slate-700 dark:text-slate-200">{schemeList.join(', ')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Guidance Box - Orange Accent */}
        <div className="p-4 bg-orange-50 dark:bg-orange-950/40 border-l-4 border-orange-500 rounded-r-lg text-xs space-y-2">
          <div className="font-bold flex items-center gap-1.5 text-orange-900 dark:text-orange-300 uppercase tracking-wider text-[11px]">
            <HelpCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" /> Application Assistance & Portal Info
          </div>
          <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
            You can apply for most central and state Yojanas online via official portals or visit your nearest <strong>Common Service Centre (CSC)</strong> / <strong>Jan Seva Kendra</strong> or <strong>Gram Panchayat Office</strong> with original copies of these documents.
          </p>
          <a
            href="https://myscheme.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-orange-900 dark:text-orange-300 underline hover:text-orange-950 dark:hover:text-orange-100"
          >
            <span>Visit Official National Portal (myScheme.gov.in)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

    </div>
  );
};

