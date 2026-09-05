const fs = require('fs');
let lines = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8').split('\n');

const newBlock = `        {/* 하단 액션 버튼 그룹 */}
        <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100 flex flex-col gap-3">
          <div className="flex justify-between items-center pl-1">
            <span className="text-[12px] text-[#5F0080]/70 font-bold">총 등록 대기 상품</span>
            <span className="text-xl font-extrabold text-[#5F0080] leading-none">{totalItemsCount}건</span>
          </div>
          <div className="flex gap-2 w-full">
            <button 
              type="button"
              onClick={handlePreview}
              className="flex-1 py-3.5 bg-white border border-[#5F0080] text-[#5F0080] font-bold rounded-xl transition-all shadow-sm text-[14px]"
            >
              미리보기
            </button>
            <button 
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-3.5 bg-[#5F0080] hover:bg-[#4a0066] disabled:bg-gray-300 text-white font-bold rounded-xl transition-all shadow-sm disabled:shadow-none text-[14px]"
            >
              {loading ? '저장 중...' : '푸시 등록'}
            </button>
          </div>
        </div>`;

// Replace lines 754 to 767 (indices 753 to 766)
lines.splice(753, 14, newBlock);

fs.writeFileSync('src/components/MartAdmin.tsx', lines.join('\n'), 'utf8');
console.log("Successfully replaced lines 754-767");
