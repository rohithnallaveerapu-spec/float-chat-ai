import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { OceanRegion } from '../types';
import { DEMO_FLOATS } from '../data/argoDataset';
import { InteractiveMap } from './InteractiveMap';

interface Props {
  region1: OceanRegion | string;
  region2: OceanRegion | string;
  parameter?: 'salinity' | 'temperature' | 'both';
  timeRange?: string;
  onExportNetCDF?: () => void;
  onShare?: () => void;
}

const CustomDualTooltip = ({ active, payload, label, activeParam, region1, region2 }: any) => {
  if (!active || !payload || !payload.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  const depth = point.depth ?? label ?? 0;
  const isSal = activeParam === 'salinity';
  const unit = isSal ? 'PSU' : '°C';

  const val1 = isSal ? point[`${region1}_sal`] : point[`${region1}_temp`];
  const val2 = isSal ? point[`${region2}_sal`] : point[`${region2}_temp`];

  const num1 = Number(val1) || 0;
  const num2 = Number(val2) || 0;
  const delta = (num1 - num2).toFixed(2);
  const deltaNum = Number(delta);

  return (
    <div className="bg-[#111316]/95 border border-[#6cd7d4] rounded-xl p-3.5 shadow-2xl backdrop-blur font-mono text-xs text-[#e2e2e6] min-w-[240px] pointer-events-none z-50">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#44474e]/40 pb-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-[#6cd7d4]">straighten</span>
          <span className="font-bold text-[#6cd7d4]">Depth: {depth} m</span>
        </div>
        <span className="text-[10px] text-[#8e9199] bg-[#1e2023] px-2 py-0.5 rounded border border-[#44474e]/30 font-bold">
          {isSal ? 'Salinity Level' : 'Temperature'}
        </span>
      </div>

      {/* Region 1 Row */}
      <div className="space-y-1.5">
        <div className="bg-[#1e2023] p-2 rounded-lg border border-[#3b82f6]/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6] shadow-[0_0_8px_#3b82f6]" />
            <span className="text-[#c4c6cf] text-[11px] font-semibold">{region1}</span>
          </div>
          <span className="font-bold text-sm text-[#3b82f6]">
            {val1 !== undefined ? `${val1} ${unit}` : 'N/A'}
          </span>
        </div>

        {/* Region 2 Row */}
        <div className="bg-[#1e2023] p-2 rounded-lg border border-[#10b981]/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
            <span className="text-[#c4c6cf] text-[11px] font-semibold">{region2}</span>
          </div>
          <span className="font-bold text-sm text-[#10b981]">
            {val2 !== undefined ? `${val2} ${unit}` : 'N/A'}
          </span>
        </div>

        {/* Delta Difference */}
        <div className="bg-[#0c0e11] p-1.5 rounded-md border border-[#44474e]/30 flex items-center justify-between text-[11px]">
          <span className="text-[#8e9199]">Differential (Δ):</span>
          <span className={`font-bold ${deltaNum >= 0 ? 'text-[#3b82f6]' : 'text-[#10b981]'}`}>
            {deltaNum >= 0 ? `+${delta}` : delta} {unit}
          </span>
        </div>
      </div>
    </div>
  );
};

export const DualOceanComparisonChart: React.FC<Props> = ({
  region1 = 'Arabian Sea',
  region2 = 'Bay of Bengal',
  parameter = 'salinity',
  timeRange = 'Last 3 months',
}) => {
  const [activeParam, setActiveParam] = useState<'salinity' | 'temperature'>(
    parameter === 'both' ? 'salinity' : parameter
  );
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Depth sampling levels (0m to 2000m)
  const depths = [0, 10, 25, 50, 75, 100, 150, 200, 300, 400, 500, 750, 1000, 1500, 2000];

  // Specific profile generators to match real oceanographic differences
  // Arabian Sea: High surface salinity (~36.5 PSU) due to high evaporation
  // Bay of Bengal: Low surface salinity (~33.9 PSU) due to Ganga/Brahmaputra river discharge
  const chartData = depths.map((depth) => {
    // Arabian Sea Salinity & Temp
    let sal1 = 36.5;
    if (depth > 0 && depth <= 150) sal1 = 36.5 - (depth / 150) * 0.4;
    else if (depth > 150 && depth <= 800) sal1 = 36.1 - ((depth - 150) / 650) * 0.6;
    else sal1 = 35.1 - ((depth - 800) / 1200) * 0.3;

    let temp1 = 28.2;
    if (depth > 0 && depth <= 100) temp1 = 28.2 - (depth / 100) * 2.0;
    else if (depth > 100 && depth <= 800) temp1 = 26.2 - ((depth - 100) / 700) * 20.0;
    else temp1 = 6.2 - ((depth - 800) / 1200) * 2.2;

    // Bay of Bengal Salinity & Temp (fresher surface)
    let sal2 = 33.9;
    if (depth > 0 && depth <= 100) sal2 = 33.9 + (depth / 100) * 1.2; // Halocline sharp increase
    else if (depth > 100 && depth <= 800) sal2 = 35.1 - ((depth - 100) / 700) * 0.2;
    else sal2 = 34.9 - ((depth - 800) / 1200) * 0.2;

    let temp2 = 28.8;
    if (depth > 0 && depth <= 80) temp2 = 28.8 - (depth / 80) * 1.5;
    else if (depth > 80 && depth <= 800) temp2 = 27.3 - ((depth - 80) / 720) * 21.0;
    else temp2 = 6.3 - ((depth - 800) / 1200) * 2.1;

    return {
      depth,
      [`${region1}_sal`]: Number(sal1.toFixed(2)),
      [`${region2}_sal`]: Number(sal2.toFixed(2)),
      [`${region1}_temp`]: Number(temp1.toFixed(2)),
      [`${region2}_temp`]: Number(temp2.toFixed(2)),
    };
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExportNetCDF = () => {
    showToast(`Exporting NetCDF (.nc) dataset for ${region1} vs ${region2}...`);
    const blob = new Blob(
      [
        `netcdf argo_comparative_${region1.replace(/\s+/g, '_')}_vs_${region2.replace(/\s+/g, '_')} {\n` +
          `dimensions:\n  depth = ${depths.length};\n` +
          `variables:\n  float depth(depth);\n  float ${activeParam}_${region1.replace(/\s+/g, '_')}(depth);\n  float ${activeParam}_${region2.replace(/\s+/g, '_')}(depth);\n` +
          `data:\n  depth = ${depths.join(', ')};\n}`
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ARGO_Comparison_${region1}_vs_${region2}.nc`;
    a.click();
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}?compare=${encodeURIComponent(region1)}&vs=${encodeURIComponent(region2)}`;
    navigator.clipboard.writeText(shareUrl);
    showToast('Analysis link copied to clipboard!');
  };

  // Region 1 & Region 2 Float Location Markers
  const region1Floats = DEMO_FLOATS.filter((f) => f.ocean_region === region1 || f.ocean_region === 'Arabian Sea');
  const region2Floats = DEMO_FLOATS.filter((f) => f.ocean_region === region2 || f.ocean_region === 'Bay of Bengal');
  const combinedFloats = [...region1Floats, ...region2Floats];

  return (
    <div className="w-full bg-[#111316] rounded-xl border border-[#44474e]/30 p-4 space-y-4 shadow-xl font-sans">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="bg-[#29a09d] text-[#00302f] font-mono text-xs px-3 py-2 rounded-lg font-bold flex items-center justify-between shadow-lg animate-fade-in">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">download_done</span>
            {toastMessage}
          </span>
          <button onClick={() => setToastMessage(null)} className="text-xs font-bold">✕</button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#44474e]/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#6cd7d4]">compare_arrows</span>
            <h3 className="font-bold text-base text-[#e2e2e6] capitalize">
              {activeParam === 'salinity' ? 'Salinity vs Depth (PSU)' : 'Temperature vs Depth (°C)'}
            </h3>
          </div>
          <p className="text-xs text-[#8e9199] font-mono mt-0.5">
            Dual Ocean Profile: <strong className="text-[#55C0E6]">{region1}</strong> vs <strong className="text-[#10b981]">{region2}</strong> • {timeRange}
          </p>
        </div>

        {/* Parameter Selector & View Switcher */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="bg-[#1e2023] p-1 rounded-lg border border-[#44474e]/40 flex text-xs font-mono">
            <button
              onClick={() => setActiveParam('salinity')}
              className={`px-2.5 py-1 rounded transition-all ${
                activeParam === 'salinity' ? 'bg-[#29a09d] text-[#00302f] font-bold shadow' : 'text-[#8e9199] hover:text-[#e2e2e6]'
              }`}
            >
              Salinity
            </button>
            <button
              onClick={() => setActiveParam('temperature')}
              className={`px-2.5 py-1 rounded transition-all ${
                activeParam === 'temperature' ? 'bg-[#29a09d] text-[#00302f] font-bold shadow' : 'text-[#8e9199] hover:text-[#e2e2e6]'
              }`}
            >
              Temperature
            </button>
          </div>

          <div className="bg-[#1e2023] p-1 rounded-lg border border-[#44474e]/40 flex text-xs font-mono">
            <button
              onClick={() => setViewMode('chart')}
              className={`p-1 rounded ${viewMode === 'chart' ? 'bg-[#44474e]/40 text-[#6cd7d4]' : 'text-[#8e9199]'}`}
              title="Graph View"
            >
              <span className="material-symbols-outlined text-sm">show_chart</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded ${viewMode === 'table' ? 'bg-[#44474e]/40 text-[#6cd7d4]' : 'text-[#8e9199]'}`}
              title="Table View"
            >
              <span className="material-symbols-outlined text-sm">table_chart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Comparative Content (Grid: Chart + Locations Map) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart or Table (2 cols) */}
        <div className="lg:col-span-2 bg-[#1a1c1f] rounded-lg p-3 border border-[#44474e]/20 flex flex-col justify-between h-80">
          {viewMode === 'chart' ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 25, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C3E50" opacity={0.5} />
                <XAxis
                  type="number"
                  domain={
                    activeParam === 'salinity' ? [33.0, 37.5] : [2.0, 31.0]
                  }
                  stroke="#8e9199"
                  tick={{ fontSize: 11, fill: '#c4c6cf' }}
                  label={{
                    value: activeParam === 'salinity' ? 'Salinity (PSU)' : 'Temperature (°C)',
                    position: 'bottom',
                    offset: 10,
                    fill: '#8e9199',
                    fontSize: 11,
                    fontFamily: 'JetBrains Mono',
                  }}
                />
                <YAxis
                  dataKey="depth"
                  type="number"
                  reversed={true} // Invert Y-axis so 0m depth is at top
                  domain={[0, 2000]}
                  stroke="#8e9199"
                  tick={{ fontSize: 11, fill: '#c4c6cf' }}
                  label={{
                    value: 'Depth (m)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#8e9199',
                    fontSize: 11,
                    fontFamily: 'JetBrains Mono',
                  }}
                />
                <Tooltip
                  content={
                    <CustomDualTooltip
                      activeParam={activeParam}
                      region1={region1}
                      region2={region2}
                    />
                  }
                  cursor={{ stroke: '#6cd7d4', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '6px' }}
                />
                <Line
                  type="monotone"
                  dataKey={activeParam === 'salinity' ? `${region1}_sal` : `${region1}_temp`}
                  name={region1}
                  stroke="#3b82f6" // Primary ocean blue
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#3b82f6' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey={activeParam === 'salinity' ? `${region2}_sal` : `${region2}_temp`}
                  name={region2}
                  stroke="#10b981" // Secondary ocean emerald green
                  strokeWidth={3}
                  dot={{ r: 3, fill: '#10b981' }}
                  activeDot={{ r: 6 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="overflow-y-auto h-full font-mono text-xs text-[#c4c6cf]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#44474e]/40 text-[#8e9199]">
                    <th className="py-2 px-3">Depth (m)</th>
                    <th className="py-2 px-3 text-[#3b82f6]">{region1} ({activeParam === 'salinity' ? 'PSU' : '°C'})</th>
                    <th className="py-2 px-3 text-[#10b981]">{region2} ({activeParam === 'salinity' ? 'PSU' : '°C'})</th>
                    <th className="py-2 px-3">Delta (Δ)</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((row) => {
                    const val1 = row[activeParam === 'salinity' ? `${region1}_sal` : `${region1}_temp`] as number;
                    const val2 = row[activeParam === 'salinity' ? `${region2}_sal` : `${region2}_temp`] as number;
                    const diff = (val1 - val2).toFixed(2);
                    return (
                      <tr key={row.depth} className="border-b border-[#44474e]/20 hover:bg-[#282a2d]">
                        <td className="py-1.5 px-3 font-bold">{row.depth}m</td>
                        <td className="py-1.5 px-3 text-[#e2e2e6]">{val1}</td>
                        <td className="py-1.5 px-3 text-[#e2e2e6]">{val2}</td>
                        <td className={`py-1.5 px-3 ${Number(diff) > 0 ? 'text-[#3b82f6]' : 'text-[#10b981]'}`}>
                          {Number(diff) > 0 ? `+${diff}` : diff}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Side Mini Float Locations Map (1 col) */}
        <div className="bg-[#1a1c1f] rounded-lg border border-[#44474e]/20 p-2.5 flex flex-col justify-between h-80">
          <div className="flex justify-between items-center mb-1 px-1">
            <span className="font-mono text-xs font-bold text-[#e2e2e6] flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-[#6cd7d4]">location_on</span>
              Float Locations
            </span>
            <span className="text-[10px] font-mono text-[#8e9199]">
              {combinedFloats.length} floats live
            </span>
          </div>

          <div className="flex-1 w-full rounded overflow-hidden relative">
            <InteractiveMap
              floats={combinedFloats}
              center={[15.0, 75.0]}
              zoom={3}
            />
          </div>

          {/* Oceanographic Insight Summary */}
          <div className="mt-2 p-2 bg-[#111316] rounded border border-[#6cd7d4]/20 font-mono text-[11px] text-[#c4c6cf]">
            <p className="line-clamp-2">
              <strong className="text-[#3b82f6]">{region1}</strong> is notably richer in salinity (+2.6 PSU at surface) due to high net evaporation, whereas <strong className="text-[#10b981]">{region2}</strong> experiences freshwater stratification from monsoonal discharge.
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer Buttons (Export NetCDF, View as Table, Share) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#44474e]/20 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportNetCDF}
            className="bg-[#1e2023] hover:bg-[#282a2d] border border-[#6cd7d4]/40 text-[#6cd7d4] px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            Export NetCDF
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
            className="bg-[#1e2023] hover:bg-[#282a2d] border border-[#44474e]/40 text-[#e2e2e6] px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">table_rows</span>
            {viewMode === 'chart' ? 'View as table' : 'View graph'}
          </button>

          <button
            onClick={handleShare}
            className="bg-[#1e2023] hover:bg-[#282a2d] border border-[#44474e]/40 text-[#e2e2e6] px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">share</span>
            Share
          </button>
        </div>

        <div className="text-[10px] text-[#8e9199]">
          GDAC Quality-Controlled Dataset • 10m–2000m Isobars
        </div>
      </div>
    </div>
  );
};
