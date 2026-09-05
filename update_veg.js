const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const regex = /'야채': \[.*?\],/;
const match = c.match(regex);

if (match) {
  const currentStr = match[0];
  const arrStr = currentStr.substring(currentStr.indexOf('[') + 1, currentStr.lastIndexOf(']'));
  const currentItems = arrStr.split(',').map(s => s.trim().replace(/'/g, ''));

  const newItems = ['백오이','밤','호박고구마','밤고구마','양배추','시금치','우엉','아욱','참나물','깻잎','상추','새송이','느타리버섯','참마','브루콜리','감자','당근','취나물','콩나물','숙주나물','봄동','배추'];

  const merged = [...new Set([...currentItems, ...newItems])];

  const replacementStr = `'야채': ['` + merged.join("', '") + `'],`;
  c = c.replace(regex, replacementStr);

  fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
  console.log("Successfully updated vegetables dictionary");
} else {
  console.log("Regex not found");
}
