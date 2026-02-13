/**
 * Advanced Example: Multi-Agent Coordination
 * 
 * Demonstrates how the new schemas work together to handle complex,
 * multi-step operations with validation, planning, and execution tracking.
 * 
 * This example shows the "Contract-Driven Development" philosophy in action:
 * 1. Router identifies the need for a complex operation
 * 2. MultiStepPlanner creates a detailed execution plan
 * 3. Validator peer-reviews the plan before execution
 * 4. FollowThrough tracks state as steps execute
 * 5. SSHExplorer verifies environmental readiness
 */

import { queryOpenAI } from '../lib/openaiWrapper.js';
import { multiStepPlannerAgentResponseSchema } from '../schemas/multiStepPlannerAgent.js';
import { validatorAgentResponseSchema } from '../schemas/validatorAgent.js';
import { followThroughAgentResponseSchema } from '../schemas/followThroughAgent.js';
import { sshExplorerAgentResponseSchema } from '../schemas/sshExplorerAgent.js';

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  Advanced Multi-Agent Coordination Example                ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

// ═══════════════════════════════════════════════════════════════
// Example 1: Multi-Step Planner - Database Migration
// ═══════════════════════════════════════════════════════════════
async function example1_complexPlanning() {
  console.log('📋 Example 1: Complex Multi-Step Planning\n');
  console.log('Scenario: Migrate PostgreSQL database to new server\n');
  
  const plan = await queryOpenAI(
    "Create a detailed plan for migrating a PostgreSQL database from server A to server B with zero downtime, including backup, replication setup, cutover, and rollback strategy.",
    {
      schema: multiStepPlannerAgentResponseSchema,
      context: {
        environment: "production",
        constraints: "Zero downtime required, must handle rollback"
      }
    }
  );
  
  console.log('Plan Title:', plan.planTitle);
  console.log('Objective:', plan.objective);
  console.log(`\nTotal Steps: ${plan.steps.length}`);
  console.log('Critical Path:', plan.criticalPath.join(' → '));
  console.log(`Estimated Total Time: ${plan.estimatedTotalTime}\n`);
  
  console.log('Steps:');
  plan.steps.forEach((step, i) => {
    console.log(`  ${i + 1}. [${step.riskLevel.toUpperCase()}] ${step.title}`);
    console.log(`     Command: ${step.command || 'N/A'}`);
    console.log(`     Duration: ${step.estimatedDuration}`);
    if (step.dependsOn.length > 0) {
      console.log(`     Depends on: ${step.dependsOn.join(', ')}`);
    }
  });
  
  console.log('\nPotential Blockers:');
  plan.potentialBlockers.forEach(blocker => {
    console.log(`  • ${blocker.blocker}`);
    console.log(`    Mitigation: ${blocker.mitigation}`);
  });
  
  console.log('\nRollback Strategy:', plan.rollbackStrategy);
  console.log('\n' + '─'.repeat(60) + '\n');
  
  return plan;
}

// ═══════════════════════════════════════════════════════════════
// Example 2: Validator - Peer Review the Plan
// ═══════════════════════════════════════════════════════════════
async function example2_validatePlan(plan) {
  console.log('📋 Example 2: Plan Validation (Peer Review)\n');
  console.log('Submitting migration plan to validator...\n');
  
  const validation = await queryOpenAI(
    `Validate this database migration plan for safety and completeness: ${JSON.stringify(plan)}`,
    {
      schema: validatorAgentResponseSchema,
      context: {
        validationType: "execution-plan",
        criticalityLevel: "production"
      }
    }
  );
  
  console.log(`Validation Result: ${validation.validation.toUpperCase()}`);
  console.log(`Risk Level: ${validation.riskLevel.toUpperCase()}`);
  console.log(`Success Confidence: ${validation.estimatedSuccessRate}%\n`);
  
  if (validation.issues.length > 0) {
    console.log('🚨 Issues Found:');
    validation.issues.forEach(issue => console.log(`  • ${issue}`));
    console.log('');
  }
  
  if (validation.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    validation.warnings.forEach(warning => console.log(`  • ${warning}`));
    console.log('');
  }
  
  if (validation.missingPrerequisites.length > 0) {
    console.log('📦 Missing Prerequisites:');
    validation.missingPrerequisites.forEach(prereq => console.log(`  • ${prereq}`));
    console.log('');
  }
  
  if (validation.suggestedModifications.length > 0) {
    console.log('💡 Suggested Modifications:');
    validation.suggestedModifications.forEach(mod => {
      console.log(`  Original: ${mod.original}`);
      console.log(`  Suggested: ${mod.suggested}`);
      console.log(`  Reason: ${mod.reason}\n`);
    });
  }
  
  if (validation.saferAlternatives.length > 0) {
    console.log('🛡️  Safer Alternatives:');
    validation.saferAlternatives.forEach(alt => console.log(`  • ${alt}`));
    console.log('');
  }
  
  console.log('Reasoning:', validation.reasoning);
  console.log('\n' + '─'.repeat(60) + '\n');
  
  return validation;
}

