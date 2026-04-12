"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCRMStore } from "@/store/crm-store";
import { useSettingsStore } from "@/store/settings-store";
import { useToast } from "@/components/toast";
import { ArrowLeft, Plus, Trash2, Tag, MessageSquareText } from "lucide-react";
import type { InvoiceLineItem } from "@/data/invoices";
import { getTaxRateForState } from "@/utils/tax-rates";
import { formatAddress } from "@/utils/us-states";

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addInvoice, addActivity, updateJob, clients, jobs } = useCRMStore();
  const { setup, getNextNumber } = useSettingsStore();
  const { addToast } = useToast();

  const fromJobId = searchParams.get("fromJob");
  const sourceJob = fromJobId ? jobs.find((j) => j.id === fromJobId) : null;

  const [form, setForm] = useState({
    clientId: sourceJob?.clientId || "",
    customerPO: sourceJob?.customerPO || "",
    serviceAddressId: "",
    serviceAddressCustom: sourceJob?.address || "",
    jobId: sourceJob?.id || "",
    status: "draft" as "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled",
    issueDate: "",
    dueDate: "",
    paymentTerms: setup.paymentOptions[0] || "Due on Receipt",
    notes: "",
  });

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(
    sourceJob?.lineItems?.length
      ? sourceJob.lineItems.map((li: any) => ({
          lineType: li.lineType || "",
          description: li.description,
          quantity: li.quantity,
          unitPrice: li.unitPrice,
          tax: li.tax,
          taxRate: li.taxRate || 0,
          taxNote: li.taxNote || "",
        }))
      : [{ lineType: "", description: "", quantity: 1, unitPrice: 0, tax: 0, taxRate: 0, taxNote: "" }]
  );

  const [activeNoteIdx, setActiveNoteIdx] = useState<number | null>(null);

  // ─── Discount state ──────────────────────────────────────────────────
  const [discountMode, setDiscountMode] = useState<"none" | "percent" | "fixed">(
    sourceJob?.discount ? "fixed" : "none"
  );
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [activePresetPercent, setActivePresetPercent] = useState(0);
  const [fixedDiscount, setFixedDiscount] = useState(sourceJob?.discount?.toString() || "");

  // ─── Client addresses ────────────────────────────────────────────────
  const activeClients = clients.filter((c) => !c.deletedAt);
  const activeJobs = jobs.filter((j) => !j.deletedAt);
  const selectedClient = form.clientId ? activeClients.find(c => c.id === form.clientId) : null;
  const clientAddresses = selectedClient?.addresses ?? [];

  const resolvedServiceAddress = useMemo(() => {
    if (form.serviceAddressId === "__custom__") return form.serviceAddressCustom;
    const addr = clientAddresses.find(a => a.id === form.serviceAddressId);
    return addr ? formatAddress(addr) : form.serviceAddressCustom;
  }, [form.serviceAddressId, form.serviceAddressCustom, clientAddresses]);

  const currentStateCode = useMemo(() => {
    if (form.serviceAddressId === "__custom__") {
      const match = form.serviceAddressCustom.match(/\b([A-Z]{2})\b/);
      return match ? match[1] : "";
    }
    const addr = clientAddresses.find(a => a.id === form.serviceAddressId);
    return addr?.state || "";
  }, [form.serviceAddressId, form.serviceAddressCustom, clientAddresses]);

  // Auto-fill address when client changes
  useEffect(() => {
    if (sourceJob) return;
    if (!form.clientId) return;
    const client = activeClients.find(c => c.id === form.clientId);
    if (!client?.addresses?.length) return;
    const defaultAddr = client.addresses.find(a => a.isDefault) || client.addresses[0];
    if (defaultAddr) {
      setForm(p => ({ ...p, serviceAddressId: defaultAddr.id }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.clientId]);

  // If from job, set custom address
  useEffect(() => {
    if (sourceJob?.address) {
      setForm(p => ({ ...p, serviceAddressId: "__custom__", serviceAddressCustom: sourceJob.address }));
    }
  }, [sourceJob]);

  // Auto-update tax rates when address changes
  useEffect(() => {
    if (!currentStateCode) return;
    const newRate = getTaxRateForState(currentStateCode);
    setLineItems(prev => prev.map(item => ({
      ...item,
      taxRate: (item.taxRate || 0) === 0 ? newRate : (item.taxRate || 0),
      tax: (item.quantity * item.unitPrice) * (((item.taxRate || 0) === 0 ? newRate : (item.taxRate || 0)) / 100),
    })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStateCode]);

  const addLineItem = () => {
    let currentRate = 0;
    if (currentStateCode) currentRate = getTaxRateForState(currentStateCode);
    setLineItems((prev) => [...prev, { lineType: "", description: "", quantity: 1, unitPrice: 0, tax: 0, taxRate: currentRate, taxNote: "" }]);
  };

  const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: string | number) => {
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

  const discountAmount = useMemo(() => {
    if (discountMode === "percent") return subtotal * (activePresetPercent / 100);
    if (discountMode === "fixed") return parseFloat(fixedDiscount) || 0;
    return 0;
  }, [discountMode, activePresetPercent, fixedDiscount, subtotal]);

  const grandTotal = subtotal + taxTotal - discountAmount;

  const handleTogglePreset = (presetId: string, presetValue: number) => {
    if (activePresetId === presetId) {
      setDiscountMode("none"); setActivePresetId(null); setActivePresetPercent(0); setFixedDiscount("");
    } else {
      setDiscountMode("percent"); setActivePresetId(presetId); setActivePresetPercent(presetValue); setFixedDiscount("");
    }
  };

  const handleFixedDiscountChange = (val: string) => {
    setFixedDiscount(val); setDiscountMode(val ? "fixed" : "none"); setActivePresetId(null); setActivePresetPercent(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientId) return addToast("Please select a client.", "error");
    if (!form.issueDate) return addToast("Issue Date is required.", "error");
    if (!form.dueDate) return addToast("Due Date is required.", "error");
    if (lineItems.some((li) => !li.description.trim())) return addToast("All line items need a description.", "error");

    const invNumber = getNextNumber("invoice");

    const newInvoice = {
      id: "inv_" + Date.now().toString(36),
      invoiceNumber: invNumber,
      customerPO: form.customerPO || null,
      serviceAddress: resolvedServiceAddress || null,
      clientId: form.clientId,
      jobId: form.jobId || null,
      status: form.status,
      issueDate: new Date(form.issueDate).toISOString(),
      dueDate: new Date(form.dueDate).toISOString(),
      paidDate: form.status === "paid" ? new Date().toISOString() : null,
      lineItems,
      subtotal,
      taxTotal,
      discount: discountAmount,
      grandTotal,
      paymentTerms: form.paymentTerms,
      notes: form.notes,
      createdAt: new Date().toISOString(),
      deletedAt: null,
    };

    addInvoice(newInvoice);

    // Update linked job status to "invoice_created"
    if (form.jobId) {
      updateJob(form.jobId, { status: "invoice_created" });
    }

    addActivity({
      id: "act_" + Date.now().toString(36),
      type: "invoice_created",
      description: `Invoice ${invNumber} created`,
      entityType: "invoice",
      entityId: newInvoice.id,
      entityName: invNumber,
      userId: "current_user",
      userName: "You",
      timestamp: new Date().toISOString(),
    });

    addToast(`Invoice ${invNumber} created successfully.`, "success");
    router.push("/app/invoices");
  };

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const lineItemTypes = setup?.lineItemTypes ?? [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => router.push("/app/invoices")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Invoices
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">New Invoice</h1>
        {sourceJob && <p className="text-sm text-primary mt-1">Creating from Job: {sourceJob.title}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border border-border bg-card p-5 rounded-xl">
          <FormField label="Client" required>
            <select value={form.clientId} onChange={(e) => updateField("clientId", e.target.value)} required className="form-input">
              <option value="">Select a client...</option>
              {activeClients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>

          <FormField label="Linked Job">
            <select value={form.jobId} onChange={(e) => updateField("jobId", e.target.value)} className="form-input">
              <option value="">Optional - link to an existing job</option>
              {activeJobs.map((j) => <option key={j.id} value={j.id}>{j.jobNumber || j.title} - {j.title}</option>)}
            </select>
          </FormField>

          <FormField label="Customer PO #">
            <input type="text" value={form.customerPO} onChange={(e) => updateField("customerPO", e.target.value)} className="form-input" placeholder="PO-10293" />
          </FormField>

          <FormField label="Service Address">
            {clientAddresses.length > 0 ? (
              <select value={form.serviceAddressId} onChange={(e) => updateField("serviceAddressId", e.target.value)} className="form-input">
                <option value="">Select address...</option>
                {clientAddresses.map(a => (
                  <option key={a.id} value={a.id}>{a.isDefault ? "★ " : ""}{a.street}, {a.city}, {a.state} {a.zip}</option>
                ))}
                <option value="__custom__">Custom address...</option>
              </select>
            ) : (
              <input type="text" value={form.serviceAddressCustom} onChange={(e) => { updateField("serviceAddressCustom", e.target.value); updateField("serviceAddressId", "__custom__"); }} className="form-input" placeholder="123 Main St..." />
            )}
            {form.serviceAddressId === "__custom__" && (
              <input type="text" value={form.serviceAddressCustom} onChange={(e) => updateField("serviceAddressCustom", e.target.value)} className="form-input mt-2" placeholder="Enter custom address..." />
            )}
          </FormField>

          <FormField label="Status">
            <select value={form.status} onChange={(e) => updateField("status", e.target.value)} className="form-input">
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </FormField>

          <FormField label="Issue Date" required>
            <input type="date" value={form.issueDate} onChange={(e) => updateField("issueDate", e.target.value)} required className="form-input" />
          </FormField>

          <FormField label="Due Date" required>
            <input type="date" value={form.dueDate} onChange={(e) => updateField("dueDate", e.target.value)} required className="form-input" />
          </FormField>

          <FormField label="Payment Terms">
            <select value={form.paymentTerms} onChange={(e) => updateField("paymentTerms", e.target.value)} className="form-input">
              {setup.paymentOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </FormField>
        </div>

        {/* Line Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Line Items</h3>
            <button type="button" onClick={addLineItem} className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium"><Plus className="w-4 h-4" /> Add Item</button>
          </div>
          <div className="overflow-x-auto border border-border rounded-lg bg-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary/40 border-b border-border text-xs uppercase text-muted-foreground text-left">
                <tr>
                  {lineItemTypes.length > 0 && <th className="px-3 py-2 font-semibold w-32">Type</th>}
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
                    {lineItemTypes.length > 0 && (
                      <td className="p-2 align-top">
                        <select value={item.lineType || ""} onChange={(e) => updateLineItem(idx, "lineType", e.target.value)} className="form-input text-sm">
                          <option value="">--</option>
                          {lineItemTypes.map(t => <option key={t} value={t}>{t}</option>)}
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
                    <td className="p-2 align-top"><input type="number" min="0" step="1" value={item.quantity} onChange={(e) => updateLineItem(idx, "quantity", parseFloat(e.target.value) || 0)} className="form-input text-sm text-right font-mono" /></td>
                    <td className="p-2 align-top"><input type="number" min="0" step="1" value={item.unitPrice} onChange={(e) => updateLineItem(idx, "unitPrice", parseFloat(e.target.value) || 0)} className="form-input text-sm text-right font-mono" /></td>
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
                    <td className="p-2 align-top text-right text-foreground font-mono font-medium pt-4">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                    <td className="p-2 align-top text-center pt-4">
                      <button type="button" onClick={() => removeLineItem(idx)} className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-30" disabled={lineItems.length <= 1}><Trash2 className="w-4 h-4 mx-auto" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Discount + Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mt-6">
            <div className="max-w-sm w-full space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5"><Tag className="w-4 h-4 text-muted-foreground" /> Add Discount</h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {setup.discountOptions.map((disc) => (
                    <button key={disc.id} type="button" onClick={() => handleTogglePreset(disc.id, disc.value)}
                      className={`text-[11px] font-medium px-2 py-1 rounded-md border transition-colors ${activePresetId === disc.id ? "bg-primary text-primary-foreground border-primary" : "bg-secondary text-foreground hover:bg-primary/10 hover:text-primary border-border"}`}>
                      {disc.label} ({disc.value}%)
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Fixed $</span>
                  <input type="number" min="0" step="0.01" value={discountMode === "percent" ? "" : fixedDiscount} onChange={(e) => handleFixedDiscountChange(e.target.value)} className="form-input text-sm w-32 font-mono" placeholder="0.00" disabled={discountMode === "percent"} />
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 space-y-2 w-full sm:w-80 ml-auto shadow-sm">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-mono text-foreground font-medium">${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tax</span><span className="font-mono text-foreground font-medium">${taxTotal.toFixed(2)}</span></div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm"><span className="text-emerald-600">Discount{discountMode === "percent" ? ` (${activePresetPercent}%)` : ""}</span><span className="font-mono text-emerald-600 font-bold">-${discountAmount.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between text-base font-bold border-t border-border pt-3 mt-2"><span className="text-foreground">Grand Total</span><span className="font-mono text-foreground">${grandTotal.toFixed(2)}</span></div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="pt-4 border-t border-border">
          <FormField label="Notes">
            <textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)} className="form-input min-h-[90px] resize-y text-sm" placeholder="Invoice notes..." />
          </FormField>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6">
          <button type="button" onClick={() => router.push("/app/invoices")} className="px-5 py-2.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-secondary transition-colors">Cancel</button>
          <button type="submit" className="px-8 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors active:scale-[0.98]">Create Invoice</button>
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
