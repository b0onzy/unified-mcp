/**
 * @fileoverview Core type definitions for the Unified Context Protocol
 */

import { z } from 'zod';

/**
 * Memory entry types supported by UCP
 */
export enum MemoryEntryType {
  /** Current work context, goals, and progress */
  TASK_STATE = 'TaskState',
  /** Code changes with semantic analysis */
  COMMIT_DELTA = 'CommitDelta',
  /** AI conversations and decision rationale */
  REASONING_ENTRY = 'ReasoningEntry',
  /** Compressed historical context */
  SUMMARY_CHECKPOINT = 'SummaryCheckpoint',
  /** Branch-specific context and relationships */
  BRANCH_META = 'BranchMeta',
}

/**
 * Memory entry status values
 */
export enum MemoryEntryStatus {
  /** Entry is being created/modified */
  DRAFT = 'draft',
  /** Entry has been validated and stored */
  VERIFIED = 'verified',
  /** Entry has been archived for historical reference */
  ARCHIVED = 'archived',
}

/**
 * Base schema for all memory entries
 */
export const MemoryEntrySchema = z.object({
  /** Unique identifier for the memory entry */
  id: z.string().uuid(),
  /** Type of memory entry */
  type: z.nativeEnum(MemoryEntryType),
  /** Project identifier */
  project: z.string().min(1),
  /** Associated task ID (optional) */
  taskId: z.string().nullable(),
  /** Git branch name */
  branch: z.string().min(1),
  /** ISO 8601 timestamp */
  timestamp: z.string().datetime(),
  /** Entry status */
  status: z.nativeEnum(MemoryEntryStatus),
  /** Entry-specific content */
  content: z.record(z.unknown()),
  /** Optional metadata */
  metadata: z.record(z.unknown()).optional(),
  /** Vector embedding for semantic search */
  embedding: z.array(z.number()).optional(),
  /** Tags for categorization */
  tags: z.array(z.string()).optional(),
});

/**
 * Base memory entry type
 */
export type MemoryEntry = z.infer<typeof MemoryEntrySchema>;

/**
 * Task state content schema
 */
export const TaskStateContentSchema = z.object({
  /** Current task description */
  description: z.string(),
  /** Task goals and objectives */
  goals: z.array(z.string()),
  /** Current progress percentage (0-100) */
  progress: z.number().min(0).max(100),
  /** Current context and state */
  context: z.record(z.unknown()),
  /** Active file paths */
  activeFiles: z.array(z.string()),
  /** Current working directory */
  workingDirectory: z.string(),
  /** Dependencies and requirements */
  dependencies: z.array(z.string()).optional(),
  /** Blockers and issues */
  blockers: z.array(z.string()).optional(),
});

/**
 * Task state memory entry
 */
export const TaskStateSchema = MemoryEntrySchema.extend({
  type: z.literal(MemoryEntryType.TASK_STATE),
  content: TaskStateContentSchema,
});

export type TaskState = z.infer<typeof TaskStateSchema>;

/**
 * Commit delta content schema
 */
export const CommitDeltaContentSchema = z.object({
  /** Git commit hash */
  commitHash: z.string(),
  /** Commit message */
  message: z.string(),
  /** Author information */
  author: z.object({
    name: z.string(),
    email: z.string(),
  }),
  /** Changed files */
  files: z.array(z.object({
    path: z.string(),
    action: z.enum(['added', 'modified', 'deleted', 'renamed']),
    linesAdded: z.number().optional(),
    linesDeleted: z.number().optional(),
  })),
  /** Semantic analysis of changes */
  semantic: z.object({
    /** Function/method changes */
    functions: z.array(z.string()).optional(),
    /** Class changes */
    classes: z.array(z.string()).optional(),
    /** Import changes */
    imports: z.array(z.string()).optional(),
    /** Configuration changes */
    configs: z.array(z.string()).optional(),
  }).optional(),
});

/**
 * Commit delta memory entry
 */
