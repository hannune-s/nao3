const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const target = `const isExpanded = expandedHistory === history.id;`;
const replacement = `const isExpanded = expandedHistory === history.id;
            const uniqueItemCount = history.nao3_sale_items ? new Set(history.nao3_sale_items.map((i: any) => i.product_name)).size : 0;`;

c = c.replace(target, replacement);

const badgeTarget = `{history.item_count}건`;
const badgeReplacement = `{uniqueItemCount}건`;
c = c.replace(badgeTarget, badgeReplacement);

fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
console.log('Successfully updated item count logic.');
