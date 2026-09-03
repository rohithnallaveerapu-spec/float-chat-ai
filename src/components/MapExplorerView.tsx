import React, { useState } from 'react';
import { InteractiveMap } from './InteractiveMap';
import { ArgoFloat } from '../types';
import { DEMO_FLOATS } from '../data/argoDataset';

interface Props {
  selectedFloat: ArgoFloat | null;
  onSelectFloat: (float: ArgoFloat) => void;
  onExecutePrompt: (prompt: string) => void;
  setActiveTab: (tab: string) => void;
}

export const MapExplorerView: React.FC<Props> = ({
  selectedFloat,
  onSelectFloat,
  onExecutePrompt,
  setActiveTab,
}) => {
  const [searchTerm, setSearchText] = useState('');
  const [timeRange, setTimeRange] = useState('30d');

  const currentFloat = selectedFloat || DEMO_FLOATS[0];

  const filteredFloats = DEMO_FLOATS.filter((f) => {
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase();

    // Check float ID, region, or institution
    if (
      f.float_id.includes(term) ||
      f.ocean_region.toLowerCase().includes(term) ||
      f.institution.toLowerCase().includes(term)
    ) {
      return true;
    }

    // Check latitude/longitude numeric search e.g. "15", "15.4", "68.2"
    const coordNum = parseFloat(term.replace(/[^0-[#]0-9.-]/g, ''));
    if (!isNaN(coordNum)) {
      const dLat = Math.abs(f.lat - coordNum);
      const dLon = Math.abs(f.lon - coordNum);
      if (dLat < 10 || dLon < 10) return true;
    }

    return false;
  });

  return (
    <div className="relative w-full h-[calc(100vh-5rem)] rounded-xl overflow-hidden border border-[#44474e]/30 flex flex-col">
      {/* Map Layer */}
      <div className="absolute inset-0 z-0">
        <InteractiveMap
          floats={filteredFloats}
          selectedFloatId={currentFloat?.float_id}
          onSelectFloat={onSelectFloat}
          center={currentFloat ? [currentFloat.lat, currentFloat.lon] : [15, 68]}
          zoom={5}
        />
      </div>

      {/* Floating Search Bar */}
      <div className="absolute top-4 left-4 right-4 md:right-auto md:w-96 z-10">
        <div className="bg-[#2C3E50]/90 backdrop-blur border border-[#6cd7d4]/30 rounded-lg flex items-center px-3 py-2 shadow-xl">
          <span className="material-symbols-outlined text-[#c4c6cf] mr-2 text-sm">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search Float ID (e.g. 2901234) or Region..."
            className="bg-transparent text-xs text-[#e2e2e6] placeholder-[#8e9199] focus:outline-none w-full font-mono"
          />
        </div>
      </div>

      {/* Bottom Floating Control Cards */}
      <div className="absolute bottom-4 left-4 right-4 z-10 flex flex-col md:flex-row gap-4 items-end pointer-events-auto">
        {/* Selected Float Detail Card */}
        {currentFloat && (
          <div className="bg-[#2C3E50]/95 backdrop-blur border border-[#6cd7d4]/30 rounded-xl p-4 w-full md:w-80 shadow-2xl flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6cd7d4] to-transparent" />
            
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-[#6cd7d4] animate-ping" />
                  <span className="font-mono text-[10px] text-[#6cd7d4] uppercase font-bold">
                    ACTIVE FLOAT SOURCE
                  </span>
                </div>
                <h2 className="font-bold text-lg text-[#e2e2e6]">Float {currentFloat.float_id}</h2>
                <p className="text-xs text-[#c4c6cf]">{currentFloat.ocean_region} • {currentFloat.institution}</p>
              </div>
            </div>

            <div className="bg-[#111316]/60 rounded-lg p-2 font-mono text-[11px] text-[#6cd7d4] border border-[#6cd7d4]/20 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">location_on</span>
                COORDINATES:
              </span>
              <span className="font-bold text-[#e2e2e6]">
                {currentFloat.lat >= 0 ? `${currentFloat.lat}°N` : `${Math.abs(currentFloat.lat)}°S`},{' '}
                {currentFloat.lon >= 0 ? `${currentFloat.lon}°E` : `${Math.abs(currentFloat.lon)}°W`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 border-y border-[#44474e]/20 py-2.5 my-1">
              <div>
                <span className="font-mono text-[10px] text-[#8e9199]">LATEST TEMP</span>
                <div className="font-mono text-sm text-[#ffdcc4] font-bold">{currentFloat.latest_temp_c}°C</div>
              </div>
              <div>
                <span className="font-mono text-[10px] text-[#8e9199]">LATEST SALINITY</span>
                <div className="font-mono text-sm text-[#b0c8f1] font-bold">{currentFloat.latest_salinity_psu} PSU</div>
              </div>
              <div>
                <span className="font-mono text-[10px] text-[#8e9199]">DEPTH</span>
                <div className="font-mono text-xs text-[#e2e2e6]">{currentFloat.latest_depth_m}m</div>
              </div>
              <div>
                <span className="font-mono text-[10px] text-[#8e9199]">PROFILES</span>
                <div className="font-mono text-xs text-[#e2e2e6]">{currentFloat.total_profiles}</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onExecutePrompt(`Show temperature profiles for float ${currentFloat.float_id}`);
                  setActiveTab('chat');
                }}
                className="flex-1 bg-[#0a2647] hover:bg-[#0a2647]/80 text-[#768eb4] border border-[#b0c8f1]/20 py-1.5 rounded-lg font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">query_stats</span>
                View Profiles
              </button>
              <button
                onClick={() => {
                  onExecutePrompt(`Show the trajectory of float ${currentFloat.float_id}`);
                  setActiveTab('chat');
                }}
                className="bg-[#333538] hover:bg-[#37393c] text-[#e2e2e6] p-1.5 rounded-lg border border-[#44474e]/30 transition-colors"
                title="Trajectory"
              >
                <span className="material-symbols-outlined text-sm">route</span>
              </button>
            </div>
          </div>
        )}

        {/* Time Slider Controls */}
        <div className="bg-[#282a2d]/90 backdrop-blur border border-[#44474e]/30 rounded-lg p-3 w-full md:flex-1 shadow-xl flex flex-col gap-2">
          <div className="flex justify-between items-center px-1">
            <span className="font-mono text-[10px] text-[#8e9199]">Observation Window</span>
            <span className="font-mono text-xs text-[#6cd7d4] font-bold">Past 30 Days (Live)</span>
          </div>
          <div className="relative w-full h-1.5 bg-[#333538] rounded-full my-1">
            <div className="absolute top-0 left-0 h-full bg-[#6cd7d4] rounded-full w-full" />
            <div className="absolute top-1/2 right-0 w-3.5 h-3.5 bg-[#6cd7d4] rounded-full transform -translate-y-1/2 border-2 border-[#111316] shadow-md cursor-pointer" />
          </div>
          <div className="flex justify-between items-center font-mono text-[10px] text-[#8e9199]">
            <span>Feb 28</span>
            <span>Mar 29 (Latest)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
