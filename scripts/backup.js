#!/usr/bin/env node

/**
 * Backup Script for Memorium
 * Creates a timestamped backup of palaces.json
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(process.cwd(), 'data', 'palaces.json');
const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');

// Crea la directory backups se non esiste
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Leggi il file corrente
if (!fs.existsSync(DATA_FILE)) {
  console.error('❌ Error: data/palaces.json not found');
  process.exit(1);
}

const data = fs.readFileSync(DATA_FILE, 'utf-8');

// Crea il nome del backup con timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const backupFile = path.join(BACKUP_DIR, `palaces-${timestamp}.json`);

// Salva il backup
fs.writeFileSync(backupFile, data);

console.log('✅ Backup created successfully!');
console.log(`📁 Location: ${backupFile}`);

// Stats
const stats = JSON.parse(data);
const palaceCount = stats.palaces?.length || 0;
const imageCount = stats.palaces?.reduce((sum, p) => sum + (p.images?.length || 0), 0) || 0;

console.log(`📊 Backed up: ${palaceCount} palaces, ${imageCount} images`);

// Pulizia vecchi backup (mantieni solo gli ultimi 10)
const backupFiles = fs.readdirSync(BACKUP_DIR)
  .filter(f => f.startsWith('palaces-') && f.endsWith('.json'))
  .sort()
  .reverse();

if (backupFiles.length > 10) {
  const toDelete = backupFiles.slice(10);
  toDelete.forEach(file => {
    fs.unlinkSync(path.join(BACKUP_DIR, file));
    console.log(`🗑️  Deleted old backup: ${file}`);
  });
}

console.log(`\n💡 Tip: Commit backups to Git for extra safety!`);
console.log(`   git add data/backups/`);
console.log(`   git commit -m "Backup: ${timestamp}"`);