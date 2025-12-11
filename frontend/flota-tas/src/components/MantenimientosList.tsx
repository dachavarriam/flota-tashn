import { useState, useEffect } from 'react';
import { mantenimientosApi } from '../api/mantenimientos';
import type { Mantenimiento } from '../types/mantenimiento';
import { useAuth } from '../context/AuthContext';
import { Wrench, Plus, Edit2, Trash2, Calendar, DollarSign, Gauge } from 'lucide-react';
import './MantenimientosList.css';

interface MantenimientosListProps {
  onCreate: () => void;
  onEdit: (mantenimiento: Mantenimiento) => void;
}

export function MantenimientosList({ onCreate, onEdit }: MantenimientosListProps) {
  const { user } = useAuth();
  const [mantenimientos, setMantenimientos] = useState<Mantenimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canCreate = user?.rol && ['ADMIN', 'SUPERVISOR', 'ENCARGADO'].includes(user.rol);
  const canEdit = user?.rol && ['ADMIN', 'SUPERVISOR', 'ENCARGADO'].includes(user.rol);
  const canDelete = user?.rol === 'ADMIN';

  useEffect(() => {
    loadMantenimientos();
  }, []);

  const loadMantenimientos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mantenimientosApi.getAll();
      setMantenimientos(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar mantenimientos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, placa: string) => {
    if (!window.confirm(`¿Eliminar mantenimiento del vehículo ${placa}?`)) return;

    try {
      await mantenimientosApi.delete(id);
      loadMantenimientos();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar mantenimiento');
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount?: number | null) => {
    if (!amount) return 'N/A';
    return `L ${amount.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`;
  };

  if (loading) return <div className="mantenimientos-loading">Cargando mantenimientos...</div>;
  if (error) return <div className="mantenimientos-error">{error}</div>;

  return (
    <div className="mantenimientos-list-container">
      <div className="mantenimientos-header">
        <h1>Mantenimientos</h1>
        {canCreate && (
          <button className="btn-create" onClick={onCreate}>
            <Plus size={20} />
            Nuevo Mantenimiento
          </button>
        )}
      </div>

      {mantenimientos.length === 0 ? (
        <div className="empty-state">
          <Wrench size={64} />
          <p>No hay mantenimientos registrados</p>
        </div>
      ) : (
        <div className="mantenimientos-grid">
          {mantenimientos.map((mant) => (
            <div key={mant.id} className="mantenimiento-card">
              <div className="mantenimiento-card-header">
                <div className="mantenimiento-vehiculo">
                  <Wrench size={20} />
                  <span>{mant.vehiculo?.placa} - {mant.vehiculo?.modelo}</span>
                </div>
                {(canEdit || canDelete) && (
                  <div className="card-actions">
                    {canEdit && (
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => onEdit(mant)}
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(mant.id, mant.vehiculo?.placa || '')}
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="mantenimiento-tipo-badge">{mant.tipo}</div>

              <div className="mantenimiento-details">
                <div className="detail-item">
                  <Calendar size={16} />
                  <span>{formatDate(mant.fecha)}</span>
                </div>

                <div className="detail-item">
                  <Gauge size={16} />
                  <span>{mant.kmActual.toLocaleString()} km</span>
                </div>

                {mant.costo && (
                  <div className="detail-item">
                    <DollarSign size={16} />
                    <span>{formatCurrency(mant.costo)}</span>
                  </div>
                )}
              </div>

              <p className="mantenimiento-descripcion">{mant.descripcion}</p>

              {mant.taller && (
                <p className="mantenimiento-taller">Taller: {mant.taller}</p>
              )}

              {mant.proximoMantenimiento && (
                <div className="proximo-mantenimiento">
                  Próximo: {mant.proximoMantenimiento.toLocaleString()} km
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
