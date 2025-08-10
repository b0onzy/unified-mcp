# UCP Context Information

## What This Repository Contains

This is a **clean, minimal TypeScript library** for the Unified Context Protocol (UCP). It has been stripped down to contain only the essential functionality.

### What Exists (Core Functionality)
- **`packages/core/src/types/index.ts`** - Complete TypeScript types with Zod schemas for all UCP memory entry types
- **`packages/core/src/protocol/index.ts`** - Protocol interfaces for UCP, MCP integration, Git hooks, vector databases, and caching
- **`packages/core/src/validation/index.ts`** - Runtime validation classes for all UCP entities
- **`packages/core/src/index.ts`** - Main library exports with default configuration

### What Was Removed (Cleanup History)
- All planning documentation (`docs/`, `README.md`, `PROGRESS.md`, etc.)
- Non-functional examples and demos (`examples/` directory)
- Empty package directories (`packages/server/`, `packages/clients/`)
- Infrastructure configurations (`infrastructure/` with Docker configs)
- Unused build dependencies and scripts

## Core UCP Concepts

### Memory Entry Types
1. **TaskState** - Current work context, goals, progress, active files
2. **CommitDelta** - Git commit changes with semantic analysis
3. **ReasoningEntry** - AI conversations and decision rationale  
4. **SummaryCheckpoint** - Compressed historical context
5. **BranchMeta** - Branch-specific context and relationships

### Protocol Interfaces
- **UCPProtocol** - Core memory operations (CRUD + search)
- **MCPIntegration** - Model Context Protocol compatibility
- **GitIntegration** - Git hooks and version control
- **VectorDatabase** - Semantic similarity search
- **EmbeddingGenerator** - Text-to-vector conversion
- **CacheInterface** - Performance optimization

### Validation System
- Type-specific validation for each memory entry type
- Project and branch name validation
- Content size limits and embedding validation
- Combined validation through `UCPValidator`

## Development Context

### Build System
- **Turborepo** for build orchestration
- **PNPM workspaces** for dependency management
- **TypeScript project references** for incremental compilation
- **Zod** for runtime schema validation

### Code Quality
- Strict TypeScript configuration
- ESLint + Prettier for code formatting
- Comprehensive type safety with Zod schemas

### Current State
This is a **library/SDK project** - it provides types and interfaces but no implementations. To build a complete UCP system, you would need to implement:
1. A server using these types
2. MCP integration using the interfaces
3. Database storage (PostgreSQL + pgvector recommended)
4. Client SDKs in various languages

The library is production-ready and can be used as a foundation for any UCP implementation.