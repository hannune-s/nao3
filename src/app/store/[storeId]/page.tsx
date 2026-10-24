"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import MartAdmin from '@/components/MartAdmin';
import MyMenu from '@/components/MyMenu';

export default function StoreAdminPage() {
  const router = useRouter();
  const params = useParams();
  const storeSlug = params.storeId as string;
  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState<any>(null);
  const [isExpired, setIsExpired] = useState(false);

  // PIN Auth & Role State
  const [accessRole, setAccessRole] = useState<'owner' | 'staff' | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');

  // Navigation State
  const [activeTab, setActiveTab] = useState<'home' | 'mymenu'>('home');

  const handleSwitchTab = (tab: 'home' | 'mymenu') => {
    if (typeof window !== 'undefined') {
      if (tab === 'home') {
        if (activeTab === 'mymenu') {
          window.history.pushState({ nao3Tab: 'home', nao3View: 'main' }, '');
        }
      } else {
        if (activeTab !== 'mymenu') {
          window.history.pushState({ nao3Tab: 'mymenu', nao3View: 'main' }, '');
        } else if (window.history.state?.nao3View && window.history.state.nao3View !== 'main') {
          window.history.back();
          return;
        }
      }
    }
    setActiveTab(tab);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.history.state?.nao3Tab) {
      window.history.replaceState({ nao3Tab: 'home', nao3View: 'main' }, '');
    }
    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.nao3Tab === 'mymenu') {
        setActiveTab('mymenu');
      } else {
        setActiveTab('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (storeSlug) {
      checkUserAndStore();
    }
  }, [storeSlug]);

  const checkUserAndStore = async () => {
    // Demo Mode Bypass
    if (storeSlug.startsWith('demo-guest-')) {
      setStoreData({
        id: storeSlug,
        slug: storeSlug,
        name: '체험용 마트',
        business_type: 'mart'
      });
      setAccessRole('owner');
      setLoading(false);
      return;
    }

    // 1. 매장 정보 조회
    const { data: store, error } = await supabase
      .from('nao3_stores')
      .select('*')
      .eq('slug', storeSlug)
      .single();

    if (!store || error) {
      console.error('Store 데이터를 찾을 수 없습니다.', error);
      setLoading(false);
      return;
    }

    setStoreData(store);
    if (typeof window !== 'undefined' && store.slug) {
      localStorage.setItem('nao3_last_store_slug', store.slug);
    }

    if (store.expires_at) {
      const expiresAt = new Date(store.expires_at);
      if (new Date() > expiresAt) {
        setIsExpired(true);
      }
    }

    // 2. 서버 API를 통해 PIN 설정 여부만 확인 (해시값 자체는 브라우저로 절대 내려보내지 않음)
    let foundOwnerPin = false;
    let foundStaffPin = false;

    try {
      const res = await fetch(`/api/security/pin?type=store&storeId=${encodeURIComponent(store.id)}`);
      const pinStatus = await res.json();
      foundOwnerPin = !!pinStatus?.hasOwnerPin;
      foundStaffPin = !!pinStatus?.hasStaffPin;
    } catch (e) {
      console.warn('PIN 상태 확인 실패:', e);
    }

    const hasAnyPin = foundOwnerPin || foundStaffPin;

    // 3. 현재 브라우저 탭에 저장된 PIN 인증 역할 확인
    const savedRole = sessionStorage.getItem(`nao3_store_role_${store.id}`) as 'owner' | 'staff' | null;
    if (savedRole === 'owner' || savedRole === 'staff') {
      setAccessRole(savedRole);
      setLoading(false);
      return;
    }

    // 4. 사장님 PIN이 미설정 상태이고, 이메일 로그인 세션이 유효한 경우 -> 바로 사장님 권한 부여
    const { data: { session } } = await supabase.auth.getSession();
    if (!foundOwnerPin && session?.user?.id === store.id) {
      sessionStorage.setItem(`nao3_store_role_${store.id}`, 'owner');
      setAccessRole('owner');
      setLoading(false);
      return;
    }

    // 5. PIN이 하나라도 설정되어 있으면 -> PIN 번호 입력 화면을 먼저 띄움
    if (hasAnyPin) {
      setAccessRole(null);
      setLoading(false);
      return;
    }

    // 6. 아직 PIN이 하나도 설정되지 않은 초기 매장 -> 이메일 로그인 세션 확인
    if (!session?.user) {
      router.push('/login');
      return;
    }

    if (session.user.id !== store.id) {
      alert('접근 권한이 없습니다.');
      router.push('/');
      return;
    }

    // 이메일 로그인된 사장님 -> 최초 PIN 등록 전이므로 사장 권한 부여
    sessionStorage.setItem(`nao3_store_role_${store.id}`, 'owner');
    setAccessRole('owner');
    setLoading(false);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');

    if (pinInput.length !== 6) {
      setPinError('숫자 6자리를 모두 입력해주세요.');
      return;
    }

    try {
      const res = await fetch('/api/security/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify_store',
          storeId: storeData.id,
          pin: pinInput,
        }),
      });
      const data = await res.json();

      if (data?.role === 'owner') {
        sessionStorage.setItem(`nao3_store_role_${storeData.id}`, 'owner');
        setAccessRole('owner');
        setPinInput('');
        return;
      }

      if (data?.role === 'staff') {
        sessionStorage.setItem(`nao3_store_role_${storeData.id}`, 'staff');
        setAccessRole('staff');
        setActiveTab('home');
        setPinInput('');
        return;
      }

      setPinError(data?.error || 'PIN 번호가 일치하지 않습니다. 다시 확인해주세요.');
      setPinInput('');
    } catch {
      setPinError('PIN 확인 중 오류가 발생했습니다. 다시 시도해주세요.');
      setPinInput('');
    }
  };

  const handleLockPin = () => {
    if (storeData?.id) {
      sessionStorage.removeItem(`nao3_store_role_${storeData.id}`);
    }
    setAccessRole(null);
    setActiveTab('home');
    setPinInput('');
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

  // PIN 잠금 화면 (PIN이 설정되어 있고 아직 인증되지 않은 경우)
  if (!accessRole) {
    return (
      <div className="min-h-screen bg-[#F4F0F8] flex flex-col items-center justify-center p-5 font-sans">
        <div className="bg-white rounded-3xl shadow-xl border border-purple-100 p-8 w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-purple-50 text-[#5F0080] rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
            🔐
          </div>
          <span className="inline-block px-3 py-1 bg-purple-100 text-[#5F0080] text-xs font-extrabold rounded-full mb-2">
            {storeData.store_name || storeSlug}
          </span>
          <h1 className="text-[22px] font-black text-gray-900 tracking-tight mb-1.5">
            매장 관리자 간편 접속
          </h1>
          <p className="text-[13px] text-gray-500 mb-6 leading-relaxed break-keep">
            설정하신 <strong>6자리 PIN 번호</strong>를 입력하시면<br/>
            사장님/직원 권한에 맞춰 즉시 접속됩니다.
          </p>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pinInput}
                onChange={(e) => {
                  setPinError('');
                  setPinInput(e.target.value.replace(/[^0-9]/g, ''));
                }}
                placeholder="••••••"
                autoFocus
                className="w-full text-center text-3xl tracking-[0.5em] font-mono bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-4 text-gray-900 outline-none focus:border-[#5F0080] focus:bg-white transition-all"
              />
              {pinError && (
                <p className="text-red-500 text-xs font-bold mt-2">{pinError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-[#5F0080] hover:bg-[#4A0066] text-white font-black text-[16px] rounded-xl shadow-md transition-all active:scale-[0.98]"
            >
              6자리 번호로 접속하기
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col gap-2 text-xs text-gray-400">
            <p className="font-medium text-gray-500">
              👑 사장님 번호 입력 시: 전체 메뉴 열림<br/>
              🧑‍💼 직원 번호 입력 시: 전단지 입력만 열림
            </p>
            <Link
              href="/login?reset_pin=true"
              className="mt-2 text-gray-400 hover:text-[#5F0080] underline underline-offset-4 font-bold transition-colors"
            >
              PIN 번호를 잊으셨나요? 이메일로 로그인
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-black mb-3">1개월 무료 체험 기간이 종료되었습니다.</h2>
        <p className="text-gray-300 mb-8 leading-relaxed">
          구독을 진행하시면 앱의 핵심 기능 및<br/>알림 전송 기능을 다시 정상적으로 이용하실 수 있습니다.
        </p>
        <button 
          onClick={() => alert('구독 결제 시스템 연동 준비 중입니다.')}
          className="w-full max-w-sm py-4 bg-yellow-400 text-black font-extrabold text-lg rounded-xl shadow-lg hover:bg-yellow-300 transition-colors"
        >
          구독 연장하기
        </button>
        <button 
          onClick={() => supabase.auth.signOut().then(() => router.push('/'))} 
          className="mt-6 text-gray-400 underline text-sm"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F9F9F9]">
      {/* 직원 모드 상단 안내 바 */}
      {accessRole === 'staff' && (
        <div className="bg-gray-900 text-white px-4 py-2 text-xs flex items-center justify-between">
          <span className="font-bold flex items-center gap-1.5">
            <span>🧑‍💼</span> 직원 전용 모드로 접속 중 (전단지 관리 전용)
          </span>
          <button
            onClick={handleLockPin}
            className="px-2.5 py-1 bg-gray-700 hover:bg-gray-600 rounded text-[11px] font-bold transition-colors"
          >
            잠금 / 사장님 전환
          </button>
        </div>
      )}

      {/* 탭 내용 영역 */}
      <div className={accessRole === 'owner' ? 'w-full pb-16' : 'w-full pb-6'}>
        {activeTab === 'home' || accessRole === 'staff' ? (
          <MartAdmin 
            storeId={storeData.id} 
            initialStoreName={storeData.store_name} 
            storeSlug={storeData.slug} 
            expiresAt={storeData.expires_at}
            subscriptionPaid={storeData.subscription_paid}
          />
        ) : (
          <MyMenu 
            storeData={storeData} 
            onStoreUpdate={(updated: any) => setStoreData((prev: any) => ({ ...prev, ...updated }))} 
            onPinUpdated={() => checkUserAndStore()}
            onLockPin={handleLockPin}
          />
        )}
      </div>

      {/* 하단 고정 네비게이션 바 (사장님 모드일 때만 마이메뉴 노출, 직원 모드는 숨김) */}
      {accessRole === 'owner' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center h-16 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-50">
          <button 
            onClick={() => handleSwitchTab('home')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'home' ? 'text-[#5F0080]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <svg className="w-6 h-6" fill={activeTab === 'home' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-extrabold tracking-tight">홈</span>
          </button>
          <button 
            onClick={() => handleSwitchTab('mymenu')}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${activeTab === 'mymenu' ? 'text-[#5F0080]' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <svg className="w-6 h-6" fill={activeTab === 'mymenu' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] font-extrabold tracking-tight">마이메뉴</span>
          </button>
        </div>
      )}
    </div>
  );
}
