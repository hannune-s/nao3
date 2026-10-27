import type { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeId: string }>;
}): Promise<Metadata> {
  const { storeId } = await params;
  let storeName = '우리 매장';

  if (storeId && !storeId.startsWith('demo-guest-')) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(storeId);
      const { data: store } = await supabase
        .from('nao3_stores')
        .select('store_name')
        .eq(isUuid ? 'id' : 'slug', storeId)
        .maybeSingle();
      if (store?.store_name) {
        storeName = store.store_name;
      }
    } catch (e) {}
  } else if (storeId?.startsWith('demo-guest-')) {
    storeName = '체험용 마트';
  }

  return {
    title: `${storeName} - 오늘의 특가 전단지`,
    description: `${storeName}의 실시간 깜짝 세일과 오늘의 특가 소식을 확인하세요.`,
    manifest: `/api/manifest?mode=sale&slug=${encodeURIComponent(storeId)}&name=${encodeURIComponent(storeName)}`,
    appleWebApp: {
      capable: true,
      title: storeName,
      statusBarStyle: 'default',
    },
    icons: {
      icon: '/icon-192.png',
      apple: '/icon-192.png',
    },
  };
}

export default function CustomerSaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}