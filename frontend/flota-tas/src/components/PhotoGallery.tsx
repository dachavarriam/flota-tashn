import { useState, useRef } from 'react';
import { Camera, X, Upload, Trash2 } from 'lucide-react';
import './PhotoGallery.css';

interface Photo {
  id?: number;
  url: string;
  tipo: string;
  file?: File;
}

interface PhotoGalleryProps {
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
  readOnly?: boolean;
  tipos?: string[];
}

const DEFAULT_TIPOS = ['frontal', 'trasera', 'lateral_izq', 'lateral_der', 'dano'];

export function PhotoGallery({ photos, onPhotosChange, readOnly = false, tipos = DEFAULT_TIPOS }: PhotoGalleryProps) {
  const [selectedTipo, setSelectedTipo] = useState(tipos[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newPhotos: Photo[] = files.map(file => ({
      url: URL.createObjectURL(file),
      tipo: selectedTipo,
      file
    }));

    onPhotosChange([...photos, ...newPhotos]);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeletePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      frontal: 'Frontal',
      trasera: 'Trasera',
      lateral_izq: 'Lateral Izq',
      lateral_der: 'Lateral Der',
      dano: 'Daño',
      general: 'General'
    };
    return labels[tipo] || tipo;
  };

  const getTipoColor = (tipo: string) => {
    const colors: Record<string, string> = {
      frontal: '#4CAF50',
      trasera: '#2196F3',
      lateral_izq: '#FF9800',
      lateral_der: '#9C27B0',
      dano: '#F44336',
      general: '#607D8B'
    };
    return colors[tipo] || '#607D8B';
  };

  return (
    <div className="photo-gallery">
      {!readOnly && (
        <div className="photo-upload-section">
          <div className="tipo-selector">
            <label>Tipo de Foto:</label>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="tipo-select"
            >
              {tipos.map(tipo => (
                <option key={tipo} value={tipo}>
                  {getTipoLabel(tipo)}
                </option>
              ))}
            </select>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          <div className="upload-buttons">
            <button
              type="button"
              className="upload-btn camera-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={20} />
              Capturar Foto
            </button>
            <button
              type="button"
              className="upload-btn gallery-btn"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.removeAttribute('capture');
                  fileInputRef.current.click();
                }
              }}
            >
              <Upload size={20} />
              Desde Galería
            </button>
          </div>
        </div>
      )}

      <div className="photos-grid">
        {photos.length === 0 && (
          <div className="no-photos">
            <Camera size={48} strokeWidth={1} />
            <p>No hay fotos capturadas</p>
          </div>
        )}

        {photos.map((photo, index) => (
          <div key={index} className="photo-card">
            <div
              className="photo-tipo-badge"
              style={{ backgroundColor: getTipoColor(photo.tipo) }}
            >
              {getTipoLabel(photo.tipo)}
            </div>

            <img
              src={photo.url}
              alt={`Foto ${getTipoLabel(photo.tipo)}`}
              className="photo-img"
              onClick={() => window.open(photo.url, '_blank')}
            />

            {!readOnly && (
              <button
                type="button"
                className="delete-photo-btn"
                onClick={() => handleDeletePhoto(index)}
                title="Eliminar foto"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
