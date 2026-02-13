#!/usr/bin/env node

/**
 * Lumen CLI - Interactive AI Agent with Full Pipeline
 * 
 * Features:
 * - Secret redaction and restoration
 * - Rolling memory with summarization
 * - Intelligent routing between specialized agents
 * - Terminal command execution with safety gates
 * - Real-time interaction logging
 */

import { createInterface } from 'readline';
import { processUserRequest } from './schemas/agentOrchestrator.js';
import memorySystem from './lib/memorySystem.js';

// ANSI color codes for prettier output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m'
};

/**
 * Display the welcome banner
 */
function showBanner() {
  console.log(colors.cyan + colors.bright);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║                   🌟 LUMEN AI AGENT 🌟                     ║');
  console.log('║                                                            ║');
  console.log('║         Intelligent routing • Memory-aware • Secure        ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(colors.reset);
  console.log(colors.dim + '  Type your query, or use commands:' + colors.reset);
  console.log(colors.dim + '    /help     - Show available commands' + colors.reset);
  console.log(colors.dim + '    /memory   - View memory statistics' + colors.reset);
  console.log(colors.dim + '    /clear    - Clear conversation memory' + colors.reset);
  console.log(colors.dim + '    /exit     - Exit the CLI' + colors.reset);
  console.log('');
}

/**
 * Display help information
 */
function showHelp() {
  console.log(colors.yellow + '\n📚 Available Commands:' + colors.reset);
  console.log('  /help          Show this help message');
  console.log('  /memory        Display memory statistics and usage');
  console.log('  /clear         Clear all conversation memory');
  console.log('  /config        Show current configuration');
  console.log('  /exit or /quit Exit the CLI\n');
  
  console.log(colors.yellow + '🎯 What Lumen Can Do:' + colors.reset);
  console.log('  • Answer questions and have conversations');
  console.log('  • Generate and explain code in multiple languages');
  console.log('  • Execute terminal commands (with your approval)');
  console.log('  • Summarize long documents and articles');
  console.log('  • Create step-by-step execution plans');
  console.log('  • Remember context across conversations\n');
  
  console.log(colors.yellow + '🔒 Security Features:' + colors.reset);
  console.log('  • Automatic secret detection and redaction');
  console.log('  • Dangerous command blocking');
  console.log('  • Manual approval for terminal executions');
  console.log('  • Full audit trail logging\n');
}

/**
 * Display memory statistics
 */
async function showMemoryStats() {
  try {
    const stats = await memorySystem.getMemoryStats();
    console.log(colors.cyan + '\n🧠 Memory System Statistics:' + colors.reset);
    console.log(`  Total interactions processed: ${colors.bright}${stats.totalInteractionsProcessed}${colors.reset}`);
    console.log(`  Current interactions stored: ${colors.bright}${stats.currentInteractionsStored}${colors.reset}/${stats.maxInteractions}`);
    console.log(`  Summaries stored: ${colors.bright}${stats.summariesStored}${colors.reset}/${stats.maxSummaries}`);
    
    if (stats.oldestInteraction) {
      console.log(`  Oldest interaction: ${colors.dim}${stats.oldestInteraction}${colors.reset}`);
    }
    if (stats.newestInteraction) {
      console.log(`  Newest interaction: ${colors.dim}${stats.newestInteraction}${colors.reset}`);
    }
    console.log('');
  } catch (error) {
    console.error(colors.red + '  Error fetching memory stats: ' + error.message + colors.reset);
  }
}

/**
 * Clear memory with confirmation
 */
async function clearMemory(rl) {
  return new Promise((resolve) => {
    rl.question(colors.yellow + '⚠️  Are you sure you want to clear all memory? (yes/no): ' + colors.reset, async (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        try {
          await memorySystem.clearMemory();
          console.log(colors.green + '✅ Memory cleared successfully\n' + colors.reset);
        } catch (error) {
          console.error(colors.red + '❌ Error clearing memory: ' + error.message + colors.reset);
        }
      } else {
        console.log(colors.dim + 'Memory clear cancelled\n' + colors.reset);
      }
      resolve();
    });
  });
}

/**
 * Show current configuration
 */
function showConfig() {
  console.log(colors.cyan + '\n⚙️  Current Configuration:' + colors.reset);
  console.log(`  Auto-approve commands: ${colors.bright}${process.env.LUMEN_AUTO_APPROVE === 'true' ? 'Enabled' : 'Disabled'}${colors.reset}`);
  console.log(`  Dry-run mode: ${colors.bright}${process.env.LUMEN_DRY_RUN === 'true' ? 'Enabled' : 'Disabled'}${colors.reset}`);
  console.log(`  Command timeout: ${colors.bright}${process.env.LUMEN_TIMEOUT || '30000'}ms${colors.reset}`);
  console.log(`  Memory file: ${colors.dim}${process.env.USER_MEMORY_FILE || './memory.json'}${colors.reset}`);
  console.log('');
}

/**
 * Format and display AI response
 */
