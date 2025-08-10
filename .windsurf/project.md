# UCP Project Information

## Project Name
Unified Context Protocol (UCP)

## Description
A minimal TypeScript library containing core types and protocols for a Model Context Protocol (MCP) compatible memory fabric for AI coding assistants.

## Current Status
**Clean, functional TypeScript library** - All planning documentation and non-functional examples have been removed, leaving only the essential UCP functionality.

## Repository Structure
```
├── packages/core/               # Main UCP TypeScript library
│   ├── src/
│   │   ├── types/              # Memory entry types and Zod schemas
│   │   ├── protocol/           # Protocol interfaces (UCP, MCP, Git, Vector)
│   │   ├── validation/         # Runtime validation classes
│   │   └── index.ts           # Main exports and configuration
│   ├── package.json
│   ├── tsconfig.json
│   └── tsup.config.ts
├── .claude/                    # Claude AI configuration
├── package.json                # Root workspace configuration
├── pnpm-workspace.yaml        # PNPM workspace definition
├── tsconfig.json              # Root TypeScript configuration
├── turbo.json                 # Turborepo build orchestration
├── CLAUDE.md                  # Detailed guidance for Claude
└── LICENSE                    # MIT license
```

## Technology Stack
- **Language**: TypeScript (ES2022)
- **Build System**: Turborepo + PNPM workspaces
- **Validation**: Zod for runtime schema validation
- **Package Manager**: PNPM 8.x
- **Node Version**: 20+

## Key Components
- **Memory Entry Types**: TaskState, CommitDelta, ReasoningEntry, SummaryCheckpoint, BranchMeta
- **Protocol Interfaces**: UCPProtocol, MCPIntegration, GitIntegration, VectorDatabase
- **Validation Classes**: Comprehensive runtime validation for all UCP entities

## Development Commands
- `pnpm install` - Install dependencies
- `pnpm build` - Build the library
- `pnpm dev` - Development/watch mode
- `pnpm typecheck` - Type checking
- `pnpm lint` - Lint code
- `pnpm format` - Format code

## Purpose
This library provides the foundational types and interfaces needed to build UCP-compatible memory systems for AI coding assistants, without any implementation-specific code.