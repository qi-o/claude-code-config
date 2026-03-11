// Debug hook: writes stdin to file to confirm hook is being called
const fs = require('fs');
async function main() {
  let data = '';
  process.stdin.setEncoding('utf8');
  for await (const chunk of process.stdin) data += chunk;
  fs.writeFileSync('C:\\Users\\ZDS\\.claude\\hooks\\rtk\\debug-log.txt',
    new Date().toISOString() + '\n' + data + '\n', { flag: 'a' });
  process.exit(0);
}
main();
