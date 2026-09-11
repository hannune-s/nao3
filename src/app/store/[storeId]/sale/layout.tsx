import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: { storeId: string } }): Promise<Metadata> {
  const storeSlug = params.storeId;
  
  // demo-guest
  if (storeSlug?.startsWith('demo-guest')) {
    const appTitle = `NAO3 - demo`;
    return {
      title: appTitle,
      appleWebApp: {
        capable: true,
        title: appTitle,
        statusBarStyle: 'default',
      },
      manifest: `/api/manifest?storeName=${encodeURIComponent('demo')}`,
    };
  }

  // DB query
  const { data: storeData } = await supabase
    .from('nao3_stores')
    .select('store_name')
    .eq('slug', storeSlug)
    .single();

  const storeName = storeData?.store_name || 'NAO3';
  const appTitle = `NAO3 - ${storeName}`;

  return {
    title: appTitle,
    appleWebApp: {
      capable: true,
      title: appTitle,
      statusBarStyle: 'default',
    },
    manifest: `/api/manifest?storeName=${encodeURIComponent(storeName)}`,
  };
}

export default function SaleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}