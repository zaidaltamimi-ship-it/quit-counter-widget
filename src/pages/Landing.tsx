import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, Shield, TrendingDown, Users, BarChart3, Brain, ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/LanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const Landing = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = [
    { icon: TrendingDown, title: t.landingFeatureTracking, desc: t.landingFeatureTrackingDesc },
    { icon: Brain, title: t.landingFeaturePersonalized, desc: t.landingFeaturePersonalizedDesc },
    { icon: BarChart3, title: t.landingFeatureHealth, desc: t.landingFeatureHealthDesc },
    { icon: Users, title: t.landingFeatureSocial, desc: t.landingFeatureSocialDesc },
    { icon: Shield, title: t.landingFeaturePrivacy, desc: t.landingFeaturePrivacyDesc },
    { icon: Leaf, title: t.landingFeatureMulti, desc: t.landingFeatureMultiDesc },
  ];

  const steps = [
    { num: "1", title: t.landingStep1, desc: t.landingStep1Desc },
    { num: "2", title: t.landingStep2, desc: t.landingStep2Desc },
    { num: "3", title: t.landingStep3, desc: t.landingStep3Desc },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-6"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Heart className="h-8 w-8 text-primary" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl max-w-2xl"
        >
          {t.landingHeroLine1}{" "}
          <span className="text-primary">{t.landingHeroLine2}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-5 max-w-lg text-base sm:text-lg text-muted-foreground leading-relaxed"
        >
          {t.landingHeroSubtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row gap-3"
        >
          <Button
            size="lg"
            onClick={() => navigate("/survey")}
            className="rounded-2xl px-8 text-base font-semibold gap-2"
          >
            {t.landingCTA}
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="rounded-2xl px-8 text-base"
          >
            {t.landingLearnMore}
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-4 text-sm text-muted-foreground"
        >
          {t.haveAccount}{" "}
          <button
            onClick={() => navigate("/auth")}
            className="text-primary hover:underline font-medium"
          >
            {t.logIn}
          </button>
        </motion.p>

        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[500px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Trust banner */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-2xl px-6 pb-12 text-center"
      >
        <p className="rounded-2xl border border-border bg-card/60 px-6 py-4 text-sm text-muted-foreground leading-relaxed">
          {t.landingTrustBanner}
        </p>
      </motion.section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-5xl px-6 py-12">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-2xl font-bold sm:text-3xl mb-3"
        >
          {t.landingBuiltAround1} <span className="text-primary">{t.landingBuiltAround2}</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center text-muted-foreground mb-12 max-w-md mx-auto"
        >
          {t.landingBuiltAroundDesc}
        </motion.p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-2xl font-bold sm:text-3xl mb-12"
        >
          {t.landingSimpleAs1} <span className="text-primary">{t.landingSimpleAs2}</span>
        </motion.h2>

        <div className="space-y-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex gap-5 items-start"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                {step.num}
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-xl rounded-3xl bg-primary/5 border border-primary/10 p-8 sm:p-12 text-center"
        >
          <h2 className="text-2xl font-bold sm:text-3xl mb-3">{t.landingFinalTitle}</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">{t.landingFinalDesc}</p>
          <Button
            size="lg"
            onClick={() => navigate("/survey")}
            className="rounded-2xl px-8 text-base font-semibold gap-2"
          >
            {t.landingBeginNow}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} MyAddiction. {t.landingFooter}</p>
      </footer>
    </div>
  );
};

export default Landing;
