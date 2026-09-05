const fs = require('fs');

let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const regex = /\{\/\* 헤더 \*\/\}\s*<div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between shadow-sm sticky top-0 z-50">\s*<div className="flex flex-col gap-1">\s*<div className="flex items-center gap-2">\s*<h1 className="text-xl font-extrabold text-\[#5F0080\] tracking-tight">Nao3<\/h1>\s*<span className="bg-gray-100 text-gray-500 text-\[10px\] font-bold px-2 py-0\.5 rounded-md">슈퍼마켓 어드민<\/span>\s*<\/div>\s*<\/div>\s*<button \s*onClick=\{\(\) => window\.open\(\`\/store\/\$\{storeSlug\}\/sale\`, '_blank'\)\}\s*className="text-\[11px\] font-bold text-white bg-\[#5F0080\] px-3 py-1\.5 rounded-lg shadow-sm hover:bg-\[#4a0066\] transition-colors flex items-center gap-1"\s*>\s*고객 화면 보기\s*<\/button>\s*<\/div>/;

const newHeader = `{/* 헤더 */}
        <div className="bg-[#5F0080] p-4 border-b border-purple-900 flex items-center justify-between shadow-md sticky top-0 z-50 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
          
          <div className="flex flex-col gap-1 relative z-10">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-tight drop-shadow-sm">Nao3</h1>
              <span className="bg-purple-900/50 text-purple-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-700/50">슈퍼마켓 어드민</span>
            </div>
          </div>
          
          <button 
            onClick={() => window.open(\`/store/\${storeSlug}/sale\`, '_blank')}
            className="text-[11px] font-extrabold text-[#5F0080] bg-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-purple-50 transition-colors flex items-center gap-1 relative z-10"
          >
            고객 화면 보기
          </button>
        </div>`;

if (regex.test(c)) {
  c = c.replace(regex, newHeader);
  fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
  console.log("Successfully replaced header");
} else {
  console.log("Regex didn't match.");
}
