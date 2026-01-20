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
        <header className="mb-12 text-center">
          <div className="inline-block mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl shadow-xl">
              <h1 className="text-5xl font-bold mb-2">
                📊 USDT Transfer Analytics
              </h1>
              <p className="text-blue-100 text-lg">
                Analyzing on-chain USDT transfer activity on November 17, 2025
              </p>
            </div>
          </div>
          <div className="mt-6 text-gray-600">
            <p className="text-sm">
              Real-time blockchain data visualization • Powered by Rust + React
            </p>
          </div>
        </header>

        {/* Chain Selector */}
        <ChainSelector 
          selectedChain={selectedChain}
          onChainChange={setSelectedChain}
        />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="relative inline-block">
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="animate-ping rounded-full h-12 w-12 bg-blue-400 opacity-75"></div>
              </div>
            </div>
            <div className="mt-8 space-y-3">
              <p className="text-xl font-semibold text-gray-700">
                Loading {selectedChain === 'ethereum' ? 'Ethereum' : 'BSC'} data...
              </p>
              <p className="text-gray-500">
                Fetching blockchain events • This may take 4-5 minutes
              </p>
              <div className="mt-4 inline-block bg-blue-50 px-6 py-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  ⏱️ Processing hundreds of thousands of on-chain transfers
                </p>
              </div>
            </div>
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
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl shadow-xl border border-gray-200">
              <h2 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                <span className="text-4xl">📊</span>
                Summary Statistics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200 transform hover:scale-105 transition-transform duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Total Volume</p>
                    <span className="text-3xl">💰</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-900">
                    {parseFloat(data.total_volume).toLocaleString()}
                  </p>
                  <p className="text-blue-700 font-semibold mt-1">USDT</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200 transform hover:scale-105 transition-transform duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Time Periods</p>
                    <span className="text-3xl">⏰</span>
                  </div>
                  <p className="text-3xl font-bold text-green-900">
                    {data.volume_chart.length}
                  </p>
                  <p className="text-green-700 font-semibold mt-1">× 30 minutes</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200 transform hover:scale-105 transition-transform duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Top Senders</p>
                    <span className="text-3xl">👥</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-900">
                    {data.top_senders.length}
                  </p>
                  <p className="text-purple-700 font-semibold mt-1">addresses</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm pb-8">
          <p>Built with Rust + React • Powered by Infura RPC</p>
          <p className="mt-2">Data source: Ethereum & BSC Mainnet</p>
        </footer>
    </div>
  );
}