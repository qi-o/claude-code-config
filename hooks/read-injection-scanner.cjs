#!/usr/bin/env node
// Read Injection Scanner — PostToolUse hook for Read tool
// Detects: prompt injection, summarization-survival, invisible Unicode
// Advisory-only — never blocks Read operations

const fs = require('fs');

// --- Stdin (Windows-compatible, same pattern as debug-detect.cjs) ---
function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => { resolve(data); });
  });
}

// --- Patterns (merged from gsd-prompt-guard.js + GSD v1.37.1) ---
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /you\s+are\s+now\s+(?:a|an)\s+/i,
  /\[system\]/i,
  /<\/?(?:system|instruction|command)>/i,
  /DISREGARD\s+/i,
  /OVERRIDE\s+(?:SAFETY|RULES|GUIDELINES)/i,
  /pretend\s+(?:you\s+are|to\s+be)/i,
  /new\s+directive\s*:/i,
  /ACT\s+AS\s+(?:IF|A)/i,
  /jailbreak/i,
  /DAN\s+mode/i,
  /inject\s+(?:this|the\s+following)/i,
  /execute\s+(?:the\s+)?following\s+(?:command|instruction)/i,
];

const SUMMARISATION_PATTERNS = [
  /when\s+summariz(?:e|ing)[\s,]+(?:always\s+)?retain/i,
  /NEVER\s+(?:DELETE|REMOVE|TRUNCATE)\s+(?:THIS|THE\s+ABOVE)/i,
  /IMPORTANT\s*:\s*(?:always\s+)?(?:keep|preserve|retain)/i,
  /DO\s+NOT\s+(?:SUMMARIZE|COMPRESS|CONDENSE)/i,
];

// Exclusion paths — trusted content + binary/common directories
const EXCLUSION_PATTERNS = [
  /[\/\\]\.planning[\/\\]/,
  /[\/\\]hooks[\/\\]/,
  /[\/\\]\.claude[\/\\]rules[\/\\]/,
  /[\/\\]\.claude[\/\\]skills[\/\\]/,
  /[\/\\]node_modules[\/\\]/,
  /[\/\\]\.git[\/\\]/,
  /[\/\\]dist[\/\\]/,
  /[\/\\]rules[\/\\]security\.md$/i,
];

function isBinaryFile(buffer) {
  const checkLen = Math.min(buffer.length, 8192);
  for (let i = 0; i < checkLen; i++) {
    if (buffer[i] === 0) return true;
  }
  return false;
}

function hasInvisibleUnicode(text) {
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if ((code >= 0x200B && code <= 0x200F) ||
        (code >= 0x2028 && code <= 0x202F) ||
        code === 0xFEFF ||
        (code >= 0x2060 && code <= 0x206F)) {
      return true;
    }
  }
  return false;
}

// --- Main ---
(async () => {
  const rawInput = await readStdin();
  try {
    const data = JSON.parse(rawInput);

    if (data.tool_name !== 'Read') { process.exit(0); return; }

    const filePath = (data.tool_input && data.tool_input.file_path) || '';
    if (!filePath) { process.exit(0); return; }

    // Normalize to forward slashes for matching
    const normalizedPath = filePath.replace(/\\/g, '/');
    for (const pat of EXCLUSION_PATTERNS) {
      if (pat.test(normalizedPath)) { process.exit(0); return; }
    }

    // Read file — check binary and size first
    let content;
    try {
      const stat = fs.statSync(filePath);
      if (stat.size > 10 * 1024 * 1024) { process.exit(0); return; } // Skip >10MB
      const rawBuf = fs.readFileSync(filePath);
      if (isBinaryFile(rawBuf)) { process.exit(0); return; }
      content = rawBuf.toString('utf8');
    } catch {
      process.exit(0); return;
    }

    const findings = [];

    for (const pat of INJECTION_PATTERNS) {
      const match = content.match(pat);
      if (match) {
        findings.push({ severity: 'HIGH', type: 'injection', sample: match[0] });
      }
    }

    for (const pat of SUMMARISATION_PATTERNS) {
      const match = content.match(pat);
      if (match) {
        findings.push({ severity: 'LOW', type: 'summarisation', sample: match[0] });
      }
    }

    if (hasInvisibleUnicode(content)) {
      findings.push({ severity: 'HIGH', type: 'invisible_unicode', sample: 'zero-width/control chars' });
    }

    if (findings.length > 0) {
      const lines = [
        '[read-injection-scanner] Suspicious patterns detected:',
        '  File: ' + filePath,
      ];
      for (const f of findings) {
        lines.push('  [' + f.severity + '] ' + f.type + ': "' + f.sample + '"');
      }
      lines.push('  Advisory only — no action blocked.');
      process.stderr.write(lines.join('\n') + '\n');
    }
  } catch (e) {
    // Silent — never block Read operations
  }
  process.exit(0);
})();
