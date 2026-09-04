const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

c = c.replace(/\.insert\(\[\{\s*item_count: validItems\.length,/g, 
  `.insert([{ store_id: storeId, item_count: validItems.length,`);

c = c.replace(/boss_message: bossMessage\s*\}\);\s*if \(error\) throw error;\s*\}/g,
  `store_id: storeId, boss_message: bossMessage }); if (error) throw error; }`);

// Wait, let's just make sure the `else` logic actually exists in handleQuickSaveSettings.
if (!c.includes('item_count: 0')) {
  // Let's add the else block if it's missing in handleQuickSaveSettings.
  c = c.replace(/if \(\!updatedData \|\| updatedData\.length === 0\) \{\n             throw new Error\("보안 정책\(RLS\) 문제로 업데이트가 차단되었습니다! 성공코드와 SQL을 Supabase에서 실행해주세요!"\);\n          \}\n          alert\('진행 중인 세일의 기간과 사장님 이야기가 즉시 반영되었습니다!'\);\n        \}/, 
    `if (!updatedData || updatedData.length === 0) {
             throw new Error("보안 정책(RLS) 문제로 업데이트가 차단되었습니다! 성공코드와 SQL을 Supabase에서 실행해주세요!");
          }
          alert('진행 중인 세일의 기간과 사장님 이야기가 즉시 반영되었습니다!');
        } else {
          const { error } = await supabase.from('nao3_push_history').insert({
            store_id: storeId,
            sale_start: newStart,
            sale_end: newEnd,
            boss_message: bossMessage,
            item_count: 0
          });
          if (error) throw error;
          alert('새로운 세일 일정이 등록되었습니다!');
        }`);
}

fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
