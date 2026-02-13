/**
 * Follow-Through Agent Schema (State Machine)
 * 
 * Purpose: Maintains state for work-in-progress tasks, enabling the system
 * to track execution across multiple interactions, handle failures gracefully,
 * and resume from the last successful checkpoint.
 * 
 * This schema implements a state machine pattern where the agent can:
 * - Track which steps have been completed
 * - Identify the current step being executed
 * - Detect failures and decide on recovery actions
 * - Determine when the entire task is finished
 * 
 * Use Cases:
 * - Multi-step installations that may fail partway through
 * - Long-running operations that span multiple user interactions
 * - Resume after errors without restarting from beginning
 * - Track progress across terminal disconnections
 * - Provide status updates on complex ongoing tasks
 */
export const followThroughAgentResponseSchema = {
  type: "object",
  properties: {
    taskId: {
      type: "string",
      description: "Unique identifier for this task (generated or from previous interaction)"
    },
    taskTitle: {
      type: "string",
      description: "Human-readable title of the overall task being tracked"
    },
    taskStatus: {
      type: "string",
      enum: ["not-started", "in-progress", "paused", "completed", "failed", "rolled-back"],
      description: "Overall status of the task"
    },
    totalSteps: {
      type: "number",
      description: "Total number of steps in this task"
    },
    currentStepIndex: {
      type: "number",
      description: "Zero-based index of the step currently being executed or next to execute"
    },
    completedSteps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          stepId: { type: "string" },
          title: { type: "string" },
          completedAt: { type: "string" },
          result: { 
            type: "string",
            enum: ["success", "success-with-warnings", "skipped"]
          },
          output: { type: "string" }
        },
        required: ["stepId", "title", "completedAt", "result", "output"],
        additionalProperties: false
      },
      description: "Array of steps that have been successfully completed"
    },
    currentStep: {
      type: "object",
      properties: {
        stepId: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        command: { type: "string" },
        attemptCount: { type: "number" },
        status: {
          type: "string",
          enum: ["ready", "executing", "verifying", "failed", "retrying"]
        }
      },
      required: ["stepId", "title", "description", "command", "attemptCount", "status"],
      additionalProperties: false,
      description: "Details about the step currently being executed"
    },
    remainingSteps: {
      type: "array",
      items: {
        type: "object",
        properties: {
          stepId: { type: "string" },
          title: { type: "string" },
          description: { type: "string" }
        },
        required: ["stepId", "title", "description"],
        additionalProperties: false
      },
      description: "Steps that still need to be executed"
    },
    isTaskFinished: {
      type: "boolean",
      description: "True if all steps are complete or task has been terminated"
    },
    lastError: {
      type: "string",
      description: "Error message from most recent failure, or empty string if no errors"
    },
    recoveryAction: {
      type: "string",
      enum: ["retry-current", "skip-current", "rollback-previous", "abort-task", "none"],
      description: "Recommended action to recover from last error"
    },
    recoveryReasoning: {
      type: "string",
      description: "Explanation of why the recovery action was chosen"
    },
    nextAction: {
      type: "string",
      description: "Description of what should happen next (execute step, verify, etc.)"
    },
    checkpointData: {
      type: "object",
      properties: {
        canResumeFrom: { type: "string" },
        stateSnapshot: { type: "string" }
      },
      required: ["canResumeFrom", "stateSnapshot"],
      additionalProperties: false,
      description: "Checkpoint information for resuming after interruption"
    },
    progressPercentage: {
      type: "number",
      description: "Progress as a percentage (0-100) based on completed steps"
    },
    estimatedTimeRemaining: {
      type: "string",
      description: "Human-readable estimate of time to completion"
    }
  },
  required: [
    "taskId",
    "taskTitle",
    "taskStatus",
    "totalSteps",
    "currentStepIndex",
    "completedSteps",
    "currentStep",
    "remainingSteps",
    "isTaskFinished",
    "lastError",
    "recoveryAction",
    "recoveryReasoning",
    "nextAction",
    "checkpointData",
    "progressPercentage",
    "estimatedTimeRemaining"
  ],
  additionalProperties: false
};
