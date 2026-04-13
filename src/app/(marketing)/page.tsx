import { MarketingHeader } from "@/components/marketing-header";
import { P5Background } from "@/components/p5-background";
import { 
  ArrowRight, 
  MapPin, 
  Clock, 
  DollarSign,
  ShieldCheck,
  Smartphone,
  Briefcase,
  Wrench
} from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { DemoButton } from "@/components/demo-button";

export default function MarketingPage() {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background selection:bg-primary/30">
      <MarketingHeader />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-zinc-950 text-white min-h-[90vh] flex items-center border-b border-border">
          <P5Background />
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 w-full text-center md:text-left flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-8">

              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] text-white">
                Every Job. <br />
                <span className="text-zinc-500">Every Client.</span> <br />
                <span className="text-primary drop-shadow-[0_0_15px_rgba(0,102,255,0.5)]">One Place.</span>
              </h1>
              
              <p className="text-xl text-zinc-400 max-w-xl mx-auto md:mx-0 leading-relaxed">
                Manage clients, schedule jobs, dispatch techs, send invoices, and track revenue without toggling between four different tools or pulling up last week's notebook.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                <Link 
                  href="/signup" 
                  className="w-full sm:w-auto bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-base hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(0,102,255,0.3)] hover:shadow-[0_0_30px_rgba(0,102,255,0.5)] flex items-center justify-center gap-2"
                >
                  Start Building Your Pipeline <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/login" 
                  className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-zinc-800 transition-colors flex items-center justify-center"
                >
                  Access Dashboard
                </Link>
              </div>
            </div>

            {/* Floating UI Mockup */}
            <div className="flex-1 hidden lg:block perspective-[1000px]">
              <div className="relative w-full aspect-square max-w-[500px] mx-auto transform rotate-y-[-15deg] rotate-x-[15deg] hover:rotate-y-[0deg] hover:rotate-x-[0deg] transition-transform duration-700 ease-out">
                {/* Mockup Base */}
                <div className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                  {/* Mockup Header */}
                  <div className="h-12 border-b border-zinc-800 flex items-center px-4 gap-2 bg-zinc-950">
                    <div className="w-3 h-3 rounded-full bg-destructive/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                  {/* Mockup Content */}
                  <div className="p-6 flex-1 space-y-4">
                    <div className="h-8 w-32 bg-zinc-800 rounded-md"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-zinc-800/50 rounded-lg border border-zinc-800 p-4 flex flex-col gap-2">
                        <div className="h-4 w-16 bg-zinc-700 rounded"></div>
                        <div className="h-8 w-24 bg-zinc-600 rounded"></div>
                      </div>
                      <div className="h-24 bg-primary/10 rounded-lg border border-primary/20 p-4 flex flex-col gap-2">
                        <div className="h-4 w-16 bg-primary/40 rounded"></div>
                        <div className="h-8 w-24 bg-primary/60 rounded"></div>
                      </div>
                    </div>
                    <div className="flex-1 bg-zinc-800/20 border border-zinc-800 rounded-lg p-4 space-y-3">
                      <div className="h-10 border-b border-zinc-800 flex items-center gap-4">
                         <div className="h-4 w-20 bg-zinc-700 rounded"></div>
                         <div className="h-4 w-32 bg-zinc-700 rounded"></div>
                      </div>
                      <div className="h-10 border-b border-zinc-800 flex items-center gap-4">
                         <div className="h-4 w-20 bg-primary/40 rounded"></div>
                         <div className="h-4 w-32 bg-zinc-600 rounded"></div>
                      </div>
                      <div className="h-10 flex items-center gap-4">
                         <div className="h-4 w-20 bg-zinc-700 rounded"></div>
                         <div className="h-4 w-32 bg-zinc-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Asymmetric Bento Grid Section */}
        <section id="features" className="py-24 bg-zinc-50 dark:bg-[#0a0a0c]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16 md:mb-24 text-center max-w-3xl mx-auto">
              <h2 className="text-sm font-black tracking-widest uppercase text-primary mb-4">Industrial Grade Architecture</h2>
              <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
                Built to get out of the way. <br/>
                Designed to scale your legacy.
              </h3>
              <p className="text-lg text-muted-foreground">
                The platform maps to how plumbing businesses actually run: a job comes in, gets scheduled, a tech shows up, work gets done, an invoice goes out. 
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:auto-rows-[300px]">
              
              {/* Feature 1: Large Box */}
              <div className="md:col-span-2 md:row-span-2 rounded-3xl bg-card border border-border p-8 flex flex-col justify-between overflow-hidden relative group shadow-sm hover:shadow-xl transition-shadow duration-500 min-h-[280px] md:min-h-0">
                <div className="absolute top-0 right-0 p-6 opacity-[0.06] group-hover:opacity-[0.15] scale-90 group-hover:scale-100 transition-all duration-700 ease-out">
                  <Wrench className="w-48 h-48 text-primary" strokeWidth={1} />
                </div>
                <div className="z-10 mt-auto">
                  <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="text-xl md:text-2xl font-bold mb-3 text-foreground tracking-tight">Full-Cycle Job Management</h4>
                  <p className="text-muted-foreground max-w-sm">
                    Create jobs from a call or a lead, assign them to a tech, and track status from open through scheduled to complete. Everything carries notes, photos, parts used, and time on-site natively.
                  </p>
                </div>
              </div>

              {/* Feature 2: Standard Box */}
              <div className="md:col-span-2 rounded-3xl bg-card border border-border p-8 flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-xl transition-shadow duration-500 min-h-[280px] md:min-h-0">
                <div className="z-10">
                  <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <h4 className="text-xl font-bold mb-2 text-foreground">Invoicing & Payments</h4>
                  <p className="text-muted-foreground text-sm">
                    Generate invoices directly from completed work orders instantly. Track payment status, flag overdue balances automatically.
                  </p>
                </div>
              </div>

              {/* Feature 3: Standard Box */}
              <div className="md:col-span-1 rounded-3xl bg-card border border-border p-8 flex flex-col justify-between group shadow-sm hover:shadow-md transition-shadow duration-300 min-h-[280px] md:min-h-0">
                <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl md:text-base font-bold mb-2 text-foreground">Permit Tracking</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Attach permit numbers & inspections physically to the job record. Not lost in email.
                  </p>
                </div>
              </div>

              {/* Feature 4: Standard Box */}
              <div className="md:col-span-1 rounded-3xl bg-card border border-border p-8 flex flex-col justify-between group shadow-sm hover:shadow-md transition-shadow duration-300 min-h-[280px] md:min-h-0">
                <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-xl md:text-base font-bold mb-2 text-foreground">Field Ready UI</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Techs access details, log components, and mark jobs done straight from mobile.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 bg-background border-t border-border">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-sm font-black tracking-widest uppercase text-primary mb-4">About Plumbers Pipeline</h2>
                <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
                  Built by people who respect the trade.
                </h3>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Most CRM software feels like it was built by Silicon Valley for Silicon Valley. It's bloated, slow, and requires a degree to understand. We took exactly what a plumbing operation actually needs to run—scheduling, dispatch, invoicing, and tracking—and stripped away the rest.
                </p>
                <div className="flex gap-4 items-center mt-8 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-border">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Zero Handoffs</h4>
                    <p className="text-sm text-muted-foreground">You work with one platform from dispatch to dollar.</p>
                  </div>
                </div>
              </div>
              <div className="relative aspect-square md:aspect-video lg:aspect-square bg-zinc-50 dark:bg-zinc-950 rounded-3xl overflow-hidden border border-border shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border border-primary/20 rounded-full animate-[spin_20s_linear_infinite] flex items-center justify-center">
                    <div className="w-32 h-32 border border-primary/40 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite_reverse]">
                       <div className="w-16 h-16 bg-primary/20 rounded-full backdrop-blur-xl border border-primary/50 shadow-[0_0_30px_rgba(0,102,255,0.3)]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-zinc-50 dark:bg-[#0a0a0c] border-t border-border">
          <div className="max-w-7xl mx-auto px-6">
             <div className="text-center max-w-3xl mx-auto mb-16">
               <h2 className="text-sm font-black tracking-widest uppercase text-primary mb-4">Simple Pricing</h2>
               <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
                 No per-user fees. <br />
                 No hidden limits.
               </h3>
               <p className="text-lg text-muted-foreground">
                 We don't penalize you for growing your team. Flat monthly predictable pricing for the entire shop.
               </p>
             </div>
             <div className="max-w-sm mx-auto bg-card rounded-3xl border border-border shadow-xl hover:shadow-2xl transition-shadow overflow-hidden relative">
               <div className="absolute top-0 inset-x-0 h-2 bg-primary"></div>
               <div className="p-8 text-center bg-zinc-100/50 dark:bg-zinc-900/50 border-b border-border">
                 <h4 className="text-2xl font-bold text-foreground mb-2">Platform Access</h4>
                 <div className="text-5xl font-black text-foreground mb-2">$29<span className="text-xl text-muted-foreground font-medium">/mo</span></div>
                 <p className="text-sm text-muted-foreground">Everything you need, unlimited technicians.</p>
               </div>
               <div className="p-8 space-y-4">
                 {[
                   "Unlimited active jobs",
                   "Unlimited technician accounts",
                   "Invoicing & payments",
                   "GPS routing logic",
                   "24/7 Priority Support"
                 ].map((feature, i) => (
                   <div key={i} className="flex items-center gap-3">
                     <div className="bg-primary/20 p-1 rounded-full text-primary">
                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                     </div>
                     <span className="font-medium text-foreground">{feature}</span>
                   </div>
                 ))}
                 <div className="pt-6 mt-6 border-t border-border">
                   <DemoButton className="w-full flex items-center justify-center bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-primary/90 transition-colors" />
                 </div>
               </div>
             </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
              Ready to take your web presence seriously?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
              Flat predictable pricing. Built around your goals. Get off the spreadsheet and into a platform built specifically for the trade.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/signup" className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-zinc-100 transition-colors shadow-xl">
                Create an Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Corporate Footer */}
      <footer className="bg-zinc-950 text-zinc-500 py-12 border-t border-zinc-900">
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
