const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true },
  total_questions: { type: Number, required: true },
  time_bonus: { type: Number, default: 0 },
  difficulty: { type: String, default: null },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', ResultSchema);
