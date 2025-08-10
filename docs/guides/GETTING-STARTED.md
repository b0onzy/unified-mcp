# Getting Started with Unified-MCP Development

**Version:** 1.0.0  
**Last Updated:** 2025-01-27  
**Phase:** 1 - Research & Setup

## Quick Start

Unified-MCP is currently in **Phase 1: Knowledge Foundation**. This guide will help you set up the development environment and understand the project structure.

## Prerequisites

### Required Software

```bash
# Node.js 20+ (LTS recommended)
node --version  # Should be v20.0.0 or higher

# PNPM 8+ (package manager)
pnpm --version  # Should be 8.0.0 or higher

# Docker & Docker Compose (for local services)
docker --version
docker-compose --version

# Git (version control)
git --version
```

### Installation Commands

```bash
# Install Node.js via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Install PNPM
npm install -g pnpm@8

# Install Docker (platform-specific)
# macOS: brew install docker
# Linux: Follow Docker's official installation guide
# Windows: Download Docker Desktop
```

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/unified-context-protocol.git
cd unified-context-protocol
```

### 2. Install Dependencies

```bash
# Install all package dependencies
pnpm install

# Verify installation
pnpm turbo build --dry-run
```

### 3. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Edit configuration
vim .env.local
```

**Environment Variables:**
```env
# .env.local
NODE_ENV=development
LOG_LEVEL=debug

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/ucp_dev
REDIS_URL=redis://localhost:6379

# AI Model Configuration (for testing)
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...

# Server Configuration
PORT=3000
HOST=0.0.0.0

# Security
JWT_SECRET=your-jwt-secret-here
```

### 4. Start Development Services

```bash
# Start PostgreSQL, Redis, and other services
pnpm docker:up

# Wait for services to be ready (about 30 seconds)
pnpm docker:logs

# Verify services are running
pnpm docker:status
```

### 5. Run Development Server

```bash
# Start all packages in development mode
pnpm dev

# Or start specific packages
pnpm turbo dev --filter=@ucp/server
pnpm turbo dev --filter=@ucp/core
```

## Project Structure Overview

### Monorepo Organization

```bash
unified-context-protocol/
├── packages/                    # All UCP packages
│   ├── core/                   # Protocol types & validation
│   ├── server/                 # Memory server implementation  
│   ├── clients/typescript/     # TypeScript SDK
│   ├── integrations/cli/       # Command-line interface
│   └── shared/                 # Common utilities
├── tools/                      # Development tools
├── docs/                       # Documentation
├── examples/                   # Usage examples
└── infrastructure/             # Docker, K8s, Terraform
```

### Key Files

```bash
# Root configuration
package.json              # Workspace configuration
pnpm-workspace.yaml      # Package definitions
turbo.json               # Build orchestration
tsconfig.json            # TypeScript configuration

# Development
.env.local               # Local environment
docker-compose.yml       # Local services
.github/workflows/       # CI/CD automation
```

## Development Workflow

### 1. Daily Development

```bash
# Start your development session
pnpm docker:up           # Start backing services
pnpm dev                 # Start development servers

# Make changes to code...

# Run tests
pnpm test                # Run all tests
pnpm test:unit           # Run unit tests only
pnpm test:integration    # Run integration tests

# Check code quality
pnpm lint                # Check linting
pnpm typecheck           # Check types
pnpm format              # Format code
```

### 2. Working with Packages

```bash
# Add dependencies to a specific package
cd packages/core
pnpm add zod

# Add dev dependencies
pnpm add -D vitest

# Build specific package
pnpm turbo build --filter=@ucp/core

# Test specific package
pnpm turbo test --filter=@ucp/server
```

### 3. Database Operations

```bash
# View database logs
docker-compose logs postgres

# Connect to database
docker-compose exec postgres psql -U postgres -d ucp_dev

# Reset database
pnpm docker:down
pnpm docker:up
```

### 4. Creating New Packages

```bash
# Create new package directory
mkdir packages/integrations/new-package

# Initialize package.json
cd packages/integrations/new-package
pnpm init

# Add to workspace
# Edit pnpm-workspace.yaml to include new package
```

## Current Phase: Research & Development

### Phase 1 Goals (Weeks 1-6)

**Research Areas:**
- [x] Technology stack analysis
- [x] Project structure design
- [ ] Memory system architecture
- [ ] MCP integration patterns
- [ ] Vector database optimization

**Development Setup:**
- [x] Monorepo configuration
- [x] Build system (Turborepo)
- [x] Core package structure
- [ ] Basic server implementation
- [ ] CLI tool foundation

### Available Commands

