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
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">
        USDT Transfer Volume - {chain.toUpperCase()}
      </h2>
      <p className="text-gray-600 mb-6">
        30-minute intervals on November 17, 2024 (UTC)
      </p>
      
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