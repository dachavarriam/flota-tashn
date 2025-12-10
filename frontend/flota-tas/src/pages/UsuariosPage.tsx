import { useState } from 'react';
import { UsuariosList } from '../components/UsuariosList';
import { UsuarioForm } from '../components/UsuarioForm';
import type { Usuario } from '../types/usuario';
import './UsuariosPage.css'; // Assuming we'll create a similar CSS file

export function UsuariosPage() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = () => {
    setSelectedUsuario(null);
    setView('create');
  };

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setView('edit');
  };

  const handleSuccess = () => {
    setView('list');
    setSelectedUsuario(null);
    setRefreshKey((prev) => prev + 1); // Force re-fetch
  };

  const handleCancel = () => {
    setView('list');
    setSelectedUsuario(null);
  };

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
