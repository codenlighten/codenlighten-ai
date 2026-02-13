# 🌟 Lumen AI Agent - Orchestrator & CLI

**An intelligent, memory-aware AI agent with secure command execution and smart routing.**

---

## 🚀 Quick Start

```bash
# Interactive CLI
npm run lumen

# Run example demonstrations
npm run examples
```

---

## 🎯 What It Does

Lumen is a sophisticated AI agent system that:

- **🔀 Intelligently Routes** queries to specialized handlers (conversation, code, summarization, planning)
- **🧠 Maintains Memory** across conversations with rolling window + automatic summarization
- **🔒 Protects Secrets** by detecting and redacting sensitive data before sending to AI
- **💻 Executes Commands** safely with approval gates and dangerous pattern blocking
- **📝 Logs Everything** with comprehensive audit trails

---

## 🏗️ Architecture

### The Pipeline: **Redact → Contextualize → Route → Execute → Restore**

```
User Query
    ↓
┌───────────────┐
│ 1. REDACT     │  Detect & replace secrets with placeholders
│ SecretRedactor│  (API keys, passwords, tokens, etc.)
└───────┬───────┘
        ↓
┌───────────────┐
│ 2. CONTEXTUALIZE│ Load memory (21 interactions + 3 summaries)
│ MemorySystem  │  Provide temporal awareness & conversation history
└───────┬───────┘
        ↓
┌───────────────┐
│ 3. ROUTE      │  Analyze intent & select optimal schema
│ RouterAgent   │  (baseAgent, summarizeAgent, planAgent, etc.)
└───────┬───────┘
        ↓
┌───────────────┐
│ 4. EXECUTE    │  Process with chosen schema
│ Selected Agent│  Generate response/code/command/plan
└───────┬───────┘
        ↓
┌───────────────┐
│ 5. RESTORE    │  Replace placeholders with real secrets
│ (Commands only)│ (Only for terminal execution)
└───────┬───────┘
        ↓
┌───────────────┐
│ 6. LOG        │  Save interaction to memory
│ MemorySystem  │  Update rolling window & trigger summarization
└───────────────┘
```

---

## 📁 Key Components

### Schemas (`schemas/`)
- **routerAgent.js** - Classifies queries and selects appropriate handler
- **baseAgent.js** - Handles conversation, code generation, commands, planning
- **summarizeAgent.js** - Text summarization and key point extraction
- **planStepsAgent.js** - Creates detailed step-by-step execution plans
- **agentOrchestrator.js** - Coordinates the full pipeline

### Libraries (`lib/`)
- **openaiWrapper.js** - OpenAI API integration with strict JSON schemas
- **memorySystem.js** - Rolling window memory (21 interactions + 3 summaries)
- **secretRedactor.js** - Detects and redacts sensitive data patterns
- **terminalExecutor.js** - Safe command execution with approval gates
- **auditLogger.js** - Comprehensive interaction logging

### Entry Points
- **cli.js** - Interactive command-line interface
- **examples/orchestrator-demo.js** - Usage demonstrations

---

## 🎮 Interactive CLI

### Commands

```bash
/help      # Show available commands
/memory    # Display memory statistics
/clear     # Clear conversation history
/config    # Show current configuration
/exit      # Exit the CLI
```

### Features

- ✅ Real-time AI conversation
- ✅ Color-coded output
- ✅ Command history
- ✅ Memory persistence
- ✅ Secret protection
- ✅ Execution approval flow

---

## 💻 Programmatic Usage

### Simple Routing

```javascript
import { orchestrateQuery } from './schemas/agentOrchestrator.js';

const response = await orchestrateQuery("What is REST API?", {
  additionalInfo: "User prefers concise answers"
});

console.log(response.response);
console.log('Schema used:', response._routingMetadata.selectedSchema);
```

### Full Pipeline

