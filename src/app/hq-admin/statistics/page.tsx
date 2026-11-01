"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type VisitLog = {
  settingKey: string;
  type: '웹 방문' | '앱 설치';
  createdAt: string;
  device: string;
  referrer: string;
  isInstagram: boolean;
  page: string;
};

const ITEMS_PER_PAGE = 5;
const MAX_PAGES = 5;
const MAX_LOGS = ITEMS_PER_PAGE * MAX_PAGES; // 최대 25건 (5줄 × 5페이지)

export default function HqStatisticsPage() {
  const [stats, setStats] = useState({
    todayVisitors: 0,
    todaySignups: 0,
    monthSignups: 0,
    totalSignups: 0,
  });
  const [visitLogs, setVisitLogs] = useState<VisitLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const kstFormatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul',
      });
      const todayStr = kstFormatter.format(new Date()); // YYYY-MM-DD (한국 시간 기준)
      const currentYearMonth = todayStr.slice(0, 7); // YYYY-MM

      const [
        { data: storesData, error: storesError },
        { data: visitorRow },
        { data: logRows },
      ] = await Promise.all([
        supabase.from('nao3_stores').select('created_at'),
        supabase
          .from('nao3_system_settings')
          .select('setting_value')
          .eq('setting_key', `DAILY_VISITORS_${todayStr}`)
          .maybeSingle(),
        supabase
          .from('nao3_system_settings')
          .select('setting_key, setting_value')
          .like('setting_key', 'VISIT_LOG_%')
          .order('setting_key', { ascending: false })
          .limit(200),
      ]);

      if (storesError) throw storesError;

      const realTodayVisitors = parseInt(visitorRow?.setting_value || '0', 10) || 0;

      let todayCount = 0;
      let monthCount = 0;

      if (storesData) {
        storesData.forEach((store) => {
          const createdDate = new Date(store.created_at);
          const dateStr = kstFormatter.format(createdDate);
          if (dateStr === todayStr) todayCount++;
          if (dateStr.slice(0, 7) === currentYearMonth) {
            monthCount++;
          }
        });
      }

      setStats({
        todayVisitors: realTodayVisitors,
        todaySignups: todayCount,
        monthSignups: monthCount,
        totalSignups: storesData ? storesData.length : 0,
      });

      const parsedLogs: VisitLog[] = [];
      if (logRows) {
        for (const row of logRows) {
          try {
            const parsed = JSON.parse(row.setting_value || '{}');
            parsedLogs.push({
              settingKey: row.setting_key,
              type: parsed.type === '앱 설치' ? '앱 설치' : '웹 방문',
              createdAt: parsed.createdAt || new Date().toISOString(),
              device: parsed.device || '[Web]',
              referrer: parsed.referrer || '직접 접속 (Direct)',
              isInstagram: !!parsed.isInstagram,
              page: parsed.page || '/',
            });
          } catch {
            // ignore malformed row
          }
        }
      }
      parsedLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // 최신 25건(5줄 × 5페이지)을 초과하는 오래된 기록은 DB에서 즉시 삭제하고 저장하지 않음
      if (parsedLogs.length > MAX_LOGS) {
        const staleKeys = parsedLogs.slice(MAX_LOGS).map((l) => l.settingKey);
        supabase
          .from('nao3_system_settings')
          .delete()
          .in('setting_key', staleKeys)
          .then(() => {});
      }

      setVisitLogs(parsedLogs.slice(0, MAX_LOGS));
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLog = async (settingKey: string) => {
    try {
      const { error } = await supabase
        .from('nao3_system_settings')
        .delete()
        .eq('setting_key', settingKey);
      if (error) throw error;

      const nextLogs = visitLogs.filter((l) => l.settingKey !== settingKey);
      setVisitLogs(nextLogs);

      const maxPage = Math.max(1, Math.ceil(nextLogs.length / ITEMS_PER_PAGE));
      if (currentPage > maxPage) {
        setCurrentPage(maxPage);
      }
    } catch (err) {
      console.error('Failed to delete visit log:', err);
      alert('기록 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleResetTodayVisitors = async () => {
    if (!confirm('오늘 방문자 수를 0명으로 초기화하시겠습니까?')) return;
    try {
      const todayStr = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Seoul',
      }).format(new Date());
      await supabase
        .from('nao3_system_settings')
        .upsert(
          { setting_key: `DAILY_VISITORS_${todayStr}`, setting_value: '0' },
          { onConflict: 'setting_key' }
        );
      setStats((prev) => ({ ...prev, todayVisitors: 0 }));
    } catch {
      alert('초기화 중 오류가 발생했습니다.');
    }
  };

  const handleClearAllLogs = async () => {
    if (!confirm('테스트 접속 기록을 모두 비우시겠습니까?')) return;
    try {
      await supabase
        .from('nao3_system_settings')
        .delete()
        .like('setting_key', 'VISIT_LOG_%');
      setVisitLogs([]);
      setCurrentPage(1);
    } catch {
      alert('전체 비우기 중 오류가 발생했습니다.');
    }
  };

  if (loading) return <div className="p-8 text-gray-500">통계 데이터를 불러오는 중...</div>;

  const totalPages = Math.max(1, Math.ceil(visitLogs.length / ITEMS_PER_PAGE));
  const paginatedLogs = visitLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-6xl animate-fade-in-up space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">통계 요약</h2>
          <p className="text-gray-500 mt-1 text-sm">대표님(관리자) 기기 및 로컬 테스트 접속은 제외되고 실제 고객 방문만 집계됩니다.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {/* 오늘 방문자 (Blue) */}
        <div className="bg-gradient-to-br from-blue-50/90 via-white to-blue-50/40 rounded-2xl p-3 sm:p-5 shadow-sm border border-blue-200 border-t-4 border-t-blue-600 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1 mb-2">
            <h3 className="text-[11px] sm:text-xs font-extrabold text-blue-800 truncate">
              오늘 방문자
            </h3>
            {stats.todayVisitors > 0 && (
              <button
                type="button"
                onClick={handleResetTodayVisitors}
                className="text-[10px] font-bold text-blue-500 hover:text-blue-700 bg-blue-100/70 hover:bg-blue-200/70 px-1.5 py-0.5 rounded transition-colors shrink-0"
                title="오늘 방문자 수 0으로 초기화"
              >
                0초기화
              </button>
            )}
          </div>
          <div className="flex items-baseline gap-0.5 sm:gap-1">
            <span className="text-2xl sm:text-3xl font-black text-blue-600 leading-none">{stats.todayVisitors}</span>
            <span className="text-xs sm:text-base font-extrabold text-blue-400">명</span>
          </div>
        </div>

        {/* 오늘 신규 가입 (Emerald) */}
        <div className="bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 rounded-2xl p-3 sm:p-5 shadow-sm border border-emerald-200 border-t-4 border-t-emerald-500 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1 mb-2">
            <h3 className="text-[11px] sm:text-xs font-extrabold text-emerald-800 truncate">
              오늘 신규 가입
            </h3>
            <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
          </div>
          <div className="flex items-baseline gap-0.5 sm:gap-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 leading-none">{stats.todaySignups}</span>
            <span className="text-xs sm:text-base font-extrabold text-emerald-400">곳</span>
          </div>
        </div>

        {/* 이번 달 가입자 (Purple) */}
        <div className="bg-gradient-to-br from-purple-50/90 via-white to-purple-50/40 rounded-2xl p-3 sm:p-5 shadow-sm border border-purple-200 border-t-4 border-t-[#5F0080] flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1 mb-2">
            <h3 className="text-[11px] sm:text-xs font-extrabold text-[#5F0080] truncate">
              이번 달 가입자
            </h3>
            <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-[#5F0080] shrink-0"></span>
          </div>
          <div className="flex items-baseline gap-0.5 sm:gap-1">
            <span className="text-2xl sm:text-3xl font-black text-[#5F0080] leading-none">{stats.monthSignups}</span>
            <span className="text-xs sm:text-base font-extrabold text-purple-400">곳</span>
          </div>
        </div>

        {/* 누적 가입자 (Amber) */}
        <div className="bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 rounded-2xl p-3 sm:p-5 shadow-sm border border-amber-200 border-t-4 border-t-amber-500 flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-1 mb-2">
            <h3 className="text-[11px] sm:text-xs font-extrabold text-amber-800 truncate">
              총 누적 가입자
            </h3>
            <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
          </div>
          <div className="flex items-baseline gap-0.5 sm:gap-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 leading-none">{stats.totalSignups}</span>
            <span className="text-xs sm:text-base font-extrabold text-amber-500">곳</span>
          </div>
        </div>
      </div>

      {/* 최근 접속/설치 기록 */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-lg font-black text-gray-900 tracking-tight">
            최근 접속/설치 기록 (최대 {MAX_LOGS}건 · {MAX_PAGES}페이지)
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 font-medium">
              최근 25건(5줄×5페이지)만 표시되며, 이전 기록은 저장하지 않고 자동 삭제됩니다
            </span>
            {visitLogs.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllLogs}
                className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                기록 전체 비우기
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[780px]">
            <thead className="bg-gray-50/70 text-gray-500 font-bold text-xs border-b border-gray-100">
              <tr>
                <th className="px-6 py-3.5 whitespace-nowrap">분류 / 접속 시간</th>
                <th className="px-6 py-3.5 whitespace-nowrap">유입 경로 (Referrer)</th>
                <th className="px-6 py-3.5 text-center whitespace-nowrap">인스타그램 여부</th>
                <th className="px-6 py-3.5 whitespace-nowrap">접속 페이지</th>
                <th className="px-6 py-3.5 text-center whitespace-nowrap">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                    아직 기록된 접속 내역이 없습니다.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const timeStr = new Date(log.createdAt).toLocaleString('ko-KR');
                  const isInstall = log.type === '앱 설치';

                  return (
                    <tr key={log.settingKey} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`px-2 py-0.5 text-[11px] font-extrabold rounded ${
                              isInstall
                                ? 'bg-emerald-50 text-emerald-600'
                                : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            {log.type}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">{timeStr}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-800 font-medium text-sm break-all max-w-md">
                        {log.device} {log.referrer}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        {log.isInstagram ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold bg-pink-50 text-pink-600 border border-pink-200">
                            📸 인스타그램
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs whitespace-nowrap">
                        {log.page}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDeleteLog(log.settingKey)}
                          className="text-xs font-bold text-gray-400 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 (5개 초과 시 1, 2, 3... 페이지 이동) */}
        {visitLogs.length > ITEMS_PER_PAGE && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/40 flex items-center justify-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 text-xs font-extrabold rounded-lg border transition-colors ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 text-xs font-bold text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
