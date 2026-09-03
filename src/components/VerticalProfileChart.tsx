import React from 'react';
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
import { Measurement } from '../types';

interface Props {
  measurements: Measurement[];
  title?: string;
}

const CustomProfileTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  const depth = point.depth ?? label ?? 0;
  const temp = point.temperature;
  const sal = point.salinity;

  // Determine ocean depth zone
  let depthZone = 'Surface Layer (Epipelagic)';
  let zoneColor = '#6cd7d4';
  if (depth > 200 && depth <= 1000) {
    depthZone = 'Thermocline (Mesopelagic)';
    zoneColor = '#55C0E6';
  } else if (depth > 1000) {
    depthZone = 'Deep Ocean (Bathypelagic)';
    zoneColor = '#3b82f6';
  }

  return (
    <div className="bg-[#111316]/95 border border-[#6cd7d4] rounded-xl p-3.5 shadow-2xl backdrop-blur font-mono text-xs text-[#e2e2e6] min-w-[220px] pointer-events-none z-50">
      {/* Tooltip Header: Depth & Pressure */}
      <div className="flex items-center justify-between border-b border-[#44474e]/40 pb-2 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-sm text-[#6cd7d4]">height</span>
          <span className="font-bold text-[#6cd7d4]">Depth: {depth} m</span>
        </div>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded border"
          style={{
            color: zoneColor,
            borderColor: `${zoneColor}60`,
            backgroundColor: `${zoneColor}15`,
          }}
        >
          ~{depth} dbar
        </span>
      </div>

      <div className="text-[10px] text-[#8e9199] mb-2 font-semibold tracking-wider uppercase flex items-center justify-between">
        <span>{depthZone}</span>
        <span className="text-[#10b981]">QC Passed</span>
      </div>

      {/* Metrics List */}
      <div className="space-y-2">
        {/* Temperature Point */}
        <div className="bg-[#1e2023] p-2 rounded-lg border border-[#55C0E6]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#55C0E6] shadow-[0_0_8px_#55C0E6]" />
            <span className="text-[#c4c6cf] text-[11px] font-semibold">Temperature:</span>
          </div>
          <span className="font-bold text-sm text-[#55C0E6]">
            {temp !== undefined && temp !== null ? `${Number(temp).toFixed(2)} °C` : 'N/A'}
          </span>
        </div>

        {/* Salinity Point */}
        <div className="bg-[#1e2023] p-2 rounded-lg border border-[#6cd7d4]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6cd7d4] shadow-[0_0_8px_#6cd7d4]" />
            <span className="text-[#c4c6cf] text-[11px] font-semibold">Salinity:</span>
          </div>
          <span className="font-bold text-sm text-[#6cd7d4]">
            {sal !== undefined && sal !== null ? `${Number(sal).toFixed(2)} PSU` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};

export const VerticalProfileChart: React.FC<Props> = ({ measurements, title }) => {
  const data = measurements.map((m) => ({
    depth: m.depth_m,
    temperature: m.temperature_c,
    salinity: m.salinity_psu,
  }));

  return (
    <div className="w-full h-72 bg-[#1e2023] rounded-lg p-4 border border-[#44474e]/30 flex flex-col justify-between">
      {title && (
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-base text-[#e2e2e6]">{title}</h3>
          <span className="text-xs font-mono text-[#6cd7d4]">0m - 2000m Isobars</span>
        </div>
      )}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2C3E50" opacity={0.5} />
            <XAxis
              type="number"
              domain={['dataMin - 1', 'dataMax + 1']}
              stroke="#8e9199"
              tick={{ fontSize: 11, fill: '#c4c6cf' }}
              label={{
                value: 'Temperature (°C) / Salinity (PSU)',
                position: 'bottom',
                offset: 5,
                fill: '#8e9199',
                fontSize: 11,
              }}
            />
            <YAxis
              dataKey="depth"
              type="number"
              reversed={true} // Invert Y-axis so depth 0 is at top
              domain={[0, 2000]}
              stroke="#8e9199"
              tick={{ fontSize: 11, fill: '#c4c6cf' }}
              label={{
                value: 'Depth (m)',
                angle: -90,
                position: 'insideLeft',
                fill: '#8e9199',
                fontSize: 11,
              }}
            />
            <Tooltip
              content={<CustomProfileTooltip />}
              cursor={{ stroke: '#6cd7d4', strokeWidth: 1.5, strokeDasharray: '3 3' }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              name="Temperature (°C)"
              stroke="#55C0E6"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#55C0E6' }}
              activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="salinity"
              name="Salinity (PSU)"
              stroke="#6cd7d4"
              strokeWidth={2}
              strokeDasharray="4 2"
              dot={{ r: 3, fill: '#6cd7d4' }}
              activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
