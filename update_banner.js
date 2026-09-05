const fs = require('fs');

let c = fs.readFileSync('src/app/store/[storeId]/sale/page.tsx', 'utf8');

const targetRegex = /\{\/\* 연보라색 래퍼 \([\s\S]*?\{\/\* 세일 품목 리스트 \*\/\}/;

const replacement = `{/* 특가 배너 및 사장님 이야기 (독립된 알약 뱃지 스타일) */}
        <div className="w-full pb-8 pt-8 bg-white flex flex-col items-center">
          
          <div className="animate-fade-in-up flex flex-col items-center text-center px-4 w-full" style={{ animationDelay: '0.1s' }}>
            {/* 알약 형태 독립 뱃지 */}
            <div className="inline-flex items-center justify-center bg-purple-50 border border-purple-200 shadow-sm rounded-full px-5 py-2 mb-3">
              <span className="text-[16px] font-extrabold text-[#5F0080] tracking-tight">📢 오늘의 특가 찬스!</span>
            </div>
            
            <p className="text-[14px] font-bold text-gray-500 mb-3">
              단골 고객님을 위해 준비한 깜짝 한정 세일
            </p>
            
            {periodText && (
              <div className="inline-block bg-gray-50 text-gray-600 font-extrabold text-[12px] px-4 py-1.5 rounded-full border border-gray-200">
                🗓️ {periodText}
              </div>
            )}
          </div>

          {/* 오늘의 사장님 이야기 */}
          {bossMessage && (
            <div className="max-w-md w-full mx-auto px-4 pt-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="relative border border-purple-100 rounded-2xl p-6 bg-white shadow-[0_4px_20px_rgba(95,0,128,0.04)]">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-[#5F0080] text-[16px] leading-none">🌸</span>
                  <h3 className="text-[14px] font-extrabold text-[#5F0080] tracking-wide">오늘의 사장님 이야기</h3>
                </div>
                <p className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                  {bossMessage}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 세일 품목 리스트 */}`;

c = c.replace(targetRegex, replacement);

fs.writeFileSync('src/app/store/[storeId]/sale/page.tsx', c, 'utf8');
console.log("Successfully replaced banner with pill badge");
