import React from 'react';
import { ShieldCheck, LogOut, LayoutDashboard, SearchCode, History, MessageSquare, ShieldAlert, User, LogIn } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export default function Navbar({ user, activeTab, setActiveTab, onLogout, onOpenAuth }: NavbarProps) {
  return (
    <nav id="navbar-main" className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/50 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 shadow-lg shadow-blue-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="font-title text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-300">
              TRUTHGUARD <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">AI</span>
            </span>
          </div>

          {/* Nav Tabs for Signed In Users */}
          {user && (
            <div className="hidden md:flex items-center space-x-1">
              <button
                id="nav-tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600/15 text-blue-300 border-b-2 border-blue-500'
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </button>

              <button
                id="nav-tab-verify"
                onClick={() => setActiveTab('verify')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'verify'
                    ? 'bg-blue-600/15 text-blue-300 border-b-2 border-blue-500'
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'
                }`}
              >
                <SearchCode className="h-4 w-4" />
                Verify News
              </button>

              <button
                id="nav-tab-history"
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'history'
                    ? 'bg-blue-600/15 text-blue-300 border-b-2 border-blue-500'
                    : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'
                }`}
              >
                <History className="h-4 w-4" />
                Library
              </button>

              {user.role === 'admin' && (
                <button
                  id="nav-tab-admin"
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'admin'
                      ? 'bg-purple-500/10 text-purple-300 border-b-2 border-purple-400'
                      : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'
                  }`}
                >
                  <ShieldAlert className="h-4 w-4 text-purple-400" />
                  Admin Monitor
                </button>
              )}
            </div>
          )}

          {/* Auth Controls */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2.5 cursor-pointer group bg-slate-900/40 hover:bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800"
                >
                  <img
                    id="user-avatar-navbar"
                    src={user.avatar}
                    alt={user.name}
                    className="h-7 w-7 rounded-full bg-blue-600/20 border border-blue-500/30 group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-100 font-sans leading-none">{user.name}</p>
                    <span className="text-[10px] text-blue-300 font-mono font-medium tracking-wide uppercase leading-none">
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  id="btn-logout"
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 rounded-full text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/15 transition-all"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <button
                id="btn-open-login"
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-600/25 transition-all cursor-pointer border border-blue-500/30"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
