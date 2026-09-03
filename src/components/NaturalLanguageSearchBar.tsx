import React, { useState } from 'react';
import { classifyIntent } from '../services/aiQueryEngine';
import { OceanRegion } from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface Props {
  onExecutePrompt: (prompt: string) => void;
  setActiveTab: (tab: string) => void;
  onApplyFilters?: (region: OceanRegion, parameter: 'salinity' | 'temperature', timeRange: string) => void;
}

export const NaturalLanguageSearchBar: React.FC<Props> = ({
  onExecutePrompt,
  setActiveTab,
  onApplyFilters,
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lastQueryData, setLastQueryData] = useState<{
    prompt: string;
    parameter: 'salinity' | 'temperature' | 'both' | 'pressure' | 'all';
    region: string;
    secondaryRegion?: string;
    timeRangeLabel: string;
    chartData: Array<{ time: string; value1: number; value2?: number }>;
    avgVal: number;
    deltaVal: number;
    profilesCount: number;
  } | null>(null);

  const quickSuggestions = [
    'show last 3 month data of salinity',
    'compare salinity of Arabian Sea and Bay of Bengal',
    'show temperature anomaly for last 6 months',
    'find active ARGO floats in Southern Ocean',
  ];

  const handleSearchSubmit = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    const text = searchTerm.trim();
    setQuery(text);

    // Classify using query engine
    const { structured } = classifyIntent(text);

    // Generate response chart & stats based on query parameters
    const isSal = structured.parameter === 'salinity';
    const paramName = isSal ? 'salinity' : 'temperature';
    const region1 = structured.region || 'Arabian Sea';
    const timeLabel = structured.time_range_label || 'Last 3 Months';

    // Build timeline points based on time range
    let monthList = ['Dec 2024', 'Jan 2025', 'Feb 2025'];
    if (timeLabel === 'Last 6 Months') {
      monthList = ['Oct 2024', 'Nov 2024', 'Dec 2024', 'Jan 2025', 'Feb 2025', 'Mar 2025'];
    } else if (timeLabel === 'Last 1 Month') {
      monthList = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    } else if (timeLabel === 'Last 12 Months') {
      monthList = ['Apr', 'Jun', 'Aug', 'Oct', 'Dec', 'Feb'];
    }

    const baseVal = isSal ? 36.2 : 28.4;
    const generatedChart = monthList.map((m, idx) => ({
      time: m,
      value1: Number((baseVal + (idx % 2 === 0 ? 0.25 : -0.15)).toFixed(2)),
      ...(structured.secondary_region
        ? { value2: Number(((isSal ? 33.8 : 27.6) + (idx % 2 === 0 ? -0.3 : 0.1)).toFixed(2)) }
        : {}),
    }));

    setTimeout(() => {
      setIsSearching(false);
      setLastQueryData({
        prompt: text,
        parameter: structured.parameter,
        region: region1,
        secondaryRegion: structured.secondary_region,
        timeRangeLabel: timeLabel,
        chartData: generatedChart,
        avgVal: isSal ? 36.35 : 28.2,
        deltaVal: isSal ? -0.28 : 0.45,
        profilesCount: timeLabel === 'Last 3 Months' ? 1420 : 2890,
      });

      if (onApplyFilters && (region1 as OceanRegion)) {
        onApplyFilters(region1 as OceanRegion, isSal ? 'salinity' : 'temperature', timeLabel);
      }
    }, 300);
  };

  const handleClear = () => {
    setQuery('');
    setLastQueryData(null);
  };

  const handleOpenInChat = () => {
    if (lastQueryData) {
      onExecutePrompt(lastQueryData.prompt);
      setActiveTab('chat');
    }
  };

  return (
    <div className="bg-[#1e2023] border border-[#6cd7d4]/30 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Header Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#6cd7d4] text-xl animate-pulse">pageview</span>
          <h2 className="font-bold text-sm sm:text-base text-[#e2e2e6] tracking-tight">
            AI Ocean Data Search Bar
          </h2>
        </div>
        <span className="text-[10px] font-mono text-[#8e9199] bg-[#111316] px-2.5 py-1 rounded-full border border-[#44474e]/30 hidden sm:inline-block">
          Natural Language Query Processor
        </span>
      </div>

      {/* Main Search Bar Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit(query);
        }}
        className="relative flex items-center"
      >
        <span className="material-symbols-outlined absolute left-3.5 text-[#6cd7d4] text-xl pointer-events-none">
          search
        </span>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='e.g. "show last 3 month data of salinity" or "compare salinity in Arabian Sea"'
          className="w-full bg-[#111316] text-[#e2e2e6] pl-11 pr-24 py-3 rounded-xl border border-[#6cd7d4]/40 text-xs sm:text-sm font-mono placeholder-[#8e9199] focus:outline-none focus:border-[#6cd7d4] focus:ring-1 focus:ring-[#6cd7d4] transition-all shadow-inner"
        />

        <div className="absolute right-2 flex items-center gap-1.5">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[#8e9199] hover:text-[#e2e2e6] p-1 rounded transition-colors"
              title="Clear search"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}

          <button
            type="submit"
            disabled={!query.trim() || isSearching}
            className="bg-[#29a09d] hover:bg-[#29a09d]/80 text-[#00302f] font-mono text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shadow-md disabled:opacity-50"
          >
            {isSearching ? (
              <span className="material-symbols-outlined text-sm animate-spin">refresh</span>
            ) : (
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            )}
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </form>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 pt-0.5">
        <span className="text-[10px] font-mono text-[#8e9199] whitespace-nowrap">Examples:</span>
        {quickSuggestions.map((suggestion, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSearchSubmit(suggestion)}
            className="bg-[#282a2d] hover:bg-[#323539] text-[#6cd7d4] hover:text-[#89f4f0] border border-[#44474e]/40 hover:border-[#6cd7d4]/50 px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all shadow-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">auto_awesome</span>
            {suggestion}
          </button>
        ))}
      </div>

      {/* Search Result Instant Cards & Chart */}
      {lastQueryData && (
        <div className="bg-[#111316] border border-[#6cd7d4]/40 rounded-xl p-4 sm:p-5 space-y-4 animate-fadeIn">
          {/* Status Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#44474e]/30 pb-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-[#29a09d] text-[#00302f] font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                  {lastQueryData.parameter === 'salinity' ? 'SALINITY (PSU)' : 'TEMPERATURE (°C)'}
                </span>
                <span className="bg-[#0a2647] text-[#6cd7d4] font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-[#6cd7d4]/30">
                  {lastQueryData.timeRangeLabel}
                </span>
                <span className="bg-[#1e2023] text-[#e2e2e6] font-mono text-[10px] px-2 py-0.5 rounded border border-[#44474e]/40">
                  {lastQueryData.region} {lastQueryData.secondaryRegion ? `vs ${lastQueryData.secondaryRegion}` : ''}
                </span>
              </div>
              <p className="text-xs text-[#e2e2e6] mt-1 font-mono">
                Query: &quot;{lastQueryData.prompt}&quot;
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={handleOpenInChat}
                className="bg-[#29a09d]/20 hover:bg-[#29a09d]/30 text-[#6cd7d4] border border-[#6cd7d4]/50 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">forum</span>
                Deep-Dive in AI Chat
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-[#1e2023] p-3 rounded-lg border border-[#44474e]/30">
              <span className="text-[10px] font-mono text-[#8e9199] block">MEAN OBSERVATION</span>
              <span className="font-mono text-base font-bold text-[#6cd7d4] mt-0.5 block">
                {lastQueryData.avgVal} {lastQueryData.parameter === 'salinity' ? 'PSU' : '°C'}
              </span>
            </div>

            <div className="bg-[#1e2023] p-3 rounded-lg border border-[#44474e]/30">
              <span className="text-[10px] font-mono text-[#8e9199] block">SEASONAL DELTA</span>
              <span
                className={`font-mono text-base font-bold mt-0.5 block ${
                  lastQueryData.deltaVal < 0 ? 'text-[#3b82f6]' : 'text-[#ef4444]'
                }`}
              >
                {lastQueryData.deltaVal > 0 ? `+${lastQueryData.deltaVal}` : lastQueryData.deltaVal}{' '}
                {lastQueryData.parameter === 'salinity' ? 'PSU' : '°C'}
              </span>
            </div>

            <div className="bg-[#1e2023] p-3 rounded-lg border border-[#44474e]/30 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono text-[#8e9199] block">PROFILES ANALYZED</span>
              <span className="font-mono text-base font-bold text-[#10b981] mt-0.5 block">
                {lastQueryData.profilesCount.toLocaleString()} Profiles (QC 1)
              </span>
            </div>
          </div>

          {/* Plotted Query Chart */}
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-[#8e9199] block">
              Observed {lastQueryData.parameter === 'salinity' ? 'Salinity (PSU)' : 'Temperature (°C)'} Trajectory ({lastQueryData.timeRangeLabel}):
            </span>
            <div className="h-48 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lastQueryData.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#44474e" opacity={0.25} />
                  <XAxis dataKey="time" stroke="#8e9199" tick={{ fontSize: 10, fill: '#c4c6cf' }} />
                  <YAxis
                    stroke="#8e9199"
                    tick={{ fontSize: 10, fill: '#c4c6cf' }}
                    unit={lastQueryData.parameter === 'salinity' ? ' PSU' : '°C'}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e2023',
                      borderColor: '#6cd7d4',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#e2e2e6',
                      fontFamily: 'JetBrains Mono',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line
                    type="monotone"
                    dataKey="value1"
                    name={lastQueryData.region}
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#3b82f6' }}
                  />
                  {lastQueryData.secondaryRegion && (
                    <Line
                      type="monotone"
                      dataKey="value2"
                      name={lastQueryData.secondaryRegion}
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#10b981' }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
