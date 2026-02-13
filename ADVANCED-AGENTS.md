# 🌟 Lumen Advanced Agent System

## From Vision to Autonomous System Administrator

**A production-ready framework for building specialized AI agents using contract-driven development.**

---

## 🎯 Philosophy: The 99% Path

Traditional ML systems fail because they lack **intermediate validation**. Lumen implements a multi-stage pipeline where each agent acts as a peer reviewer for the next:

```
User Intent → Router → Planner → Validator → Executor → FollowThrough
              ↓          ↓           ↓          ↓            ↓
           "What?"   "How?"     "Safe?"    "Do it"    "Track it"
```

This architecture embodies **Contract-Driven Development**: agents are black boxes connected by strict JSON schemas, enabling independent evolution without breaking the system.

---

## 🏗️ The Eight Agent Archetypes

### 1️⃣ **Router Agent** - The Traffic Controller
**Contract:** Classifies intent and selects the appropriate handler

```javascript
{
  response: "I'll route this to the multi-step planner",
  explanation: "This is a complex database migration requiring dependency tracking",
  choice: "multiStepPlannerAgent"
}
```

**When to use:** Every query starts here. Router has the "map" of all available agents.

---

### 2️⃣ **Base Agent** - The Generalist
**Contract:** Handles conversation, code generation, simple commands, and basic planning

```javascript
{
  choice: "response" | "code" | "terminalCommand" | "plan",
  response: "Here's the answer...",
  code: "function example() {...}",
  terminalCommand: "ls -la",
  // ... type-specific fields
}
```

**When to use:** Default fallback for simple queries that don't require specialized handling.

---

### 3️⃣ **Validator Agent** - The Peer Reviewer ⭐
**Contract:** Risk assessment and safety validation before execution

```javascript
{
  validation: "approved-with-warnings",
  riskLevel: "medium",
  estimatedSuccessRate: 95,
  issues: [],
  warnings: ["Network latency may affect replication"],
  missingPrerequisites: [],
  suggestedModifications: [...],
  saferAlternatives: [...]
}
```

**When to use:** Before executing any multi-step plan or high-risk command.

**The 99% Path:** This agent implements the philosophy that you should never execute without validation. It catches issues that even experienced engineers miss.

---

### 4️⃣ **Multi-Step Planner Agent** - The Architect ⭐
**Contract:** Creates comprehensive execution plans with dependencies

```javascript
{
  planTitle: "Zero-downtime PostgreSQL migration",
  steps: [
    {
      stepId: "backup-source",
      title: "Create backup of source database",
      command: "pg_dump ...",
      dependsOn: [],
      canRunInParallel: false,
      riskLevel: "low",
      verificationCommand: "pg_restore --list ...",
      rollbackCommand: ""
    },
    // ... more steps
  ],
  criticalPath: ["backup-source", "setup-replication", "cutover"],
  potentialBlockers: [...],
  rollbackStrategy: "..."
}
```

**When to use:** Complex operations with multiple steps, dependencies, or requiring rollback capability.

**Key Features:**
- Dependency tracking (DAG analysis)
- Parallel execution detection
- Critical path identification
- Rollback strategies

---

### 5️⃣ **Follow-Through Agent** - The State Machine ⭐
**Contract:** Tracks work-in-progress across multiple interactions

```javascript
{
  taskId: "migration-2026-02-13-001",
  taskStatus: "in-progress",
  currentStepIndex: 3,
  completedSteps: [...],
  currentStep: {
    status: "failed",
    attemptCount: 2
  },
  lastError: "Connection timeout",
  recoveryAction: "retry-current",
  checkpointData: {...},
  progressPercentage: 60
}
```

**When to use:** Long-running operations, failure recovery, resume-after-disconnect scenarios.

**Key Features:**
- Checkpoint-based recovery
- Progress tracking
- Failure analysis and recovery suggestions
- State persistence across sessions

---

### 6️⃣ **SSH Explorer Agent** - The Reconnaissance Scout ⭐
**Contract:** Automated environmental discovery and mapping

```javascript
{
  explorationSummary: "Ubuntu 22.04 server with PostgreSQL 14...",
  systemInfo: {...},
  directoryStructure: [...],
  activeServices: [...],
  systemResources: {
    cpuUsage: "15%",
    diskUsage: [...]
  },
  networkTopology: {...},
  securityFindings: [...],
  recommendations: [...]
}
```

**When to use:** Before infrastructure operations, capacity planning, security audits, incident response.

