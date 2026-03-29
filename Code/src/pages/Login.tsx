import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brain, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { UserRole } from '@/types';

const Login: React.FC = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [loading, setLoading] = useState(false);
  const { login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const ok = await signup(email, password, name, role);
        if (ok) { toast.success('Clinical Identity Synchronized!'); navigate('/dashboard'); }
      } else {
        const ok = await login(email, password);
        if (ok) { toast.success('Deep Handshake Established!'); navigate('/dashboard'); }
        else toast.error('Identity Mismatch - Please verify biometric keys');
      }
    } catch { toast.error('Cloud Handshake Interrupted'); }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    toast.info('Requesting Secure Google Handshake...');
    try {
      // --- REAL CLOUD AUTHENTICATION ---
      await loginWithGoogle();
    } catch (e: any) {
      toast.error(e.message || 'Google Auth Failure');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#03040a]">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-[0_0_30px_rgba(0,245,155,0.1)]">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tighter">
            {isSignup ? 'Synchronize Identity' : 'Secure Core Bridge'}
          </h1>
          <p className="text-white/40 text-xs mt-2 font-mono uppercase tracking-[0.2em]">
            Multi-Modal Neural Verification Node
          </p>
        </div>

        <div className="glass-card rounded-[32px] border-white/5 p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <>
                <div className="space-y-2">
                  <Label className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Full Name</Label>
                  <Input 
                    className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11 focus:border-primary/40 transition-all placeholder:text-white/10" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                    placeholder="Dr. Ianubhav Sharma" 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Clinical Role</Label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40"
                  >
                    <option value="patient">Subject (Patient)</option>
                    <option value="doctor">Authorized Clinician (Doctor)</option>
                    <option value="admin">System Administrator</option>
                  </select>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Quantum ID (Email)</Label>
              <Input 
                id="email" 
                type="email" 
                className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11 focus:border-primary/40 transition-all placeholder:text-white/10" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="you@institutional.ai" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Biometric Key (Password)</Label>
              <Input 
                id="password" 
                type="password" 
                className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11 focus:border-primary/40 transition-all placeholder:text-white/10" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                placeholder="••••••••" 
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-12 rounded-xl transition-all shadow-[0_0_20px_rgba(0,245,155,0.1)]" disabled={loading}>
              {loading ? 'SYNCHRONIZING...' : isSignup ? 'INITIATE SYNC' : 'ENGAGE CORE'}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em] font-mono">
              <span className="bg-[#0a0b14] px-4 text-white/20">Certified Identity Node</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            type="button" 
            className="w-full bg-white/[0.01] border-white/5 hover:bg-white/[0.04] text-white/60 h-12 rounded-xl flex items-center justify-center gap-3 group transition-all"
            onClick={handleGoogleLogin}
          >
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Institutional Identity
          </Button>

          <div className="mt-8 text-center text-[10px] font-mono tracking-widest text-white/25">
            {isSignup ? 'CERTIFIED IDENTITY DETECTED?' : "INITIATE NEW IDENTITY?"}{' '}
            <button onClick={() => setIsSignup(!isSignup)} className="text-primary hover:text-white transition-colors uppercase font-bold">
              {isSignup ? 'RE-ENGAGE' : 'SYNCHRONIZE'}
            </button>
          </div>

          {!isSignup && (
              <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-center gap-2">
                <ShieldCheck className="w-3 h-3 text-primary/40" />
                <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.2em]">Validated Sandbox Node #6000-X</span>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
