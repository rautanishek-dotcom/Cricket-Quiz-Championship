const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

function generateToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'User exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name });

    const token = generateToken(user);
    res.json({ data: { user: { id: user._id, email: user.email, name: user.name }, token } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({ data: { user: { id: user._id, email: user.email, name: user.name }, token } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/session', async (req, res) => {
  const auth = req.headers.authorization?.split(' ')[1];
  if (!auth) return res.json({ data: { session: null } });
  try {
    const payload = jwt.verify(auth, JWT_SECRET);
    const user = await User.findById(payload.id).lean();
    if (!user) return res.json({ data: { session: null } });
    res.json({ data: { session: { user: { id: user._id, email: user.email, name: user.name }, token: auth } } });
  } catch (err) {
    return res.json({ data: { session: null } });
  }
});

module.exports = router;
