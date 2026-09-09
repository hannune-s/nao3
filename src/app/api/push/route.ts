import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

webpush.setVapidDetails(
  'mailto:test@example.com',
  'BPjk-7gccGn9cI7r_mWhS2bRC_-FbApH8Tg8YhIPBDL6s1WIybDbDUT0E6u0IfrDNR_rR7sUzVXPboyKqL6-KTU',
  'kIEDQchW0Q8nnvGmZ3P0gRdz9NQ6ZSAXrpYB2chVS5M'
);

export async function POST(request: Request) {
  try {
    const { storeId, title, body } = await request.json();

    if (!storeId) {
      return NextResponse.json({ error: 'Store ID is required' }, { status: 400 });
    }

    // PUSH_SUB 로 저장된 토큰들 가져오기
    const { data: subs, error } = await supabase
      .from('nao3_inquiries')
      .select('content')
      .eq('store_id', storeId)
      .eq('author_name', 'PUSH_SUB');

    if (error || !subs || subs.length === 0) {
      return NextResponse.json({ success: true, count: 0, message: 'No subscriptions found' });
    }

    const payload = JSON.stringify({
      title: title || '단골 특가 알림',
      body: body || '새로운 세일 상품이 등록되었습니다!',
      url: `/store/${storeId}/sale`
    });

    let successCount = 0;
    const promises = subs.map(async (subRow) => {
      try {
        const pushSubscription = JSON.parse(subRow.content);
        await webpush.sendNotification(pushSubscription, payload);
        successCount++;
      } catch (err) {
        console.error('Failed to send to one sub', err);
      }
    });

    await Promise.all(promises);

    return NextResponse.json({ success: true, count: successCount });

  } catch (error) {
    console.error('Push error:', error);
    return NextResponse.json({ error: 'Failed to send push' }, { status: 500 });
  }
}
