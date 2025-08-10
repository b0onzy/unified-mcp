//! UCP HTTP Client Implementation
//!
//! Provides async HTTP client for communicating with the UCP server,
//! including streaming support and proper error handling.

use super::types::{UcpConfig, MemoryRequest, MemoryResponse, VectorQuery, UcpError, Result};
use reqwest::{Client, Response};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::time::Duration;
use tokio_stream::{Stream, StreamExt};

/// UCP HTTP Client
#[derive(Debug, Clone)]
pub struct UcpClient {
    /// HTTP client
    client: Client,
    /// Client configuration
    config: UcpConfig,
}

impl UcpClient {
    /// Create a new UCP client with the given configuration
    pub fn new(config: UcpConfig) -> Result<Self> {
        let client_builder = Client::builder()
            .timeout(Duration::from_secs(config.timeout_secs))
            .user_agent("RAFT/0.1.0");

        // Add default headers
        let mut default_headers = reqwest::header::HeaderMap::new();
        default_headers.insert(
            reqwest::header::CONTENT_TYPE,
            reqwest::header::HeaderValue::from_static("application/json"),
        );

        if let Some(ref api_key) = config.api_key {
            default_headers.insert(
                reqwest::header::AUTHORIZATION,
                reqwest::header::HeaderValue::from_str(&format!("Bearer {}", api_key))
                    .map_err(|_| UcpError::ConfigError("Invalid API key format".to_string()))?,
            );
        }

        let client = client_builder
            .default_headers(default_headers)
            .build()
            .map_err(UcpError::HttpError)?;

        Ok(Self { client, config })
    }

    /// Store memory content in UCP
    pub async fn store_memory(&self, request: MemoryRequest) -> Result<MemoryResponse> {
        let url = format!("{}/api/v1/memory", self.config.base_url);
        
        let response = self
            .client
            .post(&url)
            .json(&request)
            .send()
            .await?;

        self.handle_response(response).await
    }

    /// Retrieve memory by ID
    pub async fn get_memory(&self, project: &str, memory_id: &str) -> Result<MemoryResponse> {
        let url = format!(
            "{}/api/v1/memory/{}/{}",
            self.config.base_url, project, memory_id
        );

        let response = self.client.get(&url).send().await?;
        self.handle_response(response).await
    }

    /// Search memories using vector similarity
    pub async fn search_memories(&self, query: VectorQuery) -> Result<Vec<MemoryResponse>> {
        let url = format!("{}/api/v1/search", self.config.base_url);

        let response = self
            .client
            .post(&url)
            .json(&query)
            .send()
            .await?;

        let search_response: SearchResponse = self.handle_response(response).await?;
        Ok(search_response.results)
    }

    /// Stream search results for large result sets
    pub async fn search_memories_stream(
        &self,
        query: VectorQuery,
    ) -> Result<impl Stream<Item = Result<MemoryResponse>>> {
        let url = format!("{}/api/v1/search/stream", self.config.base_url);

        let response = self
            .client
            .post(&url)
            .json(&query)
            .header("Accept", "application/x-ndjson")
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(self.handle_error_response(response).await);
        }

        // Create a simple line-based stream parser
        let stream = async_stream::stream! {
            let mut buffer = Vec::new();
            let mut bytes_stream = response.bytes_stream();
            
            while let Some(chunk_result) = bytes_stream.next().await {
                match chunk_result {
                    Ok(chunk) => {
                        buffer.extend_from_slice(&chunk);
                        
                        // Process complete lines
                        while let Some(newline_pos) = buffer.iter().position(|&b| b == b'\n') {
                            let line = buffer.drain(..=newline_pos).collect::<Vec<_>>();
                            let line_str = match std::str::from_utf8(&line[..line.len().saturating_sub(1)]) {
                                Ok(s) => s,
                                Err(_) => {
                                    yield Err(UcpError::ServerError {
                                        message: "Invalid UTF-8 in response".to_string(),
                                    });
                                    continue;
                                }
                            };

                            if !line_str.trim().is_empty() {
                                match serde_json::from_str::<MemoryResponse>(line_str) {
                                    Ok(memory_response) => yield Ok(memory_response),
                                    Err(e) => yield Err(UcpError::JsonError(e)),
                                }
                            }
                        }
                    }
                    Err(e) => {
                        yield Err(UcpError::HttpError(e));
                        break;
                    }
                }
            }
        };

