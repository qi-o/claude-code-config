// Stop hook: reads accumulated file paths and runs formatters in batch.
// Deduplicates paths, runs Black for Python and Prettier for JS/TS.

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
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

(async () => {
  const rawInput = await readStdin();
  try {
    const accumFile = path.join(os.tmpdir(), 'cc-format-' + getSessionId() + '.txt');
    if (!fs.existsSync(accumFile)) {
      process.stdout.write(rawInput);
      process.exit(0);
    }

    const content = fs.readFileSync(accumFile, 'utf-8');
    fs.unlinkSync(accumFile); // delete immediately to prevent re-processing

    const files = [...new Set(content.split('\n').filter(Boolean))];
    const pyFiles = files.filter(f => /\.py$/.test(f) && fs.existsSync(f));
    const jsFiles = files.filter(f => /\.(ts|tsx|js|jsx)$/.test(f) && fs.existsSync(f));

    // Python: Black (use python -m black for venv compatibility)
    if (pyFiles.length > 0) {
      try {
        execSync('python -m black --version', { stdio: 'pipe', timeout: 5000 });
        const cmd = 'python -m black ' + pyFiles.map(f => '"' + f + '"').join(' ');
        execSync(cmd, { timeout: 30000, stdio: 'pipe' });
        process.stderr.write('[format] Black formatted ' + pyFiles.length + ' Python files\n');
      } catch (e) {
        process.stderr.write('[format] Black not available, skipping Python\n');
      }
    }

    // JS/TS: Prettier
    if (jsFiles.length > 0) {
      try {
        execSync('npx prettier --version', { stdio: 'pipe', timeout: 10000 });
        const cmd = 'npx prettier --write ' + jsFiles.map(f => '"' + f + '"').join(' ');
        execSync(cmd, { timeout: 60000, stdio: 'pipe' });
        process.stderr.write('[format] Prettier formatted ' + jsFiles.length + ' JS/TS files\n');
      } catch (e) {
        process.stderr.write('[format] Prettier not available, skipping JS/TS\n');
      }
    }
  } catch (e) {
    process.stderr.write('[format-batch error] ' + e.message + '\n');
  }
  process.stdout.write(rawInput);
  process.exit(0);
})();
