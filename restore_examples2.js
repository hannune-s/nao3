const fs = require('fs');
let adminCode = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const matchedNamesRegex = /const matchedNames = newItem\.product_name\.trim\(\) === ''\s*\?\s*recentNames\.slice\(0, 15\)[\s\S]*?:\s*allNames\.filter\(name => matchSearch\(newItem\.product_name, name\)\);/;
const matchedNamesNew = `const matchedNames = newItem.product_name.trim() === '' 
    ? allNames.slice(0, 30) // 빈 칸일 때는 내 최근 이력 + 기본 예제 표시
    : allNames.filter(name => matchSearch(newItem.product_name, name));`;

if (adminCode.match(matchedNamesRegex)) {
  adminCode = adminCode.replace(matchedNamesRegex, matchedNamesNew);
  fs.writeFileSync('src/components/MartAdmin.tsx', adminCode, 'utf8');
  console.log("Successfully restored default examples in empty input");
} else {
  console.log("Still could not find it");
}
