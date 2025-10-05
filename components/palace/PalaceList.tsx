// components/palace/PalaceList.tsx - SENZA bottone palazzi standard
import { usePalaceStore } from '@/lib/store';
import { Trash2, Image as ImageIcon } from 'lucide-react';

export default function PalaceList() {
  const { palaces, currentPalaceId, setCurrentPalace, deletePalace } = usePalaceStore();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm('Sei sicuro di voler eliminare questo palazzo? Questa azione non può essere annullata.')) {
      await deletePalace(id);
    }
  };

  const handlePalaceClick = (palaceId: string) => {
    setCurrentPalace(palaceId);
  };

  return (
    <div className="space-y-2">
      {palaces.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Nessun palazzo ancora</p>
          <p className="text-xs mt-1">Clicca "+ Nuovo Palazzo" per iniziare!</p>
        </div>
      ) : (
        palaces.map((palace) => (
          <div
            key={palace._id}
            onClick={() => handlePalaceClick(palace._id)}
            className={`
              w-full text-left p-4 rounded-lg transition-all group cursor-pointer
              ${
                currentPalaceId === palace._id
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
              }
            `}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {palace.name}
                </h3>
                
                {palace.description && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {palace.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    {palace.images?.length ?? 0} {(palace.images?.length ?? 0) === 1 ? 'immagine' : 'immagini'}
                  </span>
                  
                  <span>
                    {new Date(palace.createdAt).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>
              </div>

              <button
                onClick={(e) => handleDelete(palace._id, e)}
                className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-100 rounded-lg transition-all"
                title="Elimina palazzo"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}