# Worktree Hygiene Rule

Detect and report stale or orphan git worktrees before creating new ones.
Source: GSD v1.36.0 W017 — adapted as a standalone rule.

## Detection Rules

### Before using worktrees (EnterWorktree, git worktree add)

1. Run `git worktree list --porcelain` to list all linked worktrees
2. For each worktree entry (lines starting with `worktree `):
   - **Stale detection**: Check if the worktree path's mtime is older than 1 hour. A worktree older than 1 hour that was created by an agent likely belongs to a crashed or completed agent session.
   - **Orphan detection**: Check if the worktree path still exists on disk. If `git worktree list` reports a path but the directory doesn't exist, it's orphaned.
3. Skip the main worktree (the one containing `.git/`)

### When stale/orphan worktrees are found

Report to the user with actionable information:

```
STALE WORKTREE: <path> (last modified <time> ago)
  Likely from a crashed or completed agent session.
  To clean up: git worktree remove "<path>"

ORPHAN WORKTREE: <path> (path no longer exists)
  Git still tracks this worktree but the directory is gone.
  To clean up: git worktree remove "<path>" --force
```

### Safe Cleanup Strategy (from GSD v1.39)

Use **inclusion filter** (not exclusion) when cleaning up agent worktrees. Only target paths matching `.claude/worktrees/agent-*` or `.omc/worktrees/`. Exclusion-based cleanup can destroy `.git` pointers in multi-workspace and cross-drive Windows setups.

### Graceful degradation

- If `git worktree` command is unavailable → skip check, proceed normally
- If not in a git repository → skip check, proceed normally
- If `git worktree list` fails → skip check, proceed normally
- **Never auto-delete worktrees** — only report and suggest cleanup

## Scope

This rule applies when:
- Using `EnterWorktree` tool
- Running `git worktree add`
- Starting `ultrawork` or `ralph` modes that spawn parallel agents in worktrees

## Anti-Patterns

- **Do not** automatically remove worktrees without user confirmation
- **Do not** block worktree creation if stale ones exist — only warn
- **Do not** check worktrees on every tool call — only before worktree operations
- **Do not** report worktrees that were manually created by the user (check if path contains `.claude/worktrees/` or `.omc/` to identify agent-created ones)
