# Basic Memory Operations

**Difficulty:** Beginner  
**Time:** 15 minutes  
**Prerequisites:** Unified-MCP development environment setup

Learn the fundamental operations for working with Unified-MCP memory entries: create, read, update, delete, and search.

## 🎯 What You'll Learn

- Creating different types of memory entries
- Storing and retrieving memory from the Unified-MCP server
- Updating existing memory entries
- Deleting memory entries
- Basic memory querying and filtering

## 📋 Prerequisites

```bash
# Ensure Unified-MCP server is running
cd ../../../
pnpm docker:up
pnpm dev

# Server should be available at http://localhost:3000
```

## 🚀 Quick Start

```bash
# Navigate to this example
cd examples/basic-usage/01-memory-operations

# Install dependencies
npm install

# Run the basic example
npm start

# Run interactive demo
npm run demo

# Run with different scenarios
npm run scenario:task-tracking
npm run scenario:commit-history
npm run scenario:ai-conversations
```

## 📖 Code Walkthrough

### 1. Setting Up the Client

```typescript
// src/index.ts
import { UCPClient } from '@ucp/client-ts';
import { MemoryEntryType, TaskState } from '@ucp/core';

// Initialize UCP client
const client = new UCPClient({
  baseUrl: 'http://localhost:3000',
  project: 'my-first-project',
  branch: 'main'
});
```

### 2. Creating Memory Entries

```typescript
// Create a task state entry
const taskEntry = await client.memory.create({
  type: MemoryEntryType.TASK_STATE,
  content: {
    description: 'Implement user authentication',
    goals: [
      'Set up JWT authentication',
      'Create login/logout endpoints',
      'Add password hashing'
    ],
    progress: 25,
    context: {
      framework: 'Express.js',
      database: 'PostgreSQL',
      currentStep: 'JWT setup'
    },
    activeFiles: [
      'src/auth/jwt.ts',
      'src/routes/auth.ts',
      'src/middleware/auth.ts'
    ],
    workingDirectory: '/project/backend'
  }
});

console.log('Created task entry:', taskEntry.id);
```

### 3. Retrieving Memory Entries

```typescript
// Get all memory entries for current project/branch
const allEntries = await client.memory.list({
  limit: 10,
  sortBy: 'timestamp',
  sortOrder: 'desc'
});

console.log(`Found ${allEntries.length} memory entries`);

// Get specific entry by ID
const specificEntry = await client.memory.get(taskEntry.id);

// Get entries by type
const taskEntries = await client.memory.list({
  type: MemoryEntryType.TASK_STATE,
  limit: 5
});
```

### 4. Updating Memory Entries

```typescript
// Update task progress
const updatedEntry = await client.memory.update(taskEntry.id, {
  content: {
    ...taskEntry.content,
    progress: 50,
    context: {
      ...taskEntry.content.context,
      currentStep: 'Login endpoint implementation'
    },
    activeFiles: [
      ...taskEntry.content.activeFiles,
      'src/controllers/auth.ts'
    ]
  }
});

console.log('Updated task progress to 50%');
```

### 5. Searching Memory

```typescript
// Semantic search for authentication-related memories
const authMemories = await client.memory.search('authentication login JWT', {
  limit: 5,
  threshold: 0.7
});

console.log(`Found ${authMemories.length} authentication-related memories`);

// Text-based search in content
const expressMemories = await client.memory.list({
  project: 'my-first-project',
  textSearch: 'Express.js'
});
```

### 6. Deleting Memory Entries

```typescript
// Delete specific entry
await client.memory.delete(taskEntry.id);
console.log('Deleted task entry');

// Bulk delete old entries
const oldEntries = await client.memory.list({
  dateRange: {
    start: new Date('2024-01-01'),
    end: new Date('2024-06-01')
  }
});

for (const entry of oldEntries) {
  await client.memory.delete(entry.id);
}
console.log(`Deleted ${oldEntries.length} old entries`);
```

## 🎮 Interactive Demo

Run the interactive demo to explore operations step-by-step:

```bash
npm run demo
```

This will present a menu-driven interface where you can:

1. **Create Sample Data** - Generate example memory entries
2. **View All Memories** - List current memory entries
3. **Search Memories** - Try different search queries
4. **Update Progress** - Modify existing task entries
5. **Clean Up** - Delete test data

## 📊 Example Scenarios

### Scenario 1: Task Tracking Workflow

```bash
npm run scenario:task-tracking
```

Demonstrates a complete task management workflow:
1. Create new development task
2. Track progress updates
3. Add blockers and dependencies
4. Mark task as completed
5. Create summary checkpoint

**Expected Output:**
```
✅ Created task: Implement user authentication
⏳ Progress: 0% → 25% → 50% → 75% → 100%
🚧 Added blocker: Need password policy requirements
📝 Created completion summary
```

### Scenario 2: Commit History Tracking

```bash
npm run scenario:commit-history
```

Shows how to track code changes over time:
1. Simulate git commits with memory entries
2. Track file changes and semantic analysis
3. Build project history timeline
4. Analyze development patterns

