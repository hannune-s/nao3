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

function isChosungChar(ch: string) {
  return CHOSUNG_LIST.includes(ch);
}

// 음절 + 초성 혼합 검색 지원 (예: "삼ㄱ" -> "삼겹살" 매칭, "한우ㄷ" -> "한우등심" 매칭)
function matchMixed(kw: string, tg: string): boolean {
  if (kw.length > tg.length) return false;
  const tgChosung = getChosung(tg);

  for (let start = 0; start <= tg.length - kw.length; start++) {
    let ok = true;
    for (let j = 0; j < kw.length; j++) {
      const kChar = kw[j];
      const tChar = tg[start + j];
      if (isChosungChar(kChar)) {
        if (tgChosung[start + j] !== kChar) {
          ok = false;
          break;
        }
      } else {
        if (tChar !== kChar) {
          ok = false;
          break;
        }
      }
    }
    if (ok) return true;
  }
  return false;
}

export function matchSearch(keyword: string, target: string) {
  if (!keyword) return true; // 키워드가 없으면 모두 표시
  
  const kw = keyword.toLowerCase().replace(/\s+/g, '');
  const tg = target.toLowerCase().replace(/\s+/g, '');
  
  // 1. 일반 텍스트 포함 확인
  if (tg.includes(kw)) return true;
  
  // 2. 초성 단독 및 음절+초성 혼합 매칭 확인 (예: "ㅎㅇ", "ㅅㄱㅅ", "삼ㄱ", "한우ㄷ")
  if (matchMixed(kw, tg)) return true;
  
  return false;
}

export function sortBySearchRelevance(keyword: string, list: string[]): string[] {
  const kw = keyword.trim().toLowerCase().replace(/\s+/g, '');
  if (!kw) return list;

  const scoreItem = (item: string): number => {
    const tg = item.toLowerCase().replace(/\s+/g, '');
    const tgChosung = getChosung(tg);
    const words = item.toLowerCase().split(/\s+/);

    // 1순위: 정확히 키워드로 시작하는 품목 (예: "삼겹" -> "삼겹살")
    if (tg.startsWith(kw)) return 1;
    // 2순위: 띄어쓰기 단어가 정확히 키워드로 시작하는 품목 (예: "삼겹" -> "한돈 삼겹살")
    if (words.some(w => w.startsWith(kw))) return 2;
    // 3순위: 일반 텍스트로 키워드를 포함하는 품목 (예: "삼겹" -> "생삼겹살")
    if (tg.includes(kw)) return 3;
    // 4순위: 초성/혼합이 맨 앞에서 시작하는 품목 (예: "ㅅㄱㅅ" -> "삼겹살")
    if (matchMixed(kw, tg.slice(0, kw.length))) return 4;
    // 5순위: 띄어쓰기 단어의 초성/혼합이 맨 앞에서 시작하는 품목 (예: "ㅅㄱㅅ" -> "한돈 삼겹살")
    if (words.some(w => w.length >= kw.length && matchMixed(kw, w.slice(0, kw.length)))) return 5;
    // 6순위: 초성 전체가 포함되는 기타 품목
    if (tgChosung.startsWith(kw)) return 6;
    return 7;
  };

  return [...list].sort((a, b) => {
    const diff = scoreItem(a) - scoreItem(b);
    if (diff !== 0) return diff;
    return a.length - b.length;
  });
}


