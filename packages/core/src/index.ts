/**
 * @fileoverview Core Unified Context Protocol (UCP) library
 * 
 * This package provides the core types, protocols, and validation
 * for the Unified Context Protocol - a standardized memory fabric
 * for AI coding assistants.
 */

// Export all types
export * from './types/index.js';

// Export protocol implementations
export * from './protocol/index.js';

// Export validation utilities
export * from './validation/index.js';

// Export version information
export const VERSION = '0.1.0';
export const PROTOCOL_VERSION = '1.0.0';

/**
 * UCP Core Configuration
 */
export interface UCPConfig {
  /** Protocol version to use */
  protocolVersion: string;
  /** Maximum memory entries per project */
  maxMemoryEntries: number;
  /** Memory retention period in days */
  retentionDays: number;
  /** Enable debug logging */
  debug: boolean;
}

/**
 * Default UCP configuration
 */
export const DEFAULT_CONFIG: UCPConfig = {
  protocolVersion: PROTOCOL_VERSION,
  maxMemoryEntries: 10000,
  retentionDays: 90,
  debug: false,
};