import { Shield, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useSharing, type SharingSettings } from "@/hooks/useSharing";

interface Props {
  addictionId: string;
}

const ROWS: { key: keyof SharingSettings; label: string; hint?: string; sensitive?: boolean }[] = [
  { key: "share_type", label: "Typ závislosti", hint: "Co sleduješ (např. cigarety)" },
  { key: "share_quit_date", label: "Počet dní bez", hint: "Tvůj streak" },
  { key: "share_per_day", label: "Spotřeba / den" },
  { key: "share_savings", label: "Ušetřené peníze" },
  { key: "share_mood", label: "Nálada a chutě", sensitive: true },
  { key: "share_health", label: "Zdravotní záznamy", sensitive: true, hint: "Tep, tlak, váha…" },
];

const SharingSettingsPanel = ({ addictionId }: Props) => {
  const { settings, update, loading } = useSharing(addictionId);

  if (loading) return null;

  return (
    <div className="card-elevated p-5 mb-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="rounded-full bg-primary/10 p-2">
          <Shield className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Sdílení s přáteli</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Vyber, co o této závislosti uvidí lidé v tvém kruhu. Vše ostatní zůstává jen tvé.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {ROWS.map((row) => (
          <div key={row.key} className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm text-foreground">{row.label}</p>
                {row.sensitive && (
                  <Lock className="h-3 w-3 text-muted-foreground/60" />
                )}
              </div>
              {row.hint && (
                <p className="text-[11px] text-muted-foreground mt-0.5">{row.hint}</p>
              )}
            </div>
            <Switch
              checked={settings[row.key]}
              onCheckedChange={(v) => update({ [row.key]: v } as Partial<SharingSettings>)}
            />
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed">
        Změny se projeví okamžitě. Zdravotní data a nálada jsou ve výchozím stavu vypnuté.
      </p>
    </div>
  );
};

export default SharingSettingsPanel;
