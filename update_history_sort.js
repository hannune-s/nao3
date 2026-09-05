const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

// 1. Sort the history rendering
const historyMapRegex = /\{history\.nao3_sale_items\?\.\length > 0 \? \(\s*history\.nao3_sale_items\.map\(\(item: any\) => \(/;
const newHistoryMap = `{history.nao3_sale_items?.length > 0 ? (
                      [...history.nao3_sale_items].sort((a: any, b: any) => {
                        const order = ['정육', '청과', '야채', '야채·수산', '공산품'];
                        const idxA = order.indexOf(a.category);
                        const idxB = order.indexOf(b.category);
                        return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
                      }).map((item: any) => (`;

if (c.match(historyMapRegex)) {
  c = c.replace(historyMapRegex, newHistoryMap);
} else {
  console.log("Could not find history map regex");
}

// 2. Modify handleAddItem to seamlessly update DB if it's in active push
const handleAddRegex = /const existingIndex = items\.findIndex\(i => i\.product_name === newItem\.product_name\);\s*if \(editingHistoryItemId\) \{/;

const newHandleAdd = `const existingIndex = items.findIndex(i => i.product_name === newItem.product_name);
    
    // 현재 작성 중인 기간이 최신 이력(Active)과 같은지 확인
    const newStart = saleStart ? new Date(saleStart).getTime() : 0;
    const newEnd = saleEnd ? new Date(saleEnd).getTime() : 0;
    const latestPush = histories[0];
    const isSamePeriod = latestPush && 
      new Date(latestPush.sale_start).getTime() === newStart && 
      new Date(latestPush.sale_end).getTime() === newEnd;

    // 만약 현재 Active 기간이고, DB에 이미 같은 상품이 있다면?
    let targetHistoryItemId = editingHistoryItemId;
    if (!targetHistoryItemId && isSamePeriod && latestPush.nao3_sale_items) {
      const dbMatch = latestPush.nao3_sale_items.find((i: any) => i.product_name === newItem.product_name);
      if (dbMatch) {
        targetHistoryItemId = { pushId: latestPush.id, itemId: dbMatch.id };
      }
    }

    if (targetHistoryItemId) {`;

if (c.match(handleAddRegex)) {
  c = c.replace(handleAddRegex, newHandleAdd);
} else {
  console.log("Could not find handleAddItem regex");
}

// 3. Update the editingHistoryItemId references inside that block
const editBlockRegex = /editingHistoryItemId\.itemId/g;
c = c.replace(editBlockRegex, 'targetHistoryItemId.itemId');

const editBlockPushRegex = /editingHistoryItemId\.pushId/g;
c = c.replace(editBlockPushRegex, 'targetHistoryItemId.pushId');

// Remove from items if it was there
const setEditingRegex = /setEditingHistoryItemId\(null\);/g;
c = c.replace(setEditingRegex, 'setEditingHistoryItemId(null);\n        setItems(prev => prev.filter(i => i.product_name !== newItem.product_name));');

fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
console.log("Successfully updated history sorting and instant DB update.");
