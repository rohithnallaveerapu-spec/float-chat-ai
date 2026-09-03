import React, { useState } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  institution: string;
  role: string;
  avatar: string;
}

interface Props {
  onLogin: (user: UserProfile) => void;
  onContinueAsGuest?: () => void;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

export const LoginPage: React.FC<Props> = ({
  onLogin,
  onContinueAsGuest,
  currentUser,
  onLogout,
}) => {
  const [email, setEmail] = useState('elena.vance@incois.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [institution, setInstitution] = useState('INCOIS / GDAC Oceanographic Center');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide both your institutional email and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const nameParts = email.split('@')[0].split('.');
      const formattedName = nameParts
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(' ');

      onLogin({
        name: formattedName || 'Dr. Elena Vance',
        email: email,
        institution: institution || 'Global GDAC Assembly',
        role: 'Senior Oceanographer & Data Scientist',
        avatar: (formattedName || 'EV')
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      });
    }, 600);
  };

  const handleQuickDemoLogin = (preset: 'incois' | 'noaa' | 'ifremer') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (preset === 'incois') {
        onLogin({
          name: 'Dr. Elena Vance',
          email: 'elena.vance@incois.gov.in',
          institution: 'INCOIS / NIO Indian Ocean GDAC',
          role: 'Lead Physical Oceanographer',
          avatar: 'EV',
        });
      } else if (preset === 'noaa') {
        onLogin({
          name: 'Prof. Marcus Thorne',
          email: 'm.thorne@noaa.gov',
          institution: 'NOAA Atlantic Oceanographic Laboratory',
          role: 'Senior Climate Modeler',
          avatar: 'MT',
        });
      } else {
        onLogin({
          name: 'Dr. Camille Laurent',
          email: 'c.laurent@ifremer.fr',
          institution: 'Ifremer Argo France Operational Center',
          role: 'GDAC Data Manager',
          avatar: 'CL',
        });
      }
    }, 400);
  };

  if (currentUser && !isSwitchingAccount) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md bg-[#1e2023] border border-[#6cd7d4]/30 rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
          {/* Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6cd7d4] via-[#55C0E6] to-[#29a09d]" />

          {/* Account Profile Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0a2647] border-2 border-[#6cd7d4] text-[#6cd7d4] text-2xl font-bold mb-3 shadow-xl shadow-[#6cd7d4]/20 mx-auto">
              {currentUser.avatar}
            </div>
            <h1 className="text-xl font-bold text-[#e2e2e6] tracking-tight">{currentUser.name}</h1>
            <p className="text-xs font-mono text-[#6cd7d4] mt-1">{currentUser.role}</p>
            <p className="text-[11px] text-[#8e9199] mt-0.5">{currentUser.institution}</p>
          </div>

          {/* Credentials / Session Details */}
          <div className="bg-[#111316] p-4 rounded-xl border border-[#44474e]/30 space-y-3 mb-6">
            <div className="flex justify-between items-center text-xs border-b border-[#44474e]/20 pb-2">
              <span className="font-mono text-[#8e9199]">EMAIL ID:</span>
              <span className="font-mono text-[#e2e2e6] font-bold">{currentUser.email}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-b border-[#44474e]/20 pb-2">
              <span className="font-mono text-[#8e9199]">GDAC ACCESS LEVEL:</span>
              <span className="font-mono text-[#10b981] font-bold">Tier 1 Senior Researcher</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-[#8e9199]">SESSION TOKEN:</span>
              <span className="font-mono text-[#6cd7d4]">ARG-2026-ACTIVE</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {onContinueAsGuest && (
              <button
                onClick={onContinueAsGuest}
                className="w-full bg-[#29a09d] hover:bg-[#29a09d]/90 text-[#00302f] font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-[#6cd7d4]/10 flex items-center justify-center gap-2 font-mono text-xs"
              >
                <span className="material-symbols-outlined text-base">dashboard</span>
                Enter Main Ocean Dashboard
              </button>
            )}

            <button
              onClick={() => setIsSwitchingAccount(true)}
              className="w-full bg-[#282a2d] hover:bg-[#323539] text-[#e2e2e6] border border-[#44474e]/50 font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 font-mono text-xs"
            >
              <span className="material-symbols-outlined text-base text-[#6cd7d4]">sync_alt</span>
              Switch Account / Change Station
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="w-full bg-[#E32636]/15 hover:bg-[#E32636]/25 text-[#FF8A8A] border border-[#E32636]/40 font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 font-mono text-xs"
              >
                <span className="material-symbols-outlined text-base">logout</span>
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md bg-[#1e2023] border border-[#6cd7d4]/30 rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6cd7d4] via-[#55C0E6] to-[#29a09d]" />

        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0a2647] border border-[#6cd7d4]/40 text-[#6cd7d4] mb-3 shadow-lg shadow-[#6cd7d4]/10">
            <span className="material-symbols-outlined text-3xl animate-pulse">waves</span>
          </div>
          <h1 className="text-2xl font-bold text-[#e2e2e6] tracking-tight">FloatChat Access</h1>
          <p className="text-xs text-[#c4c6cf] mt-1.5 max-w-xs mx-auto">
            ARGO Global Ocean Observing System • Researcher Portal
          </p>
        </div>

        {/* Quick Demo Presets */}
        <div className="mb-6 bg-[#111316] p-3.5 rounded-xl border border-[#44474e]/30">
          <span className="block text-[11px] font-mono text-[#6cd7d4] font-bold uppercase tracking-wider mb-2">
            ⚡ Quick 1-Click Researcher Demo Sign-In
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('incois')}
              className="bg-[#282a2d] hover:bg-[#29a09d]/20 hover:border-[#6cd7d4] text-[#e2e2e6] border border-[#44474e]/40 p-2 rounded-lg text-center transition-all group"
            >
              <span className="block font-bold text-xs group-hover:text-[#6cd7d4]">INCOIS</span>
              <span className="text-[9px] font-mono text-[#8e9199]">Dr. Vance</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('noaa')}
              className="bg-[#282a2d] hover:bg-[#55C0E6]/20 hover:border-[#55C0E6] text-[#e2e2e6] border border-[#44474e]/40 p-2 rounded-lg text-center transition-all group"
            >
              <span className="block font-bold text-xs group-hover:text-[#55C0E6]">NOAA</span>
              <span className="text-[9px] font-mono text-[#8e9199]">Prof. Thorne</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('ifremer')}
              className="bg-[#282a2d] hover:bg-[#29a09d]/20 hover:border-[#6cd7d4] text-[#e2e2e6] border border-[#44474e]/40 p-2 rounded-lg text-center transition-all group"
            >
              <span className="block font-bold text-xs group-hover:text-[#6cd7d4]">Ifremer</span>
              <span className="text-[9px] font-mono text-[#8e9199]">Dr. Laurent</span>
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-6">
          <div className="flex-grow border-t border-[#44474e]/30"></div>
          <span className="flex-shrink mx-3 font-mono text-[10px] text-[#8e9199] uppercase">
            or sign in with credentials
          </span>
          <div className="flex-grow border-t border-[#44474e]/30"></div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 bg-[#E32636]/15 border border-[#E32636]/50 rounded-lg p-3 text-xs text-[#FF8A8A] flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#c4c6cf] mb-1.5 font-bold">
              INSTITUTIONAL EMAIL / GDAC ID
            </label>
            <div className="relative">
              <span className="material-symbols-outlined text-base text-[#8e9199] absolute left-3 top-1/2 transform -translate-y-1/2">
                badge
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="researcher@institution.org"
                className="w-full bg-[#111316] border border-[#44474e]/50 focus:border-[#6cd7d4] rounded-lg py-2.5 pl-9 pr-3 text-xs text-[#e2e2e6] placeholder-[#8e9199] focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#c4c6cf] mb-1.5 font-bold">
              PASSWORD
            </label>
            <div className="relative">
              <span className="material-symbols-outlined text-base text-[#8e9199] absolute left-3 top-1/2 transform -translate-y-1/2">
                lock
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#111316] border border-[#44474e]/50 focus:border-[#6cd7d4] rounded-lg py-2.5 pl-9 pr-9 text-xs text-[#e2e2e6] placeholder-[#8e9199] focus:outline-none transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#8e9199] hover:text-[#e2e2e6]"
              >
                <span className="material-symbols-outlined text-base">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[#c4c6cf] mb-1.5 font-bold">
              RESEARCH ORGANIZATION
            </label>
            <select
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full bg-[#111316] border border-[#44474e]/50 focus:border-[#6cd7d4] rounded-lg py-2.5 px-3 text-xs text-[#e2e2e6] focus:outline-none transition-colors font-mono"
            >
              <option value="INCOIS / GDAC Oceanographic Center">INCOIS / NIO Indian Ocean GDAC</option>
              <option value="NOAA / AOML Atlantic Oceanographic Lab">NOAA / AOML Atlantic Laboratory</option>
              <option value="CSIRO Australia Marine Research">CSIRO Marine Research Australia</option>
              <option value="Ifremer Argo France GDAC Center">Ifremer Argo France Operational Center</option>
              <option value="JAMSTEC Marine Science Japan">JAMSTEC Japan Agency for Marine Science</option>
              <option value="Guest Independent Researcher">Guest Independent Researcher</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[#c4c6cf]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#44474e] bg-[#111316] text-[#6cd7d4] focus:ring-0"
              />
              <span>Keep workstation authenticated</span>
            </label>
            <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[#6cd7d4] hover:underline font-mono text-[11px]">
              Reset GDAC key
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 bg-[#29a09d] hover:bg-[#29a09d]/90 text-[#00302f] font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-[#6cd7d4]/10 flex items-center justify-center gap-2 font-mono text-xs"
          >
            {isLoading ? (
              <>
                <span className="material-symbols-outlined text-base animate-spin">sync</span>
                Authenticating GDAC Session...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">login</span>
                Sign In to FloatChat
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        {onContinueAsGuest && (
          <div className="mt-6 text-center border-t border-[#44474e]/20 pt-4">
            <button
              onClick={onContinueAsGuest}
              className="text-xs font-mono text-[#8e9199] hover:text-[#6cd7d4] transition-colors"
            >
              Continue with Guest Explorer Mode →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
