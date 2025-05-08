import express from 'express';
import Note from '../models/Note.js';
import { verifyFirebaseToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notes/unit/:unitId
router.get('/unit/:unitId', verifyFirebaseToken, async (req, res) => {
  const notes = await Note.find({ unitId: req.params.unitId });
  res.json(notes);
});

// POST /api/notes
router.post('/', verifyFirebaseToken, async (req, res) => {
  const note = new Note({ ...req.body, user: req.user.uid });
  await note.save();
  res.status(201).json(note);
});

// PUT /api/notes/:id
router.put('/:id', verifyFirebaseToken, async (req, res) => {
  const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(note);
});

// DELETE /api/notes/:id
router.delete('/:id', verifyFirebaseToken, async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

export default router;
