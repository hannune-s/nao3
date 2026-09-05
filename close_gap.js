const fs = require('fs');

let c = fs.readFileSync('src/app/store/[storeId]/sale/page.tsx', 'utf8');

const targetRegex = /\{\/\* 2\. 특가 배너 영역 \([\s\S]*?\{\/\* 세일 품목 리스트 \*\/\}\s*<div className="max-w-md mx-auto px-4 py-8">/;

const replacement = `{/* 연보라색 래퍼 (특가 배너 + 사장님 이야기 묶음) */}
        <div className="bg-[#F4E8F9] w-full pb-6 shadow-sm border-b border-purple-200">
          
          {/* 2. 특가 배너 영역 */}
          <div className="py-6 px-4 text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-xl font-extrabold text-[#5F0080] mb-1.5 tracking-tight">
              🎉 오늘의 특가 찬스!
            </h3>
            <p className="text-[13px] font-bold text-purple-900/60 mb-3">
              단골 고객님을 위해 준비한 깜짝 한정 세일
            </p>
            
            {periodText && (
              <div className="inline-block bg-white text-[#5F0080] font-black text-[12px] px-5 py-2 rounded-full shadow-sm border border-purple-100">
                {periodText}
              </div>
            )}
          </div>

          {/* 오늘의 사장님 이야기 */}
          {bossMessage && (
            <div className="max-w-md mx-auto px-4 pt-1 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="relative border border-purple-100 rounded-2xl p-6 bg-white shadow-sm">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-[#5F0080] text-[16px] leading-none">🌸</span>
                  <h3 className="text-[14px] font-bold text-[#5F0080] tracking-wide">오늘의 사장님 이야기</h3>
                </div>
                <p className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                  {bossMessage}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 세일 품목 리스트 */}
      <div className="max-w-md mx-auto px-4 pt-0 pb-8">`;

c = c.replace(targetRegex, replacement);

fs.writeFileSync('src/app/store/[storeId]/sale/page.tsx', c, 'utf8');
console.log("Successfully closed the white gap.");
