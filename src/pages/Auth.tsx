import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/i18n/LanguageContext";
import { lovable } from "@/integrations/lovable/index";


const Auth = () => {
  const { signIn, signUp } = useAuth();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);
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

  const handleOAuth = async (provider: "google" | "apple") => {
    setSsoLoading(provider);
    setError("");
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        setError(result.error.message);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "SSO failed");
    }
    setSsoLoading(null);
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

        <div className="space-y-3 mb-6">
          <button
            onClick={() => handleOAuth("google")}
            disabled={!!ssoLoading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {ssoLoading === "google" ? "..." : t.continueWithGoogle || "Continue with Google"}
          </button>
          <button
            onClick={() => handleOAuth("apple")}
            disabled={!!ssoLoading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            {ssoLoading === "apple" ? "..." : t.continueWithApple || "Continue with Apple"}
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">{t.or || "or"}</span>
          <div className="flex-1 h-px bg-border" />
        </div>

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