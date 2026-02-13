#!/usr/bin/env node

/**
 * Lumen Telegram Bot - Advanced AI Agent with Full Pipeline
 * 
 * Integrates the complete orchestration system:
 * - Secret redaction and restoration
 * - Rolling memory with summarization
 * - Intelligent routing between specialized agents
 * - Terminal command execution with safety gates
 * - Multi-agent coordination for complex tasks
 */

import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { processUserRequest } from './schemas/agentOrchestrator.js';
import memorySystem from './lib/memorySystem.js';

// Load environment variables
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminId = process.env.TELEGRAM_ADMIN_ID;

if (!token) {
  console.error('❌ TELEGRAM_BOT_TOKEN is not set in .env file');
  process.exit(1);
}

// Create bot with polling
const bot = new TelegramBot(token, { polling: true });

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  🌟 Lumen Telegram Bot - Advanced Orchestrator Started   ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');
console.log(`📱 Admin ID: ${adminId || 'Not set'}`);
console.log('🤖 Bot is ready and listening for messages...\n');

/**
 * Format response for Telegram (convert markdown-like text)
 */
function formatTelegramMessage(text, useMarkdown = false) {
  if (!useMarkdown) {
    return text;
  }
  
  // Basic markdown formatting for Telegram
  return text
    .replace(/\*\*(.*?)\*\*/g, '*$1*')  // Bold
    .replace(/`([^`]+)`/g, '`$1`');      // Code
}

/**
 * Handle response based on agent choice
 */
async function handleAgentResponse(chatId, response) {
  try {
    // ═══ LUMEN PERSONALITY FIRST ═══
    // If Lumen provided a direct response, send it first
    if (response.lumenPersonality?.userResponse) {
      const lumenMsg = `✨ *Lumen:* ${response.lumenPersonality.userResponse}`;
      await bot.sendMessage(chatId, lumenMsg, { parse_mode: 'Markdown' });
      
      // If Lumen handled it directly (no further agents), we're done
      if (response.choice === 'lumenPersonality') {
        return;
      }
    }
    
    switch (response.choice) {
      case 'response':
        // Conversational response
        await bot.sendMessage(chatId, response.response, { parse_mode: 'Markdown' });
        
        // Send follow-up questions if any
        if (response.questionsForUser && response.questions?.length > 0) {
          const questionsText = '❓ *Follow-up questions:*\n' + 
            response.questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
          await bot.sendMessage(chatId, questionsText, { parse_mode: 'Markdown' });
        }
        
        // Send missing context if any
        if (response.missingContext?.length > 0) {
          const contextText = '💡 *Would be helpful to know:*\n' + 
            response.missingContext.map(c => `• ${c}`).join('\n');
          await bot.sendMessage(chatId, contextText, { parse_mode: 'Markdown' });
        }
        break;
        
      case 'code':
        // Code generation
        const codeMsg = `📝 *Generated ${response.language || 'code'}:*\n\n` +
                       `\`\`\`${response.language || ''}\n${response.code}\n\`\`\``;
        await bot.sendMessage(chatId, codeMsg, { parse_mode: 'Markdown' });
        
        if (response.codeExplanation) {
          await bot.sendMessage(chatId, `💡 ${response.codeExplanation}`);
        }
        break;
        
      case 'terminalCommand':
        // Terminal command (requires approval)
        const cmdMsg = `💻 *Terminal Command Generated:*\n\n` +
                      `\`${response.terminalCommand}\`\n\n` +
                      `📝 *Reasoning:* ${response.commandReasoning || response.reasoning}\n\n` +
                      `⚠️ *Note:* Auto-execution is disabled for security. ` +
                      `Commands require manual approval in production environments.`;
        await bot.sendMessage(chatId, cmdMsg, { parse_mode: 'Markdown' });
        
        // Show execution result if available (dry-run mode)
        if (response.executionResult) {
          const resultMsg = `📊 *Execution Status:* ${response.executionResult.status}\n\n` +
                          (response.executionResult.stdout ? `*Output:*\n\`\`\`\n${response.executionResult.stdout}\n\`\`\`` : '');
          await bot.sendMessage(chatId, resultMsg, { parse_mode: 'Markdown' });
        }
        break;
        
      case 'plan':
        // Step-by-step plan
        let planMsg = '📋 *Execution Plan:*\n\n';
        response.steps?.forEach((step, i) => {
          planMsg += `*${i + 1}. ${step.title}*\n`;
          planMsg += `${step.description}\n`;
          if (step.command) {
            planMsg += `\`${step.command}\`\n`;
          }
          planMsg += '\n';
        });
        await bot.sendMessage(chatId, planMsg, { parse_mode: 'Markdown' });
        break;
        
      default:
        // Handle new agent types (validator, planner, etc.)
        if (response.validation) {
          // Validator response
          const validationMsg = 
            `🔍 *Validation Result:* ${response.validation.toUpperCase()}\n` +
            `⚠️ *Risk Level:* ${response.riskLevel.toUpperCase()}\n` +
            `📊 *Success Confidence:* ${response.estimatedSuccessRate}%\n\n` +
            `*Reasoning:* ${response.reasoning}`;
          await bot.sendMessage(chatId, validationMsg, { parse_mode: 'Markdown' });
        } else if (response.planTitle) {
          // Multi-step planner response
          let plannerMsg = `🏗️ *${response.planTitle}*\n\n`;
          plannerMsg += `*Objective:* ${response.objective}\n`;
          plannerMsg += `*Total Steps:* ${response.steps?.length || 0}\n`;
          plannerMsg += `*Estimated Time:* ${response.estimatedTotalTime}\n\n`;
          plannerMsg += `*Critical Path:* ${response.criticalPath?.join(' → ') || 'N/A'}`;
          await bot.sendMessage(chatId, plannerMsg, { parse_mode: 'Markdown' });
        } else if (response.taskStatus) {
          // Follow-through response
          const ftMsg = 
            `🔄 *Task:* ${response.taskTitle}\n` +
            `*Status:* ${response.taskStatus.toUpperCase()}\n` +
            `*Progress:* ${response.progressPercentage}%\n` +
            `*Step:* ${response.currentStepIndex + 1}/${response.totalSteps}\n\n` +
            `*Next Action:* ${response.nextAction}`;
          await bot.sendMessage(chatId, ftMsg, { parse_mode: 'Markdown' });
        } else if (response.explorationSummary) {
          // SSH Explorer response
          const exploreMsg = 
            `🗺️ *System Exploration*\n\n` +
            `${response.explorationSummary}\n\n` +
            `*Hostname:* ${response.systemInfo?.hostname}\n` +
            `*OS:* ${response.systemInfo?.operatingSystem}\n` +
            `*CPU Usage:* ${response.systemResources?.cpuUsage}\n` +
            `*Memory Usage:* ${response.systemResources?.memoryUsage}`;
          await bot.sendMessage(chatId, exploreMsg, { parse_mode: 'Markdown' });
        } else {
          // Fallback for unknown response types
          await bot.sendMessage(chatId, JSON.stringify(response, null, 2));
        }
    }
    
    // Show routing metadata if available
    if (response._metadata?.routing) {
      const metadataMsg = 
        `\n🔀 *Routing Info:*\n` +
        `Agent: ${response._metadata.routing.selectedSchema}\n` +
        `Reason: ${response._metadata.routing.routerExplanation}`;
      await bot.sendMessage(chatId, metadataMsg, { parse_mode: 'Markdown' });
    }
    
  } catch (error) {
    console.error('Error sending response:', error);
    await bot.sendMessage(chatId, '❌ Error formatting response. Check logs for details.');
  }
}

