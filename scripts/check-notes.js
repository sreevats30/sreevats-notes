import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const notesJsonPath = path.join(rootDir, 'src', 'data', 'notes.json');
const tagsJsonPath = path.join(rootDir, 'src', 'data', 'tags.json');
const publicDir = path.join(rootDir, 'public');
const publicNotesDir = path.join(publicDir, 'notes');

const MAX_PDF_SIZE_BYTES = 25 * 1024 * 1024; // 25 MiB limit for Cloudflare Pages
const MAX_TOTAL_PUBLIC_FILES = 20000;         // Cloudflare Pages free tier limit

console.log('🔍 Checking notes before deploy...\n');

let hasFailed = false;

// 1. Verify and read notes.json
if (!fs.existsSync(notesJsonPath)) {
  console.error(`❌ Error: notes.json not found at ${notesJsonPath}`);
  process.exit(1);
}

let notes = [];
try {
  const content = fs.readFileSync(notesJsonPath, 'utf8');
  notes = JSON.parse(content);
} catch (err) {
  console.error(`❌ Error: Failed to parse notes.json: ${err.message}`);
  process.exit(1);
}

if (!Array.isArray(notes)) {
  console.error('❌ Error: notes.json must contain an array of note entries.');
  process.exit(1);
}

// 2. Scan all files in public/ to check 20,000 files limit and gather all PDFs
function getAllFilesRecursively(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllFilesRecursively(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

const allPublicFiles = getAllFilesRecursively(publicDir);
const totalPublicFilesCount = allPublicFiles.length;

if (totalPublicFilesCount > MAX_TOTAL_PUBLIC_FILES) {
  console.error(`❌ Error: public/ folder contains ${totalPublicFilesCount.toLocaleString()} files (maximum Cloudflare Pages limit is 20,000).`);
  hasFailed = true;
}

// 3. Scan all PDFs inside public/notes/
const allPdfsInNotesDir = getAllFilesRecursively(publicNotesDir).filter(f => f.toLowerCase().endsWith('.pdf'));

// Normalize paths to forward slashes relative to public/notes
const discoveredPdfRelativeMap = new Map();
let totalPdfSizeBytes = 0;

for (const pdfPath of allPdfsInNotesDir) {
  const relPath = path.relative(publicNotesDir, pdfPath).split(path.sep).join('/');
  const stat = fs.statSync(pdfPath);
  totalPdfSizeBytes += stat.size;
  discoveredPdfRelativeMap.set(relPath, {
    fullPath: pdfPath,
    size: stat.size
  });

  // Check 25 MiB per-file limit on every PDF in public/notes/
  if (stat.size > MAX_PDF_SIZE_BYTES) {
    const sizeMiB = (stat.size / (1024 * 1024)).toFixed(2);
    console.error(`❌ Error: PDF "${relPath}" is ${sizeMiB} MiB, which exceeds Cloudflare Pages 25 MiB limit.`);
    hasFailed = true;
  }
}

// 4. Verify every note in notes.json
const registeredFilesSet = new Set();

for (const note of notes) {
  if (!note.file) {
    console.error(`❌ Error: Note [${note.id || 'unknown'}] is missing the "file" property.`);
    hasFailed = true;
    continue;
  }

  // Normalize note file path to forward slashes without leading slashes
  const normalizedFile = note.file.replace(/^[/\\]+/, '').split(path.sep).join('/');
  registeredFilesSet.add(normalizedFile);

  const fullFilePath = path.join(publicNotesDir, normalizedFile);

  if (!fs.existsSync(fullFilePath)) {
    console.error(`❌ Error: Note [${note.id}]: File "${note.file}" not found in public/notes/.`);
    hasFailed = true;
  }
}

// 5. Warn (not fail) about PDFs in public/notes/ that are not listed in notes.json
for (const [relPath] of discoveredPdfRelativeMap.entries()) {
  if (!registeredFilesSet.has(relPath)) {
    console.warn(`⚠️  Warning: "${relPath}" exists in public/notes/ but is not listed in notes.json.`);
  }
}

// 6. Verify tags.json if present
let masterTags = [];
if (fs.existsSync(tagsJsonPath)) {
  try {
    masterTags = JSON.parse(fs.readFileSync(tagsJsonPath, 'utf8'));
  } catch (err) {
    console.warn(`⚠️  Warning: Failed to parse tags.json: ${err.message}`);
  }
}

// 7. Print summary
const totalNotesCount = notes.length;
const totalPdfsCount = allPdfsInNotesDir.length;
const totalSizeMB = (totalPdfSizeBytes / (1024 * 1024)).toFixed(2);

console.log('--- Summary ---');
console.log(`Notes in notes.json : ${totalNotesCount}`);
console.log(`PDFs in public/notes: ${totalPdfsCount}`);
console.log(`Total PDF storage   : ${totalSizeMB} MB`);
console.log(`Total public files  : ${totalPublicFilesCount} / 20,000 max`);
if (masterTags.length > 0) {
  console.log(`Active tags (${masterTags.length})    : ${masterTags.join(', ')}`);
}
console.log('---------------\n');

if (hasFailed) {
  console.error('❌ Check failed. Resolve the errors above before deploying.\n');
  process.exit(1);
}

console.log('✅ Check passed! All notes verified successfully.\n');
process.exit(0);
