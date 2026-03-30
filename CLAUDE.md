# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

InkOS is a multi-agent autonomous novel writing CLI (`inkos`). A monorepo with two ESM packages built on TypeScript 5.8+ (strict mode, ES2022 target, Node16 modules). Published as `@actalk/inkos` (CLI) and `@actalk/inkos-core` (core logic) on npm.

## Commands

```bash
pnpm install                 # Install all dependencies
pnpm build                   # tsc compile all packages (no bundler)
pnpm dev                     # Watch mode all packages
pnpm test                    # Run all tests (vitest)
pnpm typecheck               # TypeScript type checking
cd packages/core && npx vitest run src/__tests__/writer.test.ts  # Run a single test
```

No linter or formatter is configured. Both packages use plain `tsc` (no tsup/esbuild).

## Repository Structure

```
packages/
  core/             # @actalk/inkos-core — all domain logic
    src/agents/     # Agent classes (extend BaseAgent)
    src/pipeline/   # PipelineRunner orchestration, agent tool loop, scheduler
    src/llm/        # Multi-provider LLM abstraction (OpenAI + Anthropic)
    src/models/     # Zod schemas and TS types for all domain objects
    src/state/      # Immutable state management: delta apply, JSON↔markdown projection
    src/notify/     # Notification dispatch (Telegram, Feishu, WeChat Work, Webhook)
    src/utils/      # Config loading, context filtering, length metrics, memory retrieval
    genres/         # Genre profiles as markdown with YAML frontmatter (15 built-in)
  cli/              # @actalk/inkos — Commander.js CLI
    src/commands/   # One file per command (write, book, plan, compose, draft, audit, etc.)
```

## Architecture

### Agent System

All agents extend `BaseAgent` (packages/core/src/agents/base.ts) which provides `ctx` (AgentContext with LLM client, model, project root, logger) and `chat()` / `chatWithSearch()` helpers. Key agents: PlannerAgent, ComposerAgent, ArchitectAgent, WriterAgent (also runs Observer+Settler internally), ContinuityAuditor, ReviserAgent.

### Pipeline Flow (`writeNextChapter` in runner.ts)

Lock → Plan (PlannerAgent) → Compose (ComposerAgent) → Write (WriterAgent) → Post-write validation → Spot-fix if errors → Length normalization → Audit (ContinuityAuditor, 33 dimensions) → Auto-revise if critical issues → Apply state delta → Project to markdown → Save chapter → Notify

The `inkos agent` command uses a separate tool-calling loop (agent.ts) with 18 registered tools, allowing multi-turn LLM-driven orchestration.

### State Management (Immutable Deltas with Zod)

Two layers: structured JSON (source of truth in `story/state/`) and markdown projections (human-readable in truth files). All mutations flow through `RuntimeStateDeltaSchema` → `applyRuntimeStateDelta()` → Zod-validated write. `state-bootstrap.ts` handles migration from legacy markdown-only books. `state-projections.ts` renders JSON back to markdown.

### LLM Provider (provider.ts ~950 lines)

Two provider backends: OpenAI SDK (also handles "custom" for any compatible API) and Anthropic SDK. OpenAI has two formats: "chat" (standard) and "responses" (newer API). Streaming with auto-fallback to sync, partial response salvage (500+ chars). Per-agent model overrides via `modelOverrides` in project config. API keys loaded only from environment variables (`INKOS_LLM_API_KEY`), never stored in JSON.

### Config Loading (config-loader.ts)

Layered: global `~/.inkos/.env` → project `.env` → `inkos.json`. Environment variables override JSON. Extra params via `INKOS_LLM_EXTRA_*` with auto-coercion.

### Genre System

Genre profiles in `packages/core/genres/` are markdown files with YAML frontmatter (chapterTypes, fatigueWords, auditDimensions, etc.). Project-level `{projectRoot}/genres/{genreId}.md` overrides built-in. Parsed by `parseGenreProfile()` in genre-profile.ts.

### Prompts

Prompts are built in TypeScript (e.g., `buildWriterSystemPrompt()` in writer-prompts.ts), not loaded from separate template files. PlannerAgent reads markdown control files directly and parses them in code.

## Key Conventions

- All state updates use immutable JSON deltas validated by Zod schemas
- Both packages are ESM (`"type": "module"`)
- CLI commands support `--json` for programmatic consumption
- Minimum Node 20.0.0, pnpm 9.0.0
- Tests use Vitest, located in `src/__tests__/*.test.ts` within each package
