const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');
c = c.replace(/push_id: pushId,\\n          store_id: storeId\\n        \}\}\)\);/g, 'push_id: pushId,\n          store_id: storeId\n        }));');
fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
