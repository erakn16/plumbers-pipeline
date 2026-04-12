"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useCRMStore } from "@/store/crm-store";
import { useSettingsStore } from "@/store/settings-store";
import { useToast } from "@/components/toast";
import { ArrowLeft, Plus, Trash2, Tag, MessageSquareText, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { EstimateLineItem } from "@/data/estimates";
import { getTaxRateForState } from "@/utils/tax-rates";

export default function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getJobById, updateJob, clients, workers, getInvoicesForJob } = useCRMStore();
  const { setup } = useSettingsStore();
  const { addToast } = useToast();

  const job = getJobById(id);
  const linkedInvoices = job ? getInvoicesForJob(job.id) : [];

  const [form, setForm] = useState({
    title: job?.title || "",
    clientId: job?.clientId || "",
    customerPO: job?.customerPO || "",
    status: job?.status || "open",
    priority: job?.priority || "medium",
    assignedWorkerIds: job?.assignedWorkerIds || ([] as string[]),
    startDate: job?.startDate ? job.startDate.split("T")[0] : "",
    dueDate: job?.dueDate ? job.dueDate.split("T")[0] : "",
    description: job?.description || "",
    address: job?.address || "",
    discount: job?.discount?.toString() || "0",
    notes: job?.notes || "",
  });

  const [lineItems, setLineItems] = useState<EstimateLineItem[]>(
    job?.lineItems?.length ? job.lineItems.map((li: any) => ({ ...li })) : [{ description: "", quantity: 1, unitPrice: 0, tax: 0, taxRate: 0, taxNote: "" }]
  );

  const [activeNoteIdx, setActiveNoteIdx] = useState<number | null>(null);

  if (!job) {
    return <div className="text-center py-20 text-foreground">Job not found</div>;
  }

  const addLineItem = () => {
    let currentRate = 0;
    const stateMatch = form.address.match(/\b([A-Z]{2})\b/);
    if (stateMatch) currentRate = getTaxRateForState(stateMatch[1]);
    setLineItems((prev) => [...prev, { lineType: "", description: "", quantity: 1, unitPrice: 0, tax: 0, taxRate: currentRate, taxNote: "" }]);
  };

  const updateLineItem = (index: number, field: keyof EstimateLineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        updated.tax = updated.quantity * updated.unitPrice * ((updated.taxRate || 0) / 100);
        return updated;
      })
    );
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
    if (activeNoteIdx === index) setActiveNoteIdx(null);
  };

  const subtotal = lineItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);
  const taxTotal = lineItems.reduce((s, li) => s + li.tax, 0);
  const discountAmount = parseFloat(form.discount) || 0;
  const grandTotal = subtotal + taxTotal - discountAmount;

  const handleApplyDiscountPreset = (presetValue: number) => {
    const calculated = subtotal * (presetValue / 100);
    setForm((p) => ({ ...p, discount: calculated.toFixed(2) }));
    addToast(`Applied ${presetValue}% discount.`, "success");
  };

  const toggleWorker = (wId: string) => {
    setForm((prev) => ({
      ...prev,
      assignedWorkerIds: prev.assignedWorkerIds.includes(wId)
        ? prev.assignedWorkerIds.filter((x) => x !== wId)
        : [...prev.assignedWorkerIds, wId],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return addToast("Job title is required.", "error");
    if (!form.clientId) return addToast("Please select a client.", "error");

    updateJob(job.id, {
      title: form.title,
      customerPO: form.customerPO || null,
      clientId: form.clientId,
      status: form.status as any,
      priority: form.priority as any,
      assignedWorkerIds: form.assignedWorkerIds,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : "",
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : "",
      description: form.description,
      address: form.address,
      estimatedCost: grandTotal,
      lineItems: lineItems as any[],
      subtotal,
      taxTotal,
      discount: discountAmount,
      grandTotal,
      notes: form.notes,
    });

    addToast(`Job updated successfully.`, "success");
    router.push(`/app/jobs/${job.id}`);
  };

  const updateField = (key: string, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const activeClients = clients.filter((c) => !c.deletedAt);
  const activeWorkers = workers.filter((w) => !w.deletedAt);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => router.push(`/app/jobs/${job.id}`)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Job
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Job</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border border-border bg-card p-5 rounded-xl">
          <FormField label="Job Title" required>
            <input type="text" value={form.title} onChange={(e) => updateField("title", e.target.value)} required className="form-input" />
          </FormField>
          <FormField label="Client" required>
            <select value={form.clientId} onChange={(e) => updateField("clientId", e.target.value)} required className="form-input">
              <option value="">Select a client...</option>
              {activeClients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Customer PO #">
            <input type="text" value={form.customerPO} onChange={(e) => updateField("customerPO", e.target.value)} className="form-input" />
          </FormField>
          <FormField label="Service Address">
            <input type="text" value={form.address} onChange={(e) => updateField("address", e.target.value)} className="form-input" />
          </FormField>
          <FormField label="Status">
            <select value={form.status} onChange={(e) => updateField("status", e.target.value)} className="form-input">
              <option value="open">Open</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              {job.status === "invoice_created" && <option value="invoice_created">Invoice Created</option>}
            </select>
          </FormField>
          <FormField label="Priority">
            <select value={form.priority} onChange={(e) => updateField("priority", e.target.value)} className="form-input">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </FormField>
          <FormField label="Start Date">
            <input type="date" value={form.startDate} onChange={(e) => updateField("startDate", e.target.value)} className="form-input" />
          </FormField>
          <FormField label="Due Date">
            <input type="date" value={form.dueDate} onChange={(e) => updateField("dueDate", e.target.value)} className="form-input" />
          </FormField>

          {/* Linked Invoices (read-only) */}
          {linkedInvoices.length > 0 && (
            <FormField label="Linked Invoices">
              <div className="space-y-1">
                {linkedInvoices.map((inv) => (
                  <Link key={inv.id} href={`/app/invoices/${inv.id}`} className="text-sm text-primary hover:underline flex items-center gap-1">
                    {inv.invoiceNumber} <ExternalLink className="w-3 h-3" />
                  </Link>
                ))}
              </div>
            </FormField>
          )}
        </div>

        {/* Line Items Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Line Items</h3>
            <button type="button" onClick={addLineItem} className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          <div className="overflow-x-auto border border-border rounded-lg bg-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 border-b border-border text-xs uppercase text-muted-foreground text-left">
                <tr>
                  {(setup?.lineItemTypes ?? []).length > 0 && <th className="px-3 py-2 font-semibold w-32">Type</th>}
                  <th className="px-3 py-2 font-semibold">Description</th>
                  <th className="px-3 py-2 font-semibold w-24">Qty</th>
                  <th className="px-3 py-2 font-semibold w-32">Price ($)</th>
                  <th className="px-3 py-2 font-semibold w-28">Tax (%)</th>
                  <th className="px-3 py-2 font-semibold w-28 text-right">Line Total</th>
                  <th className="px-3 py-2 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lineItems.map((item, idx) => (
                  <tr key={idx} className="group hover:bg-secondary/20 transition-colors">
                    {(setup?.lineItemTypes ?? []).length > 0 && (
                      <td className="p-2 align-top">
                        <select value={item.lineType || ""} onChange={(e) => updateLineItem(idx, "lineType", e.target.value)} className="form-input text-sm">
                          <option value="">--</option>
                          {(setup?.lineItemTypes ?? []).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </td>
                    )}
                    <td className="p-2 align-top">
                      <textarea value={item.description} onChange={(e) => updateLineItem(idx, "description", e.target.value)} className="form-input text-sm min-h-[40px] resize-y" placeholder="Description..." />
                      {activeNoteIdx === idx && (
                        <div className="mt-2 pl-2 border-l-2 border-primary animate-in fade-in zoom-in-95">
                          <input type="text" value={item.taxNote || ""} onChange={(e) => updateLineItem(idx, "taxNote", e.target.value)} className="form-input text-xs py-1" placeholder="Note (e.g. Tax Exempt)" autoFocus />
                        </div>
                      )}
                    </td>
                    <td className="p-2 align-top">
                      <input type="number" min="0" step="1" value={item.quantity} onChange={(e) => updateLineItem(idx, "quantity", parseFloat(e.target.value) || 0)} className="form-input text-sm text-right font-mono" />
                    </td>
                    <td className="p-2 align-top">
                      <input type="number" min="0" step="1" value={item.unitPrice} onChange={(e) => updateLineItem(idx, "unitPrice", parseFloat(e.target.value) || 0)} className="form-input text-sm text-right font-mono" />
                    </td>
                    <td className="p-2 align-top relative">
                      <div className="relative">
                        <input type="number" min="0" step="0.01" value={item.taxRate || 0} onChange={(e) => updateLineItem(idx, "taxRate", parseFloat(e.target.value) || 0)} className="form-input text-sm text-right font-mono pr-7" />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">%</span>
                      </div>
                      <div className="flex justify-end mt-1">
                        <button type="button" onClick={() => setActiveNoteIdx(activeNoteIdx === idx ? null : idx)} className={`text-[10px] font-medium flex items-center gap-1 hover:underline ${item.taxNote ? "text-primary" : "text-muted-foreground"}`}>
                          <MessageSquareText className="w-3 h-3" /> Note
                        </button>
                      </div>
                    </td>
                    <td className="p-2 align-top text-right text-foreground font-mono font-medium pt-4">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                    <td className="p-2 align-top text-center pt-4">
                      <button type="button" onClick={() => removeLineItem(idx)} className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30" disabled={lineItems.length <= 1}>
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mt-6">
            <div className="max-w-sm w-full space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5"><Tag className="w-4 h-4 text-muted-foreground" /> Discount</h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {setup.discountOptions.map((disc) => (
                    <button key={disc.id} type="button" onClick={() => handleApplyDiscountPreset(disc.value)} className="text-[11px] font-medium px-2 py-1 bg-secondary text-foreground hover:bg-primary/10 hover:text-primary rounded-md border border-border transition-colors">
                      {disc.label} ({disc.value}%)
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Fixed $</span>
                  <input type="number" min="0" step="0.01" value={form.discount} onChange={(e) => updateField("discount", e.target.value)} className="form-input text-sm w-32 font-mono" placeholder="0.00" />
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 space-y-2 w-full sm:w-80 ml-auto shadow-sm">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-mono text-foreground font-medium">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span className="font-mono text-foreground font-medium">${taxTotal.toFixed(2)}</span></div>
              {discountAmount > 0 && <div className="flex justify-between text-sm"><span className="text-emerald-600">Discount</span><span className="font-mono text-emerald-600 font-bold">-${discountAmount.toFixed(2)}</span></div>}
              <div className="flex justify-between text-base font-bold border-t border-border pt-3 mt-2"><span className="text-foreground">Grand Total</span><span className="font-mono text-foreground">${grandTotal.toFixed(2)}</span></div>
            </div>
          </div>
        </div>

        {/* Description & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
          <FormField label="Description">
            <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} className="form-input min-h-[120px] resize-y text-sm" />
          </FormField>
          <FormField label="Notes">
            <textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)} className="form-input min-h-[120px] resize-y text-sm" />
          </FormField>
        </div>

        {/* Assigned Workers */}
        {activeWorkers.length > 0 && (
          <div className="border border-border rounded-xl p-4 bg-card/50 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Assign Workers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {activeWorkers.map((w) => (
                <label key={w.id} className="flex items-center gap-2 px-3 py-2 rounded-md border border-border bg-background cursor-pointer hover:bg-secondary/30 transition-colors text-sm">
                  <input type="checkbox" checked={form.assignedWorkerIds.includes(w.id)} onChange={() => toggleWorker(w.id)} className="accent-primary" />
                  <span className="font-medium text-foreground">{w.name}</span>
                  <span className="text-xs text-muted-foreground ml-auto">{w.role}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6">
          <button type="button" onClick={() => router.push(`/app/jobs/${job.id}`)} className="px-5 py-2.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-secondary transition-colors">
            Cancel
          </button>
          <button type="submit" className="px-8 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors active:scale-[0.98]">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, required, helperText, children }: { label: string; required?: boolean; helperText?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-sm font-medium text-foreground inline-flex items-center gap-2">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
        {helperText && <span className="text-xs text-muted-foreground font-normal">{helperText}</span>}
      </label>
      {children}
    </div>
  );
}
