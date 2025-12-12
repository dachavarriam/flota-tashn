import { useState, useEffect } from 'react';
import { asignacionesApi } from '../api/asignaciones';
import { EstadoAsignacion } from '../types/asignacion';
import type { Asignacion } from '../types/asignacion';
import { Plus, User, Truck, ChevronRight, AlertTriangle, FileText } from 'lucide-react';
import './AsignacionesList.css';

interface AsignacionesListProps {
  onEdit?: (asignacion: Asignacion) => void;
  onCreate?: () => void;
}

const FILTERS = ['Todas', 'Activas', 'En Revisión', 'Finalizadas', 'Con Daños'];

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
      if (activeFilter === 'En Revisión') return a.estado === EstadoAsignacion.EN_REVISION;
      if (activeFilter === 'Finalizadas') return a.estado === EstadoAsignacion.FINALIZADA;
      if (activeFilter === 'Con Daños') return a.tieneDanos === true;
      return true;
  });

  const handleExportPdf = async (e: React.MouseEvent, id: number, numeroRegistro?: string) => {
    e.stopPropagation();
    try {
      const blob = await asignacionesApi.exportPdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asignacion_${numeroRegistro || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Error al exportar PDF');
    }
  };

  const getStatusColor = (estado: EstadoAsignacion) => {
      switch (estado) {
          case EstadoAsignacion.ACTIVA: return 'status-blue';
          case EstadoAsignacion.EN_REVISION: return 'status-yellow';
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
                      <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap'}}>
                          {asignacion.numeroRegistro && (
                              <span style={{
                                  background: '#1e293b',
                                  color: '#ffffff',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '6px',
                                  fontSize: '0.7rem',
                                  fontWeight: '800',
                                  letterSpacing: '0.5px'
                              }}>
                                  {asignacion.numeroRegistro}
                              </span>
                          )}
                          <span className={`status-badge ${getStatusColor(asignacion.estado)}`}>
                              {asignacion.estado.replace('_', ' ')}
                          </span>
                          {asignacion.tieneDanos && (
                              <span style={{
                                  background: '#fef2f2',
                                  color: '#ef4444',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '8px',
                                  fontSize: '0.75rem',
                                  fontWeight: '700',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  border: '1px solid #fecaca'
                              }}>
                                  <AlertTriangle size={12} />
                                  DAÑOS
                              </span>
                          )}
                      </div>
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

                  <div className="card-actions-modern">
                      <button
                          className="action-btn-icon"
                          onClick={(e) => handleExportPdf(e, asignacion.id, asignacion.numeroRegistro)}
                          title="Exportar PDF"
                      >
                          <FileText size={30} strokeWidth={2} />
                      </button>
                      <div className="card-arrow">
                          <ChevronRight size={20} />
                      </div>
                  </div>
              </div>
          ))}
      </div>

      {filteredAsignaciones.length === 0 && <p className="empty-msg">No hay asignaciones</p>}
    </div>
  );
}