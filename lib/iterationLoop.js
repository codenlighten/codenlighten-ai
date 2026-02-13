import { queryOpenAI } from './openaiWrapper.js';
import { executeAgentCommand } from './terminalExecutor.js';

/**
 * Resilient Iteration Loop
 * 
 * Executes a list of steps using base agent and terminal executor.
 * Features:
 * - Automatic failure detection and recovery
 * - Self-correcting: creates solutions to overcome failures
 * - Reassessment after 3 consecutive failures
 * - Maintains execution context across iterations
 * - Non-failing: continues until all steps complete or max iterations reached
 */

/**
 * Execute a single step with the base agent
 * @param {string} step - The step description to execute
 * @param {object} context - Execution context including history and previous results
 * @param {object} options - Execution options
 * @returns {Promise<object>} Step execution result
 */
async function executeStep(step, context, options = {}) {
  const { temperature = 0.5 } = options;
  
  // Build context prompt
  const contextPrompt = [];
  if (context.completedSteps.length > 0) {
    contextPrompt.push('Previously completed steps:');
    context.completedSteps.forEach((s, i) => {
      contextPrompt.push(`${i + 1}. ${s.step} → ${s.status}`);
      if (s.result) {
        contextPrompt.push(`   Result: ${JSON.stringify(s.result).substring(0, 200)}`);
      }
    });
  }
  
  if (context.failures.length > 0) {
    contextPrompt.push('\nRecent failures to be aware of:');
    context.failures.slice(-3).forEach((f, i) => {
      contextPrompt.push(`- ${f.step}: ${f.error}`);
    });
  }
  
  contextPrompt.push(`\nCurrent step to execute: ${step}`);
  contextPrompt.push('\nExecute this step. If it requires a terminal command, use terminalCommand choice. If it requires code, use code choice.');
  
  const query = contextPrompt.join('\n');
  
  try {
    const response = await queryOpenAI(query, {
      temperature,
      context: context.globalContext
    });
    
    // Handle different response types
    let result = { response, executed: false };
    
    if (response.choice === 'terminalCommand') {
      // Execute the terminal command
      const executionResult = await executeAgentCommand(
        {
          command: response.terminalCommand,
          commandReasoning: response.commandReasoning,
          requiresApproval: response.requiresApproval
        },
        {
          autoApprove: true,
          dryRun: false,
          timeout: 60000 // 60 second timeout
        }
      );
      
      result.executed = true;
      result.executionResult = executionResult;
      result.success = executionResult.status === 'success';
    } else if (response.choice === 'code') {
      result.executed = true;
      result.success = true; // Code generation is considered successful
      result.code = response.code;
    } else if (response.choice === 'response') {
      result.executed = true;
      result.success = true;
      result.message = response.response;
    }
    
    return result;
    
  } catch (error) {
    return {
      success: false,
      executed: false,
      error: error.message,
      errorDetails: error
    };
  }
}

/**
 * Create a recovery solution for a failed step
 * @param {string} step - The step that failed
 * @param {object} failureInfo - Information about the failure
 * @param {object} context - Execution context
 * @returns {Promise<object>} Recovery plan
 */
