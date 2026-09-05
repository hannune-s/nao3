const fs = require('fs');

// 1. Update sale/page.tsx (Customer view merging)
let pageCode = fs.readFileSync('src/app/store/[storeId]/sale/page.tsx', 'utf8');

const regex = /\{\/\* 리스트: 깔끔한 라인 정렬 \*\/\}[\s\S]*?<\/div>\s*<\/section>/;
const replacement = `{/* 리스트: 깔끔한 라인 정렬 (옵션 병합 처리) */}
                  <div className="flex flex-col">
                    {(() => {
                      const mergedItems = [];
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
                            {item.options.every(opt => opt.is_sold_out) && (
                              <span className="text-[11px] font-black text-white bg-red-600 px-2 py-1 rounded shrink-0 leading-none shadow-sm tracking-wide">
                                품절
                              </span>
                            )}
                            <span className="flex-shrink-0 w-[26px] h-[26px] bg-[#F9F9F9] rounded-full flex items-center justify-center border border-gray-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] text-[14px]">
                              {getIconForProduct(item.product_name)}
                            </span>
                            <h4 className={\`text-[16px] font-bold text-gray-900 truncate \${item.options.every(opt => opt.is_sold_out) ? 'line-through text-gray-400' : ''}\`}>
                              {item.product_name}
                            </h4>
                          </div>
                          
                          {/* 우측: 중량 & 가격 옵션 그룹 */}
                          <div className="text-right flex-shrink-0 flex flex-col items-end justify-center gap-1.5">
                            {item.options.map((opt, idx) => (
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
                  </div>
                </section>`;

if (pageCode.match(regex)) {
  pageCode = pageCode.replace(regex, replacement);
  fs.writeFileSync('src/app/store/[storeId]/sale/page.tsx', pageCode, 'utf8');
} else {
  console.log("Could not find the target string in page.tsx");
}

// 2. Update MartAdmin.tsx (Admin check duplicate logic)
let adminCode = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const elseBlockRegex = /\} else \{\s*\/\/\s*일반 대기열 추가 모드\s*const insertData = \{\s*id: Date\.now\(\)\.toString\(\),\s*category: activeTab,\s*product_name: newItem\.product_name,\s*quantity: newItem\.quantity,\s*sale_price: formattedPrice,\s*is_sold_out: false\s*\};\s*setItems\(\[\.\.\.items, insertData\]\);\s*\}/;

const newElseBlock = `} else {
      // 일반 대기열 추가 모드
      if (existingIndex !== -1) {
        // 이미 동일한 품목+단위가 있다면 가격만 업데이트 (중복 방지)
        const newItems = [...items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          sale_price: formattedPrice
        };
        setItems(newItems);
      } else {
        // 완전히 새로운 항목이면 추가
        const insertData = { 
          id: Date.now().toString(),
          category: activeTab, 
          product_name: newItem.product_name, 
          quantity: newItem.quantity, 
          sale_price: formattedPrice,
          is_sold_out: false
        };
        setItems([...items, insertData]);
        setTimeout(() => { window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }, 100);
      }
    }`;

if (adminCode.match(elseBlockRegex)) {
  adminCode = adminCode.replace(elseBlockRegex, newElseBlock);
} else {
  console.log("Could not find else block in MartAdmin.tsx");
}

fs.writeFileSync('src/components/MartAdmin.tsx', adminCode, 'utf8');
console.log("Successfully updated merging and duplication prevention");