// ═══════════════════════════════════════════════════════════════
// Example 3: SSH Explorer - Environment Discovery
// ═══════════════════════════════════════════════════════════════
async function example3_environmentDiscovery() {
  console.log('📋 Example 3: SSH Environment Discovery\n');
  console.log('Exploring target server environment...\n');
  
  const exploration = await queryOpenAI(
    "Perform a comprehensive discovery of the production database server, focusing on PostgreSQL installation, disk space, network connectivity, and running services.",
    {
      schema: sshExplorerAgentResponseSchema,
      context: {
        serverRole: "database-server",
        focusAreas: ["postgresql", "disk-space", "network", "services"]
      }
    }
  );
  
  console.log('Exploration Summary:', exploration.explorationSummary);
  console.log('\n📊 System Info:');
  console.log(`  Hostname: ${exploration.systemInfo.hostname}`);
  console.log(`  OS: ${exploration.systemInfo.operatingSystem}`);
  console.log(`  Uptime: ${exploration.systemInfo.uptime}`);
  console.log(`  Architecture: ${exploration.systemInfo.architecture}`);
  
  console.log('\n💾 System Resources:');
  console.log(`  CPU Usage: ${exploration.systemResources.cpuUsage}`);
  console.log(`  Memory Usage: ${exploration.systemResources.memoryUsage}`);
  console.log(`  Load Average: ${exploration.systemResources.loadAverage}`);
  
  console.log('\n  Disk Usage:');
  exploration.systemResources.diskUsage.forEach(disk => {
    console.log(`    ${disk.mountPoint}: ${disk.usagePercent} (${disk.used} / ${disk.size})`);
  });
  
  console.log('\n🔌 Active Services:');
  exploration.activeServices.slice(0, 5).forEach(service => {
    console.log(`  • ${service.serviceName} [${service.status}] - Port ${service.port}`);
  });
  
  console.log('\n🌐 Network Topology:');
  exploration.networkTopology.interfaces.forEach(iface => {
    console.log(`  • ${iface.name}: ${iface.ipAddress} [${iface.status}]`);
  });
  
  console.log('\n📦 Installed Software:');
  exploration.installedSoftware.forEach(software => {
    console.log(`  • ${software.name} ${software.version} (${software.category})`);
  });
  
  if (exploration.securityFindings.length > 0) {
    console.log('\n🔒 Security Findings:');
    exploration.securityFindings.forEach(finding => {
      console.log(`  [${finding.severity.toUpperCase()}] ${finding.finding}`);
      console.log(`    → ${finding.recommendation}`);
    });
  }
  
  console.log('\n💡 Recommendations:');
  exploration.recommendations.forEach(rec => console.log(`  • ${rec}`));
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  return exploration;
}

