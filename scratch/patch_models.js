const fs = require('fs');

const path = 'src/data/estimates.ts';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('serviceAddress')) {
  // Insert serviceAddress into Estimate type
  content = content.replace(
    /customerPO: string \| null;/g,
    `customerPO: string | null;\n  serviceAddress: string | null;`
  );
  
  // Insert into mock data
  content = content.replace(
    /customerPO: null,/g,
    `customerPO: null,\n    serviceAddress: null,`
  );
  
  fs.writeFileSync(path, content);
  console.log("Updated estimates.ts");
}

const invPath = 'src/data/invoices.ts';
let invContent = fs.readFileSync(invPath, 'utf8');
if (!invContent.includes('serviceAddress')) {
  invContent = invContent.replace(
    /customerPO: string \| null;/g,
    `customerPO: string | null;\n  serviceAddress: string | null;`
  );
  invContent = invContent.replace(
    /customerPO: null,/g,
    `customerPO: null,\n    serviceAddress: null,`
  );
  fs.writeFileSync(invPath, invContent);
  console.log("Updated invoices.ts");
}
