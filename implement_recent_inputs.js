const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

// 1. Add showPriceDropdown and priceIdx
const stateRegex = /const \[qtyIdx, setQtyIdx\] = useState\(-1\);/;
if (c.match(stateRegex) && !c.includes('showPriceDropdown')) {
  c = c.replace(stateRegex, `const [qtyIdx, setQtyIdx] = useState(-1);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [priceIdx, setPriceIdx] = useState(-1);`);
}

// 2. Add scroll effect for priceIdx
const qtyEffectRegex = /useEffect\(\(\) => \{\s*if \(qtyIdx >= 0\) \{\s*document\.getElementById\('qty-item-' \+ qtyIdx\)\?\.scrollIntoView\(\{ block: 'nearest' \}\);\s*\}\s*\}, \[qtyIdx\]\);/;
if (c.match(qtyEffectRegex) && !c.includes('[priceIdx]')) {
  c = c.replace(qtyEffectRegex, `useEffect(() => {
    if (qtyIdx >= 0) {
      document.getElementById('qty-item-' + qtyIdx)?.scrollIntoView({ block: 'nearest' });
    }
  }, [qtyIdx]);

  useEffect(() => {
    if (priceIdx >= 0) {
      document.getElementById('price-item-' + priceIdx)?.scrollIntoView({ block: 'nearest' });
    }
  }, [priceIdx]);`);
}

// 3. Update handleTabChange
const handleTabChangeRegex = /setNameIdx\(-1\);\s*setQtyIdx\(-1\);\s*\};/;
if (c.match(handleTabChangeRegex) && !c.includes('setPriceIdx(-1)')) {
  c = c.replace(handleTabChangeRegex, `setNameIdx(-1);\n    setQtyIdx(-1);\n    setPriceIdx(-1);\n  };`);
}

// 4. Update Filtering logic
const filteringLogicRegex = /\/\/ 자동완성 필터링 리스트\s*const matchedNames = ITEM_DICT\[activeTab\]\?\.filter\(name => matchSearch\(newItem\.product_name, name\)\) \|\| \[\];\s*const matchedQtys = QTY_DICT\.filter\(qty => matchSearch\(newItem\.quantity, qty\)\);/;
const newFilteringLogic = `// 이력에서 추출한 최근 사용 데이터
  const recentNames = Array.from(new Set(histories.flatMap(h => h.nao3_sale_items.map((i: any) => i.product_name)))).filter(Boolean);
  const recentQtys = Array.from(new Set(histories.flatMap(h => h.nao3_sale_items.map((i: any) => i.quantity)))).filter(Boolean);
  const recentPrices = Array.from(new Set(histories.flatMap(h => h.nao3_sale_items.map((i: any) => i.sale_price.replace(/[^0-9]/g, ''))))).filter(Boolean);

  // 자동완성 필터링 리스트 (기본 제공 + 내 이력)
  const allNames = Array.from(new Set([...recentNames, ...(ITEM_DICT[activeTab] || [])]));
  const matchedNames = newItem.product_name.trim() === '' 
    ? recentNames.slice(0, 15) // 빈 칸일 때는 내 최근 이력 표시
    : allNames.filter(name => matchSearch(newItem.product_name, name));

  const defaultQtys = Array.from(new Set([...recentQtys, ...QTY_DICT])).slice(0, 15);
  const matchedQtys = newItem.quantity.trim() === ''
    ? defaultQtys
    : Array.from(new Set([...recentQtys, ...QTY_DICT])).filter(qty => matchSearch(newItem.quantity, qty));

  const defaultPrices = Array.from(new Set([...recentPrices, '1000', '2000', '3000', '5000', '9900', '10000'])).slice(0, 15);
  const matchedPrices = newItem.sale_price.trim() === ''
    ? defaultPrices
    : defaultPrices.filter(price => price.includes(newItem.sale_price));`;
if (c.match(filteringLogicRegex)) {
  c = c.replace(filteringLogicRegex, newFilteringLogic);
}

