import { useState, useEffect } from 'react';
import { vehiculosApi } from '../api/vehiculos';
import type { Vehiculo } from '../types/vehiculo';
import { Search, Plus } from 'lucide-react';
import './VehiculosList.css';

interface VehiculosListProps {
  onEdit?: (vehiculo: Vehiculo) => void;
  onCreate?: () => void;
}

export function VehiculosList({ onEdit, onCreate }: VehiculosListProps) {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadVehiculos();
  }, []);

  const loadVehiculos = async () => {
    try {
      setLoading(true);
      const data = await vehiculosApi.getAll();
      setVehiculos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehiculos = vehiculos.filter((v) =>
    v.placa.toLowerCase().includes(search.toLowerCase()) ||
    v.marca?.toLowerCase().includes(search.toLowerCase()) ||
    v.modelo?.toLowerCase().includes(search.toLowerCase())
  );

  // Placeholder default
  const CAR_PLACEHOLDER = "https://cdn-icons-png.flaticon.com/512/3202/3202926.png"; 

  // Function to get image path (try local file first logically)
  const getCarImage = (placa: string) => {
      // In Vite public folder, we reference from root /
      return `/vehiculos/${placa}.png`;
  };

  // Helper to handle image error and fallback
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      e.currentTarget.src = CAR_PLACEHOLDER;
  };

  if (loading) return <div className="loading-spinner">Cargando flota...</div>;

  return (
    <div className="vehiculos-container">
      
      {/* Search Header */}
      <div className="search-header">
        <div className="search-pill">
            <Search size={20} className="search-icon" />
            <input 
                type="text" 
                placeholder="Buscar placa..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        {onCreate && (
            <button className="btn-add-float" onClick={onCreate}>
                <Plus size={24} />
            </button>
        )}
      </div>

      {/* Cards Grid */}
      <div className="vehiculos-grid">
        {filteredVehiculos.map((vehiculo) => (
            <div
                key={vehiculo.id}
                className={`vehiculo-card ${!vehiculo.disponible ? 'no-disponible' : ''}`}
                onClick={() => onEdit?.(vehiculo)}
            >
                <div className="card-content">
                    <div className="card-info">
                        <span className={`card-badge ${vehiculo.disponible ? 'badge-disponible' : 'badge-en-uso'}`}>
                          {vehiculo.disponible ? 'Disponible' : 'En Uso'}
                        </span>
                        <h2 className="card-placa">{vehiculo.placa}</h2>
                        <p className="card-model">{vehiculo.marca} {vehiculo.modelo}</p>
                        <p className="card-km">{vehiculo.kmActual.toLocaleString()} km</p>
                        {vehiculo.asignacionActiva && (
                          <p className="card-asignacion-info" style={{fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem'}}>
                            Asignado a: {vehiculo.asignacionActiva.usuario.nombre} ({vehiculo.asignacionActiva.estado})
                          </p>
                        )}
                    </div>
                    <div className="card-image-wrapper">
                        <img
                            src={getCarImage(vehiculo.placa)}
                            alt={vehiculo.placa}
                            className="card-image"
                            onError={handleImageError}
                        />
                    </div>
                </div>
            </div>
        ))}
      </div>
      
      {filteredVehiculos.length === 0 && (
          <p className="empty-msg">No se encontraron vehículos</p>
      )}
    </div>
  );
}
