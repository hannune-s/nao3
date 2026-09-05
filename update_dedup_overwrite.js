const fs = require('fs');

let adminCode = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

// 1. Change existingIndex to only check product_name
adminCode = adminCode.replace(
  "const existingIndex = items.findIndex(i => i.product_name === newItem.product_name && i.quantity === newItem.quantity);",
  "const existingIndex = items.findIndex(i => i.product_name === newItem.product_name);"
);

// 2. Change the update logic in the else block
const updateLogicRegex = /\/\/ 이미 동일한 품목\+단위가 있다면 가격만 업데이트 \(중복 방지\)[\s\S]*?setItems\(newItems\);/;
const newUpdateLogic = `// 이미 동일한 이름의 품목이 있다면 중량과 가격을 모두 최신으로 덮어씌움 (완벽한 Update)
        const newItems = [...items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItem.quantity,
          sale_price: formattedPrice,
          category: activeTab
        };
        setItems(newItems);`;

if (adminCode.match(updateLogicRegex)) {
  adminCode = adminCode.replace(updateLogicRegex, newUpdateLogic);
} else {
  console.log("Could not find update logic in MartAdmin.tsx");
}

fs.writeFileSync('src/components/MartAdmin.tsx', adminCode, 'utf8');
console.log("Successfully updated deduplication to overwrite by product name.");
