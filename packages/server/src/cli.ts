#!/usr/bin/env node

/**
 * UCP Server CLI
 * Command-line interface for starting and managing the UCP server
 */

import { Command } from 'commander';
import { UCPServer } from './index.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';

const program = new Command();

program
  .name('ucp-server')
  .description('Unified Context Protocol Server')
  .version('0.1.0');

program
  .command('start')
  .description('Start the UCP server')
  .option('-p, --port <port>', 'Server port', '3000')
  .option('-h, --host <host>', 'Server host', '0.0.0.0')
  .option('--db-host <host>', 'Database host', 'localhost')
  .option('--db-port <port>', 'Database port', '5432')
  .option('--db-name <name>', 'Database name', 'ucp')
  .option('--db-user <user>', 'Database user', 'ucp')
  .option('--db-password <password>', 'Database password', 'ucp')
  .option('--vector-provider <provider>', 'Vector provider (pgvector|chromadb|qdrant)', 'pgvector')
  .option('--mcp-enabled', 'Enable MCP server', false)
  .option('--mcp-transport <transport>', 'MCP transport (stdio|websocket)', 'stdio')
  .option('--mcp-port <port>', 'MCP websocket port')
  .action(async (options) => {
    const serverConfig = {
      ...config,
      port: parseInt(options.port),
      host: options.host,
      database: {
        ...config.database,
        host: options.dbHost || config.database.host,
        port: parseInt(options.dbPort) || config.database.port,
        database: options.dbName || config.database.database,
        username: options.dbUser || config.database.username,
        password: options.dbPassword || config.database.password,
      },
      vector: {
        ...config.vector,
        provider: options.vectorProvider || config.vector.provider,
      },
      mcp: {
        ...config.mcp,
        enabled: options.mcpEnabled || config.mcp.enabled,
        transport: options.mcpTransport || config.mcp.transport,
        port: options.mcpPort ? parseInt(options.mcpPort) : config.mcp.port,
      },
    };

    const server = new UCPServer(serverConfig);
    
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

    try {
      await server.start();
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  });

program
  .command('health')
  .description('Check server health')
  .option('-u, --url <url>', 'Server URL', 'http://localhost:3000')
  .action(async (options) => {
    try {
      const response = await fetch(`${options.url}/health`);
      const health = await response.json();
      
      console.log('Server health:', JSON.stringify(health, null, 2));
      
      if (health.services?.database === 'unhealthy' || health.services?.vector === 'unhealthy') {
        process.exit(1);
      }
    } catch (error) {
      logger.error('Health check failed:', error);
      process.exit(1);
    }
  });

program.parse();