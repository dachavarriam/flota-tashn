import { useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';
import logoTas from './assets/LogoTAS_circular.png';
import { useAuth } from './context/AuthContext';
import { DashboardPage } from './pages/DashboardPage';
import { VehiculosPage } from './pages/VehiculosPage';
import { UsuariosPage } from './pages/UsuariosPage';
import { AsignacionesPage } from './pages/AsignacionesPage';
import { MantenimientosPage } from './pages/MantenimientosPage';
import { Car, ClipboardCheck, User, LogOut, Home, Wrench } from 'lucide-react';

// Tipos para acciones del Dock
export interface DockAction {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant: 'primary' | 'danger' | 'neutral';
}

function App() {
  const { user, login, logout, loading, error } = useAuth();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [info, setInfo] = useState<string | null>(null);
  
  // Navigation State
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'vehiculos' | 'usuarios' | 'asignaciones' | 'mantenimientos'>('dashboard');
  
  // Dock Actions State (null = default nav, array = custom actions)
  const [dockActions, setDockActions] = useState<DockAction[] | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setInfo(null);
    try {
      await login({ correo, password });
      setInfo('Inicio de sesión exitoso.');
    } catch {
      /* error state handled */
    }
  };

  // Helper to handle page change and reset dock
  const handleNavChange = (page: typeof currentPage) => {
      if (dockActions) return; // Prevent nav if in action mode (optional, or ask confirm)
      setCurrentPage(page);
  };

  if (user) {
    return (
      <div className="app-layout">
        
        {/* Header (oculto si hay acciones personalizadas para dar foco, opcional) */}
        <header className={`app-header ${dockActions ? 'hidden-header' : ''}`}>
            <div className="brand-pill">
                <img src={logoTas} alt="TAS" className="header-logo" />
                <span>Flota TAS</span>
            </div>
            {!dockActions && (
                <button className="btn-logout-icon" onClick={logout} title="Salir">
                    <LogOut size={20} />
                </button>
            )}
        </header>

        {/* Main Content */}
        <main className="main-viewport">
          {currentPage === 'dashboard' && (
            <DashboardPage onNavigate={(page) => setCurrentPage(page)} />
          )}
          {currentPage === 'vehiculos' && <VehiculosPage />}

          {/* Pasamos setDockActions a AsignacionesPage para que controle el dock */}
          {currentPage === 'asignaciones' && (
              <AsignacionesPage setDockActions={setDockActions} />
          )}

          {currentPage === 'usuarios' && <UsuariosPage />}
          {currentPage === 'mantenimientos' && <MantenimientosPage />}
        </main>

        {/* FLOATING DOCK DINÁMICO */}
        <nav className="floating-dock-container">
            {dockActions ? (
                // ACTION MODE (Botones de Formulario)
                <div className="floating-dock actions-mode">
                    {dockActions.map((action, idx) => (
                        <button 
                            key={idx}
                            className={`dock-action-btn ${action.variant}`}
                            onClick={action.onClick}
                        >
                            {action.icon}
                            <span>{action.label}</span>
                        </button>
                    ))}
                </div>
            ) : (
                // NAVIGATION MODE (Default)
                <div className="floating-dock">
                    <button
                        className={`dock-item ${currentPage === 'dashboard' ? 'active' : ''}`}
                        onClick={() => handleNavChange('dashboard')}
                    >
                        <Home size={24} />
                        <span>Inicio</span>
                    </button>

                    <button
                        className={`dock-item ${currentPage === 'vehiculos' ? 'active' : ''}`}
                        onClick={() => handleNavChange('vehiculos')}
                    >
                        <Car size={24} />
                        <span>Flota</span>
                    </button>

                    <button
                        className={`dock-item ${currentPage === 'asignaciones' ? 'active' : ''}`}
                        onClick={() => handleNavChange('asignaciones')}
                    >
                        <ClipboardCheck size={24} />
                        <span>Asignación</span>
                    </button>

                    <button
                        className={`dock-item ${currentPage === 'mantenimientos' ? 'active' : ''}`}
                        onClick={() => handleNavChange('mantenimientos')}
                    >
                        <Wrench size={24} />
                        <span>Servicio</span>
                    </button>

                    <button
                        className={`dock-item ${currentPage === 'usuarios' ? 'active' : ''}`}
                        onClick={() => handleNavChange('usuarios')}
                    >
                        <User size={24} />
                        <span>Perfil</span>
                    </button>
                </div>
            )}
        </nav>

      </div>
    );
  }

  // Login View
  return (
    <div className="page">
      <div className="card">
        <div className="brand">
          <div className="logo-wrapper"><img src={logoTas} alt="TAS" className="logo-img" /></div>
          <div><p className="eyebrow">Flota TAS SA DE CV</p><h1>Sistema de asignación</h1></div>
        </div>
        <form className="form" onSubmit={handleSubmit}>
          <label>Correo<input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required /></label>
          <label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          {error && <div className="alert error">{error}</div>}
          {info && <div className="alert success">{info}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
        </form>
      </div>
    </div>
  );
}

export default App;