import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell, PieChart, Pie } from 'recharts';
import { ShieldCheck, Calendar, ShieldAlert, BadgeCheck, Zap, TrendingUp, AlertTriangle, UserCheck, ExternalLink } from 'lucide-react';
import { VerificationReport } from '../types';

interface DashboardProps {
  reports: VerificationReport[];
  onSelectReport: (report: VerificationReport) => void;
  user: any;
}

export default function Dashboard({ reports, onSelectReport, user }: DashboardProps) {
  const [stats, setStats] = useState({
    totalAnalyses: 142,
    fakeCount: 65,
    realCount: 42,
    misleadingCount: 20,
    partiallyTrueCount: 15,
    averageConfidence: 92.4,
    aiUsageCount: 485
  });
  
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [sourceData, setSourceData] = useState<any[]>([]);

  useEffect(() => {
    // Dynamic fetch of metrics and trends from fullstack server
    fetch('/api/analytics/overview')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }
        return res.json();
      })
      .then(data => {
        setStats(data.overview);
        setDailyData(data.dailyUsage);
        setSourceData(data.sourceReliability);
      })
      .catch(err => {
        console.error("Error loading dashboard metrics, fallback to local: ", err);
      });
  }, [reports.length]);

  // Render variables
  const pieDistribution = [
    { name: 'Real', value: stats.realCount, color: '#10b981' },
    { name: 'Fake', value: stats.fakeCount, color: '#f43f5e' },
    { name: 'Misleading', value: stats.misleadingCount, color: '#f59e0b' },
    { name: 'Partially True', value: stats.partiallyTrueCount, color: '#8b5cf6' }
  ];

  const recentItems = reports.slice(0, 5);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Banner info */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3.5xl font-bold font-title bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Verification Command Center
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back, {user?.name || "Alex"}. Your analytical suite is monitoring misinformation trends and logical fallacies.
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2 flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold font-mono">Gemini 3.5 Flash</span>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* METRIC COUNTERS OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bento-card p-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
          <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-widest block mb-2">Total Analyses</span>
          <span className="text-3xl sm:text-4xl font-extrabold font-title text-white block mt-1">{stats.totalAnalyses}</span>
          <p className="text-[10px] text-emerald-400 flex items-center gap-1 mt-3 font-semibold">
            <span>+12.4% vs last week</span>
          </p>
        </div>

        <div className="bento-card p-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
            <AlertTriangle className="h-4.5 w-4.5" />
          </div>
          <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-widest block mb-2">Fake / Misleading</span>
          <span className="text-3xl sm:text-4xl font-extrabold font-title text-rose-500 block mt-1">{stats.fakeCount + stats.misleadingCount}</span>
          <p className="text-[10px] text-rose-400/80 flex items-center gap-1 mt-3 font-medium">
            <span>Critical misinformation nodes</span>
          </p>
        </div>

        <div className="bento-card-glow p-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300">
            <BadgeCheck className="h-4.5 w-4.5" />
          </div>
          <span className="text-xs font-mono font-medium text-blue-300/70 uppercase tracking-widest block mb-2">Confidence Avg</span>
          <span className="text-3xl sm:text-4xl font-extrabold font-title text-white block mt-1">{stats.averageConfidence}%</span>
          <p className="text-[10px] text-blue-300 flex items-center gap-1 mt-3 font-medium">
            <span>Core factual certainty</span>
          </p>
        </div>

        <div className="bento-card p-6 relative overflow-hidden">
          <div className="absolute top-4 right-4 p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Zap className="h-4.5 w-4.5" />
          </div>
          <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-widest block mb-2">AI Usage Index</span>
          <span className="text-3xl sm:text-4xl font-extrabold font-title text-purple-300 block mt-1">{(stats.aiUsageCount || 1).toFixed(0)}</span>
          <p className="text-[10px] text-purple-400 flex items-center gap-1 mt-3 font-medium">
            <span>Gemini operations processed</span>
          </p>
        </div>

      </div>

      {/* CHARTS GRAPHICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* News Verification Daily Wave */}
        <div className="col-span-1 lg:col-span-7 p-6 rounded-3xl bg-slate-900/40 backdrop-blur-md border border-slate-800 text-left relative overflow-hidden">
          <h2 className="text-lg font-bold font-title text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-6">Verification Chronology</h2>
          <div className="h-[260px] w-full font-mono text-xs">
            {dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAnalyses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFake" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.15)" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090d16', border: '1px solid #1e293b', borderRadius: '12px', color: '#cbd5e1' }} 
                    itemStyle={{ color: '#60a5fa' }}
                  />
                  <Area type="monotone" dataKey="analyses" name="Total Checks" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAnalyses)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="fakeCount" name="Fake Flagged" stroke="#f43f5e" fillOpacity={1} fill="url(#colorFake)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">Compiling statistics logs...</div>
            )}
          </div>
        </div>

        {/* Verdict distribution pie */}
        <div className="col-span-1 lg:col-span-5 p-6 rounded-3xl bg-slate-900/40 backdrop-blur-md border border-slate-800 text-left">
          <h2 className="text-lg font-bold font-title text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-6">Verdict Segment Distribution</h2>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="h-[180px] w-[180px] font-mono text-xs relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieDistribution}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center font-title">
                <span className="text-2xl font-extrabold text-white">{stats.totalAnalyses}</span>
                <span className="text-[10px] text-slate-500 tracking-wider uppercase font-mono">Reports</span>
              </div>
            </div>

            <div className="flex-1 space-y-3 w-full sm:w-auto">
              {pieDistribution.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-sans">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-300 font-medium">{item.name}</span>
                  </div>
                  <span className="font-mono text-slate-400 text-xs">{item.value} ({Math.round((item.value / (stats.totalAnalyses || 1)) * 100)}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* LOWER SPLIT LAYOUT: SOURCE RELIABILITY AUDIT & RECENT CHRONOLOGIES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Source reliability rating bar */}
        <div className="col-span-1 lg:col-span-6 p-6 rounded-3xl bg-slate-900/40 backdrop-blur-md border border-slate-800 text-left">
          <h2 className="text-base font-bold font-title text-white mb-5 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-400" />
            Media Domain Reliability Indices
          </h2>
          <div className="space-y-4">
            {sourceData.length > 0 ? (
              sourceData.slice(0, 5).map((src, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-sans">
                    <span className="font-mono text-slate-300 font-medium">{src.source}</span>
                    <span className={`font-mono font-semibold ${src.trustScore > 75 ? 'text-emerald-400' : 'text-rose-450'}`}>
                      Score: {src.trustScore}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950/60 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${src.trustScore > 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-amber-500'}`} 
                      style={{ width: `${src.trustScore}%` }} 
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-xs py-10 text-center font-mono animate-pulse">loading domain registries...</div>
            )}
          </div>
        </div>

        {/* Recent custom verifications list */}
        <div className="col-span-1 lg:col-span-6 p-6 rounded-3xl bg-slate-900/40 backdrop-blur-md border border-slate-800 text-left flex flex-col">
          <h2 className="text-base font-bold font-title text-white mb-5">
            Analyst Feed Audit Activity
          </h2>
          
          <div className="flex-1 space-y-3 overflow-y-auto max-h-[250px] pr-1">
            {recentItems.length > 0 ? (
              recentItems.map((item, i) => (
                <div 
                  key={i} 
                  onClick={() => onSelectReport(item)}
                  className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-xs flex items-center justify-between gap-4 cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-200 truncate font-sans">
                      {item.sourceData?.title || item.sourceData?.textExcerpt || item.sourceData?.fileName || "Analyzed Claim Feed"}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500">
                      <span className="font-mono uppercase px-1.5 py-0.5 rounded bg-slate-900/80 text-slate-400 tracking-wide font-medium">
                        {item.sourceType}
                      </span>
                      <span>•</span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      item.verdict === 'Real' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      item.verdict === 'Fake' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      item.verdict === 'Misleading' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    }`}>
                      {item.verdict}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-slate-500 text-xs py-10 text-center font-mono">No analyzed items found in workspace.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
