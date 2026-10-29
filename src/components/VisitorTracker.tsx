"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;
    // 본사 어드민(/hq-admin) 내부 이동은 방문자 집계 및 접속 기록에서 제외
    if (pathname.startsWith('/hq-admin')) return;

    const getVisitMeta = (visitType: '웹 방문' | '앱 설치') => {
      const ua = navigator.userAgent || '';
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

    const trackVisit = async () => {
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

        // 2. 최근 접속 기록 저장 (세션당 1회 기록)
        const sessionLogKey = 'nao3_session_visit_logged';
        if (sessionStorage.getItem(sessionLogKey) !== 'true') {
          sessionStorage.setItem(sessionLogKey, 'true');
          const isStandalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as any).standalone === true;
          const logMeta = getVisitMeta(isStandalone ? '앱 설치' : '웹 방문');
          const logKey = `VISIT_LOG_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

          await supabase.from('nao3_system_settings').insert({
            setting_key: logKey,
            setting_value: JSON.stringify(logMeta),
          });
        }
      } catch (e) {
        // 방문자 집계 오류 시 사용자 화면에 영향 없도록 무시
      }
    };

    trackVisit();

    const handleAppInstalled = async () => {
      try {
        const logMeta = getVisitMeta('앱 설치');
        const logKey = `VISIT_LOG_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
        await supabase.from('nao3_system_settings').insert({
          setting_key: logKey,
          setting_value: JSON.stringify(logMeta),
        });
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
