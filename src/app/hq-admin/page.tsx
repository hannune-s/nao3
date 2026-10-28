"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Store = {
  id: string;
  store_name: string;
  owner_name: string;
  email: string;
  phone?: string;
  created_at: string;
  slug: string;
  is_approved?: boolean;
  is_suspended?: boolean;
  subscription_paid?: boolean;
  business_license_url?: string;
  business_type?: string;
  expires_at?: string;
};

export default function HqDashboardPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [pushCounts, setPushCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);
  const [editingExpiryStore, setEditingExpiryStore] = useState<Store | null>(null);
  const [customExpiryDate, setCustomExpiryDate] = useState<string>('');
  const [savingExpiry, setSavingExpiry] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const [storesRes, pushRes] = await Promise.all([
        supabase
          .from('nao3_stores')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('nao3_system_settings')
          .select('setting_key, setting_value')
          .like('setting_key', 'PUSH_SUB_%'),
      ]);

      if (storesRes.error) throw storesRes.error;
      const storeList: Store[] = storesRes.data || [];
      setStores(storeList);

      // 매장별 단골 푸시 알림 구독자 수 집계 (동일 기기 endpoint 중복 제거)
      const endpointSets: Record<string, Set<string>> = {};
      if (pushRes.data) {
        for (const row of pushRes.data) {
          const key: string = row.setting_key || '';
          if (!key.startsWith('PUSH_SUB_')) continue;
          const rest = key.slice('PUSH_SUB_'.length);
          const lastUnderscore = rest.lastIndexOf('_');
          const storeId = lastUnderscore > 0 ? rest.slice(0, lastUnderscore) : rest;
          if (!storeId) continue;

          if (!endpointSets[storeId]) {
            endpointSets[storeId] = new Set<string>();
          }
          let uniqueToken = key;
          if (row.setting_value) {
            try {
              const parsed = JSON.parse(row.setting_value);
              if (parsed && typeof parsed.endpoint === 'string' && parsed.endpoint) {
                uniqueToken = parsed.endpoint;
              }
            } catch {
              // ignore JSON parse error and fallback to setting_key
            }
          }
          endpointSets[storeId].add(uniqueToken);
        }
      }

      const countsMap: Record<string, number> = {};
      for (const s of storeList) {
        countsMap[s.id] = endpointSets[s.id] ? endpointSets[s.id].size : 0;
      }
      setPushCounts(countsMap);
    } catch (err: any) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (storeId: string) => {
    if (!confirm('이 가맹점을 승인하시겠습니까? (승인 시 앱 활성화)')) return;
    try {
      const target = stores.find(s => s.id === storeId);
      const defaultExpiry = new Date();
      defaultExpiry.setDate(defaultExpiry.getDate() + 30);
      const nextExpiresAt = target?.expires_at || defaultExpiry.toISOString();

      const { error } = await supabase
        .from('nao3_stores')
        .update({ is_approved: true, is_suspended: false, expires_at: nextExpiresAt })
        .eq('id', storeId);
      if (error) throw error;
      alert('승인되었습니다.');
      fetchStores();
    } catch (err: any) {
      console.error(err);
      alert('승인 처리 중 오류가 발생했습니다. (DB 컬럼 추가 필요할 수 있음)');
      setStores(stores.map(s => s.id === storeId ? { ...s, is_approved: true, is_suspended: false } : s));
    }
  };

  const handleQuickExtendMonths = async (store: Store, months: number) => {
    const now = new Date();
    const currentExpiry = store.expires_at ? new Date(store.expires_at) : now;
    const baseDate = currentExpiry > now ? new Date(currentExpiry) : now;
    baseDate.setMonth(baseDate.getMonth() + months);
    const formattedDate = baseDate.toLocaleDateString('ko-KR');

    if (!confirm(`[${store.store_name}] 가맹점의 이용 만료일을 ${months}개월 연장하시겠습니까?\n(변경 후 만료일: ${formattedDate})`)) return;

    try {
      const nextIso = baseDate.toISOString();
      const { error } = await supabase
        .from('nao3_stores')
        .update({ expires_at: nextIso })
        .eq('id', store.id);
      if (error) throw error;
      fetchStores();
    } catch (err: any) {
      console.error(err);
      alert('만료일 연장 중 오류가 발생했습니다.');
    }
  };

  const openExpiryModal = (store: Store) => {
    setEditingExpiryStore(store);
    if (store.expires_at) {
      const d = new Date(store.expires_at);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setCustomExpiryDate(`${yyyy}-${mm}-${dd}`);
    } else {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      setCustomExpiryDate(`${yyyy}-${mm}-${dd}`);
    }
  };

  const applyPresetMonthsInModal = (months: number) => {
    const base = customExpiryDate ? new Date(`${customExpiryDate}T12:00:00`) : new Date();
    const now = new Date();
    const start = base > now ? base : now;
    start.setMonth(start.getMonth() + months);
    const yyyy = start.getFullYear();
    const mm = String(start.getMonth() + 1).padStart(2, '0');
    const dd = String(start.getDate()).padStart(2, '0');
    setCustomExpiryDate(`${yyyy}-${mm}-${dd}`);
  };

  const handleSaveCustomExpiry = async () => {
    if (!editingExpiryStore || !customExpiryDate) return;
    setSavingExpiry(true);
    try {
      // 지정한 날짜의 23:59:59 (KST) 기준으로 설정
      const nextIso = new Date(`${customExpiryDate}T23:59:59+09:00`).toISOString();
      const { error } = await supabase
        .from('nao3_stores')
        .update({ expires_at: nextIso })
        .eq('id', editingExpiryStore.id);
      if (error) throw error;
      setEditingExpiryStore(null);
      fetchStores();
    } catch (err: any) {
      console.error(err);
      alert('만료일 저장 중 오류가 발생했습니다.');
    } finally {
      setSavingExpiry(false);
    }
  };

  const handleToggleSuspend = async (store: Store) => {
    const isSuspending = !store.is_suspended;
    const msg = isSuspending 
      ? '이 가맹점을 [이용 정지] 하시겠습니까?' 
      : '이 가맹점의 [정지 해제]를 하시겠습니까?';
    
    if (!confirm(msg)) return;
    
    try {
      const { error } = await supabase
        .from('nao3_stores')
        .update({ is_suspended: isSuspending })
        .eq('id', store.id);
      if (error) throw error;
      alert('처리되었습니다.');
      fetchStores();
    } catch (err: any) {
      console.error(err);
      alert('처리 중 오류가 발생했습니다. (DB 컬럼 추가 필요할 수 있음)');
      setStores(stores.map(s => s.id === store.id ? { ...s, is_suspended: isSuspending } : s));
    }
  };

  const handleDeleteStore = async (store: Store) => {
    const confirmMsg = `정말 [${store.store_name}] 가맹점을 영구 삭제하시겠습니까?\n\n삭제 시 해당 매장의 행사 품목, 단골 알림 구독, 설정 데이터가 모두 삭제되며 복구할 수 없습니다.`;
    if (!confirm(confirmMsg)) return;

    try {
      // 하위 연관 데이터 먼저 정리 (FK 제약 조건 방지)
      await Promise.allSettled([
        supabase.from('nao3_sale_items').delete().eq('store_id', store.id),
        supabase.from('nao3_inquiries').delete().eq('store_id', store.id),
        supabase.from('nao3_system_settings').delete().like('setting_key', `%_${store.id}%`),
      ]);

      const { error } = await supabase
        .from('nao3_stores')
        .delete()
        .eq('id', store.id);

      if (error) throw error;
      alert(`[${store.store_name}] 가맹점이 삭제되었습니다.`);
      fetchStores();
    } catch (err: any) {
      console.error(err);
      alert('가맹점 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleResetStorePin = async (store: Store) => {
    const confirmMsg = `[${store.store_name}] 매장의 사장님/직원 6자리 PIN 번호를 초기화하시겠습니까?\n\n초기화하면 5회 오류 잠금도 함께 풀리며, 사장님이 이메일 로그인 후 새 PIN 번호를 다시 설정할 수 있습니다.`;
    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch('/api/security/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset_store_pin',
          storeId: store.id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'PIN 초기화 실패');
      }
      alert(`[${store.store_name}] 매장의 PIN 번호가 초기화되었습니다.`);
    } catch (err: any) {
      console.error(err);
      alert('PIN 초기화 중 오류가 발생했습니다.');
    }
  };

  const handleTogglePayment = async (store: Store) => {
    const isPaid = !store.subscription_paid;
    try {
      const { error } = await supabase
        .from('nao3_stores')
        .update({ subscription_paid: isPaid })
        .eq('id', store.id);
      if (error) throw error;
      fetchStores();
    } catch (err: any) {
      setStores(stores.map(s => s.id === store.id ? { ...s, subscription_paid: isPaid } : s));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">가맹점 정보를 불러오는 중입니다...</div>;
  }

  const totalPushSubscribers = Object.values(pushCounts).reduce((acc, n) => acc + n, 0);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredStores = normalizedQuery
    ? stores.filter((s) =>
        (s.store_name || '').toLowerCase().includes(normalizedQuery) ||
        (s.owner_name || '').toLowerCase().includes(normalizedQuery) ||
        (s.phone || '').toLowerCase().includes(normalizedQuery) ||
        (s.email || '').toLowerCase().includes(normalizedQuery) ||
        (s.slug || '').toLowerCase().includes(normalizedQuery)
      )
    : stores;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            전체 가맹점 대시보드 <span className="text-sm font-normal text-gray-400">⚡</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            총 <span className="font-bold text-gray-800">{stores.length}개</span>의 가맹점 · 전체 단골 알림 수신 고객 <span className="font-bold text-blue-600">{totalPushSubscribers.toLocaleString()}명</span>
          </p>
        </div>

        {/* 가맹점 검색창 */}
        <div className="relative w-full sm:w-80">
          <svg
            className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="상호명, 대표자, 전화번호, 이메일 검색..."
            className="w-full pl-9 pr-8 py-2.5 text-sm bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs p-1"
              title="검색어 지우기"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[1260px]">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-4 py-4 w-12 text-center whitespace-nowrap">번호</th>
                <th className="px-4 py-4 text-center whitespace-nowrap w-20">업종</th>
                <th className="px-4 py-4 whitespace-nowrap">가맹점 상호명 / 바로가기</th>
                <th className="px-4 py-4 whitespace-nowrap">대표자명</th>
                <th className="px-4 py-4 whitespace-nowrap">연락처 (전화 / 이메일)</th>
                <th className="px-4 py-4 text-center whitespace-nowrap">단골 고객수</th>
                <th className="px-4 py-4 whitespace-nowrap text-center">가입일자</th>
                <th className="px-4 py-4 text-center whitespace-nowrap">사업자등록증</th>
                <th className="px-4 py-4 text-center whitespace-nowrap">구독 상태</th>
                <th className="px-4 py-4 text-center whitespace-nowrap">이용 만료일 / 연장</th>
                <th className="px-4 py-4 text-center whitespace-nowrap">월 구독료 납부</th>
                <th className="px-4 py-4 text-center whitespace-nowrap">계정 제어</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery ? `'${searchQuery}' 검색 결과가 없습니다.` : '등록된 가맹점이 없습니다.'}
                  </td>
                </tr>
              ) : (
                filteredStores.map((store, idx) => {
                  const dateStr = store.created_at ? new Date(store.created_at).toLocaleDateString('ko-KR') : '정보 없음';
                  const subCount = pushCounts[store.id] || 0;
                  
                  const now = new Date();
                  const expiryDateObj = store.expires_at ? new Date(store.expires_at) : null;
                  const expiryDateStr = expiryDateObj ? expiryDateObj.toLocaleDateString('ko-KR') : '미설정';
                  const diffDays = expiryDateObj ? Math.ceil((expiryDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;

                  let dDayBadge = '';
                  let dDayColor = 'text-gray-400 bg-gray-100';
                  if (diffDays !== null) {
                    if (diffDays < 0) {
                      dDayBadge = `${Math.abs(diffDays)}일 지남`;
                      dDayColor = 'text-red-700 bg-red-50 border border-red-200';
                    } else if (diffDays === 0) {
                      dDayBadge = '오늘 만료';
                      dDayColor = 'text-orange-700 bg-orange-50 border border-orange-200';
                    } else if (diffDays <= 7) {
                      dDayBadge = `D-${diffDays}`;
                      dDayColor = 'text-orange-700 bg-orange-50 border border-orange-200';
                    } else {
                      dDayBadge = `D-${diffDays}`;
                      dDayColor = 'text-blue-700 bg-blue-50 border border-blue-200';
                    }
                  }

                  let statusLabel = '승인 대기';
                  let statusColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
                  
                  if (store.is_approved) {
                    if (store.is_suspended) {
                      statusLabel = '정지됨';
                      statusColor = 'bg-red-100 text-red-800 border-red-200';
                    } else if (store.expires_at && new Date(store.expires_at) < new Date()) {
                      statusLabel = '만료 (구독 필요)';
                      statusColor = 'bg-red-100 text-red-800 border-red-200';
                    } else if (store.expires_at && new Date(store.expires_at) >= new Date()) {
                      if (store.subscription_paid) {
                        statusLabel = '구독 중 (정상)';
                        statusColor = 'bg-green-100 text-green-800 border-green-200';
                      } else {
                        statusLabel = '무료 체험 중';
                        statusColor = 'bg-blue-100 text-blue-800 border-blue-200';
                      }
                    } else if (store.subscription_paid === false) {
                      statusLabel = '만료 임박 (미납)';
                      statusColor = 'bg-orange-100 text-orange-800 border-orange-200';
                    } else {
                      statusLabel = '이용 중';
                      statusColor = 'bg-green-100 text-green-800 border-green-200';
                    }
                  }

                  const typeLabel = store.business_type === 'mart' ? '마트' : store.business_type === 'butcher' ? '정육점' : '미지정';
                  const typeColor = store.business_type === 'mart' ? 'bg-blue-50 text-blue-700 border-blue-200' : store.business_type === 'butcher' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-gray-50 text-gray-600 border-gray-200';

                  return (
                    <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 text-center text-gray-500 font-medium whitespace-nowrap">
                        {filteredStores.length - idx}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md border ${typeColor}`}>
                          {typeLabel}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1.5">
                          <span className="font-bold text-gray-900 text-sm">{store.store_name}</span>
                          <Link
                            href={`/store/${store.slug}/sale`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors"
                            title="손님들이 보는 모바일 전단지 화면 열기"
                          >
                            📱 고객 전단지 보기
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-700 font-medium whitespace-nowrap">{store.owner_name}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          {store.phone ? (
                            <a
                              href={`tel:${store.phone}`}
                              className="text-xs font-bold text-gray-900 hover:text-blue-600 flex items-center gap-1"
                            >
                              📞 {store.phone}
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">전화번호 미등록</span>
                          )}
                          <span className="text-[11px] text-gray-500">{store.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-extrabold rounded-full border ${
                            subCount > 0
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-gray-50 text-gray-400 border-gray-200'
                          }`}
                          title="전단지 앱 설치 및 푸시 알림 동의 단골 고객 수"
                        >
                          🔔 {subCount.toLocaleString()}명
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-xs text-center whitespace-nowrap">{dateStr}</td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        {store.business_license_url ? (
                          <button 
                            onClick={() => setSelectedLicense(store.business_license_url!)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                            뷰어
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">미등록</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-[12px] font-bold rounded-full border ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold ${diffDays !== null && diffDays < 0 ? 'text-red-600' : 'text-gray-800'}`}>
                              {expiryDateStr}
                            </span>
                            {dDayBadge && (
                              <span className={`px-1.5 py-0.5 text-[10px] font-extrabold rounded ${dDayColor}`}>
                                {dDayBadge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleQuickExtendMonths(store, 1)}
                              className="px-2 py-0.5 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                              title="현재 만료일(또는 오늘) 기준 1개월 연장"
                            >
                              +1개월
                            </button>
                            <button
                              onClick={() => openExpiryModal(store)}
                              className="px-2 py-0.5 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                              title="만료일 직접 지정"
                            >
                              날짜변경
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <button 
                          onClick={() => handleTogglePayment(store)}
                          disabled={!store.is_approved}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${store.subscription_paid ? 'bg-blue-600' : 'bg-gray-200'} ${!store.is_approved ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${store.subscription_paid ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </td>
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {!store.is_approved ? (
                            <button 
                              onClick={() => handleApprove(store.id)}
                              className="bg-black hover:bg-gray-800 text-white text-xs font-bold px-3 py-1.5 rounded-md transition-colors"
                            >
                              가맹점 승인
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleToggleSuspend(store)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors border ${store.is_suspended ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}
                            >
                              {store.is_suspended ? '정지 해제' : '이용 정지'}
                            </button>
                          )}
                          <button
                            onClick={() => handleResetStorePin(store)}
                            className="text-xs font-bold px-2.5 py-1.5 rounded-md transition-colors border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
                            title="사장님/직원 6자리 PIN 번호 초기화 및 5회 오류 잠금 해제"
                          >
                            🔐 PIN초기화
                          </button>
                          <button
                            onClick={() => handleDeleteStore(store)}
                            className="text-xs font-bold px-2.5 py-1.5 rounded-md transition-colors border border-gray-200 text-gray-500 hover:bg-red-600 hover:text-white hover:border-red-600"
                            title="테스트/탈퇴 가맹점 영구 삭제"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 이용 만료일 직접 수정 모달 */}
      {editingExpiryStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <div>
                <h3 className="text-base font-black text-gray-900">이용 만료일 변경</h3>
                <p className="text-xs text-gray-500 mt-0.5">{editingExpiryStore.store_name} ({editingExpiryStore.owner_name})</p>
              </div>
              <button
                onClick={() => setEditingExpiryStore(null)}
                className="text-gray-400 hover:text-gray-900 p-1.5 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">만료일자 직접 선택</label>
                <input
                  type="date"
                  value={customExpiryDate}
                  onChange={(e) => setCustomExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-bold text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <span className="block text-xs font-bold text-gray-500 mb-1.5">빠른 기간 추가</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPresetMonthsInModal(1)}
                    className="py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                  >
                    +1개월 추가
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetMonthsInModal(6)}
                    className="py-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                  >
                    +6개월 추가
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetMonthsInModal(12)}
                    className="py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                  >
                    +1년(연간) 추가
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingExpiryStore(null)}
                className="px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveCustomExpiry}
                disabled={savingExpiry || !customExpiryDate}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {savingExpiry ? '저장 중...' : '만료일 저장'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 사업자등록증 뷰어 팝업 모달 */}
      {selectedLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                사업자등록증 원본
              </h3>
              <button 
                onClick={() => setSelectedLicense(null)} 
                className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-gray-50 flex-1 flex justify-center items-center min-h-[50vh]">
              <img 
                src={selectedLicense} 
                alt="사업자등록증 사본" 
                className="max-w-full max-h-[70vh] object-contain rounded-md shadow-sm border border-gray-200" 
              />
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
              <button 
                onClick={() => setSelectedLicense(null)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                닫기
              </button>
              <a 
                href={selectedLicense} 
                target="_blank" 
                rel="noopener noreferrer" 
                download 
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                원본 다운로드
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
