const fs = require('fs');
let c = fs.readFileSync('src/app/store/[storeId]/sale/page.tsx', 'utf8');

const regex = /\{\/\* 세련된 카테고리 띠 배경 헤더 \*\/\}\s*<div className="-mx-4 px-4 py-3 bg-\[#5F0080\] mb-1 flex items-center justify-between shadow-sm">\s*<div className="flex flex-col">\s*<span className="text-\[10px\] font-black text-purple-200 uppercase tracking-widest mb-0\.5 opacity-90">\s*\{cat\.subtitle\}\s*<\/span>\s*<h3 className="text-\[18px\] font-extrabold text-white tracking-tight leading-none">\s*\{cat\.title\}\s*<\/h3>\s*<\/div>\s*<\/div>/g;

const replacement = `{/* 독립된 알약 형태 카테고리 뱃지 */}
                  <div className="flex justify-center mb-4 mt-4">
                    <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 shadow-sm rounded-full px-5 py-2.5">
                      <span className="text-[16px] font-extrabold text-[#5F0080] tracking-tight">
                        {cat.title}
                      </span>
                      <span className="text-[11px] font-black text-[#5F0080]/60 uppercase tracking-widest border-l border-purple-300/50 pl-2">
                        {cat.subtitle}
                      </span>
                    </div>
                  </div>`;

if (c.match(regex)) {
  c = c.replace(regex, replacement);
  fs.writeFileSync('src/app/store/[storeId]/sale/page.tsx', c, 'utf8');
  console.log("Successfully replaced category headers with pills");
} else {
  console.log("Regex didn't match.");
}
