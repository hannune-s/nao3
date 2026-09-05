const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const regex = /\/\/ 만약 현재 Active 기간이고, DB에 이미 같은 상품이 있다면\?[\s\S]*?let targetHistoryItemId = editingHistoryItemId;\s*if \(\!targetHistoryItemId && isSamePeriod && latestPush\.nao3_sale_items\) \{[\s\S]*?const dbMatch = latestPush\.nao3_sale_items\.find\(\(i: any\) => i\.product_name === newItem\.product_name\);[\s\S]*?if \(dbMatch\) \{[\s\S]*?targetHistoryItemId = \{ pushId: latestPush\.id, itemId: dbMatch\.id \};[\s\S]*?\}[\s\S]*?\}/;

c = c.replace(regex, 'let targetHistoryItemId = editingHistoryItemId;');

// Remove the filter from setItems if editing
const filterRegex = /setEditingHistoryItemId\(null\);\s*setItems\(prev => prev\.filter\(i => i\.product_name !== newItem\.product_name\)\);/;
c = c.replace(filterRegex, 'setEditingHistoryItemId(null);');

fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
console.log("Successfully removed auto targetHistoryItemId.");
