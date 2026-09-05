const fs = require('fs');

// 1. Update sale/page.tsx to strictly OVERWRITE instead of pushing options
let pageCode = fs.readFileSync('src/app/store/[storeId]/sale/page.tsx', 'utf8');

const regexPage = /existing\.options\.push\(\{[\s\S]*?\}\);/;
const replacePage = `// 기존 옵션을 배열에 추가하지 않고 완전히 최신값으로 덮어씌움 (단일 라인 유지)
                          existing.options = [{
                            id: item.id,
                            quantity: item.quantity,
                            sale_price: item.sale_price,
                            is_sold_out: item.is_sold_out
                          }];`;

if (pageCode.match(regexPage)) {
  pageCode = pageCode.replace(regexPage, replacePage);
  fs.writeFileSync('src/app/store/[storeId]/sale/page.tsx', pageCode, 'utf8');
} else {
  console.log("Could not find the target string in page.tsx");
}

// 2. Update MartAdmin.tsx handleSave logic for existing items in DB
let adminCode = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const saveLogicRegex = /if \(isSamePeriod\) \{[\s\S]*?pushId = latestPush\.id;[\s\S]*?const \{ data: updatedData, error: updateError \} = await supabase\.from\('nao3_push_history'\)\.update\(\{[\s\S]*?item_count: latestPush\.item_count \+ validItems\.length,[\s\S]*?boss_message: bossMessage\.trim\(\) \|\| null[\s\S]*?\}\)\.eq\('id', pushId\)\.select\(\);[\s\S]*?if \(updateError\) throw updateError;[\s\S]*?if \(\!updatedData \|\| updatedData\.length === 0\) \{[\s\S]*?throw new Error\("보안 정책\(RLS\) 문제로 업데이트가 차단되었습니다. 제공해드린 SQL을 Supabase에서 실행해주세요!"\);[\s\S]*?\}[\s\S]*?\} else \{/;

const newSaveLogic = `if (isSamePeriod) {
        // 기존 그룹에 추가 (업데이트)
        pushId = latestPush.id;
        
        const existingItemsInDb = latestPush.nao3_sale_items || [];
        const toUpdate: any[] = [];
        const toInsert: any[] = [];

        for (const item of validItems) {
          const dbMatch = existingItemsInDb.find((dbItem: any) => dbItem.product_name === item.product_name);
          if (dbMatch) {
            toUpdate.push({ id: dbMatch.id, quantity: item.quantity, sale_price: item.sale_price, category: item.category });
          } else {
            toInsert.push(item);
          }
        }

        // Run updates for existing DB items
        for (const up of toUpdate) {
           await supabase.from('nao3_sale_items').update({ quantity: up.quantity, sale_price: up.sale_price, category: up.category }).eq('id', up.id);
        }
        
        // Update the validItems array to only contain the items we need to insert
        validItems.length = 0;
        validItems.push(...toInsert);

        const { data: updatedData, error: updateError } = await supabase.from('nao3_push_history').update({
          item_count: latestPush.item_count + toInsert.length,
          boss_message: bossMessage.trim() || null
        }).eq('id', pushId).select();
        
        if (updateError) throw updateError;
      } else {`;

if (adminCode.match(saveLogicRegex)) {
  adminCode = adminCode.replace(saveLogicRegex, newSaveLogic);
  fs.writeFileSync('src/components/MartAdmin.tsx', adminCode, 'utf8');
  console.log("Successfully updated admin deduplication logic in handleSave");
} else {
  console.log("Could not find handleSave logic in MartAdmin.tsx");
}
