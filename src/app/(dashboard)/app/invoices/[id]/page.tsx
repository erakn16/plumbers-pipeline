"use client";

import { use } from "react";
import { useCRMStore } from "@/store/crm-store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { ArrowLeft, DollarSign, Calendar, FileText } from "lucide-react";

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getInvoiceById, getClientById, getJobById } = useCRMStore();

  const invoice = getInvoiceById(id);
  if (!invoice) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-foreground">Invoice not found</h2>
        <Link href="/app/invoices" className="text-primary text-sm mt-2 inline-block hover:underline">Back to Invoices</Link>
      </div>
    );
  }

  const client = getClientById(invoice.clientId);
  const job = invoice.jobId ? getJobById(invoice.jobId) : null;

  return (
    <div className="space-y-6">
      <button onClick={() => router.push("/app/invoices")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Invoices
      </button>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">{invoice.invoiceNumber}</h1>
            <StatusBadge status={invoice.status} />
          </div>
          {client && (
            <Link href={`/app/clients/${client.id}`} className="text-sm text-primary hover:underline mt-1 inline-block">{client.name}</Link>
          )}
          {job && (
            <div className="mt-1">
              <Link href={`/app/jobs/${job.id}`} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Job: {job.title}</Link>
            </div>
          )}
        </div>
        <Link href={`/app/invoices/${invoice.id}/edit`} className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.98] shrink-0">
          Edit Invoice
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border border-border bg-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><DollarSign className="w-4 h-4" /><span className="text-xs font-medium">Grand Total</span></div>
          <span className="text-xl font-bold text-foreground font-mono">${invoice.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="border border-border bg-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><Calendar className="w-4 h-4" /><span className="text-xs font-medium">Issue Date</span></div>
          <span className="text-lg font-bold text-foreground">{invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Not issued"}</span>
        </div>
        <div className="border border-border bg-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><Calendar className="w-4 h-4" /><span className="text-xs font-medium">Due Date</span></div>
          <span className="text-lg font-bold text-foreground">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "--"}</span>
        </div>
        <div className="border border-border bg-card rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2"><FileText className="w-4 h-4" /><span className="text-xs font-medium">Terms</span></div>
          <span className="text-lg font-bold text-foreground">{invoice.paymentTerms}</span>
        </div>
      </div>

      {/* Invoice Preview (paper-style) */}
      <div className="bg-white border border-border rounded-xl shadow-sm p-6 md:p-10 max-w-3xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">INVOICE</h2>
            <p className="text-sm text-zinc-500 font-mono mt-1">{invoice.invoiceNumber}</p>
          </div>
          <div className="text-right text-sm text-zinc-600">
            <p className="font-semibold text-zinc-900">Plumbers Pipeline</p>
            <p>Atlanta, GA</p>
          </div>
        </div>

        {client && (
          <div className="mb-8 text-sm text-zinc-600">
            <p className="text-xs uppercase font-semibold text-zinc-400 mb-1">Bill To</p>
            <p className="font-semibold text-zinc-900">{client.name}</p>
            {client.company && <p>{client.company}</p>}
            {client.addresses[0] && (
              <>
                <p>{client.addresses[0].street}</p>
                <p>{client.addresses[0].city}, {client.addresses[0].state} {client.addresses[0].zip}</p>
              </>
            )}
          </div>
        )}

        {/* Line Items Table */}
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
            {invoice.lineItems.map((item, i) => (
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

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-1.5 text-sm">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span className="font-mono">${invoice.subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Tax</span>
              <span className="font-mono">${invoice.taxTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-zinc-600">
                <span>Discount</span>
                <span className="font-mono text-emerald-600">-${invoice.discount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between border-t-2 border-zinc-900 pt-2 font-bold text-zinc-900">
              <span>Total</span>
              <span className="font-mono">${invoice.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-8 pt-4 border-t border-zinc-200">
            <p className="text-xs uppercase font-semibold text-zinc-400 mb-1">Notes</p>
            <p className="text-sm text-zinc-600">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
