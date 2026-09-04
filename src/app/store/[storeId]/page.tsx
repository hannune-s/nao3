"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import MartAdmin from '@/components/MartAdmin';
import ButcherAdmin from '@/components/ButcherAdmin';

export default function StoreAdminPage({ params }: { params: { storeId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState<any>(null);

  useEffect(() => {
    checkUserAndStore();
  }, []);

  const checkUserAndStore = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      router.push('/'); // 로그인 안 되어 있으면 메인으로 리다이렉트
      return;
    }

    // 본인의 storeId가 맞는지 확인
    if (session.user.id !== params.storeId) {
      alert('접근 권한이 없습니다.');
      router.push('/');
      return;
    }

    const { data: store, error } = await supabase
      .from('nao3_stores')
      .select('*')
      .eq('id', params.storeId)
      .single();
      
    if (store) {
      setStoreData(store);
    } else {
      console.error('Store 데이터를 찾을 수 없습니다.', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#5F0080] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 mb-4">매장 정보를 불러오지 못했습니다.</p>
        <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="text-blue-500 underline">
          로그아웃 후 다시 시도
        </button>
      </div>
    );
  }

  if (storeData.business_type === 'mart') {
    return <MartAdmin storeId={storeData.id} initialStoreName={storeData.store_name} />;
  } else if (storeData.business_type === 'butcher') {
    return <ButcherAdmin storeId={storeData.id} storeName={storeData.store_name} />;
  } else {
    return <div>알 수 없는 업종입니다. ({storeData.business_type})</div>;
  }
}
