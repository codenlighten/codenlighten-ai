/**
 * Audit Logger - Logs all terminal commands and their results
 * 
 * This module provides a simple logging interface for tracking
 * command execution, results, and security decisions.
 */

/**
 * Logs a command execution to the audit trail
 * @param {object} entry - Log entry details
 * @param {string} entry.command - The command that was executed
 * @param {string} entry.status - Execution status (success, error, blocked, denied, dry-run)
 * @param {string} entry.reasoning - Why this command was chosen
 * @param {string} entry.stdout - Command output (if successful)
 * @param {string} entry.stderr - Command error output (if any)
 * @param {string} entry.message - Additional message (for errors/blocks)
 * @param {object} entry.policyReport - Security policy report (if available)
 */
export async function logCommand(entry) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    ...entry
  };

  // For now, just log to console
  // In production, this could write to a file, database, or monitoring service
  console.log(`[AUDIT] ${timestamp} - ${entry.status || 'unknown'} - ${entry.command || 'no command'}`);
  
  // TODO: Implement persistent logging
  // - Write to audit log file
  // - Send to monitoring service
  // - Store in database
  
  return logEntry;
}

export default { logCommand };
