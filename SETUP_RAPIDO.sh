#!/bin/bash
# SETUP_RAPIDO.sh - Setup completo PWA in un comando

echo "🚀 Memorium PWA Setup"
echo "===================="
echo ""

# 1. Backup
echo "📦 Step 1: Backup files..."
mkdir -p backup-pre-pwa
cp pages/_app.tsx backup-pre-pwa/ 2>/dev/null || true
cp pages/index.tsx backup-pre-pwa/ 2>/dev/null || true
cp pages/_document.tsx backup-pre-pwa/ 2>/dev/null || true
echo "✅ Backup complete"
echo ""

# 2. Crea cartelle necessarie
echo "📁 Step 2: Creating directories..."
mkdir -p public/icons
mkdir -p scripts
echo "✅ Directories created"
echo ""

# 3. Messaggio per i file da copiare
echo "📝 Step 3: Copy files from artifacts"
echo ""
echo "Please copy these files from the artifacts above:"
echo "  1. public/manifest.json"
echo "  2. public/sw.js"
echo "  3. pages/_document.tsx"
echo "  4. pages/_app.tsx (simplified version)"
echo "  5. pages/index.tsx (simplified version)"
echo "  6. next.config.js"
echo "  7. All Redux files (palaceSlice, userSlice, etc.)"
echo ""
read -p "Have you copied all files? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Please copy all files first, then run this script again"
    exit 1
fi
echo "✅ Files copied"
echo ""

# 4. Genera icone (opzionale)
echo "🎨 Step 4: Generate PWA icons"
echo ""
echo "Choose an option:"
echo "  1. I'll use PWA Builder online (https://pwabuilder.com/imageGenerator)"
echo "  2. Generate with Sharp script (requires logo.png in public/)"
echo "  3. Skip for now (you can do it later)"
echo ""
read -p "Your choice (1/2/3): " icon_choice

case $icon_choice in
  1)
    echo ""
    echo "🌐 Please:"
    echo "  1. Go to https://pwabuilder.com/imageGenerator"
    echo "  2. Upload your logo (min 512x512px)"
    echo "  3. Download the ZIP"
    echo "  4. Extract to public/icons/"
    echo ""
    read -p "Press Enter when done..."
    ;;
  2)
    if [ -f "public/logo.png" ]; then
      npm install --save-dev sharp
      node scripts/generate-icons.js
    else
      echo "❌ public/logo.png not found!"
      echo "Please add your logo.png and run: node scripts/generate-icons.js"
    fi
    ;;
  3)
    echo "⏭️  Skipping icon generation"
    ;;
esac
echo ""

# 5. Pulisci e reinstalla dipendenze
echo "📦 Step 5: Install dependencies..."
rm -rf node_modules package-lock.json
npm install
echo "✅ Dependencies installed"
echo ""

# 6. Pulisci build
echo "🧹 Step 6: Clean build..."
rm -rf .next
echo "✅ Build cleaned"
echo ""

# 7. Test
echo "🧪 Step 7: Starting development server..."
echo ""
echo "Commands available:"
echo "  npm run dev   - Development mode"
echo "  npm run build - Production build"
echo "  npm start     - Production server (after build)"
echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "  1. Run: npm run dev"
echo "  2. Open: http://localhost:3000"
echo "  3. Test creating a palace"
echo "  4. For PWA test: npm run build && npm start"
echo "  5. Deploy: vercel --prod"
echo ""
echo "🎉 Happy building!"