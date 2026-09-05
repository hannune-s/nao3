const fs = require('fs');

let c = fs.readFileSync('src/app/store/[storeId]/sale/page.tsx', 'utf8');

// Replace the main tag background
c = c.replace('<main className="min-h-screen bg-[#F9F9F9] pb-24 font-sans">', '<main className="min-h-screen bg-white pb-24 font-sans">');

// Replace the bossMessage box background if we want it to match? Actually boss message in a box is fine, but let's change it slightly to fit the white background.
// Instead of border, let's keep it as is, it's just a message box.

// The main target is the category section and items list.
const targetRegex = /<section key=\{cat\.id\} className="animate-fade-in-up">[\s\S]*?<\/section>/g;

const replacement = `<section key={cat.id} className="animate-fade-in-up">
                  
                  {/* 세련된 카테고리 띠 배경 헤더 */}
                  <div className="-mx-4 px-4 py-3 bg-[#5F0080] mb-1 flex items-center justify-between shadow-sm">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-purple-200 uppercase tracking-widest mb-0.5 opacity-90">
                        {cat.subtitle}
                      </span>
                      <h3 className="text-[18px] font-extrabold text-white tracking-tight leading-none">
                        {cat.title}
                      </h3>
                    </div>
                  </div>
                  
                  {/* 리스트: 박스 없이 바탕 화면에 직접 텍스트+선 정렬 */}
                  <div className="flex flex-col px-1 pt-1 pb-6">
                    {catItems.map((item) => (
                      <div key={item.id} className={\`flex items-center justify-between py-3.5 border-b border-gray-200 last:border-b-0 transition-all \${item.is_sold_out ? 'opacity-50' : ''}\`}>
                        
                        {/* 좌측: 상품명 & 중량 */}
                        <div className="flex items-center flex-1 min-w-0 pr-3 gap-2.5">
                          {item.is_sold_out && (
                            <span className="text-[11px] font-black text-white bg-red-600 px-2 py-1 rounded shrink-0 leading-none shadow-sm tracking-wide">
                              품절
                            </span>
                          )}
                          <h4 className={\`text-[16px] font-bold text-gray-900 truncate \${item.is_sold_out ? 'line-through text-gray-400' : ''}\`}>
                            {item.product_name}
                          </h4>
                          <span className={\`text-[13px] font-extrabold tracking-tight \${item.is_sold_out ? 'text-gray-400' : 'text-[#5F0080]'}\`}>
                            {item.quantity}
                          </span>
                        </div>
                        
                        {/* 우측: 시선 강탈 가격 */}
                        <div className="text-right flex-shrink-0 flex flex-col items-end justify-center">
                          <span className={\`text-[18px] font-black tracking-tight \${item.is_sold_out ? 'text-gray-400 line-through decoration-red-500 decoration-2' : 'text-[#5F0080]'}\`}>
                            {item.sale_price}
                          </span>
                        </div>
                        
                      </div>
                    ))}
                  </div>
                </section>`;

c = c.replace(targetRegex, replacement);

fs.writeFileSync('src/app/store/[storeId]/sale/page.tsx', c, 'utf8');
console.log("Successfully updated customer UI");