export const CommitDeltaSchema = MemoryEntrySchema.extend({
  type: z.literal(MemoryEntryType.COMMIT_DELTA),
  content: CommitDeltaContentSchema,
});

export type CommitDelta = z.infer<typeof CommitDeltaSchema>;

/**
 * Reasoning entry content schema
 */
export const ReasoningEntryContentSchema = z.object({
  /** Conversation thread ID */
  threadId: z.string(),
  /** AI model used */
  model: z.string(),
  /** User query or prompt */
  query: z.string(),
  /** AI response */
  response: z.string(),
  /** Decision rationale */
  reasoning: z.string().optional(),
  /** Code snippets referenced */
  codeRefs: z.array(z.object({
    file: z.string(),
    lines: z.tuple([z.number(), z.number()]).optional(),
    content: z.string().optional(),
  })).optional(),
  /** Follow-up actions */
  actions: z.array(z.string()).optional(),
});

/**
 * Reasoning entry memory entry
 */
export const ReasoningEntrySchema = MemoryEntrySchema.extend({
  type: z.literal(MemoryEntryType.REASONING_ENTRY),
  content: ReasoningEntryContentSchema,
});

export type ReasoningEntry = z.infer<typeof ReasoningEntrySchema>;

/**
 * Summary checkpoint content schema
 */
export const SummaryCheckpointContentSchema = z.object({
  /** Time period summarized */
  period: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  /** Summary text */
  summary: z.string(),
  /** Key achievements */
  achievements: z.array(z.string()),
  /** Key decisions made */
  decisions: z.array(z.string()),
  /** Technical debt identified */
  technicalDebt: z.array(z.string()).optional(),
  /** Metrics and statistics */
  metrics: z.record(z.number()).optional(),
  /** Compressed memory entries */
  compressedEntries: z.array(z.string()).optional(),
});

/**
 * Summary checkpoint memory entry
 */
export const SummaryCheckpointSchema = MemoryEntrySchema.extend({
  type: z.literal(MemoryEntryType.SUMMARY_CHECKPOINT),
  content: SummaryCheckpointContentSchema,
});

export type SummaryCheckpoint = z.infer<typeof SummaryCheckpointSchema>;

/**
 * Branch meta content schema
 */
export const BranchMetaContentSchema = z.object({
  /** Branch purpose and description */
  purpose: z.string(),
  /** Parent branch */
  parentBranch: z.string(),
  /** Child branches */
  childBranches: z.array(z.string()).optional(),
  /** Branch creation timestamp */
  createdAt: z.string().datetime(),
  /** Expected merge timestamp */
  mergeTarget: z.string().datetime().optional(),
  /** Feature flags */
  featureFlags: z.array(z.string()).optional(),
  /** Environment-specific context */
  environment: z.enum(['development', 'staging', 'production']).optional(),
  /** Related branches */
  relatedBranches: z.array(z.string()).optional(),
});

/**
 * Branch meta memory entry
 */
export const BranchMetaSchema = MemoryEntrySchema.extend({
  type: z.literal(MemoryEntryType.BRANCH_META),
  content: BranchMetaContentSchema,
});

export type BranchMeta = z.infer<typeof BranchMetaSchema>;

/**
 * Query options for memory retrieval
 */
export interface MemoryQueryOptions {
  /** Limit number of results */
  limit?: number;
  /** Offset for pagination */
  offset?: number;
  /** Filter by entry type */
  type?: MemoryEntryType;
  /** Filter by project */
  project?: string;
  /** Filter by branch */
  branch?: string;
  /** Filter by date range */
  dateRange?: {
    start: Date;
    end: Date;
  };
  /** Semantic search query */
  semanticQuery?: string;
  /** Semantic search threshold */
  semanticThreshold?: number;
  /** Include archived entries */
  includeArchived?: boolean;
  /** Sort order */
  sortBy?: 'timestamp' | 'relevance';
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Memory operation result
 */
export interface MemoryOperationResult<T = MemoryEntry> {
  /** Operation success status */
  success: boolean;
  /** Result data */
  data?: T;
  /** Error message if operation failed */
  error?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}