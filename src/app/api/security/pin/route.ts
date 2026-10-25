import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ghcuxdrgzxiupjcmbwpt.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// 서버 사이드 SHA-256 해시 함수 (해시값을 클라이언트에 절대 노출하지 않음)
function hashPinServer(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

// 무차별 대입(Brute-force) 공격 방지를 위한 메모리 기반 Rate Limiter (5회 실패 시 5분 차단)
const failedAttempts = new Map<string, { count: number; lockUntil: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_TIME_MS = 5 * 60 * 1000; // 5분

function getClientKey(req: NextRequest, target: string): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';
  return `${ip}:${target}`;
}

function checkRateLimit(key: string): { blocked: boolean; remainingSec?: number } {
  const record = failedAttempts.get(key);
  if (!record) return { blocked: false };

  const now = Date.now();
  if (record.lockUntil > now) {
    return {
      blocked: true,
      remainingSec: Math.ceil((record.lockUntil - now) / 1000),
    };
  }

  if (record.lockUntil !== 0 && record.lockUntil <= now) {
    failedAttempts.delete(key);
  }
  return { blocked: false };
}

function recordFailedAttempt(key: string) {
  const now = Date.now();
  const record = failedAttempts.get(key) || { count: 0, lockUntil: 0 };
  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockUntil = now + LOCK_TIME_MS;
  }
  failedAttempts.set(key, record);
}

