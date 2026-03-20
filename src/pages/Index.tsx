import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import AddictionOnboarding from "@/components/AddictionOnboarding";
import AddictionDetail from "@/components/AddictionDetail";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Auth from "@/pages/Auth";
import { useAddictions } from "@/hooks/useAddictions";
import { useAuth } from "@/hooks/useAuth";
import type { AddictionRecord } from "@/types/addiction";
import { LogOut } from "lucide-react";

type View = "dashboard" | "onboarding" | "detail";

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { records, loading: dataLoading, addRecord, updateRecord, removeRecord } = useAddictions();
  const [view, setView] = useState<View>("dashboard");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Show loading spinner while auth is resolving
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  // Not logged in — show auth
  if (!user) {
    return <Auth />;
  }

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setView("detail");
  };

  const handleAdd = () => setView("onboarding");

  const handleOnboardingComplete = async (record: AddictionRecord) => {
    await addRecord(record);
    setSelectedId(record.id);
    setView("detail");
  };

  const handleBack = () => {
    if (records.length === 0 && view === "onboarding") return;
    setView("dashboard");
    setSelectedId(null);
  };

  const selectedRecord = selectedId ? records.find(r => r.id === selectedId) : null;

  if (view === "onboarding") {
    return (
      <AddictionOnboarding
        onComplete={handleOnboardingComplete}
        onBack={handleBack}
        existingTypes={records.map(r => r.type)}
      />
    );
  }

  if (view === "detail" && selectedRecord) {
    return (
      <AddictionDetail
        record={selectedRecord}
        onBack={() => { setView("dashboard"); setSelectedId(null); }}
        onUpdate={(updates) => updateRecord(selectedRecord.id, updates)}
      />
    );
  }

  return (
    <>
      <div className="absolute top-4 right-6 z-10 flex items-center gap-2">
        <LanguageSwitcher />
        <button
          onClick={signOut}
          className="flex items-center gap-1 rounded-xl bg-secondary px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
      <Dashboard
        records={records}
        onSelect={handleSelect}
        onAdd={handleAdd}
        onRemove={removeRecord}
      />
    </>
  );
};

export default Index;
