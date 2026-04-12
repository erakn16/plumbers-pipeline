"use client";

import { use } from "react";
import { useCRMStore } from "@/store/crm-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { useToast } from "@/components/toast";
import { ArrowLeft, DollarSign, Calendar, FileText, Briefcase } from "lucide-react";

export default function EstimateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getEstimateById, getClientById, getJobById } = useCRMStore();
  const { addToast } = useToast();

  const estimate = getEstimateById(id);
  if (!estimate) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-foreground">Estimate not found</h2>
        <Link href="/app/estimates" className="text-primary text-sm mt-2 inline-block hover:underline">Back to Estimates</Link>
      </div>
    );
  }

  const client = getClientById(estimate.clientId);
  const job = estimate.jobId ? getJobById(estimate.jobId) : null;

  const handleConvertToJob = () => {
    if (estimate.status === "declined") {
      return addToast("Declined estimates cannot be converted to a job.", "error");
    }
    if (estimate.status === "expired") {
      addToast("This estimate is expired. Please review that current pricing is correct before creating a job.", "warning");
    }
    router.push(`/app/jobs/new?fromEstimate=${estimate.id}`);
  };

  return (
    <div className="space-y-6">
      <button onClick={() => router.push("/app/estimates")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Estimates
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">{estimate.estimateNumber}</h1>
            <StatusBadge status={estimate.status} />
          </div>
          {client && <Link href={`/app/clients/${client.id}`} className="text-sm text-primary hover:underline mt-1 inline-block">{client.name}</Link>}
          {job && <div className="mt-1"><Link href={`/app/jobs/${job.id}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Job: {job.title}</Link></div>}
        </div>
        <div className="flex gap-2">
          {estimate.status !== "declined" && !job && (
            <button
              onClick={handleConvertToJob}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-500 transition-colors active:scale-[0.98]"
            >
              <Briefcase className="w-4 h-4" />
              Convert to Job
            </button>
          )}
          <Link href={`/app/estimates/${estimate.id}/edit`} className="inline-flex items-center px-4 py-2 border border-border bg-card text-foreground rounded-md text-sm font-medium hover:bg-secondary transition-colors active:scale-[0.98]">
            Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-border bg-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><DollarSign className="w-4 h-4" /><span className="text-xs font-medium">Total</span></div>
          <span className="text-xl font-bold text-foreground font-mono">${estimate.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="border border-border bg-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><Calendar className="w-4 h-4" /><span className="text-xs font-medium">Valid Until</span></div>
          <span className="text-lg font-bold text-foreground">{new Date(estimate.validUntil).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
        <div className="border border-border bg-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><FileText className="w-4 h-4" /><span className="text-xs font-medium">Created</span></div>
          <span className="text-lg font-bold text-foreground">{new Date(estimate.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
      </div>

      {/* Estimate Preview */}
      <div className="bg-white border border-border rounded-xl shadow-sm p-6 md:p-10 max-w-3xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">ESTIMATE</h2>
            <p className="text-sm text-zinc-500 font-mono mt-1">{estimate.estimateNumber}</p>
          </div>
          <div className="text-right text-sm text-zinc-600">
            <p className="font-semibold text-zinc-900">Plumbers Pipeline</p>
            <p>Atlanta, GA</p>
          </div>
        </div>

        {client && (
          <div className="mb-8 text-sm text-zinc-600">
            <p className="text-xs uppercase font-semibold text-zinc-400 mb-1">Prepared For</p>
            <p className="font-semibold text-zinc-900">{client.name}</p>
            {client.company && <p>{client.company}</p>}
            {client.addresses?.[0] && (
              <>
                <p>{client.addresses[0].street}</p>
                <p>{client.addresses[0].city}, {client.addresses[0].state} {client.addresses[0].zip}</p>
              </>
            )}
          </div>
        )}

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="border-b-2 border-zinc-200 text-xs uppercase text-zinc-500 font-semibold">
              <th className="text-left py-2">Description</th>
              <th className="text-right py-2 w-16">Qty</th>
              <th className="text-right py-2 w-24">Rate</th>
              <th className="text-right py-2 w-20">Tax</th>
              <th className="text-right py-2 w-24">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {estimate.lineItems.map((item, i) => (
              <tr key={i}>
                <td className="py-2.5 text-zinc-800">{item.description}</td>
                <td className="py-2.5 text-right font-mono text-zinc-600">{item.quantity}</td>
                <td className="py-2.5 text-right font-mono text-zinc-600">${item.unitPrice.toFixed(2)}</td>
                <td className="py-2.5 text-right font-mono text-zinc-600">${item.tax.toFixed(2)}</td>
                <td className="py-2.5 text-right font-mono font-semibold text-zinc-800">${(item.quantity * item.unitPrice + item.tax).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 space-y-1.5 text-sm">
            <div className="flex justify-between text-zinc-600"><span>Subtotal</span><span className="font-mono">${estimate.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>
            <div className="flex justify-between text-zinc-600"><span>Tax</span><span className="font-mono">${estimate.taxTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>
            {estimate.discount > 0 && <div className="flex justify-between text-zinc-600"><span>Discount</span><span className="font-mono text-emerald-600">-${estimate.discount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>}
            <div className="flex justify-between border-t-2 border-zinc-900 pt-2 font-bold text-zinc-900"><span>Total</span><span className="font-mono">${estimate.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></div>
          </div>
        </div>

        {estimate.terms && (
          <div className="mt-8 pt-4 border-t border-zinc-200">
            <p className="text-xs uppercase font-semibold text-zinc-400 mb-1">Terms</p>
            <p className="text-sm text-zinc-600">{estimate.terms}</p>
          </div>
        )}
        {estimate.notes && (
          <div className="mt-4">
            <p className="text-xs uppercase font-semibold text-zinc-400 mb-1">Notes</p>
            <p className="text-sm text-zinc-600">{estimate.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
