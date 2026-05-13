import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Crown, Loader2, Search, ShieldCheck, X } from "lucide-react";

type AdminUser = {
  id: string;
  email: string | null;
  created_at: string;
  display_name: string | null;
  is_admin: boolean;
  grant: { expires_at: string | null; reason: string | null } | null;
};

const DURATIONS = [
  { value: "1m", label: "1 měsíc", days: 30 },
  { value: "3m", label: "3 měsíce", days: 90 },
  { value: "6m", label: "6 měsíců", days: 182 },
  { value: "1y", label: "1 rok", days: 365 },
  { value: "lifetime", label: "Doživotně", days: null },
];

export default function Admin() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [duration, setDuration] = useState<Record<string, string>>({});

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    (async () => {
      const { data } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      setIsAdmin(!!data);
      setChecking(false);
      if (data) await loadUsers();
    })();
  }, [user, loading]);

  async function loadUsers() {
    const { data, error } = await supabase.functions.invoke("admin-list-users");
    if (error) {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
      return;
    }
    setUsers((data?.users ?? []) as AdminUser[]);
  }

  async function grant(userId: string) {
    const sel = duration[userId] ?? "1m";
    const cfg = DURATIONS.find((d) => d.value === sel)!;
    const expires_at = cfg.days
      ? new Date(Date.now() + cfg.days * 86400_000).toISOString()
      : null;
    setBusyId(userId);
    const { error } = await supabase.functions.invoke("admin-grant-premium", {
      body: { action: "grant", user_id: userId, expires_at, reason: cfg.label },
    });
    setBusyId(null);
    if (error) {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Premium přiděleno", description: cfg.label });
    await loadUsers();
  }

  async function revoke(userId: string) {
    setBusyId(userId);
    const { error } = await supabase.functions.invoke("admin-grant-premium", {
      body: { action: "revoke", user_id: userId },
    });
    setBusyId(null);
    if (error) {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Premium odebráno" });
    await loadUsers();
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email?.toLowerCase().includes(q) ||
        u.display_name?.toLowerCase().includes(q),
    );
  }, [users, search]);

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Přístup odepřen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tato stránka je dostupná jen administrátorům.
            </p>
            <Button onClick={() => navigate("/app")} variant="outline">
              Zpět do aplikace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-primary" />
              Správa premium předplatného
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Přidělení premia zdarma na vybrané období.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/app")}>
            Zpět
          </Button>
        </header>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Hledat podle e-mailu nebo jména..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid gap-3">
          {filtered.map((u) => {
            const grant = u.grant;
            const active =
              grant && (!grant.expires_at || new Date(grant.expires_at) > new Date());
            const sel = duration[u.id] ?? "1m";
            return (
              <Card key={u.id}>
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">
                        {u.display_name || u.email || u.id}
                      </span>
                      {active && (
                        <Badge className="gap-1">
                          <Crown className="h-3 w-3" />
                          Premium
                        </Badge>
                      )}
                      {u.is_admin && <Badge variant="secondary">Admin</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {u.email}
                    </div>
                    {active && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {grant?.expires_at
                          ? `Platí do ${new Date(grant.expires_at).toLocaleDateString("cs-CZ")}`
                          : "Doživotně"}
                        {grant?.reason ? ` · ${grant.reason}` : ""}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={sel}
                      onValueChange={(v) =>
                        setDuration((d) => ({ ...d, [u.id]: v }))
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATIONS.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => grant(u.id)}
                      disabled={busyId === u.id}
                      size="sm"
                    >
                      {busyId === u.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Crown className="h-4 w-4 mr-1" />
                          Přidělit
                        </>
                      )}
                    </Button>
                    {active && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => revoke(u.id)}
                        disabled={busyId === u.id}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Žádní uživatelé.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
