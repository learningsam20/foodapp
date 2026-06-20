import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { CircleAlert, ArrowRight, Mail, Lock, Loader2, CheckCircle2 } from 'lucide-react';

interface LoginPageProps {
  onDemoLogin?: () => void;
  isConfigured?: boolean;
}

export const LoginPage = ({ onDemoLogin, isConfigured = true }: LoginPageProps) => {
  const [manual, setManual] = useState(false);
  const [manualLink, setManualLink] = useState('');

  // Email Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address.' });
      return;
    }
    if (!isMagicLink && !password) {
      setMessage({ type: 'error', text: 'Please enter a password.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (isMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim(),
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setMessage({ 
          type: 'success', 
          text: '✨ Magic link sent! Please check your email inbox to sign in.' 
        });
      } else {
        if (isSignUp) {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              emailRedirectTo: window.location.origin,
            }
          });
          if (error) throw error;
          if (data?.session) {
            setMessage({ type: 'success', text: 'Account created and logged in successfully!' });
          } else {
            setMessage({ 
              type: 'success', 
              text: '✨ Sign up successful! Check your email inbox to verify your account or sign in directly.' 
            });
          }
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (error) throw error;
        }
      }
    } catch (err: any) {
      console.error('Authentication error:', err.message);
      let errMsg = err.message;
      if (errMsg.toLowerCase().includes('invalid login credentials')) {
        errMsg = 'Invalid credentials. If you haven\'t created an account yet, click "Need an account?" above to register first.';
      } else if (errMsg.includes('provider') && errMsg.includes('not enabled')) {
        errMsg = 'This login provider is not enabled in your Supabase Auth settings. Please make sure email provider is configured.';
      }
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center">
        <h1 className="text-4xl font-extrabold text-orange-500 mb-1 tracking-tight">FoodFix</h1>
        <p className="text-slate-500 text-sm mb-6 font-medium">Elevated Food Support & Ordering Service</p>

        {!isConfigured && (
          <div className="mb-6 text-left bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex flex-col gap-3">
            <div className="flex gap-2 text-amber-600 font-semibold text-sm items-center">
              <CircleAlert className="w-4.5 h-4.5 shrink-0" />
              <span>Database Connection Pending</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Supabase environment secrets are currently unconfigured. Create a `.env` file or define them in your environment settings.
            </p>
            <div className="border-t border-slate-200/60 pt-2 flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Required Keys:</span>
              <code className="text-[10px] font-mono text-slate-600 bg-slate-100 p-1.5 rounded block whitespace-nowrap overflow-x-auto">SUPABASE_URL</code>
              <code className="text-[10px] font-mono text-slate-600 bg-slate-100 p-1.5 rounded block whitespace-nowrap overflow-x-auto">SUPABASE_ANON_KEY</code>
            </div>
          </div>
        )}

        {isConfigured && (
          <div className="mb-6">
            {/* Tab navigation for Password vs Magic Link */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4 text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => {
                  setIsMagicLink(false);
                  setMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${!isMagicLink ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-800'}`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMagicLink(true);
                  setMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all ${isMagicLink ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-800'}`}
              >
                Magic Link (OTP)
              </button>
            </div>

            {message && (
              <div className={`mb-4 text-left p-3.5 rounded-xl text-xs flex gap-2.5 items-start border ${
                message.type === 'success' 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                  : 'bg-rose-50 border-rose-100 text-rose-800'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <CircleAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                )}
                <span className="leading-relaxed">{message.text}</span>
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-3.5 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all font-medium"
                    disabled={loading}
                  />
                </div>
              </div>

              {!isMagicLink && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-slate-500" htmlFor="password">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-[11px] font-bold text-orange-500 hover:underline"
                    >
                      {isSignUp ? 'Already have an account?' : 'Need an account?'}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
                    <input
                      id="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-all font-medium"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 active:scale-[0.98] transition-all text-white py-3 rounded-2xl font-bold mt-2 shadow-lg shadow-orange-500/10 cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  <span>
                    {isMagicLink 
                      ? 'Send Magic Link' 
                      : isSignUp 
                        ? 'Sign Up with Email' 
                        : 'Sign In with Email'
                    }
                  </span>
                )}
              </button>
            </form>
          </div>
        )}

        {onDemoLogin && (
          <button 
            onClick={onDemoLogin}
            className={`w-full flex items-center justify-center gap-2 ${
              isConfigured 
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' 
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/15'
            } transition-all active:scale-[0.98] py-3.5 rounded-2xl font-bold mb-4 cursor-pointer`}
          >
            <span>Continue in Demo Mode</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {isConfigured && !manual && (
          <button 
            className="text-slate-400 text-xs hover:underline cursor-pointer block mx-auto py-1" 
            onClick={() => setManual(true)}
          >
            Enter authentication link manually
          </button>
        )}

        {isConfigured && manual && (
          <div className="flex flex-col gap-2 mt-4">
            <input 
              className="border border-slate-200 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 bg-slate-50/50" 
              placeholder="Paste link..." 
              value={manualLink}
              onChange={(e) => setManualLink(e.target.value)}
            />
            <button 
              onClick={() => window.location.href = manualLink} 
              className="bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-sm font-bold active:scale-[0.98] transition-all cursor-pointer"
            >
              Go
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

