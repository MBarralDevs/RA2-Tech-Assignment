// API client for communicating with our Rust backend

// Base URL of our backend server
const API_BASE_URL = 'http://localhost:8080';

// TypeScript types matching our Rust backend response
export interface VolumeData {
  timestamp: number;
  volume: string;
}

export interface SenderData {
  address: string;
  volume: string;
  percentage: number;
}

export interface TransferStats {
  volume_chart: VolumeData[];
  top_senders: SenderData[];
  total_volume: string;
}

// Supported blockchain networks
export type Chain = 'ethereum' | 'bsc';

/**
 * Fetches transfer statistics from the backend
 * 
 * @param chain - Which blockchain to query ('ethereum' or 'bsc')
 * @returns Promise with the transfer statistics
 */
export async function fetchTransferStats(chain: Chain): Promise<TransferStats> {
  const url = `${API_BASE_URL}/api/transfers?chain=${chain}`;
  
  console.log(`Fetching data for ${chain}...`);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`);
  }
  
  const data: TransferStats = await response.json();
  
  console.log(`Received ${data.volume_chart.length} data points for ${chain}`);
  
  return data;
}