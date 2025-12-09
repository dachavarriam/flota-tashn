import { useState, useEffect } from 'react';
import { vehiculosApi } from '../api/vehiculos';
import type { Vehiculo } from '../types/vehiculo';
import './VehiculosList.css';

interface VehiculosListProps {
  onEdit?: (vehiculo: Vehiculo) => void;
  onCreate?: () => void;
}

export function VehiculosList({ onEdit, onCreate }: VehiculosListProps) {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadVehiculos();
  }, []);

  const loadVehiculos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vehiculosApi.getAll();
      setVehiculos(data);
    } catch (err) {
      setError('Error al cargar vehículos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, placa: string) => {
    if (!confirm(`¿Eliminar vehículo ${placa}?`)) return;

    try {
      await vehiculosApi.delete(id);
      setVehiculos(vehiculos.filter((v) => v.id !== id));
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al eliminar';
      alert(msg);
    }
  };

  const filteredVehiculos = vehiculos.filter((v) =>
    v.placa.toLowerCase().includes(search.toLowerCase()) ||
    v.marca?.toLowerCase().includes(search.toLowerCase()) ||
    v.modelo?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Cargando vehículos...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error">{error}</p>
        <button onClick={loadVehiculos}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="vehiculos-list">
      <div className="list-header">
        <h2>Vehículos</h2>
        {onCreate && (
          <button className="btn-primary" onClick={onCreate}>
            + Nuevo Vehículo
          </button>
        )}
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por placa, marca o modelo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredVehiculos.length === 0 ? (
        <p className="empty-state">No se encontraron vehículos</p>
      ) : (
        <div className="table-container">
          <table className="vehiculos-table">
            <thead>
              <tr>
                <th>Placa</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Tipo</th>
                <th>KM Actual</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehiculos.map((vehiculo) => (
                <tr key={vehiculo.id}>
                  <td>
                    <strong>{vehiculo.placa}</strong>
                  </td>
                  <td>{vehiculo.marca || '-'}</td>
                  <td>{vehiculo.modelo || '-'}</td>
                  <td>{vehiculo.tipo || '-'}</td>
                  <td>{vehiculo.kmActual.toLocaleString()} km</td>
                  <td className="actions">
                    {onEdit && (
                      <button
                        className="btn-edit"
                        onClick={() => onEdit(vehiculo)}
                      >
                        Editar
                      </button>
                    )}
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(vehiculo.id, vehiculo.placa)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="vehicle-count">
        Mostrando {filteredVehiculos.length} de {vehiculos.length} vehículos
      </p>
    </div>
  );
}
