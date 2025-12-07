const express = require('express');
const mongoose = require('mongoose');
const Result = require('../models/Result');
const User = require('../models/User');

const router = express.Router();

// ================================
// SAVE SCORE
// ================================
router.post('/submit', async (req, res) => {
  const { userId, score, totalQuestions, timeBonus, difficulty } = req.body;

  if (!userId || typeof score !== 'number') {
    return res.status(400).json({ error: 'userId and numeric score are required' });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await Result.create({
      user_id: user._id,
      score,
      total_questions: totalQuestions ?? 0,
      time_bonus: timeBonus ?? 0,
      difficulty: difficulty ?? null
    });

    res.json({ data: { id: result._id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save result' });
  }
});

// ================================
// LEADERBOARD
// ================================
router.get('/leaderboard', async (req, res) => {
  try {
    const matchStage = {};
    if (req.query.level) {
      matchStage.difficulty = req.query.level;
    }

    const leaderboard = await Result.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$user_id',
          best_score: { $max: '$score' },
          quiz_count: { $sum: 1 },
          last_played: { $max: '$created_at' }
        }
      },
      {
        $sort: {
          best_score: -1,
          quiz_count: -1,
          last_played: -1
        }
      },
      { $limit: 20 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          username: { $ifNull: ['$user.name', '$user.email'] },
          best_score: 1,
          quiz_count: 1,
          last_played: 1
        }
      }
    ]);

    res.json({
      data: leaderboard.map(entry => ({
        ...entry,
        last_played: entry.last_played ? entry.last_played.toISOString() : null
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

module.exports = router;
