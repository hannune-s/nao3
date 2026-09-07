"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function MyMenu({ storeData }: { storeData: any }) {
  const router = useRouter();

  const [view, setView] = useState<'main' | 'account' | 'subscription' | 'settings' | 'notices'>('main');

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

  const handleRegisterCard = () => {
    alert('카드 결제 연동(PG사) 모듈이 실행될 자리입니다.\n(추후 간편결제 연동 필요)');
    setHasCard(true); // 모의 처리
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
                      <span className="font-black text-gray-900 text-[15px]">연간 결제</span>
                      <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">⭐ BEST</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-gray-400 line-through">490,000원</span>
                      <span className="font-black text-[#5F0080] text-[16px]">연 390,000원</span>
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
                    <p className="font-bold text-gray-800 text-[15px] mb-1">월간 결제</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] text-gray-400 line-through">49,000원</span>
                      <span className="font-bold text-gray-900 text-[16px]">월 39,000원</span>
                    </div>
                  </div>
                </div>
                <div className="pl-7 text-[12px] text-gray-600 space-y-0.5">
                  <p>· 매월 정기결제 / 언제든 해지 가능</p>
                </div>
              </label>
            </div>

            <button onClick={() => alert('PG사 결제 시스템 연동을 준비 중입니다. 곧 오픈 예정입니다!')} className="w-full bg-[#5F0080] text-white font-black py-4 rounded-xl shadow-md hover:bg-purple-900 transition-colors text-[16px]">
              구독하기
            </button>
          </div>
        </div>
      </div>
    );
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

        {/* 고객 서비스 리스트 */}
        <div className="mt-2">
          <h4 className="text-[12px] font-extrabold text-gray-400 mb-2.5 px-1 tracking-tight">고객 서비스</h4>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <button className="w-full flex items-center justify-between p-5 border-b border-gray-50 text-left hover:bg-gray-50 transition-colors">
              <span className="text-[15px] font-bold text-gray-800">이용 가이드</span>
              <span className="text-gray-300"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></span>
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
        <div className="text-center mt-6">
          <span className="text-[11px] text-gray-400 font-medium tracking-widest">NAO3 v1.0.0</span>
        </div>

      </div>
    </div>
  );
}
