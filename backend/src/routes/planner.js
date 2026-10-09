import express from 'express';
import PlannerEntry from '../models/PlannerEntry.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/entries', async (req, res) => {
  try {
    const entries = await PlannerEntry.find({ user: req.user.id }).sort({ date: 1, createdAt: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'No se pudieron cargar tus entradas' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const entries = await PlannerEntry.find({ user: req.user.id });
    const taskCount = entries.filter((item) => item.type === 'task').length;
    const eventCount = entries.filter((item) => item.type === 'event').length;
    const noteCount = entries.filter((item) => item.type === 'note').length;
    const totalFinance = entries
      .filter((item) => item.type === 'finance')
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

    res.json({
      taskCount,
      eventCount,
      noteCount,
      totalFinance,
      totalEntries: entries.length,
    });
  } catch (error) {
    res.status(500).json({ message: 'No se pudo obtener el resumen' });
  }
});

router.post('/entries', async (req, res) => {
  try {
    const entry = await PlannerEntry.create({
      ...req.body,
      user: req.user.id,
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ message: error.message || 'No se pudo guardar la entrada' });
  }
});

router.put('/entries/:id', async (req, res) => {
  try {
    const entry = await PlannerEntry.findOne({ _id: req.params.id, user: req.user.id });

    if (!entry) {
      return res.status(404).json({ message: 'Entrada no encontrada' });
    }

    const { user, _id, ...updates } = req.body;
    Object.assign(entry, updates);
    await entry.save();

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Error al editar la entrada' });
  }
});

router.delete('/entries/:id', async (req, res) => {
  try {
    const deleted = await PlannerEntry.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!deleted) {
      return res.status(404).json({ message: 'Entrada no encontrada' });
    }

    res.json({ ok: true, deletedId: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la entrada' });
  }
});

export default router;
