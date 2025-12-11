import { useState, useEffect } from 'react';
import { UsuariosList } from '../components/UsuariosList';
import { UsuarioForm } from '../components/UsuarioForm';
import { usuariosApi } from '../api/usuarios';
import { useAuth } from '../context/AuthContext';
import type { Usuario } from '../types/usuario';
import { Calendar, User, Briefcase } from 'lucide-react';
import './UsuariosPage.css';

export function UsuariosPage() {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'ADMIN';

  const [view, setView] = useState<'list' | 'create' | 'edit' | 'profile'>('profile');
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [asignaciones, setAsignaciones] = useState<{recibidas: any[], asignadas: any[]}>({recibidas: [], asignadas: []});
  const [loadingAsignaciones, setLoadingAsignaciones] = useState(false);

  // If not admin, load current user's assignments
  useEffect(() => {
    if (!isAdmin && user?.id) {
      loadAsignaciones(user.id);
    }
  }, [isAdmin, user?.id]);

  const loadAsignaciones = async (userId: number) => {
    try {
      setLoadingAsignaciones(true);
      const data = await usuariosApi.getAsignaciones(userId);
      setAsignaciones(data);
    } catch (err) {
      console.error('Error loading asignaciones:', err);
    } finally {
      setLoadingAsignaciones(false);
    }
  };

  const handleCreate = () => {
    setSelectedUsuario(null);
    setView('create');
  };

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setView('edit');
  };

  const handleSuccess = () => {
    setView(isAdmin ? 'list' : 'profile');
    setSelectedUsuario(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleCancel = () => {
    setView(isAdmin ? 'list' : 'profile');
    setSelectedUsuario(null);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Admin view - show all users
  if (isAdmin) {
    return (
      <div className="usuarios-page">
        {view === 'list' ? (
          <UsuariosList
            key={refreshKey}
            onCreate={handleCreate}
            onEdit={handleEdit}
          />
        ) : (
          <UsuarioForm
            usuario={selectedUsuario}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </div>
    );
  }

  // Non-admin view - show profile and assignments
  return (
    <div className="usuarios-page profile-view">
      {view === 'profile' ? (
        <div className="user-profile-container">
          {/* User Info Card */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                <User size={48} />
              </div>
              <div className="profile-info">
                <h1>{user?.nombre}</h1>
                <p className="profile-email">{user?.correo}</p>
                <span className={`profile-role-badge role-${user?.rol?.toLowerCase()}`}>
                  {user?.rol}
                </span>
              </div>
            </div>
          </div>

          {/* Assignments Section */}
          <div className="assignments-section">
            <h2 className="section-title">
              <Briefcase size={24} />
              Mis Asignaciones
            </h2>

            {loadingAsignaciones ? (
              <div className="loading-state">Cargando asignaciones...</div>
            ) : (
              <>
                {/* Received Assignments (as conductor) */}
                {asignaciones.recibidas.length > 0 && (
                  <div className="assignments-group">
                    <h3 className="group-title">Como Conductor</h3>
                    <div className="assignments-grid">
                      {asignaciones.recibidas.map((asig: any) => (
                        <div key={asig.id} className="assignment-card">
                          <div className="assignment-header">
                            <span className={`assignment-estado ${asig.estado.toLowerCase()}`}>
                              {asig.estado}
                            </span>
                            <span className="assignment-date">
                              <Calendar size={14} />
                              {formatDate(asig.fecha)}
                            </span>
                          </div>
                          <div className="assignment-body">
                            <p className="assignment-vehicle">{asig.vehiculo.placa} - {asig.vehiculo.modelo}</p>
                            <p className="assignment-detail">Encargado: {asig.encargado.nombre}</p>
                            {asig.kmSalida && (
                              <p className="assignment-detail">KM: {asig.kmSalida} → {asig.kmRetorno || 'En curso'}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Assigned by me (as encargado) */}
                {asignaciones.asignadas.length > 0 && (
                  <div className="assignments-group">
                    <h3 className="group-title">Asignadas por Mí</h3>
                    <div className="assignments-grid">
                      {asignaciones.asignadas.map((asig: any) => (
                        <div key={asig.id} className="assignment-card">
                          <div className="assignment-header">
                            <span className={`assignment-estado ${asig.estado.toLowerCase()}`}>
                              {asig.estado}
                            </span>
                            <span className="assignment-date">
                              <Calendar size={14} />
                              {formatDate(asig.fecha)}
                            </span>
                          </div>
                          <div className="assignment-body">
                            <p className="assignment-vehicle">{asig.vehiculo.placa} - {asig.vehiculo.modelo}</p>
                            <p className="assignment-detail">Conductor: {asig.usuario.nombre}</p>
                            {asig.kmSalida && (
                              <p className="assignment-detail">KM: {asig.kmSalida} → {asig.kmRetorno || 'En curso'}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {asignaciones.recibidas.length === 0 && asignaciones.asignadas.length === 0 && (
                  <div className="empty-state">
                    <Calendar size={48} />
                    <p>No tienes asignaciones registradas</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        <UsuarioForm
          usuario={selectedUsuario}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
