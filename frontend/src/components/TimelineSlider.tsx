import React, { useState, useEffect } from 'react';
import { Play, Pause, Calendar, TrendingDown } from 'lucide-react';

interface TimelineSliderProps {
  currentYear: number;
  onYearChange: (year: number) => void;
}

export const TimelineSlider: React.FC<TimelineSliderProps> = ({
  currentYear,
  onYearChange
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        onYearChange(currentYear >= 2026 ? 2020 : currentYear + 1);
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentYear, onYearChange]);

  const getHistoricalStats = (year: number) => {
    switch (year) {
      case 2020:
        return { lossHa: '12.2M ha', co2: '2.6 Gt CO₂e', note: 'Extreme Amazon & Australian fire season' };
      case 2021:
        return { lossHa: '11.1M ha', co2: '2.4 Gt CO₂e', note: 'Severe Siberian Taiga fire front' };
      case 2022:
        return { lossHa: '10.8M ha', co2: '2.3 Gt CO₂e', note: 'Congo Basin logging expansion' };
      case 2023:
        return { lossHa: '13.4M ha', co2: '3.1 Gt CO₂e', note: 'Record Canadian Boreal wildfires' };
      case 2024:
        return { lossHa: '11.5M ha', co2: '2.5 Gt CO₂e', note: 'El Niño drought across South America' };
      case 2025:
        return { lossHa: '9.8M ha', co2: '2.1 Gt CO₂e', note: 'Enhanced satellite enforcement & drone patrols' };
      case 2026:
      default:
        return { lossHa: '8.4M ha (Est)', co2: '1.8 Gt CO₂e', note: 'Active KAALVAN Planetary Surveillance' };
    }
  };

  const stats = getHistoricalStats(currentYear);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-xl glass-panel rounded-2xl border border-[#00E5A0]/25 shadow-glass px-4 py-2.5 select-none">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-2">
          <Calendar className="w-3.5 h-3.5 text-[#00E5A0]" />
          <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">
            Multi-Year Surveillance Timeline
          </span>
        </div>

        <div className="text-[10px] font-mono text-[#00E5A0] flex items-center gap-1.5">
          <TrendingDown className="w-3 h-3 text-red-400" />
          <span>Annual Loss: <strong className="text-white">{stats.lossHa}</strong></span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">{stats.co2}</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Play / Pause */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-1.5 rounded-lg bg-[#00E5A0]/20 text-[#00E5A0] border border-[#00E5A0]/40 hover:bg-[#00E5A0]/30 transition-all shrink-0"
          title={isPlaying ? 'Pause Playback' : 'Play Timeline'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>

        {/* Range Slider */}
        <div className="flex-1 relative flex items-center">
          <input
            type="range"
            min={2020}
            max={2026}
            step={1}
            value={currentYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
            className="w-full accent-[#00E5A0] cursor-pointer h-1.5 bg-[#041410] rounded-lg appearance-none"
          />
        </div>

        {/* Selected Year Badge */}
        <div className="px-2.5 py-0.5 rounded-md bg-[#041410] border border-[#00E5A0]/40 text-xs font-mono font-bold text-[#00E5A0] shrink-0">
          {currentYear} {currentYear === 2026 && <span className="text-[9px] text-[#20F5D4] ml-1">LIVE</span>}
        </div>
      </div>

      {/* Year Labels */}
      <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1 px-8">
        {years.map((y) => (
          <span
            key={y}
            onClick={() => onYearChange(y)}
            className={`cursor-pointer hover:text-[#00E5A0] transition-colors ${
              y === currentYear ? 'text-[#00E5A0] font-bold' : ''
            }`}
          >
            {y}
          </span>
        ))}
      </div>
    </div>
  );
};

