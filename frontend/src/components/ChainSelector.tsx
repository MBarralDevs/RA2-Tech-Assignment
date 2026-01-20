import type { Chain } from '../api/client';

interface ChainSelectorProps {
  selectedChain: Chain | null;
  onChainChange: (chain: Chain) => void;
}

/**
 * ChainSelector - A toggle to switch between Ethereum and BSC
 * 
 * Enhanced with modern styling and animations
 */
export default function ChainSelector({ selectedChain, onChainChange }: ChainSelectorProps) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
        Select Blockchain Network
      </h2>
      <div className="flex gap-6 justify-center">
        <button
          onClick={() => onChainChange('ethereum')}
          className={`group relative px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
            selectedChain === 'ethereum'
              ? 'bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-2xl shadow-blue-500/50'
              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 shadow-lg'
          }`}
        >
          <span className="flex items-center gap-3">
            <span className="text-2xl">⟠</span>
            <span>Ethereum</span>
          </span>
          {selectedChain === 'ethereum' && (
            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Active
            </div>
          )}
        </button>
        
        <button
          onClick={() => onChainChange('bsc')}
          className={`group relative px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
            selectedChain === 'bsc'
              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-2xl shadow-yellow-500/50'
              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-yellow-400 shadow-lg'
          }`}
        >
          <span className="flex items-center gap-3">
            <span className="text-2xl">🔶</span>
            <span>BSC</span>
          </span>
          {selectedChain === 'bsc' && (
            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Active
            </div>
          )}
        </button>
      </div>
      
      {/* Network info badges */}
      <div className="mt-4 flex gap-4 justify-center text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span>~12s block time</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
          <span>~3s block time</span>
        </div>
      </div>
    </div>
  );
}