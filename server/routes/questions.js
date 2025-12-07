const express = require('express');
const Question = require('../models/Question');

const router = express.Router();

// GET /api/questions
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const order = req.query.order || 'created_at.desc';
    const [field, dir] = order.split('.');
    const sort = { [field]: dir === 'asc' ? 1 : -1 };

    const filter = {};
    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const questions = await Question.find(filter).sort(sort).limit(limit).lean();
    res.json({ data: questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/questions
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    const q = await Question.create(payload);
    res.json({ data: q });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/questions/:id
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await Question.findByIdAndUpdate(id, req.body, { new: true }).lean();
    res.json({ data: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/questions/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await Question.findByIdAndDelete(id);
    res.json({ data: { id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
