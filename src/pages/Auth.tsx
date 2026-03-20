import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Auth = () => {
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) setError(error.message);
    } else {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        setError(error.message);
      } else {
        setConfirmEmail(true);
      }
    }
    setLoading(false);
  };

  if (confirmEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-8 w-full max-w-sm text-center"
        >
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-lg font-semibold text-foreground mb-2">{t.checkEmail}</h2>
          <p className="text-sm text-muted-foreground mb-6">{t.confirmEmailSent}</p>
          <button
            onClick={() => { setConfirmEmail(false); setIsLogin(true); }}
            className="text-sm text-primary hover:underline"
          >
            {t.backToLogin}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="absolute top-4 right-6 z-10">
        <LanguageSwitcher />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
        className="card-elevated p-8 w-full max-w-sm"
      >
        <h1 className="text-2xl font-semibold text-foreground text-center mb-1">MyAddiction</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {isLogin ? t.loginSubtitle : t.signupSubtitle}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder={t.displayName}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
            />
          )}
          <input
            type="email"
            placeholder={t.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
          />
          <input
            type="password"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-2xl bg-secondary px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
          />

          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {loading ? "..." : isLogin ? t.logIn : t.signUp}
          </button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          {isLogin ? t.noAccount : t.haveAccount}{" "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(""); }}
            className="text-primary hover:underline font-medium"
          >
            {isLogin ? t.signUp : t.logIn}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
