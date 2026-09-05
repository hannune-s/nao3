const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const regex = /const recentNames = Array\.from\(new Set\(histories\.flatMap\(h => h\.nao3_sale_items\.map\(\(i: any\) => i\.product_name\)\)\)\)\.filter\(Boolean\);/;
const replacement = "const recentNames = Array.from(new Set(histories.flatMap(h => h.nao3_sale_items.filter((i: any) => i.category === activeTab).map((i: any) => i.product_name)))).filter(Boolean);";

if (c.match(regex)) {
  c = c.replace(regex, replacement);
  fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
  console.log('Successfully scoped autocomplete names by category.');
} else {
  console.log('Could not find the target line.');
}
