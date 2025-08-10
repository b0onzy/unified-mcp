/**
 * @fileoverview Interactive Demo for Memory Operations
 * 
 * This interactive demo allows users to explore Unified-MCP memory operations
 * through a menu-driven interface.
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { MCPClient } from '@unified-mcp/client-ts';
import { MemoryEntryType, type MemoryEntry } from '@unified-mcp/core';
import { createClient, CONFIG } from './index.js';

interface DemoState {
  client: MCPClient;
  sampleEntries: MemoryEntry[];
  isConnected: boolean;
}

/**
 * Main menu options
 */
const MAIN_MENU_CHOICES = [
  { name: '📝 Create Sample Data', value: 'create-sample' },
  { name: '👀 View All Memories', value: 'view-all' },
  { name: '🔍 Search Memories', value: 'search' },
  { name: '✏️  Update Progress', value: 'update' },
  { name: '📊 Show Statistics', value: 'stats' },
  { name: '🧹 Clean Up Data', value: 'cleanup' },
  { name: '❓ Help', value: 'help' },
  { name: '🚪 Exit', value: 'exit' }
];

/**
 * Create sample memory entries for demonstration
 */
async function createSampleData(state: DemoState): Promise<void> {
  console.log(chalk.yellow('\n📝 Creating Sample Memory Entries...'));
  
  const entries = [
    {
      type: MemoryEntryType.TASK_STATE,
      content: {
        description: 'Build responsive navigation component',
        goals: ['Design mobile-first layout', 'Add accessibility features', 'Implement smooth animations'],
        progress: 60,
        context: { framework: 'React', styling: 'Tailwind CSS' },
        activeFiles: ['src/components/Navigation.tsx', 'src/styles/nav.css'],
        workingDirectory: '/project/frontend'
      },
      tags: ['frontend', 'ui', 'react']
    },
    {
      type: MemoryEntryType.COMMIT_DELTA,
      content: {
        commitHash: 'fe4b7c1a',
        message: 'fix: resolve navigation menu overflow on mobile',
        author: { name: 'Alice Smith', email: 'alice@example.com' },
        files: [
          { path: 'src/components/Navigation.tsx', action: 'modified', linesAdded: 12, linesDeleted: 5 }
        ]
      },
      tags: ['bugfix', 'mobile', 'ui']
    },
    {
      type: MemoryEntryType.REASONING_ENTRY,
      content: {
        threadId: 'nav-discussion',
        model: 'claude-3-sonnet',
        query: 'How can I make the navigation menu more accessible?',
        response: 'Implement keyboard navigation with Tab/Enter, add ARIA labels, ensure proper color contrast ratios, and provide skip links for screen readers.',
        actions: ['Add ARIA attributes', 'Implement keyboard handlers', 'Test with screen reader']
      },
      tags: ['accessibility', 'ai-guidance', 'best-practices']
    }
  ];
  
  for (const [index, entryData] of entries.entries()) {
    const spinner = ora(`Creating ${entryData.type} entry...`).start();
    try {
      const entry = await state.client.memory.create(entryData);
      state.sampleEntries.push(entry);
      spinner.succeed(chalk.green(`Created ${entryData.type}`));
    } catch (error) {
      spinner.fail(chalk.red(`Failed to create entry: ${error}`));
    }
  }
  
  console.log(chalk.green(`✅ Created ${state.sampleEntries.length} sample entries`));
}

/**
 * Display all memory entries in a formatted way
 */
