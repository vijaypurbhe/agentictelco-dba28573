import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Shield, Users } from "lucide-react";
import techMahindraLogo from "@/assets/tech-mahindra-logo.png";

const ADMIN_EMAIL = "vijay.purbhe@techmahindra.com";

interface LoginEntry {
  id: string;
  email: string;
  logged_in_at: string;
  user_agent: string | null;
  ip_address: string | null;
  location: string | null;
}

const LoginReport = () => {
  const navigate = useNavigate();
  const [entries, setEntries] = useState<LoginEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("demo_auth_email");
    if (storedEmail !== ADMIN_EMAIL) {
      setAuthorized(false);
      setLoading(false);
      return;
    }
    setAuthorized(true);

    const fetchData = async () => {
      const { data, error } = await supabase
        .from("login_audit_log")
        .select("*")
        .order("logged_in_at", { ascending: false });

      if (!error && data) setEntries(data as LoginEntry[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (!loading && !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-6 space-y-4">
            <Shield className="w-12 h-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
            <p className="text-muted-foreground text-sm">You are not authorized to view this report.</p>
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Demo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const uniqueEmails = new Set(entries.map((e) => e.email));

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={techMahindraLogo} alt="Tech Mahindra" className="h-12 w-auto object-contain" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Login Audit Report</h1>
              <p className="text-sm text-muted-foreground">Demo access log</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Logins</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{loading ? "…" : entries.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Unique Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <p className="text-3xl font-bold text-foreground">{loading ? "…" : uniqueEmails.size}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading…</div>
            ) : entries.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No login records yet.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Date &amp; Time</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="hidden md:table-cell">IP</TableHead>
                    <TableHead className="hidden lg:table-cell">Browser</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.email}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(entry.logged_in_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {entry.location || "—"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                        {entry.ip_address || "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-xs max-w-[300px] truncate">
                        {entry.user_agent || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginReport;
