use std::collections::HashMap;
use ethers::types::{Address, U256};

use crate::blockchain::{TransferEvent, VolumeData, SenderData, TransferStats};

/// USDT uses 6 decimals (not 18 like most ERC20 tokens!)
/// 1 USDT = 1,000,000 in contract units
const USDT_DECIMALS: u32 = 6;

/// Converts USDT token units to human-readable format
/// Example: 1_000_000 -> "1.000000" USDT
fn format_usdt_amount(amount: U256) -> String {
    let divisor = U256::from(10u64.pow(USDT_DECIMALS));
    let whole = amount / divisor;
    let fraction = amount % divisor;
    
    format!("{}.{:06}", whole, fraction)
}

/// Aggregates transfer events into 30-minute buckets
/// 
/// How it works:
/// 1. For each event, calculate which 30-minute bucket it belongs to
/// 2. Sum up all volumes in that bucket
/// 3. Return sorted list of (timestamp, volume) pairs
pub fn aggregate_volume_by_time(events: &[TransferEvent]) -> Vec<VolumeData> {
    const THIRTY_MINUTES: u64 = 30 * 60; // 30 minutes in seconds
    
    let mut volume_map: HashMap<u64, U256> = HashMap::new();
    
    // Group transfers by 30-minute periods
    for event in events {
        // Calculate the start of the 30-minute period
        let bucket = (event.timestamp / THIRTY_MINUTES) * THIRTY_MINUTES;
        
        // Add this transfer's volume to the bucket
        *volume_map.entry(bucket).or_insert(U256::zero()) += event.value;
    }
    
    // Convert to vector and sort by timestamp
    let mut volume_data: Vec<VolumeData> = volume_map
        .into_iter()
        .map(|(timestamp, volume)| VolumeData {
            timestamp,
            volume: format_usdt_amount(volume),
        })
        .collect();
    
    volume_data.sort_by_key(|v| v.timestamp);
    
    volume_data
}

/// Calculates top senders that account for 90% of total volume
/// 
/// Process:
/// 1. Sum up total volume sent by each address
/// 2. Sort senders by volume (descending)
/// 3. Take senders until we reach 90% of total volume
/// 4. Group remaining as "Others"
pub fn calculate_top_senders(events: &[TransferEvent]) -> Vec<SenderData> {
    // Sum volumes by sender address
    let mut sender_volumes: HashMap<Address, U256> = HashMap::new();
    let mut total_volume = U256::zero();
    
    for event in events {
        *sender_volumes.entry(event.from).or_insert(U256::zero()) += event.value;
        total_volume += event.value;
    }
    
    // Convert to vector and sort by volume (highest first)
    let mut senders: Vec<(Address, U256)> = sender_volumes.into_iter().collect();
    senders.sort_by(|a, b| b.1.cmp(&a.1));
    
    // Calculate 90th percentile threshold
    let target_volume = total_volume * U256::from(90) / U256::from(100);
    
    let mut accumulated_volume = U256::zero();
    let mut top_senders = Vec::new();
    let mut others_volume = U256::zero();
    
    for (address, volume) in senders {
        if accumulated_volume < target_volume {
            // This sender is in the top 90%
            let percentage = (volume.as_u128() as f64 / total_volume.as_u128() as f64) * 100.0;
            
            top_senders.push(SenderData {
                address: format!("{:?}", address),
                volume: format_usdt_amount(volume),
                percentage,
            });
            
            accumulated_volume += volume;
        } else {
            // This sender is in the "Others" category
            others_volume += volume;
        }
    }
    
    // Add "Others" category if there are remaining senders
    if others_volume > U256::zero() {
        let percentage = (others_volume.as_u128() as f64 / total_volume.as_u128() as f64) * 100.0;
        
        top_senders.push(SenderData {
            address: "Others".to_string(),
            volume: format_usdt_amount(others_volume),
            percentage,
        });
    }
    
    top_senders
}

/// Main function that processes all events and returns complete stats
pub fn process_transfer_events(events: Vec<TransferEvent>) -> TransferStats {
    let volume_chart = aggregate_volume_by_time(&events);
    let top_senders = calculate_top_senders(&events);
    
    // Calculate total volume
    let total_volume: U256 = events.iter().map(|e| e.value).sum();
    
    TransferStats {
        volume_chart,
        top_senders,
        total_volume: format_usdt_amount(total_volume),
    }
}