require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const questionsRoutes = require('./routes/questions');
const resultsRoutes = require('./routes/results');

const app = express();
app.use(cors());
app.use(express.json());

const DEFAULT_LOCAL_URI = 'mongodb://localhost:27017/cricket-quiz';
const MONGODB_URI = process.env.MONGODB_URI || DEFAULT_LOCAL_URI;

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => { console.error('Mongo connect error', err); process.exit(1); });

app.use('/api/auth', authRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/results', resultsRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
