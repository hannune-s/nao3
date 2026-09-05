const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const regex = /\{\/\* 1단: 세일 진행 기간 \*\/\}\s*<div className="flex flex-col gap-2\.5">\s*<h3 className="text-\[15px\] font-extrabold text-gray-900 tracking-tight">\s*이번 세일 진행 기간\s*<\/h3>\s*<div className="flex items-center justify-between gap-3">[\s\S]*?<\/div>\s*<\/div>/;

const replacement = `{/* 1단: 세일 진행 기간 */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[15px] font-extrabold text-gray-900 tracking-tight">
              이번 세일 진행 기간
            </h3>
            <div className="flex flex-col gap-2.5">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-gray-400 pointer-events-none">시작</span>
                <input 
                  type="datetime-local" 
                  value={saleStart} 
                  onChange={e => setSaleStart(e.target.value)} 
                  className="w-full text-[14px] font-bold text-[#5F0080] border border-gray-200 pl-12 pr-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5F0080]/30 transition-all" 
                />
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-gray-400 pointer-events-none">종료</span>
                <input 
                  type="datetime-local" 
                  value={saleEnd} 
                  onChange={e => setSaleEnd(e.target.value)} 
                  className="w-full text-[14px] font-bold text-[#5F0080] border border-gray-200 pl-12 pr-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5F0080]/30 transition-all" 
                />
              </div>
            </div>
          </div>`;

if (c.match(regex)) {
  c = c.replace(regex, replacement);
  fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
  console.log("Successfully updated date inputs layout");
} else {
  console.log("Regex didn't match.");
}
