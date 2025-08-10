/**
 * @fileoverview Validation utilities for UCP
 */

import { z } from 'zod';

import {
  MemoryEntrySchema,
  TaskStateSchema,
  CommitDeltaSchema,
  ReasoningEntrySchema,
  SummaryCheckpointSchema,
  BranchMetaSchema,
  MemoryEntryType,
  type MemoryEntry,
} from '../types/index.js';

/**
 * Validation result
 */
export interface ValidationResult<T = unknown> {
  /** Validation success status */
  success: boolean;
  /** Validated data if successful */
  data?: T;
  /** Validation errors */
  errors?: ValidationError[];
}

/**
 * Validation error
 */
export interface ValidationError {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Field path that caused the error */
  path?: string[];
  /** Additional error context */
  context?: Record<string, unknown>;
}

/**
 * Memory entry validator
 */
export class MemoryEntryValidator {
  /**
   * Validate a memory entry
   */
  static validate(entry: unknown): ValidationResult<MemoryEntry> {
    try {
      const validated = MemoryEntrySchema.parse(entry);
      return {
        success: true,
        data: validated,
      };
    } catch (error) {
      return {
        success: false,
        errors: this.parseZodError(error as z.ZodError),
      };
    }
  }

  /**
   * Validate a typed memory entry
   */
  static validateTyped(entry: unknown): ValidationResult<MemoryEntry> {
    const baseResult = this.validate(entry);
    if (!baseResult.success || !baseResult.data) {
      return baseResult;
    }

    const typedResult = this.validateByType(baseResult.data);
    return typedResult;
  }

  /**
   * Validate memory entry by its type
   */
  static validateByType(entry: MemoryEntry): ValidationResult<MemoryEntry> {
    try {
      let validated: MemoryEntry;

      switch (entry.type) {
        case MemoryEntryType.TASK_STATE:
          validated = TaskStateSchema.parse(entry);
          break;
        case MemoryEntryType.COMMIT_DELTA:
          validated = CommitDeltaSchema.parse(entry);
          break;
        case MemoryEntryType.REASONING_ENTRY:
          validated = ReasoningEntrySchema.parse(entry);
          break;
        case MemoryEntryType.SUMMARY_CHECKPOINT:
          validated = SummaryCheckpointSchema.parse(entry);
          break;
        case MemoryEntryType.BRANCH_META:
          validated = BranchMetaSchema.parse(entry);
          break;
        default:
          return {
            success: false,
            errors: [
              {
                code: 'INVALID_TYPE',
                message: `Unknown memory entry type: ${entry.type}`,
                path: ['type'],
              },
            ],
          };
      }

      return {
        success: true,
        data: validated,
      };
    } catch (error) {
      return {
        success: false,
        errors: this.parseZodError(error as z.ZodError),
      };
    }
  }

  /**
   * Parse Zod validation errors
   */
  private static parseZodError(error: z.ZodError): ValidationError[] {
    return error.errors.map(err => ({
      code: err.code,
      message: err.message,
      path: err.path.map(String),
      context: {
        received: err.received,
        expected: err.expected,
      },
    }));
  }
}

/**
 * Project name validator
 */
export class ProjectValidator {
  private static readonly PROJECT_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;
  private static readonly MAX_LENGTH = 100;
  private static readonly MIN_LENGTH = 1;

  /**
   * Validate project name
   */
  static validate(projectName: string): ValidationResult<string> {
    const errors: ValidationError[] = [];

    if (projectName.length < this.MIN_LENGTH) {
      errors.push({
        code: 'TOO_SHORT',
        message: `Project name must be at least ${this.MIN_LENGTH} character(s)`,
      });
    }

    if (projectName.length > this.MAX_LENGTH) {
      errors.push({
        code: 'TOO_LONG',
        message: `Project name must be at most ${this.MAX_LENGTH} characters`,
      });
    }

    if (!this.PROJECT_NAME_REGEX.test(projectName)) {
      errors.push({
        code: 'INVALID_FORMAT',
        message: 'Project name can only contain letters, numbers, underscores, and hyphens',
      });
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    return {
      success: true,
      data: projectName,
    };
  }
}

/**
 * Branch name validator
 */
export class BranchValidator {
  private static readonly BRANCH_NAME_REGEX = /^[a-zA-Z0-9/_-]+$/;
  private static readonly MAX_LENGTH = 250;
  private static readonly MIN_LENGTH = 1;

