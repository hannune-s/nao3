const fs = require('fs');
let c = fs.readFileSync('src/app/store/[storeId]/sale/page.tsx', 'utf8');

// 1. Change background
c = c.replace('<main className="min-h-screen bg-white pb-24 font-sans">', '<main className="min-h-screen bg-[#F1F2F4] pb-24 font-sans">');

// 2. Add border to top section to separate it clearly from gray bg
c = c.replace('<div className="w-full pb-8 pt-8 bg-white flex flex-col items-center">', '<div className="w-full pb-8 pt-8 bg-white flex flex-col items-center shadow-sm border-b border-gray-200">');

// 3. Update the container for items list
c = c.replace('<div className="max-w-md mx-auto px-4 pt-0 pb-8">', '<div className="max-w-md mx-auto w-full flex flex-col gap-3 pt-3 pb-8">');

// 4. Update the section map
const targetSection = /<section key=\{cat\.id\} className="animate-fade-in-up">[\s\S]*?\{\/\* 리스트: 박스 없이 바탕 화면에 직접 텍스트\+선 정렬 \*\/\}\s*<div className="flex flex-col px-1 pt-1 pb-6">/g;

const replacement = `<section key={cat.id} className="animate-fade-in-up bg-white px-5 py-7 shadow-sm border-y border-gray-200">
                  
                  {/* 고급스러운 좌측 정렬 카테고리 헤더 */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-[#5F0080] rounded-full"></div>
                    <div className="flex flex-col">
                      <h3 className="text-[20px] font-extrabold text-gray-900 tracking-tight leading-none">
                        {cat.title}
                      </h3>
                      <span className="text-[11px] font-black text-[#5F0080]/60 uppercase tracking-[0.2em] mt-1 block">
                        {cat.subtitle}
                      </span>
                    </div>
                  </div>
                  
                  {/* 리스트: 깔끔한 라인 정렬 */}
                  <div className="flex flex-col">`;

c = c.replace(targetSection, replacement);

fs.writeFileSync('src/app/store/[storeId]/sale/page.tsx', c, 'utf8');
console.log("Applied professional layout successfully");
