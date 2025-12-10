import { useState, useEffect } from 'react';
import { asignacionesApi } from '../api/asignaciones';
import { EstadoAsignacion } from '../types/asignacion';
import type { Asignacion } from '../types/asignacion';
import { Plus, Calendar, User, Truck, ChevronRight } from 'lucide-react';
import './AsignacionesList.css';

interface AsignacionesListProps {
  onEdit?: (asignacion: Asignacion) => void;
  onCreate?: () => void;
}

const FILTERS = ['Todas', 'Activas', 'Finalizadas'];

export function AsignacionesList({ onEdit, onCreate }: AsignacionesListProps) {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Todas');

  useEffect(() => {
    loadAsignaciones();
  }, []);

  const loadAsignaciones = async () => {
    try {
      setLoading(true);
      const data = await asignacionesApi.getAll();
      setAsignaciones(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAsignaciones = asignaciones.filter(a => {
      if (activeFilter === 'Todas') return true;
      if (activeFilter === 'Activas') return a.estado === EstadoAsignacion.ACTIVA;
      if (activeFilter === 'Finalizadas') return a.estado === EstadoAsignacion.FINALIZADA;
      return true;
  });

  const getStatusColor = (estado: EstadoAsignacion) => {
      switch (estado) {
          case EstadoAsignacion.ACTIVA: return 'status-blue';
          case EstadoAsignacion.FINALIZADA: return 'status-green';
          default: return 'status-gray';
      }
  };

  if (loading) return <div className="loading-spinner">Cargando asignaciones...</div>;

  return (
    <div className="asignaciones-container">
      
      {/* Header */}
      <div className="list-header-modern">
          <h2 className="page-title">Asignaciones</h2>
          {onCreate && (
              <button className="btn-add-modern" onClick={onCreate}>
                  <Plus size={24} />
              </button>
          )}
      </div>

      {/* Filters */}
      <div className="filters-scroll">
          {FILTERS.map(filter => (
              <button 
                  key={filter}
                  className={`filter-chip ${activeFilter === filter ? 'active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
              >
                  {filter}
              </button>
          ))}
      </div>

      {/* List */}
      <div className="asignaciones-list-modern">
          {filteredAsignaciones.map((asignacion) => (
              <div 
                key={asignacion.id} 
                className="asignacion-card"
                onClick={() => onEdit?.(asignacion)}
              >
                  <div className="card-top">
                      <span className={`status-badge ${getStatusColor(asignacion.estado)}`}>
                          {asignacion.estado}
                      </span>
                      <span className="card-date">
                          {new Date(asignacion.fecha).toLocaleDateString()}
                      </span>
                  </div>
                  
                  <div className="card-main">
                      <div className="info-row">
                          <Truck size={16} className="info-icon" />
                          <span className="info-text bold">
                              {asignacion.vehiculo?.placa} 
                              <span className="model-text"> • {asignacion.vehiculo?.modelo}</span>
                          </span>
                      </div>
                      <div className="info-row">
                          <User size={16} className="info-icon" />
                          <span className="info-text">{asignacion.usuario?.nombre}</span>
                      </div>
                  </div>

                  <div className="card-arrow">
                      <ChevronRight size={20} />
                  </div>
              </div>
          ))}
      </div>

      {filteredAsignaciones.length === 0 && <p className="empty-msg">No hay asignaciones</p>}
    </div>
  );
}