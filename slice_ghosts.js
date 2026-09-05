const fs = require('fs');
let lines = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8').split('\n');
const startIdx = lines.findIndex(l => l.includes('if (targetHistoryItemId) {'));
const endIdx = lines.findIndex((l, i) => i > startIdx && l.includes('setEditingHistoryItemId(null);'));

const replacement = `    if (targetHistoryItemId) {
      // 즉시 수정 모드
      try {
        const targetPush = histories.find(h => h.id === targetHistoryItemId.pushId);
        const originalItem = targetPush?.nao3_sale_items?.find((i: any) => i.id === targetHistoryItemId.itemId);
        const originalName = originalItem ? originalItem.product_name : newItem.product_name;
        
        let updateIds = [targetHistoryItemId.itemId];
        if (targetPush && targetPush.nao3_sale_items) {
          updateIds = targetPush.nao3_sale_items
            .filter((i: any) => i.product_name === originalName)
            .map((i: any) => i.id);
        }

        const { error } = await supabase.from('nao3_sale_items')
          .update({ 
            product_name: newItem.product_name, 
            quantity: newItem.quantity, 
            sale_price: formattedPrice,
            category: activeTab
          })
          .in('id', updateIds);
          
        if (error) throw error;
        
        // 로컬 상태 즉시 갱신
        setHistories(prev => prev.map(h => h.id === targetHistoryItemId.pushId ? {
          ...h,
          nao3_sale_items: h.nao3_sale_items.map((i: any) => updateIds.includes(i.id) ? {
            ...i,
            category: activeTab,
            product_name: newItem.product_name,
            quantity: newItem.quantity,
            sale_price: formattedPrice
          } : i)
        } : h));
        
        setEditingHistoryItemId(null);`;

lines.splice(startIdx, endIdx - startIdx + 1, replacement);
fs.writeFileSync('src/components/MartAdmin.tsx', lines.join('\n'));
console.log('Replaced block successfully');
