use actix_web::{web, App, HttpServer, middleware};
use actix_cors::Cors;
use dotenv::dotenv;
use std::env;

mod blockchain;
mod aggregation;
mod api;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load environment variables from .env file
    dotenv().ok();
    
    // Initialize logger
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    // Get server configuration
    let host = env::var("SERVER_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = env::var("SERVER_PORT").unwrap_or_else(|_| "8080".to_string());
    let bind_address = format!("{}:{}", host, port);

    log::info!("🚀 Starting USDT Transfer Analytics API");
    log::info!("📡 Server listening on http://{}", bind_address);
    log::info!("📊 Endpoints:");
    log::info!("   - GET /health");
    log::info!("   - GET /api/transfers?chain=ethereum");
    log::info!("   - GET /api/transfers?chain=bsc");

    // Start HTTP server
    HttpServer::new(|| {
        // Configure CORS to allow frontend to make requests
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            // Enable CORS
            .wrap(cors)
            // Enable request logging
            .wrap(middleware::Logger::default())
            // Health check endpoint
            .route("/health", web::get().to(api::health_check))
            // Main API endpoint
            .route("/api/transfers", web::get().to(api::get_transfers))
    })
    .bind(&bind_address)?
    .run()
    .await
}