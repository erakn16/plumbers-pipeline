const fs = require('fs');

// 1. Update jobs.ts
let jobsContent = fs.readFileSync('src/data/jobs.ts', 'utf8');
jobsContent = jobsContent.replace(/actualCost: (.*?),\n\s*notes:/g, `actualCost: $1,\n    lineItems: [],\n    subtotal: 0,\n    taxTotal: 0,\n    discount: 0,\n    grandTotal: 0,\n    notes:`);
jobsContent = jobsContent.replace(/title: (.*?),\n\s*clientId:/g, `title: $1,\n    customerPO: null,\n    clientId:`);
fs.writeFileSync('src/data/jobs.ts', jobsContent);

// 2. Update estimates.ts
let estContent = fs.readFileSync('src/data/estimates.ts', 'utf8');
estContent = estContent.replace(/tax: number;\n};/g, `tax: number;\n  taxRate?: number;\n  taxNote?: string;\n};`);
estContent = estContent.replace(/status: "draft"(.*?)"expired";/g, `status: "draft" | "sent" | "accepted" | "declined" | "expired" | "job_created";`);
estContent = estContent.replace(/estimateNumber: (.*?),\n\s*clientId:/g, `estimateNumber: $1,\n    customerPO: null,\n    clientId:`);
estContent = estContent.replace(/estimateNumber: string;\n\s*clientId:/g, `estimateNumber: string;\n  customerPO: string | null;\n  clientId:`);
fs.writeFileSync('src/data/estimates.ts', estContent);

// 3. Update invoices.ts
let invContent = fs.readFileSync('src/data/invoices.ts', 'utf8');
invContent = invContent.replace(/tax: number;\n};/g, `tax: number;\n  taxRate?: number;\n  taxNote?: string;\n};`);
invContent = invContent.replace(/invoiceNumber: (.*?),\n\s*clientId:/g, `invoiceNumber: $1,\n    customerPO: null,\n    clientId:`);
invContent = invContent.replace(/invoiceNumber: string;\n\s*clientId:/g, `invoiceNumber: string;\n  customerPO: string | null;\n  clientId:`);
fs.writeFileSync('src/data/invoices.ts', invContent);

// 4. Update clients.ts (changing address to addresses)
let cliContent = fs.readFileSync('src/data/clients.ts', 'utf8');
cliContent = cliContent.replace(/address: string;\n\s*city: string;\n\s*state: string;\n\s*zip: string;/g, `addresses: { id: string; street: string; city: string; state: string; zip: string; isDefault: boolean }[];`);
cliContent = cliContent.replace(/address: "(.*?)",\n\s*city: "(.*?)",\n\s*state: "(.*?)",\n\s*zip: "(.*?)",/g, 
  `addresses: [{ id: "addr_1", street: "$1", city: "$2", state: "$3", zip: "$4", isDefault: true }],`);
fs.writeFileSync('src/data/clients.ts', cliContent);

console.log('Update complete');
