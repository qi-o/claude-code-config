// PostToolUse hook: accumulates edited file paths for batch formatting at Stop.
// Reads stdin JSON, extracts file paths from Edit/Write tool calls, appends to temp file.

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => { resolve(data); });
  });
}

function getSessionId() {
  const sid = process.env.CLAUDE_SESSION_ID || '';
  if (sid) return sid.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
  const hash = crypto.createHash('sha1').update(process.cwd()).digest('hex').slice(0, 12);
  return 'cwd-' + hash;
}

function extractFilePaths(toolInput) {
  const paths = [];
  if (toolInput.file_path) paths.push(toolInput.file_path);
  if (Array.isArray(toolInput.edits)) {
    toolInput.edits.forEach(e => { if (e.file_path) paths.push(e.file_path); });
  }
  return paths;
}

(async () => {
  const rawInput = await readStdin();
  try {
    const data = JSON.parse(rawInput);
    const accumFile = path.join(os.tmpdir(), 'cc-format-' + getSessionId() + '.txt');
    const filePaths = extractFilePaths(data.tool_input || {});
    const relevant = filePaths.filter(p => /\.(py|ts|tsx|js|jsx)$/.test(p));
    if (relevant.length > 0) {
      fs.appendFileSync(accumFile, relevant.join('\n') + '\n');
    }
  } catch (e) {
    process.stderr.write('[accumulator error] ' + e.message + '\n');
  }
  process.stdout.write(rawInput);
  process.exit(0);
})();
