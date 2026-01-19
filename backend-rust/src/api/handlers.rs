use actix_web::{web, HttpResponse, Result};
use serde::Deserialize;
use std::env;

use crate::blockchain::BlockchainClient;
use crate::aggregation::process_transfer_events;

/// Query parameters for the /api/transfers endpoint
#[derive(Debug, Deserialize)]
pub struct TransferQuery {
    chain: String,  // "ethereum" or "bsc"
}

/// Main handler for GET /api/transfers?chain=ethereum
/// 
/// This endpoint:
/// 1. Validates the chain parameter
/// 2. Creates a blockchain client for that chain
/// 3. Converts timestamps to block numbers
/// 4. Fetches all Transfer events in that range
/// 5. Aggregates the data
/// 6. Returns JSON response
pub async fn get_transfers(query: web::Query<TransferQuery>) -> Result<HttpResponse> {
    log::info!("Received request for chain: {}", query.chain);

    // Get configuration from environment variables
    let (rpc_url, usdt_address) = match query.chain.to_lowercase().as_str() {
        "ethereum" => (
            env::var("ETHEREUM_RPC_URL").expect("ETHEREUM_RPC_URL not set"),
            env::var("ETHEREUM_USDT_ADDRESS").expect("ETHEREUM_USDT_ADDRESS not set"),
        ),
        "bsc" => (
            env::var("BSC_RPC_URL").expect("BSC_RPC_URL not set"),
            env::var("BSC_USDT_ADDRESS").expect("BSC_USDT_ADDRESS not set"),
        ),
        _ => {
            return Ok(HttpResponse::BadRequest().json(serde_json::json!({
                "error": "Invalid chain parameter. Use 'ethereum' or 'bsc'"
            })));
        }
    };

    // Get timestamp range
    let start_timestamp: u64 = env::var("START_TIMESTAMP")
        .expect("START_TIMESTAMP not set")
        .parse()
        .expect("Invalid START_TIMESTAMP");
    
    let end_timestamp: u64 = env::var("END_TIMESTAMP")
        .expect("END_TIMESTAMP not set")
        .parse()
        .expect("Invalid END_TIMESTAMP");

    log::info!("Timestamp range: {} to {}", start_timestamp, end_timestamp);

    // Create blockchain client
    let client = BlockchainClient::new(&rpc_url, &usdt_address)
        .map_err(|e| {
            log::error!("Failed to create blockchain client: {}", e);
            actix_web::error::ErrorInternalServerError(e)
        })?;

    // Convert timestamps to block numbers
    log::info!("Converting timestamps to block numbers...");
    let from_block = client.timestamp_to_block(start_timestamp).await
        .map_err(|e| {
            log::error!("Failed to get from_block: {}", e);
            actix_web::error::ErrorInternalServerError(e)
        })?;

    let to_block = client.timestamp_to_block(end_timestamp).await
        .map_err(|e| {
            log::error!("Failed to get to_block: {}", e);
            actix_web::error::ErrorInternalServerError(e)
        })?;

    log::info!("Block range: {} to {}", from_block, to_block);

    // Fetch transfer events
    let events = client.fetch_transfer_events(from_block, to_block).await
        .map_err(|e| {
            log::error!("Failed to fetch events: {}", e);
            actix_web::error::ErrorInternalServerError(e)
        })?;

    log::info!("Fetched {} transfer events", events.len());

    // Process and aggregate the data
    let stats = process_transfer_events(events);

    log::info!("Processed stats successfully");

    // Return JSON response
    Ok(HttpResponse::Ok().json(stats))
}

/// Health check endpoint
pub async fn health_check() -> HttpResponse {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "healthy",
        "service": "USDT Transfer Analytics API"
    }))
}