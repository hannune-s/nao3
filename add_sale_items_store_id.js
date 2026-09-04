const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');
c = c.replace(/is_sold_out: item\.is_sold_out \|\| false,\r?\n\s*push_id: pushId\r?\n\s*\}\)\);/, 
`is_sold_out: item.is_sold_out || false,
          push_id: pushId,
          store_id: storeId
        }));`);
fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
