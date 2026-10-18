import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Compass, X, Loader2, Sparkles } from 'lucide-react';
import type { SearchResult } from '../types';
import { api } from '../services/api';

interface SearchBarProps {
  onSelectResult: (result: SearchResult) => void;
  selectedCode?: string | null;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectResult }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await api.search(query);
        setResults(res);
        setIsOpen(true);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: SearchResult) => {
    onSelectResult(item);
    setIsOpen(false);
    setQuery(item.name);
  };

  const quickPicks = [
    { label: 'Amazon', code: 'AMZ-BR-01' },
    { label: 'Congo', code: 'CGO-DRC-02' },
    { label: 'Borneo', code: 'BOR-IDN-03' },
    { label: 'Taiga', code: 'BOR-SIB-04' },
    { label: 'Gran Chaco', code: 'CHA-PRG-09' },
    { label: '-3.46, -62.21', code: 'COORD' }
  ];

  return (
    <div
      ref={containerRef}
      className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-xl transition-all"
    >
      {/* Search Input Bar */}
      <div className="relative flex items-center glass-panel rounded-xl border border-cyan-500/30 shadow-glass overflow-hidden focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/30">
        <div className="pl-3.5 pr-2 text-cyan-400">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="Search global forests, protected biomes, or lat,lon (-3.46, -62.21)..."
          className="w-full py-2.5 pr-9 bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
        />

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-3 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Select Chips */}
      <div className="flex items-center space-x-1.5 mt-2 px-1 overflow-x-auto scrollbar-none py-0.5">
        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-cyan-400" /> Quick Jump:
        </span>
        {quickPicks.map((pick) => (
          <button
            key={pick.label}
            onClick={() => {
              setQuery(pick.label);
            }}
            className="px-2 py-0.5 text-[11px] rounded-full glass-panel-subtle text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all font-mono whitespace-nowrap"
          >
            {pick.label}
          </button>
        ))}
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="mt-1.5 glass-panel rounded-xl border border-cyan-500/30 shadow-glass overflow-hidden max-h-72 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] font-mono text-cyan-400 uppercase tracking-widest border-b border-slate-800 flex justify-between items-center">
            <span>Geospatial Matches ({results.length})</span>
            <span>Click to Fly</span>
          </div>
          {results.map((res, i) => (
            <div
              key={i}
              onClick={() => handleSelect(res)}
              className="px-3.5 py-2.5 hover:bg-cyan-500/10 cursor-pointer transition-colors border-b border-slate-800/60 last:border-0 flex items-center justify-between group"
            >
              <div className="flex items-start space-x-2.5">
                {res.type === 'coordinate' ? (
                  <Compass className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                ) : (
                  <MapPin
                    className="w-4 h-4 mt-0.5 shrink-0"
                    style={{ color: res.highlight_color || '#10b981' }}
                  />
                )}
                <div>
                  <div className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                    {res.name}
                    {res.code && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                        {res.code}
                      </span>
                    )}
                  </div>
                  {res.description && (
                    <div className="text-xs text-slate-400 mt-0.5">{res.description}</div>
                  )}
                </div>
              </div>
              <div className="text-right text-[11px] font-mono text-slate-500 group-hover:text-cyan-400 transition-colors shrink-0 pl-2">
                {res.latitude.toFixed(2)}°, {res.longitude.toFixed(2)}°
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
