import React, { useState } from 'react';
import { ChatMessage, ArgoFloat } from '../types';
import { VerticalProfileChart } from './VerticalProfileChart';
import { DualOceanComparisonChart } from './DualOceanComparisonChart';
import { InteractiveMap } from './InteractiveMap';
import { DEMO_FLOATS } from '../data/argoDataset';

interface Props {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onSelectFloat: (float: ArgoFloat) => void;
  setActiveTab: (tab: string) => void;
  isProcessing: boolean;
}

export const AskAiView: React.FC<Props> = ({
  messages,
  onSendMessage,
  onSelectFloat,
  setActiveTab,
  isProcessing,
}) => {
  const [inputText, setInputText] = useState('');
  const [showSql, setShowSql] = useState<Record<string, boolean>>({});

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleFollowUpClick = (suggestionText: string) => {
    onSendMessage(suggestionText);
  };

  const toggleSql = (id: string) => {
    setShowSql((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto relative">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pb-28 pr-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          if (isUser) {
            return (
              <div key={msg.id} className="flex justify-end w-full">
                <div className="bg-[#2C3E50] rounded-xl p-4 max-w-[85%] sm:max-w-[75%] shadow-md border border-[#6cd7d4]/20">
                  <p className="text-sm text-[#e2e2e6]">{msg.text}</p>
                  <span className="text-[10px] font-mono text-[#8e9199] mt-1 block text-right">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          }

          // Assistant Response
          const spec = msg.visualizationSpec;
          const prov = msg.provenance;
          const struct = msg.structuredQuery;

          return (
            <div key={msg.id} className="flex justify-start w-full">
              <div className="bg-[#0a2647]/90 border-l-4 border-[#6cd7d4] rounded-r-xl rounded-bl-xl p-5 max-w-[98%] sm:max-w-[90%] flex flex-col gap-4 shadow-lg border border-[#6cd7d4]/20">
                {/* 1. Analysis Summary Badge */}
                <div className="bg-[#1a1c1f] border border-[#44474e]/30 rounded p-3 text-xs text-[#c4c6cf]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-sm text-[#6cd7d4]">analytics</span>
                    <span className="font-mono text-[11px] font-bold text-[#6cd7d4] uppercase tracking-wider">
                      ANALYSIS COMPLETE
                    </span>
                  </div>
                  <p className="text-[#e2e2e6]">
                    {msg.resultSummary
                      ? `Processed query for ${struct?.region || 'Ocean Region'}. Found ${msg.resultSummary.floats_involved} active floats and ${msg.resultSummary.profiles_analyzed} profiles.`
                      : 'Scientific query compiled and executed.'}
                  </p>
                </div>

                {/* 2. How FloatChat Understood Question Accordion */}
                {struct && (
                  <details className="bg-[#111316]/80 border border-[#6cd7d4]/20 rounded overflow-hidden group">
                    <summary className="px-3 py-2 text-xs font-mono text-[#6cd7d4] cursor-pointer flex justify-between items-center select-none">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">psychology</span>
                        How FloatChat understood your question
                      </span>
                      <span className="material-symbols-outlined text-sm group-open:rotate-180 transition-transform">
                        expand_more
                      </span>
                    </summary>
                    <div className="p-3 border-t border-[#44474e]/30 grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] text-[#c4c6cf] bg-[#0c0e11]">
                      <div><span className="text-[#8e9199]">Intent:</span> {msg.intent}</div>
                      <div><span className="text-[#8e9199]">Region:</span> {struct.region || 'Global'}</div>
                      <div><span className="text-[#8e9199]">Parameter:</span> {struct.parameter}</div>
                      <div><span className="text-[#8e9199]">Depth:</span> {struct.depth_min ?? 0}m - {struct.depth_max ?? 2000}m</div>
                      <div><span className="text-[#8e9199]">Chart Spec:</span> {struct.visualization}</div>
                      <div><span className="text-[#8e9199]">Aggregation:</span> {struct.aggregation}</div>
                    </div>
                  </details>
                )}

                {/* 3. Visualization spec rendering */}
                {spec && (
                  <div className="bg-[#111316] rounded-lg border border-[#44474e]/30 p-2">
                    {spec.visualization_type === 'comparative_anomaly' || struct?.secondary_region ? (
                      <DualOceanComparisonChart
                        region1={struct?.region || 'Arabian Sea'}
                        region2={struct?.secondary_region || 'Bay of Bengal'}
                        parameter={struct?.parameter === 'both' ? 'salinity' : struct?.parameter || 'salinity'}
                        timeRange="Last 3 months"
                      />
                    ) : spec.visualization_type === 'depth_profile' ? (
                      <VerticalProfileChart
                        title={spec.title}
                        measurements={
                          DEMO_FLOATS[0]
                            ? DEMO_FLOATS[0].trajectory.map((_, idx) => ({
                                measurement_id: `m_${idx}`,
                                depth_m: idx * 100,
                                pressure_dbar: idx * 100,
                                temperature_c: 26.5 - Math.min(22, idx * 1.5),
                                salinity_psu: 35.2 + Math.sin(idx) * 0.4,
                                temp_qc: 1,
                                salinity_qc: 1,
                              }))
                            : []
                        }
                      />
                    ) : spec.visualization_type === 'spatial_map' || spec.visualization_type === 'trajectory' ? (
                      <div className="h-64 w-full rounded overflow-hidden">
                        <InteractiveMap
                          floats={DEMO_FLOATS}
                          center={[15, 68]}
                          zoom={4}
                          onSelectFloat={(fl) => {
                            onSelectFloat(fl);
                            setActiveTab('map');
                          }}
                        />
                      </div>
                    ) : (
                      <div className="p-4 text-center font-mono text-xs text-[#6cd7d4] border border-dashed border-[#6cd7d4]/30 rounded">
                        {spec.title} ({spec.visualization_type})
                      </div>
                    )}
                  </div>
                )}

                {/* 4. AI Explanation Text */}
                <div className="text-sm text-[#e2e2e6] leading-relaxed">
                  <p>{msg.explanation || msg.text}</p>
                </div>

                {/* 5. Data Provenance Section */}
                {prov && (
                  <div className="border border-[#44474e]/30 rounded overflow-hidden">
                    <div className="bg-[#111316] px-3 py-2 flex justify-between items-center text-xs font-mono text-[#8e9199]">
                      <span className="flex items-center gap-1 text-[#6cd7d4]">
                        <span className="material-symbols-outlined text-sm">database</span>
                        Data Provenance & Scientific Quality
                      </span>
                      <button
                        onClick={() => toggleSql(msg.id)}
                        className="text-[10px] text-[#55C0E6] hover:underline"
                      >
                        {showSql[msg.id] ? 'Hide Generated SQL' : 'View System SQL'}
                      </button>
                    </div>
                    <div className="p-3 bg-[#1a1c1f] font-mono text-[11px] text-[#c4c6cf] space-y-1">
                      <p><span className="text-[#6cd7d4]">Source:</span> {prov.source_dataset}</p>
                      <p><span className="text-[#6cd7d4]">Provider:</span> {prov.data_provider}</p>
                      <p><span className="text-[#6cd7d4]">Processed:</span> {prov.profiles_analyzed} profiles ({prov.total_observations} obs; {prov.excluded_qc_count} QC excluded)</p>
                      <p><span className="text-[#6cd7d4]">Query Latency:</span> {prov.processing_latency_ms}ms</p>
                    </div>
                    {showSql[msg.id] && (
                      <div className="p-3 bg-[#0c0e11] border-t border-[#44474e]/30 font-mono text-[10px] text-[#29a09d] overflow-x-auto">
                        <pre>{prov.generated_sql}</pre>
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Follow-up Suggestions */}
                {msg.followUpSuggestions && msg.followUpSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-[#44474e]/20">
                    {msg.followUpSuggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleFollowUpClick(s)}
                        className="border border-[#6cd7d4]/40 rounded-full px-3 py-1 font-mono text-xs text-[#6cd7d4] hover:bg-[#6cd7d4]/10 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isProcessing && (
          <div className="flex justify-start w-full">
            <div className="bg-[#0a2647] border-l-4 border-[#6cd7d4] rounded-r-xl rounded-bl-xl p-4 flex items-center gap-3">
              <span className="material-symbols-outlined text-[#6cd7d4] animate-spin">sync</span>
              <span className="font-mono text-xs text-[#6cd7d4]">
                Parsing intent → Validating parameters → Executing PostGIS query → Generating chart...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#1e2023]/95 backdrop-blur border-t border-[#44474e]/30 p-3 z-30">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask a follow-up about ARGO ocean data..."
            className="w-full bg-[#111316] border-b border-[#44474e]/50 focus:border-[#6cd7d4] rounded-t py-2.5 pl-4 pr-12 text-sm text-[#e2e2e6] focus:outline-none"
          />
          <button
            type="submit"
            disabled={isProcessing}
            className="absolute right-3 text-[#6cd7d4] hover:text-[#89f4f0] transition-colors p-1"
            title="Send"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
