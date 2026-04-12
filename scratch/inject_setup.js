const fs = require('fs');

const code = `
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

      <SettingsGroup title="Job Defaults" description="Set standard descriptions or disclaimers appended to jobs.">
        <FieldRow label="Default Job Disclaimer">
          <textarea value={local.defaultJobNote} onChange={(e) => setLocal(p => ({ ...p, defaultJobNote: e.target.value }))} className="form-input min-h-[80px] resize-y" placeholder="The final price may be within +/-10%..." />
        </FieldRow>
      </SettingsGroup>

      <SaveButton onClick={handleSave} />
    </>
  );
}

`;

const target = 'src/components/settings-panel.tsx';
let content = fs.readFileSync(target, 'utf8');

// Insert it right before "// ─── Security Section"
content = content.replace('// ─── Security Section ───────────────────────────────────────────────────────────', code + '// ─── Security Section ───────────────────────────────────────────────────────────');

fs.writeFileSync(target, content);
