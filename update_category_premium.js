const fs = require('fs');

let c = fs.readFileSync('src/app/store/[storeId]/sale/page.tsx', 'utf8');

const regex = /\{\/\* 독립된 알약 형태 카테고리 뱃지 \*\/\}\s*<div className="flex justify-center mb-4 mt-4">\s*<div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-200 shadow-sm rounded-full px-5 py-2\.5">\s*<span className="text-\[16px\] font-extrabold text-\[#5F0080\] tracking-tight">\s*\{cat\.title\}\s*<\/span>\s*<span className="text-\[11px\] font-black text-\[#5F0080\]\/60 uppercase tracking-widest border-l border-purple-300\/50 pl-2">\s*\{cat\.subtitle\}\s*<\/span>\s*<\/div>\s*<\/div>/g;

const replacement = `{/* 고급스러운 에디토리얼 스타일 카테고리 헤더 */}
                  <div className="flex flex-col items-center justify-center mb-6 mt-8">
                    <span className="text-[11px] font-extrabold text-[#5F0080]/80 uppercase tracking-[0.3em] mb-1.5">
                      {cat.subtitle}
                    </span>
                    <h3 className="text-[22px] font-black text-gray-900 tracking-tight">
                      {cat.title}
                    </h3>
                    <div className="w-8 h-[3px] bg-[#5F0080] mt-3 rounded-full opacity-90"></div>
                  </div>`;

if (c.match(regex)) {
  c = c.replace(regex, replacement);
  fs.writeFileSync('src/app/store/[storeId]/sale/page.tsx', c, 'utf8');
  console.log("Successfully replaced with premium headers");
} else {
  console.log("Regex didn't match.");
}
