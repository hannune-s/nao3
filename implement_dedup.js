const fs = require('fs');

// 1. Update sale/page.tsx (Customer view merging)
let pageCode = fs.readFileSync('src/app/store/[storeId]/sale/page.tsx', 'utf8');

const regex = /\{\/\* 리스트: 깔끔한 라인 정렬 \*\/\}[\s\S]*?<\/div>\s*\}\)\}\s*<\/div>/;
const replacement = `{/* 리스트: 깔끔한 라인 정렬 (옵션 병합 처리) */}
                  <div className="flex flex-col">
                    {(() => {
                      const mergedItems: any[] = [];
                      catItems.forEach(item => {
                        const existing = mergedItems.find(mi => mi.product_name === item.product_name);
                        if (existing) {
                          existing.options.push({
                            id: item.id,
                            quantity: item.quantity,
                            sale_price: item.sale_price,
                            is_sold_out: item.is_sold_out
                          });
                        } else {
                          mergedItems.push({
                            ...item,
                            options: [{
                              id: item.id,
                              quantity: item.quantity,
                              sale_price: item.sale_price,
                              is_sold_out: item.is_sold_out
                            }]
                          });
                        }
                      });

                      return mergedItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-3.5 border-b border-gray-200 last:border-b-0 transition-all">
                          
                          {/* 좌측: 상품명 & 품절 상태 */}
                          <div className="flex items-center flex-1 min-w-0 pr-3 gap-2.5">
                            {item.options.every((opt: any) => opt.is_sold_out) && (
                              <span className="text-[11px] font-black text-white bg-red-600 px-2 py-1 rounded shrink-0 leading-none shadow-sm tracking-wide">
                                품절
                              </span>
                            )}
                            <span className="flex-shrink-0 w-[26px] h-[26px] bg-[#F9F9F9] rounded-full flex items-center justify-center border border-gray-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] text-[14px]">
                              {getIconForProduct(item.product_name)}
                            </span>
                            <h4 className={\`text-[16px] font-bold text-gray-900 truncate \${item.options.every((opt: any) => opt.is_sold_out) ? 'line-through text-gray-400' : ''}\`}>
                              {item.product_name}
                            </h4>
                          </div>
                          
                          {/* 우측: 중량 & 가격 옵션 그룹 */}
                          <div className="text-right flex-shrink-0 flex flex-col items-end justify-center gap-1.5">
                            {item.options.map((opt: any, idx: number) => (
                              <div key={opt.id || idx} className={\`flex items-center gap-2 \${opt.is_sold_out ? 'opacity-50' : ''}\`}>
                                <span className={\`text-[13px] font-extrabold tracking-tight px-2 py-0.5 rounded-md shrink-0 \${opt.is_sold_out ? 'bg-gray-100 text-gray-400' : 'bg-purple-50 text-[#5F0080]'}\`}>
                                  {opt.quantity}
                                </span>
                                <span className={\`text-[16px] font-black tracking-tight \${opt.is_sold_out ? 'text-gray-400 line-through decoration-red-500 decoration-2' : 'text-[#5F0080]'}\`}>
                                  {opt.sale_price}
                                </span>
                              </div>
                            ))}
                          </div>
                          
                        </div>
                      ));
                    })()}
                  </div>`;

if (pageCode.match(regex)) {
  pageCode = pageCode.replace(regex, replacement);
  fs.writeFileSync('src/app/store/[storeId]/sale/page.tsx', pageCode, 'utf8');
} else {
  console.log("Could not find the target string in page.tsx");
}

// 2. Update MartAdmin.tsx (Admin check duplicate logic)
let adminCode = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const addLogicRegex = /if \(editingHistoryItemId\) \{/;
const newAddLogic = `const existingIndex = items.findIndex(i => i.product_name === newItem.product_name && i.quantity === newItem.quantity);
    
    if (editingHistoryItemId) {`;

if (adminCode.match(addLogicRegex)) {
  adminCode = adminCode.replace(addLogicRegex, newAddLogic);
}

const appendLogicRegex = /setItems\(\[\.\.\.items, \{\s*\.\.\.newItem,\s*id: Date\.now\(\)\.toString\(\),\s*category: activeTab,\s*sale_price: formattedPrice\s*\}\]\);\s*setNewItem\(\{ product_name: '', quantity: '', sale_price: '' \}\);\s*setActiveTab\(activeTab\);\s*setTimeout\(\(\) => \{\s*window\.scrollTo\(\{ top: document\.body\.scrollHeight, behavior: 'smooth' \}\);\s*\}, 100\);/;

const newAppendLogic = `if (existingIndex !== -1) {
        const newItems = [...items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          sale_price: formattedPrice,
          category: activeTab
        };
        setItems(newItems);
        setNewItem({ product_name: '', quantity: '', sale_price: '' });
      } else {
        setItems([...items, { 
          ...newItem, 
          id: Date.now().toString(), 
          category: activeTab, 
          sale_price: formattedPrice 
        }]);
        setNewItem({ product_name: '', quantity: '', sale_price: '' });
        setActiveTab(activeTab);
        setTimeout(() => { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }, 100);
      }`;

if (adminCode.match(appendLogicRegex)) {
  adminCode = adminCode.replace(appendLogicRegex, newAppendLogic);
} else {
  console.log("Could not find append logic in MartAdmin.tsx");
}

fs.writeFileSync('src/components/MartAdmin.tsx', adminCode, 'utf8');
console.log("Successfully updated merging and duplication prevention");
