const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Question = require('../models/Question');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cricket_quiz';

const questions = [
  // EASY (10)
  { question: 'Who was the top run-scorer for India in the 2011 ICC Cricket World Cup final?', options: ['MS Dhoni','Sachin Tendulkar','Gautam Gambhir','Yuvraj Singh'], correct_answer: 0, difficulty: 'easy', category: 'india' },
  { question: 'Which format is played over 50 overs per side?', options: ['T20','Test','One Day International (ODI)','The Hundred'], correct_answer: 2, difficulty: 'easy', category: 'formats' },
  { question: 'Which player is known for the "Helicopter Shot"?', options: ['Rohit Sharma','MS Dhoni','Virat Kohli','Shikhar Dhawan'], correct_answer: 1, difficulty: 'easy', category: 'india' },
  { question: 'Which country does Virat Kohli represent?', options: ['India','England','Australia','South Africa'], correct_answer: 0, difficulty: 'easy', category: 'india' },
  { question: 'In T20 cricket, how many legal deliveries are in one over?', options: ['6','8','4','5'], correct_answer: 0, difficulty: 'easy', category: 'rules' },
  { question: 'Who captained England to the 2019 ICC Cricket World Cup victory?', options: ['Eoin Morgan','Jos Buttler','Joe Root','Ben Stokes'], correct_answer: 0, difficulty: 'easy', category: 'world cup' },
  { question: 'Which bowler is a left-arm fast bowler from New Zealand (prominent 2010s–2020s)?', options: ['Trent Boult','Mitchell Starc','Jasprit Bumrah','Pat Cummins'], correct_answer: 0, difficulty: 'easy', category: 'players' },
  { question: 'Which of these is a spin bowling type?', options: ['Off-spin','Reverse swing','Bouncer','Yorker'], correct_answer: 0, difficulty: 'easy', category: 'rules' },
  { question: 'Which player famously scored a double century in a World Cup match (2015)?', options: ['Chris Gayle','Martin Guptill','Rohit Sharma','Kumar Sangakkara'], correct_answer: 1, difficulty: 'easy', category: 'world cup' },
  { question: 'Which nation won the ICC T20 World Cup in 2022?', options: ['England','Pakistan','Australia','West Indies'], correct_answer: 2, difficulty: 'easy', category: 'world cup' },

  // MEDIUM (10)
  { question: 'Who took the most wickets in the 2019 ICC Cricket World Cup?', options: ['Jofra Archer','Mitchell Starc','Lockie Ferguson','Rashid Khan'], correct_answer: 1, difficulty: 'medium', category: 'world cup' },
  { question: 'Which Indian fast bowler made his international debut in 2019 and became a premier pacer thereafter?', options: ['Jasprit Bumrah','Mohammed Siraj','Navdeep Saini','Shardul Thakur'], correct_answer: 0, difficulty: 'medium', category: 'india' },
  { question: 'Who scored the fastest T20 international century (as of mid-2024)?', options: ['Chris Gayle','Rohit Sharma','David Miller','Kieron Pollard'], correct_answer: 0, difficulty: 'medium', category: 'records' },
  { question: 'Which Afghan bowler is known for leg-spin and rose to international prominence in the 2010s?', options: ['Rashid Khan','Mujeeb Ur Rahman','Ibrahim Zadran','Mohammad Nabi'], correct_answer: 0, difficulty: 'medium', category: 'players' },
  { question: 'Which player scored a Test triple century in 2012 and has been a mainstay of Australian batting in recent years?', options: ['David Warner','Steve Smith','Usman Khawaja','Michael Clarke'], correct_answer: 1, difficulty: 'medium', category: 'records' },
  { question: 'Which Indian wicketkeeper‑batter is known for explosive batting and became a mainstay in India’s limited‑overs sides around 2018–2023?', options: ['Rishabh Pant','KL Rahul','Dinesh Karthik','Wriddhiman Saha'], correct_answer: 0, difficulty: 'medium', category: 'india' },
  { question: 'Which bowler delivered the famous Super Over ball for England in the 2019 World Cup final Super Over?', options: ['Jofra Archer','Ben Stokes','Chris Woakes','Adil Rashid'], correct_answer: 0, difficulty: 'medium', category: 'world cup' },
  { question: 'Which Australian pace bowler won the ICC Test Cricketer of the Year (or was highly lauded) in the late 2010s–early 2020s?', options: ['Pat Cummins','Mitchell Starc','Josh Hazlewood','James Pattinson'], correct_answer: 0, difficulty: 'medium', category: 'players' },
  { question: 'Which Indian batter is known for 360-degree strikeplay and rose to prominence in T20s around 2021?', options: ['Shikhar Dhawan','Suryakumar Yadav','Shreyas Iyer','Rishabh Pant'], correct_answer: 1, difficulty: 'medium', category: 'india' },
  { question: 'Which England all-rounder played a pivotal innings in the 2019 World Cup final and is known for power‑hitting?', options: ['Ben Stokes','Eoin Morgan','Joe Root','Jonny Bairstow'], correct_answer: 0, difficulty: 'medium', category: 'world cup' },

  // HARD (10)
  { question: 'Who was the leading wicket-taker in the 2021 ICC Men’s T20 World Cup?', options: ['Wanindu Hasaranga','Rashid Khan','Tabraiz Shamsi','Mujeeb Ur Rahman'], correct_answer: 0, difficulty: 'hard', category: 'world cup' },
  { question: 'Which bowler recorded back-to-back five-wicket hauls in the Border‑Gavaskar Trophy 2023–24?', options: ['Jasprit Bumrah','Josh Hazlewood','Nathan Lyon','Ravichandran Ashwin'], correct_answer: 2, difficulty: 'hard', category: 'series' },
  { question: 'Which captain led Australia to the ICC World Test Championship final in the early 2020s?', options: ['Tim Paine','Pat Cummins','Aaron Finch','Steve Smith'], correct_answer: 1, difficulty: 'hard', category: 'captains' },
  { question: 'Which batter holds the record for most ODI centuries for India in the 2010s–2020s period (among the choices)?', options: ['Virat Kohli','Rohit Sharma','Shikhar Dhawan','Sourav Ganguly'], correct_answer: 0, difficulty: 'hard', category: 'india' },
  { question: 'Which bowler pioneered the exacting yorker-based death bowling strategy for India in white-ball cricket around 2018–2023?', options: ['Bhuvneshwar Kumar','Jasprit Bumrah','Hardik Pandya','Mohammed Shami'], correct_answer: 1, difficulty: 'hard', category: 'india' },
  { question: 'Who scored a 200+ score in a single ODI (Rohit Sharma did this multiple times) — which of these players has done it?', options: ['Rohit Sharma','Virat Kohli','Chris Gayle','Martin Guptill'], correct_answer: 0, difficulty: 'hard', category: 'records' },
  { question: 'Which Indian bowler is known for reverse‑swing and has been a key Test bowler for India in the 2010s–2020s?', options: ['Jasprit Bumrah','Mohammed Shami','Ishant Sharma','Bhuvneshwar Kumar'], correct_answer: 1, difficulty: 'hard', category: 'india' },
  { question: 'Which spinner was the highest wicket-taker in the 2022 IPL season (or notable top performer in recent IPL seasons)?', options: ['Rashid Khan','Yuzvendra Chahal','Ravi Bishnoi','Wanindu Hasaranga'], correct_answer: 1, difficulty: 'hard', category: 'ipl' },
  { question: 'Which English batter scored a century in each innings of a Test during the 2020–2023 period and later captained in some formats?', options: ['Joe Root','Ben Stokes','Zak Crawley','Jonny Bairstow'], correct_answer: 0, difficulty: 'hard', category: 'records' },
  { question: 'Which Indian spinner became one of India\'s most successful Test bowlers in the 2010s–2020s?', options: ['Ravichandran Ashwin','Ravindra Jadeja','Anil Kumble','Harbhajan Singh'], correct_answer: 0, difficulty: 'hard', category: 'india' }
];

async function insertAll() {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB for full seed');

    const inserted = await Question.insertMany(questions);
    console.log(`Inserted ${inserted.length} questions.`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Insert failed:', err);
    process.exit(1);
  }
}

insertAll();
