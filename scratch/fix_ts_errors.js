const fs = require('fs');

// Fix estimates/new/page.tsx
const estPath = 'src/app/(dashboard)/app/estimates/new/page.tsx';
let est = fs.readFileSync(estPath, 'utf8');
est = est.replace(/clientId: form\.clientId,\n\s*jobId: null,/g, `clientId: form.clientId,\n      customerPO: null,\n      jobId: null,`);
fs.writeFileSync(estPath, est);

// Fix invoices/new/page.tsx
const invPath = 'src/app/(dashboard)/app/invoices/new/page.tsx';
let inv = fs.readFileSync(invPath, 'utf8');
inv = inv.replace(/clientId: form\.clientId,\n\s*jobId:(.*?)\n/g, `clientId: form.clientId,\n      customerPO: null,\n      jobId:$1\n`);
fs.writeFileSync(invPath, inv);
