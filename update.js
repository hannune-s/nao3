const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

c = c.replace(/const \{ data: latestPush \} = await supabase\s*\.from\('nao3_push_history'\)\s*\.select\('\*'\)\s*\.order\('created_at'/g, 
  "const { data: latestPush } = await supabase.from('nao3_push_history').select('*').eq('store_id', storeId).order('created_at'");

c = c.replace(/boss_message: bossMessage,\s*item_count: 0\s*\}\);/g, 
  "store_id: storeId, boss_message: bossMessage, item_count: 0 });");

c = c.replace(/boss_message: bossMessage\.trim\(\) \|\| null\s*\}\]\);/g, 
  "store_id: storeId, boss_message: bossMessage.trim() || null }]);");

c = c.replace(/<span className="bg-gray-100 text-gray-500 text-\[10px\] font-bold px-2 py-0\.5 rounded-md">슈퍼마켓 어드민<\/span>\s*<\/div>/g,
  `<span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-md">슈퍼마켓 어드민</span>
            </div>
            {/* 고유 URL 복사 안내 */}
            <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
              🔗 <span className="font-medium text-[#5F0080]">nao3.vercel.app/store/{storeId}/sale</span>
            </div>
          </div>`);
          
c = c.replace(/<div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between shadow-sm sticky top-0 z-50">\s*<div className="flex items-center gap-2">/g,
  `<div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between shadow-sm sticky top-0 z-50">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">`);


fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
console.log("Updated MartAdmin.tsx");
