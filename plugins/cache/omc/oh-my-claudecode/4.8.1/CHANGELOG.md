# oh-my-claudecode v4.8.1: Runtime Hardening, Remote MCP & Contributor Automation

## Release Notes

Patch release focused on **runtime hardening** across team workers, security guards, and tool lifecycle, plus **remote MCP support**, **automated featured contributors**, and multiple Windows/cross-platform fixes.

### Highlights

- **Remote MCP Support** — Clarified and enabled remote MCP server connectivity for external OMC installations. (#1653, #1654)
- **Runtime Hardening Backports** — Comprehensive hardening of SSRF guards, path traversal checks, LSP lifecycle, Python REPL bridge, and tmux session management, split from #1639. (#1641, #1642, #1643, #1644, #1645)
- **Team Worker Stability** — Workers now survive mailbox replies, respect shell affinity, route API cleanup through shutdown, and support Bedrock ARN model identifiers. (#1619, #1620, #1621, #1622, #1623, #1624, #1625, #1627, #1640)
- **Featured Contributors Automation** — Automated README featured contributors block with archived-repo exclusion. (#1607, #1608)
- **Configurable Autopilot Plan Output** — Plan output paths are now configurable via templates. (#1637)

### New Features

- **feat: add configurable autopilot plan output paths** — Template-based plan output directory configuration. (#1636, #1637)
- **feat(update): add --clean flag to bypass 24h cache purge grace period** — Force-refresh update cache on demand. (#1628)
- **feat(team): preserve worker role fanout intent** — Workers retain their intended role during dispatch. (#1621, #1627)
- **feat(team): add startup allocation policy seam** — Pluggable allocation policies for team worker startup. (#1620, #1626)
- **feat(readme): automate featured contributors block** — CI-driven contributor spotlight with archived-repo filtering. (#1607, #1608)

### Security & Hardening

- **fix(security): use path-relative traversal checks and add regression tests** — Hardened path traversal guards with relative-path validation. (#1642)
- **fix(tools): split LSP lifecycle hardening** — Improved LSP client startup/shutdown reliability. (#1644)
- **fix(tools): split python REPL bridge hardening** — More robust Python REPL bridge process management. (#1643)
- **fix(team): split tmux/session hardening** — Safer tmux session creation and teardown. (#1641)
- **chore(deps): split lockfile audit update** — Dependency audit fixes. (#1645)

### Bug Fixes

- **fix: honor Claude ask rules for git commit heredocs** — Prevents heredoc bypass of ask permission checks. (#1651, #1652)
- **fix(ask): pipe Windows prompts via stdin** — Fixes ask CLI on Windows platforms. (#1648, #1649)
- **fix(hooks): add OMC_QUIET hook message suppression** — New env var to silence hook output. (#1646, #1647)
- **fix(team): keep workers running after mailbox replies** — Workers no longer exit prematurely after processing messages. (#1619, #1624, #1640)
- **fix(team): preserve supported shell affinity** — Respects user's configured shell in worker spawning. (#1622, #1625)
- **fix(team): route api cleanup through shutdown** — Proper cleanup sequencing on team teardown. (#1618, #1623)
- **fix(team): detect Bedrock ARN model identifiers** — Team model routing now recognizes AWS Bedrock ARNs. (#1612, #1613)
- **fix: guard autopilot cancel ownership** — Prevents cross-session autopilot cancellation. (#1615, #1616)
- **fix(hud): recognize 'Agent' tool name in transcript parser** — Fixes HUD display for Agent tool calls. (#1634, #1635)
- **fix(team): fix worker cleanup on session end** — Prevents orphaned worker processes. (#1632, #1633)
- **fix(omc-doctor): tolerate missing companion files** — Doctor no longer errors on fresh installs. (#1630, #1631)
- **fix(readme): exclude archived featured contributor repos** — Filters out archived repositories from contributor spotlight. (#1608)
- **fix(deps): resolve 7 npm audit vulnerabilities (5 high)** — Dependency security updates. (#1609)

### Refactoring

- **refactor(team): clean up dead code and unused imports** — Post-release code cleanup. (#1606)

### Documentation

- **docs: clarify remote MCP support** — Updated docs for remote OMC MCP server connectivity. (#1653, #1654)

### Stats

- **30+ PRs merged** | **5 new features** | **18 bug fixes** | **5 security/hardening improvements**
