const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correct_answer: { type: Number, default: 0 },
  difficulty: { type: String, default: 'medium' },
  category: { type: String, default: 'general' },
  time_limit: { type: Number, default: 30 },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', QuestionSchema);
