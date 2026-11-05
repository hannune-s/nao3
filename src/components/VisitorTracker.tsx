"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

let isTrackingInFlight = false;

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;

    // 1. 본사 어드민(/hq-admin)에 접속한 기기(대표님 PC/휴대폰)는 '관리자 기기'로 자동 기억하여 이후 테스트 접속 시 집계에서 제외
    if (pathname.startsWith('/hq-admin')) {
      try {
        localStorage.setItem('nao3_hq_owner_device', 'true');
      } catch {}
      return;
    }

    // 2. 가맹점 손님 전단지(/store/xxx/sale) 및 실제 가맹점 어드민(/store/xxx) 접속은 본사 통계에서 100% 제외!
    //    오직 예비 사장님이 눌러보는 '무료 체험하기(/store/demo-guest-...)'만 본사 행동 발자취로 기록
    if (pathname.startsWith('/store/') && !pathname.includes('demo-guest-')) {
      return;
    }

    // 3. 로컬 개발 서버(localhost), Vercel 테스트 주소, 미리보기 페이지는 집계 제외
    const host = window.location.hostname || '';
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.endsWith('.vercel.app') ||
      pathname.startsWith('/og-preview')
    ) {
      return;
    }

    // 4. 대표님(관리자) 기기 또는 검색/카톡 로봇(Bot)은 실제 고객 통계에서 제외
    try {
      if (
        localStorage.getItem('nao3_hq_owner_device') === 'true' ||
        sessionStorage.getItem('nao3_hq_admin_auth') === 'verified'
      ) {
        return;
      }
    } catch {}

    const ua = navigator.userAgent || '';
    if (/bot|crawler|spider|crawling|kakaotalk-scrap|facebookexternalhit|slackbot|HeadlessChrome/i.test(ua)) {
      return;
    }

    // 5. 구체적인 기기(모바일/PC) + 실행 앱(네이버/카카오톡/인스타그램/크롬/사파리) 판별 (아이콘 없이 깔끔한 텍스트)
    const detectDeviceAndApp = (userAgent: string, referrer: string) => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      const osLabel = isMobile ? '모바일' : 'PC';

      let appLabel = '웹';
      if (/KAKAOTALK/i.test(userAgent)) appLabel = '카카오톡';
      else if (/NAVER/i.test(userAgent)) appLabel = '네이버앱';
      else if (/Instagram/i.test(userAgent)) appLabel = '인스타그램';
      else if (/FBAN|FBAV/i.test(userAgent)) appLabel = '페이스북';
      else if (/DaumApps/i.test(userAgent)) appLabel = '다음앱';
      else if (/SamsungBrowser/i.test(userAgent)) appLabel = '삼성인터넷';
      else if (/Edg/i.test(userAgent)) appLabel = '엣지';
      else if (/CriOS|Chrome/i.test(userAgent)) appLabel = '크롬';
      else if (/Safari/i.test(userAgent)) appLabel = '사파리';

      if ((appLabel === '크롬' || appLabel === '삼성인터넷' || appLabel === '사파리' || appLabel === '웹') && /naver\.com/i.test(referrer)) {
        appLabel = '네이버 웹';
      }

      return `${osLabel} · ${appLabel}`;
    };

    // 6. 현재 경로를 예비 사장님 행동 단계(발자취) 이름으로 변환 (아이콘 없는 깔끔한 텍스트)
    const resolveStepName = (path: string, isInstall = false): string => {
      if (isInstall) return '앱 설치 완료';
      if (path.includes('demo-guest-') && path.includes('/sale')) return '체험 전단지(손님화면) 확인';
      if (path.includes('demo-guest-')) return '무료 어드민 체험';
      if (path.startsWith('/register')) return '스토어 개설(가입화면) 진입';
      if (path.startsWith('/support')) return '고객지원·문의 확인';
      if (path.startsWith('/login')) return '로그인 화면';
      return '메인 랜딩 열람';
    };

    const cleanupOldLogs = async () => {
      const { data: allLogs } = await supabase
        .from('nao3_system_settings')
        .select('setting_key')
        .like('setting_key', 'VISIT_LOG_%')
        .order('setting_key', { ascending: false })
        .limit(200);

      if (allLogs && allLogs.length > 25) {
        const staleKeys = allLogs.slice(25).map((r) => r.setting_key);
        await supabase
          .from('nao3_system_settings')
          .delete()
          .in('setting_key', staleKeys);
      }
    };

    const trackVisitAndJourney = async () => {
      if (isTrackingInFlight) return;
      isTrackingInFlight = true;
      try {
        const todayKst = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Seoul',
        }).format(new Date()); // YYYY-MM-DD (한국 시간 기준)

        // 1. 본사 일일 순수 방문자 수 집계 (하루 1회, 가맹점 손님 제외된 순수 본사 유입만!)
        const dailyStorageKey = `nao3_visited_${todayKst}`;
        if (localStorage.getItem(dailyStorageKey) !== 'true') {
          localStorage.setItem(dailyStorageKey, 'true');
          const settingKey = `DAILY_VISITORS_${todayKst}`;

          const { data: existing } = await supabase
            .from('nao3_system_settings')
            .select('setting_value')
            .eq('setting_key', settingKey)
            .maybeSingle();

          const currentCount = parseInt(existing?.setting_value || '0', 10) || 0;
          const nextCount = currentCount + 1;

          await supabase
            .from('nao3_system_settings')
            .upsert(
              {
                setting_key: settingKey,
                setting_value: String(nextCount),
              },
              { onConflict: 'setting_key' }
            );
        }

        // 2. 세션별 방문자 기록 생성 또는 행동 발자취(랜딩 ➔ 체험 ➔ 가입진입) 실시간 업데이트
        const currentStep = resolveStepName(pathname);
        const existingLogKey = sessionStorage.getItem('nao3_hq_session_log_key');

        if (!existingLogKey) {
          // 새 세션 시작: 누적 방문 횟수(첫 방문 vs 재방문 N회째) 계산
          const prevCount = parseInt(localStorage.getItem('nao3_hq_visit_count') || '0', 10) || 0;
          const visitCount = prevCount + 1;
          localStorage.setItem('nao3_hq_visit_count', String(visitCount));

          const ref = document.referrer ? document.referrer : '직접 접속 (Direct)';
          const search = window.location.search || '';
          const isInstagram =
            /instagram/i.test(ua) ||
            /instagram\.com|ig\.me/i.test(ref) ||
            /utm_source=instagram|igshid=/i.test(search);

          const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;

          const initialSteps = ['메인 랜딩 열람'];
          if (currentStep !== '메인 랜딩 열람') {
            initialSteps.push(currentStep);
          }

          const logKey = `VISIT_LOG_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          const logMeta = {
            type: isStandalone ? '앱 설치' : '웹 방문',
            createdAt: new Date().toISOString(),
            device: detectDeviceAndApp(ua, ref),
            referrer: ref,
            isInstagram,
            page: pathname + search,
            visitCount,
            actions: initialSteps,
          };

          sessionStorage.setItem('nao3_hq_session_log_key', logKey);
          sessionStorage.setItem('nao3_hq_session_log_data', JSON.stringify(logMeta));

          await supabase.from('nao3_system_settings').insert({
            setting_key: logKey,
            setting_value: JSON.stringify(logMeta),
          });

          await cleanupOldLogs();
        } else {
          // 이미 세션이 있는 방문자가 체험하기, 가입화면 등으로 이동한 경우 -> 같은 줄에 발자취 추가!
          const cachedStr = sessionStorage.getItem('nao3_hq_session_log_data');
          if (cachedStr) {
            const cachedMeta = JSON.parse(cachedStr);
            const actions: string[] = Array.isArray(cachedMeta.actions) ? cachedMeta.actions : ['메인 랜딩 열람'];
            if (!actions.includes(currentStep)) {
              actions.push(currentStep);
              cachedMeta.actions = actions;
              cachedMeta.page = pathname + (window.location.search || '');
              sessionStorage.setItem('nao3_hq_session_log_data', JSON.stringify(cachedMeta));

              await supabase
                .from('nao3_system_settings')
                .upsert(
                  {
                    setting_key: existingLogKey,
                    setting_value: JSON.stringify(cachedMeta),
                  },
                  { onConflict: 'setting_key' }
                );
            }
          }
        }
      } catch (e) {
        // 방문자 집계 오류 시 사용자 화면에 영향 없도록 무시
      } finally {
        isTrackingInFlight = false;
      }
    };

    trackVisitAndJourney();

    const handleAppInstalled = async () => {
      try {
        const existingLogKey = sessionStorage.getItem('nao3_hq_session_log_key');
        const cachedStr = sessionStorage.getItem('nao3_hq_session_log_data');
        if (existingLogKey && cachedStr) {
          const cachedMeta = JSON.parse(cachedStr);
          const actions: string[] = Array.isArray(cachedMeta.actions) ? cachedMeta.actions : [];
          if (!actions.includes('앱 설치 완료')) {
            actions.push('앱 설치 완료');
          }
          cachedMeta.actions = actions;
          cachedMeta.type = '앱 설치';
          sessionStorage.setItem('nao3_hq_session_log_data', JSON.stringify(cachedMeta));
          await supabase
            .from('nao3_system_settings')
            .upsert(
              {
                setting_key: existingLogKey,
                setting_value: JSON.stringify(cachedMeta),
              },
              { onConflict: 'setting_key' }
            );
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [pathname]);

  return null;
}
