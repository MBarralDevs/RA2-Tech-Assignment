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
}