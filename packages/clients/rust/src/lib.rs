//! # UCP Rust Client
//!
//! A Rust client library for the Unified Context Protocol (UCP).
//! 
//! UCP provides persistent memory and context management for AI agents,
//! enabling cross-session memory retention and vector similarity search.
//!
//! ## Features
//! 
//! - **Memory Operations**: Store and retrieve agent memory
//! - **Vector Search**: Semantic search using embeddings
//! - **Health Monitoring**: Check UCP server status
//! - **Async Support**: Full async/await support
//! - **Error Handling**: Comprehensive error types
//!
//! ## Example
//!
//! ```rust
//! use ucp_client::{UcpClient, UcpConfig, MemoryRequest};
//! 
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     let config = UcpConfig::new("http://localhost:3000".to_string());
//!     let client = UcpClient::new(config)?;
//!     
//!     // Store memory
//!     let request = MemoryRequest {
//!         content: "Hello, world!".to_string(),
//!         metadata: None,
//!     };
//!     
//!     let response = client.store_memory(request).await?;
//!     println!("Stored memory with ID: {}", response.id);
//!     
//!     Ok(())
//! }
//! ```

pub mod client;
pub mod types;

pub use client::UcpClient;
pub use types::{UcpConfig, MemoryRequest, MemoryResponse, VectorQuery, UcpError, Result};