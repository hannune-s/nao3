const fs = require('fs');

// Update MartAdmin.tsx
let adminCode = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

// 1. Update CATEGORIES
adminCode = adminCode.replace(
  "{ id: '야채', icon: '🥬' }",
  "{ id: '야채·수산', icon: '🥬🐟' }"
);

// 2. Update ITEM_DICT
const vegRegex = /'야채': \[.*?\],/;
const vegMatch = adminCode.match(vegRegex);
if (vegMatch) {
  const currentVegStr = vegMatch[0];
  const arrStr = currentVegStr.substring(currentVegStr.indexOf('[') + 1, currentVegStr.lastIndexOf(']'));
  const currentVeg = arrStr.split(',').map(s => s.trim().replace(/'/g, ''));
  
  const seafoodItems = ['생물 오징어', '손질 오징어', '제주 은갈치', '생물 고등어', '활전복', '해감 바지락', '생굴', '꽃게', '생물 새우', '주꾸미', '동태', '생태', '자른 미역', '다시마', '국물용 멸치', '볶음용 멸치'];
  
  const merged = [...new Set([...currentVeg, ...seafoodItems])].filter(Boolean);
  
  const replacementStr = `'야채·수산': ['` + merged.join("', '") + `'],`;
  adminCode = adminCode.replace(vegRegex, replacementStr);
}

// 3. Update QTY_DICT
const qtyRegex = /const QTY_DICT = \[\s*([\s\S]*?)\s*\];/;
const qtyMatch = adminCode.match(qtyRegex);
if (qtyMatch) {
  let qtyItems = qtyMatch[1].split(',').map(s => s.trim().replace(/'/g, '').replace(/\n/g, '')).filter(Boolean);
  const newQtys = ['1마리', '2마리', '3마리', '4마리', '1손(2마리)'];
  const mergedQtys = [...new Set([...qtyItems, ...newQtys])];
  const replacementQtyStr = `const QTY_DICT = [\n  '` + mergedQtys.join("', '") + `'\n];`;
  adminCode = adminCode.replace(qtyRegex, replacementQtyStr);
}

fs.writeFileSync('src/components/MartAdmin.tsx', adminCode, 'utf8');

// Update page.tsx for customer view
let pageCode = fs.readFileSync('src/app/store/[storeId]/sale/page.tsx', 'utf8');
pageCode = pageCode.replace(
  "{ id: '야채', title: '신선채소 · 수산', subtitle: 'Vegetables & Seafood' }",
  "{ id: '야채·수산', title: '신선채소 · 수산', subtitle: 'Vegetables & Seafood' }"
);

fs.writeFileSync('src/app/store/[storeId]/sale/page.tsx', pageCode, 'utf8');

console.log("Successfully updated to 야채·수산");
