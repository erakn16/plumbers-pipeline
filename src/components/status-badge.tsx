"use client";

const statusColors: Record<string, string> = {
  // Common
  active: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  inactive: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  lead: "bg-blue-500/10 text-blue-600 border-blue-500/20",

  // Job statuses
  open: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  scheduled: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  "in-progress": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  "on-hold": "bg-orange-500/10 text-orange-600 border-orange-500/20",
  cancelled: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",

  // Invoice statuses
  draft: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  sent: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  viewed: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  paid: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  overdue: "bg-red-500/10 text-red-600 border-red-500/20",

  // Estimate statuses
  accepted: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  declined: "bg-red-500/10 text-red-600 border-red-500/20",
  expired: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",

  // Priority
  low: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
  medium: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  high: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  urgent: "bg-red-500/10 text-red-600 border-red-500/20",

  // Job field statuses
  "en-route": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "needs-parts": "bg-red-500/10 text-red-600 border-red-500/20",
  "invoice_created": "bg-violet-500/10 text-violet-600 border-violet-500/20",
  "job_created": "bg-violet-500/10 text-violet-600 border-violet-500/20",
};

const statusLabels: Record<string, string> = {
  "in-progress": "In Progress",
  "on-hold": "On Hold",
  "en-route": "En Route",
  "needs-parts": "Needs Parts",
  "invoice_created": "Invoice Created",
  "job_created": "Job Created",
};

export function StatusBadge({ status, className = "" }: { status: string; className?: string }) {
  const colorClass = statusColors[status] || "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
  const label = statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
}
