import { useState } from "react";

import Dashboard from "@/components/Dashboard";
import AddictionSurvey, { type SurveyAnswers } from "@/components/AddictionSurvey";
import AddictionOnboarding from "@/components/AddictionOnboarding";
import AddictionDetail from "@/components/AddictionDetail";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import FriendsTab from "@/components/FriendsTab";
import PremiumPaywall from "@/components/PremiumPaywall";
import Auth from "@/pages/Auth";
import { useAddictions } from "@/hooks/useAddictions";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useLanguage } from "@/i18n/LanguageContext";
import type { AddictionRecord } from "@/types/addiction";
import { LogOut, LayoutDashboard, Users, Crown } from "lucide-react";

type View = "dashboard" | "survey" | "onboarding" | "detail";
type Tab = "home" | "friends";

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { records, addRecord, updateRecord, removeRecord } = useAddictions();
  const { isPremium, loading: subLoading, openPortal } = useSubscription();
  const { t } = useLanguage();
  const [view, setView] = useState<View>("dashboard");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("home");
  const [surveyAnswers, setSurveyAnswers] = useState<SurveyAnswers | null>(null);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setView("detail");
  };

  const handleAdd = () => setView("survey");

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

  if (view === "survey") {
    return (
      <AddictionSurvey
        onComplete={(answers) => {
          setSurveyAnswers(answers);
          setView("onboarding");
        }}
        onBack={handleBack}
      />
    );
  }

  if (view === "onboarding") {
    return (
      <AddictionOnboarding
        onComplete={handleOnboardingComplete}
        onBack={() => setView("survey")}
        existingTypes={records.map(r => r.type)}
        surveyAnswers={surveyAnswers}
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
    <div className="flex flex-col min-h-screen">
      {/* Top bar */}
      <div className="absolute top-4 right-6 z-10 flex items-center gap-2">
        {isPremium && (
          <button
            onClick={openPortal}
            className="flex items-center gap-1 rounded-xl bg-primary/10 px-3 py-2 text-xs text-primary font-medium hover:bg-primary/20 transition-colors"
          >
            <Crown className="h-3.5 w-3.5" />
            Premium
          </button>
        )}
        <LanguageSwitcher />
        <button
          onClick={signOut}
          className="flex items-center gap-1 rounded-xl bg-secondary px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 pb-16">
        {tab === "home" && (
          <Dashboard
            records={records}
            onSelect={handleSelect}
            onAdd={handleAdd}
            onRemove={removeRecord}
          />
        )}
        {tab === "friends" && (isPremium ? <FriendsTab /> : <PremiumPaywall />)}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-card/95 backdrop-blur-md">
        <div className="mx-auto max-w-md flex">
          {([
            { key: "home" as Tab, icon: LayoutDashboard, label: "MyAddiction" },
            { key: "friends" as Tab, icon: Users, label: t.friends, premium: true },
          ]).map(({ key, icon: Icon, label, premium }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                tab === key
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {premium && !isPremium && (
                  <Crown className="absolute -top-1.5 -right-2.5 h-3 w-3 text-primary" />
                )}
              </div>
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;
