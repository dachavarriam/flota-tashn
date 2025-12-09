import { useState, useEffect, FormEvent } from 'react';
import { vehiculosApi } from '../api/vehiculos';
import type { Vehiculo, CreateVehiculoDto, UpdateVehiculoDto } from '../types/vehiculo';
import './VehiculoForm.css';

interface VehiculoFormProps {
  vehiculo?: Vehiculo | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function VehiculoForm({ vehiculo, onSuccess, onCancel }: VehiculoFormProps) {
  const isEdit = !!vehiculo;

  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    tipo: '',
    kmActual: '0',
    kmUltimoMantenimiento: '0'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vehiculo) {
      setFormData({
        placa: vehiculo.placa,
        marca: vehiculo.marca || '',
        modelo: vehiculo.modelo || '',
        tipo: vehiculo.tipo || '',
        kmActual: vehiculo.kmActual.toString(),
        kmUltimoMantenimiento: vehiculo.kmUltimoMantenimiento.toString()
      });
    }
  }, [vehiculo]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data: CreateVehiculoDto | UpdateVehiculoDto = {
        placa: formData.placa,
        marca: formData.marca || undefined,
        modelo: formData.modelo || undefined,
        tipo: formData.tipo || undefined,
        kmActual: parseInt(formData.kmActual) || 0,
        kmUltimoMantenimiento: parseInt(formData.kmUltimoMantenimiento) || 0
      };

      if (isEdit && vehiculo) {
        await vehiculosApi.update(vehiculo.id, data);
      } else {
        await vehiculosApi.create(data);
      }

      onSuccess?.();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al guardar vehículo';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="vehiculo-form-container">
      <div className="form-header">
        <h2>{isEdit ? 'Editar Vehículo' : 'Nuevo Vehículo'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="vehiculo-form">
        <div className="form-group">
          <label htmlFor="placa">
            Placa <span className="required">*</span>
          </label>
          <input
            id="placa"
            type="text"
            value={formData.placa}
            onChange={(e) => handleChange('placa', e.target.value.toUpperCase())}
            placeholder="HBP4760"
            required
            minLength={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="marca">Marca</label>
            <input
              id="marca"
              type="text"
              value={formData.marca}
              onChange={(e) => handleChange('marca', e.target.value)}
              placeholder="Toyota"
            />
          </div>

          <div className="form-group">
            <label htmlFor="modelo">Modelo</label>
            <input
              id="modelo"
              type="text"
              value={formData.modelo}
              onChange={(e) => handleChange('modelo', e.target.value)}
              placeholder="Hilux 2023"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tipo">Tipo</label>
          <select
            id="tipo"
            value={formData.tipo}
            onChange={(e) => handleChange('tipo', e.target.value)}
          >
            <option value="">Seleccionar tipo</option>
            <option value="Panel">Panel</option>
            <option value="Pick Up">Pick Up</option>
            <option value="Camion">Camion</option>
            <option value="SUV">SUV</option>
            <option value="Sedan">Sedan</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="kmActual">KM Actual</label>
            <input
              id="kmActual"
              type="number"
              value={formData.kmActual}
              onChange={(e) => handleChange('kmActual', e.target.value)}
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="kmUltimoMantenimiento">KM Último Mantenimiento</label>
            <input
              id="kmUltimoMantenimiento"
              type="number"
              value={formData.kmUltimoMantenimiento}
              onChange={(e) => handleChange('kmUltimoMantenimiento', e.target.value)}
              min="0"
            />
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-actions">
          {onCancel && (
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
}