**Expected Output:**
```
📝 Commit abc123: Initial project setup
📝 Commit def456: Add authentication middleware
📝 Commit ghi789: Implement user login endpoint
📊 Analysis: 15 files changed, 3 new features added
```

### Scenario 3: AI Conversation History

```bash
npm run scenario:ai-conversations
```

Demonstrates storing AI interactions:
1. Record AI conversations about code
2. Track decision rationale
3. Build knowledge base of solutions
4. Search previous AI recommendations

**Expected Output:**
```
🤖 AI Conversation: How to implement JWT tokens?
💭 Decision: Use jsonwebtoken library with RS256
🔍 Search: Found 3 similar authentication discussions
📚 Knowledge built: JWT implementation patterns
```

## 🔧 Configuration Options

### Client Configuration

```typescript
// Advanced client setup
const client = new UCPClient({
  baseUrl: process.env.UCP_SERVER_URL || 'http://localhost:3000',
  apiKey: process.env.UCP_API_KEY, // Optional for development
  project: 'my-project',
  branch: 'feature/auth',
  
  // Optional configurations
  timeout: 5000,
  retries: 3,
  cache: {
    enabled: true,
    ttl: 300 // 5 minutes
  },
  
  // Debug options
  debug: process.env.NODE_ENV === 'development',
  logLevel: 'info'
});
```

### Memory Entry Options

```typescript
// Creating entries with advanced options
const entry = await client.memory.create({
  type: MemoryEntryType.TASK_STATE,
  content: { /* content */ },
  
  // Optional metadata
  metadata: {
    priority: 'high',
    assignee: 'john.doe',
    labels: ['authentication', 'security']
  },
  
  // Tags for categorization
  tags: ['backend', 'security', 'api'],
  
  // Custom task ID for linking
  taskId: 'PROJ-123'
});
```

## ❗ Common Issues & Solutions

### 1. Connection Refused

**Problem:** `ECONNREFUSED 127.0.0.1:3000`

**Solution:**
```bash
# Ensure UCP server is running
cd ../../../
pnpm dev

# Check server status
curl http://localhost:3000/health
```

### 2. Validation Errors

**Problem:** `Validation failed: Invalid memory entry type`

**Solution:**
```typescript
// Import correct types
import { MemoryEntryType } from '@ucp/core';

// Use enum values, not strings
type: MemoryEntryType.TASK_STATE, // ✅ Correct
type: 'TaskState', // ❌ Incorrect
```

### 3. Large Content Errors

**Problem:** `Content size exceeds maximum allowed size`

**Solution:**
```typescript
// Check content size before storing
const contentSize = JSON.stringify(content).length;
if (contentSize > 100000) { // 100KB limit
  console.warn('Content too large, consider summarizing');
  // Implement content summarization
}
```

### 4. Memory Leaks in Demos

**Problem:** Too many memory entries created during testing

**Solution:**
```bash
# Clean up test data
npm run cleanup

# Or delete specific project
npm run cleanup -- --project my-first-project
```

## 📈 Performance Tips

### Batch Operations

```typescript
// Instead of individual creates
for (const item of items) {
  await client.memory.create(item); // ❌ Slow
}

// Use batch creation
await client.memory.createBatch(items); // ✅ Fast
```

### Efficient Querying

```typescript
// Use specific filters to reduce data transfer
const entries = await client.memory.list({
  type: MemoryEntryType.TASK_STATE,
  limit: 10,
  project: 'specific-project', // Narrow scope
  dateRange: {
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last week
  }
});
```

### Caching Strategies

```typescript
// Enable client-side caching for frequently accessed data
const client = new UCPClient({
  // ...
  cache: {
    enabled: true,
    ttl: 300, // 5 minutes
    maxSize: 100 // Maximum cached entries
  }
});
```

## 🧪 Testing Your Understanding

Try these exercises to test your understanding:

1. **Create a Personal Task Tracker**
   - Create memory entries for your daily tasks
   - Update progress throughout the day
   - Search for completed tasks

2. **Build a Simple Project History**
   - Simulate a week of development commits
   - Track different types of changes (features, bugs, refactoring)
   - Analyze patterns in your development work

3. **Implement Error Handling**
   - Add try-catch blocks to all operations
   - Handle network timeouts gracefully
   - Implement retry logic for failed operations

## 🔗 Next Steps

- **[Task State Management](../02-task-state/)** - Deep dive into task tracking
- **[Memory Search](../06-memory-search/)** - Advanced search techniques
- **[Real-World Web App](../../real-world/01-web-app-dev/)** - Complete project example

## 📚 Additional Resources

- [Unified-MCP Core Types Reference](../../../packages/core/src/types/)
- [Client SDK Documentation](../../../packages/clients/typescript/)
- [Memory Entry Schema](../../../packages/core/schema/)

---

**Questions?** Check the [troubleshooting guide](../../../docs/guides/TROUBLESHOOTING.md) or create an issue on GitHub.