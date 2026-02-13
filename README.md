# Lumen AI

Lumen is a contract-driven, multi-agent AI system that routes user requests to specialized schemas, maintains rolling memory, protects secrets, and optionally executes terminal commands with safety gates.

## Highlights

- Multi-agent routing with strict JSON schema contracts
- Rolling memory with automatic summarization
- Secret redaction before model calls
- Terminal execution safety gates and audit logging
- Advanced agents: planner, validator, follow-through, and SSH explorer
- CLI and Telegram bot entry points

## Architecture (Pipeline)

Redact -> Contextualize -> Route -> Execute -> Restore -> Log

## Quick Start

```bash
npm install
export OPENAI_API_KEY=sk-...
```

### CLI

```bash
npm run lumen
```

### Telegram Bot

```bash
npm run telegram
```

## Scripts

- `npm run lumen` - Interactive CLI
- `npm run examples` - Basic orchestrator examples
- `npm run examples:advanced` - Advanced multi-agent coordination
- `npm run telegram` - Telegram bot entry point

## Environment Variables

- `OPENAI_API_KEY` - OpenAI API key
- `LUMEN_AUTO_APPROVE` - Auto-approve terminal commands (default false)
- `LUMEN_DRY_RUN` - Dry-run mode for command execution
- `LUMEN_TIMEOUT` - Command timeout in ms
- `LUMEN_SKIP_MEMORY` - Disable memory system
- `LUMEN_SKIP_REDACTION` - Disable secret redaction (not recommended)
- `USER_MEMORY_FILE` - Custom memory file path
- `TELEGRAM_BOT_TOKEN` - Telegram bot token
- `TELEGRAM_ADMIN_ID` - Telegram admin user id

## Key Directories

- `schemas/` - Agent schemas and orchestrator
- `lib/` - Core systems (memory, redactor, terminal executor)
- `examples/` - Usage examples

## Notes

- Telegram bot runs in dry-run mode for terminal commands by default.
- All schemas use strict JSON with `additionalProperties: false`.