```javascript
import { processUserRequest } from './schemas/agentOrchestrator.js';

const response = await processUserRequest(
  "List files in the current directory",
  {
    autoApprove: false,    // Require manual approval for commands
    dryRun: false,         // Actually execute commands
    timeout: 30000,        // 30 second timeout
    skipMemory: false,     // Use memory system
    skipRedaction: false   // Enable secret protection
  }
);

// Access response based on type
if (response.choice === 'response') {
  console.log(response.response);
} else if (response.choice === 'code') {
  console.log(response.code);
} else if (response.choice === 'terminalCommand') {
  console.log(response.executionResult);
}

// Access metadata
console.log(response._metadata.routing);
console.log(response._metadata.security);
```

---

## ⚙️ Configuration

### Environment Variables

```bash
# Auto-approve terminal commands (use with caution!)
LUMEN_AUTO_APPROVE=true

# Simulate execution without running commands
LUMEN_DRY_RUN=true

# Command execution timeout in milliseconds
LUMEN_TIMEOUT=30000

# Skip memory system (for stateless operation)
LUMEN_SKIP_MEMORY=true

# Skip secret redaction (for debugging only)
LUMEN_SKIP_REDACTION=true

# Custom memory file location
USER_MEMORY_FILE=./custom-memory.json

# OpenAI API Key (required)
OPENAI_API_KEY=sk-...
```

---

## 🔒 Security Features

### Secret Detection Patterns

Automatically detects and redacts:
- 🔑 API keys (OpenAI, GitHub, AWS, etc.)
- 🔐 Passwords and credentials
- 🎫 JWT tokens
- 🗝️ SSH private keys
- 🔗 Database connection strings
- 💾 Long hexadecimal secrets

### Dangerous Command Blocking

Prevents execution of:
- `rm -rf /` (recursive deletion)
- Fork bombs
- Direct disk writes (`/dev/sda`, `mkfs`, `dd`)
- System file modifications (`/etc/passwd`)
- Piped downloads (`curl | bash`, `wget | sh`)

---

## 🧠 Memory System

### Rolling Window Strategy

- **Active Window:** Last 21 interactions (full detail)
- **Summaries:** Up to 3 compressed historical blocks
- **Auto-Summarization:** Triggers when window fills
- **Temporal Awareness:** Timestamps and IDs for context

### Benefits

- 📈 Maintains long-term context
- 💾 Efficient token usage
- ⏳ Temporal understanding
- 🔄 Automatic maintenance

---

## 📊 Response Types

### Conversation (`choice: 'response'`)
```javascript
{
  response: "Here's the answer...",
  questionsForUser: false,
  questions: [],
  missingContext: []
}
```

### Code Generation (`choice: 'code'`)
```javascript
{
  code: "function factorial(n) {...}",
  language: "javascript",
  codeExplanation: "This calculates..."
}
```

### Terminal Command (`choice: 'terminalCommand'`)
```javascript
{
  terminalCommand: "ls -la",
  commandReasoning: "Lists files with details",
  requiresApproval: true,
  executionResult: { status: 'success', stdout: '...' }
}
```

### Step-by-Step Plan (`choice: 'plan'`)
```javascript
{
  steps: [
    { title: "Step 1", description: "...", command: "..." }
  ],
  planReasoning: "This approach ensures..."
}
```

---

## 🧪 Testing

```bash
# Run demonstration examples
npm run examples

# Test specific features
node examples/orchestrator-demo.js
```

---

## 📈 Next Steps

- [ ] Unit tests for all pipeline components
- [ ] Web UI for visual interaction
- [ ] Multi-user support with isolated memory
- [ ] Additional specialized agents (database, image, etc.)
- [ ] Caching for routing decisions
- [ ] Execution metrics and analytics

---

## 📝 Notes

- All schemas use strict JSON format (`additionalProperties: false`)
- Two-pass architecture (route → execute) enables flexible expansion
- Memory automatically manages storage with summarization
- Secrets are redacted before AI processing, restored only for execution
- All interactions are logged for audit trails

---

## 🤝 Contributing

The system is designed for easy expansion:

1. **Add new schemas** in `schemas/` directory
2. **Register in orchestrator** by adding to `schemaMap`
3. **Router automatically learns** about new options
4. **No changes needed** to existing code

---

**Built with ❤️ by Gregory Ward**
