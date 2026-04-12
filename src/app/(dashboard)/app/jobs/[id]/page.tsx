"use client";

import { use } from "react";
import { useCRMStore } from "@/store/crm-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { useToast } from "@/components/toast";
import { ArrowLeft, MapPin, Calendar, DollarSign, Users, Clock, FileText } from "lucide-react";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getJobById, getClientById, getInvoicesForJob, workers } = useCRMStore();
  const { addToast } = useToast();

  const job = getJobById(id);
  if (!job) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-foreground">Job not found</h2>
        <Link href="/app/jobs" className="text-primary text-sm mt-2 inline-block hover:underline">Back to Jobs</Link>
      </div>
    );
  }

  const client = getClientById(job.clientId);
  const jobInvoices = getInvoicesForJob(job.id);
  const assignedWorkers = workers.filter((w) => job.assignedWorkerIds.includes(w.id));

  const handleConvertToInvoice = () => {
    if (job.status === "cancelled") {
      return addToast("Cancelled jobs cannot be converted to an invoice.", "error");
    }
    const activeStatuses = ["open", "scheduled", "in-progress", "on-hold", "completed", "invoice_created"];
    if (!activeStatuses.includes(job.status)) {
      return addToast("Only active jobs can be converted to an invoice.", "error");
    }
    router.push(`/app/invoices/new?fromJob=${job.id}`);
  };

  return (
    <div className="space-y-6">
      <button onClick={() => router.push("/app/jobs")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Jobs
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{job.title}</h1>
            {job.jobNumber && <span className="text-base font-mono text-muted-foreground">{job.jobNumber}</span>}
            <StatusBadge status={job.status} />
            <StatusBadge status={job.priority} />
          </div>
          {client && (
            <Link href={`/app/clients/${client.id}`} className="text-sm text-primary hover:underline mt-1 inline-block">{client.name}</Link>
          )}
          <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {job.address}</span>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          {job.status !== "cancelled" && (
            <button
              onClick={handleConvertToInvoice}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-500 transition-colors active:scale-[0.98]"
            >
              <FileText className="w-4 h-4" />
              Create Invoice
            </button>
          )}
          <Link href={`/app/jobs/${job.id}/edit`} className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.98]">
            Edit Job
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-border bg-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><DollarSign className="w-4 h-4" /><span className="text-xs font-medium">Estimated</span></div>
          <span className="text-xl font-bold text-foreground font-mono">{job.estimatedCost > 0 ? `$${job.estimatedCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "--"}</span>
        </div>
        <div className="border border-border bg-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><DollarSign className="w-4 h-4" /><span className="text-xs font-medium">Actual</span></div>
          <span className="text-xl font-bold text-foreground font-mono">{job.actualCost ? `$${job.actualCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "--"}</span>
        </div>
        <div className="border border-border bg-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><Calendar className="w-4 h-4" /><span className="text-xs font-medium">Due Date</span></div>
          <span className="text-xl font-bold text-foreground">{job.dueDate ? new Date(job.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "--"}</span>
        </div>
        <div className="border border-border bg-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><Users className="w-4 h-4" /><span className="text-xs font-medium">Workers</span></div>
          <span className="text-xl font-bold text-foreground">{assignedWorkers.length}</span>
        </div>
      </div>

      {/* Description */}
      <div className="border border-border rounded-xl bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{job.description}</p>
      </div>

      {/* Notes */}
      {job.notes && (
        <div className="border border-border rounded-xl bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">Notes</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{job.notes}</p>
        </div>
      )}

      {/* Assigned Workers */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Assigned Workers ({assignedWorkers.length})</h3>
        </div>
        {assignedWorkers.length === 0 ? (
          <p className="text-sm text-muted-foreground px-5 py-8 text-center">No workers assigned to this job.</p>
        ) : (
          <div className="divide-y divide-border">
            {assignedWorkers.map((w) => (
              <Link key={w.id} href={`/app/workers/${w.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-secondary/30 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold uppercase">{w.name.charAt(0)}</div>
                <div>
                  <span className="text-sm font-medium text-foreground">{w.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{w.role}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Invoices ({jobInvoices.length})</h3>
        </div>
        {jobInvoices.length === 0 ? (
          <p className="text-sm text-muted-foreground px-5 py-8 text-center">No invoices linked to this job.</p>
        ) : (
          <div className="divide-y divide-border">
            {jobInvoices.map((inv) => (
              <Link key={inv.id} href={`/app/invoices/${inv.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-secondary/30 transition-colors">
                <span className="text-sm font-medium text-foreground">{inv.invoiceNumber}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-foreground">${inv.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  <StatusBadge status={inv.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
