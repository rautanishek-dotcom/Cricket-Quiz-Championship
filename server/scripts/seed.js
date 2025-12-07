const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Question = require('../models/Question');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cricket_quiz';

const sampleQuestions = [
  {
    question: 'Who won the ICC Cricket World Cup in 2019?',
    options: ['India', 'England', 'Australia', 'New Zealand'],
    correct_answer: 1,
    difficulty: 'medium',
    category: 'world cup',
    time_limit: 30
  },
  {
    question: 'What is the maximum number of overs in a One Day International match per side?',
    options: ['20', '50', '60', '40'],
    correct_answer: 1,
    difficulty: 'easy',
    category: 'rules',
    time_limit: 20
  },
  {
    question: 'Which bowler has the most Test wickets (all-time)?',
    options: ['Shane Warne', 'Muttiah Muralitharan', 'Anil Kumble', 'James Anderson'],
    correct_answer: 1,
    difficulty: 'hard',
    category: 'records',
    time_limit: 30
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB for seeding');

    const count = await Question.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} questions — skipping seed.`);
    } else {
      const inserted = await Question.insertMany(sampleQuestions);
      console.log(`Inserted ${inserted.length} sample questions.`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

seed();
