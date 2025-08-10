# Multi-Model AI Integration

**Difficulty:** Advanced  
**Time:** 30 minutes  
**Prerequisites:** Unified-MCP server, API keys for AI providers

Demonstrates how to integrate Unified-MCP with multiple AI models and manage context across different AI providers while maintaining consistent memory.

## 🎯 What You'll Learn

- Integrating UCP with multiple AI models simultaneously
- Converting context between different model formats
- Managing model-specific optimizations and capabilities
- Building a unified AI interface with persistent memory
- Handling model failures and fallbacks
- Cost optimization across different providers

## 📋 Prerequisites

```bash
# Ensure Unified-MCP server is running
cd ../../../
pnpm docker:up
pnpm dev

# Required API keys (set in .env.local)
# Example API key configuration
OPENAI_API_KEY=sk-...
OLLAMA_BASE_URL=http://localhost:11434  # If using Ollama
```

## 🚀 Quick Start

```bash
# Navigate to this example
cd examples/advanced/01-multi-model-ai

# Install dependencies
npm install

# Run basic multi-model example
npm start

# Run interactive AI comparison demo
npm run demo

# Run specific scenarios
npm run scenario:code-review      # Code review with multiple models
npm run scenario:debugging       # Debugging with AI assistance
npm run scenario:architecture    # Architecture decisions
```

## 📖 Code Walkthrough

### 1. Multi-Model Client Setup

```typescript
// src/multi-model-client.ts
import { UCPClient } from '@ucp/client-ts';
import { AnthropicClient } from '@anthropic-ai/sdk';
import { OpenAI } from 'openai';

interface AIModel {
  name: string;
  provider: 'anthropic' | 'openai' | 'ollama';
  client: any;
  capabilities: string[];
  costPerToken: number;
  maxTokens: number;
}

export class MultiModelAIClient {
  private ucp: UCPClient;
  private models: Map<string, AIModel> = new Map();
  
  constructor(ucpConfig: any) {
    this.ucp = new UCPClient(ucpConfig);
    this.initializeModels();
  }
  
  private initializeModels() {
    // Claude Sonnet - Best for reasoning and code
    if (process.env.ANTHROPIC_API_KEY) {
      this.models.set('claude-sonnet', {
        name: 'claude-3-sonnet-20240229',
        provider: 'anthropic',
        client: new AnthropicClient(),
        capabilities: ['reasoning', 'code', 'analysis'],
        costPerToken: 0.000003,
        maxTokens: 200000
      });
    }
    
    // GPT-4 - Strong general purpose
    if (process.env.OPENAI_API_KEY) {
      this.models.set('gpt-4', {
        name: 'gpt-4-turbo-preview',
        provider: 'openai',
        client: new OpenAI(),
        capabilities: ['general', 'code', 'creative'],
        costPerToken: 0.00001,
        maxTokens: 128000
      });
    }
    
    // Ollama Local - Free but limited
    if (process.env.OLLAMA_BASE_URL) {
      this.models.set('ollama-codellama', {
        name: 'codellama:13b',
        provider: 'ollama',
        client: { baseURL: process.env.OLLAMA_BASE_URL },
        capabilities: ['code', 'local'],
        costPerToken: 0,
        maxTokens: 4096
      });
    }
  }
  
  async askMultipleModels(
    question: string,
    context: any,
    models: string[] = ['claude-sonnet', 'gpt-4']
  ) {
    const responses = await Promise.allSettled(
      models.map(modelName => this.askSingleModel(question, context, modelName))
    );
    
    // Store all responses in UCP memory
    const reasoningEntry = await this.ucp.memory.create({
      type: 'ReasoningEntry',
      content: {
        threadId: `multi-model-${Date.now()}`,
        model: 'multi-model-comparison',
        query: question,
        responses: responses.map((result, index) => ({
          model: models[index],
          status: result.status,
          response: result.status === 'fulfilled' ? result.value : null,
          error: result.status === 'rejected' ? result.reason : null
        })),
        context,
        comparison: this.compareResponses(responses, models)
      },
      tags: ['multi-model', 'ai-comparison', 'reasoning']
    });
    
    return reasoningEntry;
  }
}
```

### 2. Context Optimization for Different Models

