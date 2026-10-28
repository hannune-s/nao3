"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface PaymentRecord {
  id: string;
  setting_key: string;
  created_at: string;
  store_id?: string;
  store_name: string;
  plan_type: '월간' | '연간';
  amount: number;
  method: string;
  status: '결제완료' | '환불완료';
}

export default function HqRevenuePage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeSubscribers: 0,
    todayRevenue: 0,
    todayMonthly: 0,
    todayAnnual: 0,
    monthRevenue: 0,
    monthMonthly: 0,
    monthAnnual: 0,
  });

  // 수동 결제(무통장 입금 등) 등록 모달 상태
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [selectedMethod, setSelectedMethod] = useState('계좌이체 (무통장)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const [{ data: storesData }, { data: logRows }] = await Promise.all([
        supabase
          .from('nao3_stores')
          .select('id, store_name, subscription_paid, is_suspended, expires_at')
          .order('store_name', { ascending: true }),
        supabase
          .from('nao3_system_settings')
          .select('setting_key, setting_value')
          .like('setting_key', 'PAYMENT_LOG_%'),
      ]);

      const storeList = storesData || [];
      setStores(storeList);
      if (storeList.length > 0 && !selectedStoreId) {
        setSelectedStoreId(storeList[0].id);
      }

      // 실제 활성 유료 구독 매장 수 계산
      const now = new Date();
      const activeSubCount = storeList.filter((s: any) => {
        if (!s.subscription_paid || s.is_suspended) return false;
        if (s.expires_at && new Date(s.expires_at) < now) return false;
        return true;
      }).length;

      // 실제 결제 로그 파싱
      const parsedPayments: PaymentRecord[] = [];
      if (logRows && logRows.length > 0) {
        logRows.forEach((row: any) => {
          try {
            const parsed = JSON.parse(row.setting_value);
            if (parsed && parsed.store_name && typeof parsed.amount === 'number') {
              parsedPayments.push({
                ...parsed,
                id: parsed.id || row.setting_key,
                setting_key: row.setting_key,
              });
            }
          } catch {}
        });
      }

      // 최신 결제순 정렬
      parsedPayments.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setPayments(parsedPayments);
      processStats(parsedPayments, activeSubCount);
    } catch (err) {
      console.error('Failed to fetch revenue data:', err);
    } finally {
      setLoading(false);
    }
  };

  const processStats = (data: PaymentRecord[], activeSubCount: number) => {
    const kstFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Seoul',
    });
    const todayStr = kstFormatter.format(new Date()); // YYYY-MM-DD
    const currentYearMonth = todayStr.slice(0, 7); // YYYY-MM

    let tRev = 0,
      tMon = 0,
      tAnn = 0;
    let mRev = 0,
      mMon = 0,
      mAnn = 0;

    data.forEach((p) => {
      if (p.status !== '결제완료') return;

      const pDate = new Date(p.created_at);
      const pDateStr = kstFormatter.format(pDate);

      if (pDateStr === todayStr) {
        tRev += p.amount;
        if (p.plan_type === '월간') tMon += p.amount;
        else if (p.plan_type === '연간') tAnn += p.amount;
      }

      if (pDateStr.slice(0, 7) === currentYearMonth) {
        mRev += p.amount;
        if (p.plan_type === '월간') mMon += p.amount;
        else if (p.plan_type === '연간') mAnn += p.amount;
      }
    });

    setStats({
      activeSubscribers: activeSubCount,
      todayRevenue: tRev,
      todayMonthly: tMon,
      todayAnnual: tAnn,
      monthRevenue: mRev,
      monthMonthly: mMon,
      monthAnnual: mAnn,
    });
  };

  const handleAddManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStoreId) return alert('가맹점을 선택해주세요.');

    const targetStore = stores.find((s) => s.id === selectedStoreId);
    if (!targetStore) return alert('가맹점 정보를 찾을 수 없습니다.');

    setIsSubmitting(true);
    try {
      const amount = selectedPlan === 'annual' ? 178800 : 14900;
      const baseDate =
        targetStore.expires_at && new Date(targetStore.expires_at) > new Date()
          ? new Date(targetStore.expires_at)
          : new Date();

      const nextExpires = new Date(baseDate);
      if (selectedPlan === 'annual') {
        nextExpires.setFullYear(nextExpires.getFullYear() + 1);
      } else {
        nextExpires.setMonth(nextExpires.getMonth() + 1);
      }

      // 1. 가맹점 유료 구독 활성화 및 만료일 연장
      const { error: storeErr } = await supabase
        .from('nao3_stores')
        .update({
          subscription_paid: true,
          expires_at: nextExpires.toISOString(),
        })
        .eq('id', targetStore.id);

      if (storeErr) throw storeErr;

      // 2. 결제 로그 저장
      const nowIso = new Date().toISOString();
      const logKey = `PAYMENT_LOG_${Date.now()}_${targetStore.id}`;
      const record: PaymentRecord = {
        id: logKey,
        setting_key: logKey,
        created_at: nowIso,
        store_id: targetStore.id,
        store_name: targetStore.store_name,
        plan_type: selectedPlan === 'annual' ? '연간' : '월간',
        amount,
        method: selectedMethod,
        status: '결제완료',
      };

      const { error: logErr } = await supabase.from('nao3_system_settings').upsert(
        {
          setting_key: logKey,
          setting_value: JSON.stringify(record),
        },
        { onConflict: 'setting_key' }
      );

      if (logErr) throw logErr;

      setShowAddModal(false);
      await fetchRevenueData();
      alert(`[${targetStore.store_name}] 결제 등록 및 이용 기간 연장이 완료되었습니다.`);
    } catch (err: any) {
      alert('결제 등록 중 오류가 발생했습니다: ' + (err.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleRefund = async (payment: PaymentRecord) => {
    const nextStatus = payment.status === '결제완료' ? '환불완료' : '결제완료';
    const confirmMsg =
      nextStatus === '환불완료'
        ? `[${payment.store_name}] ${payment.amount.toLocaleString()}원 결제를 [환불완료] 상태로 변경하시겠습니까?\n(환불 시 매출 합계에서 제외됩니다.)`
        : `[${payment.store_name}] 결제를 다시 [결제완료] 상태로 복구하시겠습니까?`;

    if (!confirm(confirmMsg)) return;

    try {
      const updatedRecord: PaymentRecord = {
        ...payment,
        status: nextStatus,
      };

      const { error } = await supabase.from('nao3_system_settings').upsert(
        {
          setting_key: payment.setting_key,
          setting_value: JSON.stringify(updatedRecord),
        },
        { onConflict: 'setting_key' }
      );

      if (error) throw error;
      await fetchRevenueData();
    } catch (err: any) {
      alert('상태 변경 실패: ' + (err.message || ''));
    }
  };

  if (loading) return <div className="p-8 text-gray-500">실제 매출 데이터를 불러오는 중...</div>;

  return (
    <div className="max-w-6xl animate-fade-in-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">매출 및 결제 관리</h2>
          <p className="text-gray-500 mt-1 text-sm">
            실제 가맹점 구독 결제 내역(월 14,900원 / 연 178,800원)을 실시간으로 확인하고 관리하세요.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#5F0080] hover:bg-[#4A0066] text-white text-sm font-bold rounded-xl shadow-sm transition-colors whitespace-nowrap"
        >
          + 수동 결제(무통장) 등록
        </button>
      </div>

      {/* 대시보드 카드 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 구독자 수 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-lg">👥</div>
            <h3 className="text-sm font-bold text-gray-500">현재 활성 유료 구독 매장</h3>
          </div>
          <div>
            <div className="text-4xl font-black text-gray-900">
              {stats.activeSubscribers}
              <span className="text-lg font-medium text-gray-400 ml-1">곳</span>
            </div>
            <p className="text-xs text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded-md inline-block mt-2">
              실제 구독료 납부 완료 매장
            </p>
          </div>
        </div>

        {/* 오늘 매출 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center text-lg">💸</div>
            <h3 className="text-sm font-bold text-gray-500">일별 구독 매출 (오늘)</h3>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900 mb-3">
              {stats.todayRevenue.toLocaleString()}
              <span className="text-lg font-medium text-gray-400 ml-1">원</span>
            </div>
            <div className="flex gap-4 text-xs font-bold text-gray-500 border-t border-gray-50 pt-3">
              <div>
                월구독: <span className="text-green-600">{stats.todayMonthly.toLocaleString()}원</span>
              </div>
              <div>
                연구독: <span className="text-green-600">{stats.todayAnnual.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </div>

        {/* 이번 달 매출 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-[#5F0080] flex items-center justify-center text-lg">💰</div>
            <h3 className="text-sm font-bold text-gray-500">월 누계 매출 (이번 달)</h3>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900 mb-3">
              {stats.monthRevenue.toLocaleString()}
              <span className="text-lg font-medium text-gray-400 ml-1">원</span>
            </div>
            <div className="flex gap-4 text-xs font-bold text-gray-500 border-t border-gray-50 pt-3">
              <div>
                월구독: <span className="text-[#5F0080]">{stats.monthMonthly.toLocaleString()}원</span>
              </div>
              <div>
                연구독: <span className="text-[#5F0080]">{stats.monthAnnual.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 결제 내역 리스트 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-black text-gray-900">실제 결제 내역 리스트</h3>
          <span className="text-xs text-gray-400 font-medium">총 {payments.length}건 (최신 결제순)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">순번</th>
                <th className="px-6 py-4 whitespace-nowrap">결제일시</th>
                <th className="px-6 py-4 whitespace-nowrap">가맹점 상호명</th>
                <th className="px-6 py-4 whitespace-nowrap">결제 상품</th>
                <th className="px-6 py-4 text-right whitespace-nowrap">결제 금액</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">결제 수단</th>
                <th className="px-6 py-4 text-center whitespace-nowrap">결제 상태 (클릭 시 전환)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center text-gray-400 font-medium">
                    아직 등록된 실제 결제 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                payments.map((p, index) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 text-gray-400 font-medium whitespace-nowrap">
                      {payments.length - index}
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {new Date(p.created_at).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">{p.store_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-[11px] font-bold ${
                          p.plan_type === '연간' ? 'bg-purple-50 text-[#5F0080]' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {p.plan_type} 구독권
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-black text-gray-900 whitespace-nowrap">
                      {p.amount.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500 whitespace-nowrap">{p.method}</td>
                    <td className="px-6 py-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleRefund(p)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                          p.status === '결제완료'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {p.status}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 수동 결제 등록 모달 */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-black text-gray-900 mb-1">수동 결제(무통장 입금) 등록</h3>
            <p className="text-xs text-gray-500 mb-5">
              등록 즉시 해당 가맹점의 유료 구독이 활성화되고 만료일이 자동 연장됩니다.
            </p>

            <form onSubmit={handleAddManualPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">대상 가맹점 선택</label>
                <select
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-[#5F0080]"
                >
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.store_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">결제 이용권</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('monthly')}
                    className={`py-3 px-3 rounded-xl border text-left transition-all ${
                      selectedPlan === 'monthly'
                        ? 'border-[#5F0080] bg-purple-50/60 text-[#5F0080]'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="text-xs font-bold">월간 구독 (+1개월)</div>
                    <div className="text-base font-black mt-0.5">14,900원</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('annual')}
                    className={`py-3 px-3 rounded-xl border text-left transition-all ${
                      selectedPlan === 'annual'
                        ? 'border-[#5F0080] bg-purple-50/60 text-[#5F0080]'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    <div className="text-xs font-bold">연간 구독 (+12개월)</div>
                    <div className="text-base font-black mt-0.5">178,800원</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">결제 수단 표시</label>
                <input
                  type="text"
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-900 outline-none focus:border-[#5F0080]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-[#5F0080] hover:bg-[#4A0066] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? '등록 중...' : '결제 등록 및 기간 연장'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
