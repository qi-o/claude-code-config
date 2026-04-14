'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

// --- Kill switch ---
if (process.env.DISABLE_GATEGUARD === '1') {
  process.stdin.setEncoding('utf8');
  let raw = '';
  process.stdin.on('data', (chunk) => { raw += chunk; });
  process.stdin.on('end', () => {
    process.stdout.write(raw);
    process.exit(0);
  });
} else {
  // --- Constants ---
  const STATE_DIR = path.join(os.homedir(), '.claude', 'hooks', 'state');
  const SESSION_ID = (process.env.CLAUDE_SESSION_ID || 'default')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 64);
  const STATE_FILE = path.join(STATE_DIR, `gateguard-${SESSION_ID}.json`);
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  const STALE_THRESHOLD_MS = 60 * 60 * 1000; // 60 minutes

  const EDIT_GATE_MESSAGE = (filePath) =>
    `\n[调查门] 首次编辑 ${filePath} 前请先调查：\n1. 用 Grep 列出所有引用此文件的模块\n2. 列出受影响的公开函数/类\n3. 如涉及数据文件，展示字段结构和格式\n4. 原文引用用户的当前指令\n完成调查后重新执行此操作。\n`;

  const WRITE_GATE_MESSAGE = (filePath) =>
    `\n[调查门] 创建新文件 ${filePath} 前请确认：\n1. 用 Glob 确认无已有文件可复用\n2. 指出哪些文件会 import/调用此新文件\n3. 如涉及数据，展示数据结构\n4. 原文引用用户的当前指令\n确认后重新执行此操作。\n`;

  const DESTRUCTIVE_GATE_MESSAGE =
    `\n[调查门] 破坏性命令检测：\n1. 列出此命令将修改/删除的所有文件\n2. 写出回滚步骤\n3. 原文引用用户的当前指令\n确认后重新执行此操作。\n`;

  const DESTRUCTIVE_RE = /\b(rm\s+-rf|git\s+reset\s+--hard|git\s+checkout\s+--\s|git\s+clean\s+-f|drop\s+table|delete\s+from|truncate|git\s+push\s+--force)\b/i;

  // --- State management ---

  function loadState() {
    try {
      if (!fs.existsSync(STATE_FILE)) {
        return { checked: [], last_active: Date.now() };
      }
      const raw = fs.readFileSync(STATE_FILE, 'utf8');
      const state = JSON.parse(raw);
      if (Date.now() - state.last_active > SESSION_TIMEOUT_MS) {
        return { checked: [], last_active: Date.now() };
      }
      return state;
    } catch (_) {
      return { checked: [], last_active: Date.now() };
    }
  }

  function saveState(state) {
    state.last_active = Date.now();
    try {
      if (!fs.existsSync(STATE_DIR)) {
        fs.mkdirSync(STATE_DIR, { recursive: true });
      }
      // Windows-safe write: write directly, overwrite if exists
      const tmpFile = STATE_FILE + '.tmp';
      fs.writeFileSync(tmpFile, JSON.stringify(state, null, 2), 'utf8');
      // On Windows, delete target first if it exists to avoid EPERM
      try {
        if (fs.existsSync(STATE_FILE)) {
          fs.unlinkSync(STATE_FILE);
        }
      } catch (_) {
        // ignore
      }
      fs.renameSync(tmpFile, STATE_FILE);
    } catch (_) {
      // Last resort: write directly
      try {
        fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
      } catch (_2) {
        // silently fail - don't crash the hook
      }
    }
  }

  function isChecked(key) {
    const state = loadState();
    return state.checked.includes(key);
  }

  function markChecked(key) {
    const state = loadState();
    if (!state.checked.includes(key)) {
      state.checked.push(key);
    }
    saveState(state);
  }

  // --- Cleanup stale session files on startup ---

  function cleanupStaleSessions() {
    try {
      if (!fs.existsSync(STATE_DIR)) {
        return;
      }
      const files = fs.readdirSync(STATE_DIR);
      const now = Date.now();
      for (const file of files) {
        if (!file.startsWith('gateguard-') || !file.endsWith('.json')) {
          continue;
        }
        const filePath = path.join(STATE_DIR, file);
        try {
          const stat = fs.statSync(filePath);
          if (now - stat.mtimeMs > STALE_THRESHOLD_MS) {
            fs.unlinkSync(filePath);
          }
        } catch (_) {
          // skip
        }
      }
    } catch (_) {
      // skip
    }
  }

  // --- Stdin reader ---

  function readStdin() {
    return new Promise((resolve) => {
      let data = '';
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', (chunk) => { data += chunk; });
      process.stdin.on('end', () => { resolve(data); });
    });
  }

  // --- Main ---

  (async () => {
    const rawInput = await readStdin();
    try {
      cleanupStaleSessions();

      let toolInput;
      try {
        toolInput = JSON.parse(rawInput);
      } catch (_) {
        // Not valid JSON or empty, passthrough
        process.stdout.write(rawInput);
        process.exit(0);
      }

      const toolName = toolInput.tool_name || '';

      // --- Edit tool ---
      if (toolName === 'Edit') {
        const filePath = toolInput.tool_input && toolInput.tool_input.file_path;
        if (!filePath) {
          process.stdout.write(rawInput);
          process.exit(0);
        }
        if (!isChecked(filePath)) {
          markChecked(filePath);
          process.stderr.write(EDIT_GATE_MESSAGE(filePath));
          process.exit(2);
        } else {
          process.stdout.write(rawInput);
          process.exit(0);
        }
      }

      // --- MultiEdit tool ---
      if (toolName === 'MultiEdit') {
        const edits = toolInput.tool_input && toolInput.tool_input.edits;
        if (!edits || !Array.isArray(edits) || edits.length === 0) {
          process.stdout.write(rawInput);
          process.exit(0);
        }
        for (const edit of edits) {
          const editPath = edit.file_path;
          if (editPath && !isChecked(editPath)) {
            markChecked(editPath);
            process.stderr.write(EDIT_GATE_MESSAGE(editPath));
            process.exit(2);
          }
        }
        process.stdout.write(rawInput);
        process.exit(0);
      }

      // --- Write tool ---
      if (toolName === 'Write') {
        const filePath = toolInput.tool_input && toolInput.tool_input.file_path;
        if (!filePath) {
          process.stdout.write(rawInput);
          process.exit(0);
        }
        if (!isChecked(filePath)) {
          markChecked(filePath);
          process.stderr.write(WRITE_GATE_MESSAGE(filePath));
          process.exit(2);
        } else {
          process.stdout.write(rawInput);
          process.exit(0);
        }
      }

      // --- Bash tool ---
      if (toolName === 'Bash') {
        const command = toolInput.tool_input && toolInput.tool_input.command || '';

        // Git push special (warn but don't block)
        if (/git\s+push/i.test(command) && !/git\s+push\b.*--force/i.test(command)) {
          process.stderr.write('\n\u26a0\ufe0f  Git Push \u63d0\u9192\uff1a\u8bf7\u786e\u8ba4\u5df2\u5b8c\u6210\u4ee3\u7801\u5ba1\u67e5\u548c\u6d4b\u8bd5\n');
          process.stdout.write(rawInput);
          process.exit(0);
        }

        // Destructive commands
        if (DESTRUCTIVE_RE.test(command)) {
          const key = 'destructive:' + crypto.createHash('sha256').update(command).digest('hex').slice(0, 16);
          if (!isChecked(key)) {
            markChecked(key);
            process.stderr.write(DESTRUCTIVE_GATE_MESSAGE);
            process.exit(2);
          } else {
            process.stdout.write(rawInput);
            process.exit(0);
          }
        }

        // Non-destructive: passthrough
        process.stdout.write(rawInput);
        process.exit(0);
      }

      // --- Default: passthrough for unknown tools ---
      process.stdout.write(rawInput);
      process.exit(0);

    } catch (e) {
      process.stderr.write('[gateguard error] ' + e.message + '\n');
      process.stdout.write(rawInput);
      process.exit(0);
    }
  })();
}
