"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function HqRevenuePage() {
  const [payments, setPayments] = useState<any[]>([]);
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

  useEffect(() => {
    fetchRevenueData();
  }, []);

  const fetchRevenueData = async () => {
    try {
      // 실제 테이블(nao3_payments)이 구축되기 전까지는 임시 더미데이터를 제공하거나 빈 배열을 처리합니다.
      const { data, error } = await supabase
        .from('nao3_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // 테이블이 없으면 임시 더미 데이터를 보여줍니다.
        loadDummyData();
        return;
      }

      if (data && data.length > 0) {
        processStats(data);
        setPayments(data);
      } else {
        loadDummyData();
      }
    } catch (err) {
      loadDummyData();
    } finally {
      setLoading(false);
    }
  };

  const processStats = (data: any[]) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let activeSubCount = 0;
    let tRev = 0, tMon = 0, tAnn = 0;
    let mRev = 0, mMon = 0, mAnn = 0;

    data.forEach((p) => {
      // 구독자 수: 결제완료 혹은 활성 상태인 경우
      if (p.status === '결제완료') activeSubCount++;

      const pDate = new Date(p.created_at);
      const pDateStr = pDate.toISOString().split('T')[0];

      if (p.status === '결제완료') {
        // 오늘 매출
        if (pDateStr === todayStr) {
          tRev += p.amount;
          if (p.plan_type === '월간') tMon += p.amount;
          else if (p.plan_type === '연간') tAnn += p.amount;
        }
        // 이번 달 매출
        if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
          mRev += p.amount;
          if (p.plan_type === '월간') mMon += p.amount;
          else if (p.plan_type === '연간') mAnn += p.amount;
        }
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

  const loadDummyData = () => {
    const dummy = [
      { id: 1, created_at: new Date().toISOString(), store_name: '나오삼마트', plan_type: '연간', amount: 390000, method: '카드결제', status: '결제완료' },
      { id: 2, created_at: new Date().toISOString(), store_name: '싱싱청과', plan_type: '월간', amount: 39000, method: '토스페이', status: '결제완료' },
      { id: 3, created_at: new Date(Date.now() - 86400000).toISOString(), store_name: '우리동네 정육점', plan_type: '월간', amount: 39000, method: '카드결제', status: '결제완료' },
      { id: 4, created_at: new Date(Date.now() - 86400000 * 2).toISOString(), store_name: '대박할인마트', plan_type: '연간', amount: 390000, method: '계좌이체', status: '환불완료' },
    ];
    processStats(dummy);
    setPayments(dummy);
  };

  if (loading) return <div className="p-8 text-gray-500">매출 데이터를 불러오는 중...</div>;

  return (
    <div className="max-w-6xl animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">매출 및 결제 관리</h2>
        <p className="text-gray-500 mt-2 text-sm">결제된 구독 내역을 실시간으로 확인하고 월간/연간 매출 지표를 관리하세요.</p>
      </div>

      {/* 대시보드 카드 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* 구독자 수 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-lg">👥</div>
            <h3 className="text-sm font-bold text-gray-500">현재 활성 구독자 수</h3>
          </div>
          <div>
            <div className="text-4xl font-black text-gray-900">{stats.activeSubscribers}<span className="text-lg font-medium text-gray-400 ml-1">곳</span></div>
            <p className="text-xs text-blue-500 font-bold bg-blue-50 px-2 py-1 rounded-md inline-block mt-2">결제 유지 중인 매장</p>
          </div>
        </div>

        {/* 오늘 매출 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center text-lg">💸</div>
            <h3 className="text-sm font-bold text-gray-500">일별 구독 매출 (오늘)</h3>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900 mb-3">{stats.todayRevenue.toLocaleString()}<span className="text-lg font-medium text-gray-400 ml-1">원</span></div>
            <div className="flex gap-4 text-xs font-bold text-gray-500 border-t border-gray-50 pt-3">
              <div>월구독: <span className="text-green-600">{stats.todayMonthly.toLocaleString()}원</span></div>
              <div>연구독: <span className="text-green-600">{stats.todayAnnual.toLocaleString()}원</span></div>
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
            <div className="text-3xl font-black text-gray-900 mb-3">{stats.monthRevenue.toLocaleString()}<span className="text-lg font-medium text-gray-400 ml-1">원</span></div>
            <div className="flex gap-4 text-xs font-bold text-gray-500 border-t border-gray-50 pt-3">
              <div>월구독: <span className="text-[#5F0080]">{stats.monthMonthly.toLocaleString()}원</span></div>
              <div>연구독: <span className="text-[#5F0080]">{stats.monthAnnual.toLocaleString()}원</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 결제 내역 리스트 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-black text-gray-900">결제 내역 리스트</h3>
          <span className="text-xs text-gray-400 font-medium">최신 결제순</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">순번</th>
                <th className="px-6 py-4">결제일</th>
                <th className="px-6 py-4">가맹점 상호명</th>
                <th className="px-6 py-4">결제 상품</th>
                <th className="px-6 py-4 text-right">결제 금액</th>
                <th className="px-6 py-4 text-center">결제 수단</th>
                <th className="px-6 py-4 text-center">결제 상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p, index) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-400 font-medium">{payments.length - index}</td>
                  <td className="px-6 py-4 text-gray-600">{new Date(p.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{p.store_name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[11px] font-bold ${p.plan_type === '연간' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                      {p.plan_type}결제
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-gray-900">{p.amount.toLocaleString()}원</td>
                  <td className="px-6 py-4 text-center text-gray-500">{p.method}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${p.status === '결제완료' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