**Key Features:**
- Comprehensive system survey
- Security finding identification
- Resource capacity analysis
- Network topology mapping

---

### 7️⃣ **Summarize Agent** - The Distiller
**Contract:** Condenses long text while preserving key information

```javascript
{
  summary: "The article discusses...",
  missingContext: ["Publication date", "Author credentials"],
  reasoning: "Prioritized technical implementation details..."
}
```

**When to use:** Documentation analysis, meeting notes, research papers, log file analysis.

---

### 8️⃣ **Plan Steps Agent** - The Simple Planner
**Contract:** Basic step-by-step plans without complex dependencies

```javascript
{
  steps: [
    { title: "Step 1", description: "...", command: "..." },
    // ... more steps
  ],
  planReasoning: "This approach ensures..."
}
```

**When to use:** Simple multi-step tasks that don't require dependency tracking or rollback.

---

## 🔄 Multi-Agent Coordination Workflow

### Example: "Migrate the production database"

```
┌─────────────────────────────────────────────────────────┐
│ 1. ROUTER: Analyzes query complexity                   │
│    → Detects infrastructure operation                  │
│    → Selects multiStepPlannerAgent                     │
└──────────────┬──────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────────────┐
│ 2. MULTI-STEP PLANNER: Creates comprehensive plan      │
│    → 12 steps with dependencies                        │
│    → Critical path: backup → replicate → cutover       │
│    → Rollback strategy defined                         │
└──────────────┬──────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────────────┐
│ 3. VALIDATOR: Peer-reviews the plan                    │
│    → Risk level: HIGH                                  │
│    → Success confidence: 92%                           │
│    → Suggests: Add verification after each step        │
└──────────────┬──────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────────────┐
│ 4. SSH EXPLORER: Verifies environment readiness        │
│    → Source: Postgres 14.2, 250GB used, healthy       │
│    → Target: Postgres 14.5, 500GB available           │
│    → Network: 10Gbps link between servers             │
└──────────────┬──────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────────────┐
│ 5. FOLLOW-THROUGH: Initializes execution tracking     │
│    → Task ID: migration-2026-02-13-001                │
│    → Checkpoints: After each critical step            │
│    → Recovery: Retry on network timeout               │
└──────────────┬──────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────────────┐
│ 6. TERMINAL EXECUTOR: Runs commands with safety gates │
│    → Redacts secrets before logging                   │
│    → Blocks dangerous patterns                        │
│    → Requires approval for high-risk commands         │
└──────────────┬──────────────────────────────────────────┘
               ↓
┌─────────────────────────────────────────────────────────┐
│ 7. MEMORY SYSTEM: Logs entire workflow                │
│    → Stores in rolling 21-interaction window          │
│    → Automatically summarizes when full               │
│    → Enables "remember how we did this last time"     │
└─────────────────────────────────────────────────────────┘
```

---

## 🛡️ Security Architecture

### Layer 1: Secret Redaction
```javascript
const redactor = new SecretRedactor();
const safeQuery = redactor.redact("Connect with password: SuperSecret123!");
// → "Connect with password: {{PASSWORD_1}}"

// Later, only for terminal execution:
const realCommand = redactor.substitute(safeCommand);
// → Secrets restored only when needed
```

**Detects:** API keys, JWT tokens,SSH keys, passwords, database connection strings

### Layer 2: Dangerous Pattern Blocking
```javascript
const DANGEROUS_PATTERNS = [
  /rm\s+-rf\s+\/($|\s)/,    // rm -rf /
  /:\(\)\{.*:\|:.*\}/,       // Fork bombs
  /\/dev\/sda/,              // Direct disk writes
  /mkfs/,                    // Format commands
  /curl.*\|.*bash/           // Pipe to bash
];
```

### Layer 3: Manual Approval
High-risk commands require explicit user confirmation with reasoning display.

### Layer 4: Validation Before Execution
Validator agent provides risk assessment and suggests safer alternatives.

---

## 🧠 Memory & Context Management

### Rolling Window Strategy
```
┌─────────────────────────────────────┐
│ Active Window (21 interactions)    │
│ ┌─────────────────────────────────┐ │
│ │ Interaction 23: "Deploy app"    │ │
│ │ Interaction 24: "Check logs"    │ │
│ │ ...                             │ │
│ │ Interaction 43: "Current query" │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
              ↓ When full
┌─────────────────────────────────────┐
│ Summarize oldest 21 interactions    │
│ → "Deployed Flask app to AWS EC2"  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Summaries (max 3)                   │
│ • Summary 1: Interactions 1-21     │
│ • Summary 2: Interactions 22-42    │
│ • Summary 3: Interactions 43-63    │
└─────────────────────────────────────┘
```