async function createRecoverySolution(step, failureInfo, context) {
  const recoveryPrompt = `
A step failed during execution. Analyze the failure and create a recovery solution.

Failed Step: ${step}

Failure Information:
${JSON.stringify(failureInfo, null, 2)}

Previous Context:
${context.completedSteps.length} steps completed successfully before this failure.

Your task: Provide a solution to overcome this failure and continue. This could be:
- An alternative approach to accomplish the same goal
- A fix for the error encountered
- A workaround for the issue
- Additional steps needed before retrying

Respond with a clear recovery plan.
`;

  try {
    const response = await queryOpenAI(recoveryPrompt, {
      temperature: 0.7,
      context: context.globalContext
    });
    
    return {
      success: true,
      recoverySolution: response.response || response.code || 'Retry with modifications',
      recoveryAction: response
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Reassess the plan after multiple failures
 * @param {array} steps - Original steps
 * @param {object} context - Execution context with failure history
 * @returns {Promise<object>} Reassessment result with modified plan
 */
async function reassessPlan(steps, context) {
  console.log('\n🔄 REASSESSING PLAN after multiple failures...\n');
  
  const reassessPrompt = `
The current execution plan has encountered multiple failures. Reassess and create an improved plan.

Original Plan:
${steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Execution History:
Completed: ${context.completedSteps.length} steps
Failed: ${context.failures.length} times

Recent Failures:
${context.failures.slice(-5).map(f => `- ${f.step}: ${f.error}`).join('\n')}

Your task: 
1. Analyze what went wrong
2. Create a revised plan that addresses the issues
3. Consider alternative approaches
4. Break down complex steps into simpler ones if needed

Provide a revised list of steps to continue from the current point.
`;

  try {
    const response = await queryOpenAI(reassessPrompt, {
      temperature: 0.8,
      context: context.globalContext
    });
    
    // Extract revised steps
    let revisedSteps = [];
    if (response.choice === 'response' && response.response) {
      // Try to parse steps from the response
      const lines = response.response.split('\n');
      revisedSteps = lines
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim());
    }
    
    return {
      success: true,
      revisedSteps: revisedSteps.length > 0 ? revisedSteps : steps,
      reasoning: response.response || 'Plan reassessed',
      originalResponse: response
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      revisedSteps: steps // Fall back to original steps
    };
  }
}

/**
 * Main iteration loop that executes steps with failure handling
 * @param {array} steps - List of steps to execute
 * @param {object} options - Execution options
 * @returns {Promise<object>} Execution summary
 */
export async function executeStepsWithResilience(steps, options = {}) {
  const {
    maxIterations = 50,
    maxConsecutiveFailures = 3,
    temperature = 0.5,
    globalContext = null,
    onProgress = null // Callback for progress updates
  } = options;
  
  console.log('\n' + '═'.repeat(80));
  console.log('🚀 RESILIENT ITERATION LOOP STARTED');
  console.log('═'.repeat(80));
  console.log(`📋 Total Steps: ${steps.length}`);
  console.log(`🔄 Max Iterations: ${maxIterations}`);
  console.log(`⚠️  Failure Threshold: ${maxConsecutiveFailures} consecutive failures`);
  console.log('═'.repeat(80) + '\n');
  
  const context = {
    completedSteps: [],
    failures: [],
    recoveryAttempts: [],
    reassessments: 0,
    globalContext
  };
  
  let currentSteps = [...steps];
  let currentStepIndex = 0;
  let iteration = 0;
  let consecutiveFailures = 0;
  
  while (currentStepIndex < currentSteps.length && iteration < maxIterations) {
    iteration++;
    const step = currentSteps[currentStepIndex];
    
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`🔄 Iteration ${iteration} | Step ${currentStepIndex + 1}/${currentSteps.length}`);
    console.log(`📝 Step: ${step}`);
    console.log(`📊 Progress: ${context.completedSteps.length} completed, ${context.failures.length} total failures`);
    console.log('─'.repeat(80));
    
    // Execute the step
    const result = await executeStep(step, context, { temperature });
    
    if (result.success) {
      console.log('✅ Step completed successfully');
      if (result.executionResult) {
        console.log(`   Status: ${result.executionResult.status}`);
        if (result.executionResult.stdout) {
          console.log(`   Output: ${result.executionResult.stdout.substring(0, 200)}`);
        }
      }
      
      context.completedSteps.push({
        step,
        iteration,
        status: 'success',
        result: result.executionResult || result.code || result.message
      });
      
      consecutiveFailures = 0; // Reset failure counter
      currentStepIndex++; // Move to next step
      
      if (onProgress) {
        onProgress({
          type: 'success',
          step,
          iteration,
          progress: (currentStepIndex / currentSteps.length) * 100
        });
      }
      
    } else {
      consecutiveFailures++;
      console.log(`❌ Step failed (consecutive failures: ${consecutiveFailures})`);
      console.log(`   Error: ${result.error || 'Unknown error'}`);
      
      context.failures.push({
        step,
        iteration,
        error: result.error || 'Unknown error',
        details: result.errorDetails
      });
      
      if (onProgress) {
        onProgress({
          type: 'failure',
          step,
          iteration,
          consecutiveFailures,
          error: result.error
        });
      }
      
      // Check if we need to reassess after multiple failures
      if (consecutiveFailures >= maxConsecutiveFailures) {
        console.log(`\n⚠️  THRESHOLD REACHED: ${consecutiveFailures} consecutive failures`);
        
        const reassessment = await reassessPlan(
          currentSteps.slice(currentStepIndex),
          context
        );
        
        if (reassessment.success) {
          context.reassessments++;
          console.log('✅ Plan reassessed successfully');
          console.log(`   Reasoning: ${reassessment.reasoning.substring(0, 200)}`);
          
          // Update remaining steps with revised plan
          currentSteps = [
            ...currentSteps.slice(0, currentStepIndex),
            ...reassessment.revisedSteps
          ];
          
          consecutiveFailures = 0; // Reset after reassessment
          
          if (onProgress) {
            onProgress({
              type: 'reassessment',
              iteration,
              newStepCount: currentSteps.length - currentStepIndex
            });
          }
        } else {
          console.log('⚠️  Reassessment failed, continuing with original plan');
        }
      } else {
        // Try to create a recovery solution
        console.log('🔧 Creating recovery solution...');
        
        const recovery = await createRecoverySolution(step, result, context);
        
        if (recovery.success) {
          console.log('✅ Recovery solution created');
          console.log(`   Solution: ${recovery.recoverySolution.substring(0, 200)}`);
          
          context.recoveryAttempts.push({
            step,
            iteration,
            solution: recovery.recoverySolution
          });
          
          // Try executing the recovery action if it's a command or code
          if (recovery.recoveryAction.choice === 'terminalCommand') {
            console.log('🔧 Executing recovery command...');
            const recoveryResult = await executeAgentCommand(
              {
                command: recovery.recoveryAction.terminalCommand,
                commandReasoning: 'Recovery attempt',
                requiresApproval: false
              },
              { autoApprove: true, timeout: 60000 }
            );
            
            if (recoveryResult.status === 'success') {
              console.log('✅ Recovery successful, retrying step');
              consecutiveFailures = 0; // Reset on successful recovery
            }
          }
          
          if (onProgress) {
            onProgress({
              type: 'recovery',
              step,
              iteration,
              solution: recovery.recoverySolution
            });
          }
        }
        
        // Continue to retry the same step (don't increment currentStepIndex)
      }
    }
  }
  
  // Final summary
  console.log('\n' + '═'.repeat(80));
  console.log('📊 EXECUTION SUMMARY');
  console.log('═'.repeat(80));
  console.log(`✅ Completed Steps: ${context.completedSteps.length}`);
  console.log(`❌ Total Failures: ${context.failures.length}`);
  console.log(`🔧 Recovery Attempts: ${context.recoveryAttempts.length}`);
  console.log(`🔄 Plan Reassessments: ${context.reassessments}`);
  console.log(`🔁 Total Iterations: ${iteration}`);
  console.log(`📈 Success Rate: ${((context.completedSteps.length / currentSteps.length) * 100).toFixed(1)}%`);
  console.log('═'.repeat(80) + '\n');
  
  const allCompleted = currentStepIndex >= currentSteps.length;
  const reachedMaxIterations = iteration >= maxIterations;
  
  // Verification phase if enabled
  let verification = null;
  if (options.verify && allCompleted) {
    console.log('🔍 VERIFICATION PHASE\n');
    verification = await verifyRequestFulfillment(steps, context, options);
    
    if (verification.fulfilled) {
      console.log('✅ VERIFICATION PASSED - Request fully fulfilled\n');
    } else {
      console.log('⚠️  VERIFICATION ISSUES DETECTED\n');
      if (verification.issues.length > 0) {
        console.log('Issues found:');
        verification.issues.forEach((issue, i) => {
          console.log(`  ${i + 1}. ${issue}`);
        });
        console.log('');
      }
    }
  }
  
  return {
    success: allCompleted,
    completed: allCompleted,
    reachedMaxIterations,
    totalSteps: currentSteps.length,
    completedSteps: context.completedSteps,
    failureCount: context.failures.length,
    failures: context.failures,
    recoveryAttempts: context.recoveryAttempts,
    reassessments: context.reassessments,
    iterations: iteration,
    successRate: (context.completedSteps.length / currentSteps.length) * 100,
    verification
  };
}

/**
 * Verify that the original request was fulfilled
 * @param {array} originalSteps - Original steps that were requested
 * @param {object} context - Execution context with results
 * @param {object} options - Options including verification prompt
 * @returns {Promise<object>} Verification result
 */
async function verifyRequestFulfillment(originalSteps, context, options = {}) {
  const {
    verificationPrompt = null,
    temperature = 0.5
  } = options;
  
  console.log('📋 Verifying request fulfillment...\n');
  
  // Build verification prompt
  const prompt = verificationPrompt || `
Review the completed work and verify if the original request was fully fulfilled.

ORIGINAL REQUEST (Steps to complete):
${originalSteps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

COMPLETED WORK:
${context.completedSteps.map((s, i) => `
Step ${i + 1}: ${s.step}
Status: ${s.status}
Result: ${JSON.stringify(s.result).substring(0, 200)}
`).join('\n')}

${context.failures.length > 0 ? `
FAILURES ENCOUNTERED:
${context.failures.map(f => `- ${f.step}: ${f.error}`).join('\n')}
` : ''}

Your task:
1. Compare the original request with what was actually completed
2. Check if all requirements were met
3. Identify any discrepancies or missing elements
4. Verify the quality and correctness of the work

Provide a detailed assessment of whether the request was fully fulfilled.
`;

  try {
    const response = await queryOpenAI(prompt, {
      temperature,
      context: context.globalContext
    });
    
    // Parse the response to determine if fulfilled
    const responseText = response.response || response.code || JSON.stringify(response);
    const fulfilled = !/(not fulfilled|incomplete|missing|failed|issue|problem)/i.test(responseText) ||
                     /(fully fulfilled|complete|success|all requirements met)/i.test(responseText);
    
    // Extract issues if mentioned
    const issues = [];
    const lines = responseText.split('\n');
    for (const line of lines) {
      if (/^[-•*]\s+/i.test(line.trim()) || /issue|problem|missing|incomplete/i.test(line)) {
        issues.push(line.trim().replace(/^[-•*]\s+/, ''));
      }
    }
    
    console.log('📝 Verification Analysis:');
    console.log(responseText.substring(0, 500));
    if (responseText.length > 500) {
      console.log('...');
    }
    console.log('');
    
    return {
      fulfilled,
      issues: issues.slice(0, 10), // Limit to 10 issues
      analysis: responseText,
      response
    };
  } catch (error) {
    console.log('⚠️  Verification failed:', error.message);
    return {
      fulfilled: false,
      issues: [`Verification error: ${error.message}`],
      analysis: null,
      error: error.message
    };
  }
}

/**
 * Convenience function to execute steps from a plan response
 * @param {object} planResponse - Response from planStepsAgent
 * @param {object} options - Execution options
 * @returns {Promise<object>} Execution summary
 */
export async function executePlanWithResilience(planResponse, options = {}) {
  let steps;
  
  if (Array.isArray(planResponse)) {
    steps = planResponse;
  } else if (planResponse.steps) {
    // Handle planStepsAgent response format
    if (Array.isArray(planResponse.steps) && planResponse.steps[0]?.stepDescription) {
      steps = planResponse.steps.map(s => s.stepDescription);
    } else {
      steps = planResponse.steps;
    }
  } else {
    throw new Error('Invalid plan response format');
  }
  
  return executeStepsWithResilience(steps, options);
}
