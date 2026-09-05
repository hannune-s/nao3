const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const regex = /const QTY_DICT = \[\s*([\s\S]*?)\s*\];/;

const newQtys = [
  '마리', '팩', '단', '통', '입', 'kg', 'g', '롤', 'L', 'ml', '개', '봉', '망', '박스', '포', '캔', '병',
  '1통', '2통', '1입', '2입', '5입', '10입', '1kg', '2kg', '5kg', '10kg', '20kg',
  '1L', '1.5L', '2L', '500ml', '900ml', '30롤', '100매'
];

const match = c.match(regex);
if (match) {
  const currentQtys = match[1].split(',').map(s => s.trim().replace(/'/g, '').replace(/\n/g, '')).filter(Boolean);
  const merged = [...new Set([...currentQtys, ...newQtys])];
  const replacementStr = `const QTY_DICT = [\n  '` + merged.join("', '") + `'\n];`;
  c = c.replace(regex, replacementStr);
  fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
  console.log("Successfully updated QTY_DICT");
} else {
  console.log("Regex didn't match.");
}
