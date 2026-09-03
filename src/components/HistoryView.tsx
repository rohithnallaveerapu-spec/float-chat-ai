import React, { useState } from 'react';
import { ChatMessage, ArgoFloat } from '../types';
import { DEMO_FLOATS } from '../data/argoDataset';

interface Props {
  messages: ChatMessage[];
  onExecutePrompt: (prompt: string) => void;
  onSelectFloat: (float: ArgoFloat) => void;
  setActiveTab: (tab: string) => void;
  selectedFloat: ArgoFloat | null;
}

export const HistoryView: React.FC<Props> = ({
  messages,
  onExecutePrompt,
  onSelectFloat,
  setActiveTab,
  selectedFloat,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'queries' | 'floats'>('all');
  const [clearedIds, setClearedIds] = useState<string[]>([]);

  // Default preset historical queries to ensure a rich history list
  const presetHistory = [
    {
      id: 'hist-1',
      prompt: 'Show ARGO floats in the Indian Ocean and Arabian Sea.',
      timestamp: 'Today, 08:30 AM',
      region: 'Indian Ocean',
      intent: 'SPATIAL_ANALYSIS',
      profiles: 142,
      floats: 28,
    },
    {
      id: 'hist-2',
      prompt: 'Analyze temperature anomaly profiles for Float 2901234.',
      timestamp: 'Today, 08:15 AM',
      region: 'Arabian Sea',
      intent: 'TEMPERATURE_ANALYSIS',
      profiles: 86,
      floats: 1,
      floatId: '2901234',
    },
    {
      id: 'hist-3',
      prompt: 'Compare salinity profiles between Arabian Sea and Bay of Bengal.',
      timestamp: 'Yesterday, 04:45 PM',
      region: 'Bay of Bengal',
      intent: 'REGION_COMPARISON',
      profiles: 210,
      floats: 45,
    },
    {
      id: 'hist-4',
      prompt: 'Find subsurface thermal anomalies in North Atlantic GDAC.',
      timestamp: 'Yesterday, 02:10 PM',
      region: 'North Atlantic',
      intent: 'ANOMALY_DETECTION',
      profiles: 178,
      floats: 32,
    },
  ];

  // User chat query messages (user messages)
  const userMessages = messages.filter((m) => m.sender === 'user' && !clearedIds.includes(m.id));

  const filteredPresets = presetHistory.filter(
    (item) =>
      !clearedIds.includes(item.id) &&
      (item.prompt.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.region.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.intent.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const filteredUserMsgs = userMessages.filter((msg) =>
    msg.text.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const handleClearAll = () => {
    const allIds = [
      ...presetHistory.map((p) => p.id),
      ...messages.map((m) => m.id),
    ];
    setClearedIds(allIds);
  };

  const handleRerunQuery = (prompt: string) => {
    onExecutePrompt(prompt);
    setActiveTab('chat');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#1e2023] border border-[#44474e]/30 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#6cd7d4]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#6cd7d4] text-2xl">history</span>
              <h1 className="text-xl sm:text-2xl font-bold text-[#e2e2e6] tracking-tight">
                Query & Observation History
              </h1>
            </div>
            <p className="text-xs text-[#8e9199] mt-1 font-mono">
              Audit trail of scientific queries, float profile inspections, and GDAC dataset extractions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 bg-[#282a2d] hover:bg-[#323539] text-[#c4c6cf] hover:text-[#FF8A8A] border border-[#44474e]/40 rounded-xl text-xs font-mono transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">delete</span>
              Clear History
            </button>
          </div>
        </div>

        {/* Search & Category Filter */}
        <div className="mt-6 flex flex-col md:flex-row gap-3 pt-4 border-t border-[#44474e]/20">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#8e9199] text-base">
              search
            </span>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search history by keyword, region, float ID..."
              className="w-full bg-[#111316] border border-[#44474e]/40 focus:border-[#6cd7d4] rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-[#e2e2e6] placeholder-[#8e9199] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex gap-2">
            {(['all', 'queries', 'floats'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all capitalize ${
                  selectedCategory === cat
                    ? 'bg-[#29a09d] text-[#00302f] shadow-md shadow-[#6cd7d4]/10'
                    : 'bg-[#111316] text-[#c4c6cf] border border-[#44474e]/40 hover:border-[#6cd7d4]/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Query Execution Log */}
        {(selectedCategory === 'all' || selectedCategory === 'queries') && (
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-[#e2e2e6] font-mono flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-[#6cd7d4]">manage_search</span>
                RECENT SCIENTIFIC QUERIES ({filteredUserMsgs.length + filteredPresets.length})
              </h2>
            </div>

            {/* Live Session Queries */}
            {filteredUserMsgs.map((msg, index) => (
              <div
                key={msg.id}
                className="bg-[#1e2023] border border-[#6cd7d4]/30 hover:border-[#6cd7d4] transition-all rounded-xl p-4 shadow-lg flex flex-col gap-3 group"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                    <span className="text-[10px] font-mono text-[#10b981] font-bold uppercase">
                      ACTIVE SESSION
                    </span>
                    <span className="text-[10px] font-mono text-[#8e9199]">• {msg.timestamp}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#6cd7d4]/10 border border-[#6cd7d4]/30 text-[#6cd7d4] text-[10px] font-mono font-bold">
                    QUERY #{filteredUserMsgs.length - index}
                  </span>
                </div>

                <p className="text-xs text-[#e2e2e6] font-medium leading-relaxed">{msg.text}</p>

                <div className="flex items-center justify-between pt-2 border-t border-[#44474e]/20 text-xs font-mono">
                  <span className="text-[#8e9199] text-[11px]">Source: Live Ask AI Input</span>
                  <button
                    onClick={() => handleRerunQuery(msg.text)}
                    className="px-3 py-1 bg-[#29a09d]/20 hover:bg-[#29a09d] text-[#6cd7d4] hover:text-[#00302f] border border-[#6cd7d4]/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">refresh</span>
                    Re-run Query
                  </button>
                </div>
              </div>
            ))}

            {/* Historical Preset Queries */}
            {filteredPresets.map((item) => (
              <div
                key={item.id}
                className="bg-[#1e2023] border border-[#44474e]/30 hover:border-[#6cd7d4]/60 transition-all rounded-xl p-4 shadow-md flex flex-col gap-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#0a2647] border border-[#6cd7d4]/30 text-[#6cd7d4] text-[10px] font-mono font-bold">
                      {item.intent}
                    </span>
                    <span className="text-[10px] font-mono text-[#8e9199]">• {item.timestamp}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#55C0E6] font-bold">{item.region}</span>
                </div>

                <p className="text-xs text-[#e2e2e6] font-medium leading-relaxed">{item.prompt}</p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#44474e]/20 text-xs font-mono">
                  <div className="flex gap-3 text-[11px] text-[#8e9199]">
                    <span>PROFILES: <strong className="text-[#e2e2e6]">{item.profiles}</strong></span>
                    <span>FLOATS: <strong className="text-[#e2e2e6]">{item.floats}</strong></span>
                  </div>

                  <div className="flex gap-2">
                    {item.floatId && (
                      <button
                        onClick={() => {
                          const fl = DEMO_FLOATS.find((f) => f.float_id === item.floatId);
                          if (fl) {
                            onSelectFloat(fl);
                            setActiveTab('map');
                          }
                        }}
                        className="px-2.5 py-1 bg-[#282a2d] hover:bg-[#323539] text-[#6cd7d4] border border-[#44474e]/40 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">map</span>
                        Float Map
                      </button>
                    )}
                    <button
                      onClick={() => handleRerunQuery(item.prompt)}
                      className="px-2.5 py-1 bg-[#29a09d]/20 hover:bg-[#29a09d] text-[#6cd7d4] hover:text-[#00302f] border border-[#6cd7d4]/40 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">play_arrow</span>
                      Run in Ask AI
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredPresets.length === 0 && filteredUserMsgs.length === 0 && (
              <div className="bg-[#1e2023] border border-[#44474e]/30 rounded-xl p-8 text-center text-[#8e9199] font-mono text-xs">
                No matching queries found in history.
              </div>
            )}
          </div>
        )}

        {/* Right Col: Recently Inspected Floats & Shortcuts */}
        {(selectedCategory === 'all' || selectedCategory === 'floats') && (
          <div className={`${selectedCategory === 'floats' ? 'lg:col-span-3' : 'lg:col-span-1'} space-y-4`}>
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-[#e2e2e6] font-mono flex items-center gap-2">
                <span className="material-symbols-outlined text-base text-[#6cd7d4]">sensors</span>
                FLOATS INSPECTED ({DEMO_FLOATS.length})
              </h2>
            </div>

            <div className="space-y-3">
              {DEMO_FLOATS.map((fl) => {
                const isSelected = selectedFloat?.float_id === fl.float_id;
                return (
                  <div
                    key={fl.float_id}
                    className={`bg-[#1e2023] border transition-all rounded-xl p-3.5 shadow-md flex flex-col gap-2 ${
                      isSelected
                        ? 'border-[#6cd7d4] shadow-lg shadow-[#6cd7d4]/10'
                        : 'border-[#44474e]/30 hover:border-[#6cd7d4]/50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-base text-[#6cd7d4]">
                          location_on
                        </span>
                        <span className="font-mono font-bold text-xs text-[#e2e2e6]">
                          Float #{fl.float_id}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 font-bold">
                        {fl.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#8e9199] font-mono">
                      Region: <strong className="text-[#e2e2e6]">{fl.ocean_region}</strong>
                    </p>

                    <div className="grid grid-cols-2 gap-2 bg-[#111316] p-2 rounded-lg border border-[#44474e]/20 text-[10px] font-mono">
                      <div>
                        <span className="text-[#8e9199] block">TEMP:</span>
                        <span className="text-[#6cd7d4] font-bold">{fl.latest_temp_c}°C</span>
                      </div>
                      <div>
                        <span className="text-[#8e9199] block">SALINITY:</span>
                        <span className="text-[#55C0E6] font-bold">{fl.latest_salinity_psu} PSU</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1 text-[10px] font-mono">
                      <span className="text-[#8e9199]">PROFILES: {fl.total_profiles}</span>
                      <button
                        onClick={() => {
                          onSelectFloat(fl);
                          setActiveTab('map');
                        }}
                        className="px-2 py-1 bg-[#29a09d]/20 hover:bg-[#29a09d] text-[#6cd7d4] hover:text-[#00302f] border border-[#6cd7d4]/40 rounded font-bold transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">travel_explore</span>
                        View Trajectory
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
