/**
 * @fileoverview Basic Memory Operations Example
 * 
 * This example demonstrates the fundamental CRUD operations
 * for Unified-MCP memory entries: Create, Read, Update, Delete.
 */

import { MCPClient } from '@unified-mcp/client-ts';
import { MemoryEntryType, type TaskState, type MemoryEntry } from '@unified-mcp/core';
import chalk from 'chalk';
import ora from 'ora';

// Example configuration
const CONFIG = {
  serverUrl: process.env.UNIFIED_MCP_SERVER_URL || 'http://localhost:3000',
  project: 'memory-operations-example',
  branch: 'main',
  apiKey: process.env.UNIFIED_MCP_API_KEY
};

/**
 * Initialize Unified-MCP client with configuration
 */
function createClient(): MCPClient {
  console.log(chalk.blue('🚀 Initializing Unified-MCP Client...'));
  console.log(chalk.gray(`   Server: ${CONFIG.serverUrl}`));
  console.log(chalk.gray(`   Project: ${CONFIG.project}`));
  console.log(chalk.gray(`   Branch: ${CONFIG.branch}`));
  
  return new MCPClient({
    baseUrl: CONFIG.serverUrl,
    project: CONFIG.project,
    branch: CONFIG.branch,
    apiKey: CONFIG.apiKey,
    debug: true
  });
}

/**
 * Example 1: Creating different types of memory entries
 */
async function demonstrateCreateOperations(client: UCPClient): Promise<MemoryEntry[]> {
  console.log(chalk.yellow('\n📝 Creating Memory Entries...'));
  const createdEntries: MemoryEntry[] = [];
  
  // Create a task state entry
  const spinner = ora('Creating task state entry...').start();
  try {
    const taskEntry = await client.memory.create({
      type: MemoryEntryType.TASK_STATE,
      content: {
        description: 'Implement user authentication system',
        goals: [
          'Set up JWT authentication',
          'Create login/logout endpoints',
          'Add password hashing with bcrypt',
          'Implement session management'
        ],
        progress: 25,
        context: {
          framework: 'Express.js',
          database: 'PostgreSQL',
          currentStep: 'JWT setup',
          estimatedHours: 8,
          actualHours: 2
        },
        activeFiles: [
          'src/auth/jwt.ts',
          'src/routes/auth.ts',
          'src/middleware/auth.ts',
          'src/models/user.ts'
        ],
        workingDirectory: '/project/backend',
        dependencies: ['jsonwebtoken', 'bcrypt', 'express-session'],
        blockers: []
      },
      metadata: {
        priority: 'high',
        assignee: 'john.doe',
        labels: ['authentication', 'security', 'backend']
      },
      tags: ['auth', 'security', 'api']
    });
    
    createdEntries.push(taskEntry);
    spinner.succeed(chalk.green(`Created task entry: ${taskEntry.id}`));
  } catch (error) {
    spinner.fail(chalk.red(`Failed to create task entry: ${error}`));
  }
  
  // Create a commit delta entry
  const commitSpinner = ora('Creating commit delta entry...').start();
  try {
    const commitEntry = await client.memory.create({
      type: MemoryEntryType.COMMIT_DELTA,
      content: {
        commitHash: 'abc123def456',
        message: 'feat: add JWT authentication middleware',
        author: {
          name: 'John Doe',
          email: 'john.doe@example.com'
        },
        files: [
          {
            path: 'src/middleware/auth.ts',
            action: 'added',
            linesAdded: 45,
            linesDeleted: 0
          },
          {
            path: 'src/utils/jwt.ts',
            action: 'added',
            linesAdded: 32,
            linesDeleted: 0
          },
          {
            path: 'package.json',
            action: 'modified',
            linesAdded: 2,
            linesDeleted: 0
          }
        ],
        semantic: {
          functions: ['generateToken', 'verifyToken', 'authMiddleware'],
          classes: ['JWTService'],
          imports: ['jsonwebtoken', 'crypto'],
          configs: ['JWT_SECRET', 'JWT_EXPIRES_IN']
        }
      },
      tags: ['commit', 'authentication', 'middleware']
    });
    
    createdEntries.push(commitEntry);
    commitSpinner.succeed(chalk.green(`Created commit entry: ${commitEntry.id}`));
  } catch (error) {
    commitSpinner.fail(chalk.red(`Failed to create commit entry: ${error}`));
  }
  
  // Create a reasoning entry (AI conversation)
  const reasoningSpinner = ora('Creating AI reasoning entry...').start();
  try {
    const reasoningEntry = await client.memory.create({
      type: MemoryEntryType.REASONING_ENTRY,
      content: {
        threadId: 'thread-auth-discussion',
        model: 'claude-3-sonnet',
        query: 'How should I implement JWT token refresh logic?',
        response: 'For JWT refresh tokens, implement a dual-token system: short-lived access tokens (15 minutes) and longer-lived refresh tokens (7 days). Store refresh tokens securely and implement rotation on each use.',
        reasoning: 'This approach balances security with user experience by minimizing the window for token compromise while avoiding frequent re-authentication.',
        codeRefs: [
          {
            file: 'src/auth/jwt.ts',
            lines: [15, 30],
            content: 'export function generateTokenPair(userId: string) { ... }'
          }
        ],
        actions: [
          'Implement refresh token storage in database',
          'Add token rotation logic',
          'Create refresh endpoint'
        ]
      },
      tags: ['ai-conversation', 'jwt', 'security-design']
    });
    
    createdEntries.push(reasoningEntry);
    reasoningSpinner.succeed(chalk.green(`Created reasoning entry: ${reasoningEntry.id}`));
  } catch (error) {
    reasoningSpinner.fail(chalk.red(`Failed to create reasoning entry: ${error}`));
  }
  
  return createdEntries;
}

