"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { ArrowRight, Loader2, Play } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, demoLogin, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return;
    const result = await login(email, password);
    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  const handleDemo = async () => {
    setError("");
    await demoLogin();
  };

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
          <h1 className="text-4xl font-bold tracking-tight mb-4">Every Job. Every Client. One Place.</h1>
          <p className="text-zinc-400 text-lg">
            Log in to manage your operation, schedule jobs, dispatch technicians, and track revenue from a single dashboard.
          </p>
        </div>
        
        <div className="relative z-10 text-zinc-500 text-sm font-medium">
          &copy; {new Date().getFullYear()} Plumbers Pipeline.
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-24 relative">
        <div className="w-full max-w-sm space-y-8">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="bg-primary/10 p-1.5 rounded-md">
              <BrandLogo className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Plumbers<span className="text-primary">Pipeline</span></span>
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-muted-foreground">Enter your credentials to access your dashboard.</p>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-4 py-3 rounded-md font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-foreground" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@plumbingco.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none text-foreground" htmlFor="password">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                required
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
                <>Sign In <ArrowRight className="ml-2 w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-medium">Or</span>
            </div>
          </div>

          <button
            onClick={handleDemo}
            disabled={isLoading}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-border bg-card text-foreground hover:bg-secondary active:scale-[0.98] h-12 w-full"
          >
            <Play className="mr-2 w-4 h-4 text-primary" />
            Try Demo
          </button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <Link href="/signup" className="font-medium text-primary hover:underline transition-all">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
