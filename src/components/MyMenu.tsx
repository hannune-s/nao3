"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function MyMenu({ storeData }: { storeData: any }) {
  const router = useRouter();

  const [view, setView] = useState<'main' | 'account' | 'subscription' | 'settings' | 'notices' | 'guide' | 'qr'>('main');

  // Account form states
  const [ownerName, setOwnerName] = useState(storeData.owner_name || '');
  const [newPassword, setNewPassword] = useState('');
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // Settings form states
  const [phone, setPhone] = useState(storeData.phone || '');
  const [address, setAddress] = useState(storeData.address || '');
  const [operatingHours, setOperatingHours] = useState(storeData.operating_hours || '');
  const [closedDays, setClosedDays] = useState(storeData.closed_days || '');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Subscription mock states
  const [hasCard, setHasCard] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState('annual');
  const businessLabel = storeData.business_type === 'mart' ? '마트' : '정육점';
  const monthlyFee = '39,000';

  // Notices state
  const [hqNotices, setHqNotices] = useState<any[]>([]);
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);

  

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

  useEffect(() => {
    if (view === 'notices') {
      fetchHqNotices();
    }
  }, [view]);

  

  

  const handleLogout = async () => {
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
      const { error: dbError } = await supabase
        .from('nao3_stores')
        .update({ phone, address, operating_hours: operatingHours, closed_days: closedDays })
        .eq('id', storeData.id);

      if (dbError) throw dbError;

      alert('가게정보 설정이 성공적으로 업데이트되었습니다.');
    } catch (err: any) {
      console.error(err);
      alert('업데이트 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsSavingSettings(false);
    }
  };

  const loadTossPayments = () => {
    return new Promise((resolve) => {
      if ((window as any).TossPayments) {
        resolve((window as any).TossPayments);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.tosspayments.com/v1/payment';
      script.onload = () => resolve((window as any).TossPayments);
      document.head.appendChild(script);
    });
  };

  const handleSubscribe = async () => {
    try {
      // 1. Fetch Client Key from HQ Settings (or fallback to default test key)
      let clientKey = 'test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq'; // Default test key
      try {
        const { data } = await supabase.from('nao3_system_settings').select('*');
        if (data) {
          const keyRow = data.find((r: any) => r.setting_key === 'pg_client_key');
          if (keyRow && keyRow.setting_value) clientKey = keyRow.setting_value;
        }
      } catch (err) {
        console.warn('DB settings not found, using default test key.');
      }

      // 2. Load SDK and Initialize
      const TossPayments = await loadTossPayments() as any;
      const tossPayments = TossPayments(clientKey);

      // 3. Request Payment
      const price = subscriptionPlan === 'annual' ? 390000 : 39000;
      const orderName = subscriptionPlan === 'annual' ? 'NAO3 연간 결제' : 'NAO3 월간 결제';
      const orderId = 'order_' + Math.random().toString(36).substring(2, 10);
      
      const origin = typeof window !== 'undefined' ? window.location.origin : '';

      tossPayments.requestPayment('카드', {
        amount: price,
        orderId: orderId,
        orderName: orderName,
        customerName: ownerName || storeData.owner_name || '테스트 고객',
        successUrl: origin + `/store/${storeData.slug}/success`,
        failUrl: origin + `/store/${storeData.slug}/fail`,
      }).catch((err: any) => {
        if (err.code === 'USER_CANCEL') {
          console.log('User cancelled payment');
        } else {
          alert('결제창 호출에 실패했습니다: ' + err.message);
        }
      });
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
          </div>
          <button onClick={handleSaveSettings} disabled={isSavingSettings} className={`w-full py-4 rounded-xl font-black text-white text-[16px] transition-all shadow-md ${isSavingSettings ? 'bg-gray-400 shadow-none' : 'bg-[#5F0080] hover:bg-[#4A0066] hover:shadow-lg active:scale-[0.98]'}`}>
            {isSavingSettings ? '저장 중...' : '저장하기'}
          </button>
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

        <div className="p-5 flex flex-col gap-6">

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-[14px] font-extrabold text-gray-800 mb-4 px-1">요금제 선택</h3>

            {/* 안내문 */}
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-5 text-[13px] text-gray-700 leading-relaxed shadow-sm">
              <p className="font-black text-[#5F0080] flex items-center gap-1.5 mb-1.5">
                <span>📢</span> 1개월 무료 체험 안내
              </p>
              <p className="text-gray-700 leading-relaxed">현재 <strong className="text-gray-900">1개월 무료 체험</strong> 중입니다.<br/>무료 체험 이후에도 NAO3를 계속 이용하시려면 아래에서 요금제를 선택하고 구독을 시작해 주세요.</p>
            </div>

            {/* 요금제 선택 */}
            <div className="flex flex-col gap-3 mb-6">

              {/* 연간 결제 */}
              <label className={`flex flex-col border-2 rounded-xl p-4 cursor-pointer transition-all ${subscriptionPlan === 'annual' ? 'border-[#5F0080] bg-purple-50/30 shadow-md' : 'border-gray-200 hover:border-purple-300'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <input type="radio" name="plan" value="annual" checked={subscriptionPlan === 'annual'} onChange={() => setSubscriptionPlan('annual')} className="text-[#5F0080] focus:ring-[#5F0080] w-4 h-4 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="font-black text-gray-900 text-[16px]">연간 결제</span>
                      <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">⭐ BEST</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] text-gray-500 font-semibold line-through">490,000원</span>
                      <span className="font-black text-[#5F0080] text-[18px]">연 390,000원</span>
                    </div>
                  </div>
                </div>
                <div className="pl-7 text-[12px] text-gray-600 font-medium space-y-0.5">
                  <p>· 12개월 이용 <span className="text-gray-400">(월 32,500원 꼴 / 일시불)</span></p>
                  <p>· 2개월 무료 혜택 자동 반영</p>
                </div>
              </label>

              {/* 월간 결제 */}
              <label className={`flex flex-col border-2 rounded-xl p-4 cursor-pointer transition-all ${subscriptionPlan === 'monthly' ? 'border-[#5F0080] bg-purple-50/30 shadow-md' : 'border-gray-200 hover:border-purple-300'}`}>
                <div className="flex items-start gap-3 mb-2">
                  <input type="radio" name="plan" value="monthly" checked={subscriptionPlan === 'monthly'} onChange={() => setSubscriptionPlan('monthly')} className="text-[#5F0080] focus:ring-[#5F0080] w-4 h-4 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-[16px] mb-1">월간 결제</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] text-gray-500 font-semibold line-through">49,000원</span>
                      <span className="font-bold text-gray-900 text-[18px]">월 39,000원</span>
                    </div>
                  </div>
                </div>
                <div className="pl-7 text-[12px] text-gray-600 space-y-0.5">
                  <p>· 매월 정기결제 / 언제든 해지 가능</p>
                </div>
              </label>
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
    const customerLink = typeof window !== 'undefined' ? `${window.location.origin}/store/${storeData.slug}/sale` : '';
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&data=${encodeURIComponent(customerLink)}`;

    const copyLink = () => {
      navigator.clipboard.writeText(customerLink).then(() => {
        alert('링크가 복사되었습니다!\n문자메시지나 카카오톡에 붙여넣어 홍보하세요.');
      }).catch(() => {
        alert('링크 복사에 실패했습니다.');
      });
    };

    const downloadQR = async () => {
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
          ctx.fillText(storeData.store_name || '스마트 전단지', canvas.width / 2, canvas.height - (padding + textHeight / 2) + 50);
          
          ctx.fillStyle = '#5F0080';
          ctx.font = 'bold 50px sans-serif';
          ctx.fillText('스마트폰 카메라로 스캔해 보세요!', canvas.width / 2, padding / 2 + 20);

          canvas.toBlob((outBlob) => {
            if (!outBlob) return;
            const finalUrl = window.URL.createObjectURL(outBlob);
            const link = document.createElement('a');
            link.href = finalUrl;
            link.download = `${storeData.store_name || '매장'}_홍보용_QR.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(finalUrl);
            window.URL.revokeObjectURL(url);
          }, 'image/png');
        };
        img.src = url;
      } catch (err) {
        alert('QR코드 생성에 실패했습니다. 이미지를 길게 눌러 저장해주세요.');
      }
    };

    return (
      <div className="min-h-screen bg-[#F9F9F9] pb-24 font-sans animate-fade-in-up">
        {/* Header */}
        <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center gap-3 sticky top-0 z-10">
          <button onClick={() => setView('main')} className="text-gray-400 hover:text-gray-800 transition-colors p-1 -ml-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-[20px] font-extrabold text-gray-900 tracking-tight">고객 홍보 (링크 & QR)</h1>
        </div>

        <div className="p-5 space-y-6 max-w-lg mx-auto">
          
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-black text-gray-900 mb-2">우리 매장 전용 링크</h2>
            <p className="text-[13px] text-gray-500 mb-4 break-keep">
              고객들에게 문자로 발송할 수 있는 우리 매장만의 고유 주소입니다.
            </p>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                readOnly 
                value={customerLink} 
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none"
              />
              <button 
                onClick={copyLink}
                className="shrink-0 bg-gray-900 text-white font-bold px-4 rounded-xl hover:bg-black transition-colors"
              >
                링크 복사
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center">
            <h2 className="text-lg font-black text-gray-900 mb-2">홍보용 QR 코드</h2>
            <p className="text-[13px] text-gray-500 mb-6 break-keep">
              계산대나 매장 입구에 붙여두세요! 고객들이 카메라로 찍으면 1초 만에 스마트 전단지로 연결됩니다.
            </p>
            
            <div className="inline-block p-4 border-4 border-gray-100 rounded-3xl bg-white mb-6">
              <img src={qrImageUrl} alt="Store QR Code" className="w-48 h-48 mx-auto" />
            </div>

            <button 
              onClick={downloadQR}
              className="w-full bg-[#5F0080] text-white font-black py-4 rounded-xl shadow-md hover:bg-purple-900 transition-colors text-[16px] flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              QR 이미지 다운로드
            </button>
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
                      <span className="text-[12px] text-gray-400 font-medium shrink-0">
                        {new Date(notice.created_at).toLocaleDateString('ko-KR')}
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

        {/* QR 홍보 카드 */}
        <button 
          onClick={() => setView('qr')}
          className="w-full bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm border border-gray-100 border-l-4 border-l-pink-500 text-left hover:bg-pink-50/50 transition-colors"
        >
          <div>
            <h3 className="font-extrabold text-gray-900 text-[16px] mb-1">고객 홍보 (링크 & QR)</h3>
            <p className="text-[13px] text-gray-500 font-medium">우리 매장 전용 링크 및 QR코드 다운로드</p>
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
        <div className="text-center mt-6 flex flex-col items-center gap-3">
          <span className="text-[11px] text-gray-400 font-medium tracking-widest">NAO3 v1.0.0</span>
          <button 
            onClick={() => {
              if (confirm('정말로 회원 탈퇴를 진행하시겠습니까?\n탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.')) {
                alert('탈퇴 요청이 접수되었습니다. 본사 확인 후 순차적으로 처리됩니다.');
              }
            }}
            className="text-[11px] text-gray-300 hover:text-gray-500 underline underline-offset-2 transition-colors"
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
            <div className="space-y-4">
              {inquiries.map((inq: any) => (
                <div key={inq.id} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${inq.status === '답변완료' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                      {inq.status || '답변대기'}
                    </span>
                    <span className="text-[11px] text-gray-400">{new Date(inq.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[14px] text-gray-800 break-keep leading-relaxed">{inq.content}</p>
                  
                  {inq.reply && (
                    <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-blue-600 font-black text-[12px]">NAO3 본사 답변</span>
                      </div>
                      <p className="text-[13px] text-gray-700 break-keep leading-relaxed">{inq.reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
