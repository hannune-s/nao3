const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const doubleBlock = `    // 현재 작성 중인 기간이 최신 이력(Active)과 같은지 확인
    const newStart = saleStart ? new Date(saleStart).getTime() : 0;
    const newEnd = saleEnd ? new Date(saleEnd).getTime() : 0;
    const latestPush = histories[0];
    const isSamePeriod = latestPush && 
      new Date(latestPush.sale_start).getTime() === newStart && 
      new Date(latestPush.sale_end).getTime() === newEnd;

    let targetHistoryItemId = editingHistoryItemId;

    // 현재 작성 중인 기간이 최신 이력(Active)과 같은지 확인
    const newStart = saleStart ? new Date(saleStart).getTime() : 0;
    const newEnd = saleEnd ? new Date(saleEnd).getTime() : 0;
    const latestPush = histories[0];
    const isSamePeriod = latestPush && 
      new Date(latestPush.sale_start).getTime() === newStart && 
      new Date(latestPush.sale_end).getTime() === newEnd;`;

const singleBlock = `    // 현재 작성 중인 기간이 최신 이력(Active)과 같은지 확인
    const newStart = saleStart ? new Date(saleStart).getTime() : 0;
    const newEnd = saleEnd ? new Date(saleEnd).getTime() : 0;
    const latestPush = histories[0];
    const isSamePeriod = latestPush && 
      new Date(latestPush.sale_start).getTime() === newStart && 
      new Date(latestPush.sale_end).getTime() === newEnd;

    let targetHistoryItemId = editingHistoryItemId;`;

if (c.indexOf(doubleBlock) !== -1) {
  c = c.replace(doubleBlock, singleBlock);
  fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
  console.log("Fixed double declarations");
} else {
  // Use regex as fallback
  const fallbackRegex = /const newStart = [^\n]*\n\s*const newEnd = [^\n]*\n\s*const latestPush = [^\n]*\n\s*const isSamePeriod = [\s\S]*?let targetHistoryItemId = editingHistoryItemId;\s*\/\/ 현재 작성 중인 기간이 최신 이력\(Active\)과 같은지 확인\s*const newStart = [^\n]*\n\s*const newEnd = [^\n]*\n\s*const latestPush = [^\n]*\n\s*const isSamePeriod = [\s\S]*?=== newEnd;/;
  if (c.match(fallbackRegex)) {
    c = c.replace(fallbackRegex, singleBlock);
    fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
    console.log("Fixed double declarations with regex");
  } else {
    console.log("Could not find it");
  }
}