async function viewAllMemories(state: DemoState): Promise<void> {
  console.log(chalk.yellow('\n👀 All Memory Entries'));
  
  const spinner = ora('Fetching memories...').start();
  try {
    const entries = await state.client.memory.list({
      limit: 20,
      sortBy: 'timestamp',
      sortOrder: 'desc'
    });
    
    spinner.stop();
    
    if (entries.length === 0) {
      console.log(chalk.gray('No memory entries found. Create some sample data first!'));
      return;
    }
    
    console.log(chalk.blue(`\nFound ${entries.length} memory entries:\n`));
    
    entries.forEach((entry, index) => {
      const date = new Date(entry.timestamp).toLocaleString();
      const typeColor = getTypeColor(entry.type);
      
      console.log(chalk.gray(`${index + 1}.`), typeColor(`${entry.type}`));
      console.log(chalk.gray(`   ID: ${entry.id}`));
      console.log(chalk.gray(`   Created: ${date}`));
      console.log(chalk.gray(`   Project: ${entry.project} / ${entry.branch}`));
      
      // Show type-specific preview
      if (entry.type === MemoryEntryType.TASK_STATE) {
        const content = entry.content as any;
        console.log(chalk.gray(`   Task: ${content.description}`));
        console.log(chalk.gray(`   Progress: ${content.progress}%`));
      } else if (entry.type === MemoryEntryType.COMMIT_DELTA) {
        const content = entry.content as any;
        console.log(chalk.gray(`   Commit: ${content.message}`));
        console.log(chalk.gray(`   Files: ${content.files?.length || 0} changed`));
      } else if (entry.type === MemoryEntryType.REASONING_ENTRY) {
        const content = entry.content as any;
        console.log(chalk.gray(`   Query: ${content.query?.substring(0, 60)}...`));
        console.log(chalk.gray(`   Model: ${content.model}`));
      }
      
      if (entry.tags && entry.tags.length > 0) {
        console.log(chalk.gray(`   Tags: ${entry.tags.join(', ')}`));
      }
      
      console.log(); // Empty line
    });
  } catch (error) {
    spinner.fail(chalk.red(`Failed to fetch memories: ${error}`));
  }
}

/**
 * Interactive search functionality
 */
async function searchMemories(state: DemoState): Promise<void> {
  console.log(chalk.yellow('\n🔍 Search Memory Entries'));
  
  const searchChoice = await inquirer.prompt([
    {
      type: 'list',
      name: 'searchType',
      message: 'What type of search would you like to perform?',
      choices: [
        { name: '🧠 Semantic Search (AI-powered)', value: 'semantic' },
        { name: '📝 Text Search', value: 'text' },
        { name: '🏷️  Tag Search', value: 'tag' },
        { name: '📅 Date Range Search', value: 'date' },
        { name: '🔙 Back to main menu', value: 'back' }
      ]
    }
  ]);
  
  if (searchChoice.searchType === 'back') return;
  
  switch (searchChoice.searchType) {
    case 'semantic':
      await performSemanticSearch(state);
      break;
    case 'text':
      await performTextSearch(state);
      break;
    case 'tag':
      await performTagSearch(state);
      break;
    case 'date':
      await performDateSearch(state);
      break;
  }
}

async function performSemanticSearch(state: DemoState): Promise<void> {
  const { query } = await inquirer.prompt([
    {
      type: 'input',
      name: 'query',
      message: 'Enter your semantic search query:',
      default: 'navigation menu accessibility'
    }
  ]);
  
  const spinner = ora('Performing semantic search...').start();
  try {
    const results = await state.client.memory.search(query, {
      limit: 5,
      threshold: 0.5
    });
    
    spinner.stop();
    
    if (results.length === 0) {
      console.log(chalk.gray('No results found for your query.'));
      return;
    }
    
    console.log(chalk.blue(`\nFound ${results.length} semantic matches:\n`));
    
    results.forEach((result, index) => {
      const typeColor = getTypeColor(result.entry.type);
      console.log(chalk.gray(`${index + 1}.`), typeColor(`${result.entry.type}`), chalk.gray(`(score: ${result.score.toFixed(3)})`));
      console.log(chalk.gray(`   ID: ${result.entry.id}`));
      
      // Show relevant content snippet
      const content = result.entry.content as any;
      if (content.description) {
        console.log(chalk.gray(`   Description: ${content.description}`));
      } else if (content.message) {
        console.log(chalk.gray(`   Message: ${content.message}`));
      } else if (content.query) {
        console.log(chalk.gray(`   Query: ${content.query}`));
      }
      
      console.log();
    });
  } catch (error) {
    spinner.fail(chalk.red(`Semantic search failed: ${error}`));
  }
}

