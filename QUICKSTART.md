# ⚡ Memorium - Quick Start (5 minuti)

## 🚀 Setup Veloce

```bash
# 1. Clona il progetto
git clone https://github.com/yourusername/memorium-v2.git
cd memorium-v2

# 2. Installa le dipendenze
npm install

# 3. Avvia l'app
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000) 🎉

---

## 🎯 Primo Utilizzo (3 passaggi)

### 1️⃣ Crea il tuo primo palazzo

1. Click su **"Nuovo Palazzo"**
2. Nome: `"La mia casa"`
3. Carica una foto 360° (o normale)
4. Click **"Crea Palazzo"**

### 2️⃣ Aggiungi un'annotazione

1. Click su **"Aggiungi Annotazione"**
2. Testo: `"Glucosio C6H12O6"`
3. Nota: `"Anello di 6 biscotti dorati"`
4. Click **"Aggiungi"**

### 3️⃣ Salva su Git

```bash
git add data/palaces.json
git commit -m "My first palace!"
git push
```

**Fatto!** I tuoi dati sono salvati e versionati 🎊

---

## 🤖 Setup AI (Opzionale)

**Vuoi usare l'AI per generare annotazioni automatiche?**

1. Vai su [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Crea un account (gratis)
3. Genera una API key (ti danno $5 gratis!)
4. Nell'app, click sull'icona **⚙️ Settings**
5. Incolla la tua API key
6. Click **"Salva API Key"**

Ora il pulsante **"Genera con AI"** funziona! ✨

---

## 📸 Come Creare Foto 360°

### Opzione 1: App Mobile (Consigliato)

**Google Street View** (Gratis)
- [Android](https://play.google.com/store/apps/details?id=com.google.android.street)
- [iOS](https://apps.apple.com/app/google-street-view/id904418768)

**Panorama 360**
- [Android](https://play.google.com/store/apps/details?id=com.foxpoi.panorama)

### Opzione 2: Fotocamera 360°

- Insta360
- Ricoh Theta
- Gopro Max

### Opzione 3: Foto Normali

Puoi usare anche foto normali! Memorium funziona con entrambe.

---

## 🎓 Workflow Quotidiano

```bash
# Mattina: sincronizza
git pull

# Durante il giorno: lavora nell'app
# (tutto salvato automaticamente)

# Sera: committa
git add data/palaces.json
git commit -m "Added 3 new palaces"
git push
```

---

## 🆘 Problemi Comuni

### "Module not found"
```bash
rm -rf node_modules
npm install
```

### "Port 3000 already in use"
```bash
# Cambia porta
npm run dev -- -p 3001
```

### "File data/palaces.json not found"
Viene creato automaticamente al primo avvio!

### "AI not working"
1. Controlla di aver configurato la API key in Settings
2. Verifica che la chiave inizi con `sk-`
3. Controlla di avere crediti su OpenAI

---

## 📚 Prossimi Passi

1. **Leggi il README** per features complete
2. **Leggi WORKFLOW.md** per Git best practices
3. **Sperimenta!** Crea palazzi, aggiungi annotazioni
4. **Contribuisci!** Pull requests benvenute 🙏

---

## 💡 Tips

- 🎨 Usa immagini di luoghi familiari (casa, ufficio)
- 📍 Distribuisci le annotazioni nello spazio
- 🤖 Prova l'AI su appunti di studio
- 💾 Committa spesso su Git
- 📤 Export backup settimanali (Settings → Export Backup)

---

## 🎉 Tutto Qui!

Sei pronto per costruire il tuo palazzo della memoria! 🏛️

**Domande?** Apri un [issue](https://github.com/yourusername/memorium-v2/issues) su GitHub

**Happy learning!** 🧠✨