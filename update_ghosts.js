const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const oldLogic = `    if (targetHistoryItemId) {
      // 즉시 수정 모드
      try {
        const { error } = await supabase.from('nao3_sale_items')
          .update({ 
            product_name: newItem.product_name, 
            quantity: newItem.quantity, 
            sale_price: formattedPrice,
            category: activeTab
          })
          .eq('id', targetHistoryItemId.itemId);
          
        if (error) throw error;
        
        // 로컬 상태 즉시 갱신
        setHistories(prev => prev.map(h => h.id === targetHistoryItemId.pushId ? {
          ...h,
          nao3_sale_items: h.nao3_sale_items.map((i: any) => i.id === targetHistoryItemId.itemId ? {
            ...i,
            category: activeTab,
            product_name: newItem.product_name,
            quantity: newItem.quantity,
            sale_price: formattedPrice
          } : i)
        } : h));`;

const newLogic = `    if (targetHistoryItemId) {
      // 즉시 수정 모드
      try {
        // 중복 방지를 위해 원본 아이템의 이름을 기준으로 동일한 push 내의 모든 유령 중복 데이터를 함께 업데이트
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
        } : h));`;

if (c.indexOf(oldLogic) !== -1) {
  c = c.replace(oldLogic, newLogic);
  fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
  console.log('Successfully updated all ghost duplicates');
} else {
  console.log('Could not find oldLogic');
}
