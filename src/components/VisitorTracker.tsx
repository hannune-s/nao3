"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;
    // 본사 어드민(/hq-admin) 내부 이동은 방문자 수 집계에서 제외
    if (pathname.startsWith('/hq-admin')) return;

    const trackVisit = async () => {
      try {
        const todayKst = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Asia/Seoul',
        }).format(new Date()); // YYYY-MM-DD (한국 시간 기준)

        const storageKey = `nao3_visited_${todayKst}`;
        if (localStorage.getItem(storageKey) === 'true') {
          return;
        }

        localStorage.setItem(storageKey, 'true');
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
      } catch (e) {
        // 방문자 집계 오류 시 사용자 화면에 영향 없도록 무시
      }
    };

    trackVisit();
  }, [pathname]);

  return null;
}
