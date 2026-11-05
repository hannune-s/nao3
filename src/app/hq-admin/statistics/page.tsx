"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type VisitLog = {
  settingKey: string;
  type: string;
  createdAt: string;
  device: string;
  referrer: string;
  isInstagram: boolean;
  page: string;
  visitCount: number;
  actions: string[];
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

  // 이모지 제거 및 '스마트폰(모바일)' -> '모바일' 정리 헬퍼
  const stripEmojiAndClean = (str: string) =>
    str
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
      .replace(/스마트폰\(모바일\)/g, '모바일')
      .replace(/스마트폰/g, '모바일')
      .replace(/갤럭시·안드로이드/g, '모바일')
      .replace(/아이폰/g, '모바일(iOS)')
      .replace(/데스크톱/g, '')
      .trim();

  // 기존 DB 기록 중 기기 문자열('[Mobile Web]' 등)을 깔끔한 텍스트('모바일 · 네이버' 등)로 보정
  const formatDeviceDisplay = (rawDevice: string, referrer: string, isInstagram: boolean) => {
    if (rawDevice && !rawDevice.startsWith('[')) {
      return stripEmojiAndClean(rawDevice);
    }
    const isMobile = /Mobile/i.test(rawDevice);
    const base = isMobile ? '모바일' : 'PC';
    if (isInstagram || /instagram/i.test(referrer)) return `${base} · 인스타그램`;
    if (/naver\.com/i.test(referrer)) return `${base} · 네이버`;
    if (/kakao/i.test(referrer)) return `${base} · 카카오톡`;
    return `${base} · 웹`;
  };

  // 페이지 경로로부터 기본 행동 발자취 배열 추론 (아이콘 없는 깔끔한 텍스트)
  const inferActionsFromPage = (page: string, type: string, existingActions?: string[]): string[] => {
    if (Array.isArray(existingActions) && existingActions.length > 0) {
      return existingActions.map((a) => stripEmojiAndClean(a));
    }
    const cleanPath = (page || '/').split('?')[0];
    const steps: string[] = ['메인 랜딩 열람'];
    if (cleanPath.includes('demo-guest-') && cleanPath.includes('/sale')) {
      steps.push('무료 어드민 체험', '체험 전단지(손님화면) 확인');
    } else if (cleanPath.includes('demo-guest-') || type === '어드민 체험') {
      steps.push('무료 어드민 체험');
    } else if (cleanPath.startsWith('/register')) {
      steps.push('스토어 개설(가입화면) 진입');
    } else if (cleanPath.startsWith('/support')) {
      steps.push('고객지원·문의 확인');
    } else if (cleanPath.startsWith('/login')) {
      steps.push('로그인 화면');
    }
    if (type === '앱 설치' && !steps.includes('앱 설치 완료')) {
      steps.push('앱 설치 완료');
    }
    return steps;
  };

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
        storesData.forEach((store: any) => {
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
      const storeNoiseKeysToDelete: string[] = [];

      if (logRows) {
        for (const row of logRows) {
          try {
            const parsed = JSON.parse(row.setting_value || '{}');
            const pageStr: string = parsed.page || '/';

            // 가맹점 손님 전단지(/store/j49533/sale 등) 및 가맹점 어드민 기록은 본사 통계에서 즉시 제외 & DB 정리
            if (pageStr.startsWith('/store/') && !pageStr.includes('demo-guest-')) {
              storeNoiseKeysToDelete.push(row.setting_key);
              continue;
            }

            const refStr = parsed.referrer || '직접 접속 (Direct)';
            const isInsta = !!parsed.isInstagram;

            parsedLogs.push({
              settingKey: row.setting_key,
              type: parsed.type || '웹 방문',
              createdAt: parsed.createdAt || new Date().toISOString(),
              device: formatDeviceDisplay(parsed.device || '[Mobile Web]', refStr, isInsta),
              referrer: refStr,
              isInstagram: isInsta,
              page: pageStr,
              visitCount: Number(parsed.visitCount) > 0 ? Number(parsed.visitCount) : 1,
              actions: inferActionsFromPage(pageStr, parsed.type || '웹 방문', parsed.actions),
            });
          } catch {
            // ignore malformed row
          }
        }
      }

      parsedLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // 가맹점 손님 노이즈 기록 및 최신 25건을 초과하는 오래된 기록은 DB에서 자동 삭제
      const staleKeys = [
        ...storeNoiseKeysToDelete,
        ...parsedLogs.slice(MAX_LOGS).map((l) => l.settingKey),
      ];
      if (staleKeys.length > 0) {
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

  // 유입 경로(Referrer) + URL 파라미터를 분석하여 [왜·어디서 들어왔나] 깔끔한 텍스트로 반환
  const resolveChannelInfo = (log: VisitLog) => {
    const ref = log.referrer || '';
    const page = log.page || '';

    let campaignHint = '';
    const qIdx = page.indexOf('?');
    if (qIdx !== -1) {
      try {
        const params = new URLSearchParams(page.slice(qIdx));
        const src = params.get('from') || params.get('utm_source') || params.get('ref') || params.get('keyword');
        if (src) campaignHint = `광고/출처: ${src}`;
      } catch {}
    }

    if (
      log.isInstagram ||
      /instagram\.com|ig\.me/i.test(ref) ||
      /utm_source=instagram|igshid=/i.test(page)
    ) {
      return {
        title: '인스타그램 유입',
        subText: campaignHint || (ref && !ref.includes('직접 접속') ? ref : ''),
      };
    }

    if (/search\.naver\.com/i.test(ref)) {
      return {
        title: '네이버 키워드 검색',
        subText: campaignHint || ref,
      };
    }

    if (/blog\.naver\.com|cafe\.naver\.com/i.test(ref)) {
      return {
        title: '네이버 블로그·카페',
        subText: campaignHint || ref,
      };
    }

    if (/naver\.com/i.test(ref)) {
      return {
        title: '네이버 검색·모바일',
        subText: campaignHint || ref,
      };
    }

    if (/kakao|daum\.net/i.test(ref) || /카카오톡/i.test(log.device)) {
      return {
        title: '카카오톡 링크 공유',
        subText: campaignHint || '',
      };
    }

    if (/google\.|youtube\.|youtu\.be/i.test(ref)) {
      return {
        title: '구글·유튜브 검색',
        subText: campaignHint || ref,
      };
    }

    if (/facebook\.com|fb\.me|threads\.net/i.test(ref)) {
      return {
        title: '페이스북·스레드',
        subText: campaignHint || ref,
      };
    }

    if (!ref || ref.includes('직접 접속')) {
      return {
        title: '주소 직접 입력·북마크',
        subText: campaignHint || '',
      };
    }

    return {
      title: '외부 웹사이트 유입',
      subText: campaignHint || ref,
    };
  };

  // 각 행동 단계(발자취)별 텍스트 강조 색상 (뱃지 없이 텍스트로만)
  const getStepTextStyle = (step: string) => {
    if (step.includes('가입화면')) {
      return 'text-rose-600 font-black';
    }
    if (step.includes('체험')) {
      return 'text-[#5F0080] font-black';
    }
    if (step.includes('설치')) {
      return 'text-emerald-600 font-black';
    }
    return 'text-gray-800 font-bold';
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
    if (!confirm('접속 기록을 모두 비우시겠습니까?')) return;
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
  const safePage = Math.min(currentPage, totalPages);
  const paginatedLogs = visitLogs.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-6xl animate-fade-in-up space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">통계 요약</h2>
          <p className="text-gray-500 mt-1 text-sm">
            가맹점 손님(전단지) 및 대표님 기기는 제외되며, 오직 <strong>NAO3 본사에 유입된 예비 사장님</strong>만 집계됩니다.
          </p>
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

      {/* 최근 접속 기록 */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-2">
          <h3 className="text-lg font-black text-gray-900 tracking-tight">
            최근 접속 기록
          </h3>
          <div className="flex items-center gap-3 shrink-0">
            {visitLogs.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllLogs}
                className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
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
                <th className="px-6 py-3.5 whitespace-nowrap">방문자 구분 / 접속 시간</th>
                <th className="px-6 py-3.5 whitespace-nowrap">기기 · 실행 앱</th>
                <th className="px-6 py-3.5 whitespace-nowrap">유입 경로</th>
                <th className="px-6 py-3.5 whitespace-nowrap">열람 기록</th>
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
                  const isRepeat = log.visitCount > 1;
                  const channel = resolveChannelInfo(log);
                  const steps = log.actions && log.actions.length > 0 ? log.actions : ['메인 랜딩 열람'];

                  return (
                    <tr key={log.settingKey} className="hover:bg-gray-50/60 transition-colors">
                      {/* 1. 방문자 구분 (첫 방문 / 재방문만 카드 형태) + 접속 시간 */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          {isRepeat ? (
                            <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                              재방문 ({log.visitCount}회째)
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 text-[11px] font-extrabold rounded-md bg-blue-50 text-blue-600 border border-blue-100">
                              첫 방문
                            </span>
                          )}
                          <span className="text-xs text-gray-400 font-medium">{timeStr}</span>
                        </div>
                      </td>

                      {/* 2. 기기 · 실행 앱 (텍스트로만 표기) */}
                      <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-bold text-[13.5px]">
                        {log.device}
                      </td>

                      {/* 3. 유입 경로 (텍스트로만 표기) */}
                      <td className="px-6 py-4 max-w-xs">
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="text-[13.5px] font-bold text-gray-800">
                            {channel.title}
                          </span>
                          {channel.subText && (
                            <span className="text-[11px] text-gray-400 truncate max-w-[240px]" title={channel.subText}>
                              {channel.subText}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. 예비 사장님 행동 발자취 (텍스트로만 표기) */}
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap items-center gap-1.5 text-[13.5px]">
                          {steps.map((step, idx) => (
                            <div key={`${log.settingKey}-step-${idx}`} className="flex items-center gap-1.5">
                              {idx > 0 && (
                                <span className="text-gray-400 font-bold text-xs select-none">→</span>
                              )}
                              <span className={`whitespace-nowrap ${getStepTextStyle(step)}`}>
                                {step}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* 5. 관리 */}
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
              disabled={safePage === 1}
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
                  safePage === pageNum
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
              disabled={safePage === totalPages}
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
