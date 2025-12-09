import { useState } from 'react';
import type { FormEvent } from 'react';
import './App.css';
import logoTas from './assets/LogoTAS_circular.png';
import { useAuth } from './context/AuthContext';
import { VehiculosPage } from './pages/VehiculosPage';

function App() {
  const { user, login, logout, loading, error } = useAuth();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [info, setInfo] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setInfo(null);
    try {
      await login({ correo, password });
      setInfo('Inicio de sesión exitoso.');
    } catch {
      /* error state already handled */
    }
  };

  // If logged in, show Vehiculos page
  if (user) {
    return (
      <div className="app-container">
        <nav className="navbar">
          <div className="navbar-content">
            <div className="navbar-brand">
              <img src={logoTas} alt="TAS" className="navbar-logo" />
              <span className="navbar-title">Sistema Flota TAS</span>
            </div>
            <div className="navbar-user">
              <span className="user-name">{user.nombre}</span>
              <span className="user-role">({user.rol})</span>
              <button className="btn-logout" onClick={logout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        </nav>
        <main className="main-content">
          <VehiculosPage />
        </main>
      </div>
    );
  }

  // If not logged in, show login form
  return (
    <div className="page">
      <div className="card">
        <div className="brand">
          <div className="logo-wrapper">
            <img src={logoTas} alt="TAS" className="logo-img" />
          </div>
          <div>
            <p className="eyebrow">Demo flota</p>
            <h1>Sistema de asignación</h1>
          </div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Correo
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="usuario@tas.hn"
              required
            />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          {error && <div className="alert error">{error}</div>}
          {info && <div className="alert success">{info}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="hint">
          Usuario por defecto: admin@tas.hn / admin123
        </p>
      </div>
    </div>
  );
}

export default App;
