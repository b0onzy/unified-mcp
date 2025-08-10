# Claude Instructions for UCP Development

## Primary Objectives

When working on this UCP (Unified Context Protocol) repository, your primary goals are:

1. **Maintain Library Purity** - This is a TypeScript library providing types and interfaces only. Never add implementation-specific code.

2. **Ensure Type Safety** - Every change must maintain strict TypeScript compatibility and runtime validation through Zod schemas.

3. **Preserve Protocol Stability** - Changes to core types and interfaces must be backward compatible or clearly documented as breaking changes.

## Task Prioritization

### High Priority Tasks
- Fixing TypeScript compilation errors
- Updating Zod schemas when types change
- Adding validation for new fields or types
- Maintaining export consistency in `index.ts`

### Medium Priority Tasks
- Improving JSDoc documentation
- Optimizing validation performance
- Adding new memory entry types (with full validation)
- Extending protocol interfaces

### Low Priority Tasks
- Code formatting and style improvements
- Adding utility functions
- Improving error messages
- Build configuration tweaks

## Common Development Scenarios

### Adding a New Memory Entry Type

1. **Define the TypeScript type** in `src/types/index.ts`
2. **Create corresponding Zod schema** with the same name + `Schema` suffix
3. **Add to the `MemoryEntryType` enum**
4. **Update `MemoryEntryValidator.validateByType()`** to handle the new type
5. **Export from `src/index.ts`**
6. **Test validation works correctly**

### Extending Protocol Interfaces

1. **Add new methods to existing interfaces** or create new interfaces in `src/protocol/index.ts`
2. **Ensure all methods return proper result types** (`MemoryOperationResult<T>`)
3. **Add JSDoc documentation** for new methods
4. **Export from `src/index.ts`**
5. **Consider backward compatibility** implications

### Updating Validation Logic

1. **Modify validator classes** in `src/validation/index.ts`
2. **Update corresponding Zod schemas** if structure changes
3. **Add comprehensive error handling** with descriptive messages
4. **Test edge cases** and error conditions
5. **Update validation result types** if needed

## Code Review Checklist

Before any changes, verify:

- [ ] **TypeScript compiles without errors** (`pnpm typecheck`)
- [ ] **All types have corresponding Zod schemas**
- [ ] **New exports are added to `src/index.ts`**
- [ ] **JSDoc documentation is complete**
- [ ] **Validation covers all new fields**
- [ ] **No implementation code was added** (this is a types-only library)
- [ ] **Backward compatibility is maintained**
- [ ] **Build succeeds** (`pnpm build`)

## Error Prevention

### Common Mistakes to Avoid
- Adding concrete implementations instead of interfaces
- Forgetting to update Zod schemas when types change
- Missing exports in the main index file
- Adding dependencies without clear justification
- Breaking backward compatibility without documentation

### Validation Best Practices
- Always validate input at boundaries
- Provide specific error messages with field paths
- Use appropriate Zod validators (`.uuid()`, `.datetime()`, etc.)
- Handle optional fields correctly
- Test validation with invalid inputs

## Integration Guidelines

### Working with External Systems
- Keep MCP integration abstract through interfaces
- Design for multiple vector database backends
- Support various embedding models through generic interfaces
- Allow for different caching strategies

### Future-Proofing
- Use generic types where appropriate
- Design extensible enum values
- Plan for additional memory entry types
- Consider international/Unicode support

## Communication

### Documentation Standards
- Write clear, concise JSDoc comments
- Include parameter and return type descriptions
- Provide usage examples for complex types
- Document any breaking changes explicitly

### Code Comments
- Explain why, not what
- Document complex validation logic
- Note performance considerations
- Highlight areas for future improvement

This library serves as the foundation for any UCP implementation - treat it as a critical dependency that many systems will rely on.