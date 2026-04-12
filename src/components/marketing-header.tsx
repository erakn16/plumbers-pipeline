"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { useAuth } from "@/components/auth-provider";

export function MarketingHeader() {
  const { user } = useAuth();
  
  return (
    <header className="fixed top-0 inset-x-0 h-20 border-b border-border/40 bg-background/80 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-primary/10 p-1.5 rounded-md group-hover:bg-primary/20 transition-colors">
            <BrandLogo className="w-7 h-7 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">Plumbers<span className="text-primary">Pipeline</span></span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
          <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Platform</Link>
          <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
        </nav>
        
        <div className="flex items-center gap-4">
          {user ? (
            <Link 
              href="/app" 
              className="hidden md:inline-flex bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-medium text-sm shadow-sm hover:bg-primary/90 transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden md:block font-medium text-sm text-foreground hover:text-primary transition-colors">
                Log in
              </Link>
              <Link 
                href="/signup" 
                className="hidden md:inline-flex bg-foreground text-background px-5 py-2.5 rounded-md font-medium text-sm shadow-sm hover:bg-foreground/90 transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
          <button className="md:hidden p-2 text-foreground">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
