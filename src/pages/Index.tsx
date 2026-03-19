import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import AddictionOnboarding from "@/components/AddictionOnboarding";
import AddictionDetail from "@/components/AddictionDetail";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAddictions } from "@/hooks/useAddictions";
import type { AddictionRecord } from "@/types/addiction";

type View = "dashboard" | "onboarding" | "detail";

const Index = () => {
  const { records, addRecord, updateRecord, removeRecord } = useAddictions();
  const [view, setView] = useState<View>(records.length === 0 ? "onboarding" : "dashboard");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setView("detail");
  };

  const handleAdd = () => setView("onboarding");

  const handleOnboardingComplete = (record: AddictionRecord) => {
    addRecord(record);
    setSelectedId(record.id);
    setView("detail");
  };

  const handleBack = () => {
    if (records.length === 0) return;
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
      <div className="absolute top-4 right-6 z-10">
        <LanguageSwitcher />
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
