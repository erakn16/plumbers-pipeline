"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useCRMStore } from "@/store/crm-store";
import { useSettingsStore } from "@/store/settings-store";
import { useToast } from "@/components/toast";
import { ArrowLeft, Plus, X } from "lucide-react";
import { sanitizeName } from "@/utils/formatting";

export default function EditWorkerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getWorkerById, updateWorker } = useCRMStore();
  const { setup } = useSettingsStore();
  const { addToast } = useToast();

  const worker = getWorkerById(id);

  const [form, setForm] = useState({
    name: worker?.name || "",
    email: worker?.email || "",
    phone: worker?.phone || "",
    role: worker?.role || setup.workerRoles[0] || "Technician",
    department: worker?.department || "Field Operations",
    hourlyRate: worker?.hourlyRate?.toString() || "",
    status: worker?.status || "active",
    hireDate: worker?.hireDate ? worker.hireDate.split("T")[0] : "",
    skills: worker?.skills || ([] as string[]),
    certifications: worker?.certifications || ([] as string[]),
  });

  const [newSkill, setNewSkill] = useState("");
  const [newCert, setNewCert] = useState("");

  if (!worker) {
    return <div className="text-center py-20 text-foreground">Worker not found</div>;
  }

  // Build role options: always include the worker's current role even if it's been removed from settings
  const roleOptions = [...new Set([...setup.workerRoles, form.role])];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return addToast("Worker name is required.", "error");

    updateWorker(worker.id, {
      name: sanitizeName(form.name),
      email: form.email,
      phone: form.phone,
      role: form.role,
      department: form.department,
      hourlyRate: parseFloat(form.hourlyRate) || 0,
      status: form.status as any,
      hireDate: form.hireDate ? new Date(form.hireDate).toISOString() : worker.hireDate,
      skills: form.skills,
      certifications: form.certifications,
    });

    addToast(`Worker ${form.name} updated.`, "success");
    router.push(`/app/workers/${worker.id}`);
  };

  const updateField = (key: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !form.skills.includes(newSkill.trim())) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill("");
    }
  };
  const removeSkill = (skill: string) => {
    setForm((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }));
  };
  const addCert = () => {
    if (newCert.trim() && !form.certifications.includes(newCert.trim())) {
      setForm((prev) => ({ ...prev, certifications: [...prev.certifications, newCert.trim()] }));
      setNewCert("");
    }
  };
  const removeCert = (cert: string) => {
    setForm((prev) => ({ ...prev, certifications: prev.certifications.filter((c) => c !== cert) }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => router.push(`/app/workers/${worker.id}`)} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Worker
      </button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Worker</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-border bg-card p-5 rounded-xl">
          <FormField label="Full Name" required helperText="Letters, spaces, hyphens, apostrophes only">
            <input type="text" value={form.name} onChange={(e) => updateField("name", sanitizeName(e.target.value))} required className="form-input" />
          </FormField>
          <FormField label="Role">
            <select value={form.role} onChange={(e) => updateField("role", e.target.value)} className="form-input">
              {roleOptions.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Email" required>
            <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required className="form-input" />
          </FormField>
          <FormField label="Phone">
            <input type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className="form-input" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Department">
            <select value={form.department} onChange={(e) => updateField("department", e.target.value)} className="form-input">
              <option value="Field Operations">Field Operations</option>
              <option value="Operations">Operations</option>
              <option value="Management">Management</option>
            </select>
          </FormField>
          <FormField label="Hourly Rate ($)">
            <input type="number" step="0.01" min="0" value={form.hourlyRate} onChange={(e) => updateField("hourlyRate", e.target.value)} className="form-input" />
          </FormField>
          <FormField label="Hire Date">
            <input type="date" value={form.hireDate} onChange={(e) => updateField("hireDate", e.target.value)} className="form-input" />
          </FormField>
        </div>

        <FormField label="Status">
          <select value={form.status} onChange={(e) => updateField("status", e.target.value)} className="form-input max-w-[200px]">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </FormField>

        {/* Skills */}
        <FormField label="Skills">
          <div className="space-y-2">
            <div className="flex gap-2">
              <input type="text" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} className="form-input flex-1" placeholder="e.g. Residential Repair" />
              <button type="button" onClick={addSkill} className="px-3 py-2 bg-secondary border border-border rounded-md text-sm hover:bg-secondary/80 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.skills.map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {skill}
                    <button type="button" onClick={() => removeSkill(skill)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </FormField>

        {/* Certifications */}
        <FormField label="Certifications">
          <div className="space-y-2">
            <div className="flex gap-2">
              <input type="text" value={newCert} onChange={(e) => setNewCert(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCert(); } }} className="form-input flex-1" placeholder="e.g. Master Plumber GA #MP-44291" />
              <button type="button" onClick={addCert} className="px-3 py-2 bg-secondary border border-border rounded-md text-sm hover:bg-secondary/80 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {form.certifications.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.certifications.map((cert) => (
                  <span key={cert} className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 text-amber-700 text-xs font-medium rounded-full">
                    {cert}
                    <button type="button" onClick={() => removeCert(cert)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </FormField>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button type="button" onClick={() => router.push(`/app/workers/${worker.id}`)} className="px-4 py-2.5 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-secondary transition-colors">
            Cancel
          </button>
          <button type="submit" className="px-6 py-2.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors active:scale-[0.98]">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, required, helperText, children }: { label: string; required?: boolean; helperText?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
      {children}
    </div>
  );
}
