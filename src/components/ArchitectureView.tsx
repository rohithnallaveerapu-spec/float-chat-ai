import React, { useState } from 'react';
import { DEMO_PRESET_QUERIES } from '../data/argoDataset';

interface Props {
  onExecutePrompt: (prompt: string) => void;
  setActiveTab: (tab: string) => void;
}

export const ArchitectureView: React.FC<Props> = ({ onExecutePrompt, setActiveTab }) => {
  const [activeDemoTab, setActiveDemoTab] = useState<'architecture' | 'presets' | 'quality'>('architecture');

  const handleRunPreset = (promptText: string) => {
    onExecutePrompt(promptText);
    setActiveTab('chat');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-[#44474e]/30 gap-6">
        <button
          onClick={() => setActiveDemoTab('architecture')}
          className={`pb-3 font-mono text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 ${
            activeDemoTab === 'architecture'
              ? 'border-[#6cd7d4] text-[#6cd7d4]'
              : 'border-transparent text-[#8e9199] hover:text-[#c4c6cf]'
          }`}
        >
          <span className="material-symbols-outlined text-sm">schema</span>
          System Architecture
        </button>
        <button
          onClick={() => setActiveDemoTab('presets')}
          className={`pb-3 font-mono text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 ${
            activeDemoTab === 'presets'
              ? 'border-[#6cd7d4] text-[#6cd7d4]'
              : 'border-transparent text-[#8e9199] hover:text-[#c4c6cf]'
          }`}
        >
          <span className="material-symbols-outlined text-sm">play_circle</span>
          1-Click Hackathon Demos
        </button>
        <button
          onClick={() => setActiveDemoTab('quality')}
          className={`pb-3 font-mono text-xs font-bold transition-all flex items-center gap-1.5 border-b-2 ${
            activeDemoTab === 'quality'
              ? 'border-[#6cd7d4] text-[#6cd7d4]'
              : 'border-transparent text-[#8e9199] hover:text-[#c4c6cf]'
          }`}
        >
          <span className="material-symbols-outlined text-sm">verified</span>
          Data Quality & QC Flags
        </button>
      </div>

      {activeDemoTab === 'architecture' && (
        <div className="space-y-6">
          {/* Flow Diagram */}
          <section className="bg-[#1e2023] border border-[#44474e]/30 rounded-xl p-6 shadow-xl">
            <h3 className="font-semibold text-[#e2e2e6] text-base mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#6cd7d4]">hub</span>
              FloatChat Query Pipeline Flow
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
              <div className="bg-[#111316] border border-[#6cd7d4]/30 rounded-lg p-4 flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-[#6cd7d4] text-2xl mb-1">chat</span>
                <span className="font-mono text-xs text-[#e2e2e6] font-bold">1. Natural Language</span>
                <span className="text-[10px] text-[#8e9199] mt-1">User Query Input</span>
              </div>

              <div className="bg-[#111316] border border-[#55C0E6]/30 rounded-lg p-4 flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-[#55C0E6] text-2xl mb-1">psychology</span>
                <span className="font-mono text-xs text-[#e2e2e6] font-bold">2. Intent Classification</span>
                <span className="text-[10px] text-[#8e9199] mt-1">Extract Region, Param, Vis Spec</span>
              </div>

              <div className="bg-[#111316] border border-[#6cd7d4]/30 rounded-lg p-4 flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-[#6cd7d4] text-2xl mb-1">database</span>
                <span className="font-mono text-xs text-[#e2e2e6] font-bold">3. GDAC PostGIS Query</span>
                <span className="text-[10px] text-[#8e9199] mt-1">Filtered by QC Flags (1,2)</span>
              </div>

              <div className="bg-[#111316] border border-[#FFBF00]/30 rounded-lg p-4 flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-[#FFBF00] text-2xl mb-1">auto_awesome</span>
                <span className="font-mono text-xs text-[#e2e2e6] font-bold">4. Gemini Explanation</span>
                <span className="text-[10px] text-[#8e9199] mt-1">Gemini 3.6 Flash Insight</span>
              </div>
            </div>
          </section>

          {/* Core Highlights */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#282a2d] border border-[#44474e]/30 rounded-lg p-4">
              <h4 className="font-mono text-xs font-bold text-[#6cd7d4] mb-1">STRICT NO-SLOP SCOPE</h4>
              <p className="text-xs text-[#c4c6cf]">
                No marketing hero noise, splash cards, or artificial landing pages. Pure oceanographic interface depth.
              </p>
            </div>
            <div className="bg-[#282a2d] border border-[#44474e]/30 rounded-lg p-4">
              <h4 className="font-mono text-xs font-bold text-[#55C0E6] mb-1">FULL-STACK SERVER API</h4>
              <p className="text-xs text-[#c4c6cf]">
                Custom Express backend on port 3000 handling Gemini API keys securely without client-side exposure.
              </p>
            </div>
            <div className="bg-[#282a2d] border border-[#44474e]/30 rounded-lg p-4">
              <h4 className="font-mono text-xs font-bold text-[#FFBF00] mb-1">REAL-TIME QC SANITIZATION</h4>
              <p className="text-xs text-[#c4c6cf]">
                Filters out corrupted measurements (QC flag 4) in real-time according to ARGO standards.
              </p>
            </div>
          </section>
        </div>
      )}

      {activeDemoTab === 'presets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEMO_PRESET_QUERIES.map((item) => (
            <div
              key={item.id}
              className="bg-[#1e2023] border border-[#44474e]/30 rounded-xl p-5 hover:border-[#6cd7d4] transition-all flex flex-col justify-between group"
            >
              <div>
                <span className="font-mono text-[10px] text-[#6cd7d4] uppercase font-bold tracking-wider">
                  {item.category}
                </span>
                <h4 className="font-bold text-base text-[#e2e2e6] mt-1 group-hover:text-[#6cd7d4] transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-[#c4c6cf] mt-2 font-mono bg-[#111316] p-2 rounded border border-[#44474e]/20">
                  "{item.prompt}"
                </p>
              </div>

              <button
                onClick={() => handleRunPreset(item.prompt)}
                className="mt-4 bg-[#0a2647] hover:bg-[#0a2647]/80 text-[#768eb4] border border-[#b0c8f1]/20 py-2 rounded-lg font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                Run Demo Query
              </button>
            </div>
          ))}
        </div>
      )}

      {activeDemoTab === 'quality' && (
        <section className="bg-[#1e2023] border border-[#44474e]/30 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-base text-[#e2e2e6] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#6cd7d4]">verified</span>
            ARGO Quality Control Flag Definitions (Handbook v3.4)
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="bg-[#111316] p-3 rounded border-l-4 border-[#6cd7d4] flex justify-between items-center">
              <div>
                <span className="font-bold text-[#6cd7d4]">Flag 1 - PASSED</span>
                <p className="text-[11px] text-[#8e9199] mt-0.5">Good data; verified by automated range and pressure checks.</p>
              </div>
              <span className="text-xs font-bold text-[#6cd7d4]">INCLUDED</span>
            </div>

            <div className="bg-[#111316] p-3 rounded border-l-4 border-[#55C0E6] flex justify-between items-center">
              <div>
                <span className="font-bold text-[#55C0E6]">Flag 2 - PROBABLY GOOD</span>
                <p className="text-[11px] text-[#8e9199] mt-0.5">Data looks fine but requires delayed mode recalibration.</p>
              </div>
              <span className="text-xs font-bold text-[#55C0E6]">INCLUDED</span>
            </div>

            <div className="bg-[#111316] p-3 rounded border-l-4 border-[#FFBF00] flex justify-between items-center">
              <div>
                <span className="font-bold text-[#FFBF00]">Flag 3 - SUSPECT</span>
                <p className="text-[11px] text-[#8e9199] mt-0.5">Potentially correctable drift detected in sensor array.</p>
              </div>
              <span className="text-xs font-bold text-[#FFBF00]">FLAGGED</span>
            </div>

            <div className="bg-[#111316] p-3 rounded border-l-4 border-[#E32636] flex justify-between items-center">
              <div>
                <span className="font-bold text-[#E32636]">Flag 4 - BAD / EXCLUDED</span>
                <p className="text-[11px] text-[#8e9199] mt-0.5">Out-of-range sensor spike. Excluded from FloatChat analysis.</p>
              </div>
              <span className="text-xs font-bold text-[#E32636]">EXCLUDED</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
