// components/AnnotationSidebar.tsx - Convertito a Zustand
import React, { useState } from 'react';
import { usePalaceStore } from '@/lib/store';
import styles from '../styles/components_style/AnnotationSidebar.module.css';

const AnnotationSidebar: React.FC = () => {
  const { palaces, currentPalaceId, currentImageIndex, addAnnotation, deleteAnnotation } = usePalaceStore();

  const [newAnnotationText, setNewAnnotationText] = useState('');
  const [newAnnotationNote, setNewAnnotationNote] = useState('');

  const currentPalace = palaces.find(p => p._id === currentPalaceId);
  const currentImage = currentPalace && currentImageIndex !== null 
    ? currentPalace.images[currentImageIndex] 
    : null;

  const handleAddAnnotation = () => {
    if (!currentPalace || currentImageIndex === null || !newAnnotationText.trim()) {
      return;
    }

    const newAnnotation = {
      text: newAnnotationText,
      note: newAnnotationNote,
      position: { x: 0, y: 0, z: -1 },
      rotation: { x: 0, y: 0, z: 0 },
      width: 100,
      height: 100,
      isVisible: true,
      selected: false,
      isGenerated: false,
    };

    addAnnotation(currentPalace._id, currentImage!.id, newAnnotation);

    setNewAnnotationText('');
    setNewAnnotationNote('');
  };

  const handleDeleteAnnotation = (annotationId: string) => {
    if (!currentPalace || currentImageIndex === null) return;

    deleteAnnotation(currentPalace._id, currentImage!.id, annotationId);
  };

  if (!currentImage) {
    return (
      <div className={styles.sidebar}>
        <h3>Annotations</h3>
        <p className={styles.emptyState}>Select an image to add annotations</p>
      </div>
    );
  }

  return (
    <div className={styles.sidebar}>
      <h3>Annotations ({currentImage.annotations.length})</h3>

      <div className={styles.addForm}>
        <input
          type="text"
          placeholder="Annotation text..."
          value={newAnnotationText}
          onChange={(e) => setNewAnnotationText(e.target.value)}
          className={styles.input}
        />
        <textarea
          placeholder="Note (optional)..."
          value={newAnnotationNote}
          onChange={(e) => setNewAnnotationNote(e.target.value)}
          className={styles.textarea}
          rows={3}
        />
        <button onClick={handleAddAnnotation} className={styles.addButton}>
          + Add Annotation
        </button>
      </div>

      <div className={styles.annotationList}>
        {currentImage.annotations.map((annotation) => (
          <div key={annotation.id} className={styles.annotationItem}>
            <div className={styles.annotationHeader}>
              <strong>{annotation.text}</strong>
              <button
                onClick={() => handleDeleteAnnotation(annotation.id)}
                className={styles.deleteButton}
              >
                🗑️
              </button>
            </div>
            {annotation.note && (
              <p className={styles.annotationNote}>{annotation.note}</p>
            )}
            {annotation.isGenerated && (
              <span className={styles.aiBadge}>AI Generated</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnnotationSidebar;