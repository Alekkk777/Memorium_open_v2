// components/ImageContainer.tsx - Convertito a Zustand
import React, { useEffect, useState } from 'react';
import { usePalaceStore } from '@/lib/store';
import { imageDB } from '@/lib/imageDB';
import styles from '../styles/components_style/ImageContainer.module.css';

const ImageContainer: React.FC = () => {
  const { palaces, currentPalaceId, currentImageIndex } = usePalaceStore();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const currentPalace = palaces.find(p => p._id === currentPalaceId);
  const currentImage = currentPalace && currentImageIndex !== null 
    ? currentPalace.images[currentImageIndex] 
    : null;

  // Carica l'immagine (da dataUrl o IndexedDB)
  useEffect(() => {
    const loadImage = async () => {
      if (!currentImage) {
        setImageUrl(null);
        return;
      }

      setIsLoading(true);

      try {
        if (currentImage.indexedDBKey) {
          // Carica da IndexedDB
          const url = await imageDB.getImageUrl(currentImage.indexedDBKey);
          setImageUrl(url);
        } else if (currentImage.dataUrl) {
          // Usa dataUrl direttamente
          setImageUrl(currentImage.dataUrl);
        } else {
          setImageUrl(null);
        }
      } catch (error) {
        console.error('Error loading image:', error);
        setImageUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();

    // Cleanup: revoca URL quando il componente si smonta
    return () => {
      if (imageUrl && imageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [currentImage]);

  if (!currentImage) {
    return (
      <div className={styles.emptyState}>
        <p>Select a palace and image to view</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading image...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.imageWrapper}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={currentImage.name}
            className={styles.image360}
          />
        ) : (
          <div className={styles.loading}>Image not available</div>
        )}
      </div>
      
      <div className={styles.imageInfo}>
        <h3>{currentImage.name}</h3>
        <p>{currentImage.annotations.length} annotations</p>
      </div>
    </div>
  );
};

export default ImageContainer;