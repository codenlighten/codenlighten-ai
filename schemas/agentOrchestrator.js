import { queryOpenAI } from '../lib/openaiWrapper.js';
import { routerAgentResponseSchema } from './routerAgent.js';
import { baseAgentExtendedResponseSchema } from './baseAgent.js';
import { summarizeAgentResponseSchema } from './summarizeAgent.js';
import { validatorAgentResponseSchema } from './validatorAgent.js';
import { multiStepPlannerAgentResponseSchema } from './multiStepPlannerAgent.js';
import { followThroughAgentResponseSchema } from './followThroughAgent.js';
import { sshExplorerAgentResponseSchema } from './sshExplorerAgent.js';
import { lumenPersonalityAgentResponseSchema, LUMEN_PERSONALITY_CONTEXT } from './lumenPersonalityAgent.js';
import memorySystem from '../lib/memorySystem.js';
import { SecretRedactor } from '../lib/secretRedactor.js';
import { executeAgentCommand } from '../lib/terminalExecutor.js';

// Map the string 'choice' to the actual schema object
const schemaMap = {
  'baseAgent': {
    schema: baseAgentExtendedResponseSchema,
    description: 'General conversation, terminal commands, code generation, and simple planning'
  },
  'summarizeAgent': {
    schema: summarizeAgentResponseSchema,
    description: 'Condensing long text, extracting key points, and summarizing documentation'
  },
  'validatorAgent': {
    schema: validatorAgentResponseSchema,
    description: 'Validates plans, commands, and code before execution with risk assessment and safety checks'
  },
  'multiStepPlannerAgent': {
    schema: multiStepPlannerAgentResponseSchema,
    description: 'Creates comprehensive execution plans with dependencies, rollback strategies, and critical path analysis for complex operations'
  },
  'followThroughAgent': {
    schema: followThroughAgentResponseSchema,
    description: 'Tracks work-in-progress tasks across interactions, handles failures, and resumes from checkpoints'
  },
  'sshExplorerAgent': {
    schema: sshExplorerAgentResponseSchema,
    description: 'Performs automated system discovery and environmental mapping of servers, including services, resources, and network topology'
  }
};

/**
 * Orchestrates the routing and execution of user queries
 * Simple routing without memory or secret protection
 * 
 * @param {string} query - The user's query to process
 * @param {object} userContext - Optional context to pass to both router and final agent
 * @returns {Promise<object>} - The response from the selected agent schema
 */
export async function orchestrateQuery(query, userContext = {}) {
  // 1. Ask the Router which schema to use
  const availableSchemas = Object.entries(schemaMap).map(([name, config]) => ({
    name,
    purpose: config.description
  }));

  const routingDecision = await queryOpenAI(query, {
    schema: routerAgentResponseSchema,
    context: {
      message: "Route this query to the most appropriate schema.",
      availableOptions: availableSchemas,
      ...userContext
    }
  });

  const selectedSchemaName = routingDecision.choice;
  const selectedSchemaConfig = schemaMap[selectedSchemaName];

  if (!selectedSchemaConfig) {
    console.warn(`Router selected unknown schema: ${selectedSchemaName}. Falling back to baseAgent.`);
    // Fallback to baseAgent if router returns invalid choice
    const fallbackResponse = await queryOpenAI(query, {
      schema: schemaMap['baseAgent'].schema,
      context: userContext
    });
    return {
      ...fallbackResponse,
      _routingMetadata: {
        attemptedChoice: selectedSchemaName,
        fallbackUsed: true,
        routerExplanation: routingDecision.explanation
      }
    };
  }

  // 2. Execute the actual request using the chosen schema
  console.log(`🔀 Routing to ${selectedSchemaName}: ${routingDecision.explanation}`);
  
  const finalResponse = await queryOpenAI(query, {
    schema: selectedSchemaConfig.schema,
    context: userContext
  });

  // Attach routing metadata for transparency
  return {
    ...finalResponse,
    _routingMetadata: {
      selectedSchema: selectedSchemaName,
      routerResponse: routingDecision.response,
      routerExplanation: routingDecision.explanation
    }
  };
}

