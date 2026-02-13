/**
 * Validator Agent Schema
 * 
 * Purpose: Acts as a "peer reviewer" that validates plans, commands, and code
 * before execution begins. Provides risk assessment and potential issues.
 * 
 * This schema implements the "99% certainty path" by stress-testing proposed
 * actions before they're executed, catching potential failures early.
 * 
 * Use Cases:
 * - Validate multi-step execution plans for logical consistency
 * - Assess risk level of terminal commands before execution
 * - Review code changes for breaking changes and side effects
 * - Identify missing dependencies or prerequisites
 * - Suggest safer alternatives to dangerous operations
 */
export const validatorAgentResponseSchema = {
  type: "object",
  properties: {
    validation: {
      type: "string",
      enum: ["approved", "approved-with-warnings", "rejected", "needs-modification"],
      description: "Overall validation result. 'approved' means safe to proceed, 'rejected' means do not execute."
    },
    riskLevel: {
      type: "string",
      enum: ["low", "medium", "high", "critical"],
      description: "Risk assessment of the proposed action. Critical means potential for data loss or system damage."
    },
    issues: {
      type: "array",
      items: { type: "string" },
      description: "List of potential problems identified. Empty if no issues found."
    },
    warnings: {
      type: "array",
      items: { type: "string" },
      description: "Non-blocking concerns that should be addressed. Empty if no warnings."
    },
    missingPrerequisites: {
      type: "array",
      items: { type: "string" },
      description: "Required dependencies, environment variables, or setup steps that are missing."
    },
    suggestedModifications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          original: { type: "string" },
          suggested: { type: "string" },
          reason: { type: "string" }
        },
        required: ["original", "suggested", "reason"],
        additionalProperties: false
      },
      description: "Specific changes recommended to improve safety or reliability."
    },
    reasoning: {
      type: "string",
      description: "Detailed explanation of the validation decision, including what was checked and why."
    },
    estimatedSuccessRate: {
      type: "number",
      description: "Confidence percentage (0-100) that the proposed action will succeed without errors."
    },
    saferAlternatives: {
      type: "array",
      items: { type: "string" },
      description: "Alternative approaches that achieve the same goal with lower risk. Empty if none available."
    }
  },
  required: [
    "validation",
    "riskLevel",
    "issues",
    "warnings",
    "missingPrerequisites",
    "suggestedModifications",
    "reasoning",
    "estimatedSuccessRate",
    "saferAlternatives"
  ],
  additionalProperties: false
};
