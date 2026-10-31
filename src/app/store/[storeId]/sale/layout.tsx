import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeId: string }>;
}): Promise<Metadata> {
  const { storeId } = await params;
  const decodedSlug = decodeURIComponent(storeId || '');

  let storeName = decodedSlug;
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decodedSlug);
    const { data } = await supabase
      .from('nao3_stores')
      .select('store_name')
      .eq(isUuid ? 'id' : 'slug', decodedSlug)
      .maybeSingle();

    if (data?.store_name) {
      storeName = data.store_name;
    }
  } catch {
    // fallback to decodedSlug
  }

  const title = `[${storeName}] "어머님들~ 빨리 나오삼!" 오늘의 특가 전단지 도착`;
  const description = '얼른 나오삼! 지금 당장 나오삼! 사고 싶은 세일 상품을 1초 만에 검색해 보세요.';
  const ogImageUrl = `/api/og?store=${encodeURIComponent(storeName)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'ko_KR',
      siteName: storeName,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function StoreSaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}