/**
 * RTK Windows Hook - Claude Code PreToolUse Hook
 * Delegates rewrite logic to `rtk rewrite` (single source of truth).
 * Output format matches the Unix rtk-rewrite.sh protocol.
 */
const fs = require('fs');
const LOG = 'C:\\Users\\ZDS\\.claude\\hooks\\rtk\\hook-debug.log';

function log(...args) {
  try {
    fs.appendFileSync(LOG, new Date().toISOString() + ' ' + args.join(' ') + '\n');
  } catch {}
}

async function main() {
  log('hook invoked');
  let stdinData = '';
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) {
    stdinData += chunk;
  }

  log('stdin:', stdinData.slice(0, 200));

  if (!stdinData.trim()) {
    log('empty stdin, exit 0');
    process.exit(0);
  }

  let input;
  try {
    input = JSON.parse(stdinData);
  } catch (e) {
    log('parse error:', e.message);
    process.exit(0);
  }

  const toolInput = input.tool_input || input.toolInput;
  const command = toolInput && toolInput.command;

  if (!command || typeof command !== 'string') {
    log('no command, exit 0');
    process.exit(0);
  }

  log('command:', command);

  // Delegate to rtk rewrite - exits 1 when no rewrite needed
  const { execFileSync } = require('child_process');
  let rewritten;
  try {
    rewritten = execFileSync('rtk', ['rewrite', command], { encoding: 'utf8' }).trim();
    log('rewritten:', rewritten);
  } catch (e) {
    log('rtk rewrite failed:', e.message);
    process.exit(0);
  }

  if (!rewritten || rewritten === command) {
    log('no change needed, exit 0');
    process.exit(0);
  }

  const response = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'allow',
      permissionDecisionReason: 'RTK auto-rewrite',
      updatedInput: { ...toolInput, command: rewritten }
    }
  };

  log('output:', JSON.stringify(response));
  process.stdout.write(JSON.stringify(response));
}

main();
