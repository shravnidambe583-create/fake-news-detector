import React, { useState } from 'react';
import { Search, Star, Trash2, Calendar, CheckCircle2, AlertTriangle, HelpCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { VerificationReport, Verdict } from '../types';

interface HistoryModuleProps {
  reports: VerificationReport[];
  onSelectReport: (report: VerificationReport) => void;
  onDeleteReport: (id: string) => void;
}

export default function HistoryModule({ reports, onSelectReport, onDeleteReport }: HistoryModuleProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerdict, setFilterVerdict] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'confidence'>('newest');

  // Search, filter & sorting pipeline
  const processedReports = reports
    .filter(report => {
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = report.sourceData?.title?.toLowerCase().includes(searchLower) || false;
      const excerptMatch = report.sourceData?.textExcerpt?.toLowerCase().includes(searchLower) || false;
      const fileNameMatch = report.sourceData?.fileName?.toLowerCase().includes(searchLower) || false;
      const idMatch = report.reportId.toLowerCase().includes(searchLower);
      
      const textMatch = titleMatch || excerptMatch || fileNameMatch || idMatch;
      const verdictMatch = filterVerdict === 'all' || report.verdict.toLowerCase() === filterVerdict.toLowerCase();
      
      return textMatch && verdictMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return b.confidence - a.confidence;
      }
    });

  // Category Colors helper
  const categoryStyle = (v: string) => {
    switch(v) {
      case 'Real': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Fake': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      case 'Misleading': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default: return 'bg-violet-500/10 text-violet-400 border border-violet-500/20';
    }
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto font-sans">
      
      <div className="border-b border-slate-800/85 pb-4">
        <h1 className="text-2.5xl font-extrabold font-title bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 flex items-center gap-2.5">
          <Calendar className="h-6 w-6 text-blue-450" />
          Verification Audit Archives
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Search, categorize, delete or bookmark past misinformation assessments stored on the validation network.
        </p>
      </div>

      {/* FILTERS AND SEARCH PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Search Input block */}
        <div className="col-span-1 md:col-span-5 relative">
          <span className="source-icon absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500"><Search className="h-4 w-4" /></span>
          <input
            id="history-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search report IDs, URL links, names..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans"
          />
        </div>

        {/* Categories selector filter */}
        <div className="col-span-1 md:col-span-4 flex items-center gap-1.5">
          <span className="text-slate-500 text-xs font-mono font-medium hidden sm:inline uppercase">Verdict:</span>
          <select
            id="history-filter-verdict"
            value={filterVerdict}
            onChange={(e) => setFilterVerdict(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-805 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none font-mono"
          >
            <option value="all">All Categories</option>
            <option value="Real">Real Factuals</option>
            <option value="Fake">Fake Fabricated</option>
            <option value="Misleading">Misleading Context</option>
            <option value="Partially True">Partially True Blend</option>
          </select>
        </div>

        {/* Sorting index */}
        <div className="col-span-1 md:col-span-3 flex items-center gap-1.5">
          <span className="text-slate-500 text-xs font-mono font-medium hidden sm:inline uppercase">Sort:</span>
          <select
            id="history-sort-selector"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="flex-1 bg-slate-950 border border-slate-805 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl px-4 py-2.5 text-xs text-slate-300 focus:outline-none font-mono"
          >
            <option value="newest">Newest Audits</option>
            <option value="oldest">Oldest Chronological</option>
            <option value="confidence">Certainty Index</option>
          </select>
        </div>

      </div>

      {/* DISCHARGED REPORTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {processedReports.length > 0 ? (
          processedReports.map((report) => (
            <div 
              key={report.reportId}
              className={`p-5 rounded-3xl bento-card border border-slate-800 bg-slate-900/35 hover:border-blue-500/40 hover:bg-blue-600/5 transition-all text-left relative flex flex-col justify-between h-[210px] ${
                report.isFavorite ? 'shadow-lg shadow-amber-500/5 border-amber-550/25' : ''
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[10px] tracking-wider text-blue-400 font-bold uppercase">
                    ID: {report.reportId}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    {report.isFavorite && (
                      <Star className="h-4 w-4 text-amber-400 shrink-0" fill="currentColor" />
                    )}
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider uppercase ${categoryStyle(report.verdict)}`}>
                      {report.verdict}
                    </span>
                  </div>
                </div>

                <h3 
                  onClick={() => onSelectReport(report)}
                  className="font-title text-sm font-semibold text-slate-105 hover:text-blue-300 cursor-pointer transition-colors leading-snug line-clamp-2"
                >
                  {report.sourceData?.title || report.sourceData?.textExcerpt || report.sourceData?.fileName || "Analyzed claim feed"}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {report.summary}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 mt-3 text-[10px] text-slate-500 font-mono">
                <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-400 mr-2 uppercase bg-slate-950 px-2 py-0.5 rounded tracking-widest text-[8px] border border-slate-800/40">
                    {report.sourceType}
                  </span>
                  <button
                    onClick={() => onDeleteReport(report.reportId)}
                    className="p-1.5 rounded text-slate-500 hover:text-rose-450 hover:bg-rose-500/15 transition-colors cursor-pointer border border-transparent hover:border-rose-550/10"
                    title="Delete permanently"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-1 md:col-span-2 p-12 text-center rounded-3xl bento-card bg-slate-900/20 border border-slate-800">
            <RefreshCw className="h-10 w-10 text-slate-600 mx-auto mb-4 animate-spin" />
            <p className="text-sm text-slate-450">No matching reports found inside library filters.</p>
          </div>
        )}
      </div>

    </div>
  );
}
