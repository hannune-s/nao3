import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storeName = searchParams.get('storeName') || 'mart';
  
  const manifest = {
    name: `NAO3 - ${storeName}`,
    short_name: `NAO3 - ${storeName}`,
    display: 'standalone',
    start_url: request.headers.get('referer') || '/',
    background_color: '#ffffff',
    theme_color: '#5F0080',
    icons: [
      { src: '/icon.jpg', sizes: '1024x1024', type: 'image/jpeg' },
      { src: '/icon.jpg', sizes: '192x192', type: 'image/jpeg' },
      { src: '/icon.jpg', sizes: '512x512', type: 'image/jpeg' }
    ]
  };

  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json'
    }
  });
}