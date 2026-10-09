import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthContext from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import { applyTheme } from './themes';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('themeMode') === 'dark');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Sesión inválida');
          return res.json();
        })
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            const nextDarkMode = Boolean(data.user.darkMode);
            setDarkMode(nextDarkMode);
            localStorage.setItem('themeMode', nextDarkMode ? 'dark' : 'light');
            localStorage.setItem('themePreset', data.user.theme || 'sapitos');
          }
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('themeMode', darkMode ? 'dark' : 'light');
    const selectedTheme = user?.theme || localStorage.getItem('themePreset') || 'sapitos';
    applyTheme(selectedTheme, darkMode);
  }, [darkMode, user?.theme]);

  if (loading) return <div className="loader">Cargando...</div>;

  return (
    <AuthContext.Provider value={{ user, setUser, darkMode, setDarkMode }}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
