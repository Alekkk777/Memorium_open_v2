// scripts/generate-icons.js - Generatore automatico icone PWA
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Configurazione
const CONFIG = {
  inputFile: path.join(__dirname, '../assets/icon-master.png'),
  outputDir: path.join(__dirname, '../public/icons'),
  backgroundColor: '#4F46E5', // Blu Memorium
  padding: 10, // Percentuale di padding (10%)
  
  // Dimensioni per PWA
  sizes: {
    // Standard PWA
    pwa: [72, 96, 128, 144, 152, 192, 384, 512],
    
    // iOS specifiche
    ios: [
      { size: 180, name: 'apple-touch-icon' },
      { size: 152, name: 'apple-touch-icon-ipad' },
      { size: 167, name: 'apple-touch-icon-ipad-retina' }
    ],
    
    // Android specifiche
    android: [
      { size: 192, name: 'android-chrome-192x192' },
      { size: 512, name: 'android-chrome-512x512' }
    ],
    
    // Favicon
    favicon: [16, 32, 64]
  }
};

// Converti hex color a RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    alpha: 1
  } : { r: 255, g: 255, b: 255, alpha: 1 };
}

// Crea directory se non esiste
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Creata directory: ${dir}`);
  }
}

// Genera singola icona
async function generateIcon(size, outputName, addPadding = true) {
  const outputFile = path.join(CONFIG.outputDir, `${outputName}.png`);
  const bgColor = hexToRgb(CONFIG.backgroundColor);
  
  try {
    let pipeline = sharp(CONFIG.inputFile);
    
    // Calcola dimensione finale con padding
    const finalSize = addPadding 
      ? Math.round(size * (1 - CONFIG.padding / 100)) 
      : size;
    
    // Resize e applica padding se richiesto
    if (addPadding) {
      await pipeline
        .resize(finalSize, finalSize, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .extend({
          top: Math.round((size - finalSize) / 2),
          bottom: Math.round((size - finalSize) / 2),
          left: Math.round((size - finalSize) / 2),
          right: Math.round((size - finalSize) / 2),
          background: bgColor
        })
        .png()
        .toFile(outputFile);
    } else {
      await pipeline
        .resize(size, size, {
          fit: 'contain',
          background: bgColor
        })
        .png()
        .toFile(outputFile);
    }
    
    return true;
  } catch (error) {
    console.error(`❌ Errore con ${outputName}:`, error.message);
    return false;
  }
}

// Genera favicon ICO (multi-size)
async function generateFavicon() {
  const faviconPath = path.join(__dirname, '../public/favicon.ico');
  
  try {
    // Genera favicon a 32x32 (la più comune)
    await sharp(CONFIG.inputFile)
      .resize(32, 32, {
        fit: 'contain',
        background: hexToRgb(CONFIG.backgroundColor)
      })
      .png()
      .toFile(faviconPath.replace('.ico', '.png'));
    
    console.log('✅ favicon.png creata (rinomina in .ico se necessario)');
  } catch (error) {
    console.error('❌ Errore favicon:', error.message);
  }
}

// Funzione principale
async function generateAllIcons() {
  console.log('🎨 Memorium Icon Generator v1.0\n');
  console.log('📷 Input:', CONFIG.inputFile);
  console.log('📁 Output:', CONFIG.outputDir);
  console.log('🎨 Colore:', CONFIG.backgroundColor);
  console.log('📐 Padding:', CONFIG.padding + '%\n');
  
  // Verifica che esista l'immagine master
  if (!fs.existsSync(CONFIG.inputFile)) {
    console.error('❌ ERRORE: File master non trovato!');
    console.error(`   Crea il file: ${CONFIG.inputFile}`);
    console.error('   Dimensione minima: 1024x1024px');
    console.error('   Formato: PNG con sfondo trasparente\n');
    process.exit(1);
  }
  
  // Crea directory output
  ensureDirectoryExists(CONFIG.outputDir);
  
  let successCount = 0;
  let totalCount = 0;
  
  // 1. Genera icone PWA standard
  console.log('📱 Generazione icone PWA...');
  for (const size of CONFIG.sizes.pwa) {
    totalCount++;
    const success = await generateIcon(size, `icon-${size}x${size}`);
    if (success) {
      console.log(`   ✅ icon-${size}x${size}.png`);
      successCount++;
    }
  }
  
  // 2. Genera icone iOS
  console.log('\n🍎 Generazione icone iOS...');
  for (const { size, name } of CONFIG.sizes.ios) {
    totalCount++;
    const success = await generateIcon(size, name);
    if (success) {
      console.log(`   ✅ ${name}.png (${size}x${size})`);
      successCount++;
    }
  }
  
  // 3. Genera icone Android
  console.log('\n🤖 Generazione icone Android...');
  for (const { size, name } of CONFIG.sizes.android) {
    totalCount++;
    const success = await generateIcon(size, name);
    if (success) {
      console.log(`   ✅ ${name}.png`);
      successCount++;
    }
  }
  
  // 4. Genera favicon
  console.log('\n🌐 Generazione favicon...');
  for (const size of CONFIG.sizes.favicon) {
    totalCount++;
    const success = await generateIcon(size, `favicon-${size}x${size}`, false);
    if (success) {
      console.log(`   ✅ favicon-${size}x${size}.png`);
      successCount++;
    }
  }
  
  await generateFavicon();
  
  // 5. Riepilogo
  console.log('\n' + '='.repeat(50));
  console.log(`✨ Completato: ${successCount}/${totalCount} icone generate`);
  console.log('='.repeat(50));
  
  // 6. Verifica manifest
  const manifestPath = path.join(__dirname, '../public/manifest.json');
  if (fs.existsSync(manifestPath)) {
    console.log('\n✅ manifest.json trovato');
    console.log('   Verifica che i path delle icone siano corretti');
  } else {
    console.log('\n⚠️  manifest.json non trovato');
    console.log('   Crea il file public/manifest.json');
  }
  
  console.log('\n🎉 Done! Le icone sono pronte in public/icons/\n');
}

// Esegui
generateAllIcons().catch(error => {
  console.error('\n❌ Errore fatale:', error);
  process.exit(1);
});