// components/PreviewContainer.tsx - Convertito a Zustand
import React, { useEffect, useState } from 'react';
import { usePalaceStore } from '@/lib/store';
import { imageDB } from '@/lib/imageDB';
import styles from '../styles/components_style/PreviewContainer.module.css';

const PreviewContainer: React.FC = () => {
  const { palaces, currentPalaceId, currentImageIndex, setCurrentImage } = usePalaceStore();
  const [thumbnailUrls, setThumbnailUrls] = useState<{ [key: string]: string }>({});

  const currentPalace = palaces.find(p => p._id === currentPalaceId);

  // Carica i thumbnail delle immagini
  useEffect(() => {
    const loadThumbnails = async () => {
      if (!currentPalace) return;

      const urls: { [key: string]: string } = {};

      for (const image of currentPalace.images) {
        try {
          if (image.indexedDBKey) {
            urls[image.id] = await imageDB.getImageUrl(image.indexedDBKey);
          } else if (image.dataUrl) {
            urls[image.id] = image.dataUrl;
          }
        } catch (error) {
          console.error('Error loading thumbnail:', error);
        }
      }

      setThumbnailUrls(urls);
    };

    loadThumbnails();

    // Cleanup: revoca URL quando il componente si smonta
    return () => {
      Object.values(thumbnailUrls).forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [currentPalace]);

  if (!currentPalace || currentPalace.images.length === 0) {
    return (
      <div className={styles.container}>
        <p className={styles.emptyState}>No images in this palace</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>Images ({currentPalace.images.length})</h4>
      <div className={styles.thumbnails}>
        {currentPalace.images.map((image, index) => (
          <div
            key={image.id}
            className={`${styles.thumbnail} ${index === currentImageIndex ? styles.active : ''}`}
            onClick={() => setCurrentImage(index)}
          >
            {thumbnailUrls[image.id] ? (
              <img
                src={thumbnailUrls[image.id]}
                alt={image.name}
                className={styles.thumbnailImage}
              />
            ) : (
              <div className={styles.thumbnailPlaceholder}>Loading...</div>
            )}
            <div className={styles.thumbnailInfo}>
              <span className={styles.thumbnailName}>{image.name}</span>
              <span className={styles.thumbnailCount}>
                {image.annotations.length} annotations
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviewContainer;