const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const regex = /\[\.\.\.history\.nao3_sale_items\]\.sort\(\(a: any, b: any\) => \{/g;
const newStr = `Array.from(new Map(history.nao3_sale_items.map((i: any) => [i.product_name, i])).values()).sort((a: any, b: any) => {`;

if (c.match(regex)) {
  c = c.replace(regex, newStr);
  fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
  console.log("Successfully deduplicated history items for rendering.");
} else {
  console.log("Could not find the target string.");
}
