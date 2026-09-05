const fs = require('fs');

// 1. Fix MartAdmin.tsx
let adminCode = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

// Revert CATEGORIES id to '야채' and add label
adminCode = adminCode.replace(
  "{ id: '야채·수산', icon: '🥬🐟' }",
  "{ id: '야채', label: '야채·수산', icon: '🥬🐟' }"
);
// In case it was already something else
adminCode = adminCode.replace(
  "{ id: '야채', icon: '🥬🐟' }",
  "{ id: '야채', label: '야채·수산', icon: '🥬🐟' }"
);

// Fix the render part of the tab
const tabRegex = /<span className="text-xl">\{cat\.icon\}<\/span>\s*\{cat\.id\}\s*<\/button>/;
const tabReplacement = `<span className="text-xl">{cat.icon}</span>\n                {cat.label || cat.id}\n              </button>`;
if (adminCode.match(tabRegex)) {
  adminCode = adminCode.replace(tabRegex, tabReplacement);
}

// Revert ITEM_DICT key back to '야채'
adminCode = adminCode.replace(
  /'야채·수산': \[/,
  `'야채': [`
);

// If activeTab is initialized to '야채·수산', revert it (though usually it's '정육')
adminCode = adminCode.replace(/useState\('야채·수산'\)/, `useState('정육')`);

fs.writeFileSync('src/components/MartAdmin.tsx', adminCode, 'utf8');

// 2. Fix sale/page.tsx
let pageCode = fs.readFileSync('src/app/store/[storeId]/sale/page.tsx', 'utf8');

pageCode = pageCode.replace(
  "{ id: '야채·수산', title: '신선채소 · 수산', subtitle: 'Vegetables & Seafood' }",
  "{ id: '야채', title: '신선채소 · 수산', subtitle: 'Vegetables & Seafood' }"
);

fs.writeFileSync('src/app/store/[storeId]/sale/page.tsx', pageCode, 'utf8');

console.log("Reverted DB ID to '야채' but kept UI label as '야채·수산'");