/**
 * Handle /start command
 */
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const welcomeMsg = 
    `🌟 *Welcome to Lumen AI Agent!*\n\n` +
    `I'm an advanced AI system with specialized capabilities:\n\n` +
    `🔀 *Smart Routing* - I automatically select the best agent for your query\n` +
    `🧠 *Memory* - I remember our conversation history\n` +
    `🔒 *Security* - Secret protection and command validation\n` +
    `💻 *Code Generation* - Write code in multiple languages\n` +
    `📋 *Planning* - Create comprehensive execution plans\n` +
    `🔍 *Validation* - Peer review before execution\n\n` +
    `*Available Commands:*\n` +
    `/start - Show this welcome message\n` +
    `/help - Show available commands\n` +
    `/memory - View memory statistics\n` +
    `/clear - Clear conversation memory\n\n` +
    `Just send me any message to get started!`;
  
  await bot.sendMessage(chatId, welcomeMsg, { parse_mode: 'Markdown' });
});

/**
 * Handle /help command
 */
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  const helpMsg = 
    `📚 *Lumen AI Agent - Help*\n\n` +
    `*Commands:*\n` +
    `/start - Welcome message\n` +
    `/help - This help message\n` +
    `/memory - Memory statistics\n` +
    `/clear - Clear conversation history\n\n` +
    `*What I Can Do:*\n` +
    `• Answer questions and have conversations\n` +
    `• Generate and explain code\n` +
    `• Create execution plans\n` +
    `• Summarize documents\n` +
    `• Validate complex operations\n` +
    `• Track long-running tasks\n\n` +
    `*Specialized Agents:*\n` +
    `• Base Agent - General queries\n` +
    `• Summarize Agent - Text analysis\n` +
    `• Validator Agent - Risk assessment\n` +
    `• Multi-Step Planner - Complex orchestration\n` +
    `• Follow-Through Agent - Task tracking\n` +
    `• SSH Explorer - System discovery\n\n` +
    `*Security Features:*\n` +
    `• Automatic secret detection\n` +
    `• Command validation\n` +
    `• Manual approval for dangerous operations`;
  
  await bot.sendMessage(chatId, helpMsg, { parse_mode: 'Markdown' });
});

