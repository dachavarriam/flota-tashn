import { useState } from 'react';
import { AsignacionesList } from '../components/AsignacionesList';
import { AsignacionForm } from '../components/AsignacionForm';
import { useAuth } from '../context/AuthContext';
import type { Asignacion } from '../types/asignacion';
import type { DockAction } from '../App'; // Import type
import './AsignacionesPage.css';

interface AsignacionesPageProps {
    setDockActions?: (actions: DockAction[] | null) => void;
}

export function AsignacionesPage({ setDockActions }: AsignacionesPageProps) {
  const { user } = useAuth();
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedAsignacion, setSelectedAsignacion] = useState<Asignacion | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = () => {
    setSelectedAsignacion(null);
    setView('create');
  };

  const handleEdit = (asignacion: Asignacion) => {
    setSelectedAsignacion(asignacion);
    setView('edit');
  };

  const handleSuccess = () => {
    setView('list');
    setSelectedAsignacion(null);
    setRefreshKey((prev) => prev + 1);
    // Reset dock when leaving form
    setDockActions?.(null);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedAsignacion(null);
    // Reset dock when leaving form
    setDockActions?.(null);
  };

  return (
    <div className="asignaciones-page">
      {view === 'list' ? (
        <AsignacionesList
          key={refreshKey}
          onCreate={handleCreate}
          onEdit={handleEdit}
        />
      ) : (
        <AsignacionForm
          asignacion={selectedAsignacion}
          currentUser={user}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          setDockActions={setDockActions} // Pass down to form
        />
      )}
    </div>
  );
}