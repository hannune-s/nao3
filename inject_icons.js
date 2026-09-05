const fs = require('fs');

let c = fs.readFileSync('src/app/store/[storeId]/sale/page.tsx', 'utf8');

// 1. Insert getIconForProduct function
const iconFunction = `
const getIconForProduct = (name: string) => {
  if (!name) return '✨';
  const n = name.replace(/\\s/g, '');
  
  // 과일류
  if (n.includes('사과')) return '🍎';
  if (n.includes('귤') || n.includes('오렌지') || n.includes('한라봉') || n.includes('레몬')) return '🍊';
  if (n.includes('바나나')) return '🍌';
  if (n.includes('포도') || n.includes('샤인머스캣')) return '🍇';
  if (n.includes('수박')) return '🍉';
  if (n.includes('딸기')) return '🍓';
  if (n.includes('복숭아')) return '🍑';
  if (n.includes('참외') || n.includes('메론') || n.includes('멜론')) return '🍈';
  if (n.includes('배')) return '🍐';
  if (n.includes('토마토')) return '🍅';
  if (n.includes('블루베리')) return '🫐';
  if (n.includes('키위')) return '🥝';
  if (n.includes('망고')) return '🥭';
  if (n.includes('체리')) return '🍒';
  
  // 채소류
  if (n.includes('마늘')) return '🧄';
  if (n.includes('양파')) return '🧅';
  if (n.includes('파') || n.includes('부추')) return '🌱';
  if (n.includes('고추')) return '🌶️';
  if (n.includes('감자')) return '🥔';
  if (n.includes('고구마')) return '🍠';
  if (n.includes('호박')) return '🎃';
  if (n.includes('당근')) return '🥕';
  if (n.includes('버섯')) return '🍄';
  if (n.includes('옥수수')) return '🌽';
  if (n.includes('브로콜리')) return '🥦';
  if (n.includes('배추') || n.includes('상추') || n.includes('깻잎') || n.includes('시금치') || n.includes('나물') || n.includes('아욱') || n.includes('봄동')) return '🥬';
  if (n.includes('오이')) return '🥒';
  
  // 수산물
  if (n.includes('오징어') || n.includes('주꾸미') || n.includes('쭈꾸미') || n.includes('문어') || n.includes('낙지')) return '🦑';
  if (n.includes('갈치') || n.includes('고등어') || n.includes('동태') || n.includes('생태') || n.includes('명태') || n.includes('꽁치') || n.includes('연어') || n.includes('생선') || n.includes('멸치') || n.includes('수산')) return '🐟';
  if (n.includes('전복') || n.includes('바지락') || n.includes('조개') || n.includes('굴') || n.includes('홍합') || n.includes('가리비') || n.includes('꼬막')) return '🦪';
  if (n.includes('새우') || n.includes('대하')) return '🦐';
  if (n.includes('게') || n.includes('크랩')) return '🦀';
  if (n.includes('미역') || n.includes('다시마')) return '🌿';
  
  // 정육
  if (n.includes('소') || n.includes('한우') || n.includes('등심') || n.includes('안심') || n.includes('국거리') || n.includes('불고기') || n.includes('스테이크')) return '🥩';
  if (n.includes('돼지') || n.includes('삼겹') || n.includes('목살') || n.includes('갈비') || n.includes('앞다리') || n.includes('항정') || n.includes('한돈')) return '🥓';
  if (n.includes('닭') || n.includes('치킨')) return '🍗';
  if (n.includes('계란') || n.includes('달걀') || n.includes('메추리알')) return '🥚';
  
  // 공산품/기타
  if (n.includes('우유')) return '🥛';
  if (n.includes('라면') || n.includes('면')) return '🍜';
  if (n.includes('참치') || n.includes('스팸') || n.includes('통조림') || n.includes('골뱅이') || n.includes('만두')) return '🥫';
  if (n.includes('커피') || n.includes('맥심') || n.includes('카누')) return '☕';
  if (n.includes('과자') || n.includes('고래밥')) return '🍪';
  if (n.includes('콜라') || n.includes('사이다') || n.includes('음료')) return '🥤';
  if (n.includes('휴지') || n.includes('롤') || n.includes('티슈') || n.includes('깨끗한나라')) return '🧻';
  if (n.includes('기름') || n.includes('유') || n.includes('식용유') || n.includes('참기름')) return '🫙';
  if (n.includes('김')) return '🍙';
  if (n.includes('세제') || n.includes('샤프란') || n.includes('퐁퐁')) return '🫧';
  
  return '✨'; // 기본 아이콘
};
`;

if (!c.includes('getIconForProduct')) {
  c = c.replace("import { useParams } from 'next/navigation';", "import { useParams } from 'next/navigation';\n" + iconFunction);
}

// 2. Insert the icon into the DOM
const targetDomRegex = /\{item\.is_sold_out && \(\s*<span className="text-\[11px\] font-black text-white bg-red-600 px-2 py-1 rounded shrink-0 leading-none shadow-sm tracking-wide">\s*품절\s*<\/span>\s*\)\}\s*<h4 className=\{\`text-\[16px\] font-bold text-gray-900 truncate/;

const domReplacement = `{item.is_sold_out && (
                            <span className="text-[11px] font-black text-white bg-red-600 px-2 py-1 rounded shrink-0 leading-none shadow-sm tracking-wide">
                              품절
                            </span>
                          )}
                          <span className="flex-shrink-0 w-[26px] h-[26px] bg-[#F9F9F9] rounded-full flex items-center justify-center border border-gray-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] text-[14px]">
                            {getIconForProduct(item.product_name)}
                          </span>
                          <h4 className={\`text-[16px] font-bold text-gray-900 truncate`;

if (c.match(targetDomRegex)) {
  c = c.replace(targetDomRegex, domReplacement);
  fs.writeFileSync('src/app/store/[storeId]/sale/page.tsx', c, 'utf8');
  console.log("Successfully injected premium minimal icons");
} else {
  console.log("Regex didn't match.");
}
