use anyhow::{Context, Result};
use ethers::prelude::*;
use std::sync::Arc;

use super::types::TransferEvent;

/// BlockchainClient handles all interactions with Ethereum/BSC via RPC
pub struct BlockchainClient {
    provider: Arc<Provider<Http>>,
    usdt_address: Address,
}