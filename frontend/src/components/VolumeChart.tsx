import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { VolumeData } from '../api/client';

interface VolumeChartProps {
  data: VolumeData[];
  chain: string;
}

/**
 * VolumeChart - Displays USDT transfer volumes in 30-minute intervals
 * 
 * Uses Recharts BarChart to visualize the data
 */
export default function VolumeChart({ data, chain }: VolumeChartProps) {
  // Transform data for Recharts
  // Recharts expects data with readable labels
  const chartData = data.map(item => ({
    time: formatTimestamp(item.timestamp),
    volume: parseFloat(item.volume),
    volumeFormatted: formatVolume(item.volume),
  }));

  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 hover:shadow-3xl transition-shadow duration-300">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <span className="text-4xl">📈</span>
          USDT Transfer Volume
        </h2>
        <div className="mt-2 flex items-center gap-4">
          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            {chain.toUpperCase()}
          </span>
          <p className="text-gray-600 text-sm">
            30-minute intervals • November 17, 2025 (UTC)
          </p>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            label={{ value: 'Volume (USDT)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value) => value ? formatVolume(value.toString()) : '0'}
            labelStyle={{ color: '#000' }}
          />
          <Legend />
          <Bar 
            dataKey="volume" 
            fill="#3b82f6" 
            name="Transfer Volume (USDT)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Formats Unix timestamp to readable time (HH:MM)
 */
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Formats large numbers with commas and 2 decimal places
 * Example: "1234567.89" -> "1,234,567.89"
 */
function formatVolume(volume: string): string {
  const num = parseFloat(volume);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}