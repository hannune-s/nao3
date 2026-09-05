const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

// 1. Add state safely
c = c.replace(
  'const [expandedHistory, setExpandedHistory] = useState<string | null>(null);',
  'const [expandedHistory, setExpandedHistory] = useState<string | null>(null);\n  const [historyPage, setHistoryPage] = useState(1);'
);

// 2. Click handler
c = c.replace(
  'onClick={() => setExpandedHistory(isExpanded ? null : history.id)}',
  'onClick={() => { setExpandedHistory(isExpanded ? null : history.id); setHistoryPage(1); }}'
);

// 3. Regex to replace the rendering block safely
const regex = /\{history\.nao3_sale_items\?\.length > 0 \? \([\s\S]*?<div className="p-4 text-center text-sm text-gray-400">상세 품목 데이터가 없습니다\.<\/div>\n\s*\)\}/;

const replacement = `{history.nao3_sale_items?.length > 0 ? (
                      (() => {
                        const sortedItems = Array.from(new Map(history.nao3_sale_items.map((i: any) => [i.product_name, i])).values()).sort((a: any, b: any) => {
                          const order = ['정육', '청과', '야채', '야채·수산', '공산품'];
                          const idxA = order.indexOf(a.category);
                          const idxB = order.indexOf(b.category);
                          return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
                        });
                        
                        const ITEMS_PER_PAGE = 5;
                        const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
                        const currentStart = (historyPage - 1) * ITEMS_PER_PAGE;
                        const paginatedItems = sortedItems.slice(currentStart, currentStart + ITEMS_PER_PAGE);
                        
                        return (
                          <>
                            {paginatedItems.map((item: any) => (
                              <div key={item.id} className={\`flex flex-col py-3 px-4 border-b border-gray-100/50 last:border-0 \${item.is_sold_out ? 'bg-gray-100/30' : ''}\`}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                                    <span className="text-[10px] text-[#5F0080] border border-[#5F0080]/20 bg-[#5F0080]/5 px-1 rounded flex-shrink-0">{item.category}</span>
                                    <h4 className={\`text-[13px] font-bold truncate \${item.is_sold_out ? 'text-gray-400 line-through' : 'text-gray-800'}\`}>{item.product_name}</h4>
                                    <span className="text-[11px] text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded flex-shrink-0">{item.quantity}</span>
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <span className={\`text-[14px] font-bold \${item.is_sold_out ? 'text-red-400 line-through' : 'text-gray-900'}\`}>{item.sale_price}</span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <button 
                                    type="button"
                                    onClick={() => handleHistoryToggleSoldOut(history.id, item.id, item.is_sold_out)}
                                    className={\`text-[11px] font-bold px-3 py-1 rounded-full border transition-colors \${item.is_sold_out ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}\`}
                                  >
                                    {item.is_sold_out ? '품절 해제' : '품절 처리'}
                                  </button>
                                  <div className="flex gap-1.5">
                                    <button 
                                      type="button"
                                      onClick={() => handleHistoryEditItem(history.id, item)}
                                      className="text-[11px] font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                      수정
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => handleHistoryDeleteItem(history.id, item.id)}
                                      className="text-[11px] font-bold px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                      삭제
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {totalPages > 1 && (
                              <div className="flex justify-center items-center gap-1.5 py-3 border-t border-gray-100 bg-white">
                                <button
                                  type="button"
                                  disabled={historyPage === 1}
                                  onClick={(e) => { e.stopPropagation(); setHistoryPage(p => p - 1); }}
                                  className="px-2 py-1 text-[12px] rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors font-medium"
                                >
                                  이전
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                  <button
                                    key={pageNum}
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setHistoryPage(pageNum); }}
                                    className={\`w-7 h-7 rounded-full text-[12px] font-bold flex items-center justify-center transition-colors \${
                                      historyPage === pageNum 
                                        ? 'bg-[#5F0080] text-white shadow-sm' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }\`}
                                  >
                                    {pageNum}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  disabled={historyPage === totalPages}
                                  onClick={(e) => { e.stopPropagation(); setHistoryPage(p => p + 1); }}
                                  className="px-2 py-1 text-[12px] rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors font-medium"
                                >
                                  다음
                                </button>
                              </div>
                            )}
                          </>
                        );
                      })()
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-400">상세 품목 데이터가 없습니다.</div>
                    )}`;

if (c.match(regex)) {
  c = c.replace(regex, replacement);
  fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
  console.log('Successfully applied pagination block.');
} else {
  console.log('Regex did not match.');
}
