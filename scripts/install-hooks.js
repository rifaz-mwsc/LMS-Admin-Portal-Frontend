#!/usr/bin/env node
/**
 * install-hooks.js
 * Installs a pre-push git hook that runs asana-sync.js on every git push.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const hookDir  = path.join(__dirname, '../.git/hooks');
const hookPath = path.join(hookDir, 'pre-push');

const hookScript = `#!/bin/sh
# Asana sync — created by scripts/install-hooks.js
echo ""
echo "🔁 Running Asana sync (pre-push)..."
node "$(git rev-parse --show-toplevel)/scripts/asana-sync.js"
# Never block the push — exit 0 even if the script fails
exit 0
`;

if (!fs.existsSync(hookDir)) {
  console.error('❌  .git/hooks directory not found. Are you inside a git repo?');
  process.exit(1);
}

fs.writeFileSync(hookPath, hookScript, { mode: 0o755 });
console.log('✅  pre-push hook installed at .git/hooks/pre-push');
console.log('   asana-sync.js will run automatically on every git push.');
