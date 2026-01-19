use ethers::types::{Address, U256};
use serde::{Deserialize, Serialize};

/// Represents a single USDT Transfer event from the blockchain
/// Event signature: Transfer(address indexed from, address indexed to, uint256 value)
#[derive(Debug, Clone)]
pub struct TransferEvent {
    pub from: Address,      // Who sent the tokens
    pub to: Address,        // Who received the tokens
    pub value: U256,        // Amount transferred (in token's smallest unit)
    pub block_number: u64,  // Which block this happened in
    pub timestamp: u64,     // Unix timestamp of the block
}

/// Aggregated volume data for a time period (30 minutes)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VolumeData {
    pub timestamp: u64,     // Start of the 30-minute period
    pub volume: String,     // Total volume in this period (as string to avoid precision loss)
}

/// Top sender data for the pie chart
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SenderData {
    pub address: String,    // Sender's address
    pub volume: String,     // Total volume sent by this address
    pub percentage: f64,    // Percentage of total volume
}

/// API response containing both charts data
#[derive(Debug, Serialize, Deserialize)]
pub struct TransferStats {
    pub volume_chart: Vec<VolumeData>,      // 30-minute aggregated volumes
    pub top_senders: Vec<SenderData>,       // Top senders (90th percentile)
    pub total_volume: String,               // Total volume in the period
}