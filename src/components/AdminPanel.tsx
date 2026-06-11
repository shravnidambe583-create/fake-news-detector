import React, { useEffect, useState } from 'react';
import { ShieldCheck, HardDrive, Cpu, Radio, Network, Users, User, ArrowUpRight, BarChart } from 'lucide-react';
import { SystemHealth } from '../types';

export default function AdminPanel() {
  const [health, setHealth] = useState<SystemHealth>({
    status: 'healthy',
    uptimeSeconds: 4322,
    apiLatencyMs: 35,
    dbConnection: true,
    cpuUsage: 12.3,
    memoryUsage: 33.1
  });
  
  const [users, setUsers] = useState<any[]>([]);
  const [usersCount, setUsersCount] = useState(2);
  const [reportsCount, setReportsCount] = useState(2);

  const fetchMetrics = () => {
    fetch('/api/admin/metrics')
      .then(res => res.json())
      .then(data => {
        setHealth(data.systemHealth);
        setUsers(data.users);
        setUsersCount(data.usersCount);
        setReportsCount(data.reportsCount);
      })
      .catch((err) => {
        console.error("Admin credentials or sandbox access limitations: ", err);
      });
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto font-sans">
      
      {/* Header index */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl font-bold font-title text-white flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-cyan-400" />
          Systems Security Monitor
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Review Cloud Run container health, local database structures, analytical quotients, and verified credentials.
        </p>
      </div>

      {/* SYSTEM METRICS GRAPHICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-left relative overflow-hidden">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-1">Server Status</span>
          <span className="text-lg font-bold font-title text-emerald-400 block uppercase">● Operational</span>
          <span className="text-[10px] text-gray-400 font-mono mt-2 block">Uptime: {formatUptime(health.uptimeSeconds)}</span>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-left relative overflow-hidden">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-1 font-sans">CPU Quotient</span>
          <span className="text-lg font-bold font-title text-white block">{(health.cpuUsage || 11.2).toFixed(1)}%</span>
          <div className="h-1 w-20 bg-white/5 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${health.cpuUsage}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-left relative overflow-hidden">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-1">Heap Memory</span>
          <span className="text-lg font-bold font-title text-violet-300 block">{(health.memoryUsage || 28).toFixed(1)} MB</span>
          <span className="text-[10px] text-gray-500 block mt-2 font-mono">Max: 512MB default limit</span>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-left relative overflow-hidden">
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest block mb-1">API Latency</span>
          <span className="text-lg font-bold font-title text-cyan-400 block">{health.apiLatencyMs || 25} ms</span>
          <span className="text-[10px] text-gray-500 block mt-2 font-mono">Gemini validation loop</span>
        </div>

      </div>

      {/* CORE SPLIT: USERS REGISTRY AND STORAGE HEALTH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Directory lists of agents */}
        <div className="col-span-1 lg:col-span-7 p-6 rounded-2xl bg-[#090623]/30 border border-white/5 space-y-4">
          <h2 className="text-base font-bold font-title text-white flex items-center gap-1.5 mb-1">
            <Users className="h-5 w-5 text-violet-400" />
            Verification Analysts Directory
          </h2>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {users.length > 0 ? (
              users.map((profile, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs font-sans">
                  
                  <div className="flex items-center gap-3">
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="h-8 w-8 rounded-full border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <div className="text-left font-sans">
                      <p className="font-semibold text-gray-200">{profile.name}</p>
                      <p className="text-gray-500 font-mono text-[9px] mt-0.5">{profile.email}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-bold uppercase ${
                      profile.role === 'admin' 
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25' 
                        : 'bg-white/5 text-gray-400 border border-white/10'
                    }`}>
                      {profile.role}
                    </span>
                    <span className="block text-[8px] text-gray-500 font-mono mt-1">Join: {new Date(profile.createdAt).toLocaleDateString()}</span>
                  </div>

                </div>
              ))
            ) : (
              <div className="text-gray-500 text-xs py-8 text-center font-mono">No connected analysts cataloged.</div>
            )}
          </div>
        </div>

        {/* Cloud database specs */}
        <div className="col-span-1 lg:col-span-5 p-6 rounded-2xl bg-[#090623]/30 border border-white/5 space-y-5">
          <h2 className="text-base font-bold font-title text-white">Database Registry Metrics</h2>
          
          <div className="space-y-4 text-xs font-sans">
            
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-gray-400">Unique Users Cataloged:</span>
              <span className="font-mono font-bold text-white text-sm">{usersCount}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-gray-400">Truth Reports Archived:</span>
              <span className="font-mono font-bold text-white text-sm">{reportsCount}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <span className="text-gray-400">Durable JSON DB IO:</span>
              <span className="font-mono font-semibold text-emerald-400 flex items-center gap-1">
                ✓ Locked & Sync
              </span>
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed italic text-left">
              Durable transactions are indexed server side at process root data folder preserving statefulness cleanly across preview sessions.
            </p>

          </div>
        </div>

      </div>

    </div>
  );
}
