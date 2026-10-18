import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Bell, ShieldAlert } from 'lucide-react';
import type { PriorityAlert } from '../types';

interface AlertPanelProps {
  alerts: PriorityAlert[];
  onSelectAlert: (alert: PriorityAlert) => void;
  isStreamConnected: boolean;
  isOpenDefault?: boolean;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({
  alerts,
  onSelectAlert,
  isStreamConnected,
  isOpenDefault = true
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(isOpenDefault);

  // Ranked order: CRITICAL (0), HIGH (1), MODERATE (2), LOW (3)
  const severityRank: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MODERATE: 2,
    LOW: 3
  };

  const rankedAlerts = [...alerts].sort((a, b) => {
    const rankA = severityRank[a.severity] ?? 99;
    const rankB = severityRank[b.severity] ?? 99;
    return rankA - rankB;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const highCount = alerts.filter((a) => a.severity === 'HIGH').length;

  return (
    <div className="absolute bottom-6 left-4 lg:left-6 z-30 w-84 max-w-[90vw] glass-panel rounded-2xl border border-[#00E5A0]/25 shadow-glass overflow-hidden transition-all duration-300 select-none">
      {/* Header Banner */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 flex items-center justify-between cursor-pointer bg-[#041410]/70 hover:bg-[#071D16]/80 transition-colors"
      >
        <div className="flex items-center space-x-2.5">
          <div className="relative">
            <Bell className="w-4 h-4 text-red-400" />
            {criticalCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold font-mono tracking-wider text-white flex items-center gap-1.5 leading-none">
              LIVE THREAT ALERTS
              <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-red-950/80 text-red-400 border border-red-800/80">
                {criticalCount} Critical
              </span>
              {highCount > 0 && (
                <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-orange-950/80 text-orange-400 border border-orange-800/80">
                  {highCount} High
                </span>
              )}
            </span>
            <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1.5 mt-1 leading-none">
              <span className={`w-1.5 h-1.5 rounded-full ${isStreamConnected ? 'bg-[#00E5A0] shadow-[0_0_6px_#00E5A0]' : 'bg-amber-400'}`} />
              {isStreamConnected ? 'SSE Live Stream Connected' : 'Polling Sync Active'}
            </span>
          </div>
        </div>

        <button className="p-1 text-slate-400 hover:text-[#20F5D4] transition-colors">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Expandable Alert List */}
      {isExpanded && (
        <div className="max-h-64 overflow-y-auto px-3 py-2 space-y-2 border-t border-[#00E5A0]/15 bg-[#020B09]/80">
          {rankedAlerts.length === 0 ? (
            <div className="text-center py-6 px-4 space-y-1">
              <ShieldAlert className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <div className="text-slate-400 text-xs font-mono">
                No active threats detected.
              </div>
              <div className="text-[10px] text-slate-600 font-mono">
                Satellites and sensor pipelines report normal baseline.
              </div>
            </div>
          ) : (
            rankedAlerts.map((alt) => (
              <div
                key={alt.id}
                onClick={() => onSelectAlert(alt)}
                className="p-2.5 rounded-xl bg-[#041410]/70 border border-slate-800/80 hover:border-[#00E5A0]/50 hover:bg-[#071D16]/80 cursor-pointer transition-all group"
              >
                {/* Severity & Threat Category */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase border ${
                        alt.severity === 'CRITICAL'
                          ? 'bg-red-950/90 text-red-400 border-red-700'
                          : alt.severity === 'HIGH'
                          ? 'bg-orange-950/90 text-orange-400 border-orange-700'
                          : 'bg-amber-950/90 text-amber-400 border-amber-700'
                      }`}
                    >
                      {alt.severity}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">
                      {alt.alert_type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <span className="text-[9px] font-mono text-slate-500 group-hover:text-[#20F5D4] transition-colors flex items-center gap-0.5">
                    Focus Target ›
                  </span>
                </div>

                {/* Title */}
                <div className="text-xs font-bold text-slate-200 mt-1.5 group-hover:text-[#00E5A0] transition-colors leading-snug">
                  {alt.title}
                </div>

                {/* Short explanation */}
                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {alt.description}
                </div>

                {/* Metadata Footer: Location, Source, FRP, Time */}
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-2 pt-1.5 border-t border-slate-800/80">
                  <span className="text-slate-300 font-medium truncate max-w-[120px]">
                    {alt.region_name}
                  </span>
                  <div className="flex items-center space-x-2 shrink-0">
                    {alt.frp_mw && (
                      <span className="text-red-400 font-bold">
                        {alt.frp_mw.toFixed(1)} MW FRP
                      </span>
                    )}
                    <span className="px-1 rounded bg-[#020B09] border border-slate-800 text-slate-400">
                      {alt.source}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

