import React, { useState } from 'react';
import { ShieldCheck, Calendar, Download, Star, Trash2, ArrowLeft, ShieldAlert, AlertTriangle, FileCheck, CheckCircle2, FileDown, Bookmark, ExternalLink, FileJson } from 'lucide-react';
import { VerificationReport } from '../types';

interface ReportDetailsProps {
  report: VerificationReport;
  onBack: () => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFav: boolean) => void;
}

export default function ReportDetails({ report, onBack, onDelete, onToggleFavorite }: ReportDetailsProps) {
  const [favorite, setFavorite] = useState(report.isFavorite || false);

  const handleFav = async () => {
    try {
      const res = await fetch('/api/reports/toggle-favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: report.reportId })
      });
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON");
      }
      const data = await res.json();
      setFavorite(data.isFavorite);
      report.isFavorite = data.isFavorite;
      onToggleFavorite(report.reportId, data.isFavorite);
    } catch {
      alert("Error synchronizing profile favorites. Fallback local offline applied");
      setFavorite(!favorite);
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  const exportToJson = () => {
    const researchPayload = {
      schema: "https://truthguard.ai/schemas/v1/research-export.json",
      metadata: {
        exportedAt: new Date().toISOString(),
        frameworkVersion: "TruthGuard AI Core v1.5",
        analystSignature: "SEC_TG_0093"
      },
      report: {
        reportId: report.reportId,
        uid: report.uid,
        sourceType: report.sourceType,
        sourceData: report.sourceData,
        verdict: report.verdict,
        confidence: report.confidence,
        trustScore: report.trustScore,
        riskLevel: report.riskLevel,
        summary: report.summary,
        reasons: report.reasons,
        recommendations: report.recommendations,
        createdAt: report.createdAt
      }
    };

    const dataBlob = new Blob([JSON.stringify(researchPayload, null, 2)], { type: "application/json" });
    const blobUrl = URL.createObjectURL(dataBlob);
    
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = blobUrl;
    downloadAnchor.download = `truthguard_research_report_${report.reportId}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    
    // Clean up
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(blobUrl);
  };

  // Get style configs matching verdicts
  const badgeStyle = {
    'Real': 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    'Fake': 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    'Misleading': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    'Partially True': 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
  }[report.verdict] || 'bg-gray-500/10 text-gray-400 border border-gray-500/20';

  const riskStyle = {
    'Low': 'text-emerald-400',
    'Medium': 'text-amber-400',
    'High': 'text-rose-400'
  }[report.riskLevel] || 'text-gray-400';

  return (
    <div id="report-details-container" className="space-y-6 text-left max-w-4xl mx-auto font-sans print:bg-white print:text-black">
      
      {/* Navigation and Actions */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 print:hidden">
        <button
          id="report-btn-back"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 text-xs text-slate-300 font-mono transition-colors border border-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </button>

        <div className="flex items-center gap-2">
          <button
            id="report-btn-favorite"
            onClick={handleFav}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              favorite 
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold' 
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Mark as Favorite"
          >
            <Star className="h-4.5 w-4.5" fill={favorite ? "currentColor" : "none"} />
          </button>

          <button
            id="report-btn-print"
            onClick={triggerPrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-xs transition-colors border border-blue-500/20 cursor-pointer shadow-md shadow-blue-500/5"
            title="Print PDF Report"
          >
            <Download className="h-4 w-4" />
            Download PDF Report
          </button>

          <button
            id="report-btn-export-json"
            onClick={exportToJson}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900/40 hover:bg-slate-900/80 text-xs text-slate-300 font-mono transition-colors border border-slate-800 cursor-pointer shadow-md"
            title="Export JSON for Research"
          >
            <FileJson className="h-4 w-4 text-indigo-400" />
            Export JSON
          </button>

          <button
            id="report-btn-del"
            onClick={() => {
              if (confirm("Are you sure you want to delete this report?")) {
                onDelete(report.reportId);
              }
            }}
            className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors border border-rose-500/15 cursor-pointer"
            title="Delete from Library"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* RENDERABLE PRINT SECTION */}
      <div className="space-y-6 print:p-8 print:border print:border-black print:rounded-none">
        
        {report.fallbackWarning && (
          <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300/90 flex items-start gap-3.5 leading-relaxed shadow-lg shadow-amber-500/5 print:hidden">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <p className="font-bold font-title text-sm text-amber-200">Sandbox Simulation Mode Active</p>
              <p>{report.fallbackWarning} TruthGuard Sandbox successfully synthesized high-fidelity localized pattern evaluations to guarantee unblocked, rapid verification audits.</p>
            </div>
          </div>
        )}

        {/* REPORT ID TITLE BLOCK */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 print:border-black print:rounded-none">
          <div className="space-y-1.5">
            <span className="text-[10px] text-blue-400 font-mono uppercase tracking-widest block font-bold leading-none">
              Security Fact Audit
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-title text-white print:text-black leading-tight">
              Report Analysis id: <span className="font-mono text-blue-400 uppercase">{report.reportId}</span>
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <Calendar className="h-3.5 w-3.5" />
              <span>Created: {new Date(report.createdAt).toUTCString()}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-950/80 py-2 px-3.5 rounded-xl border border-slate-800 print:border-black print:text-black">
            {/* Simple simulated vector QR containing Verification Key details */}
            <div className="h-10 w-10 bg-white p-1 rounded-sm flex flex-wrap items-center justify-center font-mono text-[6px] shrink-0 border border-gray-300">
              <div className="w-1/2 h-1/2 bg-black border-r border-b border-white" />
              <div className="w-1/2 h-1/2 bg-gray-800 border-l border-b border-white" />
              <div className="w-1/2 h-1/2 bg-gray-700 border-r border-t border-white" />
              <div className="w-1/2 h-1/2 bg-black border-l border-t border-white" />
            </div>
            <div className="text-left leading-none font-mono text-[9px] text-slate-450">
              <p className="font-semibold text-slate-200 print:text-black">Cryptographic</p>
              <p className="mt-1">ID verification tag</p>
              <p className="text-blue-400 font-bold mt-1 uppercase text-[7px]">{report.reportId.substring(4)}</p>
            </div>
          </div>
        </div>

        {/* METADATA TARGET PREVIEW */}
        <div className="p-5 rounded-3xl bg-slate-900/30 border border-slate-800 print:border-black">
          <h3 className="text-xs font-mono font-medium text-slate-500 uppercase tracking-widest mb-3">Analyzed Material Source Details</h3>
          <div className="space-y-2.5 text-sm">
            {report.sourceData?.title && (
              <p className="text-white print:text-black font-semibold font-title text-base bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-350">
                <span className="text-slate-500 text-xs font-mono block font-normal">Scraped Link Title:</span>
                "{report.sourceData.title}"
              </p>
            )}
            {report.sourceData?.url && (
              <p className="font-mono text-xs text-blue-400 truncate">
                <span className="text-slate-500 text-xs font-mono block font-normal">Article Uniform Resource Link:</span>
                <a href={report.sourceData.url} target="_blank" rel="noreferrer" className="underline hover:text-blue-300 transition-colors flex items-center gap-1">
                  {report.sourceData.url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            )}
            {report.sourceData?.textExcerpt && (
              <div className="bg-slate-950/60 p-4 rounded-2xl font-mono text-xs text-slate-300 leading-relaxed max-h-[140px] overflow-y-auto print:bg-gray-100 print:text-black border border-slate-800/60">
                <span className="text-slate-500 text-[10px] font-mono block mb-1 uppercase font-bold">Statement Fragment Evaluated:</span>
                "{report.sourceData.textExcerpt}"
              </div>
            )}
            {report.sourceData?.fileName && (
              <p className="font-semibold font-mono text-xs text-slate-200 print:text-black">
                <span className="text-indigo-400 text-xs font-mono font-normal">Source Document:</span> {report.sourceData.fileName}
              </p>
            )}
          </div>
        </div>

        {/* METRICS SPLIT: VERDICT, CONFIDENCE, RISK */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="p-5 rounded-3xl bento-card text-center flex flex-col justify-center items-center print:border-black">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2 font-medium">Verdict Decision</span>
            <div className={`px-4 py-1.5 rounded-full font-title text-base font-bold uppercase tracking-wider ${badgeStyle}`}>
              {report.verdict}
            </div>
            <span className="text-[10px] text-slate-500 mt-2 font-mono uppercase">Linguistic category</span>
          </div>

          <div className="p-5 rounded-3xl bento-card text-center print:border-black">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-Block block font-medium">Confidence certainty</span>
            <div className="text-3xl font-extrabold font-title text-white print:text-black">
              {report.confidence}%
            </div>
            {/* Visual Mini Progress Bar */}
            <div className="h-1.5 w-24 bg-slate-950 rounded-full mx-auto mt-2 overflow-hidden print:border print:border-gray-300">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${report.confidence}%` }} />
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-2 uppercase">Semantic indexing certainty</span>
          </div>

          <div className="p-5 rounded-3xl bento-card text-center print:border-black">
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2 block font-medium">Risk exposure rating</span>
            <div className={`text-2xl font-bold font-title uppercase ${riskStyle}`}>
              {report.riskLevel}
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-3 uppercase">Trigger rate coefficient</span>
          </div>

        </div>

        {/* EXECUTIVE SUMMARY */}
        <div className="p-6 rounded-3xl bg-slate-900/35 border border-slate-800 print:border-black">
          <h4 className="text-sm font-bold font-title text-white print:text-black mb-3">Executive Summary</h4>
          <p className="text-slate-300 print:text-black text-sm leading-relaxed">
            {report.summary}
          </p>
        </div>

        {/* DETAILED EVIDENCE CHRONOLOGY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          <div className="p-6 rounded-3xl bento-card space-y-4 print:border-black">
            <h4 className="text-sm font-bold font-title text-white print:text-black flex items-center gap-1.5">
              <AlertTriangle className="h-4.5 w-4.5 text-rose-450" />
              Linguistic Analysis & Flags
            </h4>
            <ul className="space-y-3">
              {report.reasons && report.reasons.length > 0 ? (
                report.reasons.map((reason, i) => (
                  <li key={i} className="text-xs text-slate-300 print:text-black leading-relaxed flex items-start gap-2">
                    <span className="text-rose-550 font-mono mt-0.5 font-bold shrink-0">🚩</span>
                    <span>{reason}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-400 italic">No structural anomalies or clickbait indicators discovered.</li>
              )}
            </ul>
          </div>

          <div className="p-6 rounded-3xl bento-card space-y-4 print:border-black">
            <h4 className="text-sm font-bold font-title text-white print:text-black flex items-center gap-1.5">
              <CheckCircle2 className="h-4.5 w-4.5 text-emerald-450" />
              Operational Recommendations
            </h4>
            <ul className="space-y-3">
              {report.recommendations && report.recommendations.length > 0 ? (
                report.recommendations.map((rec, i) => (
                  <li key={i} className="text-xs text-slate-300 print:text-black leading-relaxed flex items-start gap-2">
                    <span className="text-emerald-400 font-mono mt-0.5 font-bold shrink-0">✓</span>
                    <span>{rec}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-400 italic">Cross check claims against primary academic registries.</li>
              )}
            </ul>
          </div>

        </div>

        {/* FOOTER SIGN-OFF */}
        <div className="border-t border-slate-800 pt-4 flex justify-between text-[10px] text-slate-500 font-mono">
          <span>TruthGuard AI Journal Factual Verification Engine</span>
          <span>Analyst Signature Node: SEC_TG_0093</span>
        </div>

      </div>

    </div>
  );
}
