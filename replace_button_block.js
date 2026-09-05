const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const startIdx = c.indexOf('<div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between gap-4">');
if (startIdx === -1) {
  console.log("Not found start");
  process.exit(1);
}
const endIdx = c.indexOf('</div>\n  \n        </div>\n  \n        {/*');
if (endIdx === -1) {
  // Let's just find the next </div> that matches the block
  console.log("End marker not exactly matched, falling back to substring replace");
}

const oldBlock = c.substring(startIdx, c.indexOf('</button>\n          </div>', startIdx) + '</button>\n          </div>'.length);

const newBlock = `<div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100 flex flex-col gap-3">
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

c = c.replace(oldBlock, newBlock);
fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
console.log("Successfully replaced");
