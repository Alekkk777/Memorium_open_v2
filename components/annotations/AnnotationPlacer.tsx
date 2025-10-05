// components/annotations/AnnotationPlacer.tsx - Click per posizionare annotazioni
import { useState, useRef } from 'react';
import { X, Check, MousePointer } from 'lucide-react';
import * as THREE from 'three';

interface AnnotationPlacerProps {
  is360: boolean;
  onPositionSelect: (position: { x: number; y: number; z: number }) => void;
  onCancel: () => void;
}

export default function AnnotationPlacer({ is360, onPositionSelect, onCancel }: AnnotationPlacerProps) {
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number; z: number } | null>(null);
  const [clickPoint, setClickPoint] = useState<{ x: number; y: number } | null>(null);

  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Converti coordinate 2D schermo in 3D sphere
    let position3D: { x: number; y: number; z: number };

    if (is360) {
      // Per immagini 360°: proietta su sphere
      const theta = x * Math.PI; // Rotazione orizzontale (-π a π)
      const phi = (y * 0.5 + 0.5) * Math.PI; // Rotazione verticale (0 a π)

      position3D = {
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.cos(phi),
        z: Math.sin(phi) * Math.sin(theta)
      };
    } else {
      // Per immagini normali: posizione su plane
      position3D = {
        x: x * 8,
        y: y * 4.5,
        z: -9
      };
    }

    setSelectedPosition(position3D);
    setClickPoint({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  const handleConfirm = () => {
    if (selectedPosition) {
      onPositionSelect(selectedPosition);
    }
  };

  return (
    <>
      {/* Overlay con istruzioni */}
      <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm pointer-events-none">
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 pointer-events-auto">
          <div className="bg-white rounded-lg shadow-xl p-4 max-w-md">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MousePointer className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Posiziona l'annotazione</h3>
                <p className="text-sm text-gray-600">
                  Clicca nell'immagine dove vuoi aggiungere la nota
                </p>
              </div>
            </div>

            {selectedPosition && (
              <div className="flex gap-2">
                <button
                  onClick={handleConfirm}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Check className="w-4 h-4" />
                  Conferma Posizione
                </button>
                <button
                  onClick={onCancel}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {!selectedPosition && (
              <button
                onClick={onCancel}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Annulla
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Clickable overlay */}
      <div 
        className="absolute inset-0 z-40 cursor-crosshair"
        onClick={handleCanvasClick}
      />

      {/* Punto di selezione */}
      {clickPoint && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: clickPoint.x,
            top: clickPoint.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-blue-500 opacity-50 animate-ping"></div>
            <div className="absolute inset-0 w-8 h-8 rounded-full bg-blue-600 border-2 border-white"></div>
          </div>
        </div>
      )}
    </>
  );
}