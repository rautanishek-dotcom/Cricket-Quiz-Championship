import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Trophy, RotateCcw, Home, Clock } from "lucide-react";

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { score = 0, total = 0, timeBonus = 0 } = location.state || {};
  
  const percentage = Math.round((score / total) * 100);
  
  const getMessage = () => {
    if (percentage >= 80) return { text: "Outstanding! Cricket Expert!", icon: "🏆" };
    if (percentage >= 60) return { text: "Great Job! Cricket Fan!", icon: "🎉" };
    if (percentage >= 40) return { text: "Good Try! Keep Learning!", icon: "👍" };
    return { text: "Keep Practicing!", icon: "💪" };
  };

  const message = getMessage();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AnimatedBackground />
      
      <Card className="w-full max-w-2xl p-12 backdrop-blur-sm bg-card/95 border-border/50 hover-lift text-center">
        <div className="mb-8">
          <Trophy className="w-24 h-24 mx-auto mb-4 text-cricket-gold animate-bounce" />
          <h1 className="text-4xl font-bold mb-2 text-shadow-glow">
            {message.icon} {message.text}
          </h1>
        </div>

        <div className="mb-8">
          <div className="text-7xl font-bold mb-4 text-primary text-shadow-glow">
            {score}/{total}
          </div>
          <p className="text-2xl text-muted-foreground">
            {percentage}% Correct
          </p>
          {timeBonus > 0 && (
            <div className="mt-4 flex items-center justify-center gap-2 text-lg text-primary">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">Speed Bonus: +{timeBonus} points!</span>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => navigate("/quiz")}
            size="lg"
            variant="default"
            className="gap-2 text-lg py-6"
          >
            <RotateCcw className="w-5 h-5" />
            Try Again
          </Button>
          <Button
            onClick={() => navigate("/")}
            size="lg"
            variant="outline"
            className="gap-2 text-lg py-6"
          >
            <Home className="w-5 h-5" />
            Home
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Results;
