import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

const createToken = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'secret', {
    expiresIn: '7d',
  });

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      theme: 'sapitos',
      darkMode: false,
    });

    return res.status(201).json({
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email, theme: user.theme, darkMode: user.darkMode },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al crear usuario' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    return res.json({
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email, theme: user.theme, darkMode: user.darkMode },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json({ user: { id: user._id, name: user.name, email: user.email, theme: user.theme, darkMode: user.darkMode } });
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
});

router.patch('/theme', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const { theme, darkMode } = req.body;
    const validThemes = ['sapitos', 'unicornios', 'bosque', 'tiburones', 'gatos'];

    if (theme && !validThemes.includes(theme)) {
      return res.status(400).json({ message: 'Tema no válido' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (theme) user.theme = theme;
    if (typeof darkMode === 'boolean') user.darkMode = darkMode;

    await user.save();

    return res.json({
      user: { id: user._id, name: user.name, email: user.email, theme: user.theme, darkMode: user.darkMode },
    });
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
});

export default router;
