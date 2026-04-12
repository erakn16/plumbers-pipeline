"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import { useCRMStore } from "@/store/crm-store";
import { useSettingsStore } from "@/store/settings-store";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  HardHat,
  FileText,
  FileSpreadsheet,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Loader2,
  Bell,
  Search,
  ChevronDown,
  ArrowRight,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ToastProvider } from "@/components/toast";
import { SettingsPanel } from "@/components/settings-panel";

type BadgeInfo = { count: number; color: "yellow" | "red" };

type NavItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
  badges?: BadgeInfo[];
};

function useNavItems(): NavItem[] {
  const { jobs, invoices } = useCRMStore();

  return useMemo(() => {
    const now = new Date();
    const openJobs = jobs.filter((j) => !j.deletedAt && ["open", "scheduled", "in-progress", "on-hold"].includes(j.status)).length;
    const overdueJobs = jobs.filter((j) => !j.deletedAt && j.dueDate && j.status !== "completed" && j.status !== "cancelled" && new Date(j.dueDate) < now).length;

    const openInvoices = invoices.filter((i) => !i.deletedAt && ["sent", "viewed"].includes(i.status)).length;
    const overdueInvoices = invoices.filter((i) => !i.deletedAt && i.status === "overdue").length;

    const jobBadges: BadgeInfo[] = [];
    if (openJobs > 0) jobBadges.push({ count: openJobs, color: "yellow" });
    if (overdueJobs > 0) jobBadges.push({ count: overdueJobs, color: "red" });

    const invBadges: BadgeInfo[] = [];
    if (openInvoices > 0) invBadges.push({ count: openInvoices, color: "yellow" });
    if (overdueInvoices > 0) invBadges.push({ count: overdueInvoices, color: "red" });

    return [
      { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/app" },
      { label: "Clients", icon: <Users className="w-5 h-5" />, path: "/app/clients" },
      { label: "Jobs", icon: <Briefcase className="w-5 h-5" />, path: "/app/jobs", badges: jobBadges },
      { label: "Workers", icon: <HardHat className="w-5 h-5" />, path: "/app/workers" },
      { label: "Invoices", icon: <FileText className="w-5 h-5" />, path: "/app/invoices", badges: invBadges },
      { label: "Estimates", icon: <FileSpreadsheet className="w-5 h-5" />, path: "/app/estimates" },
    ];
  }, [jobs, invoices]);
}

function BadgePill({ badge }: { badge: BadgeInfo }) {
  const bg = badge.color === "red" ? "bg-red-500" : "bg-amber-500";
  return (
    <span className={`${bg} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center`}>
      {badge.count}
    </span>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const primaryNav = useNavItems();

  // Initialize per-account stores
  useEffect(() => {
    if (!user) return;
    const accountId = user.accountId || user.id;
    const isTestAccount = accountId === "usr_admin_01" || accountId === "usr_demo";

    // Initialize CRM store for this account
    useCRMStore.getState().initializeForAccount(accountId);

    // Initialize settings store for this account
    useSettingsStore.getState().initializeForAccount(
      accountId,
      user.email,
      user.name,
      isTestAccount
    );
  }, [user]);

  // Apply appearance settings on mount / account change
  useEffect(() => {
    if (!user) return;
    const accountId = user.accountId || user.id;
    try {
      const raw = localStorage.getItem(`pp_settings_${accountId}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        const appearance = parsed?.appearance;
        if (appearance) {
          const root = document.documentElement;
          // Theme
          root.classList.remove("dark");
          if (appearance.theme === "dark") {
            root.classList.add("dark");
          } else if (appearance.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
            root.classList.add("dark");
          }
          // Density
          root.setAttribute("data-density", appearance.density || "comfortable");
          // Animations
          root.setAttribute("data-reduce-motion", String(!appearance.animationsEnabled));
          // Sidebar default
          if (appearance.sidebarDefault === "collapsed") setCollapsed(true);
        }
      }
    } catch { /* ignore */ }
  }, [user]);

  // Persist sidebar collapse state
  useEffect(() => {
    const stored = localStorage.getItem("pp_sidebar_collapsed");
    if (stored === "true") setCollapsed(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("pp_sidebar_collapsed", String(collapsed));
  }, [collapsed]);

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Ctrl+K keyboard shortcut for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="font-medium animate-pulse">Authenticating session...</p>
        </div>
      </div>
    );
  }

  const isActive = (path: string) => {
    if (path === "/app") return pathname === "/app";
    return pathname.startsWith(path);
  };

  // Get page title from pathname
  const getPageTitle = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 1) return "Dashboard";
    const page = segments[1];
    return page.charAt(0).toUpperCase() + page.slice(1);
  };

  // Get breadcrumbs
  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length <= 1) return [];
    const crumbs: { label: string; path: string }[] = [
      { label: "Dashboard", path: "/app" },
    ];
    let buildPath = "/app";
    for (let i = 1; i < segments.length; i++) {
      buildPath += "/" + segments[i];
      const label = segments[i].charAt(0).toUpperCase() + segments[i].slice(1);
      crumbs.push({ label, path: buildPath });
    }
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <ToastProvider>
      <div className="min-h-[100dvh] flex bg-zinc-50 dark:bg-zinc-950">
        {/* Sidebar - Desktop */}
        <aside
          className={`hidden md:flex flex-col border-r border-border bg-card transition-all duration-200 ${
            collapsed ? "w-[60px]" : "w-60"
          }`}
        >
          {/* Workspace Header */}
          <div className="h-16 flex items-center px-4 border-b border-border shrink-0">
            <Link
              href="/app"
              className="flex items-center gap-2 text-foreground font-bold group overflow-hidden"
            >
              <div className="bg-primary/10 p-1.5 rounded group-hover:bg-primary/20 transition-colors shrink-0">
                <BrandLogo className="w-5 h-5 text-primary" />
              </div>
              {!collapsed && (
                <span className="tracking-tight whitespace-nowrap text-sm">
                  Plumbers<span className="text-primary">Pipeline</span>
                </span>
              )}
            </Link>
          </div>

          {/* Primary Navigation */}
          <div className="flex-1 overflow-y-auto py-3 px-2">
            <nav className="space-y-0.5">
              {primaryNav.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    } ${collapsed ? "justify-center px-0" : ""}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badges && item.badges.length > 0 && (
                          <span className="flex items-center gap-1">
                            {item.badges.map((b, i) => <BadgePill key={i} badge={b} />)}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-border p-2 space-y-0.5">
            <button
              onClick={() => setSettingsOpen(true)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-left ${collapsed ? "justify-center px-0" : ""}`}
              title={collapsed ? "Settings" : undefined}
            >
              <Settings className="w-5 h-5 shrink-0" />
              {!collapsed && <span>Settings</span>}
            </button>
            <button
              onClick={logout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors text-left ${collapsed ? "justify-center px-0" : ""}`}
              title={collapsed ? "Sign out" : undefined}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!collapsed && <span>Sign out</span>}
            </button>

            {/* User Info */}
            {!collapsed && (
              <div className="flex items-center gap-3 px-3 py-2 mt-1">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase text-xs shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-semibold truncate text-foreground">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
            )}

            {/* Collapse Toggle */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="w-full flex items-center justify-center py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {collapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-card border-r border-border flex flex-col shadow-xl">
              <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                <Link
                  href="/app"
                  className="flex items-center gap-2 text-foreground font-bold"
                >
                  <BrandLogo className="w-5 h-5 text-primary" />
                  <span className="tracking-tight text-sm">
                    Plumbers<span className="text-primary">Pipeline</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 hover:bg-secondary rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-3 px-2">
                <nav className="space-y-0.5">
                  {primaryNav.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        {item.icon}
                        <span className="flex-1">{item.label}</span>
                        {item.badges && item.badges.length > 0 && (
                          <span className="flex items-center gap-1">
                            {item.badges.map((b, i) => <BadgePill key={i} badge={b} />)}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="border-t border-border p-3 space-y-0.5">
                <button
                  onClick={() => { setMobileOpen(false); setSettingsOpen(true); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-left"
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </button>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign out</span>
                </button>
                <div className="flex items-center gap-3 px-3 py-2 mt-1">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold truncate">{user.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Topbar */}
          <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-border bg-card sticky top-0 z-40">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden p-2 hover:bg-secondary rounded-md -ml-2"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Mobile logo */}
              <Link
                href="/app"
                className="flex md:hidden items-center gap-2 text-foreground font-bold"
              >
                <BrandLogo className="w-5 h-5 text-primary" />
              </Link>

              {/* Desktop breadcrumbs */}
              <div className="hidden md:flex items-center gap-1 text-sm">
                {breadcrumbs.length > 0 ? (
                  breadcrumbs.map((crumb, i) => (
                    <span key={crumb.path} className="flex items-center gap-1">
                      {i > 0 && <span className="text-muted-foreground/40">/</span>}
                      {i === breadcrumbs.length - 1 ? (
                        <span className="font-semibold text-foreground">{crumb.label}</span>
                      ) : (
                        <Link
                          href={crumb.path}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {crumb.label}
                        </Link>
                      )}
                    </span>
                  ))
                ) : (
                  <span className="font-semibold text-foreground">{getPageTitle()}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search hint */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-secondary/60 border border-border rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Search className="w-4 h-4" />
                <span>Search...</span>
                <kbd className="ml-2 text-[10px] font-mono bg-secondary px-1.5 py-0.5 rounded border border-border">
                  Ctrl+K
                </kbd>
              </button>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-secondary rounded-md transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </button>

              {/* User avatar dropdown */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 hover:bg-secondary rounded-md transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold uppercase text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-10 z-40 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[180px]">
                      <div className="px-3 py-2 border-b border-border">
                        <p className="text-sm font-semibold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { setUserMenuOpen(false); setSettingsOpen(true); }}
                        className="block w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                      >
                        Settings
                      </button>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Demo Banner */}
          {user.id === "usr_demo" && (
            <div className="bg-primary/10 border-b border-primary/20 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 relative shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <p className="text-sm text-foreground font-medium mb-0">You are viewing a demo account. Any changes will not be permanently saved.</p>
              </div>
              <Link href="/signup" className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-bold text-center hover:bg-primary/90 transition-colors shrink-0 shadow-sm">
                Sign up now
              </Link>
            </div>
          )}


          {/* Page Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6 lg:p-8 max-w-screen-xl mx-auto w-full">
              {children}
            </div>
          </div>
        </main>

        {/* Settings Overlay Panel */}
        <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        {/* Command Palette Search */}
        <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
    </ToastProvider>
  );
}

// ─── Command Palette Search ─────────────────────────────────────────────────────
function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { clients, jobs, invoices, estimates, workers } = useCRMStore();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  type SearchResult = { label: string; sublabel: string; href: string; category: string; icon: React.ReactNode };

  const results = useMemo((): SearchResult[] => {
    if (!query.trim()) {
      // Show pages by default
      return [
        { label: "Dashboard", sublabel: "Overview and KPIs", href: "/app", category: "Pages", icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: "Clients", sublabel: "Manage customers", href: "/app/clients", category: "Pages", icon: <Users className="w-4 h-4" /> },
        { label: "Jobs", sublabel: "Work orders and schedules", href: "/app/jobs", category: "Pages", icon: <Briefcase className="w-4 h-4" /> },
        { label: "Workers", sublabel: "Team members", href: "/app/workers", category: "Pages", icon: <HardHat className="w-4 h-4" /> },
        { label: "Invoices", sublabel: "Billing and payments", href: "/app/invoices", category: "Pages", icon: <FileText className="w-4 h-4" /> },
        { label: "Estimates", sublabel: "Quotes and proposals", href: "/app/estimates", category: "Pages", icon: <FileSpreadsheet className="w-4 h-4" /> },
      ];
    }

    const q = query.toLowerCase();
    const out: SearchResult[] = [];

    // Pages
    const pages = [
      { label: "Dashboard", href: "/app", icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: "Clients", href: "/app/clients", icon: <Users className="w-4 h-4" /> },
      { label: "Jobs", href: "/app/jobs", icon: <Briefcase className="w-4 h-4" /> },
      { label: "Workers", href: "/app/workers", icon: <HardHat className="w-4 h-4" /> },
      { label: "Invoices", href: "/app/invoices", icon: <FileText className="w-4 h-4" /> },
      { label: "Estimates", href: "/app/estimates", icon: <FileSpreadsheet className="w-4 h-4" /> },
      { label: "New Job", href: "/app/jobs/new", icon: <Briefcase className="w-4 h-4" /> },
      { label: "New Client", href: "/app/clients/new", icon: <Users className="w-4 h-4" /> },
      { label: "New Invoice", href: "/app/invoices/new", icon: <FileText className="w-4 h-4" /> },
      { label: "New Estimate", href: "/app/estimates/new", icon: <FileSpreadsheet className="w-4 h-4" /> },
      { label: "Add Worker", href: "/app/workers/new", icon: <HardHat className="w-4 h-4" /> },
    ];
    pages.filter((p) => p.label.toLowerCase().includes(q)).forEach((p) => {
      out.push({ ...p, sublabel: "Page", category: "Pages" });
    });

    // Clients
    clients.filter((c) => !c.deletedAt && (c.name.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))).slice(0, 5).forEach((c) => {
      out.push({ label: c.name, sublabel: c.company || c.email, href: `/app/clients/${c.id}`, category: "Clients", icon: <Users className="w-4 h-4" /> });
    });

    // Jobs
    jobs.filter((j) => !j.deletedAt && (j.title.toLowerCase().includes(q) || j.id.replace("job_0", "WO-80").replace("job_", "WO-8").toLowerCase().includes(q))).slice(0, 5).forEach((j) => {
      out.push({ label: j.title, sublabel: j.id.replace("job_0", "WO-80").replace("job_", "WO-8"), href: `/app/jobs/${j.id}`, category: "Jobs", icon: <Briefcase className="w-4 h-4" /> });
    });

    // Invoices
    invoices.filter((i) => !i.deletedAt && (i.invoiceNumber.toLowerCase().includes(q) || i.id.toLowerCase().includes(q))).slice(0, 5).forEach((i) => {
      out.push({ label: i.invoiceNumber, sublabel: `$${i.grandTotal.toFixed(2)} - ${i.status}`, href: `/app/invoices/${i.id}`, category: "Invoices", icon: <FileText className="w-4 h-4" /> });
    });

    // Estimates
    estimates.filter((e) => !e.deletedAt && (e.estimateNumber.toLowerCase().includes(q) || e.id.toLowerCase().includes(q))).slice(0, 5).forEach((e) => {
      out.push({ label: e.estimateNumber, sublabel: `$${e.grandTotal.toFixed(2)} - ${e.status}`, href: `/app/estimates/${e.id}`, category: "Estimates", icon: <FileSpreadsheet className="w-4 h-4" /> });
    });

    // Workers
    workers.filter((w) => !w.deletedAt && (w.name.toLowerCase().includes(q) || w.role.toLowerCase().includes(q))).slice(0, 5).forEach((w) => {
      out.push({ label: w.name, sublabel: w.role, href: `/app/workers/${w.id}`, category: "Workers", icon: <HardHat className="w-4 h-4" /> });
    });

    return out;
  }, [query, clients, jobs, invoices, estimates, workers]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      router.push(results[selectedIndex].href);
      onClose();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  // Group results by category
  const grouped: Record<string, SearchResult[]> = {};
  results.forEach((r) => {
    if (!grouped[r.category]) grouped[r.category] = [];
    grouped[r.category].push(r);
  });

  let flatIdx = 0;

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-lg mx-auto mt-[15vh]">
        <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="w-5 h-5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search pages, clients, invoices, jobs..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
            />
            <kbd className="text-[10px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border">ESC</kbd>
          </div>

          {/* Results */}
          <div className="max-h-[360px] overflow-y-auto py-2">
            {results.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">No results found.</div>
            ) : (
              Object.entries(grouped).map(([category, items]) => {
                return (
                  <div key={category}>
                    <div className="px-4 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{category}</div>
                    {items.map((item) => {
                      const idx = flatIdx++;
                      const isSelected = idx === selectedIndex;
                      return (
                        <button
                          key={item.href + item.label}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${isSelected ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary/50"}`}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          onClick={() => { router.push(item.href); onClose(); }}
                        >
                          <span className="shrink-0 text-muted-foreground">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{item.label}</div>
                            <div className="text-xs text-muted-foreground truncate">{item.sublabel}</div>
                          </div>
                          {isSelected && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground">
            <span><kbd className="font-mono bg-secondary px-1 py-0.5 rounded border border-border">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono bg-secondary px-1 py-0.5 rounded border border-border">↵</kbd> open</span>
            <span><kbd className="font-mono bg-secondary px-1 py-0.5 rounded border border-border">esc</kbd> close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
