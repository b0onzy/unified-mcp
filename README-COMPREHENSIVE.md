# Unified-MCP - Complete Standalone Repository

> A standardized, model-agnostic memory fabric for AI coding assistants and agents

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Rust](https://img.shields.io/badge/Rust-1.75+-red.svg)](https://www.rust-lang.org/)

## Overview

Unified-MCP provides persistent memory and context management for AI agents, enabling:

- **Cross-session Memory**: Persistent storage and retrieval of agent interactions
- **Vector Similarity Search**: Semantic search using embeddings for contextual memory recall
- **Multiple Interfaces**: REST API and Model Context Protocol (MCP) support
- **Multi-language Clients**: TypeScript/Node.js and Rust client libraries
- **Vector Database Support**: pgvector, ChromaDB, and Qdrant integration

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   AI Clients    │    │   UCP Server    │    │  Vector Store   │
│                 │    │                 │    │                 │
│ • RAFT Agent    │◄──►│ • REST API      │◄──►│ • pgvector      │
│ • Claude Code   │    │ • MCP Protocol  │    │ • ChromaDB      │
│ • Custom Apps   │    │ • Memory Mgmt   │    │ • Qdrant        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Quick Start

### 1. Server Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/Unified-Context-Protocol.git
cd Unified-Context-Protocol

# Install dependencies
pnpm install

# Start database (PostgreSQL with pgvector)
docker-compose -f infrastructure/docker-compose/docker-compose.yml up -d

# Build and start the server
pnpm build
pnpm dev

# Or use the CLI
npx @ucp/server start --port 3000 --mcp-enabled
```

### 2. Client Usage

#### TypeScript/Node.js

```bash
npm install @ucp/client-typescript
```

```typescript
import { UCPClient } from '@ucp/client-typescript';

const client = new UCPClient({
  baseUrl: 'http://localhost:3000',
  apiKey: 'your-api-key' // optional
});

// Store memory
const memory = await client.storeMemory({
  content: 'User prefers TypeScript for new projects',
  metadata: { source: 'conversation', priority: 'high' }
});

// Search similar memories
const results = await client.searchMemories({
  query: 'TypeScript preferences',
  limit: 5,
  threshold: 0.7
});

console.log('Similar memories:', results);
```

#### Rust

```bash
cargo add ucp-client
```

```rust
use ucp_client::{UcpClient, UcpConfig, MemoryRequest};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let config = UcpConfig::new("http://localhost:3000".to_string());
    let client = UcpClient::new(config)?;
    
    // Store memory
    let request = MemoryRequest {
        content: "User prefers Rust for system programming".to_string(),
        metadata: Some(serde_json::json!({
            "source": "conversation",
            "priority": "high"
        })),
    };
    
    let response = client.store_memory(request).await?;
    println!("Stored memory: {}", response.id);
    
    Ok(())
}
```

## API Reference

### REST API

#### Store Memory
```http
POST /api/v1/memory
Content-Type: application/json

{
  "content": "Important information to remember",
  "metadata": {
    "source": "conversation",
    "priority": "high",
    "tags": ["preference", "user-input"]
  }
}
```

#### Search Memories
```http
POST /api/v1/search
Content-Type: application/json

{
  "query": "user preferences for programming languages",
  "limit": 10,
  "threshold": 0.7
}
```

#### Get Memory
```http
GET /api/v1/memory/{id}
```

#### List Memories
```http
GET /api/v1/memories?offset=0&limit=10
```

#### Delete Memory
```http
DELETE /api/v1/memory/{id}
```

### MCP Protocol

UCP supports the Model Context Protocol for seamless integration with AI clients:

```json
{
  "method": "tools/call",
  "params": {
    "name": "ucp_store_memory",
    "arguments": {
      "content": "User wants to use React for the frontend",
      "metadata": {
        "context": "project_planning"
      }
    }
  }
}
```

## Configuration

### Environment Variables

```bash
# Server Configuration
UCP_PORT=3000
UCP_HOST=0.0.0.0

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ucp
DB_USER=ucp
DB_PASSWORD=ucp

