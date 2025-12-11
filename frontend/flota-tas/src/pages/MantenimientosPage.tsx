import { useState } from 'react';
import { MantenimientosList } from '../components/MantenimientosList';
import { MantenimientoForm } from '../components/MantenimientoForm';
import type { Mantenimiento } from '../types/mantenimiento';

export function MantenimientosPage() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedMantenimiento, setSelectedMantenimiento] = useState<Mantenimiento | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = () => {
    setSelectedMantenimiento(null);
    setView('create');
  };

  const handleEdit = (mantenimiento: Mantenimiento) => {
    setSelectedMantenimiento(mantenimiento);
    setView('edit');
  };

  const handleSuccess = () => {
    setView('list');
    setSelectedMantenimiento(null);
    setRefreshKey((prev) => prev + 1);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedMantenimiento(null);
  };

  return (
    <div className="mantenimientos-page">
      {view === 'list' ? (
        <MantenimientosList key={refreshKey} onCreate={handleCreate} onEdit={handleEdit} />
      ) : (
        <MantenimientoForm
          mantenimiento={selectedMantenimiento}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
