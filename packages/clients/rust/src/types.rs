//! UCP Type Definitions
//!
//! Common types used by the UCP client and server communication.

use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Configuration for UCP client
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UcpConfig {
    /// Base URL of the UCP server
    pub base_url: String,
    /// API key for authentication (optional)
    pub api_key: Option<String>,
    /// Timeout for requests in seconds
    pub timeout_secs: u64,
    /// Maximum retry attempts
    pub max_retries: u32,
}

impl Default for UcpConfig {
    fn default() -> Self {
        Self {
            base_url: "http://localhost:3001".to_string(),
            api_key: None,
            timeout_secs: 30,
            max_retries: 3,
        }
    }
}

/// Request for storing or retrieving memory
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryRequest {
    /// Project identifier for memory isolation
    pub project: String,
    /// Session identifier for memory grouping
    pub session: String,
    /// Memory content to store
    pub content: String,
    /// Metadata associated with the memory
    pub metadata: HashMap<String, serde_json::Value>,
    /// Tags for categorization
    pub tags: Vec<String>,
}

/// Response from memory operations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryResponse {
    /// Unique identifier for the memory entry
    pub id: String,
    /// Memory content
    pub content: String,
    /// Similarity score (for search results)
    pub score: Option<f64>,
    /// Metadata associated with the memory
    pub metadata: HashMap<String, serde_json::Value>,
    /// Tags for categorization
    pub tags: Vec<String>,
    /// Timestamp of creation/retrieval
    pub timestamp: u64,
}

/// Vector similarity search query
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VectorQuery {
    /// Project identifier for memory isolation
    pub project: String,
    /// Session identifier (optional for cross-session search)
    pub session: Option<String>,
    /// Query text for similarity search
    pub query: String,
    /// Number of results to return
    pub limit: u32,
    /// Minimum similarity threshold (0.0 to 1.0)
    pub threshold: f64,
    /// Tags to filter by (optional)
    pub tags: Option<Vec<String>>,
}

/// Error types for UCP operations
#[derive(Debug, thiserror::Error)]
pub enum UcpError {
    /// HTTP request failed
    #[error("HTTP request failed: {0}")]
    HttpError(#[from] reqwest::Error),
    
    /// JSON serialization/deserialization failed
    #[error("JSON error: {0}")]
    JsonError(#[from] serde_json::Error),
    
    /// UCP server returned an error
    #[error("UCP server error: {message}")]
    ServerError { message: String },
    
    /// Authentication failed
    #[error("Authentication failed")]
    AuthenticationError,
    
    /// Rate limit exceeded
    #[error("Rate limit exceeded")]
    RateLimitError,
    
    /// Invalid configuration
    #[error("Invalid configuration: {0}")]
    ConfigError(String),
}

/// Result type for UCP operations
pub type Result<T> = std::result::Result<T, UcpError>;