/**
 * Full-featured orchestration with integrated pipeline:
 * Lumen Personality → Redact → Contextualize → Route → Execute → Restore
 * 
 * This is the main entry point for processing user requests with:
 * - Lumen personality layer (consciousness and context interpretation)
 * - Secret protection (redaction/restoration)
 * - Memory system integration (rolling window + summaries)
 * - Intelligent routing
 * - Terminal command execution with safety gates
 * - Automatic interaction logging
 * 
 * @param {string} userQuery - The raw user query (may contain secrets)
 * @param {object} config - Execution configuration
 * @param {object} config.additionalContext - Extra context to inject into AI calls
 * @param {boolean} config.autoApprove - Auto-approve terminal commands (default: false)
 * @param {boolean} config.dryRun - Simulate execution without running commands (default: false)
 * @param {number} config.timeout - Command execution timeout in ms (default: 30000)
 * @param {boolean} config.skipMemory - Skip memory read/write (default: false)
 * @param {boolean} config.skipRedaction - Skip secret redaction (default: false)
 * @param {boolean} config.skipPersonality - Skip Lumen personality layer (default: false)
 * @returns {Promise<object>} - Complete response with execution results and metadata
 */
export async function processUserRequest(userQuery, config = {}) {
  const {
    additionalContext = {},
    autoApprove = false,
    dryRun = false,
    timeout = 30000,
    skipMemory = false,
    skipRedaction = false,
    skipPersonality = false,
    allowDangerous = false
  } = config;

  const redactor = new SecretRedactor();
  
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  🧠 LUMEN ORCHESTRATOR - Full Pipeline Engaged          ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // ═══ PHASE 0: LUMEN PERSONALITY (NEW!) ═══
  let lumenPersonality = null;
  let enhancedQuery = userQuery;
  let userResponse = null;
  
  if (!skipPersonality) {
    console.log('✨ Lumen Personality Layer - Processing context...');
    
    // Load memory for personality context
    let memoryForPersonality = '';
    if (!skipMemory) {
      try {
        memoryForPersonality = await memorySystem.getMemoryContextString();
      } catch (error) {
        console.warn('⚠️  Could not load memory for personality layer:', error.message);
      }
    }
    
    lumenPersonality = await queryOpenAI(userQuery, {
      schema: lumenPersonalityAgentResponseSchema,
      context: {
        systemContext: LUMEN_PERSONALITY_CONTEXT,
        conversationHistory: memoryForPersonality,
        ...additionalContext
      }
    });
    
    console.log(`   ➜ Intent: ${lumenPersonality.userIntent} (Urgency: ${lumenPersonality.urgency})`);
    console.log(`   ➜ Team Member: ${lumenPersonality.teamMemberContext.recognizedAs} (${lumenPersonality.teamMemberContext.tone} tone)`);
    console.log(`   ➜ Platform: ${lumenPersonality.platformContext.relevantSystems.join(', ') || 'general'}`);
    console.log(`   ➜ Safety: ${lumenPersonality.platformContext.safetyLevel}`);
    console.log(`   ➜ Proceed to agents: ${lumenPersonality.shouldProceed ? 'YES' : 'NO'}\n`);
    
    userResponse = lumenPersonality.userResponse;
    enhancedQuery = lumenPersonality.internalGuidance || userQuery;
    
    // If Lumen determines no further processing needed, return early
    if (!lumenPersonality.shouldProceed) {
      console.log('✅ Lumen handled request directly (no agent chain needed)\n');
      
      return {
        response: userResponse,
        choice: 'lumenPersonality',
        reasoning: lumenPersonality.reasoning,
        lumenPersonality,
        _metadata: {
          personalityLayer: {
            handled: true,
            directResponse: true,
            intent: lumenPersonality.userIntent,
            urgency: lumenPersonality.urgency
          },
          routing: null,
          security: { secretsRedacted: false, redactorUsed: false },
          memory: { contextProvided: false, interactionSaved: false },
          execution: { commandExecuted: false, executionStatus: null }
        }
      };
    }
  }

  // ═══ PHASE 1: REDACT ═══
  const safeQuery = skipRedaction ? enhancedQuery : redactor.redact(enhancedQuery);
  if (!skipRedaction && safeQuery !== enhancedQuery) {
    console.log('🔒 Secrets detected and redacted from query');
  }

  // ═══ PHASE 2: CONTEXTUALIZE ═══
  let memoryContext = '';
  if (!skipMemory) {
    try {
      memoryContext = await memorySystem.getMemoryContextString();
      if (memoryContext) {
        console.log('🧠 Memory context loaded (summaries + recent interactions)');
      }
    } catch (error) {
      console.warn('⚠️  Failed to load memory context:', error.message);
    }
  }

  // ═══ PHASE 3: ROUTE ═══
  const availableSchemas = Object.entries(schemaMap).map(([name, config]) => ({
    name,
    purpose: config.description
  }));

  console.log('🔀 Routing query to appropriate schema...');
  const routingDecision = await queryOpenAI(safeQuery, {
    schema: routerAgentResponseSchema,
    context: {
      memory: memoryContext,
      instructions: "Route this query to the most appropriate schema based on the user's intent.",
      availableOptions: availableSchemas,
      ...additionalContext
    }
  });

  console.log(`   ➜ Selected: ${routingDecision.choice}`);
  console.log(`   ➜ Reason: ${routingDecision.explanation}\n`);

  // ═══ PHASE 4: EXECUTE (with chosen schema) ═══
  const selectedSchema = schemaMap[routingDecision.choice]?.schema || baseAgentExtendedResponseSchema;
  
  console.log('⚙️  Executing with selected schema...');
  const aiResponse = await queryOpenAI(safeQuery, {
    schema: selectedSchema,
    context: {
      memory: memoryContext,
      ...additionalContext
    }
  });

  // ═══ PHASE 5: ACTION HANDLING ═══
  let executionResult = null;

  // Handle terminal command execution
  if (aiResponse.choice === 'terminalCommand') {
    console.log('\n💻 Terminal command detected');
    
    // Restore secrets specifically for the terminal
    const realCommand = skipRedaction ? aiResponse.terminalCommand : redactor.substitute(aiResponse.terminalCommand);
    
    console.log(`   Command: ${skipRedaction ? realCommand : aiResponse.terminalCommand}`);
    console.log(`   Reasoning: ${aiResponse.commandReasoning || aiResponse.reasoning || 'No reasoning provided'}`);
    
    // Execute with safety gates and logging
    try {
      executionResult = await executeAgentCommand(
        {
          ...aiResponse,
          command: realCommand,
          reasoning: aiResponse.commandReasoning || aiResponse.reasoning
        },
        {
          autoApprove,
          dryRun,
          timeout,
          allowDangerous
        }
      );
      
      console.log(`   Status: ${executionResult.status}`);
    } catch (error) {
      executionResult = {
        status: 'error',
        message: error.message,
        error: error.toString()
      };
      console.error(`   Execution failed: ${error.message}`);
    }
  }

  // ═══ PHASE 6: MEMORY UPDATE ═══
  if (!skipMemory) {
    try {
      const interactionData = {
        query: userQuery, // Store original query (with secrets redacted by memorySystem if needed)
        redacted: safeQuery !== userQuery
      };
      
      const responseData = {
        ...aiResponse,
        ...(executionResult && { executionResult })
      };
      
      await memorySystem.addInteraction(interactionData, responseData);
      console.log('\n✅ Interaction saved to memory');
    } catch (error) {
      console.warn('⚠️  Failed to save interaction to memory:', error.message);
    }
  }

  // ═══ FINAL RESPONSE ═══
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║  ✨ Pipeline Complete                                    ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  return {
    response: userResponse || aiResponse.response,
    ...aiResponse,
    ...(executionResult && { executionResult }),
    ...(lumenPersonality && { lumenPersonality }),
    _metadata: {
      personalityLayer: lumenPersonality ? {
        handled: true,
        directResponse: false,
        intent: lumenPersonality.userIntent,
        urgency: lumenPersonality.urgency,
        teamMember: lumenPersonality.teamMemberContext.recognizedAs,
        conversationSummary: lumenPersonality.conversationSummary
      } : null,
      routing: {
        selectedSchema: routingDecision.choice,
        routerResponse: routingDecision.response,
        routerExplanation: routingDecision.explanation
      },
      security: {
        secretsRedacted: !skipRedaction && safeQuery !== enhancedQuery,
        redactorUsed: !skipRedaction
      },
      memory: {
        contextProvided: !skipMemory && memoryContext.length > 0,
        interactionSaved: !skipMemory
      },
      execution: {
        commandExecuted: aiResponse.choice === 'terminalCommand',
        executionStatus: executionResult?.status || null
      }
    }
  };
}
