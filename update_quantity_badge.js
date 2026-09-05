const fs = require('fs');
let c = fs.readFileSync('src/app/store/[storeId]/sale/page.tsx', 'utf8');

const regex = /<span className=\{\`text-\[13px\] font-extrabold tracking-tight \$\{item\.is_sold_out \? 'text-gray-400' : 'text-\[#5F0080\]'\}\`\}>\s*\{item\.quantity\}\s*<\/span>/g;

const replacement = `<span className={\`text-[14px] font-extrabold tracking-tight px-2.5 py-1 rounded-md shrink-0 \${item.is_sold_out ? 'bg-gray-100 text-gray-400' : 'bg-purple-50 text-[#5F0080]'}\`}>
                            {item.quantity}
                          </span>`;

if (c.match(regex)) {
  c = c.replace(regex, replacement);
  fs.writeFileSync('src/app/store/[storeId]/sale/page.tsx', c, 'utf8');
  console.log("Successfully updated quantity badge");
} else {
  console.log("Regex didn't match.");
}
