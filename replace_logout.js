const fs = require('fs');

let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const logoutBtnRegex = /<button \s*onClick=\{async \(\) => \{ await supabase\.auth\.signOut\(\); window\.location\.reload\(\); \}\}\s*className="text-xs text-gray-500 hover:text-gray-800 underline"\s*>\s*로그아웃\s*<\/button>/;

const newBtn = `<button 
            onClick={() => window.open(\`/store/\${storeSlug}/sale\`, '_blank')}
            className="text-[11px] font-bold text-white bg-[#5F0080] px-3 py-1.5 rounded-lg shadow-sm hover:bg-[#4a0066] transition-colors flex items-center gap-1"
          >
            고객 화면 보기
          </button>`;

if (logoutBtnRegex.test(c)) {
  c = c.replace(logoutBtnRegex, newBtn);
  fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
  console.log("Replaced logout button with Customer View button");
} else {
  console.log("Could not find logout button to replace");
}
