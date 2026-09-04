const fs = require('fs');

// 1. Update sale/page.tsx
let salePage = fs.readFileSync('src/app/store/[storeId]/sale/page.tsx', 'utf8');
salePage = salePage.replace(/const fetchItems = async \(\) => \{/, 
`const fetchItems = async () => {
      const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
      if (isPreview) {
        const stagedSettings = JSON.parse(localStorage.getItem('nao3_staging_settings') || '{}');
        setStoreName(stagedSettings.storeName || '상호명 미리보기');
        
        if (stagedSettings.saleStart && stagedSettings.saleEnd) {
          const start = new Date(stagedSettings.saleStart);
          const end = new Date(stagedSettings.saleEnd);
          const formattedStart = start.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' });
          const formattedEnd = end.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' });
          setPeriodText(formattedStart + ' ~ ' + formattedEnd);
        }
        setBossMessage(stagedSettings.bossMessage || '');

        const stagedItems = JSON.parse(localStorage.getItem('nao3_staging_items') || '[]');
        setItems(stagedItems);
        setLoading(false);
        return;
      }`);
fs.writeFileSync('src/app/store/[storeId]/sale/page.tsx', salePage, 'utf8');

// 2. Update MartAdmin.tsx
let martAdmin = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

// Add handlePreview before handleSave
martAdmin = martAdmin.replace(/const handleSave = async \(\) => \{/,
`const handlePreview = () => {
    localStorage.setItem('nao3_staging_settings', JSON.stringify({
      storeName,
      saleStart,
      saleEnd,
      bossMessage
    }));
    localStorage.setItem('nao3_staging_items', JSON.stringify(items));
    window.open(\`/store/\${storeSlug}/sale?preview=true\`, '_blank');
  };

  // 최종 전송 버튼
  const handleSave = async () => {`);

// Remove URL link
const urlLinkRegex = /\{\/\* 고유 URL 복사 안내 \*\/\}\s*<div className="text-\[11px\] text-gray-500 flex items-center gap-1 mt-1">\s*👉 <span className="font-medium text-\[#5F0080\]">nao3\.vercel\.app\/store\/\{storeSlug\}\/sale<\/span>\s*<\/div>/;
martAdmin = martAdmin.replace(urlLinkRegex, '');

// Update bottom action area
const bottomRegex = /\{\/\* 플로팅 저장 버튼 \(대기열 바로 아래 위치\) \*\/\}\s*<div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between gap-4">\s*<div className="flex flex-col pl-1">\s*<span className="text-\[11px\] text-\[#5F0080\]\/70 font-semibold">총 등록 대기<\/span>\s*<span className="text-xl font-extrabold text-\[#5F0080\] leading-none">\{totalItemsCount\}건<\/span>\s*<\/div>\s*<button \s*onClick=\{handleSave\}\s*disabled=\{loading\}\s*className="flex-1 py-3\.5 bg-\[#5F0080\] hover:bg-\[#4a0066\] disabled:bg-gray-300 text-white font-bold rounded-xl transition-all shadow-sm disabled:shadow-none text-sm"\s*>\s*\{loading \? '저장 중\.\.\.' : '세일 푸시 등록 완료'\}\s*<\/button>\s*<\/div>/;

const newBottom = `{/* 하단 액션 버튼 그룹 */}
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

martAdmin = martAdmin.replace(bottomRegex, newBottom);

fs.writeFileSync('src/components/MartAdmin.tsx', martAdmin, 'utf8');

console.log("Updated both files successfully.");
