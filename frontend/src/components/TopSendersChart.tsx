import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SenderData } from '../api/client';

interface TopSendersChartProps {
  data: SenderData[];
  chain: string;
}

/**
 * TopSendersChart - Displays top USDT senders as a pie chart
 * 
 * Shows the top 90th percentile of senders with "Others" for the rest
 */
export default function TopSendersChart({ data, chain }: TopSendersChartProps) {
  // Transform data for Recharts
  const chartData = data.map(item => ({
    name: item.address === 'Others' ? 'Others' : shortenAddress(item.address),
    fullAddress: item.address,
    value: item.percentage,
    volume: item.volume,
  }));

  // Generate colors (first few get distinct colors, rest get shades)
  const COLORS = generateColors(chartData.length);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">
        Top USDT Senders - {chain.toUpperCase()}
      </h2>
      <p className="text-gray-600 mb-6">
        Top 90th percentile by volume
      </p>
      
      <ResponsiveContainer width="100%" height={500}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            layout="vertical" 
            align="right" 
            verticalAlign="middle"
            wrapperStyle={{ fontSize: '12px', maxHeight: '450px', overflowY: 'auto' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Shortens Ethereum address for display
 * Example: "0x1234...5678"
 */
function shortenAddress(address: string): string {
  if (address === 'Others') return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Custom label renderer for pie slices
 * Only shows percentage if slice is large enough
 */
function renderCustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) {
  // Only show label if percentage is > 2%
  if (percent < 0.02) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
}

/**
 * Custom tooltip showing full address and volume
 */
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 border border-gray-300 rounded shadow-lg">
        <p className="font-semibold">{data.fullAddress}</p>
        <p className="text-sm">Volume: {parseFloat(data.volume).toLocaleString()} USDT</p>
        <p className="text-sm">Percentage: {data.value.toFixed(2)}%</p>
      </div>
    );
  }
  return null;
}

/**
 * Generates colors for pie chart slices
 * First 10 get distinct colors, rest get blue shades
 */
function generateColors(count: number): string[] {
  const distinctColors = [
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
    '#6366f1', // indigo
    '#84cc16', // lime
  ];

  const colors: string[] = [];
  
  for (let i = 0; i < count; i++) {
    if (i < distinctColors.length) {
      colors.push(distinctColors[i]);
    } else {
      // Generate shades of blue for remaining slices
      const shade = 200 - ((i - distinctColors.length) * 10) % 100;
      colors.push(`hsl(217, 91%, ${shade / 4}%)`);
    }
  }
  
  return colors;
}