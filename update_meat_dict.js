const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const regex = /'정육': \['한우 등심', '한우 안심', '한우 국거리', '한우 불고기', '국내산 삼겹살', '국내산 목살', '찌개용 앞다리살', '수육용 삼겹살', '양념 돼지갈비', '닭볶음탕용 생닭', '닭가슴살', '호주산 척아이롤'\],/;

const replacement = `'정육': ['한우 등심', '한우 안심', '한우 국거리', '한우 불고기', '한돈 생삼겹살', '국내산 생삼겹살', '국내산 생목살', '그냥 생삼겹살', '생목살', '돼지고기 등심', '돼지고기 안심', '돼지고기 앞다리살', '돼지고기 항정살', '돼지고기 등뼈', '돼지고기 등갈비', '국내산 삼겹살', '국내산 목살', '찌개용 앞다리살', '수육용 삼겹살', '양념 돼지갈비', '닭볶음탕용 생닭', '닭가슴살', '호주산 척아이롤'],`;

if (c.match(regex)) {
  c = c.replace(regex, replacement);
  fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
  console.log("Updated meat dictionary");
} else {
  console.log("Regex not found");
}
