# Unified-MCP Development Guide

This guide covers development setup and workflows for the Unified-MCP.

## Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 15+ with pgvector extension
- Docker and Docker Compose (optional, for easy database setup)
- Rust 1.75+ (for Rust client development)

## Getting Started

### 1. Clone and Setup

```bash
git clone https://github.com/yourusername/Unified-MCP.git
cd Unified-MCP

# Install dependencies
pnpm install
```

### 2. Database Setup

#### Option A: Docker (Recommended)
```bash
# Start PostgreSQL with pgvector
docker-compose -f infrastructure/docker-compose/docker-compose.yml up -d
```

#### Option B: Local PostgreSQL
```bash
# Install pgvector extension
# On Ubuntu/Debian:
sudo apt install postgresql-15-pgvector

# Create database
createdb ucp
psql ucp -c "CREATE EXTENSION vector;"
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit configuration as needed
vi .env
```

### 4. Build and Start

```bash
# Build all packages
pnpm build

# Start development server
pnpm dev

# Or start specific services
pnpm --filter @ucp/server dev
```

## Development Workflow

### Project Structure

```
packages/
├── core/               # Core types and utilities
│   ├── src/
│   │   ├── protocol/   # Protocol definitions
│   │   ├── types/      # TypeScript types
│   │   └── validation/ # Input validation
├── server/             # UCP server implementation
│   ├── src/
│   │   ├── api/        # REST API routes
│   │   ├── services/   # Business logic
│   │   ├── database/   # Database layer
│   │   └── mcp/        # MCP protocol handlers
├── clients/
│   ├── typescript/     # TypeScript/Node.js client
│   └── rust/           # Rust client
└── integrations/       # Third-party integrations
```

### Available Commands

```bash
# Development
pnpm dev                    # Start all services in dev mode
pnpm build                  # Build all packages
pnpm test                   # Run all tests
pnpm lint                   # Lint all packages
pnpm format                 # Format code

# Server specific
pnpm --filter @ucp/server build
pnpm --filter @ucp/server dev
pnpm --filter @ucp/server test

# Client specific
pnpm --filter @ucp/client-typescript build
pnpm --filter @ucp/client-typescript test

# Rust client
cd packages/clients/rust
cargo build
cargo test
```

### Testing

#### Unit Tests
```bash
# Run all unit tests
pnpm test:unit

# Run specific package tests
pnpm --filter @ucp/server test:unit
```

#### Integration Tests
```bash
# Start test database
docker-compose -f infrastructure/docker-compose/docker-compose.test.yml up -d

# Run integration tests
pnpm test:integration
```

#### End-to-End Tests
```bash
# Start full development environment
pnpm dev

# In another terminal, run e2e tests
pnpm test:e2e
```

## Client Development

### TypeScript Client

Located in `packages/clients/typescript/`:

```bash
cd packages/clients/typescript

# Install dependencies
pnpm install

# Build
pnpm build

# Test
pnpm test

# Usage example
node examples/basic-usage.js
```

### Rust Client

Located in `packages/clients/rust/`:

```bash
cd packages/clients/rust

# Build
cargo build

# Test
cargo test

# Usage example
cargo run --example basic_usage
```

## Server Development

### Adding New API Endpoints

1. Define route in `packages/server/src/api/`
2. Add corresponding service method in `packages/server/src/services/`
3. Update OpenAPI documentation
4. Add tests

Example:
```typescript
// packages/server/src/api/memories.ts
app.post('/api/v1/memories/bulk', async (request, reply) => {
  const { memories } = request.body as { memories: MemoryInput[] };
  
  const results = await Promise.all(
    memories.map(memory => database.storeMemory(memory))
  );
  
  return { success: true, data: results };
});
```

### Adding MCP Tools

1. Define tool in `packages/server/src/mcp/tools/`
2. Register tool in `packages/server/src/mcp/registry.ts`
3. Add tool tests

Example:
```typescript
// packages/server/src/mcp/tools/bulk-store.ts
export const bulkStoreMemoryTool = {
  name: 'bulk_store_memory',
  description: 'Store multiple memories at once',
  inputSchema: {
    type: 'object',
    properties: {
      memories: {
        type: 'array',
        items: { $ref: '#/definitions/Memory' }
      }
    }
  },
  handler: async (args: BulkStoreArgs) => {
    // Implementation
  }
};
```

## Database Development

### Migrations

```bash
# Create new migration
pnpm --filter @ucp/server migration:create add_new_feature

# Run migrations
pnpm --filter @ucp/server migration:run

# Rollback migration
pnpm --filter @ucp/server migration:rollback
```

### Schema Changes

1. Update database schema in `packages/server/src/database/schema/`
2. Create migration
3. Update TypeScript types
4. Update tests

## Vector Database Support

### Adding New Vector Providers

1. Implement provider interface in `packages/server/src/services/vector/providers/`
2. Register provider in `packages/server/src/services/vector/index.ts`
3. Add configuration options
4. Add tests

Example:
```typescript
// packages/server/src/services/vector/providers/new-provider.ts
export class NewVectorProvider implements VectorProvider {
  async initialize(): Promise<void> {
    // Initialize connection
  }

  async storeVector(id: string, embedding: number[]): Promise<void> {
    // Store vector
  }

  async searchSimilar(query: number[], limit: number): Promise<VectorSearchResult[]> {
    // Search implementation
  }
}
```

## Debugging

### Server Debugging
```bash
# Debug mode
DEBUG=true pnpm --filter @ucp/server dev

# With Node.js inspector
node --inspect dist/index.js
```

### Client Debugging
```bash
# TypeScript client with debug logs
DEBUG=ucp:* node examples/debug-example.js

# Rust client with debug logs
RUST_LOG=debug cargo run --example debug_example
```

## Performance Testing

### Load Testing
```bash
# Install k6
npm install -g k6

# Run load tests
k6 run tests/performance/load-test.js
```

### Benchmarking
```bash
# Memory operations benchmark
pnpm --filter @ucp/server benchmark

# Vector search benchmark
pnpm --filter @ucp/server benchmark:vector
```

## Contributing

### Code Style

- TypeScript: ESLint + Prettier
- Rust: rustfmt + clippy
- Commit messages: Conventional Commits

### Pull Request Process

1. Create feature branch from `main`
2. Make changes with tests
3. Run `pnpm lint` and `pnpm test`
4. Submit PR with description
5. Address review feedback
6. Merge after approval

### Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag
4. CI/CD publishes packages

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Check pgvector extension
psql -d ucp -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
```

#### Build Errors
```bash
# Clean build cache
pnpm clean
rm -rf node_modules/.cache

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

#### Test Failures
```bash
# Run specific test
pnpm --filter @ucp/server test -- --grep "memory storage"

# Debug test
pnpm --filter @ucp/server test -- --inspect-brk
```

### Getting Help

- Check [GitHub Issues](https://github.com/yourusername/Unified-Context-Protocol/issues)
- Join [Discord](https://discord.gg/your-invite)
- Read [Documentation](./docs/)