async function performTextSearch(state: DemoState): Promise<void> {
  const { searchText } = await inquirer.prompt([
    {
      type: 'input',
      name: 'searchText',
      message: 'Enter text to search for:',
      default: 'React'
    }
  ]);
  
  const spinner = ora('Searching text content...').start();
  try {
    const results = await state.client.memory.list({
      textSearch: searchText,
      limit: 10
    });
    
    spinner.stop();
    
    if (results.length === 0) {
      console.log(chalk.gray(`No entries containing "${searchText}" found.`));
      return;
    }
    
    console.log(chalk.blue(`\nFound ${results.length} entries containing "${searchText}":\n`));
    
    results.forEach((entry, index) => {
      const typeColor = getTypeColor(entry.type);
      console.log(chalk.gray(`${index + 1}.`), typeColor(`${entry.type}`));
      console.log(chalk.gray(`   ID: ${entry.id}`));
      
      // Highlight search term in content
      const contentStr = JSON.stringify(entry.content);
      const highlighted = contentStr.replace(
        new RegExp(searchText, 'gi'),
        chalk.bgYellow.black(searchText)
      );
      
      // Show a snippet
      const snippetLength = 100;
      const snippet = highlighted.length > snippetLength 
        ? highlighted.substring(0, snippetLength) + '...'
        : highlighted;
      
      console.log(chalk.gray(`   Content: ${snippet}`));
      console.log();
    });
  } catch (error) {
    spinner.fail(chalk.red(`Text search failed: ${error}`));
  }
}

async function performTagSearch(state: DemoState): Promise<void> {
  // First, get available tags
  const spinner = ora('Fetching available tags...').start();
  try {
    const allEntries = await state.client.memory.list({ limit: 100 });
    const allTags = new Set<string>();
    
    allEntries.forEach(entry => {
      entry.tags?.forEach(tag => allTags.add(tag));
    });
    
    spinner.stop();
    
    if (allTags.size === 0) {
      console.log(chalk.gray('No tags found in current memories.'));
      return;
    }
    
    const { selectedTag } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedTag',
        message: 'Select a tag to search for:',
        choices: Array.from(allTags).sort()
      }
    ]);
    
    const searchSpinner = ora(`Searching for entries with tag "${selectedTag}"...`).start();
    
    const results = allEntries.filter(entry => 
      entry.tags?.includes(selectedTag)
    );
    
    searchSpinner.stop();
    
    console.log(chalk.blue(`\nFound ${results.length} entries with tag "${selectedTag}":\n`));
    
    results.forEach((entry, index) => {
      const typeColor = getTypeColor(entry.type);
      console.log(chalk.gray(`${index + 1}.`), typeColor(`${entry.type}`));
      console.log(chalk.gray(`   ID: ${entry.id}`));
      console.log(chalk.gray(`   Tags: ${entry.tags?.join(', ')}`));
      console.log();
    });
  } catch (error) {
    spinner.fail(chalk.red(`Tag search failed: ${error}`));
  }
}