# Vector Database
VECTOR_PROVIDER=pgvector  # or chromadb, qdrant
VECTOR_DIMENSIONS=384
SIMILARITY_THRESHOLD=0.7

# MCP Configuration
MCP_ENABLED=true
MCP_TRANSPORT=stdio  # or websocket
MCP_PORT=3001  # for websocket transport
```

### Docker Setup

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_DB: ucp
      POSTGRES_USER: ucp
      POSTGRES_PASSWORD: ucp
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  ucp-server:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=postgres
    depends_on:
      - postgres

volumes:
  postgres_data:
```

## Development

### Project Structure

```
Unified-Context-Protocol/
├── packages/
│   ├── core/                 # Core protocol types and utilities
│   ├── server/               # UCP server implementation
│   ├── clients/
│   │   ├── typescript/       # TypeScript/Node.js client
│   │   └── rust/             # Rust client
│   └── integrations/         # Third-party integrations
├── examples/                 # Usage examples
├── docs/                     # Documentation
└── infrastructure/           # Docker, K8s, etc.
```

### Development Setup

```bash
# Clone and install
git clone https://github.com/yourusername/Unified-Context-Protocol.git
cd Unified-Context-Protocol
pnpm install

# Start development environment
pnpm dev

# Run tests
pnpm test

# Build all packages
pnpm build
```

### Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Integration Examples

### RAFT Agent Framework

```rust
// In RAFT agent
use ucp_client::{UcpClient, MemoryRequest};

impl Agent for MyAgent {
    async fn process(&self, input: AgentInput, context: AgentContext) -> Result<AgentOutput> {
        // Store interaction for future reference
        let memory = MemoryRequest {
            content: format!("Agent {} processed: {}", self.name(), input.text),
            metadata: Some(serde_json::json!({
                "agent": self.name(),
                "timestamp": chrono::Utc::now(),
                "context_id": context.session_id
            })),
        };
        
        self.ucp_client.store_memory(memory).await?;
        
        // Search for relevant past interactions
        let similar = self.ucp_client.search_memories(VectorQuery {
            query: input.text.clone(),
            limit: Some(5),
            threshold: Some(0.8),
        }).await?;
        
        // Use similar memories to inform response
        let response = self.generate_response(&input, &similar).await?;
        
        Ok(AgentOutput::text(response))
    }
}
```

### Claude Code Integration

```typescript
// MCP tool for Claude Code
import { MCPServer } from '@ucp/mcp';

const server = new MCPServer({
  name: 'ucp-memory',
  version: '1.0.0',
  tools: [
    {
      name: 'store_memory',
      description: 'Store information for future reference',
      inputSchema: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          metadata: { type: 'object' }
        }
      }
    },
    {
      name: 'search_memory',
      description: 'Search stored memories',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          limit: { type: 'number' }
        }
      }
    }
  ]
});
```

## Roadmap

- [x] **v0.1.0**: Core REST API and basic memory operations
- [x] **v0.1.1**: MCP protocol support
- [x] **v0.1.2**: Multi-language client libraries
- [ ] **v0.2.0**: Advanced vector search and filtering
- [ ] **v0.3.0**: Memory tagging and organization
- [ ] **v0.4.0**: Multi-tenant support
- [ ] **v0.5.0**: Real-time memory synchronization
- [ ] **v1.0.0**: Production-ready with full features

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📚 [Documentation](./docs/)
- 💬 [GitHub Discussions](https://github.com/yourusername/Unified-Context-Protocol/discussions)
- 🐛 [Issue Tracker](https://github.com/yourusername/Unified-Context-Protocol/issues)
- 📧 Email: support@ucp.dev

---

Built with ❤️ by the UCP Community