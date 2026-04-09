import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Heart, Shield, TrendingDown, Users, BarChart3, Brain, ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const features = [
  {
    icon: TrendingDown,
    title: "Track Your Progress",
    desc: "Watch your streak grow day by day. See exactly how far you've come — in time, money saved, and health recovered.",
  },
  {
    icon: Brain,
    title: "Personalized Approach",
    desc: "Quit cold turkey or reduce gradually — your journey, your pace. We tailor the experience to what works for you.",
  },
  {
    icon: BarChart3,
    title: "Health Insights",
    desc: "Log mood, cravings, and vitals. Visualize how your body and mind heal over time with simple, clear charts.",
  },
  {
    icon: Users,
    title: "Support Network",
    desc: "Connect with friends on the same path. Encourage each other and celebrate milestones together.",
  },
  {
    icon: Shield,
    title: "Completely Private",
    desc: "Your data belongs to you. We never share your information. This is a safe, judgement-free space.",
  },
  {
    icon: Leaf,
    title: "Multiple Addictions",
    desc: "Cigarettes, vaping, alcohol, and more. Track everything in one place, each on its own timeline.",
  },
];

const Landing = () => {
  const navigate = useNavigate();

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
          Every journey starts{" "}
          <span className="text-primary">with one step</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-5 max-w-lg text-base sm:text-lg text-muted-foreground leading-relaxed"
        >
          MyAddiction is your private, gentle companion for quitting — or
          reducing — the habits that hold you back. No pressure, no judgement.
          Just you, moving forward at your own pace.
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
            Start Your Journey
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
            Learn More
          </Button>
        </motion.div>

        {/* Soft gradient glow */}
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
          🤍 You don't need to be "ready." You just need to be curious enough to try.
          This app is built for real people — with real struggles and real courage.
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
          Built around <span className="text-primary">you</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center text-muted-foreground mb-12 max-w-md mx-auto"
        >
          Tools that adapt to your journey — whether you're quitting today or
          taking it one step at a time.
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
              <p className="text-sm text-muted-foreground leading-relaxed">
                {f.desc}
              </p>
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
          Simple as <span className="text-primary">1 – 2 – 3</span>
        </motion.h2>

        <div className="space-y-8">
          {[
            { num: "1", title: "Tell us about yourself", desc: "A short, friendly survey helps us understand your habits and goals — no medical forms, just honest questions." },
            { num: "2", title: "Set your pace", desc: "Choose to quit cold turkey, use patches or gum, or reduce gradually. We'll set everything up for you." },
            { num: "3", title: "Watch yourself grow", desc: "Track your streak, log your mood, celebrate milestones, and see the money you're saving — all in real time." },
          ].map((step, i) => (
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
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
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
          <h2 className="text-2xl font-bold sm:text-3xl mb-3">
            You deserve this
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            It's free to start, completely private, and you can go at your own
            speed. There's nothing to lose — and everything to gain.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/survey")}
            className="rounded-2xl px-8 text-base font-semibold gap-2"
          >
            Begin Now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} MyAddiction. Built with care, for people who care.</p>
      </footer>
    </div>
  );
};

export default Landing;