async function performDateSearch(state: DemoState): Promise<void> {
  const { timeRange } = await inquirer.prompt([
    {
      type: 'list',
      name: 'timeRange',
      message: 'Select time range:',
      choices: [
        { name: 'Last hour', value: 'hour' },
        { name: 'Last 24 hours', value: 'day' },
        { name: 'Last week', value: 'week' },
        { name: 'Last month', value: 'month' }
      ]
    }
  ]);
  
  const now = new Date();
  let startDate: Date;
  
  switch (timeRange) {
    case 'hour':
      startDate = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case 'day':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  }
  
  const spinner = ora(`Searching memories from ${startDate.toLocaleString()}...`).start();
  try {
    const results = await state.client.memory.list({
      dateRange: { start: startDate, end: now },
      sortBy: 'timestamp',
      sortOrder: 'desc'
    });
    
    spinner.stop();
    
    if (results.length === 0) {
      console.log(chalk.gray(`No memories found in the selected time range.`));
      return;
    }
    
    console.log(chalk.blue(`\nFound ${results.length} memories in the selected time range:\n`));
    
    results.forEach((entry, index) => {
      const typeColor = getTypeColor(entry.type);
      const date = new Date(entry.timestamp).toLocaleString();
      
      console.log(chalk.gray(`${index + 1}.`), typeColor(`${entry.type}`), chalk.gray(`- ${date}`));
      console.log(chalk.gray(`   ID: ${entry.id}`));
      console.log();
    });
  } catch (error) {
    spinner.fail(chalk.red(`Date search failed: ${error}`));
  }
}

/**
 * Update progress of task entries
 */
async function updateProgress(state: DemoState): Promise<void> {
  console.log(chalk.yellow('\n✏️  Update Task Progress'));
  
  const spinner = ora('Fetching task entries...').start();
  try {
    const taskEntries = await state.client.memory.list({
      type: MemoryEntryType.TASK_STATE,
      limit: 10
    });
    
    spinner.stop();
    
    if (taskEntries.length === 0) {
      console.log(chalk.gray('No task entries found. Create some sample data first!'));
      return;
    }
    
    const choices = taskEntries.map(entry => {
      const content = entry.content as any;
      return {
        name: `${content.description} (${content.progress}%)`,
        value: entry.id
      };
    });
    
    choices.push({ name: '🔙 Back to main menu', value: 'back' });
    
    const { selectedTask } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedTask',
        message: 'Select a task to update:',
        choices
      }
    ]);
    
    if (selectedTask === 'back') return;
    
    const { newProgress } = await inquirer.prompt([
      {
        type: 'number',
        name: 'newProgress',
        message: 'Enter new progress percentage (0-100):',
        validate: (value) => {
          if (value >= 0 && value <= 100) return true;
          return 'Progress must be between 0 and 100';
        }
      }
    ]);
    
    const updateSpinner = ora('Updating task progress...').start();
    try {
      const task = taskEntries.find(t => t.id === selectedTask)!;
      const currentContent = task.content as any;
      
      await state.client.memory.update(task.id, {
        content: {
          ...currentContent,
          progress: newProgress
        }
      });
      
      updateSpinner.succeed(chalk.green(`Updated task progress to ${newProgress}%`));
    } catch (error) {
      updateSpinner.fail(chalk.red(`Failed to update task: ${error}`));
    }
  } catch (error) {
    spinner.fail(chalk.red(`Failed to fetch tasks: ${error}`));
  }
}

/**
 * Show memory statistics
 */
