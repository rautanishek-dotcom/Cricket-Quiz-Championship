import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
}

interface AuthSession {
  user: AuthUser | null;
  token?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // On mount, try to load session from backend shim
    let mounted = true;
    supabase.auth.getSession().then((res: any) => {
      if (!mounted) return;
      const session = res?.data?.session ?? null;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(() => setLoading(false));

    return () => { mounted = false; };
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const resp = await supabase.auth.signUp({ email, password, options: { data: { name: username } } });
      if (resp.error) throw resp.error;
      const session = resp.data ?? null;
      setSession(session);
      setUser(session?.user ?? null);
      toast.success("Account created! Welcome to Cricket Quiz!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const resp = await supabase.auth.signInWithPassword({ email, password });
      if (resp.error) throw resp.error;
      const session = resp.data ?? null;
      setSession(session);
      setUser(session?.user ?? null);
      toast.success("Welcome back!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
