// components/PalaceSidebar.tsx - Convertito a Zustand
import React, { useCallback, useState, useMemo } from "react";
import { usePalaceStore } from "@/lib/store";
import { exportPalace } from "@/lib/standardPalaces";
import styles from "../styles/components_style/PalaceSidebar.module.css";

export interface PalaceSidebarProps {
  onCreatePalace: () => void;
}

const PalaceSidebar: React.FC<PalaceSidebarProps> = ({ onCreatePalace }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { palaces, currentPalaceId, setCurrentPalace, deletePalace, setCurrentImage } = usePalaceStore();

  // Filtra i palazzi in base alla ricerca
  const filteredPalaces = useMemo(() => {
    return palaces.filter(palace =>
      palace.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [palaces, searchTerm]);

  const handlePalaceSelect = useCallback(
    (palaceId: string) => {
      console.log("Selecting palace:", palaceId);
      setCurrentPalace(palaceId);
      
      // Seleziona automaticamente la prima immagine
      const palace = palaces.find(p => p._id === palaceId);
      if (palace?.images && palace.images.length > 0) {
        setCurrentImage(0);
      }
    },
    [setCurrentPalace, setCurrentImage, palaces]
  );

  const handleDeletePalace = useCallback(
    async (palaceId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      
      if (window.confirm("Sei sicuro di voler eliminare questo palazzo?")) {
        await deletePalace(palaceId);
        console.log("✅ Palace deleted:", palaceId);
      }
    },
    [deletePalace]
  );

  const handleExportPalace = useCallback(
    (palaceId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      
      const palace = palaces.find(p => p._id === palaceId);
      if (!palace) return;

      exportPalace(palace);
      console.log("✅ Palace exported:", palace.name);
    },
    [palaces]
  );

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.title}>My Palaces</h2>
        <button onClick={onCreatePalace} className={styles.createButton}>
          + New Palace
        </button>
      </div>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search palaces..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.palacesList}>
        {filteredPalaces.length === 0 ? (
          <div className={styles.emptyState}>
            {searchTerm ? (
              <p>No palaces found for "{searchTerm}"</p>
            ) : (
              <p>
                No palaces yet. Create your first one!
                <br />
                <span className={styles.hint}>
                  Click "+ New Palace" above to start
                </span>
              </p>
            )}
          </div>
        ) : (
          filteredPalaces.map((palace) => (
            <div
              key={palace._id}
              className={`${styles.palaceItem} ${
                currentPalaceId === palace._id ? styles.active : ""
              }`}
              onClick={() => handlePalaceSelect(palace._id)}
            >
              <div className={styles.palaceInfo}>
                <h3 className={styles.palaceName}>{palace.name}</h3>
                <p className={styles.palaceStats}>
                  {palace.images?.length ?? 0} image
                  {(palace.images?.length ?? 0) !== 1 ? "s" : ""}
                </p>
              </div>

              <div className={styles.palaceActions}>
                <button
                  onClick={(e) => handleExportPalace(palace._id, e)}
                  className={styles.actionButton}
                  title="Export palace"
                >
                  📥
                </button>
                <button
                  onClick={(e) => handleDeletePalace(palace._id, e)}
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  title="Delete palace"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={styles.footer}>
        <p className={styles.storageInfo}>
          💾 All data saved locally in your browser
        </p>
      </div>
    </div>
  );
};

export default React.memo(PalaceSidebar);