async function showStatistics(state: DemoState): Promise<void> {
  console.log(chalk.yellow('\n📊 Memory Statistics'));
  
  const spinner = ora('Calculating statistics...').start();
  try {
    const allEntries = await state.client.memory.list({ limit: 1000 });
    
    spinner.stop();
    
    if (allEntries.length === 0) {
      console.log(chalk.gray('No memory entries found.'));
      return;
    }
    
    // Calculate statistics
    const stats = {
      total: allEntries.length,
      byType: {} as Record<string, number>,
      byProject: {} as Record<string, number>,
      byBranch: {} as Record<string, number>,
      totalSize: 0,
      averageSize: 0,
      oldest: allEntries[0],
      newest: allEntries[0]
    };
    
    allEntries.forEach(entry => {
      // Count by type
      stats.byType[entry.type] = (stats.byType[entry.type] || 0) + 1;
      
      // Count by project
      stats.byProject[entry.project] = (stats.byProject[entry.project] || 0) + 1;
      
      // Count by branch
      stats.byBranch[entry.branch] = (stats.byBranch[entry.branch] || 0) + 1;
      
      // Calculate size
      const entrySize = JSON.stringify(entry).length;
      stats.totalSize += entrySize;
      
      // Find oldest and newest
      if (new Date(entry.timestamp) < new Date(stats.oldest.timestamp)) {
        stats.oldest = entry;
      }
      if (new Date(entry.timestamp) > new Date(stats.newest.timestamp)) {
        stats.newest = entry;
      }
    });
    
    stats.averageSize = Math.round(stats.totalSize / stats.total);
    
    // Display statistics
    console.log(chalk.blue('\n📈 General Statistics:'));
    console.log(chalk.gray(`   Total Entries: ${stats.total}`));
    console.log(chalk.gray(`   Total Size: ${formatBytes(stats.totalSize)}`));
    console.log(chalk.gray(`   Average Size: ${formatBytes(stats.averageSize)}`));
    console.log(chalk.gray(`   Oldest Entry: ${new Date(stats.oldest.timestamp).toLocaleString()}`));
    console.log(chalk.gray(`   Newest Entry: ${new Date(stats.newest.timestamp).toLocaleString()}`));
    
    console.log(chalk.blue('\n📋 By Type:'));
    Object.entries(stats.byType).forEach(([type, count]) => {
      const percentage = ((count / stats.total) * 100).toFixed(1);
      console.log(chalk.gray(`   ${type}: ${count} (${percentage}%)`));
    });
    
    console.log(chalk.blue('\n📁 By Project:'));
    Object.entries(stats.byProject).forEach(([project, count]) => {
      const percentage = ((count / stats.total) * 100).toFixed(1);
      console.log(chalk.gray(`   ${project}: ${count} (${percentage}%)`));
    });
    
    console.log(chalk.blue('\n🌿 By Branch:'));
    Object.entries(stats.byBranch).forEach(([branch, count]) => {
      const percentage = ((count / stats.total) * 100).toFixed(1);
      console.log(chalk.gray(`   ${branch}: ${count} (${percentage}%)`));
    });
    
  } catch (error) {
    spinner.fail(chalk.red(`Failed to calculate statistics: ${error}`));
  }
}

/**
 * Clean up demo data
 */
async function cleanupData(state: DemoState): Promise<void> {
  console.log(chalk.yellow('\n🧹 Cleanup Memory Data'));
  
  const { confirmCleanup } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmCleanup',
      message: 'This will delete sample entries created in this demo. Continue?',
      default: false
    }
  ]);
  
  if (!confirmCleanup) {
    console.log(chalk.gray('Cleanup cancelled.'));
    return;
  }
  
  if (state.sampleEntries.length === 0) {
    console.log(chalk.gray('No sample entries to clean up.'));
    return;
  }
  
  for (const entry of state.sampleEntries) {
    const spinner = ora(`Deleting ${entry.type}...`).start();
    try {
      await state.client.memory.delete(entry.id);
      spinner.succeed(chalk.green(`Deleted ${entry.type}`));
    } catch (error) {
      spinner.fail(chalk.red(`Failed to delete ${entry.type}: ${error}`));
    }
  }
  
  state.sampleEntries = [];
  console.log(chalk.green('✅ Cleanup completed'));
}

/**
 * Show help information
 */
