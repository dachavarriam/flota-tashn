import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { vehiculosApi } from '../api/vehiculos';
import { asignacionesApi } from '../api/asignaciones';
import { usuariosApi } from '../api/usuarios';
import type { Vehiculo } from '../types/vehiculo';
import type { Asignacion } from '../types/asignacion';
import type { Usuario } from '../types/usuario';
import {
  Car,
  ClipboardCheck,
  Users,
  AlertTriangle,
  Wrench,
  Activity,
  Calendar,
  TrendingUp,
  Plus
} from 'lucide-react';
import './DashboardPage.css';

interface DashboardPageProps {
  onNavigate?: (page: 'vehiculos' | 'usuarios' | 'asignaciones') => void;
}

interface DashboardMetrics {
  totalVehiculos: number;
  vehiculosEnUso: number;
  vehiculosDisponibles: number;
  totalAsignaciones: number;
  asignacionesActivas: number;
  asignacionesEnRevision: number;
  totalUsuarios: number;
  vehiculosConProblemas: number;
  vehiculosNecesitanMantenimiento: number;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalVehiculos: 0,
    vehiculosEnUso: 0,
    vehiculosDisponibles: 0,
    totalAsignaciones: 0,
    asignacionesActivas: 0,
    asignacionesEnRevision: 0,
    totalUsuarios: 0,
    vehiculosConProblemas: 0,
    vehiculosNecesitanMantenimiento: 0
  });
  const [recentAsignaciones, setRecentAsignaciones] = useState<Asignacion[]>([]);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const isAdmin = user?.rol === 'ADMIN';
      const isSupervisorOrEncargado = user?.rol && ['SUPERVISOR', 'ENCARGADO'].includes(user.rol);

      if (isAdmin || isSupervisorOrEncargado) {
        // ADMIN and SUPERVISOR/ENCARGADO: Load all data
        const [vehiculos, asignaciones, usuarios] = await Promise.all([
          vehiculosApi.getAll(),
          asignacionesApi.getAll(),
          isAdmin ? usuariosApi.getAll() : Promise.resolve([])
        ]);

        // Calculate metrics
        const vehiculosEnUso = vehiculos.filter(v => !v.disponible).length;
        const asignacionesActivas = asignaciones.filter(a => a.estado === 'ACTIVA').length;
        const asignacionesEnRevision = asignaciones.filter(a => a.estado === 'EN_REVISION').length;
        const vehiculosConProblemas = asignaciones.filter(a =>
          a.tieneDanos && (a.estado === 'ACTIVA' || a.estado === 'EN_REVISION')
        ).length;

        // Vehicles needing maintenance (>5000 km since last maintenance)
        const needMaintenance = vehiculos.filter(v =>
          (v.kmActual - v.kmUltimoMantenimiento) > 5000
        );

        setMetrics({
          totalVehiculos: vehiculos.length,
          vehiculosEnUso,
          vehiculosDisponibles: vehiculos.length - vehiculosEnUso,
          totalAsignaciones: asignaciones.length,
          asignacionesActivas,
          asignacionesEnRevision,
          totalUsuarios: usuarios.length,
          vehiculosConProblemas,
          vehiculosNecesitanMantenimiento: needMaintenance.length
        });

        // Get recent assignments (last 5)
        const recent = asignaciones
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
          .slice(0, 5);
        setRecentAsignaciones(recent);

        // Set maintenance alerts
        setMaintenanceAlerts(needMaintenance.slice(0, 5));

      } else {
        // USUARIO: Load only their own assignments
        if (!user?.id) return;

        const [vehiculos, userAsignaciones] = await Promise.all([
          vehiculosApi.getAll(),
          usuariosApi.getAsignaciones(user.id)
        ]);

        // Combine user's received and assigned asignaciones
        const allUserAsignaciones = [...userAsignaciones.recibidas, ...userAsignaciones.asignadas];

        // Filter unique asignaciones (in case user is both conductor and encargado of same assignment)
        const uniqueAsignaciones = allUserAsignaciones.filter((asig, index, self) =>
          index === self.findIndex(a => a.id === asig.id)
        );

        const asignacionesActivas = uniqueAsignaciones.filter(a => a.estado === 'ACTIVA').length;
        const asignacionesEnRevision = uniqueAsignaciones.filter(a => a.estado === 'EN_REVISION').length;

        // Check if user has any asignaciones with damages
        const userVehiculosConProblemas = uniqueAsignaciones.filter(a =>
          a.tieneDanos && (a.estado === 'ACTIVA' || a.estado === 'EN_REVISION')
        ).length;

        // Get vehicles the user has assigned
        const userVehicleIds = new Set(uniqueAsignaciones
          .filter(a => a.estado === 'ACTIVA' || a.estado === 'EN_REVISION')
          .map(a => a.vehiculoId)
        );

        const userVehicles = vehiculos.filter(v => userVehicleIds.has(v.id));
        const needMaintenance = userVehicles.filter(v =>
          (v.kmActual - v.kmUltimoMantenimiento) > 5000
        );

        setMetrics({
          totalVehiculos: userVehicles.length,
          vehiculosEnUso: userVehicles.filter(v => !v.disponible).length,
          vehiculosDisponibles: userVehicles.filter(v => v.disponible).length,
          totalAsignaciones: uniqueAsignaciones.length,
          asignacionesActivas,
          asignacionesEnRevision,
          totalUsuarios: 0, // Not relevant for regular users
          vehiculosConProblemas: userVehiculosConProblemas,
          vehiculosNecesitanMantenimiento: needMaintenance.length
        });

        // Get recent assignments (last 5)
        const recent = uniqueAsignaciones
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
          .slice(0, 5);
        setRecentAsignaciones(recent);

        // Set maintenance alerts for user's vehicles
        setMaintenanceAlerts(needMaintenance.slice(0, 5));
      }

    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <Activity size={48} className="loading-spinner" />
          <p>Cargando panel de control...</p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.rol === 'ADMIN';
  const isSupervisorOrEncargado = user?.rol && ['SUPERVISOR', 'ENCARGADO'].includes(user.rol);
  const isRegularUser = !isAdmin && !isSupervisorOrEncargado;

  return (
    <div className="dashboard-page">
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <div>
          <h1>Bienvenido, {user?.nombre}</h1>
          <p className="welcome-subtitle">
            {isAdmin && 'Panel de Control - Gestión de Flota TAS'}
            {isSupervisorOrEncargado && 'Panel de Control - Vista General'}
            {isRegularUser && 'Mi Panel Personal'}
          </p>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="quick-access-section">
        <h2 className="section-title">Acceso Rápido</h2>
        <div className="quick-access-grid">
          <div
            className="quick-card quick-asignaciones"
            onClick={() => onNavigate?.('asignaciones')}
          >
            <div className="quick-icon">
              <Plus size={32} />
            </div>
            <h3>Nueva Asignación</h3>
            <p>Crear una asignación de vehículo</p>
          </div>

          <div
            className="quick-card quick-vehiculos"
            onClick={() => onNavigate?.('vehiculos')}
          >
            <div className="quick-icon">
              <Car size={32} />
            </div>
            <h3>Ver Flota</h3>
            <p>Gestionar vehículos</p>
          </div>

          {user?.rol === 'ADMIN' && (
            <div
              className="quick-card quick-usuarios"
              onClick={() => onNavigate?.('usuarios')}
            >
              <div className="quick-icon">
                <Users size={32} />
              </div>
              <h3>Usuarios</h3>
              <p>Administrar usuarios del sistema</p>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-section">
        <h2 className="section-title">
          {isRegularUser ? 'Mis Métricas' : 'Métricas del Sistema'}
        </h2>
        <div className="metrics-grid">
          {/* Vehículos */}
          <div className="metric-card metric-primary">
            <div className="metric-header">
              <Car size={24} />
              <span className="metric-label">
                {isRegularUser ? 'Mis Vehículos' : 'Flota Total'}
              </span>
            </div>
            <div className="metric-value">{metrics.totalVehiculos}</div>
            <div className="metric-footer">
              <span className="metric-detail success">
                {metrics.vehiculosDisponibles} disponibles
              </span>
              <span className="metric-detail warning">
                {metrics.vehiculosEnUso} en uso
              </span>
            </div>
          </div>

          {/* Asignaciones */}
          <div className="metric-card metric-info">
            <div className="metric-header">
              <ClipboardCheck size={24} />
              <span className="metric-label">
                {isRegularUser ? 'Mis Asignaciones' : 'Asignaciones'}
              </span>
            </div>
            <div className="metric-value">{metrics.totalAsignaciones}</div>
            <div className="metric-footer">
              <span className="metric-detail info">
                {metrics.asignacionesActivas} activas
              </span>
              <span className="metric-detail warning">
                {metrics.asignacionesEnRevision} en revisión
              </span>
            </div>
          </div>

          {/* Usuarios (solo ADMIN) */}
          {user?.rol === 'ADMIN' && (
            <div className="metric-card metric-success">
              <div className="metric-header">
                <Users size={24} />
                <span className="metric-label">Usuarios</span>
              </div>
              <div className="metric-value">{metrics.totalUsuarios}</div>
              <div className="metric-footer">
                <span className="metric-detail">Registrados en el sistema</span>
              </div>
            </div>
          )}

          {/* Mantenimientos Pendientes */}
          <div className="metric-card metric-warning">
            <div className="metric-header">
              <Wrench size={24} />
              <span className="metric-label">Mantenimiento</span>
            </div>
            <div className="metric-value">{metrics.vehiculosNecesitanMantenimiento}</div>
            <div className="metric-footer">
              <span className="metric-detail">Vehículos necesitan servicio</span>
            </div>
          </div>

          {/* Vehículos con Problemas */}
          {metrics.vehiculosConProblemas > 0 && (
            <div className="metric-card metric-danger">
              <div className="metric-header">
                <AlertTriangle size={24} />
                <span className="metric-label">Alertas</span>
              </div>
              <div className="metric-value">{metrics.vehiculosConProblemas}</div>
              <div className="metric-footer">
                <span className="metric-detail">Vehículos con daños reportados</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout for Recent Activity and Alerts */}
      <div className="dashboard-columns">
        {/* Recent Assignments */}
        <div className="dashboard-card">
          <h2 className="card-title">
            <Activity size={20} />
            {isRegularUser ? 'Mis Asignaciones Recientes' : 'Actividad Reciente'}
          </h2>
          {recentAsignaciones.length === 0 ? (
            <div className="empty-state">
              <Calendar size={32} />
              <p>{isRegularUser ? 'No tienes asignaciones' : 'No hay asignaciones registradas'}</p>
            </div>
          ) : (
            <div className="recent-list">
              {recentAsignaciones.map(asig => (
                <div key={asig.id} className="recent-item">
                  <div className="recent-header">
                    <span className={`recent-badge ${asig.estado.toLowerCase()}`}>
                      {asig.estado}
                    </span>
                    <span className="recent-date">{formatDate(asig.fecha)}</span>
                  </div>
                  <div className="recent-body">
                    <p className="recent-vehicle">
                      {asig.vehiculo.placa} - {asig.vehiculo.modelo}
                    </p>
                    <p className="recent-detail">
                      Conductor: {asig.usuario.nombre}
                    </p>
                    {asig.tieneDanos && (
                      <span className="damage-badge">
                        <AlertTriangle size={14} />
                        Con daños
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Maintenance Alerts */}
        {maintenanceAlerts.length > 0 && (
          <div className="dashboard-card alert-card">
            <h2 className="card-title">
              <Wrench size={20} />
              Alertas de Mantenimiento
            </h2>
            <div className="alert-list">
              {maintenanceAlerts.map(vehiculo => {
                const kmSinceLastMaintenance = vehiculo.kmActual - vehiculo.kmUltimoMantenimiento;
                const kmOverdue = kmSinceLastMaintenance - 5000;

                return (
                  <div key={vehiculo.id} className="alert-item">
                    <div className="alert-icon">
                      <AlertTriangle size={20} />
                    </div>
                    <div className="alert-content">
                      <p className="alert-vehicle">{vehiculo.placa} - {vehiculo.modelo}</p>
                      <p className="alert-detail">
                        {kmOverdue > 0
                          ? `Vencido por ${kmOverdue.toLocaleString()} km`
                          : `${kmSinceLastMaintenance.toLocaleString()} km sin mantenimiento`
                        }
                      </p>
                      <p className="alert-km">
                        KM Actual: {vehiculo.kmActual.toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
