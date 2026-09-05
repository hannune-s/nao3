const fs = require('fs');
let c = fs.readFileSync('src/app/store/[storeId]/sale/page.tsx', 'utf8');

c = c.replace(
  "{ id: '야채', title: '산지직송 신선 채소', subtitle: 'Fresh Vegetables' }",
  "{ id: '야채', title: '신선채소 · 수산', subtitle: 'Vegetables & Seafood' }"
);

fs.writeFileSync('src/app/store/[storeId]/sale/page.tsx', c, 'utf8');
console.log("Updated category title to 신선채소 · 수산");
