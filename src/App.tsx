import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import VerifyModule from './components/VerifyModule';
import FloatingChatbot from './components/FloatingChatbot';
import HistoryModule from './components/HistoryModule';
import ReportDetails from './components/ReportDetails';
import AdminPanel from './components/AdminPanel';
import UserProfileModule from './components/UserProfileModule';
import AuthScreen from './components/AuthScreen';
import { UserProfile, VerificationReport } from './types';
import { ShieldCheck, Sparkles, Loader2, Library } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [reports, setReports] = useState<VerificationReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<VerificationReport | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Authenticate user on startup
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
          setActiveTab('dashboard'); // logged in goes to dashboard
        } else {
          setActiveTab('landing'); // otherwise landing page
        }
      })
      .catch(() => {
        setActiveTab('landing');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Fetch reports list
  const fetchReports = () => {
    fetch('/api/reports')
      .then(res => res.json())
      .then(data => {
        if (data.reports) setReports(data.reports);
      })
      .catch(err => {
        console.error("Failed fetching reports from workspace DB", err);
      });
  };

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user?.uid, activeTab]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setUser(null);
    setReports([]);
    setSelectedReport(null);
    setActiveTab('landing');
  };

  const handleAuthSuccess = (userProfile: UserProfile) => {
    setUser(userProfile);
    setAuthOpen(false);
    setActiveTab('dashboard');
  };

  const handleVerifySuccess = (newReport: VerificationReport) => {
    setSelectedReport(newReport);
    setReports(prev => [newReport, ...prev]);
    setActiveTab('report_details'); // Switch to details view
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
      if (res.ok) {
        setReports(prev => prev.filter(r => r.reportId !== reportId));
        if (selectedReport?.reportId === reportId) {
          setSelectedReport(null);
          setActiveTab('history');
        }
      }
    } catch (e) {
      alert("Error deleting report from ledger");
    }
  };

  const handleUpdateFavorite = (reportId: string, isFav: boolean) => {
    setReports(prev => prev.map(r => r.reportId === reportId ? { ...r, isFavorite: isFav } : r));
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 text-white space-y-4 font-mono select-none">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <span className="text-xs text-slate-500">Initializing TruthGuard factual indexes...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-955 text-slate-200 flex flex-col relative overflow-x-hidden">
      
      {/* Animated Neon Backdrop */}
      <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-blue-600/8 blur-[130px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute bottom-[5%] right-[-5%] w-[45%] h-[45%] bg-purple-600/5 blur-[130px] rounded-full pointer-events-none z-0"></div>
      
      {/* Dynamic Header */}
      <Navbar
        user={user}
        activeTab={activeTab === 'report_details' ? 'history' : activeTab}
        setActiveTab={(tab) => {
          setSelectedReport(null);
          setActiveTab(tab);
        }}
        onLogout={handleLogout}
        onOpenAuth={() => setAuthOpen(true)}
      />

      {/* Main workspace container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* LANDING PAGE GUEST */}
        {activeTab === 'landing' && (
          <LandingPage 
            onGetStarted={() => {
              if (user) {
                setActiveTab('verify');
              } else {
                setAuthOpen(true);
              }
            }}
            user={user}
          />
        )}

        {/* AUTHENTICATED COMMANDS */}
        {user && (
          <div className="animate-[fadeIn_0.4s_ease-out]">
            {activeTab === 'dashboard' && (
              <Dashboard
                reports={reports}
                onSelectReport={(rep) => {
                  setSelectedReport(rep);
                  setActiveTab('report_details');
                }}
                user={user}
              />
            )}

            {activeTab === 'verify' && (
              <VerifyModule
                onAnalysisSuccess={handleVerifySuccess}
                user={user}
              />
            )}

            {activeTab === 'history' && (
              <HistoryModule
                reports={reports}
                onSelectReport={(rep) => {
                  setSelectedReport(rep);
                  setActiveTab('report_details');
                }}
                onDeleteReport={handleDeleteReport}
              />
            )}

            {activeTab === 'admin' && user.role === 'admin' && (
              <AdminPanel />
            )}

            {activeTab === 'profile' && (
              <UserProfileModule
                user={user}
                reportsCount={reports.length}
                onUpdateSuccess={(updatedUser) => {
                  setUser(updatedUser);
                }}
              />
            )}

            {activeTab === 'report_details' && selectedReport && (
              <ReportDetails
                report={selectedReport}
                onBack={() => {
                  setSelectedReport(null);
                  setActiveTab('history');
                }}
                onDelete={handleDeleteReport}
                onToggleFavorite={handleUpdateFavorite}
              />
            )}
          </div>
        )}

      </main>

      {/* Auth Screen Modal Panel */}
      {authOpen && (
        <AuthScreen
          onSuccess={handleAuthSuccess}
          onClose={() => setAuthOpen(false)}
        />
      )}

      {/* Footer credits, hidden on prints */}
      <footer className="border-t border-slate-800/80 bg-slate-950/40 py-6 text-center text-xs text-slate-500 font-mono print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TruthGuard AI Verification Network. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-gray-300 cursor-pointer">Protocol Standard</span>
            <span className="hover:text-gray-300 cursor-pointer">Security Specs</span>
          </div>
        </div>
      </footer>

      {/* Persistent Floating Chatbot Assistant */}
      <FloatingChatbot user={user} />

    </div>
  );
}
