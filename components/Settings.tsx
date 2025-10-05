// components/Settings.tsx - Versione completa con sicurezza
import { useState, useEffect } from 'react';
import { X, Download, Trash2, Info, Key, Eye, EyeOff, Shield, Lock } from 'lucide-react';
import { imageDB } from '@/lib/imageDB';
import { usePalaceStore } from '@/lib/store';
import { saveAPIKey, getAPIKey, clearAPIKey } from '@/lib/aiGenerator';
import { 
  isEncryptionEnabled, 
  enableEncryption, 
  disableEncryption,
  exportEncryptedBackup 
} from '@/lib/security';

interface SettingsProps {
  onClose: () => void;
}

export default function Settings({ onClose }: SettingsProps) {
  const { palaces } = usePalaceStore();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [encryptionEnabled, setEncryptionEnabled] = useState(false);

  useEffect(() => {
    const existingKey = getAPIKey();
    if (existingKey) {
      setApiKey(existingKey);
    }
    setEncryptionEnabled(isEncryptionEnabled());
  }, []);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      setSaveMessage('Inserisci una API key valida');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      setSaveMessage('La API key deve iniziare con "sk-"');
      return;
    }

    saveAPIKey(apiKey);
    setSaveMessage('✓ API key salvata con successo');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  const handleClearApiKey = () => {
    if (confirm('Vuoi rimuovere la tua API key OpenAI?')) {
      clearAPIKey();
      setApiKey('');
      setSaveMessage('API key rimossa');
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleToggleEncryption = () => {
    if (encryptionEnabled) {
      if (confirm('Disabilitare la crittografia? I dati non saranno più protetti.')) {
        disableEncryption();
        setEncryptionEnabled(false);
        setSaveMessage('Crittografia disabilitata');
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } else {
      const password = prompt('Imposta una password per proteggere i tuoi dati:');
      if (password && password.length >= 6) {
        enableEncryption();
        setEncryptionEnabled(true);
        setSaveMessage('✓ Crittografia abilitata. Usa questa password al prossimo accesso.');
        setTimeout(() => setSaveMessage(null), 5000);
      } else if (password) {
        alert('La password deve essere di almeno 6 caratteri');
      }
    }
  };

  const handleExportEncrypted = async () => {
    const password = prompt('Inserisci una password per il backup criptato:');
    if (!password) return;

    try {
      await exportEncryptedBackup(palaces, password);
      alert('✓ Backup criptato esportato con successo!');
    } catch (error) {
      console.error('Errore export criptato:', error);
      alert('Errore durante l\'esportazione');
    }
  };

  const stats = {
    palaceCount: palaces.length,
    imageCount: palaces.reduce((sum, palace) => sum + (palace.images?.length ?? 0), 0),
    annotationCount: palaces.reduce(
      (sum, palace) =>
        sum +
        (palace.images?.reduce((imgSum, image) => imgSum + (image.annotations?.length ?? 0), 0) ?? 0),
      0
    ),
  };

  const handleExportBackup = () => {
    try {
      const data = {
        version: '2.0.0',
        exportDate: new Date().toISOString(),
        palaces: palaces,
      };

      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `memorium-backup-${Date.now()}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      alert('✓ Backup esportato con successo!');
    } catch (error) {
      console.error('Errore export:', error);
      alert('Errore durante l\'esportazione');
    }
  };

  const handleClearAll = async () => {
    const confirm1 = window.confirm(
      '⚠️ ATTENZIONE: Questa azione eliminerà tutti i tuoi palazzi e annotazioni.\n\nSei sicuro?'
    );

    if (!confirm1) return;

    const exportFirst = window.confirm('Vuoi esportare un backup prima di eliminare?');
    
    if (exportFirst) {
      handleExportBackup();
    }

    const finalConfirm = window.confirm(
      'Confermi l\'eliminazione di tutti i dati?'
    );

    if (!finalConfirm) return;

    setIsDeleting(true);
    try {
      await imageDB.clearAll();
      localStorage.removeItem('memorium_palaces');
      localStorage.removeItem('memorium_openai_key');
      localStorage.removeItem('memorium_encrypted');
      localStorage.removeItem('memorium_encryption_enabled');
      localStorage.removeItem('memorium_salt');
      
      alert('Tutti i dati sono stati eliminati.');
      window.location.reload();
    } catch (error) {
      console.error('Errore durante l\'eliminazione:', error);
      alert('Errore durante l\'eliminazione dei dati');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Impostazioni</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Statistics */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Info className="w-5 h-5" />
              Statistiche
            </h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Palazzi</p>
                <p className="text-2xl font-bold text-blue-600">{stats.palaceCount}</p>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Immagini</p>
                <p className="text-2xl font-bold text-green-600">{stats.imageCount}</p>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Annotazioni</p>
                <p className="text-2xl font-bold text-purple-600">{stats.annotationCount}</p>
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Sicurezza
            </h3>

            <div className="space-y-3">
              {/* Encryption Toggle */}
              <div className="p-4 border-2 rounded-lg transition-colors"
                style={{
                  borderColor: encryptionEnabled ? '#10b981' : '#e5e7eb',
                  backgroundColor: encryptionEnabled ? '#f0fdf4' : '#f9fafb'
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      encryptionEnabled ? 'bg-green-100' : 'bg-gray-200'
                    }`}>
                      <Lock className={`w-5 h-5 ${
                        encryptionEnabled ? 'text-green-600' : 'text-gray-500'
                      }`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Crittografia con Password
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {encryptionEnabled 
                          ? 'I tuoi dati sono protetti con crittografia AES-256'
                          : 'Proteggi i tuoi dati con una password forte'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleToggleEncryption}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      encryptionEnabled
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {encryptionEnabled ? 'Disabilita' : 'Abilita'}
                  </button>
                </div>
              </div>

              {/* Export Encrypted Backup */}
              <button
                onClick={handleExportEncrypted}
                className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Esporta Backup Criptato</p>
                    <p className="text-sm text-gray-600">
                      Crea un backup protetto con password
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </section>

          {/* API Key Configuration */}
          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Key className="w-5 h-5" />
              Configurazione AI (Opzionale)
            </h3>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-purple-800 mb-2">
                <strong>Perché serve?</strong>
              </p>
              <p className="text-xs text-purple-700">
                Per usare la generazione automatica di annotazioni con AI, hai bisogno di una API key OpenAI personale.
                Ottienila gratuitamente su{' '}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  platform.openai.com
                </a>
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    {showApiKey ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  La chiave viene salvata solo nel tuo browser (localStorage)
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveApiKey}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Salva API Key
                </button>
                
                {getAPIKey() && (
                  <button
                    onClick={handleClearApiKey}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                  >
                    Rimuovi
                  </button>
                )}
              </div>

              {saveMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  saveMessage.startsWith('✓') 
                    ? 'bg-green-50 text-green-800' 
                    : 'bg-red-50 text-red-800'
                }`}>
                  {saveMessage}
                </div>
              )}
            </div>
          </section>

          {/* Data Management */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Gestione Dati</h3>
            
            <div className="space-y-3">
              {/* Export Backup */}
              <button
                onClick={handleExportBackup}
                className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Esporta Backup</p>
                    <p className="text-sm text-gray-600">
                      Scarica una copia di sicurezza dei tuoi dati
                    </p>
                  </div>
                </div>
              </button>

              {/* Info Box */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>💡 Come funziona il salvataggio:</strong>
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  I tuoi dati vengono salvati automaticamente in localStorage del browser.
                  Esporta regolarmente un backup per sicurezza!
                </p>
              </div>

              {/* Clear All */}
              <button
                onClick={handleClearAll}
                disabled={isDeleting}
                className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-left disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-600 rounded-lg">
                    <Trash2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Elimina tutto</p>
                    <p className="text-sm text-gray-600">
                      Rimuovi permanentemente tutti i dati
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </section>

          {/* About */}
          <section>
            <h3 className="text-lg font-semibold mb-4">Informazioni</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Memorium V2</strong> - Digital Memory Palace
              </p>
              <p className="text-xs text-gray-600 mb-3">
                Versione 2.0.0 - Open Source PWA
              </p>
              <div className="flex gap-2 text-xs">
                <a
                  href="https://github.com/yourusername/memorium-v2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  GitHub
                </a>
                <span className="text-gray-400">•</span>
                <a
                  href="mailto:memorium.ai@gmail.com"
                  className="text-blue-600 hover:underline"
                >
                  Contact
                </a>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}