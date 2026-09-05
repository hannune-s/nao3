const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const regex = /const dbMatch = latestPush\.nao3_sale_items\.find\(\(i: any\) => i\.product_name === newItem\.product_name\);\s*if \(dbMatch\) \{\s*targetHistoryItemId = \{ pushId: latestPush\.id, itemId: dbMatch\.id \};\s*\}/;

const replaceWith = `const dbMatches = latestPush.nao3_sale_items.filter((i: any) => i.product_name === newItem.product_name);
      if (dbMatches.length > 0) {
        // 기존 중복 데이터가 있을 경우 가장 마지막 항목(화면에 렌더링되는 항목)을 타겟으로 함
        targetHistoryItemId = { pushId: latestPush.id, itemId: dbMatches[dbMatches.length - 1].id };
      }`;

if (c.match(regex)) {
  c = c.replace(regex, replaceWith);
  fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
  console.log('Fixed dbMatch');
} else {
  console.log('Could not find dbMatch');
}
