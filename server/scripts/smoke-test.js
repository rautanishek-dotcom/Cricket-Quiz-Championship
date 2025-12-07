const fetch = globalThis.fetch;
const API = 'http://localhost:4000/api';

async function run() {
  try {
    console.log('Registering test user...');
    const regRes = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `smoketest+${Date.now()}@example.com`, password: 'Test1234', name: 'Smoke Tester' })
    });
    const regJson = await regRes.json();
    if (!regRes.ok) {
      console.error('Register failed', regJson);
      return process.exit(1);
    }
    const user = regJson.data.user;
    const token = regJson.data.token;
    console.log('Registered user id:', user.id);

    console.log('Fetching 3 questions...');
    const qRes = await fetch(`${API}/questions?limit=3`);
    const qJson = await qRes.json();
    const questions = qJson.data || [];
    console.log(`Fetched ${questions.length} questions`);

    let score = 0;
    let timeBonus = 0;
    // simulate answering: pick the correct answer for each
    for (const q of questions) {
      if (q.correct_answer !== undefined) score += 1;
      timeBonus += 1; // arbitrary small bonus
    }

    const resultPayload = {
      user_id: user.id,
      score,
      total_questions: questions.length,
      time_bonus: timeBonus,
      difficulty: 'easy'
    };

    console.log('Posting result:', resultPayload);
    const resRes = await fetch(`${API}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultPayload)
    });
    const resJson = await resRes.json();
    console.log('Result insert response:', resJson);

    console.log('Fetching leaderboard for easy...');
    const lbRes = await fetch(`${API}/results/leaderboard?level=easy`);
    const lbJson = await lbRes.json();
    console.log('Leaderboard (easy) top entries:', lbJson.data && lbJson.data.slice(0,5));

    console.log('Smoke test completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Smoke test failed:', err);
    process.exit(1);
  }
}

run();