/**
 * Example 2: Reading and querying memory entries
 */
async function demonstrateReadOperations(client: UCPClient, createdEntries: MemoryEntry[]): Promise<void> {
  console.log(chalk.yellow('\n🔍 Reading Memory Entries...'));
  
  // Get all entries for the project
  const listSpinner = ora('Fetching all project memories...').start();
  try {
    const allEntries = await client.memory.list({
      limit: 10,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    });
    
    listSpinner.succeed(chalk.green(`Found ${allEntries.length} total memory entries`));
    
    // Display summary
    const entryCounts = allEntries.reduce((acc, entry) => {
      acc[entry.type] = (acc[entry.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log(chalk.gray('   Entry types:'));
    Object.entries(entryCounts).forEach(([type, count]) => {
      console.log(chalk.gray(`     ${type}: ${count}`));
    });
  } catch (error) {
    listSpinner.fail(chalk.red(`Failed to list entries: ${error}`));
  }
  
  // Get specific entry by ID
  if (createdEntries.length > 0) {
    const getSpinner = ora('Fetching specific entry by ID...').start();
    try {
      const specificEntry = await client.memory.get(createdEntries[0].id);
      getSpinner.succeed(chalk.green(`Retrieved entry: ${specificEntry.type}`));
      
      console.log(chalk.gray('   Entry details:'));
      console.log(chalk.gray(`     ID: ${specificEntry.id}`));
      console.log(chalk.gray(`     Type: ${specificEntry.type}`));
      console.log(chalk.gray(`     Created: ${new Date(specificEntry.timestamp).toLocaleString()}`));
    } catch (error) {
      getSpinner.fail(chalk.red(`Failed to get entry: ${error}`));
    }
  }
  
  // Query entries by type
  const querySpinner = ora('Querying task state entries...').start();
  try {
    const taskEntries = await client.memory.list({
      type: MemoryEntryType.TASK_STATE,
      limit: 5
    });
    
    querySpinner.succeed(chalk.green(`Found ${taskEntries.length} task state entries`));
    
    taskEntries.forEach((entry, index) => {
      const taskContent = entry.content as any;
      console.log(chalk.gray(`   ${index + 1}. ${taskContent.description} (${taskContent.progress}%)`));
    });
  } catch (error) {
    querySpinner.fail(chalk.red(`Failed to query task entries: ${error}`));
  }
}

/**
 * Example 3: Updating memory entries
 */
async function demonstrateUpdateOperations(client: UCPClient, createdEntries: MemoryEntry[]): Promise<void> {
  console.log(chalk.yellow('\n✏️  Updating Memory Entries...'));
  
  // Find and update a task state entry
  const taskEntry = createdEntries.find(entry => entry.type === MemoryEntryType.TASK_STATE);
  
  if (taskEntry) {
    const updateSpinner = ora('Updating task progress...').start();
    try {
      const currentContent = taskEntry.content as any;
      
      const updatedEntry = await client.memory.update(taskEntry.id, {
        content: {
          ...currentContent,
          progress: 75,
          context: {
            ...currentContent.context,
            currentStep: 'Session management implementation',
            actualHours: 6
          },
          activeFiles: [
            ...currentContent.activeFiles,
            'src/middleware/session.ts',
            'src/routes/auth-refresh.ts'
          ],
          blockers: [
            'Need clarification on session storage strategy'
          ]
        },
        metadata: {
          ...taskEntry.metadata,
          lastUpdatedBy: 'john.doe',
          updateReason: 'Progress update and blocker added'
        }
      });
      
      updateSpinner.succeed(chalk.green(`Updated task progress to 75%`));
      console.log(chalk.gray(`   Added blocker: ${updatedEntry.content.blockers[0]}`));
      console.log(chalk.gray(`   Active files: ${updatedEntry.content.activeFiles.length}`));
    } catch (error) {
      updateSpinner.fail(chalk.red(`Failed to update entry: ${error}`));
    }
  }
  
  // Update multiple entries with tags
  const tagSpinner = ora('Adding tags to entries...').start();
  try {
    for (const entry of createdEntries) {
      await client.memory.update(entry.id, {
        tags: [...(entry.tags || []), 'example-run', new Date().toISOString().split('T')[0]]
      });
    }
    
    tagSpinner.succeed(chalk.green(`Added tags to ${createdEntries.length} entries`));
  } catch (error) {
    tagSpinner.fail(chalk.red(`Failed to update tags: ${error}`));
  }
}

/**
 * Example 4: Searching memory entries
 */
async function demonstrateSearchOperations(client: UCPClient): Promise<void> {
  console.log(chalk.yellow('\n🔎 Searching Memory Entries...'));
  
  // Semantic search for authentication-related memories
  const semanticSpinner = ora('Performing semantic search...').start();
  try {
    const authMemories = await client.memory.search('authentication login JWT security', {
      limit: 5,
      threshold: 0.6
    });
    
    semanticSpinner.succeed(chalk.green(`Found ${authMemories.length} authentication-related memories`));
    
    authMemories.forEach((result, index) => {
      console.log(chalk.gray(`   ${index + 1}. ${result.entry.type} (score: ${result.score.toFixed(3)})`));
    });
  } catch (error) {
    semanticSpinner.fail(chalk.red(`Failed semantic search: ${error}`));
  }
  
  // Text-based search in content
  const textSpinner = ora('Performing text search...').start();
  try {
    const expressMemories = await client.memory.list({
      textSearch: 'Express.js',
      limit: 3
    });
    
    textSpinner.succeed(chalk.green(`Found ${expressMemories.length} Express.js-related memories`));
  } catch (error) {
    textSpinner.fail(chalk.red(`Failed text search: ${error}`));
  }
  
  // Search by date range
  const dateSpinner = ora('Searching recent memories...').start();
  try {
    const recentMemories = await client.memory.list({
      dateRange: {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        end: new Date()
      },
      sortBy: 'timestamp',
      sortOrder: 'desc'
    });
    
    dateSpinner.succeed(chalk.green(`Found ${recentMemories.length} memories from last 24 hours`));
  } catch (error) {
    dateSpinner.fail(chalk.red(`Failed date search: ${error}`));
  }
}

/**
 * Example 5: Deleting memory entries
 */
async function demonstrateDeleteOperations(client: UCPClient, createdEntries: MemoryEntry[]): Promise<void> {
  console.log(chalk.yellow('\n🗑️  Memory Cleanup Operations...'));
  
  // Delete test entries created in this example
  console.log(chalk.gray('   Cleaning up example entries...'));
  
  for (const entry of createdEntries) {
    const deleteSpinner = ora(`Deleting ${entry.type} entry...`).start();
    try {
      await client.memory.delete(entry.id);
      deleteSpinner.succeed(chalk.green(`Deleted ${entry.type} entry`));
    } catch (error) {
      deleteSpinner.fail(chalk.red(`Failed to delete entry: ${error}`));
    }
  }
  
  console.log(chalk.green(`✅ Cleaned up ${createdEntries.length} example entries`));
}

/**
 * Main example function
 */
async function main(): Promise<void> {
  console.log(chalk.bold.blue('🧠 UCP Basic Memory Operations Example\n'));
  
  try {
    // Initialize client
    const client = createClient();
    
    // Test server connection
    const healthSpinner = ora('Testing server connection...').start();
    try {
      await client.health();
      healthSpinner.succeed(chalk.green('Server connection successful'));
    } catch (error) {
      healthSpinner.fail(chalk.red('Server connection failed'));
      console.log(chalk.red('Please ensure the UCP server is running at'), chalk.blue(CONFIG.serverUrl));
      process.exit(1);
    }
    
    // Run examples
    const createdEntries = await demonstrateCreateOperations(client);
    await demonstrateReadOperations(client, createdEntries);
    await demonstrateUpdateOperations(client, createdEntries);
    await demonstrateSearchOperations(client);
    
    // Ask user if they want to clean up
    console.log(chalk.yellow('\n🧹 Cleanup'));
    console.log(chalk.gray('Example created'), chalk.blue(createdEntries.length.toString()), chalk.gray('memory entries.'));
    
    // For demo purposes, always clean up
    await demonstrateDeleteOperations(client, createdEntries);
    
    console.log(chalk.bold.green('\n✨ Example completed successfully!'));
    console.log(chalk.gray('Next steps:'));
    console.log(chalk.gray('  • Try the interactive demo: npm run demo'));
    console.log(chalk.gray('  • Explore scenarios: npm run scenario:task-tracking'));
    console.log(chalk.gray('  • Read the documentation: README.md'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Example failed:'), error);
    process.exit(1);
  }
}

// Run example if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main, createClient, CONFIG };