```typescript
// src/context-optimizer.ts
export class ContextOptimizer {
  /**
   * Optimize context for specific model capabilities and limits
   */
  static optimizeForModel(context: any, modelName: string): any {
    const optimizers = {
      'claude-sonnet': this.optimizeForClaude,
      'gpt-4': this.optimizeForGPT,
      'ollama-codellama': this.optimizeForOllama
    };
    
    const optimizer = optimizers[modelName as keyof typeof optimizers];
    return optimizer ? optimizer(context) : context;
  }
  
  private static optimizeForClaude(context: any): any {
    // Claude excels at detailed reasoning and structured thinking
    return {
      ...context,
      reasoning_approach: 'step_by_step',
      include_reasoning: true,
      structure: 'detailed',
      code_analysis: 'comprehensive'
    };
  }
  
  private static optimizeForGPT(context: any): any {
    // GPT-4 is strong at creative solutions and broad knowledge
    return {
      ...context,
      creativity_level: 'high',
      alternative_approaches: true,
      broad_context: true,
      examples: 'multiple'
    };
  }
  
  private static optimizeForOllama(context: any): any {
    // Local models need simpler, more focused prompts
    return {
      ...context,
      focus: 'narrow',
      complexity: 'low',
      examples: 'single',
      code_only: true
    };
  }
}
```

### 3. Intelligent Model Selection

```typescript
// src/model-selector.ts
export class ModelSelector {
  /**
   * Select best model based on task type, cost, and availability
   */
  static selectOptimalModel(
    taskType: string,
    priority: 'speed' | 'quality' | 'cost',
    availableModels: AIModel[]
  ): string {
    const taskCapabilities = {
      'code-review': ['code', 'analysis'],
      'debugging': ['reasoning', 'code'],
      'architecture': ['reasoning', 'analysis'],
      'refactoring': ['code', 'reasoning'],
      'documentation': ['general', 'creative'],
      'testing': ['code', 'analysis']
    };
    
    const requiredCaps = taskCapabilities[taskType as keyof typeof taskCapabilities] || ['general'];
    
    // Filter models by capability
    const capableModels = availableModels.filter(model =>
      requiredCaps.every(cap => model.capabilities.includes(cap))
    );
    
    if (capableModels.length === 0) {
      return availableModels[0]?.name || 'claude-sonnet';
    }
    
    // Select based on priority
    switch (priority) {
      case 'speed':
        return capableModels.sort((a, b) => a.maxTokens - b.maxTokens)[0].name;
      case 'quality':
        return capableModels.sort((a, b) => b.maxTokens - a.maxTokens)[0].name;
      case 'cost':
        return capableModels.sort((a, b) => a.costPerToken - b.costPerToken)[0].name;
      default:
        return capableModels[0].name;
    }
  }
  
  /**
   * Get fallback model if primary fails
   */
  static getFallbackModel(primaryModel: string, availableModels: AIModel[]): string {
    const fallbackOrder = {
      'claude-sonnet': ['gpt-4', 'ollama-codellama'],
      'gpt-4': ['claude-sonnet', 'ollama-codellama'],
      'ollama-codellama': ['claude-sonnet', 'gpt-4']
    };
    
    const fallbacks = fallbackOrder[primaryModel as keyof typeof fallbackOrder] || [];
    
    for (const fallback of fallbacks) {
      if (availableModels.some(m => m.name === fallback)) {
        return fallback;
      }
    }
    
    return availableModels[0]?.name || 'claude-sonnet';
  }
}
```

### 4. Code Review Scenario

