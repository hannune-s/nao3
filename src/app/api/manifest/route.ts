import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug') || '';
  const name = searchParams.get('name') || '우리 매장';

  const startUrl = slug ? `/store/${slug}/sale` : '/';
  const scope = slug ? `/store/${slug}` : '/';

  const manifest = {
    id: startUrl,
    name: `${name} 모바일 특가 전단지`,
    short_name: name,
    description: `${name}의 실시간 깜짝 세일과 오늘의 특가 소식을 확인하세요.`,
    display: 'standalone',
    orientation: 'portrait',
    start_url: startUrl,
    scope: scope,
    background_color: '#FFFFFF',
    theme_color: '#5F0080',
    icons: [
      {
        src: '/icon.jpg',
        sizes: '192x192',
        type: 'image/jpeg',
        purpose: 'any maskable',
      },
      {
        src: '/icon.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'any maskable',
      },
    ],
  };

  return new NextResponse(JSON.stringify(manifest), {
    status: 200,
    headers: {
      'Content-Type': 'application/manifest+json; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  });
}
