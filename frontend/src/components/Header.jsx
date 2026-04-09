import { useNavigate } from 'react-router-dom';
import { Heart, Zap, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import { getTodayMessage } from '../lib/messages.js';
import ConnectionStatus from './ConnectionStatus.jsx';

export default function Header({ dataSource, wsStatus, lastUpdated }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('fit_user') || '{}');

  function logout() {
    localStorage.removeItem('fit_token');
    localStorage.removeItem('fit_user');
    navigate('/login', { replace: true });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/6"
      style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      <div className="max-w-5xl mx-auto px-4">
        {/* Main bar */}
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Heart size={20} className="text-partner2 fill-partner2/20" />
              <Zap size={10} className="text-partner1 absolute -top-0.5 -right-0.5" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="gradient-text-partner1">Fit</span>
              <span className="gradient-text-partner2">Together</span>
            </span>
          </div>

          {/* Center: date */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-slate-400">
              {format(new Date(), 'EEEE, MMM d')}
            </span>
          </div>

          {/* Right: status + live indicator + logout */}
          <div className="flex items-center gap-3">
            <ConnectionStatus dataSource={dataSource} wsStatus={wsStatus} />

            {wsStatus === 'connected' && dataSource !== 'mock' && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-recovery-green live-dot" />
                <span className="text-recovery-green font-medium hidden sm:inline">LIVE</span>
              </div>
            )}

            {lastUpdated && (
              <span className="text-[10px] text-slate-600 hidden md:inline">
                {format(lastUpdated, 'h:mm a')}
              </span>
            )}

            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Motivational message */}
        <div className="pb-2 -mt-1">
          <p className="text-xs text-slate-500 italic text-center sm:text-left truncate">
            "{getTodayMessage()}"
          </p>
        </div>
      </div>
    </header>
  );
}
