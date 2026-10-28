"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function MyMenu({ storeData, onStoreUpdate, onPinUpdated, onLockPin }: { storeData: any; onStoreUpdate?: (updated: any) => void; onPinUpdated?: () => void; onLockPin?: () => void }) {
  const router = useRouter();

  type MenuView = 'main' | 'account' | 'subscription' | 'settings' | 'security' | 'notices' | 'guide' | 'qr' | 'inquiry';
  const [view, setViewState] = useState<MenuView>('main');

  const setView = (nextView: MenuView) => {
    if (typeof window !== 'undefined') {
      if (nextView === 'main') {
        if (window.history.state?.nao3View && window.history.state.nao3View !== 'main') {
          window.history.back();
          return;
        }
        window.history.replaceState({ nao3Tab: 'mymenu', nao3View: 'main' }, '');
      } else {
        window.history.pushState({ nao3Tab: 'mymenu', nao3View: nextView }, '');
      }
    }
    setViewState(nextView);
  };

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state?.nao3Tab === 'mymenu') {
        setViewState(e.state.nao3View || 'main');
      } else {
        setViewState('main');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Account form states
  const [ownerName, setOwnerName] = useState(storeData.owner_name || '');
  const [newPassword, setNewPassword] = useState('');
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // Settings form states
  const [phone, setPhone] = useState(storeData.phone || '');
  const [address, setAddress] = useState(storeData.address || '');
  const [operatingHours, setOperatingHours] = useState(storeData.operating_hours || '');
  const [closedDays, setClosedDays] = useState(storeData.closed_days || '');
  const [etcInfo, setEtcInfo] = useState(storeData.etc_info || '');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Security (PIN) states
  const [ownerPin, setOwnerPin] = useState('');
  const [staffPin, setStaffPin] = useState('');
  const [hasOwnerPin, setHasOwnerPin] = useState(false);
  const [hasStaffPin, setHasStaffPin] = useState(false);
  const [isSavingPin, setIsSavingPin] = useState(false);
  const [loadingPin, setLoadingPin] = useState(false);

  // Subscription mock states
  const [hasCard, setHasCard] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState('monthly');
  const businessLabel = storeData.business_type === 'mart' ? '마트' : '정육점';
  const monthlyFee = '14,900';

  // Notices state
  const [hqNotices, setHqNotices] = useState<any[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);

  const fetchLatestStoreInfo = async () => {
    if (!storeData?.id || storeData.id.startsWith('demo-guest-')) return;
    try {
      const [{ data, error }, { data: etcRow }] = await Promise.all([
        supabase
          .from('nao3_stores')
          .select('owner_name, phone, address, operating_hours, closed_days')
          .eq('id', storeData.id)
          .single(),
        supabase
          .from('nao3_system_settings')
          .select('setting_value')
          .eq('setting_key', `STORE_ETC_INFO_${storeData.id}`)
          .maybeSingle(),
      ]);
      if (!error && data) {
        const fetchedEtc = etcRow?.setting_value ?? '';
        setOwnerName(data.owner_name || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
        setOperatingHours(data.operating_hours || '');
        setClosedDays(data.closed_days || '');
        setEtcInfo(fetchedEtc);
        if (onStoreUpdate) onStoreUpdate({ ...data, etc_info: fetchedEtc });
      }
    } catch (err) {
      console.warn('최신 매장 정보 조회 실패:', err);
    }
  };

  const fetchHqNotices = async () => {
    setLoadingNotices(true);
    try {
      const { data, error } = await supabase
        .from('nao3_hq_notices')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setHqNotices(data || []);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoadingNotices(false);
    }
  };

  const fetchPins = async () => {
    if (!storeData?.id || String(storeData.id).startsWith('demo-guest-')) return;
    setLoadingPin(true);
    try {
      const res = await fetch(`/api/security/pin?type=store&storeId=${encodeURIComponent(storeData.id)}`);
      const data = await res.json();
      setHasOwnerPin(!!data?.hasOwnerPin);
      setHasStaffPin(!!data?.hasStaffPin);
    } catch (err) {
      console.warn('PIN 정보를 불러오지 못했습니다:', err);
    } finally {
      setLoadingPin(false);
    }
  };

  useEffect(() => {
    if (view === 'notices') {
      fetchHqNotices();
    } else if (view === 'security') {
      fetchPins();
    } else if (view === 'settings' || view === 'account') {
      fetchLatestStoreInfo();
    }
  }, [view]);

  const handleSaveOwnerPin = async () => {
    if (String(storeData?.id || '').startsWith('demo-guest-')) {
      alert('체험 모드에서는 PIN 번호 설정이 불가능합니다.\n정식 스토어 개설 후 이용해 주세요!');
      return;
    }
    if (ownerPin.length !== 6 || !/^\d{6}$/.test(ownerPin)) {
      alert('사장 PIN 번호는 숫자 6자리로 입력해 주세요.');
      return;
    }
    setIsSavingPin(true);
    try {
      const res = await fetch('/api/security/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_store_pin',
          storeId: storeData.id,
          pinType: 'owner',
          pin: ownerPin,
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || '저장 실패');

      sessionStorage.setItem(`nao3_store_role_${storeData.id}`, 'owner');
      if (onPinUpdated) onPinUpdated();
      alert('사장 PIN 번호(6자리)가 안전하게 저장되었습니다!\n이제 다음 접속부터는 6자리 번호로 1초 만에 로그인하실 수 있습니다.');
      setOwnerPin('');
      setHasOwnerPin(true);
    } catch (err: any) {
      console.error(err);
      alert('저장 실패: ' + (err.message || '데이터베이스를 확인해주세요.'));
    } finally {
      setIsSavingPin(false);
    }
  };

  const handleSaveStaffPin = async () => {
    if (String(storeData?.id || '').startsWith('demo-guest-')) {
      alert('체험 모드에서는 PIN 번호 설정이 불가능합니다.\n정식 스토어 개설 후 이용해 주세요!');
      return;
    }
    if (staffPin.length !== 6 || !/^\d{6}$/.test(staffPin)) {
      alert('직원 PIN 번호는 숫자 6자리로 입력해 주세요.');
      return;
    }
    setIsSavingPin(true);
    try {
      const res = await fetch('/api/security/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_store_pin',
          storeId: storeData.id,
          pinType: 'staff',
          pin: staffPin,
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || '저장 실패');

      sessionStorage.setItem(`nao3_store_role_${storeData.id}`, 'owner');
      if (onPinUpdated) onPinUpdated();
      alert('직원 PIN 번호(6자리)가 안전하게 저장되었습니다!\n직원이 이 번호로 접속하면 전단지 입력 화면만 열리고 마이메뉴는 숨겨집니다.');
      setStaffPin('');
      setHasStaffPin(true);
    } catch (err: any) {
      console.error(err);
      alert('저장 실패: ' + (err.message || '데이터베이스를 확인해주세요.'));
    } finally {
      setIsSavingPin(false);
    }
  };

  const handleLogout = async () => {
    if (storeData?.id) {
      sessionStorage.removeItem(`nao3_store_role_${storeData.id}`);
    }

    try {
      const res = await fetch(`/api/security/pin?type=store&storeId=${encodeURIComponent(storeData.id)}`);
      const pinStatus = await res.json();
      if ((pinStatus?.hasOwnerPin || pinStatus?.hasStaffPin) && onLockPin) {
        onLockPin();
        return;
      }
    } catch {
      // ignore and fall back to signOut
    }

    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSaveAccount = async () => {
    setIsSavingAccount(true);
    try {
      const { error: dbError } = await supabase
        .from('nao3_stores')
        .update({ owner_name: ownerName })
        .eq('id', storeData.id);

      if (dbError) throw dbError;

      if (newPassword) {
        const { error: authError } = await supabase.auth.updateUser({ password: newPassword });
        if (authError) throw authError;
      }

      if (onStoreUpdate) onStoreUpdate({ owner_name: ownerName });
      alert('계정 정보가 성공적으로 업데이트되었습니다.');
      setNewPassword(''); // reset password field
    } catch (err: any) {
      console.error(err);
      alert('업데이트 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const updatedFields = { phone, address, operating_hours: operatingHours, closed_days: closedDays };
      const [{ error: dbError }, { error: etcError }] = await Promise.all([
        supabase
          .from('nao3_stores')
          .update(updatedFields)
          .eq('id', storeData.id),
        supabase
          .from('nao3_system_settings')
          .upsert([{ setting_key: `STORE_ETC_INFO_${storeData.id}`, setting_value: etcInfo }], { onConflict: 'setting_key' }),
      ]);

      if (dbError) throw dbError;
      if (etcError) throw etcError;

      if (onStoreUpdate) onStoreUpdate({ ...updatedFields, etc_info: etcInfo });
      alert('가게정보 설정이 성공적으로 업데이트되었습니다.');
    } catch (err: any) {
      console.error(err);
      alert('업데이트 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const loadPortOne = () => {
    return new Promise((resolve, reject) => {
      if ((window as any).IMP) {
        resolve((window as any).IMP);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.iamport.kr/v1/iamport.js';
      script.onload = () => resolve((window as any).IMP);
      script.onerror = () => reject(new Error('포트원 결제 모듈을 불러오지 못했습니다.'));
      document.head.appendChild(script);
    });
  };

  const handleSubscribe = async () => {
    try {
      // 1. 기본 포트원(PortOne) KCP 테스트 연동 정보
      let userCode = 'imp67773427';
      let channelKey = 'channel-key-8aa11264-f4ca-4794-8b6e-58bd4a9ed614';

      try {
        const { data } = await supabase.from('nao3_system_settings').select('*');
        if (data) {
          const midRow = data.find((r: any) => r.setting_key === 'pg_mid');
          const keyRow = data.find((r: any) => r.setting_key === 'pg_client_key');
          if (midRow?.setting_value?.startsWith('imp')) userCode = midRow.setting_value;
          if (keyRow?.setting_value?.startsWith('channel-key-')) channelKey = keyRow.setting_value;
        }
      } catch (err) {
        console.warn('DB settings check skipped, using default PortOne keys.');
      }

      // 2. 포트원 SDK 로드 및 초기화
      const IMP = (await loadPortOne()) as any;
      IMP.init(userCode);

      // 3. 결제 요청 정보 구성
      const price = subscriptionPlan === 'annual' ? 178800 : 14900;
      const orderName = subscriptionPlan === 'annual' ? 'NAO3 연간 구독권 (12개월)' : 'NAO3 월간 구독권 (1개월)';
      const merchantUid = `nao3_${storeData.slug}_${Date.now()}`;

      IMP.request_pay(
        {
          channelKey: channelKey,
          pay_method: 'card',
          merchant_uid: merchantUid,
          name: orderName,
          amount: price,
          buyer_email: storeData.email || '',
          buyer_name: ownerName || storeData.owner_name || storeData.store_name || '가맹점주',
          buyer_tel: phone || storeData.phone || '010-0000-0000',
          buyer_addr: address || storeData.address || '',
        },
        async (rsp: any) => {
          if (rsp.success) {
            try {
              const res = await fetch('/api/payment/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  storeId: storeData.id,
                  planType: subscriptionPlan,
                  impUid: rsp.imp_uid,
                  merchantUid: rsp.merchant_uid,
                }),
              });
              const result = await res.json();

              if (!res.ok || !result?.success) {
                throw new Error(result?.error || '결제 반영 중 서버 오류가 발생했습니다.');
              }

              if (onStoreUpdate) {
                onStoreUpdate({
                  subscription_paid: true,
                  expires_at: result.expires_at,
                });
              }

              alert(`결제가 정상적으로 완료되었습니다!\n(${orderName})`);
            } catch (dbErr) {
              console.warn('결제 후 DB 업데이트 경고:', dbErr);
              alert('결제는 성공했으나 상태 반영 중 일부 경고가 발생했습니다.');
            }
          } else {
            alert(`결제에 실패했습니다: ${rsp.error_msg}`);
          }
        }
      );
    } catch (err: any) {
      alert('결제 준비 중 오류가 발생했습니다: ' + err.message);
    }
  };

  const handleRegisterCard = () => {
    alert('카드 등록 기능은 빌링키 발급 연동이 필요합니다. 현재는 즉시 구독 결제만 가능합니다.');
  };

  if (view === 'account') {
    return (
      <div className="min-h-screen bg-[#F9F9F9] pb-24 font-sans animate-fade-in-up">
        {/* Header */}
        <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <button onClick={() => setView('main')} className="text-gray-400 hover:text-[#5F0080] transition-colors p-1 -ml-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">계정 정보 수정</h1>
        </div>

        <div className="p-5 flex flex-col gap-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-5">
            <div>
              <label className="block text-[13px] font-extrabold text-gray-800 mb-1.5">아이디 (이메일)</label>
              <input type="text" value={storeData.email || storeData.slug} disabled className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3.5 py-3 text-[14px] text-gray-500 font-bold cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-[13px] font-extrabold text-gray-800 mb-1.5">이름 (대표자명)</label>
              <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="이름을 입력하세요" className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-3 text-[15px] text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#5F0080] focus:border-transparent transition-all" />
            </div>
            <hr className="my-1 border-gray-100" />
            <div>
              <label className="block text-[13px] font-extrabold text-gray-800 mb-1.5">비밀번호 변경</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="변경할 비밀번호 (기존 유지 시 비워둠)" className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-3 text-[15px] text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#5F0080] focus:border-transparent transition-all placeholder:font-normal placeholder:text-gray-400" />
            </div>
          </div>
          <button onClick={handleSaveAccount} disabled={isSavingAccount} className={`w-full py-4 rounded-xl font-black text-white text-[16px] transition-all shadow-md ${isSavingAccount ? 'bg-gray-400 shadow-none' : 'bg-[#5F0080] hover:bg-[#4A0066] hover:shadow-lg active:scale-[0.98]'}`}>
            {isSavingAccount ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    );
  }

  if (view === 'settings') {
    return (
      <div className="min-h-screen bg-[#F9F9F9] pb-24 font-sans animate-fade-in-up">
        {/* Header */}
        <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <button onClick={() => setView('main')} className="text-gray-400 hover:text-[#5F0080] transition-colors p-1 -ml-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">앱 환경 설정 (가게정보)</h1>
        </div>

        <div className="p-5 flex flex-col gap-5">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-5">
            <div>
              <label className="block text-[13px] font-extrabold text-gray-800 mb-1.5">매장 전화번호</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="연락처 (예: 010-1234-5678)" className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-3 text-[15px] text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#5F0080] focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-extrabold text-gray-800 mb-1.5">매장 주소</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="매장 주소를 입력하세요" className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-3 text-[15px] text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#5F0080] focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-extrabold text-gray-800 mb-1.5">영업시간</label>
              <input type="text" value={operatingHours} onChange={(e) => setOperatingHours(e.target.value)} placeholder="예: 평일 09:00 ~ 21:00" className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-3 text-[15px] text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#5F0080] focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-extrabold text-gray-800 mb-1.5">휴무일</label>
              <input type="text" value={closedDays} onChange={(e) => setClosedDays(e.target.value)} placeholder="예: 매주 일요일 휴무" className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-3 text-[15px] text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#5F0080] focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-extrabold text-gray-800 mb-1.5">기타 안내사항</label>
              <textarea
                rows={3}
                value={etcInfo}
                onChange={(e) => setEtcInfo(e.target.value)}
                placeholder="예: 3만원 이상 무료배달 / 건물 뒤편 전용 주차장 완비 / 지역화폐 사용 가능 등"
                className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-3 text-[15px] text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#5F0080] focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>
          <button onClick={handleSaveSettings} disabled={isSavingSettings} className={`w-full py-4 rounded-xl font-black text-white text-[16px] transition-all shadow-md ${isSavingSettings ? 'bg-gray-400 shadow-none' : 'bg-[#5F0080] hover:bg-[#4A0066] hover:shadow-lg active:scale-[0.98]'}`}>
            {isSavingSettings ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    );
  }

  if (view === 'security') {
    return (
      <div className="min-h-screen bg-[#F9F9F9] pb-24 font-sans animate-fade-in-up">
        {/* Header */}
        <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <button onClick={() => setView('main')} className="text-gray-400 hover:text-[#5F0080] transition-colors p-1 -ml-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">PIN 번호 설정</h1>
        </div>

        <div className="p-5 flex flex-col gap-6">
          <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 text-[13.5px] text-gray-800 leading-relaxed space-y-2.5 shadow-sm">
            <div className="font-black text-[#5F0080] text-[15px] flex items-center gap-1.5">
              <span>💡</span> 매번 아이디/비밀번호 치기 번거로우시죠?
            </div>
            <p className="text-gray-700 break-keep">
              여기서 <strong>숫자 6자리 번호</strong>만 설정해 두시면, 다음부터는 복잡한 이메일과 비밀번호 대신 <strong>숫자 6자리만 눌러 1초 만에 접속</strong>할 수 있습니다!
            </p>
            <div className="bg-white/80 rounded-xl p-3.5 border border-purple-100 space-y-1.5 text-[13px]">
              <p>• <strong>👑 사장 PIN (6자리):</strong> 사장님 본인이 접속할 때 쓰는 번호입니다. <strong>전단지 입력 + 마이메뉴 전체</strong>가 열립니다.</p>
              <p>• <strong>🧑‍💼 직원 PIN (6자리):</strong> 직원에게 내 아이디/비번을 알려주지 마세요! 직원 번호를 만들어 알려주면 직원은 <strong>전단지 입력만 가능</strong>하고 마이메뉴(결제/설정)는 아예 보이지 않습니다.</p>
            </div>
          </div>

          {/* 사장 PIN 설정 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">👑</span>
                <h2 className="text-[16px] font-extrabold text-gray-900">사장 PIN 번호 (6자리)</h2>
              </div>
              {hasOwnerPin ? (
                <span className="text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                  설정 완료
                </span>
              ) : (
                <span className="text-[11px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
                  미설정
                </span>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-bold text-gray-500 mb-1.5">
                {hasOwnerPin ? '새로 변경할 사장 PIN (숫자 6자리)' : '등록할 사장 PIN (숫자 6자리)'}
              </label>
              <input 
                type="password" 
                maxLength={6}
                value={ownerPin} 
                onChange={(e) => setOwnerPin(e.target.value.replace(/[^0-9]/g, ''))} 
                placeholder="숫자 6자리 입력 (예: 123456)" 
                className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-3 text-[16px] tracking-widest font-mono text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#5F0080] focus:border-transparent transition-all" 
              />
            </div>

            <button 
              onClick={handleSaveOwnerPin} 
              disabled={isSavingPin || loadingPin} 
              className="w-full py-3.5 rounded-xl font-black text-white text-[15px] bg-[#5F0080] hover:bg-[#4A0066] disabled:bg-gray-400 transition-all shadow-sm active:scale-[0.98]"
            >
              {isSavingPin ? '저장 중...' : (hasOwnerPin ? '사장 PIN 변경하기' : '사장 PIN 저장하기')}
            </button>
          </div>

          {/* 직원 PIN 설정 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🧑‍💼</span>
                <h2 className="text-[16px] font-extrabold text-gray-900">직원 PIN 번호 (6자리)</h2>
              </div>
              {hasStaffPin ? (
                <span className="text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                  설정 완료
                </span>
              ) : (
                <span className="text-[11px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">
                  미설정
                </span>
              )}
            </div>

            <div>
              <label className="block text-[12px] font-bold text-gray-500 mb-1.5">
                {hasStaffPin ? '새로 변경할 직원 PIN (숫자 6자리)' : '등록할 직원 PIN (숫자 6자리)'}
              </label>
              <input 
                type="password" 
                maxLength={6}
                value={staffPin} 
                onChange={(e) => setStaffPin(e.target.value.replace(/[^0-9]/g, ''))} 
                placeholder="숫자 6자리 입력 (예: 654321)" 
                className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-3 text-[16px] tracking-widest font-mono text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#5F0080] focus:border-transparent transition-all" 
              />
            </div>

            <button 
              onClick={handleSaveStaffPin} 
              disabled={isSavingPin || loadingPin} 
              className="w-full py-3.5 rounded-xl font-black text-white text-[15px] bg-[#1A1A1A] hover:bg-black disabled:bg-gray-400 transition-all shadow-sm active:scale-[0.98]"
            >
              {isSavingPin ? '저장 중...' : (hasStaffPin ? '직원 PIN 변경하기' : '직원 PIN 저장하기')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'subscription') {
    return (
      <div className="min-h-screen bg-[#F9F9F9] pb-24 font-sans animate-fade-in-up">
        {/* Header */}
        <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <button onClick={() => setView('main')} className="text-gray-400 hover:text-[#5F0080] transition-colors p-1 -ml-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">구독 및 결제 관리</h1>
        </div>

        <div className="p-5 flex flex-col gap-5 max-w-2xl mx-auto">

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            {/* 상단 이용권 상태 헤더 */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-lg">💳</span>
                <h3 className="text-[17px] font-black text-gray-900 tracking-tight">나의 이용권 상태</h3>
              </div>
              {storeData?.subscription_paid ? (
                <span className="bg-green-50 text-green-700 border border-green-200 text-[12px] font-extrabold px-3.5 py-1.5 rounded-full">
                  정식 구독 이용 중
                </span>
              ) : (
                <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[12px] font-extrabold px-3.5 py-1.5 rounded-full">
                  현재 무료 체험 중
                </span>
              )}
            </div>

            {/* 이용권 안내 및 요금제 박스 */}
            <div className="bg-[#F8F9FA] rounded-2xl p-5 sm:p-6 border border-gray-100 mb-6">
              <h4 className="text-[17px] font-black text-gray-900 mb-2.5 tracking-tight">NAO3 이용권 안내</h4>
              <div className="text-[13.5px] text-gray-600 leading-relaxed space-y-1 mb-6 break-keep">
                <p>월간 정상 이용 요금은 <strong className="text-gray-900 font-extrabold">월 49,000원</strong>.</p>
                <p>
                  <strong className="text-gray-900 font-extrabold">소상공인 상생 응원가</strong>로{' '}
                  <strong className="text-[#5F0080] font-black">월 14,900원</strong>에 제한 없는 모바일 전단지 생성과 무제한 고객 푸시 알림을 경험해보세요.
                </p>
                <p>매월 나가는 수십만 원의 문자 발송비 부담을 확실하게 덜어드립니다.</p>
              </div>

              {/* 요금제 선택 (1개월 이용권 단독 노출) */}
              <div className="flex flex-col gap-4">

                {/* 1. 월간 결제 (1개월 이용권) */}
                <label
                  className={`relative overflow-hidden bg-white flex flex-col border-2 rounded-2xl p-5 cursor-pointer transition-all ${
                    subscriptionPlan === 'monthly'
                      ? 'border-[#4F46E5] ring-2 ring-[#4F46E5]/15 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 shadow-sm'
                  }`}
                >
                  {/* 우측 상단 배지 */}
                  <div className="absolute top-0 right-0 bg-[#4F46E5] text-white text-[11px] font-extrabold px-3.5 py-1.5 rounded-bl-xl">
                    소상공인 상생 응원가
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="plan"
                      value="monthly"
                      checked={subscriptionPlan === 'monthly'}
                      onChange={() => setSubscriptionPlan('monthly')}
                      className="text-[#4F46E5] focus:ring-[#4F46E5] w-4 h-4 mt-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-gray-800 text-[15px] mb-1.5">월간 이용권 (1개월)</p>
                      <div className="flex items-baseline gap-2 flex-wrap mb-2">
                        <span className="font-black text-gray-900 text-[28px] sm:text-[30px] leading-none tracking-tight">
                          14,900<span className="text-[16px] font-extrabold ml-0.5">원</span>
                        </span>
                        <span className="text-[15px] text-gray-400 font-bold line-through">49,000원</span>
                      </div>
                      <p className="text-[13px] font-extrabold text-[#4F46E5] mb-1">
                        소상공인 상생 응원가 (정가 대비 약 70% 할인)
                      </p>
                      <p className="text-[12px] text-gray-500 font-medium">
                        1개월 이용권이 단독 결제됩니다. (서비스 제공기간: 결제일로부터 1개월 / 언제든 해지 가능)
                      </p>
                    </div>
                  </div>
                </label>

              </div>
            </div>

            <button onClick={handleSubscribe} className="w-full bg-[#5F0080] text-white font-black py-4 rounded-xl shadow-md hover:bg-purple-900 transition-colors text-[16px]">
              구독하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'guide') {
    return (
      <div className="min-h-screen bg-[#F9F9F9] pb-24 font-sans animate-fade-in-up">
        {/* Header */}
        <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setView('main')} className="text-gray-400 hover:text-gray-800 transition-colors p-1 -ml-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">1분 이용 가이드</h1>
        </div>

        <div className="p-5 space-y-6 max-w-lg mx-auto">
          
          {/* 1. 핵심 기능 요약 */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 border-t-4 border-t-purple-500 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-4xl opacity-20">💡</div>
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-purple-600">핵심 기능 요약</span>
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                <p className="text-gray-700 text-[14px] leading-relaxed break-keep font-medium">
                  <strong>오늘의 사장님 이야기</strong><br/>
                  사장님의 생생한 멘트를 단독으로 즉시 반영할 수 있습니다!
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 shrink-0"></div>
                <p className="text-gray-700 text-[14px] leading-relaxed break-keep font-medium">
                  <strong>오늘의 특가</strong><br/>
                  모바일에서 찍은 신선한 제철 상품 사진을 바로 업로드하여 고객들 시선을 확 사로잡으세요!
                </p>
              </div>
            </div>
          </div>

          {/* 2. 1초 컷 등록 팁 */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 border-t-4 border-t-blue-500 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-4xl opacity-20">⚡</div>
            <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">1초 컷! 초스피드 등록 팁</span>
            </h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <strong className="text-gray-900 text-[15px] flex items-center gap-2 mb-1">
                  🔍 초성 검색 (업무시간 단축!)
                </strong>
                <p className="text-gray-500 text-[13px] break-keep leading-snug">
                  바쁜데 언제 다 치나요? 'ㅎㅇ'만 쳐도 '한우'가 쏙 나옵니다.<br/>
                  <strong>등급, 원산지, 중량까지</strong> 전부 자동으로 세팅되니 일일이 손으로 칠 필요가 없습니다!
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <strong className="text-gray-900 text-[15px] flex items-center gap-2 mb-1">
                  🏷️ 할인율 뱃지
                </strong>
                <p className="text-gray-500 text-[13px] break-keep leading-snug">
                  할인율 칸에 적은 숫자는 가격에 자동 계산되는 게 아닙니다. 고객 시선을 확 끄는 <strong>매력적인 '할인 뱃지'</strong>로 예쁘게 활용하세요!
                </p>
              </div>
            </div>
          </div>

          {/* 3. 스마트 전단지 실전 관리 */}
          <div className="bg-gradient-to-b from-gray-900 to-gray-800 rounded-3xl p-6 shadow-md border border-gray-700 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-4xl opacity-20">🚀</div>
            <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2">
              <span className="text-yellow-400">스마트 전단지 실전 관리</span>
            </h2>
            
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-8 h-8 shrink-0 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center font-black text-sm">🔄</div>
                <div>
                  <h3 className="text-white font-bold text-[15px] mb-1">스마트 덮어쓰기 & 추가</h3>
                  <p className="text-gray-400 text-[13px] leading-relaxed break-keep">
                    이미 전단지에 올렸는데, 수정하고 싶다면?<br/>
                    같은 날짜에 <strong>'같은 상품'</strong>을 추가하면 똑똑하게 <strong>'덮어쓰기'</strong>가 됩니다. 만약 <strong>'다른 상품'</strong>을 추가하면 기존 목록 밑에 자연스럽게 <strong>'추가'</strong>됩니다.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 shrink-0 bg-yellow-400 text-yellow-900 rounded-full flex items-center justify-center font-black text-sm">🚫</div>
                <div>
                  <h3 className="text-white font-bold text-[15px] mb-1">실시간 품절 처리</h3>
                  <p className="text-gray-400 text-[13px] leading-relaxed break-keep">
                    물건이 다 팔렸나요? 상품 목록에서 <strong>품절</strong> 버튼만 누르면 언제든 고객 전단지에도 즉시! 품절로 뜹니다. 전화받을 일이 확 줄어들어요!
                  </p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    );
  }

  if (view === 'qr') {
    const baseOrigin = typeof window !== 'undefined'
      ? (window.location.hostname.includes('vercel.app') ? 'https://www.nao3.kr' : window.location.origin)
      : 'https://www.nao3.kr';
    const customerLink = `${baseOrigin}/store/${storeData.slug}/sale`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&margin=10&data=${encodeURIComponent(customerLink)}`;
    const storeTitle = storeData.store_name || '우리 매장';

    const copyLink = () => {
      navigator.clipboard.writeText(customerLink).then(() => {
        alert('링크가 복사되었습니다!\n문자메시지나 카카오톡에 붙여넣어 홍보하세요.');
      }).catch(() => {
        alert('링크 복사에 실패했습니다.');
      });
    };

    const drawRoundedRect = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      w: number,
      h: number,
      r: number | { tl: number; tr: number; br: number; bl: number }
    ) => {
      const radii = typeof r === 'number' ? { tl: r, tr: r, br: r, bl: r } : r;
      ctx.beginPath();
      ctx.moveTo(x + radii.tl, y);
      ctx.lineTo(x + w - radii.tr, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radii.tr);
      ctx.lineTo(x + w, y + h - radii.br);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radii.br, y + h);
      ctx.lineTo(x + radii.bl, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radii.bl);
      ctx.lineTo(x, y + radii.tl);
      ctx.quadraticCurveTo(x, y, x + radii.tl, y);
      ctx.closePath();
    };

    const buildPosterCanvas = async (): Promise<HTMLCanvasElement> => {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const objUrl = window.URL.createObjectURL(blob);

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              window.URL.revokeObjectURL(objUrl);
              reject(new Error('Canvas context unavailable'));
              return;
            }

            // A4 Portrait High-Res Ratio (1240 x 1754 px)
            const W = 1240;
            const H = 1754;
            canvas.width = W;
            canvas.height = H;

            const fontStack = '"Pretendard", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif';

            // 1. Base White Background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, W, H);

            // 2. Outer Card Frame
            drawRoundedRect(ctx, 36, 36, W - 72, H - 72, 40);
            ctx.fillStyle = '#FDF8FB';
            ctx.fill();

            // 3. Top Header Banner (Deep Brand Purple -> Plum Rose Gradient)
            const headerGrad = ctx.createLinearGradient(36, 36, W - 36, 340);
            headerGrad.addColorStop(0, '#4A0066');
            headerGrad.addColorStop(0.55, '#5F0080');
            headerGrad.addColorStop(1, '#8F1156');
            drawRoundedRect(ctx, 36, 36, W - 72, 304, { tl: 40, tr: 40, br: 0, bl: 0 });
            ctx.fillStyle = headerGrad;
            ctx.fill();

            // Top Gold Badge inside Header
            drawRoundedRect(ctx, (W - 560) / 2, 76, 560, 56, 28);
            ctx.fillStyle = '#FFD700';
            ctx.fill();
            ctx.fillStyle = '#3B0054';
            ctx.font = `900 28px ${fontStack}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('📢 단골 고객님 전용 모바일 특가 안내', W / 2, 105);

            // Store Name in Header
            const nameFontSize = storeTitle.length > 12 ? 62 : storeTitle.length > 8 ? 74 : 86;
            ctx.fillStyle = '#FFFFFF';
            ctx.font = `900 ${nameFontSize}px ${fontStack}`;
            ctx.fillText(storeTitle, W / 2, 206);

            // Subtitle in Header
            ctx.fillStyle = '#FFE4F2';
            ctx.font = `700 35px ${fontStack}`;
            ctx.fillText('실시간 깜짝 세일 · 오늘의 득템 소식지', W / 2, 286);

            // 4. Main Hook Copy
            ctx.fillStyle = '#374151';
            ctx.font = `800 36px ${fontStack}`;
            ctx.fillText('장보러 오시기 전, 오늘 뭐가 싼지 궁금하셨죠?', W / 2, 405);

            ctx.fillStyle = '#B81D5C';
            ctx.font = `900 43px ${fontStack}`;
            ctx.fillText('QR 찍고 [홈 화면에 추가]하면 특가 찬스를 놓치지 않습니다!', W / 2, 468);

            // 5. Three Key Benefit Cards
            const cards = [
              {
                x: 84,
                bg: '#FAF5FF',
                border: '#D8B4FE',
                titleColor: '#5F0080',
                title: '🙅‍♂️ 회원가입 없음',
                line1: '이름 · 전화번호 등',
                line2: '개인정보 입력 0%',
              },
              {
                x: 454,
                bg: '#FFF0F6',
                border: '#F9A8D4',
                titleColor: '#B81D5C',
                title: '⚡ 앱 설치 필요 없음',
                line1: '카메라로 비추기만 하면',
                line2: '1초 만에 전단지 열림',
              },
              {
                x: 824,
                bg: '#FEFCE8',
                border: '#FDE047',
                titleColor: '#B45309',
                title: '🔔 실시간 득템 알림',
                line1: '갑자기 뜨는 폭탄 세일 ·',
                line2: '품절 소식 가장 먼저 확인',
              },
            ];

            cards.forEach((c) => {
              drawRoundedRect(ctx, c.x, 525, 332, 200, 26);
              ctx.fillStyle = c.bg;
              ctx.fill();
              ctx.lineWidth = 3;
              ctx.strokeStyle = c.border;
              ctx.stroke();

              ctx.fillStyle = c.titleColor;
              ctx.font = `900 31px ${fontStack}`;
              ctx.fillText(c.title, c.x + 166, 578);

              ctx.fillStyle = '#1F2937';
              ctx.font = `700 26px ${fontStack}`;
              ctx.fillText(c.line1, c.x + 166, 636);
              ctx.fillText(c.line2, c.x + 166, 676);
            });

            // 6. Central QR Code Frame
            const qrBoxX = 270;
            const qrBoxY = 760;
            const qrBoxW = 700;
            const qrBoxH = 525;

            ctx.save();
            ctx.shadowColor = 'rgba(95, 0, 128, 0.12)';
            ctx.shadowBlur = 24;
            ctx.shadowOffsetY = 8;
            drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, 36);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.restore();

            drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxW, qrBoxH, 36);
            ctx.lineWidth = 5;
            ctx.strokeStyle = '#5F0080';
            ctx.stroke();

            // QR Box Top Bar
            drawRoundedRect(ctx, qrBoxX, qrBoxY, qrBoxW, 82, { tl: 33, tr: 33, br: 0, bl: 0 });
            ctx.fillStyle = '#5F0080';
            ctx.fill();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = `900 33px ${fontStack}`;
            ctx.fillText('📱 지금 스마트폰 [카메라]로 비춰보세요!', W / 2, qrBoxY + 43);

            // Draw QR Image
            const qrSize = 400;
            ctx.drawImage(img, (W - qrSize) / 2, qrBoxY + 102, qrSize, qrSize);

            // 7. Step-by-Step 3-Second Guide Box
            const stepBoxX = 84;
            const stepBoxY = 1320;
            const stepBoxW = W - 168;
            const stepBoxH = 315;

            drawRoundedRect(ctx, stepBoxX, stepBoxY, stepBoxW, stepBoxH, 28);
            ctx.fillStyle = '#FFFFFF';
            ctx.fill();
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#E5E7EB';
            ctx.stroke();

            ctx.fillStyle = '#111827';
            ctx.font = `900 33px ${fontStack}`;
            ctx.textAlign = 'center';
            ctx.fillText('👇 딱 3초! 단골 등록하고 특가 알림 받는 방법', W / 2, stepBoxY + 52);

            const steps = [
              {
                num: '1',
                badgeBg: '#5F0080',
                text: '스마트폰 기본 [카메라]를 켜고 위 QR코드를 비춰 뜨는 주소를 터치하세요.',
                textColor: '#1F2937',
                weight: '700',
              },
              {
                num: '2',
                badgeBg: '#B81D5C',
                text: '전단지 화면 맨 위의 [홈 화면에 추가 (세일 소식 받기)] 버튼을 꼭 눌러주세요!',
                textColor: '#B81D5C',
                weight: '900',
              },
              {
                num: '3',
                badgeBg: '#5F0080',
                text: '휴대폰 화면에 생긴 우리 매장 아이콘으로 매일 깜짝 특가·품절 소식을 받아보세요!',
                textColor: '#1F2937',
                weight: '700',
              },
            ];

            steps.forEach((st, idx) => {
              const rowY = stepBoxY + 118 + idx * 72;
              const circleX = stepBoxX + 58;

              ctx.beginPath();
              ctx.arc(circleX, rowY, 22, 0, Math.PI * 2);
              ctx.fillStyle = st.badgeBg;
              ctx.fill();

              ctx.fillStyle = '#FFFFFF';
              ctx.font = `900 25px ${fontStack}`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(st.num, circleX, rowY + 1);

              ctx.fillStyle = st.textColor;
              ctx.font = `${st.weight} 27px ${fontStack}`;
              ctx.textAlign = 'left';
              ctx.fillText(st.text, circleX + 38, rowY + 1);
            });

            // 8. Footer Text & Outer Frame Border
            ctx.textAlign = 'center';
            ctx.fillStyle = '#6B7280';
            ctx.font = `700 25px ${fontStack}`;
            ctx.fillText(`언제나 신선하고 정직한 상품으로 보답하겠습니다 · ${storeTitle}`, W / 2, 1676);

            drawRoundedRect(ctx, 36, 36, W - 72, H - 72, 40);
            ctx.lineWidth = 6;
            ctx.strokeStyle = '#5F0080';
            ctx.stroke();

            window.URL.revokeObjectURL(objUrl);
            resolve(canvas);
          } catch (e) {
            window.URL.revokeObjectURL(objUrl);
            reject(e);
          }
        };
        img.onerror = (err) => {
          window.URL.revokeObjectURL(objUrl);
          reject(err);
        };
        img.src = objUrl;
      });
    };

    const downloadPoster = async () => {
      try {
        const canvas = await buildPosterCanvas();
        canvas.toBlob((outBlob) => {
          if (!outBlob) return;
          const finalUrl = window.URL.createObjectURL(outBlob);
          const link = document.createElement('a');
          link.href = finalUrl;
          link.download = `${storeTitle}_단골모집_홍보포스터_A4.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(finalUrl);
        }, 'image/png');
      } catch (err) {
        alert('포스터 이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    };

    const printPoster = async (mode: 'a4-full' | 'a4-half') => {
      try {
        const canvas = await buildPosterCanvas();
        const dataUrl = canvas.toDataURL('image/png');
        const printWin = window.open('', '_blank', 'width=900,height=1000');
        if (!printWin) {
          alert('팝업 차단이 설정되어 있습니다. 브라우저 주소창에서 팝업을 허용해 주세요.');
          return;
        }

        const htmlContent = mode === 'a4-full'
          ? `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${storeTitle} - A4 홍보 포스터 인쇄</title>
  <style>
    @page { size: A4 portrait; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 210mm; height: 297mm; background: #fff; display: flex; align-items: center; justify-content: center; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    img { width: 210mm; height: 297mm; object-fit: contain; display: block; }
  </style>
</head>
<body>
  <img src="${dataUrl}" onload="setTimeout(function(){ window.focus(); window.print(); }, 250);" />
</body>
</html>`
          : `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${storeTitle} - A4 반절(2장) 홍보 안내문 인쇄</title>
  <style>
    @page { size: A4 landscape; margin: 0; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 297mm; height: 210mm; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .sheet { width: 297mm; height: 210mm; display: flex; align-items: center; justify-content: space-between; position: relative; padding: 4mm; }
    .half { width: 142mm; height: 202mm; display: flex; align-items: center; justify-content: center; }
    .half img { width: 100%; height: 100%; object-fit: contain; display: block; }
    .cutline { position: absolute; left: 50%; top: 0; bottom: 0; border-left: 2px dashed #9CA3AF; transform: translateX(-50%); display: flex; align-items: center; justify-content: center; }
    .cut-badge { background: #fff; color: #6B7280; font-family: sans-serif; font-size: 11px; font-weight: bold; padding: 6px 4px; writing-mode: vertical-rl; letter-spacing: 2px; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="half"><img src="${dataUrl}" /></div>
    <div class="cutline"><span class="cut-badge">✂️ 반으로 잘라서 계산대와 입구에 각각 붙여두세요</span></div>
    <div class="half"><img src="${dataUrl}" onload="setTimeout(function(){ window.focus(); window.print(); }, 250);" /></div>
  </div>
</body>
</html>`;

        printWin.document.open();
        printWin.document.write(htmlContent);
        printWin.document.close();
      } catch (err) {
        alert('인쇄 준비에 실패했습니다. 포스터 이미지를 다운로드하여 인쇄해주세요.');
      }
    };

    const downloadRawQR = async () => {
      try {
        const response = await fetch(qrImageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          const size = 1024;
          const padding = 120;
          const textHeight = 200;
          
          canvas.width = size + (padding * 2);
          canvas.height = size + (padding * 2) + textHeight;
          
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.drawImage(img, padding, padding, size, size);
          
          ctx.fillStyle = '#1A1A1A';
          ctx.font = '900 100px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(storeTitle, canvas.width / 2, canvas.height - (padding + textHeight / 2) + 50);
          
          ctx.fillStyle = '#5F0080';
          ctx.font = 'bold 50px sans-serif';
          ctx.fillText('스마트폰 카메라로 스캔해 보세요!', canvas.width / 2, padding / 2 + 20);

          canvas.toBlob((outBlob) => {
            if (!outBlob) return;
            const finalUrl = window.URL.createObjectURL(outBlob);
            const link = document.createElement('a');
            link.href = finalUrl;
            link.download = `${storeTitle}_QR코드_단독.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(finalUrl);
            window.URL.revokeObjectURL(url);
          }, 'image/png');
        };
        img.src = url;
      } catch (err) {
        alert('QR코드 생성에 실패했습니다.');
      }
    };

    return (
      <div className="min-h-screen bg-[#F9F9F9] pb-24 font-sans animate-fade-in-up">
        {/* Header */}
        <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setView('main')} className="text-gray-400 hover:text-gray-800 transition-colors p-1 -ml-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">고객 홍보 (링크 & 인쇄용 QR 포스터)</h1>
        </div>

        <div className="p-4 sm:p-5 space-y-6 max-w-lg mx-auto">
          
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-black text-gray-900 mb-1.5">🔗 우리 매장 전용 링크</h2>
            <p className="text-[13px] text-gray-500 mb-4 break-keep">
              고객들에게 문자나 카카오톡으로 발송할 수 있는 우리 매장만의 고유 주소입니다.
            </p>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                readOnly 
                value={customerLink} 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 text-sm text-gray-700 outline-none"
              />
              <button 
                onClick={copyLink}
                className="shrink-0 bg-gray-900 text-white font-bold px-4 rounded-xl hover:bg-black transition-colors text-sm"
              >
                링크 복사
              </button>
            </div>
          </div>

          {/* Ready-to-Print Store POP Poster Section */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-100">
            <div className="mb-4">
              <span className="inline-block bg-purple-100 text-[#5F0080] text-[12px] font-black px-3 py-1 rounded-full mb-2">
                🖨️ 사장님 맞춤형 인쇄 서비스
              </span>
              <h2 className="text-[19px] font-black text-gray-900 mb-1.5 break-keep">
                매장 부착용 단골 모집 안내문 (A4 / A4 반절)
              </h2>
              <p className="text-[13.5px] text-gray-500 leading-relaxed break-keep">
                손님들에게 일일이 설명하실 필요 없도록 <strong className="text-gray-800">상호명·회원가입 불필요·홈화면 추가 방법</strong>을 모두 적어두었습니다. 그대로 인쇄해서 계산대와 입구에 붙여두세요!
              </p>
            </div>

            {/* Live Visual Preview of the Printable A4 Poster */}
            <div className="rounded-2xl border-[3px] border-[#5F0080] bg-[#FDF8FB] overflow-hidden shadow-md mb-6">
              {/* Poster Header */}
              <div className="bg-gradient-to-r from-[#4A0066] via-[#5F0080] to-[#8F1156] px-4 py-5 text-center text-white">
                <div className="inline-block bg-[#FFD700] text-[#3B0054] text-[11px] sm:text-[12px] font-black px-3 py-1 rounded-full mb-2 shadow-sm">
                  📢 단골 고객님 전용 모바일 특가 안내
                </div>
                <div className="text-[24px] sm:text-[28px] font-black tracking-tight leading-tight mb-1 break-keep">
                  {storeTitle}
                </div>
                <div className="text-[13px] sm:text-[14px] font-bold text-[#FFE4F2]">
                  실시간 깜짝 세일 · 오늘의 득템 소식지
                </div>
              </div>

              {/* Poster Body */}
              <div className="p-4 sm:p-5 text-center space-y-4">
                <div className="space-y-1">
                  <p className="text-[13px] sm:text-[14px] font-extrabold text-gray-700 break-keep">
                    장보러 오시기 전, 오늘 뭐가 싼지 궁금하셨죠?
                  </p>
                  <p className="text-[15px] sm:text-[16.5px] font-black text-[#B81D5C] leading-snug break-keep">
                    QR 찍고 [홈 화면에 추가]하면 특가 찬스를 놓치지 않습니다!
                  </p>
                </div>

                {/* 3 Key Benefits */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#FAF5FF] border border-purple-200 rounded-xl p-2.5">
                    <div className="text-[12px] sm:text-[13px] font-black text-[#5F0080] mb-1 break-keep">🙅‍♂️ 회원가입 없음</div>
                    <div className="text-[10.5px] sm:text-[11.5px] font-bold text-gray-700 leading-tight break-keep">
                      이름·전화번호 등<br />개인정보 입력 0%
                    </div>
                  </div>
                  <div className="bg-[#FFF0F6] border border-pink-200 rounded-xl p-2.5">
                    <div className="text-[12px] sm:text-[13px] font-black text-[#B81D5C] mb-1 break-keep">⚡ 앱 설치 없음</div>
                    <div className="text-[10.5px] sm:text-[11.5px] font-bold text-gray-700 leading-tight break-keep">
                      카메라로 비추면<br />1초 만에 전단지 열림
                    </div>
                  </div>
                  <div className="bg-[#FEFCE8] border border-yellow-300 rounded-xl p-2.5">
                    <div className="text-[12px] sm:text-[13px] font-black text-amber-700 mb-1 break-keep">🔔 실시간 득템</div>
                    <div className="text-[10.5px] sm:text-[11.5px] font-bold text-gray-700 leading-tight break-keep">
                      폭탄 세일·품절 소식<br />가장 먼저 확인
                    </div>
                  </div>
                </div>

                {/* Central QR Box */}
                <div className="max-w-[240px] mx-auto rounded-2xl border-[3px] border-[#5F0080] bg-white overflow-hidden shadow-sm">
                  <div className="bg-[#5F0080] text-white text-[12px] font-black py-2 px-2">
                    📱 스마트폰 [카메라]로 비춰보세요!
                  </div>
                  <div className="p-3 bg-white">
                    <img src={qrImageUrl} alt="Store QR Code" className="w-40 h-40 mx-auto object-contain" />
                  </div>
                </div>

                {/* 3-Step Guide */}
                <div className="bg-white border border-gray-200 rounded-2xl p-3.5 text-left space-y-2">
                  <div className="text-center text-[13px] font-black text-gray-900 mb-2">
                    👇 딱 3초! 단골 등록하고 특가 알림 받는 방법
                  </div>
                  <div className="flex items-start gap-2 text-[12px] text-gray-800 font-bold leading-snug">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-[#5F0080] text-white text-[11px] font-black flex items-center justify-center mt-0.5">1</span>
                    <span>스마트폰 기본 <strong>[카메라]</strong>를 켜고 위 QR코드를 비춰 뜨는 주소를 터치하세요.</span>
                  </div>
                  <div className="flex items-start gap-2 text-[12px] text-[#B81D5C] font-black leading-snug">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-[#B81D5C] text-white text-[11px] font-black flex items-center justify-center mt-0.5">2</span>
                    <span>전단지 화면 맨 위의 <strong>[홈 화면에 추가 (세일 소식 받기)]</strong> 버튼을 꼭 눌러주세요!</span>
                  </div>
                  <div className="flex items-start gap-2 text-[12px] text-gray-800 font-bold leading-snug">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-[#5F0080] text-white text-[11px] font-black flex items-center justify-center mt-0.5">3</span>
                    <span>휴대폰 화면에 생긴 <strong>우리 매장 아이콘</strong>으로 매일 깜짝 특가 소식을 받아보세요!</span>
                  </div>
                </div>

                <div className="text-[11px] font-bold text-gray-400 pt-1">
                  언제나 신선하고 정직한 상품으로 보답하겠습니다 · {storeTitle}
                </div>
              </div>
            </div>

            {/* Action Buttons for Store Owners */}
            <div className="space-y-3">
              <button 
                onClick={downloadPoster}
                className="w-full bg-[#5F0080] text-white font-black py-4 px-4 rounded-2xl shadow-md hover:bg-purple-900 transition-colors text-[16px] flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>홍보 안내문 이미지 다운로드 (A4 비율)</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button 
                  onClick={() => printPoster('a4-full')}
                  className="w-full bg-gray-900 text-white font-black py-3.5 px-3 rounded-2xl hover:bg-black transition-colors text-[14px] flex flex-col items-center justify-center gap-0.5 shadow-sm"
                >
                  <span className="flex items-center gap-1.5">🖨️ A4 1장 꽉 차게 바로 인쇄</span>
                  <span className="text-[11px] font-medium text-gray-300">(출입문 · 벽면 부착용 큰 사이즈)</span>
                </button>

                <button 
                  onClick={() => printPoster('a4-half')}
                  className="w-full bg-[#B81D5C] text-white font-black py-3.5 px-3 rounded-2xl hover:bg-[#96154A] transition-colors text-[14px] flex flex-col items-center justify-center gap-0.5 shadow-sm"
                >
                  <span className="flex items-center gap-1.5">✂️ A4 반절 크기(2장) 바로 인쇄</span>
                  <span className="text-[11px] font-medium text-pink-100">(반으로 잘라 계산대 · 매대 비치용)</span>
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  onClick={downloadRawQR}
                  className="text-[12.5px] font-bold text-gray-400 hover:text-gray-700 underline underline-offset-4 transition-colors py-1"
                >
                  안내 문구 없이 QR 코드만 단독으로 다운로드하기
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (view === 'inquiry') {
    return <InquiryView storeData={storeData} setView={setView} />;
  }

  if (view === 'notices') {
    return (
      <div className="min-h-screen bg-[#F9F9F9] pb-24 font-sans animate-fade-in-up">
        {/* Header */}
        <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center gap-3">
          <button onClick={() => setView('main')} className="text-gray-400 hover:text-gray-800 transition-colors p-1 -ml-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">본사 공지사항</h1>
        </div>

        <div className="p-4">
          {loadingNotices ? (
            <div className="text-center py-10 text-gray-400 font-bold">불러오는 중...</div>
          ) : hqNotices.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm mt-2">
              <span className="text-gray-400 text-[14px] font-bold">등록된 공지사항이 없습니다.</span>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-2">
              <ul className="divide-y divide-gray-100">
                {hqNotices.map((notice, idx) => (
                  <li key={notice.id} className="flex flex-col">
                    <button 
                      onClick={() => setExpandedNoticeId(expandedNoticeId === notice.id ? null : notice.id)}
                      className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-[#5F0080] font-black text-[13px] shrink-0 w-4">
                          {hqNotices.length - idx}
                        </span>
                        <span className="text-[15px] font-bold text-gray-900 truncate">
                          {notice.title}
                        </span>
                      </div>
                      <span className={`text-gray-400 text-xs transition-transform shrink-0 ${expandedNoticeId === notice.id ? 'rotate-180' : ''}`}>
                        ▼
                      </span>
                    </button>
                    {expandedNoticeId === notice.id && (
                      <div className="px-5 py-6 bg-gray-50 border-t border-gray-100 text-[14px] text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                        {notice.content}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main MyMenu View
  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24 font-sans animate-fade-in-up">
      {/* Header */}
      <div className="bg-white px-5 py-8 border-b border-gray-100">
        <h1 className="text-[26px] font-extrabold text-gray-900 mb-1.5 tracking-tight">마이 메뉴</h1>
        <p className="text-[14px] text-gray-500 font-medium tracking-tight">
          계정 정보 및 설정을 관리하세요.
        </p>
      </div>

      <div className="p-4 flex flex-col gap-5 mt-2">
        {/* 계정 정보 카드 */}
        <button 
          onClick={() => setView('account')}
          className="w-full bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm border border-gray-100 border-l-4 border-l-[#5F0080] text-left hover:bg-purple-50/50 transition-colors"
        >
          <div>
            <h3 className="font-extrabold text-gray-900 text-[16px] mb-1">계정 정보</h3>
            <p className="text-[13px] text-gray-500 font-medium">관리자 아이디 및 비밀번호 변경</p>
          </div>
          <span className="text-gray-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </span>
        </button>

        {/* 구독 및 결제 관리 카드 */}
        <button 
          onClick={() => setView('subscription')}
          className="w-full bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm border border-gray-100 border-l-4 border-l-[#5F0080] text-left hover:bg-purple-50/50 transition-colors"
        >
          <div>
            <h3 className="font-extrabold text-gray-900 text-[16px] mb-1">구독 및 결제 관리</h3>
            <p className="text-[13px] text-gray-500 font-medium">이용권 상태, 카드 변경, 결제 내역</p>
          </div>
          <span className="text-gray-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </span>
        </button>

        {/* 설정 카드 */}
        <button 
          onClick={() => setView('settings')}
          className="w-full bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm border border-gray-100 border-l-4 border-l-[#5F0080] text-left hover:bg-purple-50/50 transition-colors"
        >
          <div>
            <h3 className="font-extrabold text-gray-900 text-[16px] mb-1">설정</h3>
            <p className="text-[13px] text-gray-500 font-medium">가게 정보(영업시간, 주소 등) 관리</p>
          </div>
          <span className="text-gray-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </span>
        </button>

        {/* PIN 번호 설정 카드 */}
        <button 
          onClick={() => setView('security')}
          className="w-full bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm border border-gray-100 border-l-4 border-l-blue-600 text-left hover:bg-blue-50/50 transition-colors"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-extrabold text-gray-900 text-[16px]">PIN 번호 설정</h3>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                보안
              </span>
            </div>
            <p className="text-[13px] text-gray-500 font-medium">사장 PIN 6자리 / 직원 PIN 6자리 관리</p>
          </div>
          <span className="text-gray-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </span>
        </button>

        {/* QR 홍보 카드 */}
        <button 
          onClick={() => setView('qr')}
          className="w-full bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm border border-gray-100 border-l-4 border-l-pink-500 text-left hover:bg-pink-50/50 transition-colors"
        >
          <div>
            <h3 className="font-extrabold text-gray-900 text-[16px] mb-1">고객 홍보 (링크 & 인쇄용 QR 포스터)</h3>
            <p className="text-[13px] text-gray-500 font-medium">전용 링크 복사 및 매장 부착용 A4 · 반절 홍보문 인쇄</p>
          </div>
          <span className="text-gray-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </span>
        </button>

        {/* 고객 서비스 리스트 */}
        <div className="mt-2">
          <h4 className="text-[16px] font-black text-black mb-3 px-1 tracking-tight">고객 서비스</h4>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <button onClick={() => setView('guide')} className="w-full flex items-center justify-between p-5 border-b border-gray-50 text-left hover:bg-gray-50 transition-colors">
              <span className="text-[15px] font-bold text-gray-800">이용 가이드</span>
              <span className="text-gray-300"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></span>
            </button>
            <button onClick={() => setView('inquiry')} className="w-full flex items-center justify-between p-5 border-b border-gray-50 text-left hover:bg-gray-50 transition-colors group">
              <span className="text-[15px] font-bold text-gray-800 flex items-center gap-2 group-hover:text-blue-600 transition-colors">1:1 문의</span>
              <span className="text-gray-300 group-hover:text-blue-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></span>
            </button>
            <button onClick={() => setView('notices')} className="w-full flex items-center justify-between p-5 border-b border-gray-50 text-left hover:bg-gray-50 transition-colors group">
              <span className="text-[15px] font-bold text-gray-800 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                본사 공지사항 <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">N</span>
              </span>
              <span className="text-gray-300 group-hover:text-blue-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></span>
            </button>
            <button onClick={handleLogout} className="w-full flex items-center justify-between p-5 text-left hover:bg-red-50 transition-colors group">
              <span className="text-[15px] font-extrabold text-red-500 group-hover:text-red-600">로그아웃</span>
              <span className="text-gray-300 group-hover:text-red-400"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></span>
            </button>
          </div>
        </div>
        
        {/* App Version Info */}
        <div className="text-center mt-8 mb-4 flex flex-col items-center gap-4">
          <span className="text-[12px] text-gray-400 font-bold tracking-widest">NAO3 v1.0.0</span>
          <button 
            onClick={() => {
              if (confirm('정말로 회원 탈퇴를 진행하시겠습니까?\n탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.')) {
                alert('탈퇴 요청이 접수되었습니다. 본사 확인 후 순차적으로 처리됩니다.');
              }
            }}
            className="text-[13px] font-bold text-gray-500 hover:text-red-500 underline underline-offset-4 transition-colors"
          >
            서비스 탈퇴하기
          </button>
        </div>

      </div>
    </div>
  );
}

function InquiryView({ storeData, setView }: { storeData: any, setView: any }) {
  const [content, setContent] = useState('');
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('nao3_inquiries')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setInquiries(data);
      }
    } catch (err) {
      console.warn('1:1 문의 내역을 불러오지 못했습니다.', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!content.trim()) return alert('문의 내용을 입력해주세요.');
    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('nao3_inquiries')
        .insert([{
          store_id: storeData.id,
          store_name: storeData.store_name,
          content: content.trim(),
          status: '답변대기'
        }]);

      if (error) throw error;
      
      alert('성공적으로 접수되었습니다. 본사 확인 후 순차적으로 답변해 드립니다.');
      setContent('');
      fetchInquiries();
    } catch (err) {
      console.error(err);
      alert('접수 실패: 데이터베이스(nao3_inquiries) 테이블을 확인해주세요.\n(임시로 화면에 추가됩니다.)');
      setInquiries([{ id: Date.now(), content, status: '답변대기', created_at: new Date().toISOString() }, ...inquiries]);
      setContent('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24 font-sans animate-fade-in-up">
      {/* Header */}
      <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => setView('main')} className="text-gray-400 hover:text-gray-800 transition-colors p-1 -ml-1">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">1:1 문의</h1>
      </div>

      <div className="p-5 space-y-6 max-w-lg mx-auto">
        
        {/* 새 문의 작성 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-black text-gray-900 mb-2">무엇을 도와드릴까요?</h2>
          <p className="text-[13px] text-gray-500 mb-4 break-keep">
            이용 중 불편한 점이나 건의사항, 궁금한 점을 남겨주시면 본사에서 빠르게 답변해 드립니다.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="문의 내용을 자유롭게 적어주세요..."
              className="w-full h-32 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#5F0080] focus:ring-1 focus:ring-[#5F0080] text-[14px] resize-none"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1A1A1A] hover:bg-black text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50 text-[15px]"
            >
              {submitting ? '접수 중...' : '문의 등록하기'}
            </button>
          </form>
        </div>

        {/* 이전 문의 내역 */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-black text-gray-900 mb-4">나의 문의 내역</h2>
          
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">불러오는 중...</p>
          ) : inquiries.length === 0 ? (
            <p className="text-[13px] text-gray-400 text-center py-8 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
              이전 문의 내역이 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {inquiries.map((inq: any) => {
                const isExpanded = expandedId === inq.id;
                
                return (
                  <div key={inq.id} className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
                    <button 
                      onClick={() => toggleExpand(inq.id)}
                      className={`w-full flex items-center justify-between p-4 text-left transition-colors ${isExpanded ? 'bg-gray-100/50' : 'hover:bg-gray-100/50'}`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${inq.status === '답변완료' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                          {inq.status || '답변대기'}
                        </span>
                        <span className="text-[14px] text-gray-800 font-medium truncate">{inq.content}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-gray-400">{new Date(inq.created_at).toLocaleDateString()}</span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="p-4 border-t border-gray-100 bg-white">
                        <p className="text-[14px] text-gray-800 break-keep leading-relaxed whitespace-pre-wrap">{inq.content}</p>
                        
                        {inq.reply && (
                          <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-blue-600 font-black text-[12px]">NAO3 본사 답변</span>
                            </div>
                            <p className="text-[13px] text-gray-700 break-keep leading-relaxed whitespace-pre-wrap">{inq.reply}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
