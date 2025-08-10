/**
 * @fileoverview Protocol implementations for UCP
 */

import type {
  MemoryEntry,
  MemoryQueryOptions,
  MemoryOperationResult,
} from '../types/index.js';

/**
 * UCP Protocol interface - defines the contract for memory operations
 */
export interface UCPProtocol {
  /**
   * Store a memory entry
   */
  store(entry: MemoryEntry): Promise<MemoryOperationResult<MemoryEntry>>;

  /**
   * Retrieve memory entries by query
   */
  retrieve(options: MemoryQueryOptions): Promise<MemoryOperationResult<MemoryEntry[]>>;

  /**
   * Update an existing memory entry
   */
  update(id: string, entry: Partial<MemoryEntry>): Promise<MemoryOperationResult<MemoryEntry>>;

  /**
   * Delete a memory entry
   */
  delete(id: string): Promise<MemoryOperationResult<void>>;

  /**
   * Search for memory entries using semantic similarity
   */
  search(query: string, options?: MemoryQueryOptions): Promise<MemoryOperationResult<MemoryEntry[]>>;

  /**
   * Get memory statistics
   */
  getStats(project?: string): Promise<MemoryOperationResult<MemoryStats>>;

  /**
   * Archive old memory entries
   */
  archive(options: ArchiveOptions): Promise<MemoryOperationResult<number>>;

  /**
   * Create a summary checkpoint
   */
  createCheckpoint(project: string, branch: string): Promise<MemoryOperationResult<MemoryEntry>>;
}

/**
 * Memory statistics
 */
export interface MemoryStats {
  /** Total number of entries */
  totalEntries: number;
  /** Entries by type */
  entriesByType: Record<string, number>;
  /** Storage size in bytes */
  storageSize: number;
  /** Average entry size */
  averageEntrySize: number;
  /** Oldest entry timestamp */
  oldestEntry?: string;
  /** Newest entry timestamp */
  newestEntry?: string;
  /** Most active project */
  mostActiveProject?: string;
  /** Most active branch */
  mostActiveBranch?: string;
}

/**
 * Archive options
 */
export interface ArchiveOptions {
  /** Archive entries older than this date */
  olderThan: Date;
  /** Archive entries for specific project */
  project?: string;
  /** Archive entries for specific branch */
  branch?: string;
  /** Dry run - don't actually archive */
  dryRun?: boolean;
}

/**
 * MCP (Model Context Protocol) integration interface
 */
export interface MCPIntegration {
  /**
   * Initialize MCP server
   */
  initialize(): Promise<void>;

  /**
   * Handle MCP request
   */
  handleRequest(request: MCPRequest): Promise<MCPResponse>;

  /**
   * Shutdown MCP server
   */
  shutdown(): Promise<void>;
}

/**
 * MCP Request structure
 */
export interface MCPRequest {
  /** Request ID */
  id: string;
  /** Request method */
  method: string;
  /** Request parameters */
  params?: Record<string, unknown>;
}

/**
 * MCP Response structure
 */
export interface MCPResponse {
  /** Request ID */
  id: string;
  /** Response result */
  result?: unknown;
  /** Error information */
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/**
 * Git integration interface
 */
export interface GitIntegration {
  /**
   * Initialize Git hooks
   */
  initializeHooks(repoPath: string): Promise<void>;

  /**
   * Handle pre-commit hook
   */
  onPreCommit(files: string[]): Promise<void>;

  /**
   * Handle post-commit hook
   */
  onPostCommit(commitHash: string): Promise<void>;

  /**
   * Handle branch switch
   */
  onBranchSwitch(fromBranch: string, toBranch: string): Promise<void>;

  /**
   * Handle merge
   */
  onMerge(fromBranch: string, toBranch: string): Promise<void>;
}

/**
 * Vector database interface
 */
export interface VectorDatabase {
  /**
   * Store vector with metadata
   */
  store(id: string, vector: number[], metadata: Record<string, unknown>): Promise<void>;

  /**
   * Search for similar vectors
   */
  search(query: number[], limit: number, threshold?: number): Promise<VectorSearchResult[]>;

  /**
   * Update vector
   */
  update(id: string, vector: number[], metadata?: Record<string, unknown>): Promise<void>;

  /**
   * Delete vector
   */
  delete(id: string): Promise<void>;

  /**
   * Get database statistics
   */
  getStats(): Promise<VectorDatabaseStats>;
}

/**
 * Vector search result
 */
export interface VectorSearchResult {
  /** Entry ID */
  id: string;
  /** Similarity score */
  score: number;
  /** Associated metadata */
  metadata: Record<string, unknown>;
}

/**
 * Vector database statistics
 */
export interface VectorDatabaseStats {
  /** Total number of vectors */
  totalVectors: number;
  /** Vector dimension */
  dimension: number;
  /** Database size in bytes */
  size: number;
  /** Index type */
  indexType: string;
}

/**
 * Embedding generation interface
 */
export interface EmbeddingGenerator {
  /**
   * Generate embedding for text
   */
  generateEmbedding(text: string): Promise<number[]>;

  /**
   * Generate embeddings for multiple texts
   */
  generateEmbeddings(texts: string[]): Promise<number[][]>;

  /**
   * Get embedding dimension
   */
  getDimension(): number;

  /**
   * Get model name
   */
  getModelName(): string;
}

/**
 * Cache interface for performance optimization
 */
export interface CacheInterface {
  /**
   * Get value from cache
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set value in cache
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Delete value from cache
   */
  delete(key: string): Promise<void>;

  /**
   * Clear all cache
   */
  clear(): Promise<void>;

  /**
   * Get cache statistics
   */
  getStats(): Promise<CacheStats>;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /** Number of cached items */
  itemCount: number;
  /** Cache hit rate */
  hitRate: number;
  /** Cache miss rate */
  missRate: number;
  /** Memory usage in bytes */
  memoryUsage: number;
}