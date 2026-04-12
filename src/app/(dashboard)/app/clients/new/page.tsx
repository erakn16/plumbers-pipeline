"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCRMStore } from "@/store/crm-store";
import { useToast } from "@/components/toast";
import { ArrowLeft, Plus, Trash2, MapPin } from "lucide-react";
import { sanitizeName, stripNonDigits, formatPhone } from "@/utils/formatting";
import { US_STATES } from "@/utils/us-states";

export default function NewClientPage() {
  const router = useRouter();
  const { addClient } = useCRMStore();
  const { addToast } = useToast();

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    status: "active" as "active" | "inactive" | "lead",
    tags: "",
    notes: "",
  });

  const [addresses, setAddresses] = useState([
    { id: "addr_initial", street: "", city: "", state: "GA", zip: "", isDefault: true },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return addToast("Name is required.", "error");

    // Validate that all addresses have required fields
    for (const addr of addresses) {
      if (!addr.street.trim() || !addr.city.trim() || !addr.state || !addr.zip.trim()) {
        return addToast("All address fields (Street, City, State, ZIP) are required.", "error");
      }
    }

    if (!addresses.some((a) => a.isDefault)) {
      addresses[0].isDefault = true;
    }

    const newClient = {
      id: "cli_" + Date.now().toString(36),
      name: sanitizeName(form.name),
      company: form.company,
      email: form.email,
      phone: formatPhone(form.phone),
      addresses,
      status: form.status,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      notes: form.notes,
      createdAt: new Date().toISOString(),
      deletedAt: null,
    };
    addClient(newClient);
    addToast(`${newClient.name} added successfully.`, "success");
    router.push("/app/clients");
  };

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateAddress = (idx: number, field: string, value: string) => {
    setAddresses((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const setAddressDefault = (idx: number) => {
    setAddresses((prev) => prev.map((a, i) => ({ ...a, isDefault: i === idx })));
  };

  const addAddress = () => {
    setAddresses((prev) => [
      ...prev,
      { id: "addr_" + Date.now().toString(36), street: "", city: "", state: "GA", zip: "", isDefault: prev.length === 0 },
    ]);
  };

  const removeAddress = (idx: number) => {
    if (addresses.length <= 1) return addToast("At least one address is required.", "error");
    setAddresses((prev) => {
      const copy = prev.filter((_, i) => i !== idx);
      if (copy.length > 0 && !copy.some((a) => a.isDefault)) {
        copy[0].isDefault = true;
      }
      return copy;
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => router.push("/app/clients")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Add New Client</h1>
        <p className="text-sm text-muted-foreground mt-1">Fill in the client details below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Full Name" required helperText="Letters, spaces, hyphens, apostrophes only">
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField("name", sanitizeName(e.target.value))}
              required
              className="form-input"
              placeholder="Marcus Delgado"
            />
          </FormField>
          <FormField label="Company">
            <input type="text" value={form.company} onChange={(e) => updateField("company", e.target.value)} className="form-input" placeholder="Delgado Properties" />
          </FormField>
          <FormField label="Email" required>
            <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required className="form-input" placeholder="marcus@example.com" />
          </FormField>
          <FormField label="Phone" helperText="Digits only, formatted as (XXX) XXX-XXXX">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", stripNonDigits(e.target.value))}
              onBlur={(e) => updateField("phone", formatPhone(e.target.value))}
              className="form-input"
              placeholder="4045551234"
              maxLength={14}
            />
          </FormField>
        </div>

        {/* Addresses */}
        <div className="border border-border rounded-xl p-4 bg-card/50 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Addresses</h3>
              <span className="text-xs text-destructive font-medium">*</span>
            </div>
            <button type="button" onClick={addAddress} className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Address
            </button>
          </div>

          {addresses.map((addr, idx) => (
            <div key={addr.id} className="p-3 border border-border rounded-lg bg-background relative space-y-3">
              <div className="flex justify-between items-center mb-1">
                <label className="flex items-center gap-2 text-sm text-foreground font-medium cursor-pointer">
                  <input type="radio" checked={addr.isDefault} onChange={() => setAddressDefault(idx)} className="accent-primary" /> Default Location
                </label>
                <button type="button" onClick={() => removeAddress(idx)} className="p-1 text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="sm:col-span-2">
                <FormField label="Street Address" required>
                  <input type="text" value={addr.street} onChange={(e) => updateAddress(idx, "street", e.target.value)} className="form-input" placeholder="1247 Peachtree Hills Ave NE" required />
                </FormField>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <FormField label="City" required>
                    <input type="text" value={addr.city} onChange={(e) => updateAddress(idx, "city", e.target.value)} className="form-input" placeholder="Atlanta" required />
                  </FormField>
                </div>
                <FormField label="State" required>
                  <select value={addr.state} onChange={(e) => updateAddress(idx, "state", e.target.value)} className="form-input" required>
                    <option value="">Select...</option>
                    {US_STATES.map(s => <option key={s.code} value={s.code}>{s.code} - {s.name}</option>)}
                  </select>
                </FormField>
                <FormField label="ZIP" required>
                  <input type="text" value={addr.zip} onChange={(e) => updateAddress(idx, "zip", e.target.value)} className="form-input" placeholder="30309" required />
                </FormField>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Status">
            <select value={form.status} onChange={(e) => updateField("status", e.target.value)} className="form-input">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="lead">Lead</option>
            </select>
          </FormField>
          <FormField label="Tags" helperText="Comma-separated">
            <input type="text" value={form.tags} onChange={(e) => updateField("tags", e.target.value)} className="form-input" placeholder="residential, recurring" />
          </FormField>
        </div>

        <FormField label="Notes">
          <textarea value={form.notes} onChange={(e) => updateField("notes", e.target.value)} className="form-input min-h-[100px] resize-y" placeholder="Internal notes about this client..." />
        </FormField>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button type="button" onClick={() => router.push("/app/clients")} className="px-4 py-2.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-secondary transition-colors">
            Cancel
          </button>
          <button type="submit" className="px-6 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors active:scale-[0.98]">
            Save Client
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, required, helperText, children }: { label: string; required?: boolean; helperText?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground inline-flex items-center gap-2">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
        {helperText && <span className="text-xs text-muted-foreground font-normal">{helperText}</span>}
      </label>
      {children}
    </div>
  );
}
