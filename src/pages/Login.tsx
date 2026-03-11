import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";
import techMahindraLogo from "@/assets/tech-mahindra-logo.png";

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 px-4">
      {/* Floating glassmorphic panel */}
      <div className="w-full max-w-md rounded-3xl border border-border/40 bg-card/80 backdrop-blur-2xl shadow-[0_20px_70px_-15px_hsl(var(--primary)/0.25)] p-10 space-y-8">
        {/* Tech Mahindra Logo */}
        <div className="flex flex-col items-center gap-4">
          <img
            src={techMahindraLogo}
            alt="Tech Mahindra"
            className="h-16 w-auto object-contain"
          />
          <div className="h-px w-16 bg-border/60" />
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            AT&T Agent Assist
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your Tech Mahindra email to access the demo
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="you@techmahindra.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              className="h-12 text-base rounded-xl bg-background/60 border-border/50 focus-visible:ring-primary/40"
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full h-12 text-base rounded-xl font-semibold"
          >
            Access Demo
          </Button>
        </form>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground/70">
          This demo is restricted to authorized Tech Mahindra personnel.
        </p>
      </div>
    </div>
  );
};

export default Login;
