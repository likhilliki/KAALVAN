import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Activity,
  Satellite,
  Clock,
  Menu,
  X,
  Compass,
  Bell,
  FileText,
  Info,
  ShieldAlert,
  Radio,
  Zap
} from 'lucide-react';
import type { LinuxONETelemetry } from '../types';

interface HeaderProps {
  telemetry: LinuxONETelemetry | null;
  onOpenTelemetry: () => void;
  onOpenBenchmark: () => void;
  onOpenAbout: () => void;
  isBackendHealthy: boolean;
  activeHotspotsCount: number;
  alertsCount?: number;
  selectedRegionName?: string | null;
  onNavigate?: (tab: 'command' | 'explore' | 'alerts' | 'intelligence' | 'about') => void;
}

export const Header: React.FC<HeaderProps> = ({
  telemetry: _telemetry,
  onOpenTelemetry,
  onOpenBenchmark,
  onOpenAbout,
  isBackendHealthy,
  activeHotspotsCount,
  alertsCount = 0,
  selectedRegionName,
  onNavigate
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'command' | 'explore' | 'alerts' | 'intelligence' | 'about'>('command');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC').split(' ').slice(4, 6).join(' '));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (tab: 'command' | 'explore' | 'alerts' | 'intelligence' | 'about') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
    if (tab === 'about') {
      onOpenAbout();
    } else if (onNavigate) {
      onNavigate(tab);
    }
  };

  return (
    <>
      <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 lg:px-6 py-2 bg-[#020B09]/90 backdrop-blur-xl border-b border-[#00E5A0]/25 text-slate-100 select-none">
        {/* Left: Official KAALVAN Brand Identity */}
        <div className="flex items-center space-x-3.5">
          <div
            onClick={() => handleNavClick('command')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="relative">
              <img
                src="/kaalvan-logo.png"
                alt="KAALVAN"
                className="w-9 h-9 rounded-lg object-contain border border-[#00E5A0]/40 shadow-glow-emerald group-hover:border-[#20F5D4] transition-colors"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#00E5A0] ring-2 ring-[#020B09] animate-pulse" />
            </div>

            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-widest font-display text-white flex items-center gap-1.5 leading-none">
                KAALVAN
                <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#00E5A0]/15 text-[#00E5A0] border border-[#00E5A0]/30 uppercase">
                  GEOINT // C4ISR
                </span>
              </span>
              <span className="text-[9px] text-[#78F0A5]/80 font-mono tracking-wider uppercase mt-1 leading-none">
                The Forest’s Last Line of Defense
              </span>
            </div>
          </div>
        </div>

        {/* Center: Desktop Navigation Bar */}
        <nav className="hidden lg:flex items-center space-x-1 px-2 py-1 rounded-xl bg-[#041410]/80 border border-[#00E5A0]/20">
          <button
            onClick={() => handleNavClick('command')}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'command'
                ? 'bg-[#00E5A0]/20 text-[#00E5A0] border border-[#00E5A0]/40 shadow-glow-emerald font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#00E5A0]" />
            <span>Command Center</span>
          </button>

          <button
            onClick={() => handleNavClick('explore')}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'explore'
                ? 'bg-[#00E5A0]/20 text-[#00E5A0] border border-[#00E5A0]/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#20F5D4]" />
            <span>Planetary Globe</span>
          </button>

          <button
            onClick={() => handleNavClick('alerts')}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-[#00E5A0]/20 text-[#00E5A0] border border-[#00E5A0]/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-red-400" />
            <span>Threat Radar</span>
            {alertsCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[9px] font-bold rounded-full bg-red-950 text-red-400 border border-red-800">
                {alertsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavClick('intelligence')}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'intelligence'
                ? 'bg-[#00E5A0]/20 text-[#00E5A0] border border-[#00E5A0]/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#78F0A5]" />
            <span>Target Intel Dossier</span>
            {selectedRegionName && (
              <span className="max-w-[90px] truncate text-[10px] text-slate-400 ml-1">
                ({selectedRegionName})
              </span>
            )}
          </button>

          <button
            onClick={() => handleNavClick('about')}
            className="px-3 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center space-x-1.5 text-slate-400 hover:text-slate-200 hover:bg-white/5 cursor-pointer"
          >
            <Info className="w-3.5 h-3.5 text-[#20F5D4]" />
            <span>About</span>
          </button>
        </nav>

        {/* Right HUD Controls: Mainframe Telemetry, Hotspots, Benchmark, UTC */}
        <div className="flex items-center space-x-2">
          {/* IBM LinuxONE Enterprise Mainframe Host Badge */}
          <button
            onClick={onOpenTelemetry}
            className="hidden sm:flex items-center space-x-2 px-2.5 py-1.5 rounded-lg glass-panel-subtle border border-blue-500/30 hover:border-blue-400/60 transition-all text-xs text-blue-200 hover:text-white group cursor-pointer"
            title="Inspect IBM LinuxONE s390x Mainframe Telemetry (148.100.98.28:8000)"
          >
            <Cpu className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[10px] font-semibold text-blue-100 flex items-center gap-1 font-mono">
                IBM LINUXONE
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A0] animate-ping" />
              </span>
              <span className="text-[8px] text-blue-300/80 font-mono mt-0.5">
                148.100.98.28 • s390x
              </span>
            </div>
          </button>

          {/* AI Model Benchmark Modal Trigger */}
          <button
            onClick={onOpenBenchmark}
            className="hidden md:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg glass-panel-subtle border border-[#00E5A0]/30 hover:border-[#20F5D4]/60 transition-all text-xs text-[#00E5A0] hover:text-[#20F5D4] cursor-pointer"
            title="Inspect Machine Learning Model Benchmark (ROC-AUC: 0.993)"
          >
            <Activity className="w-3.5 h-3.5 text-[#00E5A0]" />
            <span className="font-mono text-[10px] font-bold">ROC 0.993</span>
          </button>

          {/* Active Hotspots Counter */}
          <div
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg glass-panel-subtle border border-red-500/30 text-xs text-red-300"
            title="NASA FIRMS Satellite Active Thermal Hotspots"
          >
            <Satellite className="w-3.5 h-3.5 text-red-400 animate-radar" />
            <span className="font-mono text-[11px] font-semibold text-red-200">
              {activeHotspotsCount} <span className="hidden sm:inline">Fires</span>
            </span>
          </div>

          {/* Engine Data Connection Status */}
          <div
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg glass-panel-subtle border border-slate-800 text-xs"
            title="KAALVAN Engine Connectivity"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendHealthy ? 'bg-[#00E5A0] shadow-[0_0_8px_#00E5A0]' : 'bg-red-400 animate-ping'
              }`}
            />
            <span className="text-[10px] font-mono text-slate-300 hidden xl:inline">
              {isBackendHealthy ? 'SYSTEM ONLINE' : 'DISCONNECTED'}
            </span>
          </div>

          {/* Live UTC Clock */}
          <div className="hidden 2xl:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg glass-panel-subtle border border-slate-800 text-[10px] font-mono text-slate-400">
            <Clock className="w-3 h-3 text-[#20F5D4]" />
            <span className="text-slate-200 font-semibold">{utcTime}</span>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-[#00E5A0]" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[52px] z-30 p-4 bg-[#020B09]/95 backdrop-blur-xl border-b border-[#00E5A0]/25 shadow-2xl animate-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => handleNavClick('command')}
              className={`p-3 rounded-xl font-mono text-xs flex items-center justify-between ${
                activeTab === 'command'
                  ? 'bg-[#00E5A0]/20 text-[#00E5A0] border border-[#00E5A0]/40'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-[#00E5A0]" />
                Command Center
              </span>
            </button>

            <button
              onClick={() => handleNavClick('explore')}
              className={`p-3 rounded-xl font-mono text-xs flex items-center justify-between ${
                activeTab === 'explore'
                  ? 'bg-[#00E5A0]/20 text-[#00E5A0] border border-[#00E5A0]/40'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#20F5D4]" />
                Planetary 3D Globe
              </span>
            </button>

            <button
              onClick={() => handleNavClick('alerts')}
              className={`p-3 rounded-xl font-mono text-xs flex items-center justify-between ${
                activeTab === 'alerts'
                  ? 'bg-[#00E5A0]/20 text-[#00E5A0] border border-[#00E5A0]/40'
                  : 'text-slate-300 hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-red-400" />
                Live Threat Radar ({alertsCount})
              </span>
            </button>

            <button
              onClick={() => handleNavClick('about')}
              className="p-3 rounded-xl font-mono text-xs flex items-center justify-between text-slate-300 hover:bg-white/5"
            >
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#20F5D4]" />
                About KAALVAN
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
