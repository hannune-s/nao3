"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import MartAdmin from '@/components/MartAdmin';
import ButcherAdmin from '@/components/ButcherAdmin';
import MyMenu from '@/components/MyMenu';

export default function StoreAdminPage() {
  const router = useRouter();
  const params = useParams();
  const storeSlug = params.storeId as string;
  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState<any>(null);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'mymenu'>('home');

  useEffect(() => {
    if (storeSlug) {
      checkUserAndStore();
    }
  }, [storeSlug]);

  const checkUserAndStore = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      router.push('/');
      return;
    }

    const { data: store, error } = await supabase
      .from('nao3_stores')
      .select('*')
      .eq('slug', storeSlug)
      .single();
      
    if (store) {
      if (session.user.id !== store.id) {
        alert('접근 권한이 없습니다.');
        router.push('/');
        return;
      }
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

  return (
    <div className="relative min-h-screen bg-[#F9F9F9]">
      {/* 탭 내용 영역 */}
      <div className="w-full pb-16">
        {activeTab === 'home' ? (
          storeData.business_type === 'mart' ? (
            <MartAdmin storeId={storeData.id} initialStoreName={storeData.store_name} storeSlug={storeData.slug} />
          ) : (
            <ButcherAdmin storeId={storeData.id} storeName={storeData.store_name} />
          )
        ) : (
          <MyMenu storeData={storeData} />
        )}
      </div>

      {/* 하단 고정 네비게이션 바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center h-16 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50">
        <button 
          onClick={() => setActiveTab('home')}
          className={\`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors \${activeTab === 'home' ? 'text-[#5F0080]' : 'text-gray-400 hover:text-gray-600'}\`}
        >
          <svg className="w-6 h-6" fill={activeTab === 'home' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-[10px] font-extrabold tracking-tight">홈</span>
        </button>
        <button 
          onClick={() => setActiveTab('mymenu')}
          className={\`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors \${activeTab === 'mymenu' ? 'text-[#5F0080]' : 'text-gray-400 hover:text-gray-600'}\`}
        >
          <svg className="w-6 h-6" fill={activeTab === 'mymenu' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-[10px] font-extrabold tracking-tight">마이메뉴</span>
        </button>
      </div>
    </div>
  );
}
