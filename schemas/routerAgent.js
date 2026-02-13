/**
 * Router Agent Schema
 * 
 * Purpose: Analyzes the user's query and selects the most appropriate 
 * functional schema for processing.
 * 
 * Acts as a "traffic controller" that evaluates user intent and routes
 * requests to the best-suited agent schema (Base, Summarize, Plan, etc.)
 * 
 * Use Cases:
 * - Determining whether a query needs conversation, code generation, or summarization
 * - Intelligently routing complex requests to specialized handlers
 * - Providing transparent decision-making about query classification
 */
export const routerAgentResponseSchema = {
  type: "object",
  properties: {
    response: {
      type: "string",
      description: "A brief conversational acknowledgement or preview of the routing decision."
    },
    explanation: {
      type: "string",
      description: "The reasoning behind why a specific schema was chosen based on the user's intent and the available options."
    },
    choice: {
      type: "string",
      description: "The name of the schema to route the user's question to. This should match one of the keys provided in the available schemas context."
    }
  },
  required: ["response", "explanation", "choice"],
  additionalProperties: false
};
