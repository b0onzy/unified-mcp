/**
 * UCP Server Configuration
 */

import { ServerConfig } from '../index.js';

export const config: ServerConfig = {
  port: parseInt(process.env.UCP_PORT || '3000'),
  host: process.env.UCP_HOST || '0.0.0.0',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'ucp',
    username: process.env.DB_USER || 'ucp',
    password: process.env.DB_PASSWORD || 'ucp'
  },

  vector: {
    provider: (process.env.VECTOR_PROVIDER as 'pgvector' | 'chromadb' | 'qdrant') || 'pgvector',
    config: {
      // Provider-specific configuration
      dimensions: parseInt(process.env.VECTOR_DIMENSIONS || '384'),
      similarityThreshold: parseFloat(process.env.SIMILARITY_THRESHOLD || '0.7')
    }
  },

  mcp: {
    enabled: process.env.MCP_ENABLED === 'true',
    transport: (process.env.MCP_TRANSPORT as 'stdio' | 'websocket') || 'stdio',
    port: process.env.MCP_PORT ? parseInt(process.env.MCP_PORT) : undefined
  }
};

export default config;