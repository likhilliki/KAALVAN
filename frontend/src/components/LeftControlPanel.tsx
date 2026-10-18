import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  MapPin,
  Compass,
  X,
  Loader2,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Shield,
  Flame,
  Wind,
  Activity,
  TreeDeciduous,
  SunMoon,
  Sliders,
  Check,
  Radar
} from 'lucide-react';
import type { SearchResult, ActiveLayers } from '../types';
import { api } from '../services/api';

interface LeftControlPanelProps {
  layers: ActiveLayers;
  onToggleLayer: (key: keyof ActiveLayers) => void;
  onSelectResult: (result: SearchResult) => void;
  selectedCode?: string | null;
  isOpenDefault?: boolean;
  hotspotsCount?: number;
}

export const LeftControlPanel: React.FC<LeftControlPanelProps> = ({
  layers,
  onToggleLayer,
  onSelectResult,
  selectedCode: _selectedCode,
  isOpenDefault = true,
  hotspotsCount = 0
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(isOpenDefault);
  const [isLayersOpen, setIsLayersOpen] = useState<boolean>(true);
  const [isLegendOpen, setIsLegendOpen] = useState<boolean>(false);

  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        setIsSearching(false);
        setIsSearchDropdownOpen(false);
        return;
      }

      setIsSearching(true);
      try {
        const res = await api.search(query);
        setResults(res);
        setIsSearchDropdownOpen(true);
      } catch (e) {
        console.error('Search query error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside search container
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: SearchResult) => {
    onSelectResult(item);
    setIsSearchDropdownOpen(false);
    setQuery(item.name);
  };

  const quickPicks = [
    { label: 'Amazon', query: 'Amazon', coord: '-3.46, -62.21' },
    { label: 'Congo', query: 'Congo', coord: '-0.22, 21.05' },
    { label: 'Borneo', query: 'Borneo', coord: '0.96, 114.55' },
    { label: 'Taiga', query: 'Taiga', coord: '62.00, 129.00' },
    { label: 'Ghats', query: 'Western Ghats', coord: '11.50, 76.50' },
    { label: 'Chaco', query: 'Gran Chaco', coord: '-21.50, -60.00' }
  ];

  const layerDefinitions: {
    key: keyof ActiveLayers;
    fallbackKey?: keyof ActiveLayers;
    label: string;
    sublabel: string;
    tag: string;
    icon: React.ReactNode;
    activeBorder: string;
    activeColor: string;
    glow: string;
  }[] = [
    {
      key: 'forestBoundaries',
      fallbackKey: 'forestCanopy',
      label: 'Forest Boundaries',
      sublabel: '3D Extruded Biome Envelopes & Hansen GFW',
      tag: '8 BIOMES',
      icon: <TreeDeciduous className="w-4 h-4 text-[#00E5A0]" />,
      activeBorder: 'border-[#00E5A0]/50',
      activeColor: 'text-[#00E5A0]',
      glow: 'shadow-[0_0_12px_rgba(0,229,160,0.25)]'
    },
    {
      key: 'protectedAreas',
      label: 'Protected Sanctuaries',
      sublabel: 'WDPA / UNESCO World Heritage Reserves',
      tag: '8 RESERVES',
      icon: <Shield className="w-4 h-4 text-[#F59E0B]" />,
      activeBorder: 'border-[#F59E0B]/50',
      activeColor: 'text-[#F59E0B]',
      glow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]'
    },
    {
      key: 'satelliteFires',
      fallbackKey: 'firmsHotspots',
      label: 'Satellite Thermal Fires',
      sublabel: 'NASA FIRMS 375m VIIRS & MODIS NRT',
      tag: `${hotspotsCount} ACTIVE`,
      icon: <Flame className="w-4 h-4 text-red-400" />,
      activeBorder: 'border-red-500/50',
      activeColor: 'text-red-400',
      glow: 'shadow-[0_0_12px_rgba(239,68,68,0.25)]'
    },
    {
      key: 'weatherOverlay',
      label: 'Weather Radar & Atmosphere',
      sublabel: 'RainViewer Live Radar & 3D Wind Vectors',
      tag: 'DOPPLER NRT',
      icon: <Wind className="w-4 h-4 text-[#20F5D4]" />,
      activeBorder: 'border-[#20F5D4]/50',
      activeColor: 'text-[#20F5D4]',
      glow: 'shadow-[0_0_12px_rgba(32,245,212,0.25)]'
    },
    {
      key: 'vegetationHealth',
      label: 'Vegetation & NDVI Index',
      sublabel: 'Chlorophyll Density & Canopy Stress Scale',
      tag: 'NDVI 0.88',
      icon: <Sparkles className="w-4 h-4 text-[#84CC16]" />,
      activeBorder: 'border-[#84CC16]/50',
      activeColor: 'text-[#84CC16]',
      glow: 'shadow-[0_0_12px_rgba(132,204,22,0.25)]'
    },
    {
      key: 'environmentalRisk',
      fallbackKey: 'riskHeatmap',
      label: 'Predictive Risk Heatmap',
      sublabel: '3D Extruded Danger Columns & Spread Vectors',
      tag: 'ML INFERENCE',
      icon: <Activity className="w-4 h-4 text-orange-400" />,
      activeBorder: 'border-orange-500/50',
      activeColor: 'text-orange-400',
      glow: 'shadow-[0_0_12px_rgba(249,115,22,0.25)]'
    },
    {
      key: 'nightAtmosphere',
      label: 'Solar Terminator (Day/Night)',
      sublabel: 'Real Planetary Sun Angle & Twilight Shadow',
      tag: 'UTC SOLAR',
      icon: <SunMoon className="w-4 h-4 text-blue-400" />,
      activeBorder: 'border-blue-500/50',
      activeColor: 'text-blue-400',
      glow: 'shadow-[0_0_12px_rgba(59,130,246,0.25)]'
    }
  ];

  return (
    <div className="absolute top-16 left-4 lg:left-6 z-30 w-84 max-w-[92vw] transition-all duration-300 select-none">
      {/* Minimized Dock Trigger */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="p-3 rounded-2xl glass-panel border border-[#00E5A0]/30 hover:border-[#20F5D4]/60 text-slate-200 shadow-glass flex items-center space-x-2.5 group cursor-pointer"
          title="Open Geospatial Control Deck"
        >
          <Sliders className="w-5 h-5 text-[#00E5A0] group-hover:rotate-90 transition-transform duration-300" />
          <div className="text-left font-mono">
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              GEOSPATIAL FLIGHT DECK
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E5A0] animate-pulse" />
            </div>
            <div className="text-[10px] text-slate-400">7 Active Layers • Search</div>
          </div>
        </button>
      ) : (
        <div className="glass-panel rounded-2xl border border-[#00E5A0]/25 shadow-glass overflow-hidden max-h-[58vh] lg:max-h-[64vh] flex flex-col">
          {/* Tactical Deck Header */}
          <div className="px-4 py-3 border-b border-[#00E5A0]/20 bg-[#041410]/85 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Radar className="w-4 h-4 text-[#00E5A0] animate-spin text-xs" style={{ animationDuration: '6s' }} />
              <div className="flex flex-col">
                <span className="text-xs font-bold font-mono tracking-wider text-white uppercase">
                  Geospatial Mission Deck
                </span>
                <span className="text-[8px] font-mono text-[#20F5D4] tracking-widest uppercase">
                  C4ISR Tactical Surveillance
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors cursor-pointer"
              title="Minimize Control Deck"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 space-y-3.5 overflow-y-auto flex-1">
            {/* 1. Geospatial Search & Coordinate Jump */}
            <div ref={searchContainerRef} className="space-y-2 relative">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Sector Search & GPS Target</span>
                <span className="text-[#00E5A0] font-semibold">Live Jump</span>
              </div>

              <div className="relative flex items-center rounded-xl bg-[#020B09]/90 border border-[#00E5A0]/30 focus-within:border-[#20F5D4] focus-within:ring-1 focus-within:ring-[#20F5D4]/40 overflow-hidden transition-all">
                <div className="pl-3 pr-2 text-[#00E5A0]">
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#20F5D4]" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </div>

                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => query.trim() && setIsSearchDropdownOpen(true)}
                  placeholder="Forest, reserve, or -3.46, -62.21..."
                  className="w-full py-2 pr-8 bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none font-sans"
                />

                {query && (
                  <button
                    onClick={() => {
                      setQuery('');
                      setResults([]);
                      setIsSearchDropdownOpen(false);
                    }}
                    className="absolute right-2.5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quick Jump Biome Chips */}
              <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5">
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest shrink-0">
                  Quick:
                </span>
                {quickPicks.map((pick) => (
                  <button
                    key={pick.label}
                    onClick={() => setQuery(pick.query)}
                    className="px-2 py-0.5 text-[10px] rounded-md bg-[#041410] hover:bg-[#071D16] border border-[#00E5A0]/20 hover:border-[#00E5A0]/50 text-slate-300 hover:text-[#00E5A0] font-mono whitespace-nowrap transition-colors cursor-pointer"
                    title={`Jump to ${pick.label} (${pick.coord})`}
                  >
                    {pick.label}
                  </button>
                ))}
              </div>

              {/* Search Dropdown / Autocomplete */}
              {isSearchDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 glass-panel rounded-xl border border-[#00E5A0]/40 shadow-2xl max-h-56 overflow-y-auto">
                  {results.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 text-xs font-mono">
                      No matching forest, protected area, or coordinates found.
                    </div>
                  ) : (
                    results.map((res, i) => (
                      <div
                        key={i}
                        onClick={() => handleSelect(res)}
                        className="px-3 py-2 hover:bg-[#00E5A0]/10 cursor-pointer border-b border-[#00E5A0]/10 last:border-0 flex items-center justify-between group transition-colors"
                      >
                        <div className="flex items-start space-x-2">
                          {res.type === 'coordinate' ? (
                            <Compass className="w-3.5 h-3.5 text-[#20F5D4] mt-0.5 shrink-0" />
                          ) : (
                            <MapPin className="w-3.5 h-3.5 text-[#00E5A0] mt-0.5 shrink-0" />
                          )}
                          <div>
                            <div className="text-xs font-semibold text-slate-100 group-hover:text-[#20F5D4] transition-colors flex items-center gap-1.5">
                              {res.name}
                              {res.code && (
                                <span className="text-[9px] font-mono px-1 rounded bg-[#020B09] text-slate-400 border border-slate-700">
                                  {res.code}
                                </span>
                              )}
                            </div>
                            {res.country && (
                              <div className="text-[10px] text-slate-400">{res.country}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-[9px] font-mono text-slate-500 group-hover:text-[#00E5A0] shrink-0 pl-2">
                          {res.latitude.toFixed(2)}°, {res.longitude.toFixed(2)}°
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 2. Active Map Layers Matrix */}
            <div className="space-y-2 border-t border-[#00E5A0]/15 pt-3">
              <button
                onClick={() => setIsLayersOpen(!isLayersOpen)}
                className="w-full flex items-center justify-between text-[11px] font-mono font-bold text-slate-200 uppercase tracking-wider hover:text-[#00E5A0] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#00E5A0]" />
                  Active Map Layers (7)
                </span>
                {isLayersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {isLayersOpen && (
                <div className="space-y-1.5 pt-1">
                  {layerDefinitions.map((item) => {
                    const isActive =
                      layers[item.key] ??
                      (item.fallbackKey ? layers[item.fallbackKey] : false);

                    return (
                      <div
                        key={item.key}
                        onClick={() => onToggleLayer(item.key)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isActive
                            ? `bg-[#041410] ${item.activeBorder} ${item.glow} text-white`
                            : 'bg-[#020B09]/70 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:bg-[#03110D]'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="p-1 rounded-lg bg-[#020B09]/80 border border-slate-800 shrink-0">
                            {item.icon}
                          </div>
                          <div>
                            <div className="text-xs font-semibold flex items-center gap-1.5">
                              <span className={isActive ? item.activeColor : 'text-slate-200'}>
                                {item.label}
                              </span>
                              <span className="text-[8px] font-mono px-1 rounded bg-[#020B09] text-slate-400 border border-slate-800">
                                {item.tag}
                              </span>
                            </div>
                            <div className="text-[9px] text-slate-400 leading-tight mt-0.5">
                              {item.sublabel}
                            </div>
                          </div>
                        </div>

                        {/* Modern Tactical Switch Indicator */}
                        <div className="pl-2 shrink-0">
                          <div className={`w-8 h-4 rounded-full transition-colors relative flex items-center p-0.5 ${
                            isActive ? 'bg-[#00E5A0]/30 border border-[#00E5A0]' : 'bg-slate-800 border border-slate-700'
                          }`}>
                            <div className={`w-3 h-3 rounded-full transition-transform ${
                              isActive ? 'translate-x-4 bg-[#00E5A0] shadow-[0_0_8px_#00E5A0]' : 'translate-x-0 bg-slate-500'
                            }`} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Tactical Symbology Legend */}
            <div className="space-y-2 border-t border-[#00E5A0]/15 pt-3">
              <button
                onClick={() => setIsLegendOpen(!isLegendOpen)}
                className="w-full flex items-center justify-between text-[11px] font-mono font-bold text-slate-300 uppercase tracking-wider hover:text-[#00E5A0] transition-colors cursor-pointer"
              >
                <span>Geospatial Symbology Legend</span>
                {isLegendOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {isLegendOpen && (
                <div className="p-2.5 rounded-xl bg-[#020B09]/90 border border-slate-800 space-y-2 text-[10px] font-mono text-slate-400 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_#EF4444]" />
                      DEFCON 1 / Critical Fire (FRP &gt; 60MW)
                    </span>
                    <span className="text-red-400 font-bold">&gt;68 Risk</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                      DEFCON 2 / High Alert Wildfire
                    </span>
                    <span className="text-orange-400 font-bold">60-68</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      Protected Sanctuary Boundary
                    </span>
                    <span className="text-amber-400 font-bold">WDPA</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00E5A0]" />
                      Nominal Canopy Health (NDVI &gt; 0.75)
                    </span>
                    <span className="text-[#00E5A0] font-bold">STABLE</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeftControlPanel;
