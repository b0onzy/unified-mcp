/**
 * UCP Server - Main Entry Point
 * 
 * Unified Context Protocol server providing memory storage and retrieval
 * for AI agents with both REST API and MCP protocol support.
 */

import { fastify } from 'fastify';
import { config } from './config/index.js';
import { setupAPI } from './api/index.js';
import { setupMCP } from './mcp/index.js';
import { DatabaseService } from './services/database.js';
import { VectorService } from './services/vector.js';
import { logger } from './utils/logger.js';

export interface ServerConfig {
  port: number;
  host: string;
  database: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  };
  vector: {
    provider: 'pgvector' | 'chromadb' | 'qdrant';
    config: Record<string, any>;
  };
  mcp: {
    enabled: boolean;
    transport: 'stdio' | 'websocket';
    port?: number;
  };
}

export class UCPServer {
  private app: ReturnType<typeof fastify>;
  private databaseService: DatabaseService;
  private vectorService: VectorService;
  private config: ServerConfig;

  constructor(serverConfig: ServerConfig) {
    this.config = serverConfig;
    this.app = fastify({ 
      logger: logger,
      disableRequestLogging: false 
    });
    this.databaseService = new DatabaseService(serverConfig.database);
    this.vectorService = new VectorService(serverConfig.vector);
  }

  async start(): Promise<void> {
    try {
      // Initialize database connection
      await this.databaseService.connect();
      logger.info('Database connected successfully');

      // Initialize vector service
      await this.vectorService.initialize();
      logger.info('Vector service initialized');

      // Setup CORS
      await this.app.register(import('@fastify/cors'), {
        origin: true,
        credentials: true
      });

      // Setup Swagger documentation
      await this.app.register(import('@fastify/swagger'), {
        swagger: {
          info: {
            title: 'Unified Context Protocol API',
            description: 'Memory fabric for AI agents',
            version: '0.1.0'
          },
          host: `${this.config.host}:${this.config.port}`,
          schemes: ['http'],
          consumes: ['application/json'],
          produces: ['application/json']
        }
      });

      // Setup API routes
      await setupAPI(this.app, {
        database: this.databaseService,
        vector: this.vectorService
      });

      // Setup MCP server if enabled
      if (this.config.mcp.enabled) {
        await setupMCP({
          database: this.databaseService,
          vector: this.vectorService,
          transport: this.config.mcp.transport,
          port: this.config.mcp.port
        });
        logger.info('MCP server initialized');
      }

      // Health check endpoint
      this.app.get('/health', async () => {
        const dbHealth = await this.databaseService.healthCheck();
        const vectorHealth = await this.vectorService.healthCheck();
        
        return {
          status: 'ok',
          timestamp: new Date().toISOString(),
          services: {
            database: dbHealth ? 'healthy' : 'unhealthy',
            vector: vectorHealth ? 'healthy' : 'unhealthy'
          }
        };
      });

      // Start the server
      await this.app.listen({
        host: this.config.host,
        port: this.config.port
      });

      logger.info(`UCP Server running on ${this.config.host}:${this.config.port}`);
      
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  async stop(): Promise<void> {
    try {
      await this.app.close();
      await this.databaseService.disconnect();
      await this.vectorService.disconnect();
      logger.info('Server stopped gracefully');
    } catch (error) {
      logger.error('Error stopping server:', error);
    }
  }
}

// Start server if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new UCPServer(config);
  
  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully');
    await server.stop();
    process.exit(0);
  });

  server.start().catch(error => {
    logger.error('Failed to start server:', error);
    process.exit(1);
  });
}

export { setupAPI, setupMCP, DatabaseService, VectorService };