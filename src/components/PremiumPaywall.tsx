import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Check } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";

const PremiumPaywall = () => {
  const { t } = useLanguage();
  const { openCheckout } = useSubscription();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await openCheckout();
    } finally {
      setLoading(false);
    }
  };

  const features = [
    t.premiumFeature1,
    t.premiumFeature2,
    t.premiumFeature3,
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Crown className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">
            {t.premiumTitle}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {t.premiumSubtitle}
          </p>
        </div>

        <div className="card-elevated p-5 mb-6 space-y-3">
          {features.map((feature, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm text-foreground">{feature}</span>
            </div>
          ))}
        </div>

        <div className="text-center mb-4">
          <span className="text-3xl font-bold text-foreground">{t.premiumPrice}</span>
          <p className="text-xs text-muted-foreground mt-1">
            {t.trialInfo || "Start with a free 7-day trial"}
          </p>
        </div>

        <Button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full h-12 text-base font-medium"
        >
          <Crown className="h-4 w-4 mr-2" />
          {t.startFreeTrial || "Start Free Trial"}
        </Button>
      </motion.div>
    </div>
  );
};

export default PremiumPaywall;
