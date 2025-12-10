import { useState, useEffect } from 'react';
import { usuariosApi } from '../api/usuarios';
import type { Usuario } from '../types/usuario';
import './UsuariosList.css'; // Assuming we'll create a similar CSS file

interface UsuariosListProps {
  onEdit?: (usuario: Usuario) => void;
  onCreate?: () => void;
}

export function UsuariosList({ onEdit, onCreate }: UsuariosListProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usuariosApi.getAll();
      setUsuarios(data);
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar usuario ${nombre}? Esta acción es irreversible.`)) return;

    try {
      await usuariosApi.delete(id);
      setUsuarios(usuarios.filter((u) => u.id !== id));
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al eliminar el usuario';
      alert(msg);
    }
  };

  const filteredUsuarios = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    u.correo.toLowerCase().includes(search.toLowerCase()) ||
    u.rol.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Cargando usuarios...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error">{error}</p>
        <button onClick={loadUsuarios}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="usuarios-list">
      <div className="list-header">
        <h2>Usuarios</h2>
        {onCreate && (
          <button className="btn-primary" onClick={onCreate}>
            + Nuevo Usuario
          </button>
        )}
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar por nombre, correo o rol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredUsuarios.length === 0 ? (
        <p className="empty-state">No se encontraron usuarios</p>
      ) : (
        <div className="table-container">
          <table className="usuarios-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>
                    <strong>{usuario.nombre}</strong>
                  </td>
                  <td>{usuario.correo}</td>
                  <td>{usuario.rol}</td>
                  <td>{usuario.activo ? 'Activo' : 'Inactivo'}</td>
                  <td className="actions">
                    {onEdit && (
                      <button
                        className="btn-edit"
                        onClick={() => onEdit(usuario)}
                      >
                        Editar
                      </button>
                    )}
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(usuario.id, usuario.nombre)}
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

      <p className="user-count">
        Mostrando {filteredUsuarios.length} de {usuarios.length} usuarios
      </p>
    </div>
  );
}
