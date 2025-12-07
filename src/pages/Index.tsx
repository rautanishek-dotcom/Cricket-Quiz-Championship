import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { useState, useEffect } from "react";
import { Trophy, Users, BookOpen, LogIn, LogOut, Shield } from "lucide-react";
import heroImage from "@/assets/cricket-hero.jpg";

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdmin();
  const [showLevel, setShowLevel] = useState(false);
  const location = useLocation();

  const startWithLevel = (level: string) => {
    navigate(`/quiz?level=${level}`);
  };

  // Show level selector only when `?showLevel=1` is present and the user is authenticated
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('showLevel') === '1' && user) {
      setShowLevel(true);
    }
  }, [location.search, user]);

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      
      {/* User info bar */}
      {user && (
        <div className="fixed top-4 right-4 z-50">
          <Card className="p-3 backdrop-blur-sm bg-card/95 border-border/50 flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Welcome, <span className="text-foreground font-semibold">{user.email}</span>
            </span>
            <Button
              onClick={signOut}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </Card>
        </div>
      )}
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Cricket Stadium" 
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <h1 className="text-7xl md:text-8xl font-bold mb-6 text-shadow-glow animate-fade-in">
            Cricket Quiz
            <span className="block text-primary text-6xl md:text-7xl mt-2">
              Championship
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 text-foreground/90 max-w-2xl mx-auto">
            Test your cricket knowledge and compete with players worldwide. Are you ready to prove you're the ultimate cricket fan?
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <div>
              <Button
                onClick={() => {
                  if (user) {
                    setShowLevel(true);
                  } else {
                    navigate('/auth?next=quiz');
                  }
                }}
                size="lg"
                className="text-xl py-7 px-10 animate-pulse-glow hover-lift"
              >
                <Trophy className="mr-2 h-6 w-6" />
                Start Quiz
              </Button>

              {showLevel && (
                <Card className="mt-4 p-4">
                  <h4 className="text-lg font-semibold mb-2">Select Level</h4>
                  <div className="flex gap-2">
                    <Button onClick={() => startWithLevel('easy')}>Easy</Button>
                    <Button onClick={() => startWithLevel('medium')}>Medium</Button>
                    <Button onClick={() => startWithLevel('hard')}>Hard</Button>
                    <Button variant="outline" onClick={() => setShowLevel(false)}>Cancel</Button>
                  </div>
                </Card>
              )}
            </div>
            <Button
              onClick={() => navigate("/leaderboard")}
              size="lg"
              variant="outline"
              className="text-xl py-7 px-10 hover-lift"
            >
              <Users className="mr-2 h-6 w-6" />
              Leaderboard
            </Button>
            {isAdmin && (
              <Button
                onClick={() => navigate("/admin")}
                size="lg"
                variant="secondary"
                className="text-xl py-7 px-10 hover-lift"
              >
                <Shield className="mr-2 h-6 w-6" />
                Admin Panel
              </Button>
            )}
            {!user && (
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                variant="secondary"
                className="text-xl py-7 px-10 hover-lift"
              >
                <LogIn className="mr-2 h-6 w-6" />
                Login / Sign Up
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-shadow-glow">
            Why Play Our Quiz?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 backdrop-blur-sm bg-card/90 border-border/50 hover-lift text-center">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-cricket-gold" />
              <h3 className="text-2xl font-bold mb-4">Competitive</h3>
              <p className="text-muted-foreground">
                Compete with cricket enthusiasts globally and climb the leaderboard
              </p>
            </Card>

            <Card className="p-8 backdrop-blur-sm bg-card/90 border-border/50 hover-lift text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-4">Educational</h3>
              <p className="text-muted-foreground">
                Learn fascinating cricket facts and expand your knowledge
              </p>
            </Card>

            <Card className="p-8 backdrop-blur-sm bg-card/90 border-border/50 hover-lift text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-accent" />
              <h3 className="text-2xl font-bold mb-4">Community</h3>
              <p className="text-muted-foreground">
                Join a vibrant community of cricket lovers and share your passion
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Rules Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <Card className="p-10 backdrop-blur-sm bg-card/90 border-border/50 hover-lift">
            <h2 className="text-4xl font-bold mb-8 text-center text-shadow-glow">
              Quiz Rules
            </h2>
            <ul className="space-y-4 text-lg">
              <li className="flex items-start gap-3">
                <span className="text-primary text-2xl">•</span>
                <span>Answer multiple-choice questions about cricket history, players, and records</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-2xl">•</span>
                <span>Each question has a countdown timer - answer quickly to earn time bonuses!</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-2xl">•</span>
                <span>Choose a difficulty level (Easy / Medium / Hard) before you start — only questions from that level will be shown.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-2xl">•</span>
                <span>Questions auto-submit when time runs out, so think fast!</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-2xl">•</span>
                <span>Each correct answer earns you points toward the leaderboard</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-2xl">•</span>
                <span>You can retake the quiz as many times as you want to improve your score</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary text-2xl">•</span>
                <span>Create an account to save your progress and compete globally</span>
              </li>
            </ul>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
