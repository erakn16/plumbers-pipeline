import { MarketingHeader } from "@/components/marketing-header";
import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <MarketingHeader />
      
      <main className="flex-1 pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-4xl font-bold tracking-tight mb-8 text-foreground">Privacy Policy</h1>
          
          <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground space-y-6">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <h2 className="text-xl font-semibold text-foreground mt-8">1. Information We Collect</h2>
            <p>
              We collect information that you manually provide us (such as names, emails, and business details) when you register for an account. We also automatically collect telemetry data related to your device and usage patterns to ensure stability of our dashboard.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8">2. How We Use Information</h2>
            <p>
              The data we collect is utilized strictly to provide, maintain, and improve our services. It is used to authenticate your session, process your dashboard configurations, and facilitate job tracking features within the Plumbers Pipeline platform.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8">3. Data Sharing</h2>
            <p>
              We do not sell your personal data. We only share information with third-party service providers who assist us in operating our application, provided those parties agree to keep this information confidential and secure.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8">4. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect against unauthorized access or alteration of your personal information. However, no absolute guarantee of security over the internet can be provided.
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
