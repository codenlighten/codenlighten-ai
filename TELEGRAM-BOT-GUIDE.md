# 🤖 Lumen Telegram Bot

**Advanced AI Agent with Multi-Agent Orchestration for Telegram**

---

## 🚀 Quick Start

### 1. Setup

Your `.env` file already has the bot token:
```bash
TELEGRAM_BOT_TOKEN=8313693873:AAEhcq4nRdzdqqfF1HTQb_PRdAai3uQC_Tk
TELEGRAM_ADMIN_ID=6217316860
```

### 2. Start the Bot

```bash
npm run telegram
```

Or directly:
```bash
node telegram-bot.js
```

### 3. Use on Telegram

Open Telegram and search for your bot, then start chatting!

---

## 📱 Available Commands

- `/start` - Welcome message and overview
- `/help` - Show available commands and capabilities
- `/memory` - View conversation memory statistics
- `/clear` - Clear conversation history

---

## 🎯 What the Bot Can Do

### 🔀 Smart Routing
The bot automatically routes your query to the best specialist agent:

**Example Queries:**

- **"What is a REST API?"** → Base Agent (conversation)
- **"Write a Python function to reverse a string"** → Base Agent (code)
- **"Summarize this article: [paste text]"** → Summarize Agent
- **"Create a plan to deploy a Node.js app"** → Multi-Step Planner
- **"Validate this database migration plan"** → Validator Agent
- **"What's running on the server?"** → SSH Explorer

### 🧠 Context-Aware Memory
- Remembers last 21 interactions
- Automatically summarizes older conversations
- Provides context across sessions

### 🔒 Security Features
- **Secret Redaction** - Automatically detects and protects sensitive data
- **Command Validation** - High-risk commands require approval
- **Dry-Run Mode** - Commands are validated but not executed
- **Dangerous Pattern Blocking** - Prevents destructive operations

### 💻 Response Types

1. **Conversational** - Direct answers with follow-up questions
2. **Code Generation** - Formatted code with explanations
3. **Terminal Commands** - Commands with reasoning (dry-run only)
4. **Execution Plans** - Multi-step plans with dependencies
5. **Validation Results** - Risk assessment and confidence scores
6. **System Discovery** - Infrastructure mapping and analysis

---

## 🛡️ Security Configuration

The bot is configured with maximum security:

```javascript
{
  autoApprove: false,       // Never auto-approve commands
  dryRun: true,             // Always simulate, never execute
  skipMemory: false,        // Use memory for context
  skipRedaction: false      // Always protect secrets
}
```

**Terminal commands are validated and shown, but NEVER executed automatically for security.**

---

## 🎨 Example Interactions

### Simple Query
```
You: What is a REST API?
Bot: [Provides detailed explanation]
🔀 Routing Info:
Agent: baseAgent
```

### Code Generation
```
You: Write a Python function to calculate factorial
Bot: 📝 Generated Python:
```python
def factorial(n):
    if n == 0 or n == 1:
        return 1
    return n * factorial(n - 1)
```
💡 This function uses recursion...
```

### Complex Planning
```
You: Create a plan to set up a PostgreSQL database with replication
Bot: 🏗️ Zero Downtime PostgreSQL Setup
Objective: Configure master-slave replication...
Total Steps: 8
Estimated Time: 1 hour
Critical Path: step-1 → step-2 → step-3...
```

### System Discovery
```
You: Analyze the production database server
Bot: 🗺️ System Exploration
Ubuntu 20.04 LTS, PostgreSQL 12.8
Hostname: db-prod-server
CPU Usage: 15%
Memory Usage: 65%
```

---

## 🔧 Advanced Features

### Multi-Agent Coordination

For complex queries, multiple agents work together:

1. **Router** analyzes the query
2. **Planner** creates detailed steps
3. **Validator** assesses risks
4. **Explorer** verifies environment
5. **FollowThrough** tracks execution

### Memory Persistence

```
You: /memory
Bot: 🧠 Memory System Statistics
Total interactions: 42
Current interactions: 21/21
Summaries stored: 2/3
```

### Routing Transparency

Every response shows which agent handled it:
```
🔀 Routing Info:
Agent: multiStepPlannerAgent
Reason: Complex infrastructure operation requiring dependency tracking
```

---

## 📊 Architecture

```
Telegram Message
    ↓
Secret Redactor (protect sensitive data)
    ↓
Memory System (load context)
    ↓
Router Agent (select specialist)
    ↓
[BaseAgent | Summarize | Planner | Validator | Explorer | FollowThrough]
    ↓
Format Response (Telegram markdown)
    ↓
Send to User
```

---

## 🐛 Troubleshooting

### Bot Not Responding?
1. Check bot token in `.env`
2. Ensure bot is running: `npm run telegram`
3. Check terminal for error messages

### Memory Issues?
```
/clear
```
This clears the conversation history.

### Want More Details?
Check the logs in the terminal where the bot is running.

---

## 🌟 Key Benefits

✅ **No Execution Risk** - Dry-run mode means commands are never executed  
✅ **Context Aware** - Remembers conversation history  
✅ **Smart Routing** - Automatically selects the right specialist  
✅ **Security First** - Secret protection and validation built-in  
✅ **Transparent** - Shows which agent handled each query  
✅ **Production Ready** - Handles errors gracefully  

---

## 📝 Notes

- Commands marked as "terminal commands" are **validated but not executed**
- For actual execution, use the CLI: `npm run lumen`
- Admin ID can be used for future admin-only features
- Memory is shared across all users (consider per-user memory for production)

---

**Your intelligent Telegram assistant is ready! 🚀**

Just message your bot on Telegram and experience multi-agent AI coordination in action!
