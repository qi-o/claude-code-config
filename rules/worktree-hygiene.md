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

进一步（GSD v1.41.0 #3117）：即使有 inclusion filter，`git worktree remove --force` 仍可在 Windows 路径分隔符不匹配时误删兄弟 worktree。推荐只做 `git worktree prune`（元数据清理），禁止自动 force-remove。

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

## Branch Isolation

Agent operations in worktrees that will modify files MUST create a new branch rather than operating on the user's currently checked-out branch. Read-only operations (review, research, search) may use the existing branch.

When creating agent branches:
- Use naming consistent with the calling workflow: `omc-team/{team}/{worker}` for team mode, `agent/<verb>-<scope>` for standalone agents
- Never operate directly on `main`, `master`, or the user's active branch
- On completion, agent branches may be merged or deleted at user discretion (see Safe Cleanup Strategy above)

## Path Safety (from GSD v1.41.0)

Agents operating inside worktrees MUST guard against two silent failure modes:

### cwd-drift sentinel

After a Bash `cd` out of the worktree into the main repo, `[ -f .git ]` becomes false (`.git` is a directory in main repo), silently skipping all HEAD/branch safety guards. Commits land on the main repo's active branch.

**Detection**: On first commit in a worktree, capture `git rev-parse --show-toplevel` as sentinel. Before every subsequent commit, verify current toplevel matches the sentinel. On mismatch: halt with recovery instructions.

### Absolute-path guard

File paths from the orchestrator are relative to the main repo root. When an agent uses these as absolute paths in Edit/Write calls, writes land in the main repo instead of the worktree. The agent's `git commit` sees a clean tree — work is silently lost.

**Prevention**: Before any Edit/Write using an absolute path, verify it starts with the worktree root (`git rev-parse --show-toplevel`). Prefer relative paths; derive absolute paths from the worktree root, never from the orchestrator's pwd.

## Anti-Patterns

- **Do not** automatically remove worktrees without user confirmation
- **Do not** block worktree creation if stale ones exist — only warn
- **Do not** check worktrees on every tool call — only before worktree operations
- **Do not** report worktrees that were manually created by the user (check if path contains `.claude/worktrees/` or `.omc/` to identify agent-created ones)
