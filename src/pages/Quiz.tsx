import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Clock } from "lucide-react";
import { toast } from "sonner";

const API_URL = (import.meta.env.VITE_API_URL as string) || "http://localhost:4000/api";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  difficulty: string;
  category: string;
  time_limit: number;
}

const Quiz = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const selectedLevelParam = params.get('level');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [totalTimeBonus, setTotalTimeBonus] = useState(0);

  useEffect(() => {
    // If level param missing, do not fetch yet - user should select level
    if (selectedLevelParam) {
      fetchQuestions(selectedLevelParam);
    }
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      setTimeLeft(questions[currentQuestion].time_limit);
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion, questions]);

  useEffect(() => {
    if (timeLeft === 0 && selectedAnswer === null) {
      handleNext();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, selectedAnswer]);

  const fetchQuestions = async (level?: string | null) => {
    try {
      const params = new URLSearchParams();
      params.set('limit', '10');
      if (level) {
        params.set('difficulty', level);
      }

      const res = await fetch(`${API_URL}/questions?${params.toString()}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to load questions');
      }
      const json = await res.json();

      const typedQuestions: Question[] = (json.data || []).map((q: any) => {
        const rawOptions = q.options;
        const parsedOptions = Array.isArray(rawOptions)
          ? rawOptions
          : (() => {
              try {
                return JSON.parse(rawOptions as string);
              } catch {
                return [];
              }
            })();

        return {
          id: q._id?.toString() || q.id,
          question: q.question,
          options: parsedOptions,
          correct_answer: q.correct_answer,
          difficulty: q.difficulty,
          category: q.category,
          time_limit: q.time_limit || 30
        };
      });

      setQuestions(typedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  // If user didn't pass level param, show selection UI
  if (!selectedLevelParam) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Select Level to Start</h2>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => { fetchQuestions('easy'); }} size="lg">Easy</Button>
            <Button onClick={() => { fetchQuestions('medium'); }} size="lg">Medium</Button>
            <Button onClick={() => { fetchQuestions('hard'); }} size="lg">Hard</Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    const questionTimeLimit = questions[currentQuestion].time_limit;
    
    if (index === questions[currentQuestion].correct_answer) {
      setScore(score + 1);
      
      // Calculate time bonus: faster answer = more bonus points
      const timeBonus = Math.max(0, Math.floor((questionTimeLimit - timeTaken) / 5));
      setTotalTimeBonus(totalTimeBonus + timeBonus);
    }
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      // Save result to database
      const finalScore = score + (selectedAnswer === questions[currentQuestion].correct_answer ? 1 : 0);
      const finalTimeBonus = totalTimeBonus + (selectedAnswer === questions[currentQuestion].correct_answer ? Math.max(0, Math.floor((timeLeft) / 5)) : 0);
      
      if (user?.id) {
        try {
          const difficultyToSave = selectedLevelParam || questions[0]?.difficulty || null;
          const res = await fetch(`${API_URL}/results/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              score: finalScore,
              totalQuestions: questions.length,
              timeBonus: finalTimeBonus,
              difficulty: difficultyToSave
            })
          });

          if (!res.ok) {
            const text = await res.text();
            throw new Error(text || "Failed to save result");
          }
        } catch (error) {
          console.error('Error saving result:', error);
          toast.error("Unable to save your score. We'll keep trying!");
        }
      }

      navigate("/results", { state: { score: finalScore, total: questions.length, timeBonus: finalTimeBonus } });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const timeProgress = (timeLeft / questions[currentQuestion]?.time_limit) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AnimatedBackground />
      
      <Card className="w-full max-w-3xl p-8 backdrop-blur-sm bg-card/95 border-border/50 hover-lift">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${timeLeft <= 5 ? 'text-destructive animate-pulse' : 'text-primary'}`}>
                <Clock className="w-4 h-4" />
                <span className="text-sm font-semibold">{timeLeft}s</span>
              </div>
              <span className="text-sm font-semibold text-primary">
                Score: {score} {totalTimeBonus > 0 && `(+${totalTimeBonus} bonus)`}
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2 mb-2" />
          <Progress value={timeProgress} className={`h-1 ${timeLeft <= 5 ? 'opacity-100' : 'opacity-50'}`} />
        </div>

        <div className="mb-4">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary mb-4">
            {questions[currentQuestion].category}
          </span>
        </div>

        <h2 className="text-2xl font-bold mb-8 text-foreground text-shadow-glow">
          {questions[currentQuestion].question}
        </h2>

        <div className="grid gap-4 mb-8">
          {questions[currentQuestion].options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleAnswer(index)}
              variant={selectedAnswer === index ? "default" : "outline"}
              className="h-auto py-4 text-left justify-start text-lg hover:scale-105 transition-all"
              disabled={selectedAnswer !== null}
            >
              <span className="mr-4 font-bold">{String.fromCharCode(65 + index)}.</span>
              {option}
            </Button>
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={selectedAnswer === null}
          className="w-full text-lg py-6 animate-pulse-glow"
          size="lg"
        >
          {currentQuestion === questions.length - 1 ? "View Results" : "Next Question"}
        </Button>
      </Card>
    </div>
  );
};

export default Quiz;
