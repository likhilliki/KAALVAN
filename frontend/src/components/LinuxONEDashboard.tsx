import React, { useState } from 'react';
import {
  X,
  Cpu,
  ShieldCheck,
  Zap,
  Terminal,
  Lock,
  Copy,
  Check
} from 'lucide-react';
import type { LinuxONETelemetry } from '../types';

interface LinuxONEDashboardProps {
  telemetry: LinuxONETelemetry | null;
  onClose: () => void;
}

export const LinuxONEDashboard: React.FC<LinuxONEDashboardProps> = ({
  telemetry,
  onClose
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'architecture' | 'deployment' | 'security'>('architecture');

  const copyCommand = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleDockerCommand = `docker run -d --name kaalvan \\
  --platform linux/s390x \\
  -p 8000:8000 \\
  -e ENVIRONMENT=production \\
  kaalvan-linuxone:latest`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl glass-panel rounded-2xl border border-blue-500/40 shadow-glow-blue overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-100">
                  IBM LinuxONE Enterprise Command & Architecture
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {telemetry?.status || 'OPERATIONAL'}
                </span>
              </div>
              <p className="text-xs text-blue-300/80 font-mono mt-0.5">
                IBM zSystems • Telum Microprocessor • Confidential Computing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center space-x-2 px-6 pt-3 border-b border-slate-800 bg-slate-900/30 font-mono text-xs">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-2.5 px-2 font-semibold transition-colors flex items-center space-x-1.5 border-b-2 ${
              activeTab === 'architecture'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Hardware Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('deployment')}
            className={`pb-2.5 px-2 font-semibold transition-colors flex items-center space-x-1.5 border-b-2 ${
              activeTab === 'deployment'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Datathon Deployment</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-2.5 px-2 font-semibold transition-colors flex items-center space-x-1.5 border-b-2 ${
              activeTab === 'security'
                ? 'border-blue-400 text-blue-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Execution</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-slate-300">
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">System Architecture</div>
                  <div className="text-sm font-bold font-mono text-blue-300">
                    {telemetry?.detected_architecture || 's390x (IBM zSystems)'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Byte Order: <span className="font-mono text-slate-200">{telemetry?.byte_order || 'Big Endian'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Processor Model</div>
                  <div className="text-sm font-bold font-mono text-slate-100">
                    {telemetry?.processor_model || 'IBM Telum (z16)'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    5.2 GHz base frequency, 8 dual-threaded cores per chip
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">AI On-Chip Acceleration</div>
                  <div className="text-sm font-bold font-mono text-cyan-300">
                    {telemetry?.ai_on_chip_acceleration || 'IBM NNPA Neural Accelerator'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Direct on-chip matrix multiplication for sub-millisecond inference
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Availability Target</div>
                  <div className="text-sm font-bold font-mono text-emerald-400">
                    {telemetry?.enterprise_resilience || '99.999% SLA Ready'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Fault-tolerant redundant I/O subsystem
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40 space-y-2">
                <div className="flex items-center space-x-2 text-blue-300 font-semibold">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span>Why IBM LinuxONE for Global Environmental Defense?</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Planetary satellite data streams ingest gigabytes of continuous observation frames. IBM LinuxONE provides ultra-low latency SIMD throughput, massive memory bandwidth, and on-chip AI acceleration without requiring power-hungry discrete GPUs.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'deployment' && (
            <div className="space-y-4">
              <div className="text-slate-300 text-[11px]">
                KAALVAN backend is built with multi-architecture container manifests targeting <code>linux/s390x</code>.
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-cyan-400">
                    LinuxONE Container Run Command:
                  </span>
                  <button
                    onClick={() => copyCommand(sampleDockerCommand)}
                    className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-mono rounded bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="font-mono text-[11px] text-slate-200 bg-slate-950 p-3 rounded-lg overflow-x-auto">
                  {sampleDockerCommand}
                </pre>
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-slate-200 font-mono text-xs">
                  Supported Datathon Environments:
                </span>
                <ul className="space-y-1.5 text-[11px] text-slate-400 font-mono">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400">✓</span>
                    <span><strong>Red Hat OpenShift on LinuxONE:</strong> Deploy via provided <code>linuxone/k8s/</code> manifests.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400">✓</span>
                    <span><strong>LinuxONE Community Cloud (VM):</strong> Run directly using <code>deploy-linuxone.sh</code>.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400">✓</span>
                    <span><strong>Podman / Docker Compose:</strong> Production-ready compose configuration supplied.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
                  <Lock className="w-4 h-4" />
                  <span>IBM Secure Execution for Linux</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Confidential computing technology that protects sensitive geospatial intelligence and ranger patrol routes from unauthorized access, even by hypervisor administrators.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-cyan-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>CPACF Protected-Key Cryptography</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Central Processor Assist for Cryptographic Functions (CPACF) accelerates AES-256-GCM and SHA-512 in hardware at wire speed, ensuring all satellite telemetry and database records remain encrypted at rest and in flight.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>IBM LinuxONE Datathon Architecture Edition</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