// ═══════════════════════════════════════════════════════════════
// Example 4: Follow-Through - Track Execution State
// ═══════════════════════════════════════════════════════════════
async function example4_trackExecution(plan) {
  console.log('📋 Example 4: Follow-Through State Tracking\n');
  console.log('Simulating execution tracking for migration plan...\n');
  
  // Simulate starting the task
  const state = await queryOpenAI(
    `Initialize tracking for this migration plan and simulate that we've completed the first 3 steps successfully, but step 4 failed with "Connection timeout to target server": ${JSON.stringify(plan)}`,
    {
      schema: followThroughAgentResponseSchema,
      context: {
        taskType: "database-migration",
        initialState: "in-progress-with-failure"
      }
    }
  );
  
  console.log(`Task: ${state.taskTitle} [${state.taskStatus.toUpperCase()}]`);
  console.log(`Task ID: ${state.taskId}`);
  console.log(`Progress: ${state.progressPercentage}% (Step ${state.currentStepIndex + 1}/${state.totalSteps})`);
  console.log(`Estimated Time Remaining: ${state.estimatedTimeRemaining}\n`);
  
  console.log('✅ Completed Steps:');
  state.completedSteps.forEach(step => {
    console.log(`  • ${step.title} [${step.result}]`);
    console.log(`    Completed at: ${step.completedAt}`);
  });
  
  console.log('\n⚡ Current Step:');
  console.log(`  • ${state.currentStep.title} [${state.currentStep.status.toUpperCase()}]`);
  console.log(`    Attempt: ${state.currentStep.attemptCount}`);
  console.log(`    Command: ${state.currentStep.command}`);
  
  if (state.lastError) {
    console.log('\n❌ Last Error:', state.lastError);
    console.log(`Recovery Action: ${state.recoveryAction.toUpperCase()}`);
    console.log(`Reasoning: ${state.recoveryReasoning}`);
  }
  
  console.log('\n📋 Remaining Steps:');
  state.remainingSteps.forEach(step => {
    console.log(`  • ${step.title}`);
  });
  
  console.log('\n🔄 Checkpoint Data:');
  console.log(`  Can resume from: ${state.checkpointData.canResumeFrom}`);
  console.log(`  State snapshot available: ${state.checkpointData.stateSnapshot.length > 0 ? 'Yes' : 'No'}`);
  
  console.log('\n➡️  Next Action:', state.nextAction);
  console.log(`Task Finished: ${state.isTaskFinished ? 'Yes' : 'No'}`);
  
  console.log('\n' + '─'.repeat(60) + '\n');
  
  return state;
}

// ═══════════════════════════════════════════════════════════════
// Example 5: Complete Workflow - All Agents Together
// ═══════════════════════════════════════════════════════════════
async function example5_completeWorkflow() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Complete Workflow: All Agents Working Together           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log('Scenario: User asks "Migrate the production database to the new server"\n');
  console.log('The system coordinates multiple agents to ensure safe execution:\n');
  
  // Step 1: Create comprehensive plan
  console.log('🔹 Step 1: MultiStepPlanner creates detailed migration plan');
  const plan = await example1_complexPlanning();
  
  // Step 2: Validator peer-reviews the plan
  console.log('🔹 Step 2: Validator peer-reviews plan for safety');
  const validation = await example2_validatePlan(plan);
  
  // Only proceed if validation passes
  if (validation.validation === 'rejected') {
    console.log('❌ Plan rejected by validator. Execution aborted.\n');
    return;
  }
  
  // Step 3: SSHExplorer checks environment
  console.log('🔹 Step 3: SSHExplorer verifies server environment');
  const exploration = await example3_environmentDiscovery();
  
  // Step 4: FollowThrough manages execution
  console.log('🔹 Step 4: FollowThrough tracks execution state');
  const executionState = await example4_trackExecution(plan);
  
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Workflow Complete - System Ready for Execution           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log('📊 Final Status:');
  console.log(`  • Plan Quality: ${validation.estimatedSuccessRate}% confidence`);
  console.log(`  • Environment: ${exploration.systemInfo.operatingSystem} on ${exploration.systemInfo.hostname}`);
  console.log(`  • Execution Progress: ${executionState.progressPercentage}%`);
  console.log(`  • Risk Level: ${validation.riskLevel.toUpperCase()}`);
  console.log('');
}

// ═══════════════════════════════════════════════════════════════
// Run all examples
// ═══════════════════════════════════════════════════════════════
async function runExamples() {
  try {
    // Run individual examples (skip for now to avoid redundancy)
    // await example1_complexPlanning();
    // await example3_environmentDiscovery();
    
    // Run complete workflow showing all agents working together
    await example5_completeWorkflow();
    
    console.log('✅ Advanced examples completed successfully!\n');
    console.log('Key Takeaways:');
    console.log('  1. Router identifies complexity and delegates to specialist agents');
    console.log('  2. MultiStepPlanner creates comprehensive execution plans');
    console.log('  3. Validator provides peer review before execution (99% path)');
    console.log('  4. SSHExplorer maps environment to ensure readiness');
    console.log('  5. FollowThrough tracks state and handles failures gracefully');
    console.log('');
    console.log('This is Contract-Driven Development at scale! 🚀\n');
  } catch (error) {
    console.error('❌ Error running examples:', error.message);
    console.error(error.stack);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples();
}

export { 
  example1_complexPlanning, 
  example2_validatePlan, 
  example3_environmentDiscovery,
  example4_trackExecution,
  example5_completeWorkflow
};
