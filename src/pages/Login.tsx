import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";

interface LoginProps {
  onAuthenticated: () => void;
}

const Login = ({ onAuthenticated }: LoginProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    if (!trimmed.endsWith("@techmahindra.com")) {
      setError("Access restricted to @techmahindra.com email addresses.");
      return;
    }
    sessionStorage.setItem("demo_auth_email", trimmed);
    onAuthenticated();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-2">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            AT&T Agent Assist
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your Tech Mahindra email to access the demo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="you@techmahindra.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <Button type="submit" className="w-full">
            Access Demo
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          This demo is restricted to authorized Tech Mahindra personnel.
        </p>
      </div>
    </div>
  );
};

export default Login;
