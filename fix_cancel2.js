const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const badBlock = `                    setEditingHistoryItemId(null);
        // 대기열에도 업데이트 반영
        if (existingIndex !== -1) {
          const newItems = [...items];
          newItems[existingIndex] = { ...newItems[existingIndex], quantity: newItem.quantity, sale_price: formattedPrice, category: activeTab };
          setItems(newItems);
        } else {
          setItems([...items, { id: targetHistoryItemId.itemId, category: activeTab, product_name: newItem.product_name, quantity: newItem.quantity, sale_price: formattedPrice, is_sold_out: false }]);
        }
        setItems(prev => prev.filter(i => i.product_name !== newItem.product_name));
                    setNewItem({ product_name: '', quantity: '', sale_price: '' });`;

const goodBlock = `                    setEditingHistoryItemId(null);
                    setNewItem({ product_name: '', quantity: '', sale_price: '' });`;

if (c.indexOf(badBlock) !== -1) {
  c = c.replace(badBlock, goodBlock);
  fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
  console.log('Fixed');
} else {
  console.log('Not found');
}
