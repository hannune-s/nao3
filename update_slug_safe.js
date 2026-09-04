const fs = require('fs');

// 1. Update register/page.tsx
let reg = fs.readFileSync('src/app/register/page.tsx', 'utf8');
if (!reg.includes('setSlug')) {
  reg = reg.replace(/const \[storeName, setStoreName\] = useState\(''\);/, 
    "const [storeName, setStoreName] = useState('');\n  const [slug, setSlug] = useState('');");

  reg = reg.replace(/store_name: storeName,/, 
    "store_name: storeName,\n        slug,");

  const storeNameInput = `<input 
                  type="text" required placeholder="상호명" 
                  value={storeName} onChange={e => setStoreName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F0080]"
                />`;
  const newInputs = `${storeNameInput}
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">매장 전용 영문 아이디 (예: naosuper)</label>
                <input 
                  type="text" required placeholder="영문 소문자/숫자만 입력" 
                  value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F0080]"
                />`;
  reg = reg.replace(storeNameInput, newInputs);
  fs.writeFileSync('src/app/register/page.tsx', reg, 'utf8');
}

// 2. Update app/page.tsx (Login redirect)
let page = fs.readFileSync('src/app/page.tsx', 'utf8');
if (page.includes('data.session.user.id')) {
  page = page.replace(/router\.push\(\`\/store\/\$\{session\.user\.id\}\`\);/g, 
    "const { data: st } = await supabase.from('nao3_stores').select('slug').eq('id', session.user.id).single();\n      if(st) router.push(`/store/${st.slug}`);");
  
  page = page.replace(/router\.push\(\`\/store\/\$\{data\.session\.user\.id\}\`\);/g, 
    "const { data: st } = await supabase.from('nao3_stores').select('slug').eq('id', data.session.user.id).single();\n      if(st) router.push(`/store/${st.slug}`);");
  fs.writeFileSync('src/app/page.tsx', page, 'utf8');
}

// 3. Update store/[storeId]/page.tsx (Admin dashboard route)
let adminRoute = fs.readFileSync('src/app/store/[storeId]/page.tsx', 'utf8');
adminRoute = adminRoute.replace(/const storeId = params\.storeId as string;/, "const storeSlug = params.storeId as string;");
adminRoute = adminRoute.replace(/if \(storeId\)/g, "if (storeSlug)");
adminRoute = adminRoute.replace(/\[storeId\]/g, "[storeSlug]");

// We replace the checkUserAndStore logic
adminRoute = adminRoute.replace(/const checkUserAndStore = async \(\) => \{[\s\S]*?setLoading\(false\);\n  \};/, 
`const checkUserAndStore = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      router.push('/');
      return;
    }

    const { data: store, error } = await supabase
      .from('nao3_stores')
      .select('*')
      .eq('slug', storeSlug)
      .single();
      
    if (store) {
      if (session.user.id !== store.id) {
        alert('접근 권한이 없습니다.');
        router.push('/');
        return;
      }
      setStoreData(store);
    } else {
      console.error('Store 데이터를 찾을 수 없습니다.', error);
    }
    setLoading(false);
  };`);

adminRoute = adminRoute.replace(/return <MartAdmin storeId=\{storeData\.id\} initialStoreName=\{storeData\.store_name\} \/>;/, 
  "return <MartAdmin storeId={storeData.id} initialStoreName={storeData.store_name} storeSlug={storeData.slug} />;");
adminRoute = adminRoute.replace(/return <ButcherAdmin storeId=\{storeData\.id\} storeName=\{storeData\.store_name\} \/>;/, 
  "return <ButcherAdmin storeId={storeData.id} storeName={storeData.store_name} />;");
fs.writeFileSync('src/app/store/[storeId]/page.tsx', adminRoute, 'utf8');


// 4. Update store/[storeId]/sale/page.tsx (Customer flyer route)
let customerRoute = fs.readFileSync('src/app/store/[storeId]/sale/page.tsx', 'utf8');
customerRoute = customerRoute.replace(/const storeId = params\.storeId as string;/, "const storeSlug = params.storeId as string;");
customerRoute = customerRoute.replace(/if \(!storeId\) return;/, "if (!storeSlug) return;");

customerRoute = customerRoute.replace(/const \{ data: store \} = await supabase\s*\.from\('nao3_stores'\)\s*\.select\('store_name'\)\s*\.eq\('id', storeId\)\s*\.single\(\);/,
`const { data: store } = await supabase
          .from('nao3_stores')
          .select('id, store_name')
          .eq('slug', storeSlug)
          .single();`);
          
customerRoute = customerRoute.replace(/\.eq\('store_id', storeId\)/, ".eq('store_id', store?.id)");
fs.writeFileSync('src/app/store/[storeId]/sale/page.tsx', customerRoute, 'utf8');


// 5. Update MartAdmin.tsx to display storeSlug instead of storeId
let martAdmin = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');
martAdmin = martAdmin.replace(/interface MartAdminProps \{\s*storeId: string;\s*initialStoreName: string;\s*\}/, 
`interface MartAdminProps {
  storeId: string;
  initialStoreName: string;
  storeSlug?: string;
}`);
martAdmin = martAdmin.replace(/export default function MartAdmin\(\{ storeId, initialStoreName \}: MartAdminProps\) \{/, "export default function MartAdmin({ storeId, initialStoreName, storeSlug }: MartAdminProps) {");
martAdmin = martAdmin.replace(/nao3\.vercel\.app\/store\/\{storeId\}\/sale/g, "nao3.vercel.app/store/{storeSlug}/sale");
fs.writeFileSync('src/components/MartAdmin.tsx', martAdmin, 'utf8');

console.log('Update completed safely');
