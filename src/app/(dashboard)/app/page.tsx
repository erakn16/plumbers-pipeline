"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import { useCRMStore } from "@/store/crm-store";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Briefcase,
  Users,
  FileText,
  Clock,
  CalendarClock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

export default function DashboardPage() {
  const { user } = useAuth();
  const { clients, jobs, invoices, activity } = useCRMStore();

  // KPI calculations
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const paidThisMonth = invoices.filter(
    (i) => i.status === "paid" && i.paidDate && new Date(i.paidDate).getMonth() === thisMonth && new Date(i.paidDate).getFullYear() === thisYear
  );
  const revenueThisMonth = paidThisMonth.reduce((s, i) => s + i.grandTotal, 0);

  const paidLastMonth = invoices.filter(
    (i) => i.status === "paid" && i.paidDate && new Date(i.paidDate).getMonth() === lastMonth && new Date(i.paidDate).getFullYear() === lastMonthYear
  );
  const revenueLastMonth = paidLastMonth.reduce((s, i) => s + i.grandTotal, 0);
  const revenueTrend = revenueLastMonth > 0 ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth * 100) : 0;

  const openJobs = jobs.filter((j) => !j.deletedAt && j.status !== "completed" && j.status !== "cancelled").length;
  const outstandingTotal = invoices.filter((i) => !i.deletedAt && (i.status === "sent" || i.status === "overdue" || i.status === "viewed")).reduce((s, i) => s + i.grandTotal, 0);

  const newClientsThisMonth = clients.filter(
    (c) => !c.deletedAt && new Date(c.createdAt).getMonth() === thisMonth && new Date(c.createdAt).getFullYear() === thisYear
  ).length;

  // Revenue chart data (last 6 months)
  const revenueChartData = useMemo(() => {
    const months: { name: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const m = new Date(thisYear, thisMonth - i, 1);
      const monthName = m.toLocaleDateString("en-US", { month: "short" });
      const monthRevenue = invoices
        .filter((inv) => inv.status === "paid" && inv.paidDate && new Date(inv.paidDate).getMonth() === m.getMonth() && new Date(inv.paidDate).getFullYear() === m.getFullYear())
        .reduce((s, inv) => s + inv.grandTotal, 0);
      months.push({ name: monthName, revenue: monthRevenue });
    }
    return months;
  }, [invoices, thisMonth, thisYear]);

  // Job status distribution
  const jobStatusData = useMemo(() => {
    const activeJobs = jobs.filter((j) => !j.deletedAt);
    const statusCounts: Record<string, number> = {};
    activeJobs.forEach((j) => {
      statusCounts[j.status] = (statusCounts[j.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [jobs]);

  const statusColors: Record<string, string> = {
    open: "#3b82f6",
    scheduled: "#06b6d4",
    "in-progress": "#f59e0b",
    completed: "#10b981",
    "on-hold": "#f97316",
    cancelled: "#71717a",
  };

  // Invoice aging
  const invoiceAgingData = useMemo(() => {
    const outstanding = invoices.filter((i) => !i.deletedAt && (i.status === "sent" || i.status === "overdue" || i.status === "viewed") && i.dueDate);
    const aging = { current: 0, "1-30": 0, "31-60": 0, "60+": 0 };
    outstanding.forEach((i) => {
      const daysOut = Math.floor((now.getTime() - new Date(i.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      if (daysOut <= 0) aging.current += i.grandTotal;
      else if (daysOut <= 30) aging["1-30"] += i.grandTotal;
      else if (daysOut <= 60) aging["31-60"] += i.grandTotal;
      else aging["60+"] += i.grandTotal;
    });
    return [
      { name: "Current", amount: aging.current },
      { name: "1-30 days", amount: aging["1-30"] },
      { name: "31-60 days", amount: aging["31-60"] },
      { name: "60+ days", amount: aging["60+"] },
    ];
  }, [invoices, now]);

  // Upcoming deadlines (next 7 days)
  const upcomingDeadlines = useMemo(() => {
    const next7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const jobDues = jobs
      .filter((j) => !j.deletedAt && j.dueDate && j.status !== "completed" && j.status !== "cancelled" && new Date(j.dueDate) <= next7)
      .map((j) => ({ type: "job" as const, title: j.title, date: j.dueDate, id: j.id, overdue: new Date(j.dueDate) < now }));
    const invoiceDues = invoices
      .filter((i) => !i.deletedAt && i.dueDate && (i.status === "sent" || i.status === "overdue") && new Date(i.dueDate) <= next7)
      .map((i) => ({ type: "invoice" as const, title: i.invoiceNumber, date: i.dueDate, id: i.id, overdue: new Date(i.dueDate) < now }));
    return [...jobDues, ...invoiceDues].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [jobs, invoices, now]);

  // Recent activity (sorted by timestamp)
  const recentActivity = [...activity].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 12);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back, {user?.name}. Here is what is happening today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Revenue (This Month)"
          value={`$${revenueThisMonth.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          trend={`${revenueTrend >= 0 ? "+" : ""}${revenueTrend.toFixed(1)}%`}
          isPositive={revenueTrend >= 0}
          icon={<DollarSign className="w-5 h-5 text-muted-foreground" />}
        />
        <KPICard
          title="Open Jobs"
          value={String(openJobs)}
          trend={`${openJobs} active`}
          isPositive={true}
          icon={<Briefcase className="w-5 h-5 text-muted-foreground" />}
        />
        <KPICard
          title="Outstanding Invoices"
          value={`$${outstandingTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          trend={`${invoices.filter((i) => i.status === "overdue" && !i.deletedAt).length} overdue`}
          isPositive={false}
          icon={<FileText className="w-5 h-5 text-muted-foreground" />}
        />
        <KPICard
          title="New Clients (This Month)"
          value={String(newClientsThisMonth)}
          trend="this month"
          isPositive={true}
          icon={<Users className="w-5 h-5 text-muted-foreground" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 border border-border bg-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Revenue (6 Months)</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066FF" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#71717a" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#71717a" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, "Revenue"]} contentStyle={{ borderRadius: "8px", border: "1px solid #e4e4e7", fontSize: "12px" }} />
                <Area type="monotone" dataKey="revenue" stroke="#0066FF" strokeWidth={2} fillOpacity={1} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Job Status Donut */}
        <div className="border border-border bg-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Job Status Breakdown</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={jobStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50} paddingAngle={2}>
                  {jobStatusData.map((entry) => (
                    <Cell key={entry.name} fill={statusColors[entry.name] || "#71717a"} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid #e4e4e7", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {jobStatusData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColors[entry.name] || "#71717a" }} />
                <span className="capitalize">{entry.name.replace("-", " ")}</span>
                <span className="font-mono font-semibold text-foreground">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invoice Aging + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Aging */}
        <div className="border border-border bg-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Invoice Aging</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={invoiceAgingData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#71717a" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#71717a" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, "Amount"]} contentStyle={{ borderRadius: "8px", border: "1px solid #e4e4e7", fontSize: "12px" }} />
                <Bar dataKey="amount" fill="#0066FF" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="border border-border bg-card rounded-xl overflow-hidden">
          <div className="p-5 border-b border-border flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Upcoming Deadlines</h3>
          </div>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-sm text-muted-foreground px-5 py-8 text-center">No upcoming deadlines in the next 7 days.</p>
          ) : (
            <div className="divide-y divide-border max-h-[240px] overflow-y-auto">
              {upcomingDeadlines.map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={item.type === "job" ? `/app/jobs/${item.id}` : `/app/invoices/${item.id}`}
                  className={`flex items-center justify-between px-5 py-3 hover:bg-secondary/30 transition-colors ${item.overdue ? "bg-red-500/5" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    {item.type === "job" ? <Briefcase className="w-3.5 h-3.5 text-muted-foreground" /> : <FileText className="w-3.5 h-3.5 text-muted-foreground" />}
                    <span className={`text-sm font-medium ${item.overdue ? "text-destructive" : "text-foreground"}`}>{item.title}</span>
                  </div>
                  <span className={`text-xs font-mono ${item.overdue ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                    {item.overdue ? "OVERDUE" : new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="border border-border bg-card rounded-xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
          </div>
        </div>
        <div className="divide-y divide-border">
          {recentActivity.map((entry) => (
            <div key={entry.id} className="flex items-start gap-3 px-5 py-3">
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground uppercase shrink-0 mt-0.5">
                {entry.userName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{entry.description}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{entry.userName} - {formatRelativeTime(entry.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, trend, isPositive, icon }: { title: string; value: string; trend: string; isPositive: boolean; icon: React.ReactNode }) {
  return (
    <div className="border border-border bg-card rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</h3>
        <div className="p-2 bg-secondary rounded-lg">{icon}</div>
      </div>
      <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
      <div className="mt-1.5 flex items-center gap-1 text-xs font-medium">
        {isPositive ? (
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <ArrowDownRight className="w-3.5 h-3.5 text-destructive" />
        )}
        <span className={isPositive ? "text-emerald-500" : "text-destructive"}>{trend}</span>
      </div>
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
