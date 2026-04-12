import { MarketingHeader } from "@/components/marketing-header";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";

export default function TermsConditionsPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <MarketingHeader />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl font-bold tracking-tight mb-8 text-foreground">Terms & Conditions</h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground space-y-6">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-xl font-semibold text-foreground mt-8">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Plumbers Pipeline platform, you accept and agree to be bound by the terms and provisions of this agreement.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8">2. Use License</h2>
            <p>
              Permission is granted to temporarily utilize the dashboard infrastructure provided by Plumbers Pipeline for the explicit use of managing business operations. This is a license, not a transfer of title.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8">3. Disclaimer</h2>
            <p>
              The materials on this platform are provided on an 'as is' basis. Plumbers Pipeline makes no warranties, expressed or implied, and hereby disclaims all other warranties including, without limitation, implied warranties or conditions of merchantability.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8">4. Limitations</h2>
            <p>
              In no event shall Plumbers Pipeline or its suppliers be liable for any damages arising out of the use or inability to use the materials on the Plumbers Pipeline platform.
            </p>
          </div>
        </div>
      </main>

      {/* Corporate Footer */}
      <footer className="bg-zinc-950 text-zinc-500 py-12 border-t border-zinc-900 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-primary/20 p-2 rounded-md">
              <BrandLogo className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Plumbers<span className="text-primary">Pipeline</span></span>
          </Link>
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Plumbers Pipeline. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms-conditions" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