// 5. Update HTML for empty input label "최근 사용"
const nameDropdownLiRegex = /\{matchedNames\.map\(\(name, index\) => \(/;
if (c.match(nameDropdownLiRegex) && !c.includes('최근 자주 쓰는 품목')) {
  c = c.replace(nameDropdownLiRegex, `{newItem.product_name.trim() === '' && recentNames.length > 0 && (
                <li className="px-3 py-1.5 text-[11px] font-black text-[#5F0080] bg-purple-50 border-b border-purple-100 flex items-center justify-between">
                  우리 매장 최근 품목
                  <span className="text-[9px] bg-[#5F0080] text-white px-1.5 py-0.5 rounded-sm font-bold">MY</span>
                </li>
              )}
              {matchedNames.map((name, index) => (`);
}

const qtyDropdownLiRegex = /\{matchedQtys\.map\(\(qty, index\) => \(/;
if (c.match(qtyDropdownLiRegex) && !c.includes('최근 단위')) {
  c = c.replace(qtyDropdownLiRegex, `{newItem.quantity.trim() === '' && recentQtys.length > 0 && (
                  <li className="px-3 py-1.5 text-[11px] font-black text-[#5F0080] bg-purple-50 border-b border-purple-100 flex items-center justify-between">
                    우리 매장 단위
                    <span className="text-[9px] bg-[#5F0080] text-white px-1.5 py-0.5 rounded-sm font-bold">MY</span>
                  </li>
                )}
                {matchedQtys.map((qty, index) => (`);
}

// 6. Update Price Input JSX
const priceInputRegex = /<input\s*type="text"\s*placeholder="세일 가격"\s*value=\{newItem\.sale_price\}[\s\S]*?focus:ring-\[#5F0080\]"\s*\/>/;
const newPriceInput = `<div className="relative flex-1">
              <input 
                type="text" 
                placeholder="세일 가격 (숫자)"
                value={newItem.sale_price}
                onFocus={() => setShowPriceDropdown(true)}
                onBlur={() => setTimeout(() => { setShowPriceDropdown(false); setPriceIdx(-1); }, 200)}
                onChange={e => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setNewItem({...newItem, sale_price: raw});
                  setPriceIdx(-1);
                  setShowPriceDropdown(true);
                }}
                onKeyDown={(e) => {
                  if (!showPriceDropdown || matchedPrices.length === 0) return;
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setPriceIdx(prev => (prev < matchedPrices.length - 1 ? prev + 1 : prev));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setPriceIdx(prev => (prev > 0 ? prev - 1 : 0));
                  } else if (e.key === 'Enter' && priceIdx >= 0) {
                    e.preventDefault();
                    setNewItem({...newItem, sale_price: matchedPrices[priceIdx]});
                    setShowPriceDropdown(false);
                    setPriceIdx(-1);
                  } else if (e.key === 'Escape') {
                    setShowPriceDropdown(false);
                  }
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[14px] font-bold text-[#5F0080] placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-1 focus:ring-[#5F0080]"
              />
              {/* 세일 가격 자동완성 드롭다운 */}
              {showPriceDropdown && matchedPrices.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto top-full left-0">
                  {newItem.sale_price.trim() === '' && recentPrices.length > 0 && (
                    <li className="px-3 py-1.5 text-[11px] font-black text-[#5F0080] bg-purple-50 border-b border-purple-100 flex items-center justify-between">
                      최근 입력한 가격
                      <span className="text-[9px] bg-[#5F0080] text-white px-1.5 py-0.5 rounded-sm font-bold">MY</span>
                    </li>
                  )}
                  {matchedPrices.map((price, index) => (
                    <li 
                      key={index}
                      id={'price-item-' + index}
                      onMouseEnter={() => setPriceIdx(index)}
                      onClick={() => {
                        setNewItem({...newItem, sale_price: price});
                        setShowPriceDropdown(false);
                      }}
                      className={\`px-3 py-2 text-sm cursor-pointer border-b border-gray-100 last:border-0 \${
                        index === priceIdx ? 'bg-[#5F0080]/10 text-[#5F0080] font-bold' : 'text-gray-700 hover:bg-[#5F0080]/5 hover:text-[#5F0080]'
                      }\`}
                    >
                      {parseInt(price, 10).toLocaleString()}원
                    </li>
                  ))}
                </ul>
              )}
            </div>`;
if (c.match(priceInputRegex)) {
  c = c.replace(priceInputRegex, newPriceInput);
}

fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
console.log("Successfully added recent inputs and price autocomplete");
