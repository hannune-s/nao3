const fs = require('fs');
let c = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

// 1. Initial State Updates
c = c.replace(
  "const [items, setItems] = useState<any[]>([]);",
  `const [items, setItems] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nao3_staging_items');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [];
  });`
);

c = c.replace(
  "const [storeName, setStoreName] = useState(initialStoreName || '');",
  `const [storeName, setStoreName] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(\`nao3_draft_storeName_\${storeId}\`);
      if (saved) return saved;
    }
    return initialStoreName || '';
  });`
);

c = c.replace(
  "const [saleStart, setSaleStart] = useState('');",
  `const [saleStart, setSaleStart] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(\`nao3_draft_saleStart_\${storeId}\`);
      if (saved) return saved;
    }
    return '';
  });`
);

c = c.replace(
  "const [saleEnd, setSaleEnd] = useState('');",
  `const [saleEnd, setSaleEnd] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(\`nao3_draft_saleEnd_\${storeId}\`);
      if (saved) return saved;
    }
    return '';
  });`
);

c = c.replace(
  "const [bossMessage, setBossMessage] = useState('');",
  `const [bossMessage, setBossMessage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(\`nao3_draft_bossMessage_\${storeId}\`);
      if (saved !== null) return saved;
    }
    return '';
  });`
);

// 2. Remove old redundant load logic
const redundantRegex = /\/\/\s*항상 임시 저장 데이터 로드[\s\S]*?else if \(isAppendingToActive && latestPush\?\.boss_message\) \{\s*setBossMessage\(latestPush\.boss_message\);\s*\}/;
c = c.replace(redundantRegex, `if (isAppendingToActive && latestPush?.boss_message) {
        setBossMessage(prev => prev || latestPush.boss_message);
      }`);

// 3. Update useEffects for autosave
const oldUseEffectsRegex = /\/\/\s*items, bossMessage 상태가 변경될 때마다 로컬 스토리지 업데이트[\s\S]*?\}, \[bossMessage\]\);/;
const newUseEffects = `// 상태가 변경될 때마다 로컬 스토리지에 자동 임시 저장 (새로고침 방지)
  useEffect(() => {
    localStorage.setItem('nao3_staging_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(\`nao3_draft_storeName_\${storeId}\`, storeName);
  }, [storeName, storeId]);

  useEffect(() => {
    localStorage.setItem(\`nao3_draft_saleStart_\${storeId}\`, saleStart);
  }, [saleStart, storeId]);

  useEffect(() => {
    localStorage.setItem(\`nao3_draft_saleEnd_\${storeId}\`, saleEnd);
  }, [saleEnd, storeId]);

  useEffect(() => {
    localStorage.setItem(\`nao3_draft_bossMessage_\${storeId}\`, bossMessage);
  }, [bossMessage, storeId]);`;

c = c.replace(oldUseEffectsRegex, newUseEffects);

fs.writeFileSync('src/components/MartAdmin.tsx', c, 'utf8');
console.log("Successfully implemented auto-save for all form fields");