```typescript
// src/scenarios/code-review.ts
export async function runCodeReviewScenario(multiModel: MultiModelAIClient) {
  console.log(chalk.yellow('\n🔍 Multi-Model Code Review Scenario'));
  
  // Sample code to review
  const codeToReview = `
  function processUserData(users) {
    var result = [];
    for (var i = 0; i < users.length; i++) {
      if (users[i].age >= 18) {
        result.push({
          name: users[i].name,
          email: users[i].email,
          status: 'adult'
        });
      }
    }
    return result;
  }
  `;
  
  // Get recent memory for context
  const recentMemories = await multiModel.ucp.memory.search('code review javascript', {
    limit: 5
  });
  
  const context = {
    code: codeToReview,
    language: 'javascript',
    focus: ['performance', 'security', 'best-practices'],
    recentMemories: recentMemories.map(r => r.entry.content)
  };
  
  // Ask multiple models for review
  const review = await multiModel.askMultipleModels(
    'Please review this JavaScript code for performance, security, and best practices. Provide specific suggestions for improvement.',
    context,
    ['claude-sonnet', 'gpt-4', 'ollama-codellama']
  );
  
  console.log(chalk.green('✅ Code review completed'));
  console.log(chalk.gray(`Memory entry: ${review.id}`));
  
  // Analyze consensus and differences
  const responses = review.content.responses;
  const suggestions = new Set();
  
  responses.forEach(response => {
    if (response.status === 'fulfilled' && response.response) {
      // Extract suggestions (simplified)
      if (response.response.includes('const') || response.response.includes('let')) {
        suggestions.add('Use const/let instead of var');
      }
      if (response.response.includes('map') || response.response.includes('filter')) {
        suggestions.add('Use array methods instead of loops');
      }
      if (response.response.includes('validation')) {
        suggestions.add('Add input validation');
      }
    }
  });
  
  console.log(chalk.blue('\n📝 Consensus Suggestions:'));
  suggestions.forEach(suggestion => {
    console.log(chalk.gray(`  • ${suggestion}`));
  });
  
  return review;
}
```

### 5. Debugging Assistant

```typescript
// src/scenarios/debugging.ts
export async function runDebuggingScenario(multiModel: MultiModelAIClient) {
  console.log(chalk.yellow('\n🐛 Multi-Model Debugging Scenario'));
  
  const bugReport = {
    error: 'TypeError: Cannot read property "length" of undefined',
    code: `
    function calculateAverage(numbers) {
      let sum = 0;
      for (let i = 0; i < numbers.length; i++) {
        sum += numbers[i];
      }
      return sum / numbers.length;
    }
    
    // This call causes the error
    const avg = calculateAverage(null);
    `,
    stackTrace: 'at calculateAverage:3:35\nat main:9:13',
    context: 'Function called with null instead of array'
  };
  
  // Get similar debugging sessions from memory
  const similarIssues = await multiModel.ucp.memory.search('TypeError undefined debugging', {
    limit: 3
  });
  
  const context = {
    bug: bugReport,
    similarIssues: similarIssues.map(r => r.entry.content),
    debuggingApproach: 'systematic'
  };
  
  // Use different models for different aspects
  const debuggingTasks = [
    {
      model: 'claude-sonnet',
      task: 'root-cause-analysis',
      question: 'Analyze the root cause of this error and explain why it happens.'
    },
    {
      model: 'gpt-4',
      task: 'solution-generation',
      question: 'Provide multiple solutions to fix this error, including defensive programming approaches.'
    },
    {
      model: 'ollama-codellama',
      task: 'code-fix',
      question: 'Write the corrected version of this function with proper error handling.'
    }
  ];
  
  const results = [];
  
  for (const task of debuggingTasks) {
    console.log(chalk.blue(`Running ${task.task} with ${task.model}...`));
    
    try {
      const result = await multiModel.askSingleModel(
        task.question,
        context,
        task.model
      );
      
      results.push({
        task: task.task,
        model: task.model,
        result
      });
      
      console.log(chalk.green(`✅ ${task.task} completed`));
    } catch (error) {
      console.log(chalk.red(`❌ ${task.task} failed: ${error}`));
    }
  }
  
  // Store comprehensive debugging session
  const debuggingSession = await multiModel.ucp.memory.create({
    type: 'ReasoningEntry',
    content: {
      threadId: `debugging-${Date.now()}`,
      model: 'multi-model-debugging',
      query: 'Debug TypeError: Cannot read property "length" of undefined',
      bugReport,
      analysisResults: results,
      resolution: 'Multi-model debugging approach completed',
      actions: [
        'Add null/undefined checks',
        'Implement defensive programming',
        'Add unit tests for edge cases'
      ]
    },
    tags: ['debugging', 'multi-model', 'TypeError', 'error-handling']
  });
  
  console.log(chalk.green('\n✅ Debugging session completed'));
  console.log(chalk.gray(`Memory entry: ${debuggingSession.id}`));
  
  return debuggingSession;
}
```