  /**
   * Validate branch name
   */
  static validate(branchName: string): ValidationResult<string> {
    const errors: ValidationError[] = [];

    if (branchName.length < this.MIN_LENGTH) {
      errors.push({
        code: 'TOO_SHORT',
        message: `Branch name must be at least ${this.MIN_LENGTH} character(s)`,
      });
    }

    if (branchName.length > this.MAX_LENGTH) {
      errors.push({
        code: 'TOO_LONG',
        message: `Branch name must be at most ${this.MAX_LENGTH} characters`,
      });
    }

    if (!this.BRANCH_NAME_REGEX.test(branchName)) {
      errors.push({
        code: 'INVALID_FORMAT',
        message: 'Branch name contains invalid characters',
      });
    }

    if (branchName.startsWith('/') || branchName.endsWith('/')) {
      errors.push({
        code: 'INVALID_FORMAT',
        message: 'Branch name cannot start or end with a slash',
      });
    }

    if (branchName.includes('//')) {
      errors.push({
        code: 'INVALID_FORMAT',
        message: 'Branch name cannot contain consecutive slashes',
      });
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    return {
      success: true,
      data: branchName,
    };
  }
}

/**
 * Content size validator
 */
export class ContentSizeValidator {
  private static readonly MAX_CONTENT_SIZE = 1024 * 1024; // 1MB
  private static readonly MAX_STRING_LENGTH = 100000; // 100k characters

  /**
   * Validate content size
   */
  static validate(content: unknown): ValidationResult<unknown> {
    const errors: ValidationError[] = [];

    const serialized = JSON.stringify(content);
    const sizeInBytes = new TextEncoder().encode(serialized).length;

    if (sizeInBytes > this.MAX_CONTENT_SIZE) {
      errors.push({
        code: 'CONTENT_TOO_LARGE',
        message: `Content size (${sizeInBytes} bytes) exceeds maximum allowed size (${this.MAX_CONTENT_SIZE} bytes)`,
      });
    }

    // Check string length for text content
    if (typeof content === 'string' && content.length > this.MAX_STRING_LENGTH) {
      errors.push({
        code: 'STRING_TOO_LONG',
        message: `String length (${content.length}) exceeds maximum allowed length (${this.MAX_STRING_LENGTH})`,
      });
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    return {
      success: true,
      data: content,
    };
  }
}

/**
 * Embedding validator
 */
export class EmbeddingValidator {
  private static readonly SUPPORTED_DIMENSIONS = [384, 512, 768, 1024, 1536];

  /**
   * Validate embedding vector
   */
  static validate(embedding: number[]): ValidationResult<number[]> {
    const errors: ValidationError[] = [];

    if (!Array.isArray(embedding)) {
      errors.push({
        code: 'INVALID_TYPE',
        message: 'Embedding must be an array of numbers',
      });
      return { success: false, errors };
    }

    if (embedding.length === 0) {
      errors.push({
        code: 'EMPTY_EMBEDDING',
        message: 'Embedding cannot be empty',
      });
    }

    if (!this.SUPPORTED_DIMENSIONS.includes(embedding.length)) {
      errors.push({
        code: 'INVALID_DIMENSION',
        message: `Embedding dimension (${embedding.length}) is not supported. Supported dimensions: ${this.SUPPORTED_DIMENSIONS.join(', ')}`,
      });
    }

    for (let i = 0; i < embedding.length; i++) {
      const value = embedding[i];
      if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
        errors.push({
          code: 'INVALID_VALUE',
          message: `Embedding value at index ${i} is not a valid number`,
          path: [String(i)],
        });
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    return {
      success: true,
      data: embedding,
    };
  }
}

/**
 * Combined validator for all UCP entities
 */
export class UCPValidator {
  /**
   * Validate memory entry with all checks
   */
  static validateMemoryEntry(entry: unknown): ValidationResult<MemoryEntry> {
    // First validate the basic structure
    const structureResult = MemoryEntryValidator.validateTyped(entry);
    if (!structureResult.success || !structureResult.data) {
      return structureResult;
    }

    const validatedEntry = structureResult.data;
    const errors: ValidationError[] = [];

    // Validate project name
    const projectResult = ProjectValidator.validate(validatedEntry.project);
    if (!projectResult.success) {
      errors.push(...(projectResult.errors || []));
    }

    // Validate branch name
    const branchResult = BranchValidator.validate(validatedEntry.branch);
    if (!branchResult.success) {
      errors.push(...(branchResult.errors || []));
    }

    // Validate content size
    const contentResult = ContentSizeValidator.validate(validatedEntry.content);
    if (!contentResult.success) {
      errors.push(...(contentResult.errors || []));
    }

    // Validate embedding if present
    if (validatedEntry.embedding) {
      const embeddingResult = EmbeddingValidator.validate(validatedEntry.embedding);
      if (!embeddingResult.success) {
        errors.push(...(embeddingResult.errors || []));
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
      };
    }

    return {
      success: true,
      data: validatedEntry,
    };
  }
}