import { useState, useEffect, FormEvent } from 'react';
import { asignacionesApi } from '../api/asignaciones';
import { vehiculosApi } from '../api/vehiculos';
import { usuariosApi } from '../api/usuarios';
import { EstadoAsignacion } from '../types/asignacion';
import type { Asignacion, CreateAsignacionDto, UpdateAsignacionDto } from '../types/asignacion';
import type { Vehiculo } from '../types/vehiculo';
import type { Usuario } from '../types/usuario';
import './AsignacionForm.css';

interface AsignacionFormProps {
  asignacion?: Asignacion | null;
  currentUser?: Usuario | null; // Pass current user for encargadoId default
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AsignacionForm({ asignacion, currentUser, onSuccess, onCancel }: AsignacionFormProps) {
  const isEdit = !!asignacion;

  // Initial Form State
  const [formData, setFormData] = useState({
    vehiculoId: '',
    usuarioId: '',
    encargadoId: '',
    kmSalida: '',
    kmRetorno: '',
    horaSalida: '',
    horaRetorno: '',
    uso: '',
    observaciones: '',
    estado: EstadoAsignacion.ACTIVA
  });

  // Data for Selects
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dependency data (Vehiculos, Usuarios)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiculosData, usuariosData] = await Promise.all([
          vehiculosApi.getAll(),
          usuariosApi.getAll()
        ]);
        setVehiculos(vehiculosData);
        setUsuarios(usuariosData);
      } catch (err) {
        console.error("Error loading dependency data", err);
        setError("Error cargando vehículos o usuarios");
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Initialize Form Data if Edit Mode
  useEffect(() => {
    if (asignacion) {
      setFormData({
        vehiculoId: asignacion.vehiculoId.toString(),
        usuarioId: asignacion.usuarioId.toString(),
        encargadoId: asignacion.encargadoId.toString(),
        kmSalida: asignacion.kmSalida?.toString() || '',
        kmRetorno: asignacion.kmRetorno?.toString() || '',
        horaSalida: asignacion.horaSalida || '',
        horaRetorno: asignacion.horaRetorno || '',
        uso: asignacion.uso || '',
        observaciones: asignacion.observaciones || '',
        estado: asignacion.estado
      });
    } else if (currentUser) {
      // Set default encargado if new
      setFormData(prev => ({ ...prev, encargadoId: currentUser.id.toString() }));
    }
  }, [asignacion, currentUser]);

  // Handle Input Changes
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEdit && asignacion) {
        // Update Logic
        const updatePayload: UpdateAsignacionDto = {
            estado: formData.estado,
            kmRetorno: formData.kmRetorno ? parseInt(formData.kmRetorno) : undefined,
            horaRetorno: formData.horaRetorno || undefined,
            observaciones: formData.observaciones || undefined
        };
        await asignacionesApi.update(asignacion.id, updatePayload);
      } else {
        // Create Logic
        const createPayload: CreateAsignacionDto = {
          vehiculoId: parseInt(formData.vehiculoId),
          usuarioId: parseInt(formData.usuarioId),
          encargadoId: parseInt(formData.encargadoId),
          kmSalida: formData.kmSalida ? parseInt(formData.kmSalida) : undefined,
          uso: formData.uso || undefined,
          observaciones: formData.observaciones || undefined
        };
        await asignacionesApi.create(createPayload);
      }
      onSuccess?.();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al guardar asignación';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) return <div className="loading">Cargando formulario...</div>;

  return (
    <div className="asignacion-form-container">
      <div className="form-header">
        <h2>{isEdit ? 'Gestionar Asignación' : 'Nueva Asignación'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="asignacion-form">
        
        {/* Section 1: Basic Info (Read-only if Edit) */}
        <div className="form-section">
          <h3>Información General</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vehiculoId">Vehículo <span className="required">*</span></label>
              <select
                id="vehiculoId"
                value={formData.vehiculoId}
                onChange={(e) => handleChange('vehiculoId', e.target.value)}
                required
                disabled={isEdit}
              >
                <option value="">Seleccionar vehículo</option>
                {vehiculos.map(v => (
                  <option key={v.id} value={v.id}>{v.placa} - {v.modelo}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="usuarioId">Conductor <span className="required">*</span></label>
              <select
                id="usuarioId"
                value={formData.usuarioId}
                onChange={(e) => handleChange('usuarioId', e.target.value)}
                required
                disabled={isEdit}
              >
                <option value="">Seleccionar conductor</option>
                {usuarios.map(u => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Salida Details */}
        <div className="form-section">
          <h3>Detalles de Salida</h3>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="kmSalida">KM Salida</label>
              <input
                id="kmSalida"
                type="number"
                value={formData.kmSalida}
                onChange={(e) => handleChange('kmSalida', e.target.value)}
                disabled={isEdit}
              />
            </div>
             <div className="form-group">
              <label htmlFor="uso">Uso / Destino</label>
              <input
                id="uso"
                type="text"
                value={formData.uso}
                onChange={(e) => handleChange('uso', e.target.value)}
                placeholder="Ej. Ruta San Pedro Sula"
                disabled={isEdit}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Retorno Details (Only if Edit) */}
        {isEdit && (
          <div className="form-section">
            <h3>Detalles de Retorno</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="estado">Estado</label>
                <select
                  id="estado"
                  value={formData.estado}
                  onChange={(e) => handleChange('estado', e.target.value as any)}
                >
                   {Object.values(EstadoAsignacion).map(estado => (
                     <option key={estado} value={estado}>{estado}</option>
                   ))}
                </select>
              </div>
               <div className="form-group">
                <label htmlFor="kmRetorno">KM Retorno</label>
                <input
                  id="kmRetorno"
                  type="number"
                  value={formData.kmRetorno}
                  onChange={(e) => handleChange('kmRetorno', e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
                <label htmlFor="horaRetorno">Hora Retorno</label>
                <input
                  id="horaRetorno"
                  type="time"
                  value={formData.horaRetorno}
                  onChange={(e) => handleChange('horaRetorno', e.target.value)}
                />
            </div>
          </div>
        )}

        {/* Section 4: Observaciones */}
        <div className="form-group">
          <label htmlFor="observaciones">Observaciones</label>
          <textarea
            id="observaciones"
            rows={3}
            value={formData.observaciones}
            onChange={(e) => handleChange('observaciones', e.target.value)}
          />
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-actions">
          {onCancel && (
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear Asignación'}
          </button>
        </div>
      </form>
    </div>
  );
}
