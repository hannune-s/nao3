const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const regex = /'청과': \['사과', '바나나', '제주 감귤', '샤인머스캣', '고당도 수박', '딸기', '성주 참외', '딱딱이 복숭아', '신고배', '방울토마토', '블루베리', '오렌지'\],/;

const replacement = `'청과': ['사과', '홍로사과', '바나나', '제주 감귤', '샤인머스캣', '캠벨포도', '고당도 수박', '딸기', '성주 참외', '딱딱이 복숭아', '신고배', '방울토마토', '블루베리', '오렌지', '골드키위', '그린키위', '애플망고', '노란망고', '석류', '체리'],`;

if (c.match(regex)) {
  c = c.replace(regex, replacement);
  fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
  console.log("Updated fruits dictionary");
} else {
  console.log("Regex not found");
}