## 🎮 Interactive Multi-Model Demo

```bash
npm run demo
```

The interactive demo provides:

1. **Model Comparison** - Compare responses from different models
2. **Task-Specific Selection** - Let the system choose optimal models
3. **Cost Analysis** - Track usage costs across providers
4. **Fallback Testing** - Simulate model failures and fallbacks
5. **Context Optimization** - See how context is adapted per model

## 📊 Example Scenarios

### Scenario 1: Code Review with Consensus

```bash
npm run scenario:code-review
```

**What it does:**
- Submits code to multiple AI models for review
- Compares suggestions and identifies consensus
- Stores comprehensive review in UCP memory
- Tracks model performance and accuracy

**Expected Output:**
```
🔍 Multi-Model Code Review
✅ Claude Sonnet: Detailed analysis with security focus
✅ GPT-4: Creative alternatives with performance tips
⚠️  Ollama: Basic syntax suggestions
📝 Consensus: Use const/let, add validation, use array methods
```

### Scenario 2: Debugging with Specialized Roles

```bash
npm run scenario:debugging
```

**What it does:**
- Assigns specific debugging roles to different models
- Claude: Root cause analysis and reasoning
- GPT-4: Solution generation and alternatives
- Ollama: Code fixes and implementation
- Combines insights into comprehensive solution

**Expected Output:**
```
🐛 Multi-Model Debugging
🔍 Root Cause (Claude): Null input validation missing
💡 Solutions (GPT-4): 3 defensive programming approaches
🔧 Fix (Ollama): Corrected function with null checks
✅ Comprehensive debugging session stored
```

### Scenario 3: Architecture Decisions

```bash
npm run scenario:architecture
```

**What it does:**
- Evaluates architectural decisions with multiple perspectives
- Compares trade-offs and recommendations
- Builds knowledge base of architectural patterns
- Tracks decision rationale over time

## 🔧 Configuration Options

### Model Priority Configuration

```typescript
// config/models.ts
export const MODEL_CONFIG = {
  // Example configuration for AI models
  // Add your preferred model configurations here
  preferences: {
    'code-review': {
      primary: 'claude-sonnet',
      fallback: 'gpt-4',
      local: 'ollama-codellama'
    },
    'debugging': {
      primary: 'claude-sonnet',
      fallback: 'gpt-4',
      fast: 'ollama-codellama'
    },
    'creative': {
      primary: 'gpt-4',
      fallback: 'claude-sonnet',
      local: 'ollama-codellama'
    }
  },
  
  budgets: {
    daily: 10.00,  // $10 per day
    perTask: 0.50, // $0.50 per task
    emergency: 2.00 // $2 for urgent tasks
  },
  
  performance: {
    timeoutMs: 30000,
    retries: 2,
    cacheTTL: 3600
  }
};
```

### Cost Optimization

```typescript
// src/cost-optimizer.ts
export class CostOptimizer {
  private dailySpend = 0;
  private taskCosts = new Map<string, number>();
  
  selectCostEffectiveModel(task: string, urgency: 'low' | 'medium' | 'high'): string {
    const budget = this.getRemainingBudget();
    
    if (urgency === 'low' && budget < 1.00) {
      return 'ollama-codellama'; // Free local model
    }
    
    if (urgency === 'medium' && budget < 5.00) {
      return 'gpt-4'; // Mid-cost option
    }
    
    return 'claude-sonnet'; // Premium option
  }
  
  trackCost(model: string, tokens: number): void {
    const model_info = this.getModelInfo(model);
    const cost = tokens * model_info.costPerToken;
    
    this.dailySpend += cost;
    this.taskCosts.set(model, (this.taskCosts.get(model) || 0) + cost);
  }
}
```

## ❗ Common Issues & Solutions

### 1. API Key Issues

**Problem:** `Invalid API key for model X`

**Solution:**
```bash
# Check environment variables
echo $ANTHROPIC_API_KEY
echo $OPENAI_API_KEY

# Set in .env.local
ANTHROPIC_API_KEY=sk-ant-api03-...
OPENAI_API_KEY=sk-...
```

### 2. Model Availability

