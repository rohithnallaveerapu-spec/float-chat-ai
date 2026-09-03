import React, { useState } from 'react';
import { InteractiveMap } from './InteractiveMap';
import { DEMO_FLOATS } from '../data/argoDataset';
import { ArgoFloat } from '../types';

interface Props {
  onExecutePrompt: (prompt: string) => void;
  onSelectFloat: (float: ArgoFloat) => void;
  setActiveTab: (tab: string) => void;
}

export const DashboardView: React.FC<Props> = ({
  onExecutePrompt,
  onSelectFloat,
  setActiveTab,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;
    onExecutePrompt(inputPrompt);
    setActiveTab('chat');
  };

  const handleChipClick = (promptText: string) => {
    onExecutePrompt(promptText);
    setActiveTab('chat');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* 1. Quick Stats Grid */}
      <section aria-label="Key Statistics" className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#2C3E50]/40 border border-[#6cd7d4]/20 rounded p-3 flex flex-col justify-between">
          <span className="text-sm text-[#c4c6cf]">Active Floats</span>
          <span className="font-mono text-xl font-bold text-[#6cd7d4] mt-1">3,842</span>
        </div>
        <div className="bg-[#2C3E50]/40 border border-[#6cd7d4]/20 rounded p-3 flex flex-col justify-between">
          <span className="text-sm text-[#c4c6cf]">Profiles</span>
          <span className="font-mono text-xl font-bold text-[#55C0E6] mt-1">2.4M</span>
        </div>
        <div className="bg-[#2C3E50]/40 border border-[#6cd7d4]/20 rounded p-3 flex flex-col justify-between">
          <span className="text-sm text-[#c4c6cf]">Ocean Regions</span>
          <span className="font-mono text-xl font-bold text-[#e2e2e6] mt-1">11</span>
        </div>
        <div className="bg-[#2C3E50]/40 border border-[#6cd7d4]/20 rounded p-3 flex flex-col justify-between">
          <span className="text-sm text-[#c4c6cf]">Latest Obs.</span>
          <span className="font-mono text-xl font-bold text-[#FFBF00] mt-1">2 mins ago</span>
        </div>
      </section>

      {/* 2. Primary Map & Conversational Quick Input */}
      <section className="bg-[#2C3E50]/30 border border-[#6cd7d4]/20 rounded-xl overflow-hidden flex flex-col relative">
        <div className="relative w-full h-[320px] bg-[#0c0e11]">
          <InteractiveMap
            floats={DEMO_FLOATS}
            center={[15, 68]}
            zoom={3}
            onSelectFloat={(fl) => {
              onSelectFloat(fl);
              setActiveTab('map');
            }}
          />
          <div className="absolute top-3 left-3 bg-[#1e2023]/80 backdrop-blur border border-[#6cd7d4]/30 rounded px-2.5 py-1 flex items-center gap-1.5 z-10">
            <span className="w-2 h-2 rounded-full bg-[#6cd7d4] animate-ping" />
            <span className="font-mono text-[11px] text-[#6cd7d4] uppercase tracking-wider font-bold">
              LIVE ARGO NETWORK
            </span>
          </div>
        </div>

        {/* Quick Ask Box */}
        <div className="p-4 bg-[#1e2023]/95 backdrop-blur border-t border-[#6cd7d4]/20">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 relative">
            <span className="material-symbols-outlined text-[#6cd7d4] absolute left-3">search</span>
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask FloatChat about ARGO data (e.g., 'Show temperature profiles in Arabian Sea')..."
              className="w-full bg-[#111316] border-b border-[#44474e]/50 focus:border-[#6cd7d4] text-[#e2e2e6] pl-10 pr-12 py-2.5 rounded text-sm transition-all focus:outline-none"
            />
            <button
              type="submit"
              className="material-symbols-outlined text-[#6cd7d4] hover:text-[#89f4f0] p-2 transition-colors absolute right-2"
              title="Send Prompt"
            >
              send
            </button>
          </form>
        </div>
      </section>

      {/* 3. Suggested Queries */}
      <section>
        <h2 className="font-mono text-xs text-[#c4c6cf] mb-3 uppercase tracking-wider font-bold">
          Suggested Queries
        </h2>
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
          <button
            onClick={() => handleChipClick('show last 3 month data of salinity')}
            className="whitespace-nowrap px-4 py-1.5 border border-[#6cd7d4]/40 rounded bg-[#111316]/60 text-[#6cd7d4] hover:bg-[#6cd7d4]/10 hover:border-[#6cd7d4] font-mono text-xs transition-all"
          >
            🧂 Last 3 Months Salinity
          </button>
          <button
            onClick={() => handleChipClick('Show ARGO floats in the Indian Ocean.')}
            className="whitespace-nowrap px-4 py-1.5 border border-[#6cd7d4]/40 rounded bg-[#111316]/60 text-[#6cd7d4] hover:bg-[#6cd7d4]/10 hover:border-[#6cd7d4] font-mono text-xs transition-all"
          >
            🌊 Indian Ocean
          </button>
          <button
            onClick={() => handleChipClick('Find unusual temperature values and anomalies in the North Atlantic.')}
            className="whitespace-nowrap px-4 py-1.5 border border-[#6cd7d4]/40 rounded bg-[#111316]/60 text-[#6cd7d4] hover:bg-[#6cd7d4]/10 hover:border-[#6cd7d4] font-mono text-xs transition-all"
          >
            🌡 Temp Anomalies
          </button>
          <button
            onClick={() => handleChipClick('Show ARGO floats near latitude 15N and longitude 68E.')}
            className="whitespace-nowrap px-4 py-1.5 border border-[#6cd7d4]/40 rounded bg-[#111316]/60 text-[#6cd7d4] hover:bg-[#6cd7d4]/10 hover:border-[#6cd7d4] font-mono text-xs transition-all"
          >
            🎯 Lat 15°N, Lon 68°E
          </button>
          <button
            onClick={() => handleChipClick('Show the trajectory of float 2901234.')}
            className="whitespace-nowrap px-4 py-1.5 border border-[#6cd7d4]/40 rounded bg-[#111316]/60 text-[#6cd7d4] hover:bg-[#6cd7d4]/10 hover:border-[#6cd7d4] font-mono text-xs transition-all"
          >
            📍 Trajectory 2901234
          </button>
          <button
            onClick={() => handleChipClick('Compare salinity profiles between the Arabian Sea and Bay of Bengal.')}
            className="whitespace-nowrap px-4 py-1.5 border border-[#6cd7d4]/40 rounded bg-[#111316]/60 text-[#6cd7d4] hover:bg-[#6cd7d4]/10 hover:border-[#6cd7d4] font-mono text-xs transition-all"
          >
            🧂 Salinity Profiles
          </button>
        </div>
      </section>

      {/* 4. Latest Profile Updates */}
      <section>
        <h2 className="font-mono text-xs text-[#c4c6cf] mb-3 uppercase tracking-wider font-bold">
          Latest Profile Updates
        </h2>
        <div className="space-y-2">
          {DEMO_FLOATS.slice(0, 4).map((fl) => (
            <div
              key={fl.float_id}
              onClick={() => {
                onSelectFloat(fl);
                setActiveTab('map');
              }}
              className="bg-[#1e2023] border border-[#6cd7d4]/10 rounded p-3 flex justify-between items-center hover:border-[#6cd7d4]/40 transition-colors cursor-pointer group"
            >
              <div className="flex flex-col">
                <span className="font-mono text-sm text-[#e2e2e6] group-hover:text-[#6cd7d4] transition-colors font-bold">
                  ID: {fl.float_id} ({fl.platform_number})
                </span>
                <span className="text-xs text-[#c4c6cf] mt-0.5">
                  {fl.ocean_region} • {fl.institution} • {fl.latest_temp_c}°C
                </span>
              </div>
              <div
                className={`px-2.5 py-1 rounded font-mono text-[11px] font-bold border ${
                  fl.qc_status === 'PASSED'
                    ? 'bg-[#2D5A27]/20 border-[#2D5A27] text-[#6cd7d4]'
                    : 'bg-[#FFBF00]/20 border-[#FFBF00] text-[#FFBF00]'
                }`}
              >
                QC: {fl.qc_status}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
