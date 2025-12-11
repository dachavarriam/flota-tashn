import { useState, useEffect } from 'react';
import { usuariosApi } from '../api/usuarios';
import type { Usuario } from '../types/usuario';
import { Search, Plus, User, Edit2, Trash2 } from 'lucide-react';
import './UsuariosList.css';

interface UsuariosListProps {
  onEdit?: (usuario: Usuario) => void;
  onCreate?: () => void;
}

const FILTERS = ['Todos', 'Activos', 'Inactivos', 'Admin', 'Encargado'];

export function UsuariosList({ onEdit, onCreate }: UsuariosListProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const data = await usuariosApi.getAll();
      setUsuarios(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, nombre: string) => {
    if (!confirm(`¿Eliminar usuario ${nombre}?`)) return;
    try {
      await usuariosApi.delete(id);
      setUsuarios(usuarios.filter((u) => u.id !== id));
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  const filteredUsuarios = usuarios.filter((u) => {
    const matchesSearch = u.nombre.toLowerCase().includes(search.toLowerCase()) || 
                          u.correo.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Activos') return u.activo;
    if (activeFilter === 'Inactivos') return !u.activo;
    if (activeFilter === 'Admin') return u.rol === 'ADMIN';
    if (activeFilter === 'Encargado') return u.rol === 'ENCARGADO';
    return true;
  });

  if (loading) return <div className="loading-spinner">Cargando usuarios...</div>;

  return (
    <div className="usuarios-container">
      
      {/* Header & Search */}
      <div className="list-header-modern">
          <div className="search-bar-modern">
              <Search size={18} className="search-icon" />
              <input 
                  type="text" 
                  placeholder="Buscar usuario..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
              />
          </div>
          {onCreate && (
              <button className="btn-add-modern" onClick={onCreate}>
                  <Plus size={24} />
              </button>
          )}
      </div>

      {/* Quick Filters */}
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

      {/* Modern List */}
      <div className="users-list-modern">
        {filteredUsuarios.map((usuario) => (
            <div key={usuario.id} className="user-card-row">
                <div className="user-avatar">
                    <User size={20} />
                </div>
                <div className="user-info">
                    <h3 className="user-name">{usuario.nombre}</h3>
                    <p className="user-role">{usuario.rol} • {usuario.correo}</p>
                </div>
                <div className="user-status">
                    <span className={`status-dot ${usuario.activo ? 'online' : 'offline'}`}></span>
                </div>
                <div className="user-actions">
                    {onEdit && (
                        <button className="action-btn-icon edit" onClick={() => onEdit(usuario)}>
                            <Edit2 size={18} />
                        </button>
                    )}
                    <button className="action-btn-icon delete" onClick={() => handleDelete(usuario.id, usuario.nombre)}>
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        ))}
      </div>

      {filteredUsuarios.length === 0 && <p className="empty-msg">No se encontraron usuarios</p>}
    </div>
  );
}