import { FormEvent, useState } from 'react';
import './App.css';
import { useAuth } from './context/AuthContext';

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

  return (
    <div className="page">
      <div className="card">
        <div className="brand">
          <div className="logo-placeholder">TAS</div>
          <div>
            <p className="eyebrow">Demo flota</p>
            <h1>Sistema de asignación</h1>
          </div>
        </div>

        {!user ? (
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
        ) : (
          <div className="session">
            <div>
              <p className="eyebrow">Sesión activa</p>
              <h2>{user.nombre}</h2>
              <p className="muted">
                {user.correo} · Rol: <strong>{user.rol}</strong>
              </p>
            </div>
            <div className="session-actions">
              <button type="button" className="secondary" onClick={logout}>
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
        <p className="hint">
          Para agregar el logo de TAS, coloca el archivo en
          <code>src/assets/logo-tas.png</code> y úsalo en el bloque de marca, o
          comparte un enlace y lo integramos.
        </p>
      </div>
    </div>
  );
}

export default App;
