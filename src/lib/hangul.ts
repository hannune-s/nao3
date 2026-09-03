const CHOSUNG_LIST = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];

export function getChosung(str: string) {
  let result = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i) - 0xAC00;
    if (code > -1 && code < 11172) {
      result += CHOSUNG_LIST[Math.floor(code / 588)];
    } else {
      result += str.charAt(i);
    }
  }
  return result;
}

export function matchSearch(keyword: string, target: string) {
  if (!keyword) return true; // 키워드가 없으면 모두 표시
  
  const kw = keyword.toLowerCase().replace(/\s+/g, '');
  const tg = target.toLowerCase().replace(/\s+/g, '');
  
  // 1. 일반 텍스트 포함 확인
  if (tg.includes(kw)) return true;
  
  // 2. 초성 포함 확인
  const tgChosung = getChosung(tg);
  const kwChosung = getChosung(kw);
  
  if (tgChosung.includes(kwChosung)) return true;
  
  return false;
}
