const fs = require('fs');

const files = [
  'src/app/(dashboard)/app/estimates/new/page.tsx',
  'src/app/(dashboard)/app/jobs/new/page.tsx',
  'src/app/(dashboard)/app/jobs/[id]/edit/page.tsx',
  'src/app/(dashboard)/app/invoices/new/page.tsx',
  'src/app/(dashboard)/app/invoices/[id]/edit/page.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Fix escaped backticks
    content = content.replace(/\\`/g, '`');
    // Fix escaped dollar signs
    content = content.replace(/\\\$/g, '$');
    
    fs.writeFileSync(file, content);
    console.log(`Patched ${file}`);
  }
}
