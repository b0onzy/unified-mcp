# Claude Coding Rules for UCP

## Code Standards

### TypeScript Guidelines
- Use strict TypeScript configuration with all safety checks enabled
- Export types using `type` keyword for type-only exports
- Use Zod schemas for runtime validation alongside TypeScript types
- Prefer explicit return types for public functions
- Use ES2022 features and ESNext module resolution

### File Organization
- Keep types in `src/types/index.ts`
- Keep protocol interfaces in `src/protocol/index.ts`  
- Keep validation logic in `src/validation/index.ts`
- Export everything through `src/index.ts`
- Use `.js` extensions in import statements for ESM compatibility

### Naming Conventions
- Use PascalCase for types, interfaces, classes, and enums
- Use camelCase for functions, variables, and properties
- Use UPPER_SNAKE_CASE for constants and enum values
- Prefix interfaces with descriptive names (avoid generic `I` prefix)

### Validation Patterns
- Every public type must have a corresponding Zod schema
- Validation classes should follow the pattern: `EntityValidator.validate()`
- Always return `ValidationResult<T>` from validation methods
- Include helpful error messages with field paths

## Architecture Principles

### Protocol Design
- Define interfaces before implementations
- Use generic types where appropriate for flexibility
- Keep protocol interfaces pure (no implementation details)
- Design for extensibility without breaking changes

### Memory Entry Design
- All memory entries extend the base `MemoryEntry` type
- Use discriminated unions with the `type` field
- Include comprehensive metadata fields
- Support optional embedding vectors for semantic search

### Error Handling
- Use Result types (`ValidationResult`, `MemoryOperationResult`)
- Never throw exceptions from validation functions
- Provide structured error information with codes and paths
- Include context in error messages

## Code Quality

### Documentation
- Use JSDoc comments for all public APIs
- Include `@fileoverview` at the top of each file
- Document complex types with inline comments
- Provide usage examples in comments

### Testing Approach
- Focus on validation logic testing
- Test all error conditions and edge cases
- Use type assertions to ensure type safety
- Mock external dependencies in tests

### Performance Considerations
- Lazy-load heavy dependencies
- Use efficient Zod schema patterns
- Consider caching for repeated validations
- Optimize for common use cases

## Specific UCP Rules

### Memory Entry Rules
- Always include required fields: `id`, `type`, `project`, `branch`, `timestamp`
- Use UUID v4 for entry IDs
- Store timestamps in ISO 8601 format
- Validate content size limits (1MB max, 100k chars for strings)

### Protocol Implementation Rules
- All protocol methods should be async
- Return operation results with success/error information
- Include metadata in operation results
- Support pagination for list operations

### Validation Rules
- Validate project names: alphanumeric + underscore/hyphen, 1-100 chars
- Validate branch names: Git-compatible format, 1-250 chars
- Support embedding dimensions: 384, 512, 768, 1024, 1536
- Enforce content size limits to prevent abuse

## Development Workflow

### Building
- Always run `pnpm typecheck` before committing
- Use `pnpm build` to compile TypeScript to JavaScript
- Test imports work correctly after building
- Ensure no build warnings or errors

### Code Changes
- Update both TypeScript types AND Zod schemas together
- Add validation tests for new fields
- Update exports in `index.ts` for new public APIs
- Maintain backward compatibility where possible

### Dependencies
- Minimize external dependencies
- Use `zod` for all validation needs
- Prefer standard library solutions
- Document any new dependency additions