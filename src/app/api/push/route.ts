import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
);

webpush.setVapidDetails(
  'mailto:admin@nao3.kr',
  'BPjk-7gccGn9cI7r_mWhS2bRC_-FbApH8Tg8YhIPBDL6s1WIybDbDUT0E6u0IfrDNR_rR7sUzVXPboyKqL6-KTU',
  'kIEDQchW0Q8nnvGmZ3P0gRdz9NQ6ZSAXrpYB2chVS5M'
);

export async function POST(request: Request) {
  try {
    const { storeId, title, body } = await request.json();

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }

    // 1. storeId가 UUID이든 slug이든 실제 id(UUID)와 slug를 모두 조회
    let actualStoreId = storeId;
    let actualStoreSlug = storeId;

    if (storeId.includes('-')) {
      const { data: store } = await supabase
        .from('nao3_stores')
        .select('id, slug')
        .eq('id', storeId)
        .maybeSingle();
      if (store) {
        actualStoreId = store.id;
        actualStoreSlug = store.slug || store.id;
      }
    } else {
      const { data: store } = await supabase
        .from('nao3_stores')
        .select('id, slug')
        .eq('slug', storeId)
        .maybeSingle();
      if (store) {
        actualStoreId = store.id;
        actualStoreSlug = store.slug || storeId;
      }
    }

    // PUSH_SUB 로 저장된 토큰들 가져오기
    const { data: subs, error } = await supabase
      .from('nao3_system_settings')
      .select('setting_key, setting_value')
      .like('setting_key', `PUSH_SUB_${actualStoreId}_%`);

    if (error || !subs || subs.length === 0) {
      return NextResponse.json({ 
        success: true, 
        count: 0, 
        message: 'No subscriptions found',
        debug: {
          providedStoreId: storeId,
          resolvedActualStoreId: actualStoreId,
          dbError: error ? error.message : null,
          subsLength: subs ? subs.length : 0
        }
      });
    }

    const payload = JSON.stringify({
      title: title || '단골 특가 알림',
      body: body || '새로운 세일 상품이 등록되었습니다!',
      url: `/store/${actualStoreSlug}/sale`
    });

    // 동일 기기(동일 endpoint) 중복 발송 방지
    const uniqueSubRows: { setting_key: string; sub: any }[] = [];
    const seenEndpoints = new Set<string>();
    const staleKeys: string[] = [];

    for (const row of subs) {
      try {
        const parsed = JSON.parse(row.setting_value);
        if (parsed && parsed.endpoint) {
          if (seenEndpoints.has(parsed.endpoint)) {
            staleKeys.push(row.setting_key);
          } else {
            seenEndpoints.add(parsed.endpoint);
            uniqueSubRows.push({ setting_key: row.setting_key, sub: parsed });
          }
        }
      } catch (e) {
        staleKeys.push(row.setting_key);
      }
    }

    let successCount = 0;
    const errors: string[] = [];
    const promises = uniqueSubRows.map(async ({ setting_key, sub }) => {
      try {
        await webpush.sendNotification(sub, payload);
        successCount++;
      } catch (err: any) {
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          staleKeys.push(setting_key);
        } else {
          console.error('Failed to send to one sub', err);
          errors.push(err?.body || err?.message || String(err));
        }
      }
    });

    await Promise.all(promises);

    // 만료되었거나 중복된 구독 토큰 자동 정리
    if (staleKeys.length > 0) {
      await supabase
        .from('nao3_system_settings')
        .delete()
        .in('setting_key', staleKeys);
    }

    return NextResponse.json({ success: true, count: successCount, errors });

  } catch (error) {
    console.error('Push error:', error);
    return NextResponse.json({ error: 'Failed to send push' }, { status: 500 });
  }
}

