const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

// 1. Remove "최근 사용 및 추천 품목" header
const nameHeaderRegex = /\{newItem\.product_name\.trim\(\) === '' && recentNames\.length > 0 && \(\s*<li className="[^"]*">\s*최근 사용 및 추천 품목\s*<span className="[^"]*">MY<\/span>\s*<\/li>\s*\)\}/g;
c = c.replace(nameHeaderRegex, '');

// 2. Remove "우리 매장 단위" header
const qtyHeaderRegex = /\{newItem\.quantity\.trim\(\) === '' && recentQtys\.length > 0 && \(\s*<li className="[^"]*">\s*우리 매장 단위\s*<span className="[^"]*">MY<\/span>\s*<\/li>\s*\)\}/g;
c = c.replace(qtyHeaderRegex, '');

// 3. Remove "최근 입력한 가격" header
const priceHeaderRegex = /\{newItem\.sale_price\.trim\(\) === '' && recentPrices\.length > 0 && \(\s*<li className="[^"]*">\s*최근 입력한 가격\s*<span className="[^"]*">MY<\/span>\s*<\/li>\s*\)\}/g;
c = c.replace(priceHeaderRegex, '');

fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
console.log('Successfully removed all custom MY headers from dropdowns.');
