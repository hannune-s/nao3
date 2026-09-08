"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function HqStatisticsPage() {
  const [stats, setStats] = useState({
    todayVisitors: 128, // 방문자 수는 별도 애널리틱스 연동 전까지 임시 더미데이터 노출
    todaySignups: 0,
    monthSignups: 0,
    totalSignups: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('nao3_stores')
        .select('created_at');

      if (error) throw error;

      if (data) {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let todayCount = 0;
        let monthCount = 0;

        data.forEach((store) => {
          const createdDate = new Date(store.created_at);
          const dateStr = createdDate.toISOString().split('T')[0];
          
          if (dateStr === todayStr) todayCount++;
          if (createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear) {
            monthCount++;
          }
        });

        setStats((prev) => ({
          ...prev,
          todaySignups: todayCount,
          monthSignups: monthCount,
          totalSignups: data.length,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-gray-500">통계 데이터를 불러오는 중...</div>;

  return (
    <div className="max-w-5xl animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">통계 요약</h2>
        <p className="text-gray-500 mt-2 text-sm">복잡한 데이터 대신, 현재 비즈니스 현황에 꼭 필요한 핵심 지표만 확인하세요.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 오늘 방문자 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center text-lg">🚶</div>
            <h3 className="text-sm font-bold text-gray-500">오늘 방문자</h3>
          </div>
          <div className="flex items-end justify-between">
            <div className="text-3xl font-black text-gray-900">{stats.todayVisitors}<span className="text-lg font-medium text-gray-400 ml-1">명</span></div>
            <span className="text-[10px] text-blue-500 font-bold bg-blue-50 px-2 py-1 rounded-md mb-1">임시 데이터</span>
          </div>
        </div>

        {/* 오늘 가입자 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-50 text-green-500 flex items-center justify-center text-lg">✨</div>
            <h3 className="text-sm font-bold text-gray-500">오늘 신규 가입</h3>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900">{stats.todaySignups}<span className="text-lg font-medium text-gray-400 ml-1">곳</span></div>
          </div>
        </div>

        {/* 이번 달 가입자 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-[#5F0080] flex items-center justify-center text-lg">📅</div>
            <h3 className="text-sm font-bold text-gray-500">이번 달 가입자</h3>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900">{stats.monthSignups}<span className="text-lg font-medium text-gray-400 ml-1">곳</span></div>
          </div>
        </div>

        {/* 누적 가입자 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center text-lg">🏆</div>
            <h3 className="text-sm font-bold text-gray-500">총 누적 가입자</h3>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900">{stats.totalSignups}<span className="text-lg font-medium text-gray-400 ml-1">곳</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
