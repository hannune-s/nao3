const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const regex = /'공산품': \[.*?\]/;
const match = c.match(regex);

if (match) {
  const currentStr = match[0];
  const arrStr = currentStr.substring(currentStr.indexOf('[') + 1, currentStr.lastIndexOf(']'));
  const currentItems = arrStr.split(',').map(s => s.trim().replace(/'/g, ''));

  const newItems = ['오리온왕고래밥', '삼양라면멀티 5입', '오징어짬뽕 6입', '동원양반김 3종', '백설콩식용유1.8L', 'CJ햇반찰기가득쌀밥200g*12입', '국내산천일염 20kg', '맥심모카믹스 160T+20T', '백설고소함가득참기름 450ml', '오뚜기사골곰탕 500g', '비비고진한사골곰탕 500g', '대상순창태양초고추장 1.5kg', '청정원맛술 3종/830ml', '동원쯔유 500g', '백설올리브유 900ml', 'CJ백설올리고당 2종/1.2kg', '농심신라면 5입', '스팸클래식 300g*3', '풀무원 특등급 국산콩물 960g', '유동자연산골뱅이 300g', '동원마일드참치 200g', '동원개성왕만두 2종/630g', '펩시콜라 2L', '카스알뜰캔 370ml*8', '퐁퐁친환경주방세제 1.2L', '샤프란햇빛건조 3종/2L', '깨끗한나라 더순수 30롤'];

  const merged = [...new Set([...currentItems, ...newItems])].filter(Boolean);

  const replacementStr = `'공산품': ['` + merged.join("', '") + `']`;
  c = c.replace(regex, replacementStr);

  fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
  console.log("Successfully updated groceries dictionary");
} else {
  console.log("Regex not found");
}
