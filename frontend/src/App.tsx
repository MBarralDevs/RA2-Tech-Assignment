import { useState, useEffect } from 'react';
import ChainSelector from './components/ChainSelector';
import VolumeChart from './components/VolumeChart';
import TopSendersChart from './components/TopSendersChart';
import { fetchTransferStats, type Chain, type TransferStats } from './api/client';
/**
 * Main App Component
 * 
 * Manages:
 * - Selected blockchain (Ethereum or BSC)
 * - Loading state
 * - Data fetching from backend
 * - Displaying charts
 */
export default function App() {
  // State management
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);
  const [data, setData] = useState<TransferStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data whenever the selected chain changes
  useEffect(() => {
  // Only load if a chain is selected
  if (!selectedChain) return;

  async function loadData() {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Loading data for ${selectedChain}...`);
      const stats = await fetchTransferStats(selectedChain as Chain);
      setData(stats);
      console.log(`Data loaded successfully for ${selectedChain}`);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }

  loadData();
}, [selectedChain]);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            USDT Transfer Analytics
          </h1>
          <p className="text-gray-600">
            Analyzing on-chain USDT transfer activity on November 17, 2024
          </p>
        </header>

        {/* Chain Selector */}
        <ChainSelector 
          selectedChain={selectedChain}
          onChainChange={setSelectedChain}
        />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">
              Loading {selectedChain} data... This may take 2-3 minutes on first load.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
            <p className="font-bold">Error</p>
            <p>{error}</p>
            <p className="mt-2 text-sm">
              Make sure the backend server is running on http://localhost:8080
            </p>
          </div>
        )}

        {/* No chain selected state */}
        {!selectedChain && !loading && (
          <div className="text-center py-12 bg-white rounded-lg shadow-lg">
            <p className="text-xl text-gray-600">
              👆 Select a blockchain above to view USDT transfer analytics
            </p>
          </div>
        )}

        {/* Charts - Only show when data is loaded */}
        {!loading && !error && data && (
          <div className="space-y-8">
            {/* Volume Bar Chart */}
            <VolumeChart 
              data={data.volume_chart}
              chain={selectedChain as string}
            />

            {/* Top Senders Pie Chart */}
            <TopSendersChart 
              data={data.top_senders}
              chain={selectedChain as string}
            />

            {/* Summary Stats */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Total Volume</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {parseFloat(data.total_volume).toLocaleString()} USDT
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Time Periods</p>
                  <p className="text-2xl font-bold text-green-600">
                    {data.volume_chart.length} × 30min
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <p className="text-sm text-gray-600">Top Senders</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {data.top_senders.length} addresses
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}