function clearFailedAttempts(key: string) {
  failedAttempts.delete(key);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    if (type === 'store') {
      const storeId = searchParams.get('storeId');
      if (!storeId) {
        return NextResponse.json({ error: 'storeId is required' }, { status: 400 });
      }

      const ownerKey = `STORE_OWNER_PIN_${storeId}`;
      const staffKey = `STORE_STAFF_PIN_${storeId}`;

      const { data: pinRows } = await supabase
        .from('nao3_system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [ownerKey, staffKey]);

      const hasOwnerPin = !!(pinRows?.find((r) => r.setting_key === ownerKey)?.setting_value);
      const hasStaffPin = !!(pinRows?.find((r) => r.setting_key === staffKey)?.setting_value);

      // 해시값 자체는 절대 내려주지 않고 설정 여부(boolean)만 반환
      return NextResponse.json({ hasOwnerPin, hasStaffPin });
    }

    if (type === 'hq') {
      const { data } = await supabase
        .from('nao3_system_settings')
        .select('setting_value')
        .eq('setting_key', 'hq_admin_pin')
        .maybeSingle();

      return NextResponse.json({ hasHqPin: !!(data && data.setting_value) });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. 매장 사장/직원 PIN 검증 (서버에서만 대조)
    if (action === 'verify_store') {
      const { storeId, pin } = body;
      if (!storeId || typeof pin !== 'string' || !/^\d{6}$/.test(pin)) {
        return NextResponse.json({ role: null, error: '숫자 6자리를 정확히 입력해주세요.' }, { status: 400 });
      }

      const limitKey = getClientKey(req, `store_${storeId}`);
      const limitStatus = checkRateLimit(limitKey);
      if (limitStatus.blocked) {
        return NextResponse.json(
          {
            role: null,
            error: `PIN 번호 5회 오류로 보안을 위해 잠시 잠겼습니다. (${limitStatus.remainingSec}초 후 다시 시도해주세요)`,
          },
          { status: 429 }
        );
      }

      const ownerKey = `STORE_OWNER_PIN_${storeId}`;
      const staffKey = `STORE_STAFF_PIN_${storeId}`;

      const { data: pinRows } = await supabase
        .from('nao3_system_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [ownerKey, staffKey]);

      const ownerHash = pinRows?.find((r) => r.setting_key === ownerKey)?.setting_value || null;
      const staffHash = pinRows?.find((r) => r.setting_key === staffKey)?.setting_value || null;
      const inputHash = hashPinServer(pin);

      if (ownerHash && inputHash === ownerHash) {
        clearFailedAttempts(limitKey);
        return NextResponse.json({ role: 'owner' });
      }

      if (staffHash && inputHash === staffHash) {
        clearFailedAttempts(limitKey);
        return NextResponse.json({ role: 'staff' });
      }

      recordFailedAttempt(limitKey);
      return NextResponse.json({ role: null, error: 'PIN 번호가 일치하지 않습니다. 다시 확인해주세요.' });
    }

    // 2. 매장 사장/직원 PIN 저장 (서버에서 해싱 후 저장)
    if (action === 'save_store_pin') {
      const { storeId, pinType, pin } = body;
      if (typeof storeId === 'string' && storeId.startsWith('demo-guest-')) {
        return NextResponse.json({ error: '체험 모드에서는 PIN 번호 설정이 불가능합니다. 정식 스토어 개설 후 이용해 주세요!' }, { status: 403 });
      }
      if (!storeId || (pinType !== 'owner' && pinType !== 'staff') || typeof pin !== 'string' || !/^\d{6}$/.test(pin)) {
        return NextResponse.json({ error: '유효하지 않은 요청입니다.' }, { status: 400 });
      }

      const settingKey = pinType === 'owner' ? `STORE_OWNER_PIN_${storeId}` : `STORE_STAFF_PIN_${storeId}`;
      const hashed = hashPinServer(pin);

      const { error } = await supabase
        .from('nao3_system_settings')
        .upsert([{ setting_key: settingKey, setting_value: hashed }], { onConflict: 'setting_key' });

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // 3. 본사 HQ 어드민 PIN 검증 (서버에서만 대조)
    if (action === 'verify_hq') {
      const { pin } = body;
      if (typeof pin !== 'string' || !/^\d{6}$/.test(pin)) {
        return NextResponse.json({ authorized: false, error: '숫자 6자리를 입력해주세요.' }, { status: 400 });
      }

      const limitKey = getClientKey(req, 'hq_admin');
      const limitStatus = checkRateLimit(limitKey);
      if (limitStatus.blocked) {
        return NextResponse.json(
          {
            authorized: false,
            error: `비밀번호 5회 오류로 보안을 위해 잠겼습니다. (${limitStatus.remainingSec}초 후 다시 시도해주세요)`,
          },
          { status: 429 }
        );
      }

      const { data } = await supabase
        .from('nao3_system_settings')
        .select('setting_value')
        .eq('setting_key', 'hq_admin_pin')
        .maybeSingle();

      const storedHash = data?.setting_value || null;
      const envPin = process.env.HQ_ADMIN_MASTER_PIN;

      const inputHash = hashPinServer(pin);
      const isMatch = (storedHash && inputHash === storedHash) || (envPin && pin === envPin);

      if (isMatch) {
        clearFailedAttempts(limitKey);
        return NextResponse.json({ authorized: true });
      }

      recordFailedAttempt(limitKey);
      return NextResponse.json({ authorized: false, error: '비밀번호가 일치하지 않습니다.' });
    }

    // 4. 본사 HQ 어드민 PIN 변경/설정
    if (action === 'save_hq_pin') {
      const { currentPin, newPin } = body;
      if (typeof newPin !== 'string' || !/^\d{6}$/.test(newPin)) {
        return NextResponse.json({ error: '새 PIN 번호는 6자리 숫자여야 합니다.' }, { status: 400 });
      }

      const { data } = await supabase
        .from('nao3_system_settings')
        .select('setting_value')
        .eq('setting_key', 'hq_admin_pin')
        .maybeSingle();

      const storedHash = data?.setting_value || null;
      if (storedHash) {
        const currentHash = hashPinServer(currentPin || '');
        if (currentHash !== storedHash) {
          return NextResponse.json({ error: '현재 PIN 번호가 일치하지 않습니다.' }, { status: 403 });
        }
      }

      const newHash = hashPinServer(newPin);
      const { error } = await supabase
        .from('nao3_system_settings')
        .upsert([{ setting_key: 'hq_admin_pin', setting_value: newHash }], { onConflict: 'setting_key' });

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    // 5. 본사 HQ 어드민 PIN 해제
    if (action === 'remove_hq_pin') {
      const { currentPin } = body;
      const { data } = await supabase
        .from('nao3_system_settings')
        .select('setting_value')
        .eq('setting_key', 'hq_admin_pin')
        .maybeSingle();

      const storedHash = data?.setting_value || null;
      if (storedHash) {
        const currentHash = hashPinServer(currentPin || '');
        if (currentHash !== storedHash) {
          return NextResponse.json({ error: 'PIN 번호가 일치하지 않습니다.' }, { status: 403 });
        }
      }

      const { error } = await supabase
        .from('nao3_system_settings')
        .delete()
        .eq('setting_key', 'hq_admin_pin');

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
