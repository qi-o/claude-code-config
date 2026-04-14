const fs = require('fs');

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => { resolve(data); });
  });
}

function isTestFile(p) {
  return /(^|[/\\])(test_|_test\.|\.test\.|\.spec\.)/.test(p);
}

function isScript(p) {
  return /[/\\]scripts[/\\]/.test(p);
}

function findPrintStatements(lines) {
  const matches = [];
  let inMainBlock = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/if\s+__name__/.test(line)) { inMainBlock = true; continue; }
    if (inMainBlock && line.trim() === '') { inMainBlock = false; continue; }
    if (inMainBlock && !/^\s/.test(line) && line.trim() !== '') { inMainBlock = false; }
    if (!inMainBlock && /print\s*\(/.test(line)) {
      matches.push({ line: i + 1, text: line });
    }
  }
  return matches;
}

function findConsoleLog(lines) {
  const matches = [];
  for (let i = 0; i < lines.length; i++) {
    if (/console\.log/.test(lines[i])) {
      matches.push({ line: i + 1, text: lines[i] });
    }
  }
  return matches;
}

(async () => {
  const rawInput = await readStdin();
  try {
    const data = JSON.parse(rawInput);
    const filePath = (data.tool_input && data.tool_input.file_path) || '';
    if (!filePath || !fs.existsSync(filePath)) {
      process.stdout.write(rawInput);
      process.exit(0);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    // Python: detect print() debug statements
    if (/\.py$/.test(filePath)) {
      if (isTestFile(filePath) || isScript(filePath)) {
        process.stdout.write(rawInput);
        process.exit(0);
      }
      const matches = findPrintStatements(lines);
      if (matches.length > 0) {
        process.stderr.write('[Hook] WARNING: print() 调试语句发现于 ' + filePath + '\n');
        matches.slice(0, 5).forEach(m => {
          process.stderr.write('  行 ' + m.line + ': ' + m.text.trim() + '\n');
        });
        process.stderr.write('[Hook] 提交前请移除调试 print() 语句\n');
      }
    }

    // JS/TS: detect console.log
    if (/\.(ts|tsx|js|jsx)$/.test(filePath)) {
      if (isTestFile(filePath) || isScript(filePath)) {
        process.stdout.write(rawInput);
        process.exit(0);
      }
      const matches = findConsoleLog(lines);
      if (matches.length > 0) {
        process.stderr.write('[Hook] WARNING: console.log found in ' + filePath + '\n');
        matches.slice(0, 5).forEach(m => {
          process.stderr.write('  Line ' + m.line + ': ' + m.text.trim() + '\n');
        });
        process.stderr.write('[Hook] Remove console.log before committing\n');
      }
    }
  } catch (e) {
    process.stderr.write('[debug-detect error] ' + e.message + '\n');
  }
  process.stdout.write(rawInput);
  process.exit(0);
})();
