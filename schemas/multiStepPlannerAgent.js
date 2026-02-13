/**
 * Multi-Step Planner Agent Schema
 * 
 * Purpose: Creates comprehensive execution plans with dependency tracking,
 * critical path analysis, and rollback strategies for complex operations.
 * 
 * Unlike the simple 'plan' choice in baseAgent, this schema handles:
 * - Complex dependency chains
 * - Parallel vs sequential execution
 * - Failure recovery and rollback
 * - Verification checkpoints
 * 
 * Use Cases:
 * - Database migrations with rollback capability
 * - Multi-server deployment orchestration
 * - Complex refactoring across multiple files
 * - Infrastructure provisioning with dependencies
 * - System upgrades with verification steps
 */
export const multiStepPlannerAgentResponseSchema = {
  type: "object",
  properties: {
    planTitle: {
      type: "string",
      description: "Concise title describing what this plan accomplishes"
    },
    objective: {
      type: "string",
      description: "Detailed description of the end goal and success criteria"
    },
    steps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          stepId: { 
            type: "string",
            description: "Unique identifier for this step (e.g., 'step-1', 'deploy-frontend')"
          },
          title: { 
            type: "string",
            description: "Brief title of what this step does"
          },
          description: { 
            type: "string",
            description: "Detailed explanation of this step's purpose and actions"
          },
          command: { 
            type: "string",
            description: "Terminal command to execute, or empty string if manual action"
          },
          dependsOn: {
            type: "array",
            items: { type: "string" },
            description: "Array of stepIds that must complete before this step can run"
          },
          canRunInParallel: {
            type: "boolean",
            description: "Whether this step can run simultaneously with other parallel steps"
          },
          estimatedDuration: {
            type: "string",
            description: "Human-readable time estimate (e.g., '30 seconds', '5 minutes')"
          },
          verificationCommand: {
            type: "string",
            description: "Command to verify this step succeeded, or empty if not verifiable"
          },
          rollbackCommand: {
            type: "string",
            description: "Command to undo this step if rollback is needed, or empty if not reversible"
          },
          riskLevel: {
            type: "string",
            enum: ["low", "medium", "high", "critical"],
            description: "Risk level of this specific step"
          }
        },
        required: [
          "stepId",
          "title", 
          "description",
          "command",
          "dependsOn",
          "canRunInParallel",
          "estimatedDuration",
          "verificationCommand",
          "rollbackCommand",
          "riskLevel"
        ],
        additionalProperties: false
      },
      description: "Ordered array of steps with dependency information"
    },
    criticalPath: {
      type: "array",
      items: { type: "string" },
      description: "Array of stepIds that form the critical path (longest dependency chain)"
    },
    potentialBlockers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          blocker: { type: "string" },
          affectedSteps: { 
            type: "array",
            items: { type: "string" }
          },
          mitigation: { type: "string" }
        },
        required: ["blocker", "affectedSteps", "mitigation"],
        additionalProperties: false
      },
      description: "Potential issues that could block execution and how to address them"
    },
    rollbackStrategy: {
      type: "string",
      description: "Overall strategy for rolling back the entire plan if critical failure occurs"
    },
    estimatedTotalTime: {
      type: "string",
      description: "Human-readable total time estimate considering dependencies and parallel execution"
    },
    prerequisites: {
      type: "array",
      items: { type: "string" },
      description: "System requirements, permissions, or environment setup needed before starting"
    },
    reasoning: {
      type: "string",
      description: "Explanation of why steps are ordered this way and key architectural decisions"
    }
  },
  required: [
    "planTitle",
    "objective",
    "steps",
    "criticalPath",
    "potentialBlockers",
    "rollbackStrategy",
    "estimatedTotalTime",
    "prerequisites",
    "reasoning"
  ],
  additionalProperties: false
};
