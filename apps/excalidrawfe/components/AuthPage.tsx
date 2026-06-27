"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BACKEND_URL = "http://localhost:3001";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isSignin ? "/signin" : "/signup";
    const body = isSignin
      ? { email, password }
      : { name, email, password };

    try {
      const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.msg || "Something went wrong.");
        return;
      }

      if (isSignin && data.token) {
        localStorage.setItem("token", data.token);
        router.push("/");
      } else if (!isSignin) {
        router.push("/signin");
      }
    } catch {
      setError("Can't reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream doodle-grid flex flex-col">
      {/* Nav */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-2 group">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
            <rect x="2" y="2" width="28" height="28" rx="4" fill="#6c63ff" stroke="#1a1a2e" strokeWidth="2" />
            <path d="M8 22 L14 10 L20 18 L23 14 L26 18" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="8" cy="22" r="1.5" fill="white" />
          </svg>
          <span className="font-bold text-ink tracking-tight">sketchpad</span>
        </Link>

        <span className="text-sm text-ink/50">
          {isSignin ? (
            <>
              No account?{" "}
              <Link href="/signup" className="text-accent font-semibold hover:underline">
                Sign up free
              </Link>
            </>
          ) : (
            <>
              Already have one?{" "}
              <Link href="/signin" className="text-accent font-semibold hover:underline">
                Sign in
              </Link>
            </>
          )}
        </span>
      </nav>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-up">
          {/* Card */}
          <div className="card-sketchy rounded-2xl p-8 md:p-10 bg-white">
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-[#f0edff] border border-accent/30 rounded-full px-3 py-1 text-xs font-semibold text-accent mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                {isSignin ? "Welcome back" : "Join for free"}
              </div>
              <h1 className="text-2xl font-black text-ink leading-snug">
                {isSignin ? "Sign in to your canvas" : "Create your account"}
              </h1>
              <p className="text-sm text-ink/50 mt-1.5">
                {isSignin
                  ? "Pick up right where you left off."
                  : "Start sketching in seconds. No card needed."}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isSignin && (
                <div>
                  <label htmlFor="auth-name" className="block text-xs font-semibold text-ink/70 mb-1.5 uppercase tracking-wider">
                    Name
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Hritik"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isSignin}
                    className="auth-input"
                  />
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className="block text-xs font-semibold text-ink/70 mb-1.5 uppercase tracking-wider">
                  Email
                </label>
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="auth-input"
                />
              </div>

              <div>
                <label htmlFor="auth-password" className="block text-xs font-semibold text-ink/70 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPass ? "text" : "password"}
                    autoComplete={isSignin ? "current-password" : "new-password"}
                    placeholder={isSignin ? "Your password" : "At least 8 characters"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="auth-input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink/80 transition-colors"
                    tabIndex={-1}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    {showPass ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-sm text-red-700">
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 shrink-0">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                id="auth-submit"
                disabled={loading}
                className="btn-sketch w-full bg-ink text-white font-bold py-3 rounded-lg text-sm mt-2 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    </svg>
                    {isSignin ? "Signing in…" : "Creating account…"}
                  </>
                ) : (
                  <>
                    {isSignin ? "Sign in" : "Create account"}
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M4 10h12M12 4l6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Bottom link */}
            <p className="text-center text-xs text-ink/30 mt-6">
              {isSignin ? "No account? " : "Already have one? "}
              <Link
                href={isSignin ? "/signup" : "/signin"}
                className="text-accent/70 hover:text-accent font-semibold transition-colors"
              >
                {isSignin ? "Sign up →" : "Sign in →"}
              </Link>
            </p>
          </div>

          {/* Decorative squiggles */}
          <div className="flex items-center justify-center gap-6 mt-6 opacity-30 select-none pointer-events-none">
            <svg width="48" height="12" viewBox="0 0 48 12" fill="none">
              <path d="M2 6 Q12 2 24 6 Q36 10 46 6" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <rect x="1" y="1" width="8" height="8" rx="1" stroke="#1a1a2e" strokeWidth="1.5" transform="rotate(12 5 5)" />
            </svg>
            <svg width="48" height="12" viewBox="0 0 48 12" fill="none">
              <path d="M2 6 Q12 10 24 6 Q36 2 46 6" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}