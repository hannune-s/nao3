const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const regex = /setEditingHistoryItemId\(null\);\n\s*\/\/\s*대기열에도 업데이트 반영\n\s*if\s*\(existingIndex !== -1\)[\s\S]*?setItems\(prev => prev\.filter\(i => i\.product_name !== newItem\.product_name\)\);\n\s*setNewItem\(\{ product_name: '', quantity: '', sale_price: '' \}\);/g;

c = c.replace(regex, `setEditingHistoryItemId(null);
                    setNewItem({ product_name: '', quantity: '', sale_price: '' });`);

fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
console.log("Fixed cancel button");
