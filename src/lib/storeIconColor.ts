export interface StoreIconTheme {
  idx: number;
  name: string;
  hex: string;
  icon192: string;
  icon512: string;
}

export const STORE_ICON_PALETTE: StoreIconTheme[] = [
  { idx: 0, name: '시그니처 퍼플', hex: '#5F0080', icon192: '/icons/icon-192-0.png', icon512: '/icons/icon-512-0.png' },
  { idx: 1, name: '로얄 블루', hex: '#1D4ED8', icon192: '/icons/icon-192-1.png', icon512: '/icons/icon-512-1.png' },
  { idx: 2, name: '에메랄드 그린', hex: '#047857', icon192: '/icons/icon-192-2.png', icon512: '/icons/icon-512-2.png' },
  { idx: 3, name: '루비 레드', hex: '#DC2626', icon192: '/icons/icon-192-3.png', icon512: '/icons/icon-512-3.png' },
  { idx: 4, name: '골드 앰버', hex: '#D97706', icon192: '/icons/icon-192-4.png', icon512: '/icons/icon-512-4.png' },
  { idx: 5, name: '체리 핑크', hex: '#BE185D', icon192: '/icons/icon-192-5.png', icon512: '/icons/icon-512-5.png' },
  { idx: 6, name: '딥 청록', hex: '#0F766E', icon192: '/icons/icon-192-6.png', icon512: '/icons/icon-512-6.png' },
  { idx: 7, name: '코발트 블루', hex: '#0369A1', icon192: '/icons/icon-192-7.png', icon512: '/icons/icon-512-7.png' },
  { idx: 8, name: '딥 오렌지', hex: '#C2410C', icon192: '/icons/icon-192-8.png', icon512: '/icons/icon-512-8.png' },
  { idx: 9, name: '인디고 바이올렛', hex: '#4338CA', icon192: '/icons/icon-192-9.png', icon512: '/icons/icon-512-9.png' },
];

export function hashSlugToColorIndex(slug: string): number {
  if (!slug) return 0;
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return hash % STORE_ICON_PALETTE.length;
}

export async function resolveStoreIconTheme(supabaseClient: any, slugOrId: string): Promise<StoreIconTheme> {
  if (!slugOrId || slugOrId === 'demo' || slugOrId.startsWith('demo-guest-')) {
    return STORE_ICON_PALETTE[hashSlugToColorIndex(slugOrId)];
  }

  try {
    const { data: stores } = await supabaseClient
      .from('nao3_stores')
      .select('id, slug, created_at')
      .neq('slug', 'demo')
      .order('created_at', { ascending: true });

    if (stores && stores.length > 0) {
      const normalized = slugOrId.toLowerCase();
      const foundIdx = stores.findIndex(
        (s: any) =>
          (s.slug && s.slug.toLowerCase() === normalized) ||
          (s.id && s.id.toLowerCase() === normalized)
      );
      if (foundIdx !== -1) {
        return STORE_ICON_PALETTE[foundIdx % STORE_ICON_PALETTE.length];
      }
    }
  } catch {
    // Fallback to deterministic hash
  }

  return STORE_ICON_PALETTE[hashSlugToColorIndex(slugOrId)];
}
