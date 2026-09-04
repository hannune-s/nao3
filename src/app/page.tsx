"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import MartAdmin from '@/components/MartAdmin';
import ButcherAdmin from '@/components/ButcherAdmin';
import Link from 'next/link';

export default function AdminRouterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [storeData, setStoreData] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    
    if (session?.user) {
      // 1. 해당 유저의 매장 정보 가져오기 (business_type)
      const { data: store, error } = await supabase
        .from('nao3_stores')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (store) {
        setStoreData(store);
      } else {
        console.error('Store 데이터를 찾을 수 없습니다.', error);
      }
    }
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('로그인 실패: ' + error.message);
      setLoading(false);
    } else {
      window.location.reload(); // 로그인 성공 시 리로드하여 정보 다시 가져오기
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#5F0080] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 1. 로그인이 안 되어 있는 경우 (로그인 화면 렌더링)
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 w-full max-w-sm flex flex-col items-center">
          <div className="w-16 h-16 bg-[#5F0080]/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🔑</span>
          </div>
          <h2 className="text-2xl font-black text-[#5F0080] mb-2 tracking-tight">Nao3 어드민</h2>
          <p className="text-sm text-gray-500 mb-8 text-center">동네 사장님들을 위한 1초 전단지</p>
          
          <input 
            type="email" required placeholder="이메일" 
            value={email} onChange={e => setEmail(e.target.value)}
            className="w-full mb-3 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F0080]"
          />
          <input 
            type="password" required placeholder="비밀번호" 
            value={password} onChange={e => setPassword(e.target.value)}
            className="w-full mb-6 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F0080]"
          />
          
          <button type="submit" className="w-full py-4 bg-[#5F0080] hover:bg-purple-900 text-white font-bold rounded-xl transition-colors shadow-md">
            로그인
          </button>

          <Link href="/register" className="mt-6 text-sm text-gray-500 underline hover:text-[#5F0080]">
            Nao3가 처음이신가요? 가입하기
          </Link>
        </form>
      </div>
    );
  }

  // 2. 로그인은 되었으나 DB(stores) 정보가 없는 경우 방어코드
  if (!storeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-gray-500 mb-4">매장 정보를 불러오지 못했습니다.</p>
        <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="text-blue-500 underline">
          로그아웃 후 다시 시도
        </button>
      </div>
    );
  }

  // 3. 업종(business_type)에 따른 폼 동적 분기 렌더링
  if (storeData.business_type === 'mart') {
    return <MartAdmin storeId={storeData.id} initialStoreName={storeData.store_name} />;
  } else if (storeData.business_type === 'butcher') {
    return <ButcherAdmin storeId={storeData.id} storeName={storeData.store_name} />;
  } else {
    return <div>알 수 없는 업종입니다. ({storeData.business_type})</div>;
  }
}
