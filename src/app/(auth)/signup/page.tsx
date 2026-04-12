"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/components/auth-provider";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signup, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");

  // Invite token state
  const [inviteMeta, setInviteMeta] = useState<{ email: string; role: string; expired: boolean } | null>(null);
  const [inviteChecked, setInviteChecked] = useState(false);

  useEffect(() => {
    if (!inviteToken) { setInviteChecked(true); return; }
    try {
      // Search across all account settings for this invite token
      const accountsRaw = localStorage.getItem("pp_accounts");
      if (accountsRaw) {
        const accounts = JSON.parse(accountsRaw);
        for (const entry of Object.values(accounts) as Array<{ accountId: string }>) {
          const raw = localStorage.getItem(`pp_settings_${entry.accountId}`);
          if (!raw) continue;
          const parsed = JSON.parse(raw);
          const member = parsed?.teamMembers?.find(
            (m: { inviteToken: string; status: string }) => m.inviteToken === inviteToken && m.status === "pending"
          );
          if (member) {
            const expired = member.inviteExpiry && new Date(member.inviteExpiry) < new Date();
            setInviteMeta({ email: member.email, role: member.role, expired });
            if (!expired) setEmail(member.email);
            break;
          }
        }
      }
    } catch { /* ignore */ }
    setInviteChecked(true);
  }, [inviteToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password) return;
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    const result = await signup(name, email, password, inviteToken || undefined);
    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  if (!inviteChecked) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Expired invite
  if (inviteToken && inviteMeta?.expired) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background p-8">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Invitation Expired</h2>
          <p className="text-muted-foreground">This invitation link has expired. Ask the account owner to send a new invite.</p>
          <Link href="/login" className="inline-block mt-4 text-primary font-medium hover:underline">Go to Login</Link>
        </div>
      </div>
    );
  }

  // Invalid invite
  if (inviteToken && !inviteMeta) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background p-8">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Invalid Invitation</h2>
          <p className="text-muted-foreground">This invitation link is invalid or has already been used.</p>
          <Link href="/login" className="inline-block mt-4 text-primary font-medium hover:underline">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Left Panel */}
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
          {inviteToken && inviteMeta ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-6 h-6 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Invited as {inviteMeta.role}</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight mb-4">You have been invited!</h1>
              <p className="text-zinc-400 text-lg">Create your account to join the workspace and start collaborating.</p>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold tracking-tight mb-4">Leave the spreadsheet behind.</h1>
              <p className="text-zinc-400 text-lg">Create an account today and start managing your plumbing operation from a single, unified dashboard.</p>
            </>
          )}
        </div>
        <div className="relative z-10 text-zinc-500 text-sm font-medium">&copy; {new Date().getFullYear()} Plumbers Pipeline.</div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-24 relative">
        <div className="w-full max-w-sm space-y-8">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="bg-primary/10 p-1.5 rounded-md"><BrandLogo className="w-6 h-6 text-primary" /></div>
            <span className="text-xl font-bold tracking-tight text-foreground">Plumbers<span className="text-primary">Pipeline</span></span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              {inviteToken ? "Accept invitation" : "Create account"}
            </h2>
            <p className="text-muted-foreground">
              {inviteToken ? `Set up your account to join as ${inviteMeta?.role || "a team member"}.` : "Start managing your business effectively."}
            </p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg px-4 py-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground" htmlFor="name">
                {inviteToken ? "Your Full Name" : "Company or Owner Name"}
              </label>
              <input
                id="name" type="text" placeholder={inviteToken ? "John Doe" : "Acme Plumbing"}
                value={name} onChange={(e) => setName(e.target.value)}
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground" htmlFor="email">Email address</label>
              <input
                id="email" type="email" placeholder="name@plumbingco.com"
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                required readOnly={!!inviteToken}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground" htmlFor="password">Password</label>
              <input
                id="password" type="password" placeholder="Minimum 8 characters"
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                required minLength={8}
              />
            </div>

            <button
              type="submit" disabled={isLoading}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full mt-2"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <>{inviteToken ? "Join Workspace" : "Sign Up"} <ArrowRight className="ml-2 w-4 h-4" /></>}
            </button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="font-medium text-primary hover:underline transition-all">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
