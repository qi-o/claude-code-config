# Context Budget Management

## Core Principle

LLM context window is a finite, budgeted resource. Every workflow must track and manage context consumption proactively. Quality degrades predictably as context fills — this rule makes degradation explicit and manageable.

## Context Degradation Tiers

| Tier | Context Used | Read Depth | Agent Behavior |
|------|-------------|-----------|----------------|
| **PEAK** | 0-30% | Full reads permitted | Normal operations, spawn multiple agents freely |
| **GOOD** | 30-50% | Prefer summaries/frontmatter | Delegate aggressively to subagents, reduce inline content |
| **DEGRADING** | 50-70% | Frontmatter-only reads | Minimal inlining, warn user about capacity, save critical state |
| **POOR** | 70%+ | No new reads unless critical | Emergency: checkpoint immediately, save to persistent memory |

## Read-Depth Policy

### At PEAK / GOOD
- Read full file bodies when needed for decisions
- Reference documents freely
- Spawn research subagents as normal

### At DEGRADING
- Read only frontmatter, status fields, or first/last 50 lines of files
- Prefer summary files (SUMMARY.md, STATE.md) over full documents
- Do NOT read full file bodies unless the file is the direct target of current work
- Delegate heavy reads to subagents (they get fresh context windows)

### At POOR
- No new file reads unless directly critical for completing the current task
- Do NOT spawn new research agents
- Immediately save critical discoveries to persistent storage:
  - `notepad_write_priority` for critical context that must survive compaction
  - `project_memory_add_note` for cross-session discoveries
  - `state_write` for current ultrawork/ralph/autopilot state
- Inform user: "Context near capacity. Saving critical state and pausing for fresh session."

## Early Warning Signs

The tier percentages above are guidelines. In practice, detect degradation through behavioral indicators (since exact context usage is not directly queryable):

| Sign | What It Looks Like | Corrective Action |
|------|-------------------|-------------------|
| **Silent partial completion** | Claims task done but implementation incomplete | Verify each must_have per goal-verification.md explicitly |
| **Increasing vagueness** | "appropriate handling", "standard patterns", "proper implementation" | Re-read the original spec; force concrete specifics |
| **Skipped protocol steps** | Omits verification, testing, or review steps without mention | Re-run the skipped steps explicitly |
| **Passive behavior** | Multiple consecutive reads without writes (5+) | Force a write action or delegate to fresh subagent |

## Integration with OMC Infrastructure

| OMC Tool | When to Use | Context Tier |
|----------|------------|-------------|
| `notepad_write_priority` | Save critical context before POOR threshold | GOOD/DEGRADING |
| `project_memory_add_note` | Persist discoveries for future sessions | GOOD/DEGRADING |
| `state_write` | Checkpoint ultrawork/ralph/autopilot state | DEGRADING/POOR |
| `notepad_write_working` | Log intermediate findings | PEAK/GOOD |
| PreCompact hook | Auto-triggers on compaction (reactive) | All tiers |

## Proactive State Preservation Protocol

When approaching DEGRADING tier (>50%):

1. **Summarize current task progress** to `notepad_write_working`
2. **Save any unsaved decisions** to `project_memory_add_note`
3. **Checkpoint workflow state** via `state_write` if in ralph/ultrawork/autopilot
4. **Delegate remaining work** to fresh subagent if possible (they get full context)

## Rules

- **DO NOT** wait until POOR to save critical state — proactive saves at GOOD
- **DO NOT** continue spawning research agents at DEGRADING — use existing knowledge
- **DO NOT** re-read files you already read in this session — trust your memory or notepad
- **DO** warn the user when reaching DEGRADING tier
- **DO** use subagents for heavy reads (they have fresh context windows)
- **DO** compress findings into notepad before they are lost to compaction
