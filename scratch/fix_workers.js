const fs = require('fs');

const files = [
  'src/app/(dashboard)/app/workers/new/page.tsx',
  'src/app/(dashboard)/app/workers/[id]/edit/page.tsx'
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
