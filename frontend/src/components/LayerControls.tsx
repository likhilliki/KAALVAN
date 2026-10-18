import React, { useState } from 'react';
import { Layers, Flame, Shield, Activity, Wind, SunMoon, ChevronDown, ChevronUp } from 'lucide-react';
import type { ActiveLayers } from '../types';

interface LayerControlsProps {
  layers: ActiveLayers;
  onToggleLayer: (key: keyof ActiveLayers) => void;
}

export const LayerControls: React.FC<LayerControlsProps> = ({
  layers,
  onToggleLayer
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const layerItems: { key: keyof ActiveLayers; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      key: 'firmsHotspots',
      label: 'NASA FIRMS Hotspots',
      desc: 'VIIRS 375m & MODIS active thermal detections',
      icon: <Flame className="w-4 h-4 text-red-400" />,
      color: 'border-red-500/40 text-red-300'
    },
    {
      key: 'forestCanopy',
      label: 'Forest Canopy & Biomes',
      desc: 'Global primary forest boundaries & protected reserves',
      icon: <Shield className="w-4 h-4 text-emerald-400" />,
      color: 'border-emerald-500/40 text-emerald-300'
    },
    {
      key: 'riskHeatmap',
      label: 'AI Risk Outlines',
      desc: 'Red critical borders and classified risk zones',
      icon: <Activity className="w-4 h-4 text-orange-400" />,
      color: 'border-orange-500/40 text-orange-300'
    },
    {
      key: 'weatherOverlay',
      label: 'Atmosphere & Wind',
      desc: 'Surface wind vectors and evaporative demand',
      icon: <Wind className="w-4 h-4 text-cyan-400" />,
      color: 'border-cyan-500/40 text-cyan-300'
    },
    {
      key: 'nightAtmosphere',
      label: 'Day / Night Solar Light',
      desc: 'Realistic planetary solar terminator & starfield',
      icon: <SunMoon className="w-4 h-4 text-blue-400" />,
      color: 'border-blue-500/40 text-blue-300'
    }
  ];

  return (
    <div className="absolute bottom-6 right-6 z-20 glass-panel rounded-2xl border border-cyan-500/30 shadow-glass overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between space-x-3 hover:bg-slate-800/40 transition-colors select-none"
      >
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
            Layer Controls
          </span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="p-3 pt-1 space-y-2 border-t border-slate-800/70 bg-slate-900/40 w-72">
          {layerItems.map((item) => {
            const active = layers[item.key];
            return (
              <div
                key={item.key}
                onClick={() => onToggleLayer(item.key)}
                className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  active
                    ? 'bg-cyan-950/30 border-cyan-500/50 text-slate-100 shadow-glow-cyan'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start space-x-2.5">
                  <div className="mt-0.5">{item.icon}</div>
                  <div>
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{item.desc}</div>
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ml-2 ${
                    active ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'border-slate-600'
                  }`}
                >
                  {active && <span className="text-[10px] font-bold">✓</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
