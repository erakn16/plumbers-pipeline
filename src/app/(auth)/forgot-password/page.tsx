"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, KeyRound, Loader2, Mail } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";

// Client-side password reset (no email backend)
// Searches all account settings to find the email and allows a reset

function findAccountForEmail(email: string): { accountId: string; memberName: string } | null {
  try {
    const accountsRaw = localStorage.getItem("pp_accounts");
    if (!accountsRaw) return null;
    const accounts = JSON.parse(accountsRaw);

    for (const entry of Object.values(accounts) as Array<{ accountId: string; ownerEmail: string }>) {
      const raw = localStorage.getItem(`pp_settings_${entry.accountId}`);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const members = parsed?.teamMembers as Array<{ email: string; name: string; status: string }> | undefined;
      if (!members) continue;
      const member = members.find(
        (m) => m.email.toLowerCase() === email.toLowerCase() && m.status === "active"
      );
      if (member) {
        return { accountId: entry.accountId, memberName: member.name };
      }
    }
  } catch { /* ignore */ }
  return null;
}

function resetPasswordForEmail(email: string, accountId: string, newPassword: string): boolean {
  try {
    const raw = localStorage.getItem(`pp_settings_${accountId}`);
    if (!raw) return false;
    const parsed = JSON.parse(raw);

    // Update passwords map
    const passwords = (parsed.passwords || {}) as Record<string, string>;
    passwords[email.toLowerCase()] = newPassword;
    parsed.passwords = passwords;

    // Update teamMember password
    const members = (parsed.teamMembers || []) as Array<{ email: string; password?: string }>;
    const member = members.find((m) => m.email.toLowerCase() === email.toLowerCase());
    if (member) {
      member.password = newPassword;
    }
    parsed.teamMembers = members;

    localStorage.setItem(`pp_settings_${accountId}`, JSON.stringify(parsed));
    return true;
  } catch {
    return false;
  }
}

type Step = "email" | "reset" | "done";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [memberName, setMemberName] = useState("");

  const handleFindAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) return;

    setIsLoading(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const found = findAccountForEmail(email);
    if (!found) {
      setError("No account found with this email address.");
      setIsLoading(false);
      return;
    }

    setAccountId(found.accountId);
    setMemberName(found.memberName);
    setStep("reset");
    setIsLoading(false);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const success = resetPasswordForEmail(email, accountId, newPassword);
    if (!success) {
      setError("Failed to reset password. Please try again.");
      setIsLoading(false);
      return;
    }

    setStep("done");
    setIsLoading(false);
  };

  const pwStrength = newPassword.length === 0 ? 0 : newPassword.length < 6 ? 1 : newPassword.length < 10 ? 2 : 3;
  const pwLabels = ["", "Weak", "Fair", "Strong"];
  const pwColors = ["", "bg-red-500", "bg-amber-500", "bg-emerald-500"];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Left Panel: Hero Graphic */}
      <div className="hidden md:flex flex-1 flex-col justify-between bg-zinc-950 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500 via-zinc-950 to-transparent"></div>
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/20 p-2 rounded-md group-hover:bg-primary/40 transition-colors">
              <BrandLogo className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">Plumbers<span className="text-primary">Pipeline</span></span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Reset Your Password</h1>
          <p className="text-zinc-400 text-lg">
            No worries. Enter your email and we will help you get back into your account.
          </p>
        </div>

        <div className="relative z-10 text-zinc-500 text-sm font-medium">
          &copy; {new Date().getFullYear()} Plumbers Pipeline.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-24 relative">
        <div className="w-full max-w-sm space-y-8">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="bg-primary/10 p-1.5 rounded-md">
              <BrandLogo className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Plumbers<span className="text-primary">Pipeline</span></span>
          </div>

          {/* Step 1: Enter email */}
          {step === "email" && (
            <>
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Forgot your password?</h2>
                <p className="text-muted-foreground">Enter your email address and we will verify your account.</p>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-md font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleFindAccount} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none text-foreground" htmlFor="reset-email">
                    Email Address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    placeholder="name@plumbingco.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] h-12 w-full mt-2"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>Find My Account <ArrowRight className="ml-2 w-4 h-4" /></>
                  )}
                </button>
              </form>

              <div className="text-center text-sm">
                <Link href="/login" className="inline-flex items-center gap-1 font-medium text-primary hover:underline transition-all">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to login
                </Link>
              </div>
            </>
          )}

          {/* Step 2: Reset password */}
          {step === "reset" && (
            <>
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <KeyRound className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Set new password</h2>
                <p className="text-muted-foreground">
                  Account found for <span className="font-semibold text-foreground">{memberName}</span>. Choose a new password.
                </p>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-md font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none text-foreground" htmlFor="new-password">
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all"
                    required
                    minLength={8}
                    autoFocus
                  />
                  {newPassword.length > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${pwColors[pwStrength]}`} style={{ width: `${(pwStrength / 3) * 100}%` }} />
                      </div>
                      <span className={`text-[10px] font-semibold ${pwStrength >= 3 ? "text-emerald-600" : pwStrength === 2 ? "text-amber-600" : "text-red-600"}`}>{pwLabels[pwStrength]}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none text-foreground" htmlFor="confirm-password">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all"
                    required
                    minLength={8}
                  />
                  {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                    <p className="text-[11px] text-destructive mt-1 font-medium">Passwords do not match.</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] h-12 w-full mt-2"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>Reset Password <ArrowRight className="ml-2 w-4 h-4" /></>
                  )}
                </button>
              </form>

              <div className="text-center text-sm">
                <button
                  onClick={() => { setStep("email"); setError(""); setNewPassword(""); setConfirmPassword(""); }}
                  className="inline-flex items-center gap-1 font-medium text-primary hover:underline transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Use a different email
                </button>
              </div>
            </>
          )}

          {/* Step 3: Success */}
          {step === "done" && (
            <>
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Password reset!</h2>
                <p className="text-muted-foreground">
                  Your password has been updated successfully. You can now sign in with your new password.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] h-12 w-full mt-4"
                >
                  Sign In <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
