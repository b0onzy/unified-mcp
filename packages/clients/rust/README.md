# Unified-MCP Rust Client

A Rust client library for the Unified-Memory Context Protocol (Unified-MCP).

## Overview

Unified-MCP provides persistent memory and context management for AI agents, enabling cross-session memory retention and vector similarity search. This Rust client allows you to easily integrate Unified-MCP functionality into your Rust applications.

## Features

- **Async/Await Support**: Full async support with tokio
- **Memory Operations**: Store and retrieve agent memories
- **Vector Search**: Semantic search using embeddings
- **Health Monitoring**: Check UCP server status
- **Error Handling**: Comprehensive error types and handling
- **Streaming Support**: Streaming responses for large datasets

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
unified-mcp-client = "0.1.0"
```

## Usage

### Basic Example

```rust
use ucp_client::{UcpClient, UcpConfig, MemoryRequest};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create client configuration
    let config = UcpConfig {
        base_url: "http://localhost:3000".to_string(),
        api_key: None,
        timeout_secs: 30,
    };
    
    // Create client
    let client = UcpClient::new(config)?;
    
    // Store memory
    let request = MemoryRequest {
        content: "This is important information".to_string(),
        metadata: Some(serde_json::json!({
            "source": "user_input",
            "timestamp": "2024-01-01T00:00:00Z"
        })),
    };
    
    let response = client.store_memory(request).await?;
    println!("Stored memory with ID: {}", response.id);
    
    // Search memories
    let query = VectorQuery {
        query: "important information".to_string(),
        limit: Some(10),
        threshold: Some(0.7),
    };
    
    let results = client.search_memories(query).await?;
    for result in results {
        println!("Found: {} (score: {:.2})", result.content, result.score);
    }
    
    Ok(())
}
```

### Configuration

The client can be configured with:

- `base_url`: The UCP server URL
- `api_key`: Optional API key for authentication
- `timeout_secs`: Request timeout in seconds (default: 30)

### Error Handling

The client provides comprehensive error types:

```rust
use ucp_client::{UcpClient, UcpError};

match client.store_memory(request).await {
    Ok(response) => println!("Success: {}", response.id),
    Err(UcpError::NetworkError(e)) => eprintln!("Network error: {}", e),
    Err(UcpError::ServerError(code, msg)) => eprintln!("Server error {}: {}", code, msg),
    Err(UcpError::ValidationError(msg)) => eprintln!("Validation error: {}", msg),
    Err(e) => eprintln!("Other error: {}", e),
}
```

## Development

### Running Tests

```bash
cargo test
```

### Building

```bash
cargo build --release
```

## License

MIT License - see LICENSE file for details.