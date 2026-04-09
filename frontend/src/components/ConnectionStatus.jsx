import { cn } from '../lib/utils.js';

export default function ConnectionStatus({ dataSource, wsStatus }) {
  if (dataSource === 'live' && wsStatus === 'connected') return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/8 bg-white/3 text-xs text-slate-400">
      {dataSource === 'mock' && (
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          Demo Mode
        </span>
      )}
      {wsStatus === 'disconnected' && dataSource !== 'mock' && (
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-recovery-yellow live-dot" />
          Reconnecting...
        </span>
      )}
    </div>
  );
}
