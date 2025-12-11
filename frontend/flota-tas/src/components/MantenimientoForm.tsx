import { useState, useEffect } from 'react';
import { mantenimientosApi } from '../api/mantenimientos';
import { vehiculosApi } from '../api/vehiculos';
import type { Mantenimiento, CreateMantenimientoDto } from '../types/mantenimiento';
import type { Vehiculo } from '../types/vehiculo';
import './MantenimientoForm.css';

interface MantenimientoFormProps {
  mantenimiento: Mantenimiento | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MantenimientoForm({ mantenimiento, onSuccess, onCancel }: MantenimientoFormProps) {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateMantenimientoDto>({
    vehiculoId: 0,
    fecha: new Date().toISOString().split('T')[0],
    tipo: '',
    descripcion: '',
    taller: '',
    costo: undefined,
    kmActual: 0,
    proximoMantenimiento: undefined,
    observaciones: ''
  });

  useEffect(() => {
    loadVehiculos();
    if (mantenimiento) {
      setFormData({
        vehiculoId: mantenimiento.vehiculoId,
        fecha: new Date(mantenimiento.fecha).toISOString().split('T')[0],
        tipo: mantenimiento.tipo,
        descripcion: mantenimiento.descripcion,
        taller: mantenimiento.taller || '',
        costo: mantenimiento.costo || undefined,
        kmActual: mantenimiento.kmActual,
        proximoMantenimiento: mantenimiento.proximoMantenimiento || undefined,
        observaciones: mantenimiento.observaciones || ''
      });
    }
  }, [mantenimiento]);

  const loadVehiculos = async () => {
    try {
      const data = await vehiculosApi.getAll();
      setVehiculos(data);
    } catch (err) {
      console.error('Error loading vehicles:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.vehiculoId) {
      setError('Debes seleccionar un vehículo');
      return;
    }

    if (!formData.tipo.trim() || !formData.descripcion.trim()) {
      setError('Tipo y descripción son obligatorios');
      return;
    }

    try {
      setLoading(true);
      if (mantenimiento) {
        await mantenimientosApi.update(mantenimiento.id, formData);
      } else {
        await mantenimientosApi.create(formData);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar mantenimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mantenimiento-form-container">
      <div className="form-card">
        <h2>{mantenimiento ? 'Editar Mantenimiento' : 'Nuevo Mantenimiento'}</h2>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="mantenimiento-form">
          <div className="form-grid">
            <div className="form-group">
              <label>Vehículo *</label>
              <select
                value={formData.vehiculoId}
                onChange={(e) => setFormData({ ...formData, vehiculoId: parseInt(e.target.value) })}
                required
              >
                <option value={0}>Seleccionar vehículo</option>
                {vehiculos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.placa} - {v.modelo}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Fecha</label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Tipo de Mantenimiento *</label>
              <input
                type="text"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                placeholder="Ej: Cambio de aceite, Revisión general"
                required
              />
            </div>

            <div className="form-group">
              <label>Kilometraje Actual *</label>
              <input
                type="number"
                value={formData.kmActual}
                onChange={(e) => setFormData({ ...formData, kmActual: parseInt(e.target.value) || 0 })}
                required
                min={0}
              />
            </div>

            <div className="form-group">
              <label>Taller</label>
              <input
                type="text"
                value={formData.taller}
                onChange={(e) => setFormData({ ...formData, taller: e.target.value })}
                placeholder="Nombre del taller"
              />
            </div>

            <div className="form-group">
              <label>Costo (Lempiras)</label>
              <input
                type="number"
                value={formData.costo || ''}
                onChange={(e) => setFormData({ ...formData, costo: parseFloat(e.target.value) || undefined })}
                placeholder="0.00"
                step="0.01"
                min={0}
              />
            </div>

            <div className="form-group">
              <label>Próximo Mantenimiento (KM)</label>
              <input
                type="number"
                value={formData.proximoMantenimiento || ''}
                onChange={(e) => setFormData({ ...formData, proximoMantenimiento: parseInt(e.target.value) || undefined })}
                placeholder="Kilometraje para próximo servicio"
                min={0}
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Descripción *</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción detallada del mantenimiento realizado"
              rows={3}
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Observaciones</label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              placeholder="Observaciones adicionales"
              rows={2}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? 'Guardando...' : mantenimiento ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
