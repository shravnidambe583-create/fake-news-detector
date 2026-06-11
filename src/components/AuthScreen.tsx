import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, User, Eye, EyeOff, Loader2, LogIn, Sparkles } from 'lucide-react';

interface AuthScreenProps {
  onSuccess: (userProfile: any) => void;
  onClose: () => void;
}

export default function AuthScreen({ onSuccess, onClose }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isSignUp) {
      if (!name.trim()) return setErrorMsg('Profile Name is required');
      if (password.length < 6) return setErrorMsg('Password must be at least 6 characters long');
      if (password !== confirmPassword) return setErrorMsg('Passwords do not match');
    }

    setLoading(true);
    const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
    const payload = isSignUp ? { name, email, password } : { email, password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setSuccessMsg(isSignUp ? 'Account registered successfully!' : 'Logged in successfully!');
      setTimeout(() => {
        onSuccess(data.user);
      }, 800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSimulate = (provider: 'Google' | 'GitHub') => {
    setLoading(true);
    setErrorMsg('');
    setTimeout(() => {
      setLoading(false);
      const simulatedEmail = `${provider.toLowerCase()}User@truthguard.ai`;
      const simulatedUser = {
        uid: `oauth_${provider.toLowerCase()}_${Date.now()}`,
        name: `${provider} Verification Officer`,
        email: simulatedEmail,
        avatar: provider === 'Google' 
          ? 'https://api.dicebear.com/7.x/bottts/svg?seed=google' 
          : 'https://api.dicebear.com/7.x/identicon/svg?seed=github',
        role: 'user',
        createdAt: new Date().toISOString()
      };
      
      // Auto-register simulated oauth on backend using login endpoint
      fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: simulatedEmail, password: 'oauth_simulated_bypass_key_123' })
      }).then(() => {
        onSuccess(simulatedUser);
      }).catch((e) => {
        onSuccess(simulatedUser);
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-500" />
        
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-550 shadow-md mb-4 shadow-blue-500/10">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold font-title text-white">
            {isSignUp ? 'Create TruthGuard Account' : 'Welcome back, Analyst'}
          </h2>
          <p className="text-slate-500 text-xs mt-1.5 font-normal">
            {isSignUp ? 'Join our high-tech journal factual checking node' : 'Enter your credentials to unlock reports'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-450 font-sans leading-relaxed">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-450 font-sans leading-relaxed">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-mono font-medium text-slate-505 uppercase tracking-widest mb-1.5">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><User className="h-4 w-4" /></span>
                <input
                  id="auth-input-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Verification Agent"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono font-medium text-slate-505 uppercase tracking-widest mb-1.5">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><Mail className="h-4 w-4" /></span>
              <input
                id="auth-input-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@truthguard.ai"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-slate-505 uppercase tracking-widest mb-1.5 font-sans">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><Lock className="h-4 w-4" /></span>
              <input
                id="auth-input-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl pl-10 pr-10 py-2.5 text-sm text-slate-200 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-mono font-medium text-slate-505 uppercase tracking-widest mb-1.5">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500"><Lock className="h-4 w-4" /></span>
                <input
                  id="auth-input-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl pl-10 pr-10 py-2.5 text-sm text-slate-200 focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          {!isSignUp && (
            <div className="flex items-center justify-between text-xs font-sans mt-1">
              <label className="flex items-center gap-1.5 text-slate-450 select-none cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded bg-slate-950 accent-blue-600 text-blue-600 outline-none border border-slate-800" />
                <span>Remember me</span>
              </label>
              <button 
                type="button"
                onClick={() => alert("Check process.env for your credentials reset instructions or configure an SMTP server. For preview, use login to auto-generate a custom profile!")}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button
            id="auth-btn-submit"
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-550 text-white font-semibold text-sm hover:shadow-lg hover:shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer border border-blue-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" />
                Authenticating...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                {isSignUp ? 'Create Account' : 'Sign In'}
              </>
            )}
          </button>
        </form>

        {/* OAUTH MOCKS */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
          <span className="relative bg-[#0b0f19] px-3 text-xs text-slate-550 uppercase tracking-widest font-mono">Or authorize with</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            id="auth-btn-google"
            onClick={() => handleOAuthSimulate('Google')}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <svg className="h-4 w-4 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.18 0-5.75-2.57-5.75-5.75s2.57-5.75 5.75-5.75c1.44 0 2.76.54 3.77 1.43l2.435-2.435C16.89 3.99 14.695 3 12.24 3 6.915 3 2.6 7.315 2.6 12.64s4.315 9.64 9.64 9.64c5.56 0 9.245-3.91 9.245-9.405 0-.63-.055-1.24-.165-1.83H12.24z"/>
            </svg>
            Google
          </button>
          <button
            id="auth-btn-github"
            onClick={() => handleOAuthSimulate('GitHub')}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-950 hover:bg-slate-900 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <svg className="h-4 w-4 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            GitHub
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Join Trust Node"}
          </button>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-slate-500 hover:text-white font-bold text-sm cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
