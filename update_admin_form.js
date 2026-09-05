const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const regex = /<div className="max-w-2xl mx-auto w-full p-4 bg-\[#F9F9F9\] border-b border-gray-200 flex flex-col gap-4">[\s\S]*?<\/button>\s*<\/div>\s*<\/div>/;

const replacement = `<div className="max-w-2xl mx-auto w-full p-5 sm:p-6 bg-white border-b border-gray-100 shadow-sm flex flex-col gap-7">
          
          {/* 상호명 설정 */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[15px] font-extrabold text-gray-900 tracking-tight">
              우리 매장 상호명
            </h3>
            <input 
              type="text" 
              value={storeName} 
              onChange={e => setStoreName(e.target.value)} 
              placeholder="예: 우리동네 할인마트"
              className="w-full text-[15px] font-bold text-[#5F0080] border border-gray-200 px-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5F0080]/30 transition-all" 
            />
          </div>

          {/* 1단: 세일 진행 기간 */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[15px] font-extrabold text-gray-900 tracking-tight">
              이번 세일 진행 기간
            </h3>
            <div className="flex items-center justify-between gap-3">
              <input 
                type="datetime-local" 
                value={saleStart} 
                onChange={e => setSaleStart(e.target.value)} 
                className="flex-1 text-[13px] sm:text-[14px] font-bold text-[#5F0080] border border-gray-200 px-3 py-3 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5F0080]/30 transition-all" 
              />
              <span className="text-gray-400 font-bold">~</span>
              <input 
                type="datetime-local" 
                value={saleEnd} 
                onChange={e => setSaleEnd(e.target.value)} 
                className="flex-1 text-[13px] sm:text-[14px] font-bold text-[#5F0080] border border-gray-200 px-3 py-3 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5F0080]/30 transition-all" 
              />
            </div>
          </div>
          
          {/* 2단: 사장님 이야기 */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[15px] font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
              <span className="text-[16px] drop-shadow-sm">🌸</span> 오늘의 사장님 이야기
            </h3>
            <textarea
              value={bossMessage}
              onChange={e => setBossMessage(e.target.value)}
              placeholder="예: 어머님들~ 오늘 들어온 한우 너무 좋습니다! 언능 나오세요~"
              className="w-full bg-purple-50/50 border border-purple-100 rounded-xl px-4 py-3.5 text-[14px] text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#5F0080]/30 min-h-[90px] resize-y placeholder:text-gray-400 transition-all"
            />
            <button
              onClick={handleQuickSaveSettings}
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-[#5F0080] text-white hover:bg-purple-900 font-extrabold rounded-xl shadow-[0_4px_14px_rgba(95,0,128,0.25)] transition-all text-[15px] tracking-tight"
            >
              상호명 · 기간 · 멘트 즉시 반영하기
            </button>
          </div>
        </div>`;

if (c.match(regex)) {
  c = c.replace(regex, replacement);
  fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
  console.log("Successfully replaced admin settings form");
} else {
  console.log("Regex didn't match.");
}
