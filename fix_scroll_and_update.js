const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

// 1. Remove the annoying scroll
const scrollRegex = /setTimeout\(\(\) => \{ window\.scrollTo\(\{ top: document\.body\.scrollHeight, behavior: 'smooth' \}\); \}, 100\);/g;
c = c.replace(scrollRegex, '');

// 2. Restore instant update logic for items that are already in the active history
// Find where targetHistoryItemId is set
const targetRegex = /let targetHistoryItemId = editingHistoryItemId;/;
const newTargetLogic = `let targetHistoryItemId = editingHistoryItemId;

    // 현재 작성 중인 기간이 최신 이력(Active)과 같은지 확인
    const newStart = saleStart ? new Date(saleStart).getTime() : 0;
    const newEnd = saleEnd ? new Date(saleEnd).getTime() : 0;
    const latestPush = histories[0];
    const isSamePeriod = latestPush && 
      new Date(latestPush.sale_start).getTime() === newStart && 
      new Date(latestPush.sale_end).getTime() === newEnd;

    // 만약 현재 Active 기간이고, DB에 이미 같은 상품이 있다면?
    if (!targetHistoryItemId && isSamePeriod && latestPush.nao3_sale_items) {
      const dbMatch = latestPush.nao3_sale_items.find((i: any) => i.product_name === newItem.product_name);
      if (dbMatch) {
        targetHistoryItemId = { pushId: latestPush.id, itemId: dbMatch.id };
      }
    }`;

if (c.match(targetRegex)) {
  c = c.replace(targetRegex, newTargetLogic);
} else {
  console.log("Could not find targetHistoryItemId declaration");
}

// 3. Make sure we also update the staging list visually so it doesn't disappear
const editSuccessRegex = /setEditingHistoryItemId\(null\);/g;
const newEditSuccess = `setEditingHistoryItemId(null);
        // 대기열에도 업데이트 반영
        if (existingIndex !== -1) {
          const newItems = [...items];
          newItems[existingIndex] = { ...newItems[existingIndex], quantity: newItem.quantity, sale_price: formattedPrice, category: activeTab };
          setItems(newItems);
        } else {
          setItems([...items, { id: targetHistoryItemId.itemId, category: activeTab, product_name: newItem.product_name, quantity: newItem.quantity, sale_price: formattedPrice, is_sold_out: false }]);
        }`;

if (c.match(editSuccessRegex)) {
  c = c.replace(editSuccessRegex, newEditSuccess);
} else {
  console.log("Could not find setEditingHistoryItemId");
}

fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
console.log("Successfully fixed scroll bug and restored instant update + staging visual update.");
