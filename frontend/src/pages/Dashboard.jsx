import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const { user, setUser, darkMode, setDarkMode } = useContext(AuthContext);
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
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

    fetchData();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  if (loading) return <div className="loader">Cargando tu agenda...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🌿 Personal Planner</h1>
          <p>Bienvenido, {user?.name}</p>
        </div>
        <div className="header-right">
          <button
            className="btn-theme"
            onClick={() => setDarkMode(!darkMode)}
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
          <h2>Tus últimas entradas</h2>
          {entries.length === 0 ? (
            <p className="empty-message">No tienes entradas aún. ¡Empieza a planificar!</p>
          ) : (
            <div className="entries-list">
              {entries.slice(0, 5).map((entry) => (
                <div key={entry._id} className={`entry entry-${entry.type}`}>
                  <div className="entry-header">
                    <h4>{entry.title}</h4>
                    <span className="entry-type">{entry.type}</span>
                  </div>
                  <p>{entry.description}</p>
                  <small>{new Date(entry.date).toLocaleDateString('es-ES')}</small>
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
