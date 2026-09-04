const fs = require('fs');

let c = fs.readFileSync('src/app/register/page.tsx', 'utf8');

const targetStr = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('사업자등록증을 첨부해주세요.');
      return;
    }

    setLoading(true);
    try {`;

const replacement = `const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) {
      alert('매장 아이디를 입력해주세요.');
      return;
    }
    if (!file) {
      alert('사업자등록증을 첨부해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 0. 슬러그(아이디) 중복 체크
      const { data: existingStore } = await supabase
        .from('nao3_stores')
        .select('slug')
        .eq('slug', slug)
        .single();

      if (existingStore) {
        alert('이미 사용 중인 매장 아이디(주소)입니다. 다른 영문 아이디를 입력해주세요.');
        setLoading(false);
        return;
      }`;

// Since the Korean encoding can mess up direct string replacements, I'll use regex.
const regex = /const handleSubmit = async \(e: React\.FormEvent\) => \{\s*e\.preventDefault\(\);\s*if \(!file\) \{\s*alert\('[^']+'\);\s*return;\s*\}\s*setLoading\(true\);\s*try \{/;

if (regex.test(c)) {
  c = c.replace(regex, replacement);
  fs.writeFileSync('src/app/register/page.tsx', c, 'utf8');
  console.log("Replaced successfully");
} else {
  console.log("Could not find match");
}
