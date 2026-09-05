const fs = require('fs');

let c = fs.readFileSync('src/app/store/[storeId]/sale/page.tsx', 'utf8');

c = c.replace(/const mergedItems = \[\];/, 'const mergedItems: any[] = [];');
c = c.replace(/item\.options\.every\(opt =>/g, 'item.options.every((opt: any) =>');
c = c.replace(/item\.options\.map\(\(opt, idx\) =>/g, 'item.options.map((opt: any, idx: number) =>');

fs.writeFileSync('src/app/store/[storeId]/sale/page.tsx', c, 'utf8');