```bash
# Build & Development
pnpm build               # Build all packages
pnpm dev                 # Start development mode
pnpm clean               # Clean build artifacts

# Testing
pnpm test                # Run all tests
pnpm test:unit           # Unit tests only
pnpm test:integration    # Integration tests
pnpm test:e2e            # End-to-end tests

# Code Quality
pnpm lint                # Check code style
pnpm lint:fix            # Fix code style issues
pnpm typecheck           # TypeScript type checking
pnpm format              # Format code with Prettier

# Services
pnpm docker:up           # Start development services
pnpm docker:down         # Stop development services
pnpm docker:logs         # View service logs

# Documentation
pnpm generate:docs       # Generate API documentation
pnpm generate:api        # Generate OpenAPI specs
```

## Understanding the Codebase

### Core Package (`packages/core/`)

**Purpose:** Protocol specification, types, and validation
```typescript
// Import core types
import { MemoryEntry, TaskState } from '@ucp/core';

// Use validation
import { UCPValidator } from '@ucp/core/validation';
const result = UCPValidator.validateMemoryEntry(entry);
```

### Server Package (`packages/server/`)

**Purpose:** REST API and MCP server implementation
```typescript
// Currently in development - basic structure:
src/
├── api/           # REST endpoints
├── mcp/           # MCP server implementation
├── storage/       # Database adapters
└── index.ts       # Server entry point
```

### TypeScript Client (`packages/clients/typescript/`)

**Purpose:** SDK for Node.js and browser applications
```typescript
// Future usage (Phase 3):
import { UCPClient } from '@ucp/client-ts';

const client = new UCPClient({
  baseUrl: 'http://localhost:3000',
  apiKey: 'your-api-key'
});

const entries = await client.memory.search('function implementation');
```

## Contributing Guidelines

### Code Style

**TypeScript Standards:**
- Use strict TypeScript configuration
- Prefer type-only imports: `import type { Type } from 'module'`
- Use Zod for runtime validation
- Follow existing naming conventions

**Git Workflow:**
```bash
# Create feature branch
git checkout -b feature/memory-storage

# Make commits with conventional format
git commit -m "feat(core): add memory entry validation"

# Push and create PR
git push origin feature/memory-storage
```

### Testing Requirements

**Unit Tests:**
```typescript
// packages/core/src/__tests__/validation.test.ts
import { describe, it, expect } from 'vitest';
import { UCPValidator } from '../validation';

describe('UCPValidator', () => {
  it('should validate memory entry', () => {
    const entry = { /* valid entry */ };
    const result = UCPValidator.validateMemoryEntry(entry);
    expect(result.success).toBe(true);
  });
});
```

**Integration Tests:**
```typescript
// packages/server/src/__tests__/api.integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startTestServer, stopTestServer } from '../test-utils';

describe('Memory API', () => {
  beforeAll(async () => {
    await startTestServer();
  });

  afterAll(async () => {
    await stopTestServer();
  });

  it('should store memory entry', async () => {
    // Test implementation
  });
});
```

## Troubleshooting

### Common Issues

**PNPM Installation Problems:**
```bash
# Clear PNPM cache
pnpm store prune

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

**Docker Service Issues:**
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs postgres
docker-compose logs redis

# Restart services
docker-compose restart
```

**Build Failures:**
```bash
# Clean and rebuild
pnpm clean
pnpm install
pnpm build

# Check for TypeScript errors
pnpm typecheck
```

**Database Connection Issues:**
```bash
# Verify PostgreSQL is running
docker-compose exec postgres pg_isready

# Check database exists
docker-compose exec postgres psql -U postgres -l

# Recreate database
docker-compose down -v
docker-compose up -d
```

### Getting Help

**Documentation:**
- [Technology Stack](../specs/TECHNOLOGY-STACK.md)
- [API Reference](../api/) (Generated)
- [Architecture Overview](../architecture/)

**Community:**
- GitHub Issues: Report bugs and request features
- GitHub Discussions: Ask questions and share ideas
- Discord: Real-time community chat (coming soon)

**Development Team:**
- Create detailed issue reports
- Include reproduction steps
- Provide system information
- Share relevant logs

## Next Steps

### Phase 1 Continuation

**Immediate Tasks:**
1. Complete core package implementation
2. Set up basic server structure
3. Implement memory entry storage
4. Create simple CLI interface

**Learning Resources:**
1. [Anthropic MCP Documentation](https://github.com/anthropic/model-context-protocol)
2. [pgvector Guide](https://github.com/pgvector/pgvector)
3. [Turborepo Documentation](https://turbo.build/repo/docs)
4. [Fastify Documentation](https://www.fastify.io/docs/)

### Moving to Phase 2

**Technical Architecture (Weeks 7-10):**
- Complete API specification design
- Implement core memory storage
- Add vector search capabilities
- Create MCP server implementation

**Phase Transition Criteria:**
- [ ] All core types and validation complete
- [ ] Basic server can store/retrieve memory entries
- [ ] CLI tool can interact with server
- [ ] Integration tests passing
- [ ] Documentation up to date

---

Welcome to the UCP development journey! This guide will evolve as we progress through the development phases. For the most current information, check the [project documentation](../README.md) and [progress tracking](../../PROGRESS.md).