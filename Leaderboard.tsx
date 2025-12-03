import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Trophy, Medal, Award, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface LeaderboardEntry {
  username: string;
  best_score: number;
  quiz_count: number;
  last_played: string;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard(levelFilter);
  }, [levelFilter]);

  const fetchLeaderboard = async (level?: string | null) => {
    try {
      const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:4000/api';
      const url = level ? `${API_URL}/results/leaderboard?level=${encodeURIComponent(level)}` : `${API_URL}/results/leaderboard`;
      const res = await fetch(url);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Leaderboard fetch failed: ${res.status} ${text}`);
      }
      const json = await res.json();
      setLeaderboard(json.data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (rank: number) => {
    if (rank === 1) return { Icon: Trophy, color: "text-cricket-gold" };
    if (rank === 2) return { Icon: Medal, color: "text-gray-400" };
    if (rank === 3) return { Icon: Award, color: "text-pitch-brown" };
    return null;
  };

  return (
    <div className="min-h-screen p-4 relative">
      <AnimatedBackground />
      
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-shadow-glow">
            🏆 Leaderboard
          </h1>
          <p className="text-xl text-muted-foreground">
            Top Cricket Quiz Champions
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : leaderboard.length === 0 ? (
          <Card className="backdrop-blur-sm bg-card/95 border-border/50 p-8 text-center">
            <p className="text-xl text-muted-foreground">
              No scores yet. Be the first to play!
            </p>
          </Card>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-center gap-4">
              <Button size="sm" onClick={() => setLevelFilter(null)} variant={levelFilter===null?"secondary":"outline"}>All</Button>
              <Button size="sm" onClick={() => setLevelFilter('easy')} variant={levelFilter==='easy'?"secondary":"outline"}>Easy</Button>
              <Button size="sm" onClick={() => setLevelFilter('medium')} variant={levelFilter==='medium'?"secondary":"outline"}>Medium</Button>
              <Button size="sm" onClick={() => setLevelFilter('hard')} variant={levelFilter==='hard'?"secondary":"outline"}>Hard</Button>
            </div>
            <Card className="backdrop-blur-sm bg-card/95 border-border/50 p-8 hover-lift">
            <div className="space-y-4">
              {leaderboard.map((player, index) => {
                const rank = index + 1;
                const iconData = getIcon(rank);
                
                return (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-all hover:scale-105"
                  >
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background text-2xl font-bold">
                          {iconData ? (
                            (() => {
                              const Icon = iconData.Icon;
                              return <Icon className={`w-8 h-8 ${iconData.color}`} />;
                            })()
                          ) : (
                            rank
                          )}
                        </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{player.username}</h3>
                      <p className="text-sm text-muted-foreground">
                        {player.quiz_count} {player.quiz_count === 1 ? 'quiz' : 'quizzes'} played
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {player.best_score}
                      </div>
                      <div className="text-sm text-muted-foreground">best score</div>
                    </div>
                  </div>
                );
              })}
            </div>
            </Card>
          </>
        )}

        <div className="text-center mt-8">
          <Button
            onClick={() => navigate("/")}
            size="lg"
            variant="outline"
            className="gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
