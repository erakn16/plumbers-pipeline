"use client";

import { use } from "react";
import { useCRMStore } from "@/store/crm-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { PageHeader } from "@/components/page-header";
import { ArrowLeft, Mail, Phone, MapPin, DollarSign, Briefcase, FileText, Calendar } from "lucide-react";

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getClientById, getJobsForClient, getInvoicesForClient, getEstimatesForClient } = useCRMStore();

  const client = getClientById(id);

  if (!client) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-foreground">Client not found</h2>
        <Link href="/app/clients" className="text-primary text-sm mt-2 inline-block hover:underline">
          Back to Clients
        </Link>
      </div>
    );
  }

  const clientJobs = getJobsForClient(client.id);
  const clientInvoices = getInvoicesForClient(client.id);
  const clientEstimates = getEstimatesForClient(client.id);

  const totalRevenue = clientInvoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.grandTotal, 0);

  const openJobs = clientJobs.filter((j) => j.status !== "completed" && j.status !== "cancelled").length;

  const outstandingBalance = clientInvoices
    .filter((i) => i.status === "sent" || i.status === "overdue" || i.status === "viewed")
    .reduce((s, i) => s + i.grandTotal, 0);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button onClick={() => router.push("/app/clients")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </button>

      {/* Detail Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl uppercase shrink-0">
            {client.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{client.name}</h1>
              <StatusBadge status={client.status} />
            </div>
            {client.company && (
              <p className="text-sm text-muted-foreground mt-0.5">{client.company}</p>
            )}
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {client.email}</span>
              <span className="inline-flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {client.phone}</span>
              {client.addresses?.[0] && <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {client.addresses[0].city}, {client.addresses[0].state}</span>}
            </div>
          </div>
        </div>
        <Link
          href={`/app/clients/${client.id}/edit`}
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.98] shrink-0"
        >
          Edit Client
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={<DollarSign className="w-5 h-5" />} label="Total Revenue" value={`$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} />
        <KPICard icon={<Briefcase className="w-5 h-5" />} label="Open Jobs" value={String(openJobs)} />
        <KPICard icon={<FileText className="w-5 h-5" />} label="Outstanding Balance" value={`$${outstandingBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`} />
        <KPICard icon={<Calendar className="w-5 h-5" />} label="Client Since" value={new Date(client.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })} />
      </div>

      {/* Notes */}
      {client.notes && (
        <div className="border border-border rounded-xl bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">Notes</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{client.notes}</p>
        </div>
      )}

      {/* Jobs */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Jobs ({clientJobs.length})</h3>
          <Link href="/app/jobs" className="text-xs font-medium text-primary hover:underline">View All</Link>
        </div>
        {clientJobs.length === 0 ? (
          <p className="text-sm text-muted-foreground px-5 py-8 text-center">No jobs for this client yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {clientJobs.slice(0, 5).map((job) => (
              <Link key={job.id} href={`/app/jobs/${job.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-secondary/30 transition-colors">
                <div>
                  <span className="text-sm font-medium text-foreground">{job.title}</span>
                  <span className="text-xs text-muted-foreground ml-2">{job.id.replace("job_", "WO-")}</span>
                </div>
                <StatusBadge status={job.status} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Invoices ({clientInvoices.length})</h3>
          <Link href="/app/invoices" className="text-xs font-medium text-primary hover:underline">View All</Link>
        </div>
        {clientInvoices.length === 0 ? (
          <p className="text-sm text-muted-foreground px-5 py-8 text-center">No invoices for this client yet.</p>
        ) : (
          <div className="divide-y divide-border">
            {clientInvoices.slice(0, 5).map((inv) => (
              <Link key={inv.id} href={`/app/invoices/${inv.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-secondary/30 transition-colors">
                <div>
                  <span className="text-sm font-medium text-foreground">{inv.invoiceNumber}</span>
                  <span className="text-xs text-muted-foreground ml-2 font-mono">${inv.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <StatusBadge status={inv.status} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      {client.tags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-muted-foreground">Tags:</span>
          {client.tags.map((tag) => (
            <span key={tag} className="text-xs font-medium bg-secondary text-foreground px-2 py-1 rounded-md">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function KPICard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border border-border bg-card rounded-xl p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <span className="text-xl font-bold text-foreground tracking-tight">{value}</span>
    </div>
  );
}
