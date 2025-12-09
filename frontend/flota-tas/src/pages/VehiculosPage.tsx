import { useState } from 'react';
import { VehiculosList } from '../components/VehiculosList';
import { VehiculoForm } from '../components/VehiculoForm';
import type { Vehiculo } from '../types/vehiculo';
import './VehiculosPage.css';

export function VehiculosPage() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = () => {
    setSelectedVehiculo(null);
    setView('create');
  };

  const handleEdit = (vehiculo: Vehiculo) => {
    setSelectedVehiculo(vehiculo);
    setView('edit');
  };

  const handleSuccess = () => {
    setView('list');
    setSelectedVehiculo(null);
    setRefreshKey((prev) => prev + 1); // Force re-fetch
  };

  const handleCancel = () => {
    setView('list');
    setSelectedVehiculo(null);
  };

  return (
    <div className="vehiculos-page">
      {view === 'list' ? (
        <VehiculosList
          key={refreshKey}
          onCreate={handleCreate}
          onEdit={handleEdit}
        />
      ) : (
        <VehiculoForm
          vehiculo={selectedVehiculo}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
