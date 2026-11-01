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

    // 2. 로컬 개발 서버(localhost), Vercel 테스트 주소, 미리보기/데모 페이지는 집계 제외
    const host = window.location.hostname || '';
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.endsWith('.vercel.app') ||
      pathname.startsWith('/og-preview') ||
      pathname.includes('demo-guest-')
    ) {
      return;
    }

    // 3. 대표님(관리자) 기기 또는 검색/카톡 로봇(Bot)은 실제 고객 통계에서 제외
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

    const getVisitMeta = (visitType: '웹 방문' | '앱 설치') => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
      const device = isMobile ? '[Mobile Web]' : '[PC Web]';
      const ref = document.referrer ? document.referrer : '직접 접속 (Direct)';
      const search = window.location.search || '';
      const isInstagram =
        /instagram/i.test(ua) ||
        /instagram\.com|ig\.me/i.test(ref) ||
        /utm_source=instagram|igshid=/i.test(search);

      return {
        type: visitType,
        createdAt: new Date().toISOString(),
        device,
        referrer: ref,
        isInstagram,
        page: pathname + search,
      };
    };

    const saveVisitLogWithLimit = async (logMeta: ReturnType<typeof getVisitMeta>) => {
      const logKey = `VISIT_LOG_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      await supabase.from('nao3_system_settings').insert({
        setting_key: logKey,
        setting_value: JSON.stringify(logMeta),
      });

      // 최신 25건(5줄 × 5페이지)만 유지하고 나머지는 DB에서 자동 삭제
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

    const trackVisit = async () => {
      if (isTrackingInFlight) return;
      isTrackingInFlight = true;
      try {
        const todayKst = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Seoul',
        }).format(new Date()); // YYYY-MM-DD (한국 시간 기준)

        // 1. 일일 순수 방문자 수 집계 (하루 1회)
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

        // 2. 최근 접속 기록 저장 (세션당 1회 기록, 최대 25건만 유지)
        const sessionLogKey = 'nao3_session_visit_logged';
        if (sessionStorage.getItem(sessionLogKey) !== 'true') {
          sessionStorage.setItem(sessionLogKey, 'true');
          const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
          const logMeta = getVisitMeta(isStandalone ? '앱 설치' : '웹 방문');
          await saveVisitLogWithLimit(logMeta);
        }
      } catch (e) {
        // 방문자 집계 오류 시 사용자 화면에 영향 없도록 무시
      } finally {
        isTrackingInFlight = false;
      }
    };

    trackVisit();

    const handleAppInstalled = async () => {
      try {
        const logMeta = getVisitMeta('앱 설치');
        await saveVisitLogWithLimit(logMeta);
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
