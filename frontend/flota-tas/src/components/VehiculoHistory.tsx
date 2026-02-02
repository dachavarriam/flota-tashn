import { useState, useEffect } from 'react';
import { vehiculosApi } from '../api/vehiculos';
import { User, Wrench, ArrowRight, X } from 'lucide-react';
import type { Asignacion } from '../types/asignacion';
import type { Mantenimiento } from '../types/mantenimiento';
import './VehiculoHistory.css';

interface VehiculoHistoryProps {
  vehiculoId: number;
  onClose: () => void;
}

interface HistoryItem {
  type: 'ASIGNACION' | 'MANTENIMIENTO';
  fecha: string;
  data: Asignacion | Mantenimiento;
}

export function VehiculoHistory({ vehiculoId, onClose }: VehiculoHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        // Ensure the backend returns the correct type or cast it
        const data = await vehiculosApi.getHistorial(vehiculoId);
        setHistory(data as HistoryItem[]);
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [vehiculoId]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-HN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="history-modal-overlay">
      <div className="history-modal">
        <div className="history-header">
          <h2>Historial Completo del Vehículo</h2>
          <button onClick={onClose} className="btn-close-history">
            <X size={24} />
          </button>
        </div>

        <div className="history-content">
          {loading ? (
            <div className="loading-state">Cargando historial...</div>
          ) : history.length === 0 ? (
            <div className="empty-state">No hay registros históricos.</div>
          ) : (
            <div className="timeline">
              {history.map((item, index) => (
                <div key={index} className={`timeline-item ${item.type.toLowerCase()}`}>
                  <div className="timeline-marker">
                    {item.type === 'ASIGNACION' ? <User size={16} /> : <Wrench size={16} />}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-date">{formatDate(item.fecha)}</div>
                    
                    {item.type === 'ASIGNACION' ? (
                      <div className="timeline-card asignacion">
                        <div className="card-header">
                          <span className="badge-type">Asignación</span>
                          <span className={`badge-status ${(item.data as Asignacion).estado.toLowerCase()}`}>
                            {(item.data as Asignacion).estado}
                          </span>
                        </div>
                        <div className="card-body">
                          <p><strong>Conductor:</strong> {(item.data as Asignacion).usuario?.nombre}</p>
                          <p><strong>Uso:</strong> {(item.data as Asignacion).uso || 'N/A'}</p>
                          {(item.data as Asignacion).kmSalida && (
                            <div className="km-track">
                              <span>{(item.data as Asignacion).kmSalida} km</span>
                              <ArrowRight size={14} />
                              <span>{(item.data as Asignacion).kmRetorno || '...'} km</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="timeline-card mantenimiento">
                        <div className="card-header">
                          <span className="badge-type">Mantenimiento</span>
                          <span className="badge-cost">L. {(item.data as Mantenimiento).costo || 0}</span>
                        </div>
                        <div className="card-body">
                          <p className="maint-desc">{(item.data as Mantenimiento).descripcion}</p>
                          <p><strong>Taller:</strong> {(item.data as Mantenimiento).taller || 'N/A'}</p>
                          <p><strong>KM al realizar:</strong> {(item.data as Mantenimiento).kmActual} km</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
