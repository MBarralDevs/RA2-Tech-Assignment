use anyhow::{Context, Result};
use ethers::prelude::*;
use std::sync::Arc;

use super::types::TransferEvent;

/// BlockchainClient handles all interactions with Ethereum/BSC via RPC
pub struct BlockchainClient {
    provider: Arc<Provider<Http>>,
    usdt_address: Address,
}

impl BlockchainClient {
    /// Create a new blockchain client
    pub fn new(rpc_url: &str, usdt_address: &str) -> Result<Self> {
        let provider = Provider::<Http>::try_from(rpc_url)
            .context("Failed to create provider")?;
        
        let usdt_address = usdt_address.parse::<Address>()
            .context("Invalid USDT address")?;

        Ok(Self {
            provider: Arc::new(provider),
            usdt_address,
        })
    }

    /// Converts a Unix timestamp to a block number
    /// 
    /// RPC Concept: Blockchains store data in blocks, not timestamps.
    /// We need to find which block was mined closest to our target timestamp.
    /// This uses binary search to efficiently find the right block.
    pub async fn timestamp_to_block(&self, timestamp: u64) -> Result<u64> {
        // Get the latest block to start our search
        let latest_block = self.provider.get_block_number().await?;
        
        // Binary search to find the block with the closest timestamp
        let mut low = 0u64;
        let mut high = latest_block.as_u64();
        
        while low < high {
            let mid = (low + high) / 2;
            
            let block = self.provider
                .get_block(mid)
                .await?
                .context("Block not found")?;
            
            let block_timestamp = block.timestamp.as_u64();
            
            if block_timestamp < timestamp {
                low = mid + 1;
            } else {
                high = mid;
            }
        }
        
        Ok(low)
    }

    /// Fetches all Transfer events from the USDT contract in a block range
    /// Uses batching to avoid RPC limits (max 10,000 results per query)
    pub async fn fetch_transfer_events(
        &self,
        from_block: u64,
        to_block: u64,
    ) -> Result<Vec<TransferEvent>> {
        log::info!(
            "Fetching Transfer events from block {} to {}",
            from_block,
            to_block
        );

        // Split into chunks to avoid hitting RPC limits (10k results max)
        const BATCH_SIZE: u64 = 500; // Fetch 500 blocks at a time
        
        let mut all_events = Vec::new();
        let mut current_block = from_block;

        while current_block < to_block {
            let batch_end = std::cmp::min(current_block + BATCH_SIZE, to_block);
            
            log::info!(
                "Fetching batch: blocks {} to {} ({} total fetched so far)",
                current_block,
                batch_end,
                all_events.len()
            );

            // The Transfer event signature
            let transfer_event_signature = H256::from_slice(
                &ethers::utils::keccak256("Transfer(address,address,uint256)")
            );

            // Build the filter for this batch
            let filter = Filter::new()
                .address(self.usdt_address)
                .topic0(transfer_event_signature)
                .from_block(current_block)
                .to_block(batch_end);

            // Execute the RPC call
            let logs = self.provider.get_logs(&filter).await?;

            log::info!("Found {} Transfer events in this batch", logs.len());

            // Convert raw logs into our TransferEvent struct
            for log in logs {
                // Decode the event data
                if log.topics.len() < 3 {
                    continue; // Skip malformed events
                }

                let from = Address::from(log.topics[1]);
                let to = Address::from(log.topics[2]);
                
                // Decode the value from the data field
                let value = U256::from_big_endian(&log.data);
                
                let block_number = log.block_number
                    .context("Log missing block number")?
                    .as_u64();

                // Get the block to extract timestamp
                let block = self.provider
                    .get_block(block_number)
                    .await?
                    .context("Block not found")?;
                
                let timestamp = block.timestamp.as_u64();

                all_events.push(TransferEvent {
                    from,
                    to,
                    value,
                    block_number,
                    timestamp,
                });
            }

            current_block = batch_end;
        }

        log::info!("Total Transfer events fetched: {}", all_events.len());

        Ok(all_events)
    }
}