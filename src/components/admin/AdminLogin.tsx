import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, AlertCircle, Database, CheckCircle2, ShieldAlert } from 'lucide-react';
import { signInAdmin } from '../../services/authService';
import { isSupabaseConfigured, setSupabaseConfig, getSupabaseConfig } from '../../lib/supabase';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBackToHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Setup / Connection config modal for easy credential entry
  const [showConfigModal, setShowConfigModal] = useState(!isSupabaseConfigured());
  const initialConfig = getSupabaseConfig();
  const [customUrl, setCustomUrl] = useState(initialConfig.url);
  const [customKey, setCustomKey] = useState(initialConfig.anonKey);
  const [configSuccess, setConfigSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (!isSupabaseConfigured()) {
      setErrorMessage('Supabase is not configured yet. Please configure your Project URL and Anon Key below.');
      setShowConfigModal(true);
      return;
    }

    setIsLoading(true);
    try {
      await signInAdmin(email, password);
      onLoginSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim() || !customKey.trim()) {
      setErrorMessage('Both Supabase URL and Anon Key are required.');
      return;
    }

    setSupabaseConfig(customUrl.trim(), customKey.trim());
    setConfigSuccess(true);
    setTimeout(() => {
      setConfigSuccess(false);
      setShowConfigModal(false);
      setErrorMessage(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#101010] text-[#F5F3EF] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#E7A96B]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top back button */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-mono text-[#A1A1AA] hover:text-[#E7A96B] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portfolio</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* AV Creations Emblem Header */}
        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto rounded-xl bg-transparent flex items-center justify-center p-1">
            <img
              src="/assets/aistudio/Glossy_AV_Creations_Mascot_Emblem_e418bb80.png"
              alt="AV Creations Studio Emblem"
              className="w-full h-full object-contain drop-shadow-lg"
            />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#F5F3EF]">
            Admin Studio Portal
          </h1>
          <p className="text-xs text-[#A1A1AA] font-mono">
            Secure Authentication · AV Creation
          </p>
        </div>

        {/* Supabase unconfigured warning banner */}
        {!isSupabaseConfigured() && (
          <div className="mt-6 p-4 rounded-lg bg-[#241A12] border border-[#E7A96B]/40 text-xs space-y-2">
            <div className="flex items-center gap-2 text-[#E7A96B] font-semibold">
              <Database className="w-4 h-4" />
              <span>Supabase Connection Needed</span>
            </div>
            <p className="text-[#D4D4D8] leading-relaxed">
              To authenticate administrators and manage products, provide your Supabase Project URL and Anon Key.
            </p>
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-3 py-1.5 bg-[#E7A96B] text-[#101010] font-semibold rounded text-xs hover:bg-[#F2BA82] transition-colors cursor-pointer"
            >
              Configure Supabase Keys
            </button>
          </div>
        )}

        {/* Main Login Card */}
        <div className="mt-6 bg-[#161618] border border-[#27272A] py-8 px-6 sm:px-8 rounded-xl shadow-2xl">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-950/40 border border-red-500/40 flex items-start gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                Administrator Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@avcreation.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1C1C20] border border-[#2D2D32] rounded-md pl-10 pr-3.5 py-2.5 text-xs text-[#F5F3EF] placeholder-[#555] focus:outline-none focus:border-[#E7A96B] transition-colors"
                />
                <Mail className="w-4 h-4 text-[#71717A] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#1C1C20] border border-[#2D2D32] rounded-md pl-10 pr-3.5 py-2.5 text-xs text-[#F5F3EF] placeholder-[#555] focus:outline-none focus:border-[#E7A96B] transition-colors"
                />
                <Lock className="w-4 h-4 text-[#71717A] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#E7A96B] hover:bg-[#F2BA82] text-[#101010] font-bold text-xs uppercase tracking-wider rounded-md transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-[#101010] border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Admin Rights...</span>
                  </>
                ) : (
                  <span>Sign In to Dashboard</span>
                )}
              </button>
            </div>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-4 border-t border-[#222226] flex items-center gap-2 text-[11px] text-[#71717A]">
            <ShieldAlert className="w-3.5 h-3.5 text-[#E7A96B] shrink-0" />
            <span>Protected route. Only authorized administrators with verified roles may enter.</span>
          </div>
        </div>

        {/* Supabase Connection Setup Drawer/Modal */}
        {showConfigModal && (
          <div className="mt-6 bg-[#161618] border border-[#27272A] p-6 rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#222226] pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#E7A96B] flex items-center gap-2">
                <Database className="w-3.5 h-3.5" />
                <span>Supabase Configuration</span>
              </h3>
              {isSupabaseConfigured() && (
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="text-xs text-[#71717A] hover:text-[#FFFFFF]"
                >
                  Close
                </button>
              )}
            </div>

            <p className="text-[11px] text-[#A1A1AA] leading-relaxed">
              Enter your Supabase project credentials. They will be stored securely for this session or you can define <code className="text-[#E7A96B]">VITE_SUPABASE_URL</code> and <code className="text-[#E7A96B]">VITE_SUPABASE_ANON_KEY</code> in <code className="text-[#F5F3EF]">.env</code>.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-[#A1A1AA] mb-1">
                  Project URL (e.g. https://xyz.supabase.co)
                </label>
                <input
                  type="url"
                  required
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full bg-[#1C1C20] border border-[#2D2D32] rounded p-2 text-xs font-mono text-[#F5F3EF] focus:outline-none focus:border-[#E7A96B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#A1A1AA] mb-1">
                  Public Anon Key (eyJ...)
                </label>
                <input
                  type="password"
                  required
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="eyJhbGciOi..."
                  className="w-full bg-[#1C1C20] border border-[#2D2D32] rounded p-2 text-xs font-mono text-[#F5F3EF] focus:outline-none focus:border-[#E7A96B]"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                {configSuccess ? (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved! Connecting...</span>
                  </span>
                ) : <span />}

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#E7A96B] hover:bg-[#F2BA82] text-[#101010] text-xs font-semibold rounded cursor-pointer"
                >
                  Save Connection
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
