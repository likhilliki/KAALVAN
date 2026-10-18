import React from 'react';
import { X, Shield, Cpu, Activity, Globe, CheckCircle2 } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col glass-panel rounded-2xl border border-[#00E5A0]/40 shadow-glass overflow-hidden text-slate-200">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-[#00E5A0]/20 bg-[#041410]/70">
          <div className="flex items-center space-x-3">
            <img
              src="/kaalvan-logo.png"
              alt="KAALVAN"
              className="w-10 h-10 rounded-xl object-contain border border-[#00E5A0]/40 shadow-glow-emerald"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold font-display tracking-wider text-white">
                  KAALVAN
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00E5A0]/20 text-[#00E5A0] border border-[#00E5A0]/40 uppercase tracking-widest">
                  Planetary Defense
                </span>
              </div>
              <p className="text-xs text-[#78F0A5] font-mono tracking-wide">
                The Forest’s Last Line of Defense
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-xs leading-relaxed">
          {/* Mission Statement */}
          <div className="p-4 rounded-xl bg-[#020B09]/80 border border-[#00E5A0]/20">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-[#00E5A0]" />
              Mission & Planetary Mandate
            </h3>
            <p className="text-slate-300">
              <strong className="text-[#20F5D4]">KAALVAN</strong> is an enterprise-grade planetary forest intelligence and environmental threat detection platform. By combining high-frequency satellite observation with biophysical risk modeling, KAALVAN detects canopy moisture deficits, illegal deforestation pressures, and wildfire propagation threats before irreversible tipping points are crossed.
            </p>
          </div>

          {/* Architecture Diagram */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#20F5D4]" />
                System Architecture & Workflow Diagram
              </h3>
              <span className="text-[10px] font-mono text-[#00E5A0]">
                Verified Production Pipeline
              </span>
            </div>
            <div className="rounded-xl overflow-hidden border border-[#00E5A0]/30 bg-black/60 shadow-lg">
              <img
                src="/kaalvan-architecture.png"
                alt="KAALVAN System Architecture and Flow Diagram"
                className="w-full object-contain max-h-[340px]"
              />
            </div>
          </div>

          {/* 5-Step End-to-End Workflow */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#00E5A0]" />
              End-to-End Intelligence Lifecycle
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
              <div className="p-3 rounded-xl bg-[#041410]/70 border border-[#00E5A0]/20">
                <div className="text-[11px] font-mono text-[#00E5A0] font-bold mb-1">
                  1. COLLECT
                </div>
                <div className="text-slate-300 text-[11px]">
                  NASA FIRMS (VIIRS 375m & MODIS), Open-Meteo, Copernicus CAMS air quality, and Hansen GFW primary canopy stats.
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#041410]/70 border border-[#00E5A0]/20">
                <div className="text-[11px] font-mono text-[#20F5D4] font-bold mb-1">
                  2. PROCESS
                </div>
                <div className="text-slate-300 text-[11px]">
                  Validate, normalize, clean, enrich, and cache spatial telemetry inside transactional schemas with strict provenance.
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#041410]/70 border border-[#00E5A0]/20">
                <div className="text-[11px] font-mono text-[#78F0A5] font-bold mb-1">
                  3. ANALYZE
                </div>
                <div className="text-slate-300 text-[11px]">
                  Scikit-Learn ensemble computes calibrated risk scores (0-100) with explainable causal drivers (XAI).
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#041410]/70 border border-[#00E5A0]/20">
                <div className="text-[11px] font-mono text-[#00E5A0] font-bold mb-1">
                  4. VISUALIZE
                </div>
                <div className="text-slate-300 text-[11px]">
                  Dark cinematic CesiumJS 3D Earth, toggleable layers, real-time SSE alerts, and floating regional briefings.
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#041410]/70 border border-[#00E5A0]/20">
                <div className="text-[11px] font-mono text-[#20F5D4] font-bold mb-1">
                  5. PROTECT
                </div>
                <div className="text-slate-300 text-[11px]">
                  Tactical ranger directives, patrol mobilizations, and evidence-grounded conservation interventions.
                </div>
              </div>
            </div>
          </div>

          {/* IBM LinuxONE Native Enterprise Architecture */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#020B09] via-[#041410] to-[#071D16] border border-blue-500/30">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-blue-200 flex items-center gap-2 mb-1">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  IBM LinuxONE (s390x) Enterprise Mainframe Deployment
                </h3>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  KAALVAN backend services run on <strong>IBM LinuxONE</strong> enterprise servers. Equipped with the IBM Telum processor featuring on-chip AI acceleration (NNPA) and Secure Execution confidential computing, KAALVAN processes high-throughput planetary sensor streams with mainframe reliability, zero downtime, and zero data leakage.
                </p>
              </div>
              <span className="hidden sm:inline-block px-2 py-1 rounded bg-blue-950/80 border border-blue-700/60 text-blue-300 text-[10px] font-mono whitespace-nowrap">
                s390x Ready
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#00E5A0]/20 bg-[#020B09] flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00E5A0]" />
            KAALVAN Production Intelligence v2.0 • Powered by IBM LinuxONE
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#00E5A0] hover:bg-[#20F5D4] text-[#020B09] font-semibold font-sans transition-colors"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
};
