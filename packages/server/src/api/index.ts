/**
 * REST API Setup
 * Configures all REST endpoints for the UCP server
 */

import type { FastifyInstance } from 'fastify';
import type { DatabaseService } from '../services/database.js';
import type { VectorService } from '../services/vector.js';

export interface APIServices {
  database: DatabaseService;
  vector: VectorService;
}

export async function setupAPI(app: FastifyInstance, services: APIServices): Promise<void> {
  const { database, vector } = services;

  // Memory endpoints
  app.register(async function memoryRoutes(fastify) {
    // Store memory
    fastify.post('/api/v1/memory', async (request, reply) => {
      const { content, metadata } = request.body as { content: string; metadata?: Record<string, any> };
      
      if (!content) {
        return reply.status(400).send({ error: 'Content is required' });
      }

      try {
        // Generate embedding for the content
        const embedding = await vector.generateEmbedding(content);
        
        // Store in database
        const memory = await database.storeMemory({
          content,
          metadata,
          embedding
        });

        // Store vector
        await vector.storeVector(memory.id, embedding, { ...metadata, content });

        return { 
          success: true, 
          data: {
            id: memory.id,
            content: memory.content,
            metadata: memory.metadata,
            createdAt: memory.createdAt
          }
        };
      } catch (error) {
        return reply.status(500).send({ error: 'Failed to store memory' });
      }
    });

    // Get memory by ID
    fastify.get('/api/v1/memory/:id', async (request, reply) => {
      const { id } = request.params as { id: string };
      
      try {
        const memory = await database.getMemory(id);
        if (!memory) {
          return reply.status(404).send({ error: 'Memory not found' });
        }

        return { 
          success: true, 
          data: {
            id: memory.id,
            content: memory.content,
            metadata: memory.metadata,
            createdAt: memory.createdAt,
            updatedAt: memory.updatedAt
          }
        };
      } catch (error) {
        return reply.status(500).send({ error: 'Failed to retrieve memory' });
      }
    });

    // Search memories
    fastify.post('/api/v1/search', async (request, reply) => {
      const { query, limit = 10, threshold = 0.7 } = request.body as { 
        query: string; 
        limit?: number; 
        threshold?: number; 
      };
      
      if (!query) {
        return reply.status(400).send({ error: 'Query is required' });
      }

      try {
        const results = await vector.searchSimilar(query, limit, threshold);
        return { 
          success: true, 
          data: results.map(result => ({
            id: result.id,
            score: result.score,
            content: result.metadata?.content,
            metadata: result.metadata
          }))
        };
      } catch (error) {
        return reply.status(500).send({ error: 'Search failed' });
      }
    });

    // List memories
    fastify.get('/api/v1/memories', async (request, reply) => {
      const { offset = 0, limit = 10 } = request.query as { offset?: number; limit?: number };
      
      try {
        const memories = await database.listMemories(offset, limit);
        return { 
          success: true, 
          data: memories.map(memory => ({
            id: memory.id,
            content: memory.content,
            metadata: memory.metadata,
            createdAt: memory.createdAt,
            updatedAt: memory.updatedAt
          }))
        };
      } catch (error) {
        return reply.status(500).send({ error: 'Failed to list memories' });
      }
    });

    // Delete memory
    fastify.delete('/api/v1/memory/:id', async (request, reply) => {
      const { id } = request.params as { id: string };
      
      try {
        const deleted = await database.deleteMemory(id);
        await vector.deleteVector(id);
        
        if (!deleted) {
          return reply.status(404).send({ error: 'Memory not found' });
        }

        return { success: true, message: 'Memory deleted' };
      } catch (error) {
        return reply.status(500).send({ error: 'Failed to delete memory' });
      }
    });
  });
}