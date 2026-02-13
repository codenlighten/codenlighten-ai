/**
 * SSH Explorer Agent Schema
 * 
 * Purpose: Performs automated environmental discovery and mapping of remote
 * systems. Instead of running one-off commands, this schema orchestrates
 * comprehensive system analysis to understand infrastructure topology.
 * 
 * This schema enables the system to act as a "reconnaissance agent" that can:
 * - Map directory structures and file systems
 * - Discover running services and processes
 * - Analyze system resources and capacity
 * - Identify network topology and connections
 * - Detect installed software and versions
 * 
 * Use Cases:
 * - Initial survey of production servers
 * - Security audits and compliance checking
 * - Capacity planning and resource optimization
 * - Incident response and system forensics
 * - Documentation generation for undocumented systems
 */
export const sshExplorerAgentResponseSchema = {
  type: "object",
  properties: {
    explorationSummary: {
      type: "string",
      description: "High-level overview of what was discovered on the system"
    },
    systemInfo: {
      type: "object",
      properties: {
        hostname: { type: "string" },
        operatingSystem: { type: "string" },
        kernelVersion: { type: "string" },
        architecture: { type: "string" },
        uptime: { type: "string" }
      },
      required: ["hostname", "operatingSystem", "kernelVersion", "architecture", "uptime"],
      additionalProperties: false,
      description: "Basic system identification information"
    },
    directoryStructure: {
      type: "array",
      items: {
        type: "object",
        properties: {
          path: { type: "string" },
          type: { 
            type: "string",
            enum: ["directory", "file", "symlink", "socket", "device"]
          },
          permissions: { type: "string" },
          owner: { type: "string" },
          size: { type: "string" },
          significance: { type: "string" }
        },
        required: ["path", "type", "permissions", "owner", "size", "significance"],
        additionalProperties: false
      },
      description: "Important directories and files discovered during exploration"
    },
    activeServices: {
      type: "array",
      items: {
        type: "object",
        properties: {
          serviceName: { type: "string" },
          status: {
            type: "string",
            enum: ["running", "stopped", "failed", "unknown"]
          },
          pid: { type: "string" },
          port: { type: "string" },
          description: { type: "string" }
        },
        required: ["serviceName", "status", "pid", "port", "description"],
        additionalProperties: false
      },
      description: "Services and daemons currently running on the system"
    },
    systemResources: {
      type: "object",
      properties: {
        cpuUsage: { type: "string" },
        memoryUsage: { type: "string" },
        diskUsage: {
          type: "array",
          items: {
            type: "object",
            properties: {
              filesystem: { type: "string" },
              mountPoint: { type: "string" },
              size: { type: "string" },
              used: { type: "string" },
              available: { type: "string" },
              usagePercent: { type: "string" }
            },
            required: ["filesystem", "mountPoint", "size", "used", "available", "usagePercent"],
            additionalProperties: false
          }
        },
        loadAverage: { type: "string" }
      },
      required: ["cpuUsage", "memoryUsage", "diskUsage", "loadAverage"],
      additionalProperties: false,
      description: "Current resource utilization metrics"
    },
    networkTopology: {
      type: "object",
      properties: {
        interfaces: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              ipAddress: { type: "string" },
              macAddress: { type: "string" },
              status: { type: "string" }
            },
            required: ["name", "ipAddress", "macAddress", "status"],
            additionalProperties: false
          }
        },
        openPorts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              port: { type: "string" },
              protocol: { type: "string" },
              service: { type: "string" },
              state: { type: "string" }
            },
            required: ["port", "protocol", "service", "state"],
            additionalProperties: false
          }
        },
        activeConnections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              localAddress: { type: "string" },
              remoteAddress: { type: "string" },
              state: { type: "string" },
              process: { type: "string" }
            },
            required: ["localAddress", "remoteAddress", "state", "process"],
            additionalProperties: false
          }
        }
      },
      required: ["interfaces", "openPorts", "activeConnections"],
      additionalProperties: false,
      description: "Network configuration and connectivity information"
    },
    installedSoftware: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          version: { type: "string" },
          category: { 
            type: "string",
            enum: ["language-runtime", "database", "web-server", "security", "monitoring", "other"]
          }
        },
        required: ["name", "version", "category"],
        additionalProperties: false
      },
      description: "Key software packages and their versions"
    },
    securityFindings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          severity: {
            type: "string",
            enum: ["info", "low", "medium", "high", "critical"]
          },
          finding: { type: "string" },
          recommendation: { type: "string" }
        },
        required: ["severity", "finding", "recommendation"],
        additionalProperties: false
      },
      description: "Security-relevant observations discovered during exploration"
    },
    missingInformation: {
      type: "array",
      items: { type: "string" },
      description: "Information that could not be gathered due to permissions or other limitations"
    },
    explorationCommands: {
      type: "array",
      items: {
        type: "object",
        properties: {
          command: { type: "string" },
          purpose: { type: "string" },
          executed: { type: "boolean" }
        },
        required: ["command", "purpose", "executed"],
        additionalProperties: false
      },
      description: "List of commands that were or should be executed for the exploration"
    },
    recommendations: {
      type: "array",
      items: { type: "string" },
      description: "Suggested actions based on the exploration findings"
    }
  },
  required: [
    "explorationSummary",
    "systemInfo",
    "directoryStructure",
    "activeServices",
    "systemResources",
    "networkTopology",
    "installedSoftware",
    "securityFindings",
    "missingInformation",
    "explorationCommands",
    "recommendations"
  ],
  additionalProperties: false
};
