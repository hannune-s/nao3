const fs = require('fs');
let c = fs.readFileSync('src/app/store/[storeId]/page.tsx', 'utf8');
c = c.replace(/\\`/g, '`');
fs.writeFileSync('src/app/store/[storeId]/page.tsx', c, 'utf8');
