const fs = require('fs');

// 1. Fix store/[storeId]/page.tsx (line 20 issue and ButcherAdmin issue)
let adminPage = fs.readFileSync('src/app/store/[storeId]/page.tsx', 'utf8');
adminPage = adminPage.replace(/if \(session\.user\.id !== storeId\)/, "if (session.user.id !== store.id)");
adminPage = adminPage.replace(/storeSlug=\{storeData\.slug\} /g, ""); // Remove it from ButcherAdmin since it doesn't need it yet
fs.writeFileSync('src/app/store/[storeId]/page.tsx', adminPage, 'utf8');

// 2. Fix MartAdminProps in MartAdmin.tsx
let martAdmin = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');
martAdmin = martAdmin.replace(/interface MartAdminProps \{\s*storeId: string;\s*initialStoreName: string;\s*\}/, 
`interface MartAdminProps {
  storeId: string;
  initialStoreName: string;
  storeSlug?: string;
}`);
fs.writeFileSync('src/components/MartAdmin.tsx', martAdmin, 'utf8');

// 3. Fix sale/page.tsx null check
let salePage = fs.readFileSync('src/app/store/[storeId]/sale/page.tsx', 'utf8');
salePage = salePage.replace(/\.eq\('store_id', store\.id\)/, ".eq('store_id', store?.id)");
fs.writeFileSync('src/app/store/[storeId]/sale/page.tsx', salePage, 'utf8');

console.log("Fixes applied");
