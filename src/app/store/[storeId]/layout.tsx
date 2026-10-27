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
    title: `사장님 NAO3 - ${storeName}`,
    description: `${storeName} 사장님 전용 스마트 전단지 관리 어드민`,
    manifest: `/api/manifest?mode=admin&slug=${encodeURIComponent(storeId)}&name=${encodeURIComponent(storeName)}`,
    appleWebApp: {
      capable: true,
      title: `사장님 ${storeName}`,
      statusBarStyle: 'default',
    },
    icons: {
      icon: '/icon-admin-192.png',
      apple: '/icon-admin-192.png',
    },
  };
}

export default function StoreAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
