"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Store = {
  id: string;
  store_name: string;
  owner_name: string;
  email: string;
  created_at: string;
  slug: string;
  is_approved?: boolean;
  is_suspended?: boolean;
  subscription_paid?: boolean;
  business_license_url?: string;
  business_type?: string;
};

export default function HqDashboardPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('nao3_stores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStores(data || []);
    } catch (err: any) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (storeId: string) => {
    if (!confirm('이 가맹점을 승인하시겠습니까? (승인 시 앱 활성화)')) return;
    try {
      const { error } = await supabase
        .from('nao3_stores')
        .update({ is_approved: true, is_suspended: false })
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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">전체 가맹점 대시보드</h2>
          <p className="text-sm text-gray-500 mt-1">총 {stores.length}개의 가맹점이 등록되어 있습니다.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[1000px]">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 w-16 text-center whitespace-nowrap">번호</th>
                <th className="px-6 py-4 text-center whitespace-nowrap w-24">업종</th>
                <th className="px-6 py-4 whitespace-nowrap">가맹점 상호명</th>
                <th className="px-6 py-4 whitespace-nowrap">대표자명</th>
                <th className="px-6 py-4 whitespace-nowrap">연락처 (이메일)</th>
                <th className="px-6 py-4 whitespace-nowrap text-center">가입일자</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">사업자등록증</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">구독 상태</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">월 구독료 납부</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">계정 제어</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stores.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    등록된 가맹점이 없습니다.
                  </td>
                </tr>
              ) : (
                stores.map((store, idx) => {
                  const dateStr = store.created_at ? new Date(store.created_at).toLocaleDateString('ko-KR') : '정보 없음';
                  
                  let statusLabel = '승인 대기';
                  let statusColor = 'bg-yellow-100 text-yellow-800 border-yellow-200';
                  
                  if (store.is_approved) {
                    if (store.is_suspended) {
                      statusLabel = '정지됨';
                      statusColor = 'bg-red-100 text-red-800 border-red-200';
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
                      <td className="px-6 py-4 text-center text-gray-500 font-medium whitespace-nowrap">
                        {stores.length - idx}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md border ${typeColor}`}>
                          {typeLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
                        <Link href={`/store/${store.slug}`} className="hover:text-blue-600 hover:underline flex items-center gap-2">
                          {store.store_name}
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{store.owner_name}</td>
                      <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{store.email}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs text-center whitespace-nowrap">{dateStr}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
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
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-[12px] font-bold rounded-full border ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <button 
                          onClick={() => handleTogglePayment(store)}
                          disabled={!store.is_approved}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${store.subscription_paid ? 'bg-blue-600' : 'bg-gray-200'} ${!store.is_approved ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${store.subscription_paid ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
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
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