**Benefits:**
- Long-term context retention
- Efficient token usage
- Temporal awareness ("last week we...")
- Automatic maintenance

---

## 📊 Usage Examples

### Simple Query (Router → Base)
```bash
$ npm run lumen
You: What is a REST API?

Router: This is a simple informational query → baseAgent
Base: A REST API is...
```

### Code Generation (Router → Base)
```bash
You: Write a Python function to calculate factorial

Router: Code generation request → baseAgent
Base: [Generates code with explanation]
```

### Complex Operation (Router → Planner → Validator → FollowThrough)
```bash
You: Set up Redis cluster with 3 nodes and sentinel

Router: Complex infrastructure task → multiStepPlannerAgent
Planner: Created 8-step plan with dependencies
Validator: Reviewed plan - 94% confidence, approved
SSHExplorer: Verified 3 servers are ready
FollowThrough: Initialized tracking, beginning step 1...
```

---

## 🚀 Getting Started

### Installation
```bash
npm install
export OPENAI_API_KEY=sk-...
```

### Interactive CLI
```bash
npm run lumen
```

### Programmatic Usage
```javascript
import { processUserRequest } from './schemas/agentOrchestrator.js';

const response = await processUserRequest(
  "Migrate PostgreSQL database to new server",
  {
    autoApprove: false,
    dryRun: false
  }
);

// Response includes routing metadata, validation results, execution state
console.log(response._metadata);
```

### Run Examples
```bash
# Basic orchestrator examples
npm run examples

# Advanced multi-agent coordination
npm run examples:advanced
```

---

## 🔧 Adding New Agents

### 1. Define the Contract (Schema)
```javascript
// schemas/myNewAgent.js
export const myNewAgentResponseSchema = {
  type: "object",
  properties: {
    // Define your contract fields
    result: { type: "string" },
    confidence: { type: "number" }
  },
  required: ["result", "confidence"],
  additionalProperties: false  // Critical!
};
```

### 2. Register in Orchestrator
```javascript
// schemas/agentOrchestrator.js
import { myNewAgentResponseSchema } from './myNewAgent.js';

const schemaMap = {
  // ... existing agents
  'myNewAgent': {
    schema: myNewAgentResponseSchema,
    description: 'What this agent does and when to use it'
  }
};
```

### 3. Router Automatically Learns
The router now knows about your new agent and will route queries to it when appropriate. No other code changes needed!

---

## 📈 System Metrics

### Current Capabilities
- **8 specialized agents** working in concert
- **Strict JSON contracts** for all interfaces
- **Rolling memory** with 21+ interaction retention
- **Multi-layer security** (redaction, blocking, approval, validation)
- **State machine tracking** for long-running operations
- **Automatic environment discovery**

### Production Readiness
- ✅ Error handling and recovery
- ✅ Audit trail logging
- ✅ Secret protection
- ✅ Dangerous command blocking
- ✅ Validation before execution
- ✅ Checkpoint-based recovery
- ✅ Multi-agent coordination

---

## 🎓 Key Learnings

### Why This Architecture Works

1. **Contract-Driven Development**
   - Agents are black boxes with strict interfaces
   - Can swap implementations without breaking system
   - Easy to test and validate independently

2. **The 99% Path**
   - Validation before execution catches issues early
   - Multi-stage pipeline ensures quality
   - Peer review by specialized agents

3. **Temporal Persistence**
   - Memory system provides context across sessions
   - "Remember how we did this" capability
   - Learning from past mistakes

4. **Modular Expansion**
   - Adding new agents doesn't break existing ones
   - Router automatically discovers new capabilities
   - Clean separation of concerns

5. **Vision-to-Software Workflow**
   - Think through architecture first (Router → Planner)
   - Validate before building (Validator)
   - Track progress (FollowThrough)
   - Learn from execution (Memory)

---

## 📚 Further Reading

- [ORCHESTRATOR-README.md](ORCHESTRATOR-README.md) - Detailed pipeline documentation
- [STATUS.md](STATUS.md) - Current project status and roadmap
- [examples/](examples/) - Working code examples

---

**Built with contract-driven development principles by Gregory Ward**

*"The best code is no code. The best interface is a strict contract."*