function showHelp(): void {
  console.log(chalk.yellow('\n❓ Help - UCP Memory Operations Demo'));
  console.log(chalk.blue('\nWhat is UCP?'));
  console.log(chalk.gray('UCP (Unified Context Protocol) is a memory system for AI coding assistants.'));
  console.log(chalk.gray('It allows you to store, search, and manage development context across sessions.'));
  
  console.log(chalk.blue('\nMemory Entry Types:'));
  console.log(chalk.gray('• TaskState: Track development tasks and progress'));
  console.log(chalk.gray('• CommitDelta: Record code changes and git commits'));
  console.log(chalk.gray('• ReasoningEntry: Store AI conversations and decisions'));
  console.log(chalk.gray('• SummaryCheckpoint: Compressed historical context'));
  console.log(chalk.gray('• BranchMeta: Branch-specific context and metadata'));
  
  console.log(chalk.blue('\nDemo Features:'));
  console.log(chalk.gray('• Create Sample Data: Generate example memory entries'));
  console.log(chalk.gray('• View All Memories: Browse all stored memories'));
  console.log(chalk.gray('• Search Memories: Find entries using various methods'));
  console.log(chalk.gray('• Update Progress: Modify task completion percentages'));
  console.log(chalk.gray('• Show Statistics: View analytics about your memories'));
  console.log(chalk.gray('• Clean Up Data: Remove demo entries'));
  
  console.log(chalk.blue('\nTips:'));
  console.log(chalk.gray('• Start with "Create Sample Data" to generate test entries'));
  console.log(chalk.gray('• Try semantic search to find contextually related memories'));
  console.log(chalk.gray('• Use tags to organize and categorize your memories'));
  console.log(chalk.gray('• Update task progress to track development work'));
  
  console.log(chalk.blue('\nNext Steps:'));
  console.log(chalk.gray('• Explore other examples in the examples/ directory'));
  console.log(chalk.gray('• Read the full documentation'));
  console.log(chalk.gray('• Try integrating UCP with your development workflow'));
}

/**
 * Get color for memory entry type
 */
function getTypeColor(type: string): (text: string) => string {
  const colorMap: Record<string, (text: string) => string> = {
    [MemoryEntryType.TASK_STATE]: chalk.green,
    [MemoryEntryType.COMMIT_DELTA]: chalk.blue,
    [MemoryEntryType.REASONING_ENTRY]: chalk.magenta,
    [MemoryEntryType.SUMMARY_CHECKPOINT]: chalk.yellow,
    [MemoryEntryType.BRANCH_META]: chalk.cyan
  };
  
  return colorMap[type] || chalk.gray;
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Main demo loop
 */
async function runDemo(): Promise<void> {
  console.log(chalk.bold.blue('🧠 UCP Memory Operations - Interactive Demo\n'));
  
  // Initialize state
  const state: DemoState = {
    client: createClient(),
    sampleEntries: [],
    isConnected: false
  };
  
  // Test connection
  const healthSpinner = ora('Testing server connection...').start();
  try {
    await state.client.health();
    state.isConnected = true;
    healthSpinner.succeed(chalk.green('Connected to UCP server'));
  } catch (error) {
    healthSpinner.fail(chalk.red('Failed to connect to UCP server'));
    console.log(chalk.red('Please ensure the UCP server is running at'), chalk.blue(CONFIG.serverUrl));
    console.log(chalk.gray('Run: pnpm dev (from project root)'));
    process.exit(1);
  }
  
  // Main menu loop
  let running = true;
  while (running) {
    console.log(chalk.blue('\n🧠 UCP Memory Demo - Main Menu'));
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: MAIN_MENU_CHOICES
      }
    ]);
    
    try {
      switch (action) {
        case 'create-sample':
          await createSampleData(state);
          break;
        case 'view-all':
          await viewAllMemories(state);
          break;
        case 'search':
          await searchMemories(state);
          break;
        case 'update':
          await updateProgress(state);
          break;
        case 'stats':
          await showStatistics(state);
          break;
        case 'cleanup':
          await cleanupData(state);
          break;
        case 'help':
          showHelp();
          break;
        case 'exit':
          running = false;
          break;
      }
    } catch (error) {
      console.error(chalk.red('\n❌ Operation failed:'), error);
    }
    
    if (running) {
      await inquirer.prompt([
        {
          type: 'input',
          name: 'continue',
          message: 'Press Enter to continue...'
        }
      ]);
    }
  }
  
  console.log(chalk.green('\n👋 Thanks for trying the UCP Memory Demo!'));
  console.log(chalk.gray('Explore more examples in the examples/ directory'));
}

// Run demo if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runDemo().catch(console.error);
}

export { runDemo };