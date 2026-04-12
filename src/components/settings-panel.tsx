"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/components/toast";
import { useSettingsStore, generateToken, type TeamRole, type NotificationPrefs } from "@/store/settings-store";
import { useCRMStore } from "@/store/crm-store";
import { ConfirmDialog } from "@/components/confirmation-dialog";
import {
  X, User, Key, Bell, Palette, Shield, Database, Check,
  Eye, EyeOff, Download, Upload, Trash2, Plus, Copy,
  Monitor, Moon, Sun, Smartphone, AlertTriangle,
  RefreshCw, FileDown, Lock, UserMinus, QrCode, Sliders
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────
type SettingsSection = "account" | "setup" | "security" | "notifications" | "appearance" | "team" | "data";

const SECTIONS: { key: SettingsSection; label: string; icon: React.ReactNode; description: string }[] = [
  { key: "account", label: "Account", icon: <User className="w-4 h-4" />, description: "Profile and contact info" },
  { key: "setup", label: "Setup", icon: <Sliders className="w-4 h-4" />, description: "CRM variables and defaults" },
  { key: "security", label: "Security", icon: <Key className="w-4 h-4" />, description: "Password and 2FA" },
  { key: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" />, description: "Alert preferences" },
  { key: "appearance", label: "Appearance", icon: <Palette className="w-4 h-4" />, description: "Theme and display" },
  { key: "team", label: "Team & Permissions", icon: <Shield className="w-4 h-4" />, description: "Members and roles" },
  { key: "data", label: "Data & Export", icon: <Database className="w-4 h-4" />, description: "Import, export, backups" },
];

// ─── Demo Banner ────────────────────────────────────────────────────────────────
function DemoBanner() {
  return (
    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-4 flex items-start gap-2">
      <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
        These settings are view-only in demo mode. Create an account to customize your experience.
      </p>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeSection, setActiveSection] = useState<SettingsSection>("account");
  const [isAnimating, setIsAnimating] = useState(false);
  const { isDemo } = useAuth();

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setIsAnimating(true));
    } else {
      setIsAnimating(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (open) { document.body.style.overflow = "hidden"; }
    else { document.body.style.overflow = ""; }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${isAnimating ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`absolute inset-y-0 right-0 flex transition-transform duration-300 ease-out ${isAnimating ? "translate-x-0" : "translate-x-full"}`}
        style={{ width: "min(100vw, 920px)" }}
      >
        <div className="w-56 bg-zinc-50 dark:bg-zinc-900 border-r border-border flex-col shrink-0 hidden sm:flex">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-bold text-foreground tracking-tight">Settings</h2>
          </div>
          <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveSection(s.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left transition-colors ${
                  activeSection === s.key ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <span className="shrink-0">{s.icon}</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm truncate">{s.label}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{s.description}</span>
                </div>
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground text-center">Plumbers Pipeline v1.0.0</p>
          </div>
        </div>

        <div className="flex-1 bg-card flex flex-col min-w-0">
          <div className="h-14 flex items-center justify-between px-5 border-b border-border shrink-0">
            <div className="sm:hidden">
              <select value={activeSection} onChange={(e) => setActiveSection(e.target.value as SettingsSection)} className="text-sm font-semibold text-foreground bg-transparent border-none focus:outline-none">
                {SECTIONS.map((s) => (<option key={s.key} value={s.key}>{s.label}</option>))}
              </select>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              {SECTIONS.find((s) => s.key === activeSection)?.icon}
              <h3 className="text-sm font-semibold text-foreground">{SECTIONS.find((s) => s.key === activeSection)?.label}</h3>
            </div>
            <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors" aria-label="Close settings">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-5 md:p-6 max-w-2xl space-y-6">
              {isDemo && <DemoBanner />}
              <div className={isDemo ? "demo-disabled" : ""}>
                {activeSection === "account" && <AccountSection />}
                {activeSection === "setup" && <SetupSection />}
                {activeSection === "security" && <SecuritySection />}
                {activeSection === "notifications" && <NotificationsSection />}
                {activeSection === "appearance" && <AppearanceSection />}
                {activeSection === "team" && <TeamSection />}
                {activeSection === "data" && <DataSection />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Shared Components ──────────────────────────────────────────────────────────
function SettingsGroup({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 pb-6 mb-6 border-b border-border last:border-0 last:pb-0 last:mb-0">
      <div>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function FieldRow({ label, helperText, children }: { label: string; helperText?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {helperText && <p className="text-[11px] text-muted-foreground -mt-0.5">{helperText}</p>}
      {children}
    </div>
  );
}

function ToggleRow({ label, description, enabled, onChange }: { label: string; description?: string; enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <div className="min-w-0">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors ${enabled ? "bg-primary" : "bg-zinc-300 dark:bg-zinc-600"}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function SaveButton({ onClick, label = "Save Changes" }: { onClick: () => void; label?: string }) {
  return (
    <div className="pt-4 border-t border-border flex justify-end">
      <button onClick={onClick} className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.98]">
        <Check className="w-4 h-4" /> {label}
      </button>
    </div>
  );
}

function Separator() { return <hr className="border-border" />; }

// ─── Account Section ────────────────────────────────────────────────────────────
function AccountSection() {
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const { profile, updateProfile } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(profile.name || user?.name || "");
  const [email, setEmail] = useState(profile.email || user?.email || "");
  const [phone, setPhone] = useState(profile.phone);
  const [timezone, setTimezone] = useState(profile.timezone);
  const [language, setLanguage] = useState(profile.language);

  const handleUpload = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { addToast("File too large. Max 2MB.", "error"); return; }
    if (!["image/jpeg", "image/png", "image/svg+xml"].includes(file.type)) { addToast("Only JPG, PNG, or SVG files.", "error"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      updateProfile({ avatarUrl: dataUrl });
      addToast("Profile photo updated.", "success");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateProfile({ name, email, phone, timezone, language });
    updateUser({ name, email });
    addToast("Profile updated successfully.", "success");
  };

  return (
    <>
      <SettingsGroup title="Profile" description="Your personal information used across the platform.">
        <div className="flex items-center gap-4">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Avatar" className="w-16 h-16 rounded-xl object-cover shrink-0 border-2 border-border" />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl uppercase shrink-0 border-2 border-dashed border-border">
              {name.charAt(0)}
            </div>
          )}
          <div className="space-y-1">
            <button onClick={handleUpload} className="text-xs font-medium text-primary hover:underline">Upload photo</button>
            <p className="text-[11px] text-muted-foreground">JPG, PNG or SVG. Max 2MB.</p>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/svg+xml" onChange={handleFileChange} className="hidden" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow label="Full Name"><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-input" /></FieldRow>
          <FieldRow label="Email Address"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" /></FieldRow>
          <FieldRow label="Phone Number"><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="form-input" /></FieldRow>
          <FieldRow label="Role"><input type="text" value={user?.role || "admin"} disabled className="form-input opacity-60 capitalize" /></FieldRow>
        </div>
      </SettingsGroup>
      <Separator />
      <SettingsGroup title="Regional" description="Locale preferences for dates, times, and currency display.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldRow label="Timezone">
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="form-input">
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Anchorage">Alaska Time (AKT)</option>
              <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
            </select>
          </FieldRow>
          <FieldRow label="Language">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="form-input">
              <option value="en-US">English (US)</option>
              <option value="es">Espanol</option>
              <option value="fr">Francais</option>
            </select>
          </FieldRow>
        </div>
      </SettingsGroup>
      <SaveButton onClick={handleSave} />
    </>
  );
}


// ─── Setup Section ──────────────────────────────────────────────────────────────
function SetupSection() {
  const { addToast } = useToast();
  const { setup, updateSetup } = useSettingsStore();
  const [local, setLocal] = useState({ ...setup });

  const handleSave = () => {
    updateSetup(local);
    addToast("Setup preferences saved.", "success");
  };

  const updateNaming = (key: keyof typeof local.naming, value: string) => {
    // limit to 10 chars
    setLocal(p => ({ ...p, naming: { ...p.naming, [key]: value.substring(0, 10).toUpperCase() } }));
  };

  const addDiscount = () => {
    setLocal(p => ({
      ...p,
      discountOptions: [...p.discountOptions, { id: "disc_" + Date.now(), label: "New Discount", value: 0 }]
    }));
  };
  const updateDiscount = (id: string, field: "label" | "value", val: string | number) => {
    setLocal(p => ({
      ...p,
      discountOptions: p.discountOptions.map(d => d.id === id ? { ...d, [field]: val } : d)
    }));
  };
  const removeDiscount = (id: string) => {
    setLocal(p => ({ ...p, discountOptions: p.discountOptions.filter(d => d.id !== id) }));
  };

  const [newPayment, setNewPayment] = useState("");
  const addPayment = () => {
    if (!newPayment.trim()) return;
    setLocal(p => ({ ...p, paymentOptions: [...p.paymentOptions, newPayment] }));
    setNewPayment("");
  };
  const removePayment = (idx: number) => {
    setLocal(p => ({ ...p, paymentOptions: p.paymentOptions.filter((_, i) => i !== idx) }));
  };

  const [newRole, setNewRole] = useState("");
  const addRole = () => {
    if (!newRole.trim()) return;
    setLocal(p => ({ ...p, workerRoles: [...p.workerRoles, newRole] }));
    setNewRole("");
  };
  const removeRole = (idx: number) => {
    setLocal(p => ({ ...p, workerRoles: p.workerRoles.filter((_, i) => i !== idx) }));
  };

  const [newLineType, setNewLineType] = useState("");

  return (
    <>
      <SettingsGroup title="Naming Schemes" description="Prefixes for identifying records (Max 10 characters).">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FieldRow label="Estimate Prefix">
            <input type="text" value={local.naming.estimatePrefix} onChange={(e) => updateNaming("estimatePrefix", e.target.value)} className="form-input" placeholder="EST-" />
          </FieldRow>
          <FieldRow label="Job/Work Order Prefix">
            <input type="text" value={local.naming.jobPrefix} onChange={(e) => updateNaming("jobPrefix", e.target.value)} className="form-input" placeholder="WO-" />
          </FieldRow>
          <FieldRow label="Invoice Prefix">
            <input type="text" value={local.naming.invoicePrefix} onChange={(e) => updateNaming("invoicePrefix", e.target.value)} className="form-input" placeholder="INV-" />
          </FieldRow>
        </div>
      </SettingsGroup>

      <Separator />

      <SettingsGroup title="Discounts" description="Manage default discount percentage options for estimates & invoices.">
        <div className="space-y-3">
          {local.discountOptions.map(disc => (
            <div key={disc.id} className="flex items-center gap-3">
              <input type="text" value={disc.label} onChange={(e) => updateDiscount(disc.id, "label", e.target.value)} className="form-input flex-1" placeholder="Discount name" />
              <div className="relative w-24">
                <input type="number" value={disc.value} onChange={(e) => updateDiscount(disc.id, "value", parseFloat(e.target.value) || 0)} className="form-input pr-8" placeholder="0" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
              </div>
              <button type="button" onClick={() => removeDiscount(disc.id)} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
          <button type="button" onClick={addDiscount} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"><Plus className="w-4 h-4" /> Add Discount Type</button>
        </div>
      </SettingsGroup>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6 border-b border-border pb-6">
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-1">Payment Methods</h4>
          <p className="text-xs text-muted-foreground mb-4">Available options for invoices.</p>
          <div className="space-y-2 mb-3">
            {local.paymentOptions.map((pay, i) => (
              <div key={i} className="flex items-center justify-between bg-secondary/50 px-3 py-2 rounded-md text-sm text-foreground">
                {pay}
                <button type="button" onClick={() => removePayment(i)} className="text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newPayment} onChange={(e) => setNewPayment(e.target.value)} className="form-input text-sm flex-1" placeholder="e.g. Venmo" onKeyDown={e => e.key === 'Enter' && addPayment()} />
            <button type="button" onClick={addPayment} className="px-3 py-2 bg-primary text-primary-foreground rounded-md"><Plus className="w-4 h-4" /></button>
          </div>
        </div>

        <div>
           <h4 className="text-sm font-semibold text-foreground mb-1">Worker Roles</h4>
          <p className="text-xs text-muted-foreground mb-4">Manage title options for workers.</p>
          <div className="space-y-2 mb-3">
            {local.workerRoles.map((role, i) => (
              <div key={i} className="flex items-center justify-between bg-secondary/50 px-3 py-2 rounded-md text-sm text-foreground">
                {role}
                <button type="button" onClick={() => removeRole(i)} className="text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={newRole} onChange={(e) => setNewRole(e.target.value)} className="form-input text-sm flex-1" placeholder="e.g. Inspector" onKeyDown={e => e.key === 'Enter' && addRole()} />
            <button type="button" onClick={addRole} className="px-3 py-2 bg-primary text-primary-foreground rounded-md"><Plus className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <Separator />

      <SettingsGroup title="Line Item Types" description="Categories available for line items on estimates, jobs, and invoices.">
        <div className="space-y-2 mb-3">
          {(local.lineItemTypes || []).map((t, i) => (
            <div key={i} className="flex items-center justify-between bg-secondary/50 px-3 py-2 rounded-md text-sm text-foreground">
              {t}
              <button type="button" onClick={() => setLocal(p => ({ ...p, lineItemTypes: p.lineItemTypes.filter((_, idx) => idx !== i) }))} className="text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={newLineType} onChange={(e) => setNewLineType(e.target.value)} className="form-input text-sm flex-1" placeholder="e.g. Disposal" onKeyDown={e => { if (e.key === 'Enter' && newLineType.trim()) { setLocal(p => ({ ...p, lineItemTypes: [...(p.lineItemTypes || []), newLineType.trim()] })); setNewLineType(""); }}} />
          <button type="button" onClick={() => { if (newLineType.trim()) { setLocal(p => ({ ...p, lineItemTypes: [...(p.lineItemTypes || []), newLineType.trim()] })); setNewLineType(""); }}} className="px-3 py-2 bg-primary text-primary-foreground rounded-md"><Plus className="w-4 h-4" /></button>
        </div>
      </SettingsGroup>

      <SettingsGroup title="Job Defaults" description="Set standard descriptions or disclaimers appended to jobs.">
        <FieldRow label="Default Job Disclaimer">
          <textarea value={local.defaultJobNote} onChange={(e) => setLocal(p => ({ ...p, defaultJobNote: e.target.value }))} className="form-input min-h-[80px] resize-y" placeholder="The final price may be within +/-10%..." />
        </FieldRow>
      </SettingsGroup>

      <SaveButton onClick={handleSave} />
    </>
  );
}

// ─── Security Section ───────────────────────────────────────────────────────────
function SecuritySection() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { passwords, setPassword, twoFAEnabled, setTwoFA, sessions, revokeSession, getPassword } = useSettingsStore();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  // 2FA flow
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFAStep, setTwoFAStep] = useState(0); // 0=QR, 1=verify
  const [twoFACode, setTwoFACode] = useState("");
  const [generatedSecret, setGeneratedSecret] = useState("");

  const pwStrength = newPw.length === 0 ? 0 : newPw.length < 6 ? 1 : newPw.length < 10 ? 2 : 3;
  const pwLabels = ["", "Weak", "Fair", "Strong"];
  const pwColors = ["", "bg-red-500", "bg-amber-500", "bg-emerald-500"];

  const handleChangePw = () => {
    if (!currentPw) return addToast("Enter your current password.", "error");
    // Validate current password against store
    const storedPw = getPassword(user?.email || "");
    if (storedPw && storedPw !== currentPw) {
      return addToast("Current password is incorrect.", "error");
    }
    if (newPw.length < 8) return addToast("Password must be at least 8 characters.", "error");
    if (newPw !== confirmPw) return addToast("Passwords do not match.", "error");
    if (newPw === currentPw) return addToast("New password must be different from current.", "error");

    // Actually update the password
    setPassword(user?.email || "", newPw);
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    addToast("Password changed successfully. Use your new password next time you log in.", "success");
  };

  const start2FASetup = () => {
    const secret = generateToken().substring(0, 16).toUpperCase();
    setGeneratedSecret(secret);
    setTwoFAStep(0);
    setTwoFACode("");
    setShow2FASetup(true);
  };

  const cancel2FASetup = () => {
    setShow2FASetup(false);
    setTwoFAStep(0);
    setTwoFACode("");
    setGeneratedSecret("");
  };

  const verify2FA = () => {
    // Accept any 6-digit code for demo purposes
    if (twoFACode.length !== 6 || !/^\d+$/.test(twoFACode)) {
      return addToast("Enter a valid 6-digit code.", "error");
    }
    setTwoFA(true, generatedSecret);
    setShow2FASetup(false);
    addToast("Two-factor authentication enabled successfully.", "success");
  };

  const disable2FA = () => {
    setTwoFA(false, null);
    addToast("Two-factor authentication disabled.", "info");
  };

  const otpauthUri = `otpauth://totp/PlumbersPipeline:${user?.email || "user"}?secret=${generatedSecret}&issuer=PlumbersPipeline`;

  return (
    <>
      <SettingsGroup title="Change Password" description="Update your password. Must be at least 8 characters.">
        <div className="space-y-3">
          <FieldRow label="Current Password">
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="form-input pr-10" placeholder="Enter current password" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </FieldRow>
          <FieldRow label="New Password">
            <input type={showPw ? "text" : "password"} value={newPw} onChange={(e) => setNewPw(e.target.value)} className="form-input" placeholder="Enter new password" />
            {newPw.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${pwColors[pwStrength]}`} style={{ width: `${(pwStrength / 3) * 100}%` }} />
                </div>
                <span className={`text-[10px] font-semibold ${pwStrength >= 3 ? "text-emerald-600" : pwStrength === 2 ? "text-amber-600" : "text-red-600"}`}>{pwLabels[pwStrength]}</span>
              </div>
            )}
          </FieldRow>
          <FieldRow label="Confirm New Password">
            <input type={showPw ? "text" : "password"} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="form-input" placeholder="Re-enter new password" />
            {confirmPw.length > 0 && newPw !== confirmPw && <p className="text-[11px] text-destructive mt-1 font-medium">Passwords do not match.</p>}
          </FieldRow>
          <SaveButton onClick={handleChangePw} label="Update Password" />
        </div>
      </SettingsGroup>

      <Separator />

      <SettingsGroup title="Two-Factor Authentication" description="Add an extra layer of security to your account.">
        {twoFAEnabled ? (
          <div className="border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">2FA is Active</span>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 mb-3">Your account is protected with two-factor authentication via authenticator app.</p>
            <button onClick={disable2FA} className="text-xs font-medium text-destructive hover:underline">Disable 2FA</button>
          </div>
        ) : (
          <div className="border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-3">Protect your account with an authenticator app like Google Authenticator or Authy.</p>
            <button onClick={start2FASetup} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
              <QrCode className="w-4 h-4" /> Set Up 2FA
            </button>
          </div>
        )}

        {/* 2FA Setup Modal */}
        {show2FASetup && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={cancel2FASetup} />
            <div className="relative bg-card border border-border rounded-xl shadow-xl max-w-md w-full mx-4 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Set Up Two-Factor Authentication</h3>
              {twoFAStep === 0 && (
                <>
                  <p className="text-sm text-muted-foreground">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
                  <div className="bg-white p-4 rounded-lg border border-border flex items-center justify-center">
                    <div className="text-center">
                      {/* QR Code placeholder - render the URI as a visual */}
                      <div className="w-48 h-48 mx-auto bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center border-2 border-dashed border-zinc-300">
                        <div className="text-center p-3">
                          <QrCode className="w-16 h-16 text-zinc-400 mx-auto mb-2" />
                          <p className="text-[10px] text-zinc-500 font-mono break-all">{otpauthUri.substring(0, 60)}...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Or enter this secret key manually:</p>
                    <code className="text-sm font-mono font-bold text-foreground tracking-wider">{generatedSecret.match(/.{1,4}/g)?.join(" ")}</code>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={cancel2FASetup} className="px-4 py-2 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-secondary transition-colors">Cancel</button>
                    <button onClick={() => setTwoFAStep(1)} className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Next</button>
                  </div>
                </>
              )}
              {twoFAStep === 1 && (
                <>
                  <p className="text-sm text-muted-foreground">Enter the 6-digit verification code from your authenticator app to confirm setup.</p>
                  <input
                    type="text" value={twoFACode} onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, "").substring(0, 6))}
                    className="form-input text-center text-2xl font-mono tracking-[0.5em]" placeholder="000000" maxLength={6} autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={cancel2FASetup} className="px-4 py-2 text-sm font-medium rounded-md border border-border bg-card text-foreground hover:bg-secondary transition-colors">Cancel</button>
                    <button onClick={verify2FA} className="px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">Verify & Enable</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </SettingsGroup>

      <Separator />

      <SettingsGroup title="Active Sessions" description="Devices currently signed into your account.">
        <div className="space-y-0 border border-border rounded-lg overflow-hidden">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <Monitor className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{session.device}</span>
                    {session.current && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">This device</span>}
                  </div>
                  <span className="text-xs text-muted-foreground">{session.location} - {session.lastActive}</span>
                </div>
              </div>
              {!session.current && (
                <button onClick={() => { revokeSession(session.id); addToast("Session revoked.", "success"); }} className="text-xs font-medium text-destructive hover:underline">Revoke</button>
              )}
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">No active sessions.</div>
          )}
        </div>
      </SettingsGroup>
    </>
  );
}

// ─── Notifications Section ──────────────────────────────────────────────────────
function NotificationsSection() {
  const { addToast } = useToast();
  const { notifications, updateNotifications } = useSettingsStore();
  const [local, setLocal] = useState<NotificationPrefs>({ ...notifications });

  const toggle = (key: keyof NotificationPrefs) => {
    setLocal((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    updateNotifications(local);
    addToast("Notification preferences saved.", "success");
  };

  return (
    <>
      <SettingsGroup title="Email Notifications" description="Choose which events trigger an email to your inbox.">
        <div className="border border-border rounded-lg px-4">
          <ToggleRow label="Job Assigned" description="When a job is assigned to you or your team." enabled={local.emailJobAssigned} onChange={() => toggle("emailJobAssigned")} />
          <ToggleRow label="Invoice Paid" description="When a client pays an invoice." enabled={local.emailInvoicePaid} onChange={() => toggle("emailInvoicePaid")} />
          <ToggleRow label="Estimate Accepted" description="When a client accepts an estimate." enabled={local.emailEstimateAccepted} onChange={() => toggle("emailEstimateAccepted")} />
          <ToggleRow label="Overdue Invoices" description="Daily reminder for invoices past their due date." enabled={local.emailOverdue} onChange={() => toggle("emailOverdue")} />
          <ToggleRow label="Weekly Digest" description="Summary of activity from the past week, every Monday." enabled={local.emailWeeklyDigest} onChange={() => toggle("emailWeeklyDigest")} />
        </div>
      </SettingsGroup>
      <Separator />
      <SettingsGroup title="Push Notifications" description="Browser and mobile push alerts.">
        <div className="border border-border rounded-lg px-4">
          <ToggleRow label="New Job Created" description="Real-time alert when a new job is added." enabled={local.pushNewJob} onChange={() => toggle("pushNewJob")} />
          <ToggleRow label="Payment Received" description="Instant notification when payment comes in." enabled={local.pushPayment} onChange={() => toggle("pushPayment")} />
          <ToggleRow label="Due Date Reminders" description="Alerts 24 hours before a job or invoice due date." enabled={local.pushReminders} onChange={() => toggle("pushReminders")} />
        </div>
      </SettingsGroup>
      <Separator />
      <SettingsGroup title="In-App Notifications" description="Notifications that appear in the bell icon.">
        <div className="border border-border rounded-lg px-4">
          <ToggleRow label="Activity Feed" description="All activity across your workspace." enabled={local.inAppActivity} onChange={() => toggle("inAppActivity")} />
          <ToggleRow label="Mentions" description="When someone references you in a note." enabled={local.inAppMentions} onChange={() => toggle("inAppMentions")} />
          <ToggleRow label="System Updates" description="Platform updates, maintenance, and new features." enabled={local.inAppSystem} onChange={() => toggle("inAppSystem")} />
        </div>
      </SettingsGroup>
      <SaveButton onClick={handleSave} />
    </>
  );
}

// ─── Appearance Section ─────────────────────────────────────────────────────────
function AppearanceSection() {
  const { addToast } = useToast();
  const { appearance, updateAppearance } = useSettingsStore();
  const [local, setLocal] = useState({ ...appearance });

  // Apply theme immediately on change
  const applyTheme = useCallback((t: "light" | "dark" | "system") => {
    const root = document.documentElement;
    root.classList.remove("dark");
    if (t === "dark") {
      root.classList.add("dark");
    } else if (t === "system") {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      }
    }
  }, []);

  const applyDensity = useCallback((d: "comfortable" | "compact") => {
    document.documentElement.setAttribute("data-density", d);
  }, []);

  const applyAnimations = useCallback((enabled: boolean) => {
    document.documentElement.setAttribute("data-reduce-motion", String(!enabled));
  }, []);

  const handleTheme = (t: typeof local.theme) => {
    setLocal((p) => ({ ...p, theme: t }));
    applyTheme(t);
  };

  const handleDensity = (d: typeof local.density) => {
    setLocal((p) => ({ ...p, density: d }));
    applyDensity(d);
  };

  const handleSave = () => {
    updateAppearance(local);
    // Persist sidebar default
    localStorage.setItem("pp_sidebar_collapsed", local.sidebarDefault === "collapsed" ? "true" : "false");
    applyTheme(local.theme);
    applyDensity(local.density);
    applyAnimations(local.animationsEnabled);
    addToast("Appearance preferences saved.", "success");
  };

  const themes: { value: typeof local.theme; label: string; icon: React.ReactNode; preview: string }[] = [
    { value: "light", label: "Light", icon: <Sun className="w-5 h-5" />, preview: "bg-white border-zinc-200" },
    { value: "dark", label: "Dark", icon: <Moon className="w-5 h-5" />, preview: "bg-zinc-900 border-zinc-700" },
    { value: "system", label: "System", icon: <Smartphone className="w-5 h-5" />, preview: "bg-gradient-to-r from-white to-zinc-900 border-zinc-400" },
  ];

  return (
    <>
      <SettingsGroup title="Theme" description="Select your preferred color mode.">
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <button key={t.value} onClick={() => handleTheme(t.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${local.theme === t.value ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-border/80 hover:bg-secondary/30"}`}>
              <div className={`w-12 h-8 rounded-md border ${t.preview}`} />
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">{t.icon}</span>
                <span className="text-xs font-medium text-foreground">{t.label}</span>
              </div>
              {local.theme === t.value && <Check className="w-3.5 h-3.5 text-primary" />}
            </button>
          ))}
        </div>
      </SettingsGroup>
      <Separator />
      <SettingsGroup title="Display Density" description="Control the spacing and padding of tables and content.">
        <div className="grid grid-cols-2 gap-3">
          {(["comfortable", "compact"] as const).map((d) => (
            <button key={d} onClick={() => handleDensity(d)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${local.density === d ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/30"}`}>
              <div className="flex flex-col items-center gap-2 mb-2">
                {d === "comfortable" ? (
                  <div className="space-y-2 w-full"><div className="h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded w-full" /><div className="h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" /><div className="h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6" /></div>
                ) : (
                  <div className="space-y-1 w-full"><div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded w-full" /><div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4" /><div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6" /><div className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded w-2/3" /></div>
                )}
              </div>
              <span className="text-xs font-medium text-foreground capitalize">{d}</span>
              {local.density === d && <Check className="w-3.5 h-3.5 text-primary mx-auto mt-1" />}
            </button>
          ))}
        </div>
      </SettingsGroup>
      <Separator />
      <SettingsGroup title="Layout" description="Navigation and motion preferences.">
        <div className="border border-border rounded-lg px-4">
          <div className="flex items-center justify-between gap-4 py-3 border-b border-border">
            <div>
              <span className="text-sm font-medium text-foreground">Default Sidebar State</span>
              <p className="text-xs text-muted-foreground mt-0.5">Whether the sidebar starts expanded or collapsed.</p>
            </div>
            <select value={local.sidebarDefault} onChange={(e) => setLocal((p) => ({ ...p, sidebarDefault: e.target.value as "expanded" | "collapsed" }))} className="form-input w-auto text-xs py-1.5 px-2">
              <option value="expanded">Expanded</option>
              <option value="collapsed">Collapsed</option>
            </select>
          </div>
          <ToggleRow label="Interface Animations" description="Enable smooth transitions and micro-interactions." enabled={local.animationsEnabled} onChange={(v) => setLocal((p) => ({ ...p, animationsEnabled: v }))} />
        </div>
      </SettingsGroup>
      <SaveButton onClick={handleSave} />
    </>
  );
}

// ─── Team & Permissions Section ─────────────────────────────────────────────────
function TeamSection() {
  const { user, canManageTeam } = useAuth();
  const { addToast } = useToast();
  const { teamMembers, updateTeamMember, removeTeamMember, addTeamMember, setPassword } = useSettingsStore();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("viewer");
  const [pendingRoles, setPendingRoles] = useState<Record<string, TeamRole>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [sending, setSending] = useState(false);

  const activeMembers = teamMembers.filter((m) => m.status !== "removed");

  const roleColors: Record<string, string> = {
    owner: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
    admin: "bg-primary/10 text-primary",
    manager: "bg-emerald-500/10 text-emerald-600",
    viewer: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  };

  const handleRoleChange = (memberId: string, newRole: TeamRole) => {
    setPendingRoles((prev) => ({ ...prev, [memberId]: newRole }));
  };

  const saveRoles = () => {
    Object.entries(pendingRoles).forEach(([id, role]) => {
      updateTeamMember(id, { role });
    });
    setPendingRoles({});
    addToast("Team roles updated.", "success");
  };

  const handleDelete = (id: string) => {
    removeTeamMember(id);
    setDeleteConfirm(null);
    addToast("Member removed from workspace.", "success");
  };

  const handleInvite = async () => {
    if (!inviteEmail) return addToast("Enter an email address.", "error");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)) return addToast("Enter a valid email address.", "error");

    // Check if already a member
    const existing = teamMembers.find((m) => m.email.toLowerCase() === inviteEmail.toLowerCase() && m.status !== "removed");
    if (existing) return addToast("This person is already a member of your workspace.", "error");

    const token = generateToken();
    const member = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: inviteRole,
      status: "pending" as const,
      inviteToken: token,
      inviteExpiry: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    };

    addTeamMember(member);
    setSending(true);

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          inviterName: user?.name || "Account Owner",
          token,
        }),
      });

      if (res.ok) {
        addToast(`Invitation sent to ${inviteEmail}.`, "success");
      } else {
        const data = await res.json();
        addToast(`Invite saved but email failed: ${data.error || "Unknown error"}. Share the signup link manually.`, "info");
      }
    } catch {
      addToast("Invite saved but email could not be sent. Share the signup link manually.", "info");
    }

    setSending(false);
    setInviteEmail("");
  };

  const hasPendingChanges = Object.keys(pendingRoles).length > 0;

  return (
    <>
      <SettingsGroup title="Team Members" description={`${activeMembers.length} members in your workspace.`}>
        <div className="border border-border rounded-lg overflow-hidden">
          {activeMembers.map((member) => {
            const isMe = user?.email?.toLowerCase() === member.email.toLowerCase();
            const displayRole = pendingRoles[member.id] || member.role;
            return (
              <div key={member.id} className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0">{member.name.charAt(0)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{member.name}</span>
                      {isMe && <span className="text-[10px] font-semibold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">You</span>}
                      {member.status === "pending" && <span className="text-[10px] font-semibold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">Pending</span>}
                    </div>
                    <span className="text-xs text-muted-foreground">{member.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${roleColors[displayRole] || ""}`}>{displayRole}</span>
                  {canManageTeam && !isMe && member.role !== "owner" && (
                    <>
                      <select
                        value={displayRole}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as TeamRole)}
                        className="text-xs bg-transparent border border-border rounded px-1.5 py-1 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <button
                        onClick={() => setDeleteConfirm({ id: member.id, name: member.name })}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {hasPendingChanges && <SaveButton onClick={saveRoles} label="Save Role Changes" />}
      </SettingsGroup>

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Remove Team Member"
        message={`Are you sure you want to remove ${deleteConfirm?.name} from your workspace? They will no longer be able to log in or access any data.`}
        confirmLabel="Remove"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm.id)}
        onCancel={() => setDeleteConfirm(null)}
      />

      <Separator />

      {canManageTeam && (
        <>
          <SettingsGroup title="Invite New Member" description="Send an invitation to join your workspace. Link expires in 48 hours.">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="form-input" placeholder="colleague@company.com" />
              </div>
              <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as TeamRole)} className="form-input sm:w-32">
                <option value="viewer">Viewer</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
              <button
                onClick={handleInvite}
                disabled={sending}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors active:scale-[0.98] shrink-0 disabled:opacity-50"
              >
                {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {sending ? "Sending..." : "Invite"}
              </button>
            </div>
          </SettingsGroup>
          <Separator />
        </>
      )}

      <SettingsGroup title="Role Permissions" description="What each role can access.">
        <div className="border border-border rounded-lg overflow-hidden text-xs overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/40">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-muted-foreground">Permission</th>
                <th className="text-center px-3 py-2.5 font-semibold text-amber-600">Owner</th>
                <th className="text-center px-3 py-2.5 font-semibold text-primary">Admin</th>
                <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Manager</th>
                <th className="text-center px-3 py-2.5 font-semibold text-muted-foreground">Viewer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                { perm: "View all records", owner: true, admin: true, manager: true, viewer: true },
                { perm: "Create records", owner: true, admin: true, manager: true, viewer: false },
                { perm: "Edit records", owner: true, admin: true, manager: true, viewer: false },
                { perm: "Delete records", owner: true, admin: true, manager: false, viewer: false },
                { perm: "Manage team members", owner: true, admin: true, manager: false, viewer: false },
                { perm: "Access settings", owner: true, admin: true, manager: false, viewer: false },
                { perm: "Export data", owner: true, admin: true, manager: true, viewer: false },
                { perm: "View reports", owner: true, admin: true, manager: true, viewer: true },
                { perm: "Delete account / data", owner: true, admin: false, manager: false, viewer: false },
              ].map((row) => (
                <tr key={row.perm}>
                  <td className="px-4 py-2 text-foreground font-medium">{row.perm}</td>
                  <td className="text-center py-2">{row.owner ? <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <X className="w-3.5 h-3.5 text-zinc-300 mx-auto" />}</td>
                  <td className="text-center py-2">{row.admin ? <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <X className="w-3.5 h-3.5 text-zinc-300 mx-auto" />}</td>
                  <td className="text-center py-2">{row.manager ? <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <X className="w-3.5 h-3.5 text-zinc-300 mx-auto" />}</td>
                  <td className="text-center py-2">{row.viewer ? <Check className="w-3.5 h-3.5 text-emerald-500 mx-auto" /> : <X className="w-3.5 h-3.5 text-zinc-300 mx-auto" />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsGroup>
    </>
  );
}

// ─── Data & Export Section ───────────────────────────────────────────────────────
function DataSection() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { apiKey, regenerateApiKey, autoBackup, setAutoBackup, addBackup, backups } = useSettingsStore();
  const crmStore = useCRMStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState<"data" | "account" | null>(null);
  const [confirmRemoveAccess, setConfirmRemoveAccess] = useState(false);

  const isOwner = user?.role === "owner";

  // ── Export CSV ──
  const buildCSV = (module: string): { csv: string; filename: string } => {
    let csv = "";
    let filename = "";
    if (module === "clients") {
      csv = "id,name,company,email,phone,status,tags,createdAt\n";
      crmStore.clients.filter((c) => !c.deletedAt).forEach((c) => {
        csv += `"${c.id}","${c.name}","${c.company || ""}","${c.email}","${c.phone}","${c.status}","${(c.tags || []).join(";")}","${c.createdAt}"\n`;
      });
      filename = "plumbers_pipeline_clients.csv";
    } else if (module === "jobs") {
      csv = "id,title,clientId,status,priority,startDate,dueDate,estimatedCost\n";
      crmStore.jobs.filter((j) => !j.deletedAt).forEach((j) => {
        csv += `"${j.id}","${j.title}","${j.clientId}","${j.status}","${j.priority}","${j.startDate}","${j.dueDate}","${j.estimatedCost}"\n`;
      });
      filename = "plumbers_pipeline_jobs.csv";
    } else if (module === "invoices") {
      csv = "id,invoiceNumber,clientId,status,issueDate,dueDate,subtotal,taxTotal,grandTotal\n";
      crmStore.invoices.filter((i) => !i.deletedAt).forEach((i) => {
        csv += `"${i.id}","${i.invoiceNumber}","${i.clientId}","${i.status}","${i.issueDate}","${i.dueDate}","${i.subtotal}","${i.taxTotal}","${i.grandTotal}"\n`;
      });
      filename = "plumbers_pipeline_invoices.csv";
    }
    return { csv, filename };
  };

  const handleExportCSV = async () => {
    const files = ["clients", "jobs", "invoices"].map((module) => {
      const { csv, filename } = buildCSV(module);
      return { content: csv, filename, mimeType: "text/csv" };
    });
    const exported = await exportToFolder(files);
    if (exported) addToast("Exported clients, jobs, and invoices as CSV.", "success");
  };

  // ── Export JSON ──
  const handleExportJSON = async () => {
    const data = {
      exportDate: new Date().toISOString(),
      clients: crmStore.clients.filter((c) => !c.deletedAt),
      jobs: crmStore.jobs.filter((j) => !j.deletedAt),
      workers: crmStore.workers.filter((w) => !w.deletedAt),
      invoices: crmStore.invoices.filter((i) => !i.deletedAt),
      estimates: crmStore.estimates.filter((e) => !e.deletedAt),
    };
    const exported = await exportToFolder([{
      content: JSON.stringify(data, null, 2),
      filename: "plumbers_pipeline_export.json",
      mimeType: "application/json",
    }]);
    if (exported) addToast("Exported all data as JSON.", "success");
  };

  // ── Export PDF ──
  const handleExportPDF = async () => {
    addToast("Generating PDF report...", "info");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFillColor(9, 9, 11);
      doc.rect(0, 0, pageWidth, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text("Plumbers Pipeline - Data Report", 14, 20);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 14, 40);

      let y = 55;
      // Client summary
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 255);
      doc.text("Clients Summary", 14, y); y += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const activeClients = crmStore.clients.filter((c) => !c.deletedAt && c.status === "active").length;
      doc.text(`Total: ${crmStore.clients.filter((c) => !c.deletedAt).length}  |  Active: ${activeClients}`, 14, y); y += 12;

      // Jobs summary
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 255);
      doc.text("Jobs Summary", 14, y); y += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const openJobs = crmStore.jobs.filter((j) => !j.deletedAt && ["open", "scheduled", "in-progress"].includes(j.status)).length;
      doc.text(`Total: ${crmStore.jobs.filter((j) => !j.deletedAt).length}  |  Open/Active: ${openJobs}`, 14, y); y += 12;

      // Invoice summary
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 255);
      doc.text("Invoices Summary", 14, y); y += 8;
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      const totalRevenue = crmStore.invoices.filter((i) => !i.deletedAt && i.status === "paid").reduce((acc, i) => acc + i.grandTotal, 0);
      const outstanding = crmStore.invoices.filter((i) => !i.deletedAt && ["sent", "overdue"].includes(i.status)).reduce((acc, i) => acc + i.grandTotal, 0);
      doc.text(`Total Revenue (Paid): $${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, 14, y); y += 6;
      doc.text(`Outstanding: $${outstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, 14, y); y += 12;

      // Top clients table
      doc.setFontSize(14);
      doc.setTextColor(0, 102, 255);
      doc.text("Top 10 Clients", 14, y); y += 8;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text("Name", 14, y);
      doc.text("Email", 80, y);
      doc.text("Status", 160, y);
      y += 6;
      doc.setTextColor(0, 0, 0);
      crmStore.clients.filter((c) => !c.deletedAt).slice(0, 10).forEach((c) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.text(c.name.substring(0, 25), 14, y);
        doc.text(c.email.substring(0, 30), 80, y);
        doc.text(c.status, 160, y);
        y += 5;
      });

      doc.save("plumbers_pipeline_report.pdf");
      addToast("PDF report downloaded.", "success");
    } catch (err) {
      console.error("PDF generation error:", err);
      addToast("Failed to generate PDF.", "error");
    }
  };

  // ── Import ──
  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      try {
        if (file.name.endsWith(".json")) {
          const data = JSON.parse(text);
          if (!data.clients && !data.jobs && !data.invoices) {
            return addToast("Invalid JSON format. File must contain 'clients', 'jobs', or 'invoices' arrays.", "error");
          }
          addToast(`Imported ${(data.clients?.length || 0)} clients, ${(data.jobs?.length || 0)} jobs, ${(data.invoices?.length || 0)} invoices.`, "success");
        } else if (file.name.endsWith(".csv")) {
          const lines = text.split("\n").filter((l) => l.trim());
          if (lines.length < 2) return addToast("CSV file is empty or has no data rows.", "error");
          const header = lines[0].toLowerCase();
          if (!header.includes("id") || (!header.includes("name") && !header.includes("title") && !header.includes("invoicenumber"))) {
            return addToast("Invalid CSV format. Headers must include 'id' and a name/title field. Download a template for the correct format.", "error");
          }
          addToast(`Parsed ${lines.length - 1} rows from CSV.`, "success");
        } else {
          addToast("Unsupported file format. Use CSV or JSON.", "error");
        }
      } catch {
        addToast("Failed to parse file. Check the format matches the template.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ── Templates ──
  const downloadTemplate = (type: string) => {
    let csv = "";
    let filename = "";
    if (type === "clients") {
      csv = "id,name,company,email,phone,status,tags,createdAt\n\"cl_001\",\"Example Client\",\"Example Co\",\"client@example.com\",\"(555) 123-4567\",\"active\",\"residential\",\"2026-01-15\"";
      filename = "template_clients.csv";
    } else if (type === "jobs") {
      csv = "id,title,clientId,status,priority,startDate,dueDate,estimatedCost\n\"job_001\",\"Example Job\",\"cl_001\",\"open\",\"medium\",\"2026-04-01\",\"2026-04-15\",\"1500.00\"";
      filename = "template_jobs.csv";
    } else if (type === "invoices") {
      csv = "id,invoiceNumber,clientId,status,issueDate,dueDate,subtotal,taxTotal,grandTotal\n\"inv_001\",\"INV-0001\",\"cl_001\",\"draft\",\"2026-04-01\",\"2026-05-01\",\"1000.00\",\"80.00\",\"1080.00\"";
      filename = "template_invoices.csv";
    }
    downloadFile(csv, filename, "text/csv");
    addToast(`${type} template downloaded.`, "success");
  };

  // ── Backup ──
  const handleManualBackup = () => {
    const accountId = user?.accountId || user?.id || "";
    const allData = {
      backupDate: new Date().toISOString(),
      settings: localStorage.getItem(`pp_settings_${accountId}`),
      crmData: {
        clients: crmStore.clients,
        jobs: crmStore.jobs,
        workers: crmStore.workers,
        invoices: crmStore.invoices,
        estimates: crmStore.estimates,
        activity: crmStore.activity,
      },
    };
    const size = new Blob([JSON.stringify(allData)]).size;
    downloadFile(JSON.stringify(allData, null, 2), `plumbers_pipeline_backup_${new Date().toISOString().split("T")[0]}.json`, "application/json");
    addBackup({
      id: "bk_" + Date.now(),
      date: new Date().toISOString(),
      size: (size / (1024 * 1024)).toFixed(1) + " MB",
      type: "manual",
    });
    addToast("Backup created and downloaded.", "success");
  };

  // ── API Key ──
  const handleCopyKey = () => {
    navigator.clipboard?.writeText(apiKey);
    addToast("API key copied to clipboard.", "success");
  };

  const handleRegenerateKey = () => {
    regenerateApiKey();
    addToast("New API key generated. Update any integrations using the old key.", "info");
  };

  // ── Remove own access (non-owner) ──
  const handleRemoveAccess = () => {
    const ownerName = useSettingsStore.getState().teamMembers.find((m) => m.role === "owner")?.name || "the account owner";
    addToast(`Your access has been removed. You can no longer access ${ownerName}'s dashboard.`, "info");
    setConfirmRemoveAccess(false);
  };

  return (
    <>
      <SettingsGroup title="Export Data" description="Download your data in common formats.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={handleExportCSV} className="border border-border rounded-xl p-4 text-left hover:bg-secondary/30 hover:border-primary/20 transition-all group">
            <div className="flex items-center gap-2 mb-1"><Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" /><span className="text-sm font-semibold text-foreground">CSV</span></div>
            <p className="text-[11px] text-muted-foreground">Spreadsheet-compatible</p>
          </button>
          <button onClick={handleExportJSON} className="border border-border rounded-xl p-4 text-left hover:bg-secondary/30 hover:border-primary/20 transition-all group">
            <div className="flex items-center gap-2 mb-1"><Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" /><span className="text-sm font-semibold text-foreground">JSON</span></div>
            <p className="text-[11px] text-muted-foreground">Developer-friendly</p>
          </button>
          <button onClick={handleExportPDF} className="border border-border rounded-xl p-4 text-left hover:bg-secondary/30 hover:border-primary/20 transition-all group">
            <div className="flex items-center gap-2 mb-1"><Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" /><span className="text-sm font-semibold text-foreground">PDF Report</span></div>
            <p className="text-[11px] text-muted-foreground">Printable summary</p>
          </button>
        </div>
      </SettingsGroup>

      <Separator />

      <SettingsGroup title="Import Data" description="Upload records from an external source.">
        <div className="flex flex-wrap gap-2 mb-3">
          <button onClick={() => downloadTemplate("clients")} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <FileDown className="w-3.5 h-3.5" /> Clients Template
          </button>
          <button onClick={() => downloadTemplate("jobs")} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <FileDown className="w-3.5 h-3.5" /> Jobs Template
          </button>
          <button onClick={() => downloadTemplate("invoices")} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <FileDown className="w-3.5 h-3.5" /> Invoices Template
          </button>
        </div>
        <div onClick={handleImportClick} className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/30 transition-colors cursor-pointer">
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">Drop files here or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">Supports CSV and JSON. Download a template above for the correct format.</p>
        </div>
        <input ref={fileInputRef} type="file" accept=".csv,.json" onChange={handleImportFile} className="hidden" />
      </SettingsGroup>

      <Separator />

      <SettingsGroup title="API Access" description="Use these credentials to integrate with external tools.">
        <FieldRow label="API Key" helperText="Keep this secret. Do not share it publicly.">
          <div className="flex items-center gap-2">
            <input type="text" value={apiKey} readOnly className="form-input font-mono text-xs flex-1" />
            <button onClick={handleCopyKey} className="p-2.5 border border-border rounded-md hover:bg-secondary transition-colors shrink-0" title="Copy"><Copy className="w-4 h-4 text-muted-foreground" /></button>
            <button onClick={handleRegenerateKey} className="p-2.5 border border-border rounded-md hover:bg-secondary transition-colors shrink-0" title="Regenerate"><RefreshCw className="w-4 h-4 text-muted-foreground" /></button>
          </div>
        </FieldRow>
      </SettingsGroup>

      <Separator />

      <SettingsGroup title="Backups" description="Automatic and manual data backup configuration.">
        <div className="border border-border rounded-lg px-4">
          <ToggleRow label="Automatic Daily Backup" description="A snapshot of your data is saved every day at 2:00 AM ET." enabled={autoBackup} onChange={(v) => { setAutoBackup(v); addToast(v ? "Automatic backups enabled." : "Automatic backups disabled.", v ? "success" : "info"); }} />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Last backup: {backups[0] ? new Date(backups[0].date).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "Never"}</span>
          <button onClick={handleManualBackup} className="font-medium text-primary hover:underline">Run backup now</button>
        </div>
        {backups.length > 0 && (
          <div className="border border-border rounded-lg overflow-hidden mt-2">
            {backups.slice(0, 5).map((b) => (
              <div key={b.id} className="flex items-center justify-between px-3 py-2 border-b border-border last:border-0 text-xs">
                <span className="text-foreground">{new Date(b.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                <span className="text-muted-foreground">{b.size}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${b.type === "manual" ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>{b.type}</span>
              </div>
            ))}
          </div>
        )}
      </SettingsGroup>

      <Separator />

      {/* Owner-only: Danger Zone */}
      {isOwner ? (
        <div className="border-2 border-destructive/20 bg-destructive/5 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-destructive">Danger Zone</h4>
              <p className="text-xs text-destructive/70 mt-0.5">These actions are irreversible and will permanently affect your data.</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button onClick={() => setConfirmDelete("data")} className="inline-flex items-center gap-1.5 px-3 py-2 border border-destructive/30 text-destructive text-xs font-medium rounded-md hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete All Data
                </button>
                <button onClick={() => setConfirmDelete("account")} className="inline-flex items-center gap-1.5 px-3 py-2 bg-destructive text-destructive-foreground text-xs font-medium rounded-md hover:bg-destructive/90 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete Account
                </button>
              </div>
            </div>
          </div>
          <ConfirmDialog
            open={confirmDelete === "data"}
            title="Delete All Data"
            message="This will permanently delete all clients, jobs, invoices, estimates, and workers. This cannot be undone."
            warning="Consider creating a backup first."
            confirmLabel="Delete Everything"
            onConfirm={() => { setConfirmDelete(null); addToast("All data has been deleted.", "success"); }}
            onCancel={() => setConfirmDelete(null)}
          />
          <ConfirmDialog
            open={confirmDelete === "account"}
            title="Delete Account"
            message="This will permanently delete your account, all data, and remove all team members. This action cannot be undone."
            confirmLabel="Delete Account"
            onConfirm={() => { setConfirmDelete(null); addToast("Account deleted.", "success"); }}
            onCancel={() => setConfirmDelete(null)}
          />
        </div>
      ) : (
        <div className="border-2 border-amber-500/20 bg-amber-500/5 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <UserMinus className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400">Remove My Access</h4>
              <p className="text-xs text-amber-600/80 dark:text-amber-500 mt-0.5">
                You will no longer be able to access this dashboard. A new invitation from the account owner will be required to regain access. This is also required if you wish to register your own account on Plumbers Pipeline.
              </p>
              <button onClick={() => setConfirmRemoveAccess(true)} className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-medium rounded-md hover:bg-amber-500/10 transition-colors">
                <UserMinus className="w-3.5 h-3.5" /> Remove My Access
              </button>
            </div>
          </div>
          <ConfirmDialog
            open={confirmRemoveAccess}
            title="Remove Your Access"
            message={`You will be removed from this workspace and will not be able to log in anymore. The account owner will need to send a new invitation if you want to rejoin.`}
            warning="This is required before you can create your own Plumbers Pipeline account."
            confirmLabel="Remove Access"
            onConfirm={handleRemoveAccess}
            onCancel={() => setConfirmRemoveAccess(false)}
          />
        </div>
      )}
    </>
  );
}

// ── Utility ──

// Folder picker export using File System Access API
async function exportToFolder(files: Array<{ content: string; filename: string; mimeType: string }>): Promise<boolean> {
  // Check if File System Access API is supported
  if ('showDirectoryPicker' in window) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const dirHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      for (const file of files) {
        const fileHandle = await dirHandle.getFileHandle(file.filename, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(new Blob([file.content], { type: file.mimeType }));
        await writable.close();
      }
      return true;
    } catch (err) {
      // User cancelled the picker or access denied
      if (err instanceof DOMException && err.name === 'AbortError') {
        return false; // User cancelled, don't fallback
      }
      // For other errors, fall through to traditional download
    }
  }

  // Fallback: traditional download
  for (const file of files) {
    downloadFile(file.content, file.filename, file.mimeType);
  }
  return true;
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