**Problem:** Ollama model not responding

**Solution:**
```bash
# Start Ollama service
ollama serve

# Pull required model
ollama pull codellama:13b

# Verify in code
if (!await this.testOllamaConnection()) {
  console.warn('Ollama not available, using cloud models only');
}
```

### 3. Rate Limiting

**Problem:** `Rate limit exceeded for model X`

**Solution:**
```typescript
// Implement exponential backoff
async function withRetry(fn: () => Promise<any>, maxRetries = 3): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        await sleep(Math.pow(2, i) * 1000); // Exponential backoff
        continue;
      }
      throw error;
    }
  }
}
```

### 4. Context Length Limits

**Problem:** `Context length exceeded for model X`

**Solution:**
```typescript
// Smart context truncation
function truncateContext(context: any, maxTokens: number): any {
  const contextStr = JSON.stringify(context);
  if (contextStr.length <= maxTokens * 4) { // Rough token estimate
    return context;
  }
  
  // Prioritize recent and relevant context
  return {
    ...context,
    recentMemories: context.recentMemories?.slice(0, 3),
    code: context.code?.substring(0, maxTokens * 2),
    // Keep essential fields
  };
}
```

## 📈 Performance Monitoring

### Response Time Tracking

```typescript
// src/monitoring.ts
export class ModelMonitor {
  private metrics = new Map<string, ModelMetrics>();
  
  async trackModelPerformance<T>(
    model: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      const endTime = Date.now();
      
      this.updateMetrics(model, {
        responseTime: endTime - startTime,
        success: true,
        timestamp: new Date()
      });
      
      return result;
    } catch (error) {
      this.updateMetrics(model, {
        responseTime: Date.now() - startTime,
        success: false,
        error: error.message,
        timestamp: new Date()
      });
      throw error;
    }
  }
  
  getModelStats(model: string): ModelStats {
    const metrics = this.metrics.get(model);
    if (!metrics) return { requests: 0, averageTime: 0, successRate: 0 };
    
    return {
      requests: metrics.total,
      averageTime: metrics.totalTime / metrics.total,
      successRate: metrics.successes / metrics.total,
      lastUsed: metrics.lastUsed
    };
  }
}
```

## 🧪 Testing Multi-Model Integration

```typescript
// src/tests/multi-model.test.ts
describe('Multi-Model Integration', () => {
  it('should handle model failures gracefully', async () => {
    const multiModel = new MultiModelAIClient(testConfig);
    
    // Mock one model to fail
    jest.spyOn(multiModel, 'askSingleModel')
      .mockImplementationOnce(() => Promise.reject(new Error('Model unavailable')))
      .mockImplementationOnce(() => Promise.resolve('Success'));
    
    const result = await multiModel.askMultipleModels('test', {}, ['failing-model', 'working-model']);
    
    expect(result.content.responses).toHaveLength(2);
    expect(result.content.responses[0].status).toBe('rejected');
    expect(result.content.responses[1].status).toBe('fulfilled');
  });
  
  it('should optimize context for different models', () => {
    const baseContext = { task: 'code-review', complexity: 'high' };
    
    const claudeContext = ContextOptimizer.optimizeForModel(baseContext, 'claude-sonnet');
    const gptContext = ContextOptimizer.optimizeForModel(baseContext, 'gpt-4');
    
    expect(claudeContext.reasoning_approach).toBe('step_by_step');
    expect(gptContext.creativity_level).toBe('high');
  });
});
```

## 🔗 Next Steps

- **[Team Collaboration](../02-team-collaboration/)** - Share multi-model insights across teams
- **[Real-time Updates](../06-realtime-updates/)** - Stream responses from multiple models
- **[Enterprise Security](../08-enterprise-security/)** - Secure multi-model deployments

## 📚 Additional Resources

- [Anthropic Claude Documentation](https://docs.anthropic.com/)
- [OpenAI API Reference](https://platform.openai.com/docs/)
- [Ollama Documentation](https://ollama.ai/docs/)
- [UCP Multi-Model Best Practices](../../../docs/guides/MULTI-MODEL-PATTERNS.md)

---

**Questions?** The multi-model integration pattern is complex but powerful. Check the troubleshooting guide or create an issue for specific problems.