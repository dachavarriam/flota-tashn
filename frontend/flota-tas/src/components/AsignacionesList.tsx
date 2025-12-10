import { useState, useEffect } from 'react';
import { asignacionesApi } from '../api/asignaciones';
import { EstadoAsignacion } from '../types/asignacion';
import type { Asignacion } from '../types/asignacion';
import './AsignacionesList.css';

interface AsignacionesListProps {
  onEdit?: (asignacion: Asignacion) => void;
  onCreate?: () => void;
}

export function AsignacionesList({ onEdit, onCreate }: AsignacionesListProps) {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAsignaciones();
  }, []);

  const loadAsignaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await asignacionesApi.getAll();
      setAsignaciones(data);
    } catch (err) {
      setError('Error al cargar asignaciones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta asignación?')) return;

    try {
      await asignacionesApi.delete(id);
      setAsignaciones(asignaciones.filter((a) => a.id !== id));
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al eliminar';
      alert(msg);
    }
  };

  const getStatusClass = (estado: EstadoAsignacion) => {
    switch (estado) {
      case EstadoAsignacion.ACTIVA: return 'status-activa';
      case EstadoAsignacion.FINALIZADA: return 'status-finalizada';
      case EstadoAsignacion.CANCELADA: return 'status-cancelada';
      default: return '';
    }
  };

  if (loading) return <div className="loading">Cargando asignaciones...</div>;

  if (error) {
    return (
      <div className="error-container">
        <p className="error">{error}</p>
        <button onClick={loadAsignaciones}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="asignaciones-list">
      <div className="list-header">
        <h2>Asignaciones</h2>
        {onCreate && (
          <button className="btn-primary" onClick={onCreate}>
            + Nueva Asignación
          </button>
        )}
      </div>

      {asignaciones.length === 0 ? (
        <p className="empty-state">No hay asignaciones registradas</p>
      ) : (
        <div className="table-container">
          <table className="asignaciones-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehículo</th>
                <th>Conductor</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asignaciones.map((asignacion) => (
                <tr key={asignacion.id}>
                  <td>#{asignacion.id}</td>
                  <td>
                    <strong>{asignacion.vehiculo?.placa || 'N/A'}</strong>
                    <br />
                    <small>{asignacion.vehiculo?.marca} {asignacion.vehiculo?.modelo}</small>
                  </td>
                  <td>{asignacion.usuario?.nombre || 'N/A'}</td>
                  <td>{new Date(asignacion.fecha).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(asignacion.estado)}`}>
                      {asignacion.estado}
                    </span>
                  </td>
                  <td className="actions">
                    {onEdit && (
                      <button
                        className="btn-edit"
                        onClick={() => onEdit(asignacion)}
                      >
                        {asignacion.estado === EstadoAsignacion.ACTIVA ? 'Finalizar/Editar' : 'Ver/Editar'}
                      </button>
                    )}
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(asignacion.id)}
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
      <p className="count">Mostrando {asignaciones.length} asignaciones</p>
    </div>
  );
}
