import { useState, useEffect, FormEvent } from 'react';
import { usuariosApi } from '../api/usuarios';
import { Rol } from '../types/usuario';
import type { Usuario, CreateUsuarioDto, UpdateUsuarioDto } from '../types/usuario';
import './UsuarioForm.css'; // Assuming we'll create a similar CSS file

interface UsuarioFormProps {
  usuario?: Usuario | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function UsuarioForm({ usuario, onSuccess, onCancel }: UsuarioFormProps) {
  const isEdit = !!usuario;

  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    rol: Rol.USUARIO,
    activo: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre,
        correo: usuario.correo,
        password: '', // Password is not returned by the API for security
        rol: usuario.rol,
        activo: usuario.activo,
      });
    }
  }, [usuario]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data: CreateUsuarioDto | UpdateUsuarioDto = {
        nombre: formData.nombre,
        correo: formData.correo,
        rol: formData.rol,
        activo: formData.activo,
      };

      if (formData.password) {
        data.password = formData.password;
      }

      if (isEdit && usuario) {
        await usuariosApi.update(usuario.id, data);
      } else {
        // Only include password for new user creation
        if (!data.password) {
            setError('La contraseña es requerida para nuevos usuarios.');
            setLoading(false);
            return;
        }
        await usuariosApi.create(data as CreateUsuarioDto);
      }

      onSuccess?.();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al guardar usuario';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="usuario-form-container">
      <div className="form-header">
        <h2>{isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="usuario-form">
        <div className="form-group">
          <label htmlFor="nombre">
            Nombre <span className="required">*</span>
          </label>
          <input
            id="nombre"
            type="text"
            value={formData.nombre}
            onChange={(e) => handleChange('nombre', e.target.value)}
            placeholder="Nombre completo"
            required
            minLength={3}
          />
        </div>

        <div className="form-group">
          <label htmlFor="correo">
            Correo <span className="required">*</span>
          </label>
          <input
            id="correo"
            type="email"
            value={formData.correo}
            onChange={(e) => handleChange('correo', e.target.value)}
            placeholder="correo@ejemplo.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            Contraseña {isEdit ? '(dejar en blanco para no cambiar)' : <span className="required">*</span>}
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder={isEdit ? '********' : 'Contraseña'}
            required={!isEdit}
            minLength={6}
          />
        </div>

        <div className="form-group">
          <label htmlFor="rol">
            Rol <span className="required">*</span>
          </label>
          <select
            id="rol"
            value={formData.rol}
            onChange={(e) => handleChange('rol', e.target.value as Rol)}
            required
          >
            {Object.values(Rol).map((rol) => (
              <option key={rol} value={rol}>
                {rol}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group checkbox-group">
          <input
            id="activo"
            type="checkbox"
            checked={formData.activo}
            onChange={(e) => handleChange('activo', e.target.checked)}
          />
          <label htmlFor="activo">Activo</label>
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