/**
 * Handle /memory command
 */
bot.onText(/\/memory/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const stats = await memorySystem.getMemoryStats();
    const memoryMsg = 
      `🧠 *Memory System Statistics*\n\n` +
      `Total interactions: ${stats.totalInteractionsProcessed}\n` +
      `Current interactions: ${stats.currentInteractionsStored}/${stats.maxInteractions}\n` +
      `Summaries stored: ${stats.summariesStored}/${stats.maxSummaries}\n\n` +
      (stats.oldestInteraction ? `Oldest: ${stats.oldestInteraction}\n` : '') +
      (stats.newestInteraction ? `Newest: ${stats.newestInteraction}` : '');
    
    await bot.sendMessage(chatId, memoryMsg, { parse_mode: 'Markdown' });
  } catch (error) {
    await bot.sendMessage(chatId, '❌ Error fetching memory stats: ' + error.message);
  }
});

/**
 * Handle /clear command
 */
bot.onText(/\/clear/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    await memorySystem.clearMemory();
    await bot.sendMessage(chatId, '✅ Memory cleared successfully!');
  } catch (error) {
    await bot.sendMessage(chatId, '❌ Error clearing memory: ' + error.message);
  }
});

/**
 * Handle all other messages
 */
bot.on('message', async (msg) => {
  // Skip if it's a command (already handled)
  if (msg.text?.startsWith('/')) {
    return;
  }
  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const username = msg.from.username || msg.from.first_name || 'User';
  const query = msg.text;
  
  if (!query) {
    return;
  }
  
  console.log(`📱 Message from ${username} (${userId}): ${query.substring(0, 100)}...`);
  
  // Send "typing" indicator
  await bot.sendChatAction(chatId, 'typing');
  
  try {
    // Process through full orchestrator pipeline
    const response = await processUserRequest(query, {
      autoApprove: false,       // Never auto-approve in Telegram
      dryRun: true,             // Always dry-run for security
      skipMemory: false,        // Use memory for context
      skipRedaction: false,     // Always protect secrets
      additionalContext: {
        platform: 'telegram',
        userId: userId,
        username: username
      }
    });
    
    console.log(`✅ Response generated using ${response._metadata?.routing?.selectedSchema || 'unknown'} agent`);
    
    // Handle and send response
    await handleAgentResponse(chatId, response);
    
  } catch (error) {
    console.error('❌ Error processing message:', error);
    
    const errorMsg = 
      `❌ *Error Processing Request*\n\n` +
      `${error.message}\n\n` +
      `Please try again or rephrase your question.`;
    
    await bot.sendMessage(chatId, errorMsg, { parse_mode: 'Markdown' });
  }
});

/**
 * Handle polling errors
 */
bot.on('polling_error', (error) => {
  console.error('❌ Polling error:', error.message);
});

/**
 * Graceful shutdown
 */
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down Lumen Telegram Bot...');
  await bot.stopPolling();
  console.log('👋 Bot stopped. Goodbye!\n');
  process.exit(0);
});

console.log('✅ Bot initialization complete!\n');
