/**
 * Example: Using the Lumen Orchestrator Programmatically
 * 
 * Demonstrates both simple routing and full pipeline integration
 */

import { orchestrateQuery, processUserRequest } from './schemas/agentOrchestrator.js';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  Example: Lumen Orchestrator Usage                        ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// ═══════════════════════════════════════════════════════════════
// Example 1: Simple Routing (No Memory, No Secret Protection)
// ═══════════════════════════════════════════════════════════════
async function example1() {
  console.log('📋 Example 1: Simple Routing\n');
  
  const response = await orchestrateQuery(
    "What is the capital of France?",
    {
      additionalInfo: "User prefers concise answers"
    }
  );
  
  console.log('Response:', response.response);
  console.log('Router chose:', response._routingMetadata.selectedSchema);
  console.log('');
}

// ═══════════════════════════════════════════════════════════════
// Example 2: Full Pipeline - Conversational Query
// ═══════════════════════════════════════════════════════════════
async function example2() {
  console.log('📋 Example 2: Full Pipeline - Conversation\n');
  
  const response = await processUserRequest(
    "Explain what a REST API is in simple terms",
    {
      skipMemory: true, // For this demo, skip memory
      skipRedaction: true // No secrets in this query
    }
  );
  
  console.log('Response:', response.response);
  console.log('Schema used:', response._metadata.routing.selectedSchema);
  console.log('');
}

// ═══════════════════════════════════════════════════════════════
// Example 3: Code Generation
// ═══════════════════════════════════════════════════════════════
async function example3() {
  console.log('📋 Example 3: Code Generation\n');
  
  const response = await processUserRequest(
    "Write a Python function to calculate factorial",
    {
      skipMemory: true,
      skipRedaction: true
    }
  );
  
  if (response.choice === 'code') {
    console.log('Generated code:');
    console.log('```' + response.language);
    console.log(response.code);
    console.log('```');
    console.log('\nExplanation:', response.codeExplanation);
  }
  console.log('');
}

// ═══════════════════════════════════════════════════════════════
// Example 4: Terminal Command (Dry Run)
// ═══════════════════════════════════════════════════════════════
async function example4() {
  console.log('📋 Example 4: Terminal Command (Dry Run)\n');
  
  const response = await processUserRequest(
    "List all files in the current directory with details",
    {
      skipMemory: true,
      skipRedaction: true,
      dryRun: true // Don't actually execute
    }
  );
  
  if (response.choice === 'terminalCommand') {
    console.log('Command:', response.terminalCommand);
    console.log('Reasoning:', response.commandReasoning);
    console.log('Execution:', response.executionResult ? 'Completed' : 'Dry run mode');
  }
  console.log('');
}

// ═══════════════════════════════════════════════════════════════
// Example 5: Summarization
// ═══════════════════════════════════════════════════════════════
async function example5() {
  console.log('📋 Example 5: Text Summarization\n');
  
  const longText = `
    Artificial Intelligence (AI) has transformed numerous industries over the past decade.
    From healthcare to finance, AI technologies are being deployed to automate tasks,
    generate insights, and improve decision-making. Machine learning, a subset of AI,
    enables systems to learn from data without explicit programming. Deep learning,
    which uses neural networks with multiple layers, has been particularly successful
    in areas like image recognition and natural language processing. However, AI also
    raises important ethical questions about privacy, bias, and job displacement that
    society must address.
  `;
  
  const response = await processUserRequest(
    `Summarize this text: ${longText}`,
    {
      skipMemory: true,
      skipRedaction: true
    }
  );
  
  if (response.summary) {
    console.log('Summary:', response.summary);
    console.log('\nReasoning:', response.reasoning);
  }
  console.log('');
}

// ═══════════════════════════════════════════════════════════════
// Example 6: With Secret Redaction
// ═══════════════════════════════════════════════════════════════
async function example6() {
  console.log('📋 Example 6: Secret Redaction in Action\n');
  
  const queryWithSecret = "Connect to the database with password: SuperSecret123!";
  
  const response = await processUserRequest(queryWithSecret, {
    skipMemory: true,
    skipRedaction: false // Enable redaction
  });
  
  console.log('Query contained secrets:', response._metadata.security.secretsRedacted);
  console.log('Response:', response.response);
  console.log('');
}

// ═══════════════════════════════════════════════════════════════
// Run all examples
// ═══════════════════════════════════════════════════════════════
async function runExamples() {
  try {
    await example1();
    await example2();
    await example3();
    await example4();
    await example5();
    await example6();
    
    console.log('✅ All examples completed successfully!\n');
  } catch (error) {
    console.error('❌ Error running examples:', error.message);
    console.error(error.stack);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples();
}

export { example1, example2, example3, example4, example5, example6 };
