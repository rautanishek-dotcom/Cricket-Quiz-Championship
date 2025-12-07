import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Loader2, Plus, Trash2, Edit, ArrowLeft, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  difficulty: string;
  category: string;
  time_limit: number;
}

const QuestionManager = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correct_answer: 0,
    difficulty: "medium",
    category: "general",
    time_limit: 30
  });

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error("Access denied");
      navigate("/");
    }
  }, [isAdmin, adminLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchQuestions();
    }
  }, [isAdmin]);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedQuestions: Question[] = (data || []).map(q => ({
        id: q.id,
        question: q.question,
        options: Array.isArray(q.options) ? q.options : JSON.parse(q.options as string),
        correct_answer: q.correct_answer,
        difficulty: q.difficulty || 'medium',
        category: q.category || 'general',
        time_limit: q.time_limit || 30
      }));

      setQuestions(typedQuestions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error("Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const questionData = {
      question: formData.question,
      options: [formData.option1, formData.option2, formData.option3, formData.option4],
      correct_answer: formData.correct_answer,
      difficulty: formData.difficulty,
      category: formData.category,
      time_limit: formData.time_limit
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('questions')
          .update(questionData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success("Question updated successfully");
      } else {
        const { error } = await supabase
          .from('questions')
          .insert(questionData);

        if (error) throw error;
        toast.success("Question added successfully");
      }

      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      toast.error("Failed to save question");
    }
  };

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setFormData({
      question: question.question,
      option1: question.options[0],
      option2: question.options[1],
      option3: question.options[2],
      option4: question.options[3],
      correct_answer: question.correct_answer,
      difficulty: question.difficulty,
      category: question.category,
      time_limit: question.time_limit
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success("Question deleted successfully");
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error("Failed to delete question");
    }
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');

        const questionsToImport = lines.slice(1).map(line => {
          const values = line.split(',');
          return {
            question: values[0]?.trim(),
            options: [values[1]?.trim(), values[2]?.trim(), values[3]?.trim(), values[4]?.trim()],
            correct_answer: parseInt(values[5]?.trim() || '0'),
            difficulty: values[6]?.trim() || 'medium',
            category: values[7]?.trim() || 'general',
            time_limit: parseInt(values[8]?.trim() || '30')
          };
        }).filter(q => q.question);

        const { error } = await supabase
          .from('questions')
          .insert(questionsToImport);

        if (error) throw error;
        toast.success(`Imported ${questionsToImport.length} questions`);
        fetchQuestions();
      } catch (error) {
        console.error('Error importing CSV:', error);
        toast.error("Failed to import CSV");
      }
    };
    reader.readAsText(file);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correct_answer: 0,
      difficulty: "medium",
      category: "general",
      time_limit: 30
    });
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 relative">
      <AnimatedBackground />
      
      <div className="max-w-6xl mx-auto py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button onClick={() => navigate("/admin")} variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold text-foreground text-shadow-glow">
              Question Manager
            </h1>
          </div>
          <div>
            <Input
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="hidden"
              id="csv-upload"
            />
            <Button asChild variant="outline">
              <label htmlFor="csv-upload" className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Import CSV
              </label>
            </Button>
          </div>
        </div>

        <Card className="p-6 backdrop-blur-sm bg-card/95 border-border/50 mb-8">
          <h2 className="text-2xl font-bold mb-6">{editingId ? "Edit Question" : "Add New Question"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                required
                placeholder="Enter the question"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((num) => (
                <div key={num}>
                  <Label htmlFor={`option${num}`}>Option {num}</Label>
                  <Input
                    id={`option${num}`}
                    value={formData[`option${num}` as keyof typeof formData]}
                    onChange={(e) => setFormData({ ...formData, [`option${num}`]: e.target.value })}
                    required
                    placeholder={`Option ${num}`}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="correct_answer">Correct Answer</Label>
                <Select
                  value={formData.correct_answer.toString()}
                  onValueChange={(value) => setFormData({ ...formData, correct_answer: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Option 1</SelectItem>
                    <SelectItem value="1">Option 2</SelectItem>
                    <SelectItem value="2">Option 3</SelectItem>
                    <SelectItem value="3">Option 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Batting, Bowling"
                />
              </div>

              <div>
                <Label htmlFor="time_limit">Time Limit (seconds)</Label>
                <Input
                  id="time_limit"
                  type="number"
                  min="10"
                  max="120"
                  value={formData.time_limit}
                  onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                <Plus className="mr-2 h-4 w-4" />
                {editingId ? "Update Question" : "Add Question"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Card>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">All Questions ({questions.length})</h2>
          {questions.map((q) => (
            <Card key={q.id} className="p-6 backdrop-blur-sm bg-card/95 border-border/50">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex gap-2 mb-2">
                    <span className="px-2 py-1 rounded text-xs bg-primary/20 text-primary">{q.category}</span>
                    <span className="px-2 py-1 rounded text-xs bg-secondary/20">{q.difficulty}</span>
                    <span className="px-2 py-1 rounded text-xs bg-accent/20">{q.time_limit}s</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{q.question}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {q.options.map((opt, idx) => (
                      <div key={idx} className={idx === q.correct_answer ? "text-primary font-semibold" : ""}>
                        {String.fromCharCode(65 + idx)}. {opt}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleEdit(q)} variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleDelete(q.id)} variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionManager;