        Ok(stream)
    }

    /// Delete memory by ID
    pub async fn delete_memory(&self, project: &str, memory_id: &str) -> Result<()> {
        let url = format!(
            "{}/api/v1/memory/{}/{}",
            self.config.base_url, project, memory_id
        );

        let response = self.client.delete(&url).send().await?;

        if response.status().is_success() {
            Ok(())
        } else {
            Err(self.handle_error_response(response).await)
        }
    }

    /// List all projects available
    pub async fn list_projects(&self) -> Result<Vec<String>> {
        let url = format!("{}/api/v1/projects", self.config.base_url);

        let response = self.client.get(&url).send().await?;
        let projects_response: ProjectsResponse = self.handle_response(response).await?;
        Ok(projects_response.projects)
    }

    /// Get statistics for a project
    pub async fn get_stats(&self, project: &str) -> Result<ProjectStats> {
        let url = format!("{}/api/v1/stats/{}", self.config.base_url, project);

        let response = self.client.get(&url).send().await?;
        self.handle_response(response).await
    }

    /// Health check endpoint
    pub async fn health_check(&self) -> Result<HealthStatus> {
        let url = format!("{}/api/v1/health", self.config.base_url);

        let response = self.client.get(&url).send().await?;
        self.handle_response(response).await
    }

    /// Generic response handler
    async fn handle_response<T>(&self, response: Response) -> Result<T>
    where
        T: for<'de> Deserialize<'de>,
    {
        let status = response.status();
        
        if status.is_success() {
            let data = response.json::<T>().await?;
            Ok(data)
        } else {
            Err(self.handle_error_response(response).await)
        }
    }

    /// Handle error responses
    async fn handle_error_response(&self, response: Response) -> UcpError {
        let status = response.status();
        
        match status.as_u16() {
            401 => UcpError::AuthenticationError,
            429 => UcpError::RateLimitError,
            _ => {
                let error_text = response
                    .text()
                    .await
                    .unwrap_or_else(|_| format!("HTTP {} error", status));
                
                // Try to parse as structured error
                if let Ok(error_response) = serde_json::from_str::<ErrorResponse>(&error_text) {
                    UcpError::ServerError {
                        message: error_response.message,
                    }
                } else {
                    UcpError::ServerError {
                        message: error_text,
                    }
                }
            }
        }
    }
}

/// Response for search operations
#[derive(Debug, Serialize, Deserialize)]
struct SearchResponse {
    results: Vec<MemoryResponse>,
    total: u64,
    took: u64, // Time taken in milliseconds
}

/// Response for projects list
#[derive(Debug, Serialize, Deserialize)]
struct ProjectsResponse {
    projects: Vec<String>,
}

/// Project statistics
#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectStats {
    pub project: String,
    pub total_memories: u64,
    pub total_sessions: u64,
    pub total_size_bytes: u64,
    pub created_at: u64,
    pub last_updated: u64,
}

/// Health status response
#[derive(Debug, Serialize, Deserialize)]
pub struct HealthStatus {
    pub status: String,
    pub version: String,
    pub uptime: u64,
    pub memory_usage: HashMap<String, u64>,
}

/// Error response from UCP server
#[derive(Debug, Serialize, Deserialize)]
struct ErrorResponse {
    message: String,
    code: Option<String>,
    details: Option<HashMap<String, serde_json::Value>>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use mockito::{Mock, Server};
    use serde_json::json;

    #[tokio::test]
    async fn test_store_memory() {
        let mut server = Server::new_async().await;
        
        let mock_response = json!({
            "id": "mem_123",
            "content": "Test memory content",
            "score": null,
            "metadata": {},
            "tags": ["test"],
            "timestamp": 1234567890
        });

        let _m = server.mock("POST", "/api/v1/memory")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(mock_response.to_string())
            .create_async()
            .await;

        let config = UcpConfig {
            base_url: server.url(),
            ..Default::default()
        };

        let client = UcpClient::new(config).unwrap();
        
        let request = MemoryRequest {
            project: "test_project".to_string(),
            session: "test_session".to_string(),
            content: "Test memory content".to_string(),
            metadata: HashMap::new(),
            tags: vec!["test".to_string()],
        };

        let response = client.store_memory(request).await.unwrap();
        assert_eq!(response.id, "mem_123");
        assert_eq!(response.content, "Test memory content");
    }

    #[tokio::test]
    async fn test_search_memories() {
        let mut server = Server::new_async().await;
        
        let mock_response = json!({
            "results": [
                {
                    "id": "mem_123",
                    "content": "Test memory content",
                    "score": 0.95,
                    "metadata": {},
                    "tags": ["test"],
                    "timestamp": 1234567890
                }
            ],
            "total": 1,
            "took": 15
        });

        let _m = server.mock("POST", "/api/v1/search")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(mock_response.to_string())
            .create_async()
            .await;

        let config = UcpConfig {
            base_url: server.url(),
            ..Default::default()
        };

        let client = UcpClient::new(config).unwrap();
        
        let query = VectorQuery {
            project: "test_project".to_string(),
            session: Some("test_session".to_string()),
            query: "test query".to_string(),
            limit: 10,
            threshold: 0.7,
            tags: None,
        };

        let results = client.search_memories(query).await.unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].id, "mem_123");
        assert_eq!(results[0].score, Some(0.95));
    }

    #[tokio::test]
    async fn test_health_check() {
        let mut server = Server::new_async().await;
        
        let mock_response = json!({
            "status": "healthy",
            "version": "1.0.0",
            "uptime": 3600,
            "memory_usage": {
                "heap": 1024000,
                "rss": 2048000
            }
        });

        let _m = server.mock("GET", "/api/v1/health")
            .with_status(200)
            .with_header("content-type", "application/json")
            .with_body(mock_response.to_string())
            .create_async()
            .await;

        let config = UcpConfig {
            base_url: server.url(),
            ..Default::default()
        };

        let client = UcpClient::new(config).unwrap();
        let health = client.health_check().await.unwrap();
        
        assert_eq!(health.status, "healthy");
        assert_eq!(health.version, "1.0.0");
        assert_eq!(health.uptime, 3600);
    }
}