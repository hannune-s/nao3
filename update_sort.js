const fs = require('fs');
let c = fs.readFileSync('src/app/store/[storeId]/sale/page.tsx', 'utf8');

const regex = /const catItems = groupedItems\[cat\.id\];\s*if \(\!catItems \|\| catItems\.length === 0\) return null;/;

const replacement = `let catItems = groupedItems[cat.id];
              if (!catItems || catItems.length === 0) return null;

              // 야채/수산 카테고리 내부 정렬 로직 (채소 먼저, 수산물 나중에)
              if (cat.id === '야채' || cat.id === '야채·수산') {
                const isSeafood = (name: string) => {
                  const keywords = ['오징어', '갈치', '고등어', '전복', '바지락', '굴', '꽃게', '게', '새우', '주꾸미', '쭈꾸미', '동태', '생태', '명태', '미역', '다시마', '멸치', '낙지', '문어', '조개', '가리비', '해물', '수산', '연어', '광어', '우럭', '꽁치', '삼치', '장어', '홍합', '해파리', '꼬막', '미꾸라지', '대하', '소라'];
                  return keywords.some(kw => name.includes(kw));
                };
                catItems = [...catItems].sort((a, b) => {
                  const aIsSeafood = isSeafood(a.product_name) ? 1 : 0;
                  const bIsSeafood = isSeafood(b.product_name) ? 1 : 0;
                  return aIsSeafood - bIsSeafood;
                });
              }`;

if (c.match(regex)) {
  c = c.replace(regex, replacement);
  fs.writeFileSync('src/app/store/[storeId]/sale/page.tsx', c, 'utf8');
  console.log("Successfully updated sorting logic");
} else {
  console.log("Regex didn't match.");
}
