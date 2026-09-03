import React, { useState } from 'react';
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
import { DEMO_REGION_STATS } from '../data/argoDataset';
import { OceanRegion } from '../types';
import { DualOceanComparisonChart } from './DualOceanComparisonChart';
import { NaturalLanguageSearchBar } from './NaturalLanguageSearchBar';

interface Props {
  onExecutePrompt: (prompt: string) => void;
  setActiveTab: (tab: string) => void;
}

const CustomTimelineTooltip = ({ active, payload, label, timelineMetric, region, secondaryRegion }: any) => {
  if (!active || !payload || !payload.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  const isTemp = timelineMetric === 'temperature';
  const unit = isTemp ? '°C Anomaly' : 'PSU';

  const val1 = point[isTemp ? `${region}_temp` : `${region}_sal`];
  const val2 = point[isTemp ? `${secondaryRegion}_temp` : `${secondaryRegion}_sal`];

  const num1 = Number(val1) || 0;
  const num2 = Number(val2) || 0;
  const delta = (num1 - num2).toFixed(2);

  return (
    <div className="bg-[#111316]/95 border border-[#6cd7d4] rounded-xl p-3.5 shadow-2xl backdrop-blur font-mono text-xs text-[#e2e2e6] min-w-[220px] pointer-events-none z-50">
      <div className="flex items-center justify-between border-b border-[#44474e]/40 pb-2 mb-2">
        <span className="font-bold text-[#6cd7d4] flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">calendar_month</span>
          Month: {label}
        </span>
        <span className="text-[10px] text-[#8e9199] bg-[#1e2023] px-2 py-0.5 rounded font-bold">
          {isTemp ? 'Thermal Anomaly' : 'Salinity Trend'}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="bg-[#1e2023] p-2 rounded-lg border border-[#3b82f6]/40 flex items-center justify-between">
          <span className="text-[#c4c6cf] font-semibold">{region}:</span>
          <span className="font-bold text-[#3b82f6]">
            {isTemp ? `+${val1} °C` : `${val1} PSU`}
          </span>
        </div>

        <div className="bg-[#1e2023] p-2 rounded-lg border border-[#10b981]/40 flex items-center justify-between">
          <span className="text-[#c4c6cf] font-semibold">{secondaryRegion}:</span>
          <span className="font-bold text-[#10b981]">
            {isTemp ? `+${val2} °C` : `${val2} PSU`}
          </span>
        </div>

        <div className="bg-[#0c0e11] p-1.5 rounded-md border border-[#44474e]/30 flex items-center justify-between text-[11px]">
          <span className="text-[#8e9199]">Differential (Δ):</span>
          <span className={`font-bold ${Number(delta) >= 0 ? 'text-[#3b82f6]' : 'text-[#10b981]'}`}>
            {Number(delta) >= 0 ? `+${delta}` : delta} {unit}
          </span>
        </div>
      </div>
    </div>
  );
};

export const AnomalyAnalysisView: React.FC<Props> = ({ onExecutePrompt, setActiveTab }) => {
  const [region, setRegion] = useState<OceanRegion>('Arabian Sea');
  const [secondaryRegion, setSecondaryRegion] = useState<OceanRegion>('Bay of Bengal');

  const [timelineMetric, setTimelineMetric] = useState<'temperature' | 'salinity'>('temperature');

  const handleApplySearchFilters = (
    newRegion: OceanRegion,
    parameter: 'salinity' | 'temperature'
  ) => {
    if (newRegion) setRegion(newRegion);
    setTimelineMetric(parameter);
  };

  const reg1Stats = DEMO_REGION_STATS[region] || DEMO_REGION_STATS['Arabian Sea'];
  const reg2Stats = DEMO_REGION_STATS[secondaryRegion] || DEMO_REGION_STATS['Bay of Bengal'];

  // Monthly temperature anomaly & salinity trend trajectory (12-month timeline)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const monthlyPlottedTrend = months.map((m, idx) => {
    const temp1 = reg1Stats.temperature_anomaly_c + (idx % 3 === 0 ? 0.2 : -0.1);
    const temp2 = reg2Stats.temperature_anomaly_c + (idx % 2 === 0 ? 0.15 : -0.15);

    const sal1 = reg1Stats.avg_salinity_psu + (idx % 4 === 0 ? 0.12 : -0.08);
    const sal2 = reg2Stats.avg_salinity_psu + (idx % 2 === 0 ? -0.15 : 0.10);

    return {
      month: m,
      [`${region}_temp`]: Number(temp1.toFixed(2)),
      [`${secondaryRegion}_temp`]: Number(temp2.toFixed(2)),
      [`${region}_sal`]: Number(sal1.toFixed(2)),
      [`${secondaryRegion}_sal`]: Number(sal2.toFixed(2)),
    };
  });

  const handleDeepDive = () => {
    onExecutePrompt(`Compare thermal anomalies and salinity profiles between ${region} and ${secondaryRegion}.`);
    setActiveTab('chat');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 0. Natural Language Data Search Bar */}
      <NaturalLanguageSearchBar
        onExecutePrompt={onExecutePrompt}
        setActiveTab={setActiveTab}
        onApplyFilters={handleApplySearchFilters}
      />

      {/* 1. Region Selector Header */}
      <section className="bg-[#282a2d] border border-[#44474e]/30 rounded-xl p-5 shadow-lg flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-[#6cd7d4]">compare_arrows</span>
            <h2 className="font-bold text-lg text-[#e2e2e6]">Dual Ocean Comparison Studio</h2>
          </div>
          <p className="text-xs text-[#c4c6cf]">
            Compare depth profiles, thermal anomalies, and float distribution across oceans
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-[#8e9199]">OCEAN REGION 1</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as OceanRegion)}
              className="bg-[#1e2023] border border-[#6cd7d4]/30 text-xs text-[#e2e2e6] rounded px-3 py-1.5 font-mono focus:outline-none"
            >
              {Object.keys(DEMO_REGION_STATS).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <span className="font-mono text-xs text-[#8e9199] mt-4 font-bold">VS</span>

          <div className="flex flex-col gap-1">
            <label className="font-mono text-[10px] text-[#8e9199]">OCEAN REGION 2</label>
            <select
              value={secondaryRegion}
              onChange={(e) => setSecondaryRegion(e.target.value as OceanRegion)}
              className="bg-[#1e2023] border border-[#6cd7d4]/30 text-xs text-[#e2e2e6] rounded px-3 py-1.5 font-mono focus:outline-none"
            >
              {Object.keys(DEMO_REGION_STATS).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 2. Interactive Depth Profile Comparison Graphs */}
      <section>
        <DualOceanComparisonChart
          region1={region}
          region2={secondaryRegion}
          parameter="temperature"
          timeRange="Last 3 months"
        />
      </section>

      {/* 3. Anomaly & Metric Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Region 1 Card */}
        <div className="bg-[#1e2023] border-l-4 border-[#3b82f6] border-t border-r border-b border-[#44474e]/30 rounded-r-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <span className="font-mono text-xs text-[#3b82f6] uppercase font-bold">{region}</span>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="font-mono text-3xl font-extrabold text-[#ffdcc4]">
                +{reg1Stats.temperature_anomaly_c}°C
              </span>
              <span className="text-xs text-[#8e9199]">Warming Delta</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#44474e]/20 font-mono text-xs text-[#c4c6cf]">
            <div>Surface Temp: <span className="text-[#e2e2e6]">{reg1Stats.avg_surface_temp_c}°C</span></div>
            <div>Salinity: <span className="text-[#e2e2e6]">{reg1Stats.avg_salinity_psu} PSU</span></div>
            <div>Active Floats: <span className="text-[#e2e2e6]">{reg1Stats.active_floats}</span></div>
            <div>QC Pass: <span className="text-[#6cd7d4]">{reg1Stats.data_quality_pass_rate}%</span></div>
          </div>
        </div>

        {/* Region 2 Card */}
        <div className="bg-[#1e2023] border-l-4 border-[#10b981] border-t border-r border-b border-[#44474e]/30 rounded-r-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <span className="font-mono text-xs text-[#10b981] uppercase font-bold">{secondaryRegion}</span>
            <div className="flex items-baseline gap-3 mt-2">
              <span className="font-mono text-3xl font-extrabold text-[#10b981]">
                +{reg2Stats.temperature_anomaly_c}°C
              </span>
              <span className="text-xs text-[#8e9199]">Warming Delta</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#44474e]/20 font-mono text-xs text-[#c4c6cf]">
            <div>Surface Temp: <span className="text-[#e2e2e6]">{reg2Stats.avg_surface_temp_c}°C</span></div>
            <div>Salinity: <span className="text-[#e2e2e6]">{reg2Stats.avg_salinity_psu} PSU</span></div>
            <div>Active Floats: <span className="text-[#e2e2e6]">{reg2Stats.active_floats}</span></div>
            <div>QC Pass: <span className="text-[#10b981]">{reg2Stats.data_quality_pass_rate}%</span></div>
          </div>
        </div>
      </section>

      {/* 4. Thermal Anomaly & Salinity Plotted Line Graph Visualizer */}
      <section className="bg-[#1e2023] border border-[#44474e]/30 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-semibold text-sm text-[#e2e2e6] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#6cd7d4]">show_chart</span>
              {timelineMetric === 'temperature' ? 'Thermal Anomaly Timeline Trajectory (°C)' : 'Salinity Level Timeline Comparison (PSU)'}
            </h3>
            <p className="text-[11px] font-mono text-[#8e9199] mt-0.5">
              12-Month Plotted Comparison: <span className="text-[#3b82f6] font-bold">{region}</span> vs <span className="text-[#10b981] font-bold">{secondaryRegion}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Metric Switcher */}
            <div className="bg-[#111316] p-1 rounded-lg border border-[#44474e]/40 flex text-xs font-mono">
              <button
                onClick={() => setTimelineMetric('temperature')}
                className={`px-2.5 py-1 rounded transition-all ${
                  timelineMetric === 'temperature' ? 'bg-[#29a09d] text-[#00302f] font-bold shadow' : 'text-[#8e9199] hover:text-[#e2e2e6]'
                }`}
              >
                Thermal Anomaly (°C)
              </button>
              <button
                onClick={() => setTimelineMetric('salinity')}
                className={`px-2.5 py-1 rounded transition-all ${
                  timelineMetric === 'salinity' ? 'bg-[#29a09d] text-[#00302f] font-bold shadow' : 'text-[#8e9199] hover:text-[#e2e2e6]'
                }`}
              >
                Salinity (PSU)
              </button>
            </div>

            <button
              onClick={handleDeepDive}
              className="bg-[#29a09d] hover:bg-[#29a09d]/80 text-[#00302f] px-3 py-1.5 rounded font-mono text-xs font-bold transition-colors flex items-center gap-1 shadow-md"
            >
              <span className="material-symbols-outlined text-sm">psychology</span>
              Ask AI
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyPlottedTrend} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2C3E50" opacity={0.5} />
              <XAxis dataKey="month" stroke="#8e9199" tick={{ fontSize: 11, fill: '#c4c6cf' }} />
              <YAxis
                stroke="#8e9199"
                tick={{ fontSize: 11, fill: '#c4c6cf' }}
                unit={timelineMetric === 'temperature' ? '°C' : ' PSU'}
                domain={timelineMetric === 'salinity' ? [32.5, 37.5] : ['auto', 'auto']}
              />
              <Tooltip
                content={
                  <CustomTimelineTooltip
                    timelineMetric={timelineMetric}
                    region={region}
                    secondaryRegion={secondaryRegion}
                  />
                }
                cursor={{ stroke: '#6cd7d4', strokeWidth: 1.5, strokeDasharray: '3 3' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '6px' }} />
              <Line
                type="monotone"
                dataKey={timelineMetric === 'temperature' ? `${region}_temp` : `${region}_sal`}
                name={region}
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, fill: '#3b82f6' }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey={timelineMetric === 'temperature' ? `${secondaryRegion}_temp` : `${secondaryRegion}_sal`}
                name={secondaryRegion}
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};
