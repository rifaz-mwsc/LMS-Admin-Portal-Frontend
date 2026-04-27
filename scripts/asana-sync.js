#!/usr/bin/env node
/**
 * asana-sync.js
 *
 * Reads config from src/environments/environment.ts, then:
 *  1. Parses the latest commit message for lines starting with "-" → creates one Asana task per line.
 *  2. Lists all uncommitted/staged files and creates a single grouped Asana task.
 *
 * Usage:
 *   node scripts/asana-sync.js                 (auto mode – both checks)
 *   node scripts/asana-sync.js --commit-only   (commit message tasks only)
 *   node scripts/asana-sync.js --uncommitted   (uncommitted file task only)
 */

'use strict';

const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = path.join(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return {};
  return fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .reduce((acc, line) => {
      const [key, ...val] = line.split('=');
      if (key && val.length) acc[key.trim()] = val.join('=').trim();
      return acc;
    }, {});
}

function getAsanaConfig() {
  const env = loadEnv();
  const token = env['ASANA_PERSONAL_ACCESS_TOKEN'] || process.env.ASANA_PERSONAL_ACCESS_TOKEN;

  // projectGid still lives in environment.ts (not a secret)
  const envPath = path.join(__dirname, '../src/environments/environment.ts');
  const src = fs.readFileSync(envPath, 'utf8');
  const projectMatch = src.match(/projectGid:\s*['"]([^'"]+)['"]/);
  const projectGid = projectMatch?.[1];

  if (!token) {
    console.error('❌  ASANA_PERSONAL_ACCESS_TOKEN is not set.');
    console.error('   Add it to .env  (see .env.example)');
    process.exit(1);
  }
  if (!projectGid) {
    console.error('❌  asana.projectGid is missing in environment.ts');
    process.exit(1);
  }
  return { token, projectGid };
}

// ─── Git helpers ─────────────────────────────────────────────────────────────

function git(cmd) {
  try {
    return execSync(`git ${cmd}`, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

/** Latest commit message (full body). */
function getCommitMessage() {
  return git('log -1 --format=%B');
}

/** Lines from commit message that start with "-". */
function parseTasksFromMessage(msg) {
  return msg
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.startsWith('-'))
    .map(l => l.replace(/^-+\s*/, '').trim())
    .filter(Boolean);
}

/** Uncommitted (staged + unstaged + untracked) files. */
function getUncommittedFiles() {
  const lines = git('status --porcelain')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  return lines;
}

// ─── Asana API ───────────────────────────────────────────────────────────────

function createAsanaTask(token, projectGid, name, notes) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      data: {
        name,
        notes: notes || '',
        projects: [projectGid]
      }
    });

    const options = {
      hostname: 'app.asana.com',
      path: '/api/1.0/tasks',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        if (res.statusCode === 201) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const commitOnly = args.includes('--commit-only');
  const uncommittedOnly = args.includes('--uncommitted');

  const { token, projectGid } = getAsanaConfig();
  const commitMessage = getCommitMessage();
  const commitHeader = commitMessage.split('\n')[0] || 'latest commit';

  let totalCreated = 0;
  let totalFailed = 0;

  // ── 1. Commit message tasks ─────────────────────────────────────────────────
  if (!uncommittedOnly) {
    const tasks = parseTasksFromMessage(commitMessage);

    if (tasks.length === 0) {
      console.log('ℹ️   No "-" task lines found in commit message.');
    } else {
      console.log(`\n📝 Commit: "${commitHeader}"`);
      console.log(`   Found ${tasks.length} task(s):\n`);

      for (const task of tasks) {
        process.stdout.write(`   • ${task} … `);
        try {
          await createAsanaTask(
            token,
            projectGid,
            task,
            `Source: commit message\n\nCommit:\n${commitMessage}`
          );
          console.log('✅');
          totalCreated++;
        } catch (e) {
          console.log(`❌ (${e.message})`);
          totalFailed++;
        }
      }
    }
  }

  // ── 2. Uncommitted file task ────────────────────────────────────────────────
  if (!commitOnly) {
    const files = getUncommittedFiles();

    if (files.length === 0) {
      console.log('ℹ️   No uncommitted changes.');
    } else {
      const statusMap = {
        M: 'Modified',
        A: 'Added',
        D: 'Deleted',
        R: 'Renamed',
        '?': 'Untracked',
        '!': 'Ignored'
      };

      const formatted = files.map(line => {
        const code = line.substring(0, 2).trim();
        const file = line.substring(3).trim();
        const label = statusMap[code[0]] || code;
        return `- [${label}] ${file}`;
      });

      const title = `Uncommitted changes — ${new Date().toLocaleDateString('en-US', {
        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
      })}`;
      const notes = `${files.length} file(s) with uncommitted changes:\n\n${formatted.join('\n')}`;

      console.log(`\n📁 Uncommitted files (${files.length}):`);
      formatted.forEach(f => console.log('  ', f));
      process.stdout.write(`\n   Creating Asana task … `);

      try {
        await createAsanaTask(token, projectGid, title, notes);
        console.log('✅');
        totalCreated++;
      } catch (e) {
        console.log(`❌ (${e.message})`);
        totalFailed++;
      }
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log(`\n─────────────────────────────────────`);
  console.log(`  Asana tasks created : ${totalCreated}`);
  if (totalFailed > 0) console.log(`  Failed              : ${totalFailed}`);
  console.log(`─────────────────────────────────────\n`);
}

main().catch(err => {
  console.error('❌  asana-sync error:', err.message);
  process.exit(1);
});
