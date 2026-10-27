import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || '';
  const mode = searchParams.get('mode') || 'sale'; // 'sale' | 'admin'
  let name = searchParams.get('name') || '';

  // 만약 name 파라미터가 비어있다면 DB에서 직접 상호명 조회
  if (!name && slug && !slug.startsWith('demo-guest-')) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
      const { data: store } = await supabase
        .from('nao3_stores')
        .select('store_name')
        .eq(isUuid ? 'id' : 'slug', slug)
        .maybeSingle();
      if (store?.store_name) {
        name = store.store_name;
      }
    } catch (e) {}
  }

  const storeTitle = name || '우리 매장';

  if (mode === 'admin') {
    const startUrl = slug ? `/store/${slug}` : '/';
    const adminManifest = {
      id: `${startUrl}?mode=admin&v=3`,
      name: `사장님 NAO3 - ${storeTitle}`,
      short_name: `사장님 ${storeTitle}`,
      description: `${storeTitle} 사장님 전용 스마트 전단지 관리 어드민`,
      display: 'standalone',
      orientation: 'portrait',
      start_url: startUrl,
      scope: startUrl,
      background_color: '#FFFFFF',
      theme_color: '#111111',
      icons: [
        {
          src: '/icon-admin-192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/icon-admin-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any',
        },
        {
          src: '/icon-admin-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    };

    return new NextResponse(JSON.stringify(adminManifest), {
      status: 200,
      headers: {
        'Content-Type': 'application/manifest+json; charset=utf-8',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
      },
    });
  }

  // 고객용 세일 전단지 매니페스트 (mode === 'sale')
  const startUrl = slug ? `/store/${slug}/sale` : '/';
  const saleManifest = {
    id: `${startUrl}?mode=sale&v=3`,
    name: `${storeTitle} 특가 전단지`,
    short_name: storeTitle,
    description: `${storeTitle}의 실시간 깜짝 세일과 오늘의 특가 소식을 확인하세요.`,
    display: 'standalone',
    orientation: 'portrait',
    start_url: startUrl,
    scope: startUrl,
    background_color: '#FFFFFF',
    theme_color: '#5F0080',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };

  return new NextResponse(JSON.stringify(saleManifest), {
    status: 200,
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    },
  });
}
