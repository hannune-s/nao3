import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ghcuxdrgzxiupjcmbwpt.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { storeId, planType, impUid, merchantUid } = body;

    if (!storeId || !impUid || !merchantUid || (planType !== 'monthly' && planType !== 'annual')) {
      return NextResponse.json({ error: '유효하지 않은 결제 검증 요청입니다.' }, { status: 400 });
    }

    // 1. 중복 결제 영수증(imp_uid) 재사용 공격 차단 (nao3_system_settings 활용)
    const uidKey = `PAYMENT_UID_${impUid}`;
    const { data: existingPayment } = await supabase
      .from('nao3_system_settings')
      .select('setting_key')
      .eq('setting_key', uidKey)
      .maybeSingle();

    if (existingPayment) {
      return NextResponse.json({ error: '이미 처리된 결제 건입니다.' }, { status: 409 });
    }

    // 2. 매장 정보 조회 및 서버 기준 만료일 계산
    const { data: store, error: storeErr } = await supabase
      .from('nao3_stores')
      .select('id, store_name, expires_at')
      .eq('id', storeId)
      .single();

    if (storeErr || !store) {
      return NextResponse.json({ error: '매장 정보를 찾을 수 없습니다.' }, { status: 404 });
    }

    const expectedAmount = planType === 'annual' ? 178800 : 14900;
    const baseDate =
      store.expires_at && new Date(store.expires_at) > new Date()
        ? new Date(store.expires_at)
        : new Date();

    const newExpiresAt = new Date(baseDate);
    if (planType === 'annual') {
      newExpiresAt.setFullYear(newExpiresAt.getFullYear() + 1);
    } else {
      newExpiresAt.setMonth(newExpiresAt.getMonth() + 1);
    }

    const newExpiresIso = newExpiresAt.toISOString();

    // 3. 가맹점 구독 상태 및 만료일 업데이트
    const { error: updateErr } = await supabase
      .from('nao3_stores')
      .update({
        subscription_paid: true,
        expires_at: newExpiresIso,
      })
      .eq('id', storeId);

    if (updateErr) throw updateErr;

    // 4. 본사 매출 관리 로그(nao3_system_settings) 기록
    const nowIso = new Date().toISOString();
    const logKey = `PAYMENT_LOG_${Date.now()}_${store.id}`;
    const paymentRecord = {
      id: logKey,
      created_at: nowIso,
      store_id: store.id,
      store_name: store.store_name,
      plan_type: planType === 'annual' ? '연간' : '월간',
      amount: expectedAmount,
      method: '카드결제 (KCP)',
      status: '결제완료',
      imp_uid: impUid,
      merchant_uid: merchantUid,
    };

    await supabase.from('nao3_system_settings').upsert(
      [
        { setting_key: uidKey, setting_value: nowIso },
        { setting_key: logKey, setting_value: JSON.stringify(paymentRecord) },
      ],
      { onConflict: 'setting_key' }
    );

    return NextResponse.json({
      success: true,
      subscription_paid: true,
      expires_at: newExpiresIso,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || '결제 반영 중 서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
