const fs = require('fs');

let code = fs.readFileSync('src/components/MartAdmin.tsx', 'utf8');

const regexSpecial = /const handleSaveSpecial = async \(\) => \{\n\s*setIsSavingSpecial\(true\);\n\s*try \{\n\s*let finalUrl = specialForm\.media_url;/;

const replacementSpecial = \`const handleSaveSpecial = async () => {
    setIsSavingSpecial(true);
    try {
      let finalUrl = specialForm.media_url;

      // [체험 모드 처리]
      if (storeId.startsWith('demo-guest-')) {
        if (specialFile) {
          // 체험 모드에서는 파일 업로드 시 로컬 URL을 사용
          finalUrl = URL.createObjectURL(specialFile);
        }
        const demoSpecial = {
          title: specialForm.title,
          price: specialForm.price,
          message: specialForm.message,
          media_url: finalUrl
        };
        localStorage.setItem(\\\`nao3_draft_special_\\\${storeId}\\\`, JSON.stringify(demoSpecial));
        
        // preview 모드를 위해 staging settings에도 반영
        const stagedSettings = JSON.parse(localStorage.getItem('nao3_staging_settings') || '{}');
        stagedSettings.special_title = specialForm.title;
        stagedSettings.special_price = specialForm.price;
        stagedSettings.special_message = specialForm.message;
        stagedSettings.special_image_url = finalUrl;
        localStorage.setItem('nao3_staging_settings', JSON.stringify(stagedSettings));
        
        alert('체험 모드: 사진과 강력 추천 특가가 고객화면에 실시간 반영되었습니다!');
        setIsSavingSpecial(false);
        return;
      }\`;

if (regexSpecial.test(code)) {
  code = code.replace(regexSpecial, replacementSpecial);
  console.log('Patched handleSaveSpecial');
}

const regexQuick = /const handleQuickSaveSettings = async \(\) => \{\n\s*if \(\!saleStart \|\| \!saleEnd\) \{\n\s*alert\('세일 시작일과 종료일을 입력해주세요\.'\);\n\s*return;\n\s*\}\n\s*setLoading\(true\);\n\s*try \{/;

const replacementQuick = \`const handleQuickSaveSettings = async () => {
    if (!saleStart || !saleEnd) {
      alert('세일 시작일과 종료일을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      // [체험 모드 처리]
      if (storeId.startsWith('demo-guest-')) {
        const stagedSettings = JSON.parse(localStorage.getItem('nao3_staging_settings') || '{}');
        stagedSettings.storeName = storeName;
        stagedSettings.saleStart = saleStart;
        stagedSettings.saleEnd = saleEnd;
        stagedSettings.bossMessage = bossMessage;
        localStorage.setItem('nao3_staging_settings', JSON.stringify(stagedSettings));
        
        localStorage.setItem(\\\`nao3_draft_storeName_\\\${storeId}\\\`, storeName);
        localStorage.setItem(\\\`nao3_draft_saleStart_\\\${storeId}\\\`, saleStart);
        localStorage.setItem(\\\`nao3_draft_saleEnd_\\\${storeId}\\\`, saleEnd);
        localStorage.setItem(\\\`nao3_draft_bossMessage_\\\${storeId}\\\`, bossMessage);
        
        alert('체험 모드: 상호명, 기간, 멘트가 성공적으로 반영되었습니다!');
        setLoading(false);
        return;
      }\`;

if (regexQuick.test(code)) {
  code = code.replace(regexQuick, replacementQuick);
  console.log('Patched handleQuickSaveSettings');
}

fs.writeFileSync('src/components/MartAdmin.tsx', code);