function displayResponse(response) {
  console.log(colors.cyan + '\n╔════════════════════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.cyan + '║  🤖 LUMEN RESPONSE                                         ║' + colors.reset);
  console.log(colors.cyan + '╚════════════════════════════════════════════════════════════╝' + colors.reset);
  
  // Display based on response type
  switch (response.choice) {
    case 'response':
      console.log(colors.bright + '\n' + response.response + colors.reset);
      if (response.questionsForUser && response.questions?.length > 0) {
        console.log(colors.yellow + '\n❓ Follow-up questions:' + colors.reset);
        response.questions.forEach((q, i) => {
          console.log(colors.yellow + `   ${i + 1}. ${q}` + colors.reset);
        });
      }
      if (response.missingContext?.length > 0) {
        console.log(colors.dim + '\n💡 Would be helpful to know:' + colors.reset);
        response.missingContext.forEach((ctx) => {
          console.log(colors.dim + `   • ${ctx}` + colors.reset);
        });
      }
      break;
      
    case 'code':
      console.log(colors.green + `\n📝 Generated ${response.language || 'code'}:` + colors.reset);
      console.log(colors.dim + '```' + (response.language || '') + colors.reset);
      console.log(response.code);
      console.log(colors.dim + '```' + colors.reset);
      if (response.codeExplanation) {
        console.log(colors.dim + '\n💡 ' + response.codeExplanation + colors.reset);
      }
      break;
      
    case 'terminalCommand':
      if (response.executionResult) {
        console.log(colors.green + '\n✅ Command executed' + colors.reset);
        if (response.executionResult.stdout) {
          console.log(colors.dim + '\nOutput:' + colors.reset);
          console.log(response.executionResult.stdout);
        }
        if (response.executionResult.stderr) {
          console.log(colors.red + '\nErrors:' + colors.reset);
          console.log(response.executionResult.stderr);
        }
      }
      break;
      
    case 'plan':
      console.log(colors.magenta + '\n📋 Execution Plan:' + colors.reset);
      if (response.steps?.length > 0) {
        response.steps.forEach((step, i) => {
          console.log(colors.bright + `\n${i + 1}. ${step.title}` + colors.reset);
          console.log(colors.dim + `   ${step.description}` + colors.reset);
          if (step.command) {
            console.log(colors.cyan + `   Command: ${step.command}` + colors.reset);
          }
        });
      }
      break;
  }
  
  // Display routing metadata if present
  if (response._metadata?.routing) {
    console.log(colors.dim + '\n┌─ Routing Info ─────────────────────────────────' + colors.reset);
    console.log(colors.dim + `│ Schema: ${response._metadata.routing.selectedSchema}` + colors.reset);
    console.log(colors.dim + `│ Reason: ${response._metadata.routing.routerExplanation}` + colors.reset);
    console.log(colors.dim + '└────────────────────────────────────────────────\n' + colors.reset);
  }
}

/**
 * Main CLI loop
 */
async function main() {
  showBanner();
  
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: colors.green + '💬 You: ' + colors.reset
  });
  
  // Configuration from environment variables
  const config = {
    autoApprove: process.env.LUMEN_AUTO_APPROVE === 'true',
    dryRun: process.env.LUMEN_DRY_RUN === 'true',
    timeout: parseInt(process.env.LUMEN_TIMEOUT || '30000'),
    skipMemory: process.env.LUMEN_SKIP_MEMORY === 'true',
    skipRedaction: process.env.LUMEN_SKIP_REDACTION === 'true'
  };
  
  rl.prompt();
  
  rl.on('line', async (input) => {
    const query = input.trim();
    
    if (!query) {
      rl.prompt();
      return;
    }
    
    // Handle commands
    if (query.startsWith('/')) {
      const command = query.toLowerCase();
      
      switch (command) {
        case '/help':
        case '/h':
          showHelp();
          break;
          
        case '/memory':
        case '/m':
          await showMemoryStats();
          break;
          
        case '/clear':
          await clearMemory(rl);
          break;
          
        case '/config':
        case '/settings':
          showConfig();
          break;
          
        case '/exit':
        case '/quit':
        case '/q':
          console.log(colors.cyan + '\n👋 Goodbye! Thanks for using Lumen.\n' + colors.reset);
          process.exit(0);
          break;
          
        default:
          console.log(colors.red + `❌ Unknown command: ${query}` + colors.reset);
          console.log(colors.dim + 'Type /help for available commands\n' + colors.reset);
      }
      
      rl.prompt();
      return;
    }
    
    // Process user query through full pipeline
    try {
      const response = await processUserRequest(query, config);
      displayResponse(response);
    } catch (error) {
      console.error(colors.red + '\n❌ Error processing request:' + colors.reset);
      console.error(colors.red + error.message + colors.reset);
      if (error.stack) {
        console.error(colors.dim + error.stack + colors.reset);
      }
    }
    
    console.log(''); // Empty line for spacing
    rl.prompt();
  });
  
  rl.on('close', () => {
    console.log(colors.cyan + '\n👋 Goodbye! Thanks for using Lumen.\n' + colors.reset);
    process.exit(0);
  });
}

// Handle uncaught errors gracefully
process.on('uncaughtException', (error) => {
  console.error(colors.red + '\n💥 Uncaught error:' + colors.reset);
  console.error(colors.red + error.message + colors.reset);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error(colors.red + '\n💥 Unhandled promise rejection:' + colors.reset);
  console.error(colors.red + error.message + colors.reset);
  process.exit(1);
});

// Start the CLI
main();
