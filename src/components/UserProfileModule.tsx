import React, { useState } from 'react';
import { User, Mail, Calendar, Key, BadgeCheck, Camera, Loader2, Zap } from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileModuleProps {
  user: UserProfile;
  reportsCount: number;
  onUpdateSuccess: (updatedUser: UserProfile) => void;
}

export default function UserProfileModule({ user, reportsCount, onUpdateSuccess }: UserProfileModuleProps) {
  const [name, setName] = useState(user.name);
  const [avatarSeed, setAvatarSeed] = useState(user.name);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    // generate a dicebear URL based on seed
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`;

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatar: avatarUrl })
      });
      const data = await response.json();
      if (response.ok && data.user) {
        onUpdateSuccess(data.user);
        setSuccess(true);
      }
    } catch (err) {
      alert("Error saving profile options.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-4xl mx-auto text-left font-sans">
      
      {/* Visual Identity Column */}
      <div className="col-span-1 lg:col-span-4 p-6 rounded-3xl bento-card border border-slate-800 flex flex-col items-center justify-center text-center space-y-4 bg-slate-900/30">
        <div className="relative group">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-24 w-24 rounded-full bg-blue-600/10 border-2 border-blue-500/30 group-hover:scale-105 transition-transform"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="h-5 w-5 text-white" />
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold font-title text-white">{user.name}</h2>
          <span className="text-xs font-mono font-bold uppercase text-blue-400 bg-blue-400/10 px-2.5 py-0.5 rounded border border-blue-500/20 mt-1 inline-block">
            {user.role}
          </span>
        </div>

        <div className="w-full border-t border-slate-800 pt-4 space-y-2 text-xs font-sans text-slate-450">
          <div className="flex items-center justify-between">
            <span>Verified Audits:</span>
            <span className="font-mono text-white font-bold">{reportsCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Registered timelog:</span>
            <span className="font-mono text-white">{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Edit Form Column */}
      <div className="col-span-1 lg:col-span-8 p-6 sm:p-8 rounded-3xl bento-card border border-slate-800 bg-slate-900/30 space-y-6">
        <h3 className="text-lg font-bold font-title bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-405 flex items-center gap-1.5 border-b border-slate-800 pb-3">
          <BadgeCheck className="h-5 w-5 text-blue-400" />
          Profile Customizer
        </h3>

        {success && (
          <div className="p-3 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-medium">
            Profile tags updated successfully. Refresh active sessions completed.
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><User className="h-4 w-4" /></span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-1.5">Email address (Immutable)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-600"><Mail className="h-4 w-4" /></span>
              <input
                type="text"
                disabled
                value={user.email}
                className="w-full bg-slate-950/60 border border-slate-900 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-500 focus:outline-none cursor-not-allowed font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-1.5">Avatar Vector Seed</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Zap className="h-4 w-4" /></span>
              <input
                type="text"
                value={avatarSeed}
                onChange={(e) => setAvatarSeed(e.target.value)}
                placeholder="Enter custom seed to generate bots"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 focus:outline-none transition-colors"
              />
            </div>
            <span className="block text-[10px] text-slate-500 mt-1 font-mono">Generates elegant bot-faces automatically using DiceBear vectors</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 mt-6 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-650 hover:from-blue-500 hover:to-purple-550 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="h-4.5 w-4.5 animate-spin text-white" />
                Updating index profile...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
