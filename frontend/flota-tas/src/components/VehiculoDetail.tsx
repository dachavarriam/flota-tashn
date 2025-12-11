import { useState, useEffect } from 'react';
import { vehiculosApi } from '../api/vehiculos';
import type { Vehiculo } from '../types/vehiculo';
import { Car, Calendar, Gauge, Wrench, History, Edit2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './VehiculoDetail.css';

interface VehiculoDetailProps {
  vehiculoId: number;
  onEdit?: (vehiculo: Vehiculo) => void;
  onClose?: () => void;
}

export function VehiculoDetail({ vehiculoId, onEdit, onClose }: VehiculoDetailProps) {
  const { user } = useAuth();
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user can edit (SUPERVISOR, ADMIN, or ENCARGADO)
  const canEdit = user?.rol && ['SUPERVISOR', 'ADMIN', 'ENCARGADO'].includes(user.rol);

  useEffect(() => {
    loadVehiculo();
  }, [vehiculoId]);

  const loadVehiculo = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await vehiculosApi.getOne(vehiculoId);
      setVehiculo(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar vehículo');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="vehiculo-detail-loading">Cargando...</div>;
  }

  if (error || !vehiculo) {
    return (
      <div className="vehiculo-detail-error">
        <p>{error || 'Vehículo no encontrado'}</p>
        <button onClick={onClose} className="btn-close-error">Cerrar</button>
      </div>
    );
  }

  return (
    <div className="vehiculo-detail-container">
      {/* Header */}
      <div className="detail-header">
        <div className="detail-header-info">
          <h1 className="detail-placa">{vehiculo.placa}</h1>
          <p className="detail-modelo">{vehiculo.marca} {vehiculo.modelo}</p>
          {vehiculo.disponible !== undefined && (
            <span className={`detail-badge ${vehiculo.disponible ? 'badge-disponible' : 'badge-en-uso'}`}>
              {vehiculo.disponible ? 'Disponible' : 'En Uso'}
            </span>
          )}
        </div>
        <div className="detail-header-actions">
          {canEdit && (
            <button
              onClick={() => onEdit?.(vehiculo)}
              className="btn-edit-detail"
              title="Editar vehículo"
            >
              <Edit2 size={20} />
              Editar
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="btn-close-detail" title="Cerrar">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Information Grid */}
      <div className="detail-grid">
        {/* Información General */}
        <div className="detail-card">
          <h3 className="detail-card-title">
            <Car size={20} />
            Información General
          </h3>
          <div className="detail-info-grid">
            <div className="info-item">
              <label>Placa</label>
              <span>{vehiculo.placa}</span>
            </div>
            <div className="info-item">
              <label>Marca</label>
              <span>{vehiculo.marca || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Modelo</label>
              <span>{vehiculo.modelo || 'N/A'}</span>
            </div>
            <div className="info-item">
              <label>Tipo</label>
              <span>{vehiculo.tipo || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Kilometraje */}
        <div className="detail-card">
          <h3 className="detail-card-title">
            <Gauge size={20} />
            Kilometraje
          </h3>
          <div className="detail-info-grid">
            <div className="info-item">
              <label>KM Actual</label>
              <span className="km-value">{vehiculo.kmActual.toLocaleString()} km</span>
            </div>
            <div className="info-item">
              <label>Último Mantenimiento</label>
              <span className="km-value">{vehiculo.kmUltimoMantenimiento.toLocaleString()} km</span>
            </div>
            <div className="info-item">
              <label>KM desde mantenimiento</label>
              <span className={`km-value ${(vehiculo.kmActual - vehiculo.kmUltimoMantenimiento) > 5000 ? 'km-warning' : ''}`}>
                {(vehiculo.kmActual - vehiculo.kmUltimoMantenimiento).toLocaleString()} km
              </span>
            </div>
          </div>
        </div>

        {/* Mantenimiento */}
        <div className="detail-card">
          <h3 className="detail-card-title">
            <Wrench size={20} />
            Mantenimiento
          </h3>
          <div className="detail-info-grid">
            <div className="info-item">
              <label>Fecha Último Mantenimiento</label>
              <span>{formatDate(vehiculo.fechaUltimoMantenimiento)}</span>
            </div>
            <div className="info-item">
              <label>Próximo Mantenimiento</label>
              <span className="km-value">
                {vehiculo.kmUltimoMantenimiento + 5000} km
              </span>
            </div>
          </div>
          {(vehiculo.kmActual - vehiculo.kmUltimoMantenimiento) > 5000 && (
            <div className="maintenance-alert">
              ⚠️ Mantenimiento vencido - Se recomienda servicio inmediato
            </div>
          )}
        </div>

        {/* Asignación Activa */}
        {vehiculo.asignacionActiva && (
          <div className="detail-card highlight-card">
            <h3 className="detail-card-title">
              <History size={20} />
              Asignación Actual
            </h3>
            <div className="detail-info-grid">
              <div className="info-item">
                <label>Estado</label>
                <span className="estado-badge">{vehiculo.asignacionActiva.estado}</span>
              </div>
              <div className="info-item">
                <label>Asignado a</label>
                <span>{vehiculo.asignacionActiva.usuario.nombre}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Historial de Asignaciones */}
      {vehiculo.asignaciones && vehiculo.asignaciones.length > 0 && (
        <div className="detail-card detail-history">
          <h3 className="detail-card-title">
            <Calendar size={20} />
            Historial de Asignaciones (Últimas 5)
          </h3>
          <div className="history-list">
            {vehiculo.asignaciones.map((asignacion: any) => (
              <div key={asignacion.id} className="history-item">
                <div className="history-item-header">
                  <span className={`history-estado ${asignacion.estado.toLowerCase()}`}>
                    {asignacion.estado}
                  </span>
                  <span className="history-date">
                    {formatDate(asignacion.fecha)}
                  </span>
                </div>
                <div className="history-item-body">
                  <p><strong>Conductor:</strong> {asignacion.usuario.nombre}</p>
                  <p><strong>Encargado:</strong> {asignacion.encargado.nombre}</p>
                  {asignacion.kmSalida && (
                    <p><strong>KM:</strong> {asignacion.kmSalida} → {asignacion.kmRetorno || 'En curso'}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
