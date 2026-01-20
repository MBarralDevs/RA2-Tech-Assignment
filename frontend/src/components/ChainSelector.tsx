import type { Chain } from '../api/client';

interface ChainSelectorProps {
  selectedChain: Chain | null;
  onChainChange: (chain: Chain) => void;
}

/**
 * ChainSelector - A toggle to switch between Ethereum and BSC
 * 
 * Simple component with two buttons that highlight the selected chain
 */
export default function ChainSelector({ selectedChain, onChainChange }: ChainSelectorProps) {
  return (
    <div className="flex gap-4 mb-8">
      <button
        onClick={() => onChainChange('ethereum')}
        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
          selectedChain === 'ethereum'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Ethereum
      </button>
      
      <button
        onClick={() => onChainChange('bsc')}
        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
          selectedChain === 'bsc'
            ? 'bg-yellow-500 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        BSC
      </button>
    </div>
  );
}