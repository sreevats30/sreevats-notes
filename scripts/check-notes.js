import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const notesJsonPath = path.join(rootDir, 'src', 'data', 'notes.json');
const publicNotesDir = path.join(rootDir, 'public', 'notes');
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MiB Cloudflare Pages limit

console.log('🔍 Running pre-deploy validation on notes.json...');

if (!fs.existsSync(notesJsonPath)) {
  console.error(`❌ Error: notes.json not found at ${notesJsonPath}`);
  process.exit(1);
}

const rawData = fs.readFileSync(notesJsonPath, 'utf8');
let notes;
try {
  notes = JSON.parse(rawData);
} catch (err) {
  console.error('❌ Error parsing notes.json as JSON:', err.message);
  process.exit(1);
}

if (!Array.isArray(notes)) {
  console.error('❌ Error: notes.json root must be an array of note objects.');
  process.exit(1);
}

let hasError = false;
let totalChecked = 0;

for (const note of notes) {
  totalChecked++;
  if (!note.file) {
    console.error(`❌ Note [${note.id || 'unknown'}] is missing the "file" property.`);
    hasError = true;
    continue;
  }

  // Construct expected file path in public/notes
  const filePath = path.join(publicNotesDir, note.file);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found for note [${note.id}]:`);
    console.error(`   Expected at: ${filePath}`);
    console.error(`   Referenced as: ${note.file}`);
    hasError = true;
    continue;
  }

  const stat = fs.statSync(filePath);
  const sizeMB = stat.size / (1024 * 1024);

  if (stat.size > MAX_FILE_SIZE_BYTES) {
    console.error(`❌ File exceeds Cloudflare Pages 25 MiB limit for note [${note.id}]:`);
    console.error(`   File: ${note.file}`);
    console.error(`   Size: ${sizeMB.toFixed(2)} MiB (Max allowed: 25.00 MiB)`);
    hasError = true;
  } else {
    console.log(`  ✓ [${note.id}] ${note.file} (${sizeMB.toFixed(2)} MB)`);
  }
}

if (hasError) {
  console.error('\n❌ Pre-deploy check failed! Fix the issues above before deploying.');
  process.exit(1);
}

console.log(`\n✅ All ${totalChecked} note files exist and are within the 25 MiB limit! Ready for deployment.\n`);
process.exit(0);
