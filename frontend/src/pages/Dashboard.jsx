import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { THEMES, applyTheme, THEME_LIST } from '../themes';
import './Dashboard.css';

const TYPE_LABELS = {
  task: 'Tarea',
  event: 'Evento',
  note: 'Nota',
  finance: 'Finanzas',
  habit: 'Hábito',
};

const todayISO = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const formatDate = (value) => {
  const [year, month, day] = String(value).slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return value;
  return new Date(year, month - 1, day).toLocaleDateString('es-ES');
};

const createEmptyForm = () => ({
  type: 'task',
  title: '',
  description: '',
  date: todayISO(),
  amount: 0,
});

function Dashboard() {
  const { user, setUser, darkMode, setDarkMode } = useContext(AuthContext);
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newEntry, setNewEntry] = useState(createEmptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const currentTheme = user?.theme || 'sapitos';

  const loadData = async () => {
    if (!token) return;

    try {
      const [entriesRes, summaryRes] = await Promise.all([
        fetch('/api/planner/entries', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/planner/summary', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (entriesRes.ok) setEntries(await entriesRes.json());
      if (summaryRes.ok) setSummary(await summaryRes.json());
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.theme) {
      applyTheme(user.theme, darkMode);
    }
  }, [darkMode, user?.theme]);

  useEffect(() => {
    loadData();
  }, [token]);

  const handleThemeChange = async (nextTheme) => {
    if (!user) return;

    const nextUser = { ...user, theme: nextTheme };
    setUser(nextUser);
    applyTheme(nextTheme, darkMode);

    try {
      await fetch('/api/auth/theme', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ theme: nextTheme, darkMode }),
      });
    } catch (error) {
      console.error('No se pudo guardar el tema', error);
    }
  };

  const handleDarkToggle = async () => {
    const nextDarkMode = !darkMode;
    setDarkMode(nextDarkMode);
    if (user) {
      setUser({ ...user, darkMode: nextDarkMode });
    }

    try {
      await fetch('/api/auth/theme', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ theme: currentTheme, darkMode: nextDarkMode }),
      });
    } catch (error) {
      console.error('No se pudo guardar el modo oscuro', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('themePreset');
    setUser(null);
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newEntry.title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...newEntry,
        title: newEntry.title.trim(),
        description: newEntry.description.trim(),
        amount: Number(newEntry.amount || 0),
      };

      const response = await fetch('/api/planner/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'No se pudo guardar');
      }

      setNewEntry(createEmptyForm());
      await loadData();
    } catch (error) {
      setError(error.message || 'Ocurrió un error inesperado');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleCompleted = async (entry) => {
    try {
      const response = await fetch(`/api/planner/entries/${entry._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !entry.completed }),
      });

      if (!response.ok) throw new Error('No se pudo actualizar la entrada');
      const updated = await response.json();
      setEntries((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (entry) => {
    if (!window.confirm(`¿Eliminar "${entry.title}"?`)) return;

    try {
      const response = await fetch(`/api/planner/entries/${entry._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('No se pudo eliminar la entrada');
      await loadData();
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <div className="loader">Cargando tu agenda...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>{THEMES[currentTheme]?.emoji || '🌿'} Personal Planner</h1>
          <p>Bienvenido, {user?.name}</p>
        </div>
        <div className="header-right">
          <button
            className="btn-theme"
            onClick={handleDarkToggle}
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Salir
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="theme-panel">
          <div className="theme-panel-header">
            <h2>🎨 Elige tu tema</h2>
          </div>
          <div className="theme-grid">
            {THEME_LIST.map((item) => (
              <button
                key={item.value}
                type="button"
                className={`theme-option ${currentTheme === item.value ? 'active' : ''}`}
                onClick={() => handleThemeChange(item.value)}
              >
                <span className="theme-emoji">{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="composer-panel">
          <div className="composer-header">
            <h2>➕ Nueva entrada</h2>
          </div>

          <form className="entry-form" onSubmit={handleSubmit}>
            <div className="field-row">
              <label>
                Tipo
                <select
                  value={newEntry.type}
                  onChange={(e) => setNewEntry((prev) => ({ ...prev, type: e.target.value }))}
                >
                  <option value="task">Tarea</option>
                  <option value="event">Evento</option>
                  <option value="note">Nota</option>
                  <option value="finance">Finanzas</option>
                  <option value="habit">Hábito</option>
                </select>
              </label>

              <label>
                Fecha
                <input
                  type="date"
                  value={newEntry.date}
                  onChange={(e) => setNewEntry((prev) => ({ ...prev, date: e.target.value }))}
                />
              </label>
            </div>

            <label>
              Título
              <input
                type="text"
                placeholder="Ej: Hacer ejercicio, Reunión, Comprar leche"
                value={newEntry.title}
                onChange={(e) => setNewEntry((prev) => ({ ...prev, title: e.target.value }))}
              />
            </label>

            <label>
              Descripción
              <textarea
                rows="3"
                placeholder="Describe la actividad o recordatorio"
                value={newEntry.description}
                onChange={(e) => setNewEntry((prev) => ({ ...prev, description: e.target.value }))}
              />
            </label>

            {newEntry.type === 'finance' && (
              <label>
                Monto
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newEntry.amount}
                  onChange={(e) => setNewEntry((prev) => ({ ...prev, amount: e.target.value }))}
                />
              </label>
            )}

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar entrada'}
            </button>
          </form>
        </section>

        <div className="summary-cards">
          {summary && (
            <>
              <div className="card card-tasks">
                <h3>📋 Tareas</h3>
                <p className="card-number">{summary.taskCount}</p>
              </div>
              <div className="card card-events">
                <h3>📅 Eventos</h3>
                <p className="card-number">{summary.eventCount}</p>
              </div>
              <div className="card card-notes">
                <h3>📝 Notas</h3>
                <p className="card-number">{summary.noteCount}</p>
              </div>
              <div className="card card-finance">
                <h3>💰 Balance</h3>
                <p className="card-number">${summary.totalFinance.toFixed(2)}</p>
              </div>
            </>
          )}
        </div>

        <div className="entries-section">
          <h2>Tus entradas</h2>
          {entries.length === 0 ? (
            <p className="empty-message">No tienes entradas aún. ¡Empieza a planificar!</p>
          ) : (
            <div className="entries-list">
              {entries.map((entry) => (
                <div
                  key={entry._id}
                  className={`entry entry-${entry.type} ${entry.completed ? 'entry-completed' : ''}`}
                >
                  <div className="entry-header">
                    <h4>{entry.title}</h4>
                    <span className="entry-type">{TYPE_LABELS[entry.type] || entry.type}</span>
                  </div>
                  <p>{entry.description || 'Sin descripción'}</p>
                  <small>{formatDate(entry.date)}</small>
                  {entry.amount > 0 && <small>Monto: ${Number(entry.amount).toFixed(2)}</small>}
                  <div className="entry-actions">
                    {(entry.type === 'task' || entry.type === 'habit') && (
                      <button type="button" className="btn-entry" onClick={() => handleToggleCompleted(entry)}>
                        {entry.completed ? '↩️ Pendiente' : '✅ Completar'}
                      </button>
                    )}
                    <button type="button" className="btn-entry btn-entry-delete" onClick={() => handleDelete(entry)}>
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
