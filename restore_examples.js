const fs = require('fs');

let adminCode = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

// 1. Change matchedNames assignment
const matchedNamesRegex = /const matchedNames = newItem\.product_name\.trim\(\) === ''\s*\?\s*recentNames\.slice\(\0, 15\)\s*\/\/\s*빈 칸일 때는 내 최근 이력 표시\s*:\s*allNames\.filter\(name => matchSearch\(newItem\.product_name, name\)\);/;
const matchedNamesNew = `const matchedNames = newItem.product_name.trim() === '' 
    ? allNames.slice(0, 30) // 빈 칸일 때는 내 최근 이력 + 기본 예제 표시
    : allNames.filter(name => matchSearch(newItem.product_name, name));`;

if (adminCode.match(matchedNamesRegex)) {
  adminCode = adminCode.replace(matchedNamesRegex, matchedNamesNew);
} else {
  console.log("Could not find matchedNames logic");
}

// 2. Change the label
const labelRegex = /우리 매장 최근 품목/;
const labelNew = `최근 사용 및 추천 품목`;
if (adminCode.match(labelRegex)) {
  adminCode = adminCode.replace(labelRegex, labelNew);
}

fs.writeFileSync('src/components/MartAdmin.tsx', adminCode, 'utf8');
console.log("Successfully restored default examples in empty input");
