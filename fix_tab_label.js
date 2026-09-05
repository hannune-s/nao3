const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

c = c.replace(/<span>\{cat\.id\}<\/span>/, '<span>{cat.label || cat.id}</span>');

fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
console.log('Fixed tab label rendering.');
