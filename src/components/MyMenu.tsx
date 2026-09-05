"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function MyMenu({ storeData }: { storeData: any }) {
  const router = useRouter();

  const [view, setView] = useState<'main' | 'account' | 'subscription'>('main');

  // Account form states
  const [ownerName, setOwnerName] = useState(storeData.owner_name || '');
  const [phone, setPhone] = useState(storeData.phone || '');
  const [address, setAddress] = useState(storeData.address || '');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Subscription mock states
  const [hasCard, setHasCard] = useState(false);
  const businessLabel = storeData.business_type === 'mart' ? '마트' : '정육점';
  const monthlyFee = '39,000';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSaveAccount = async () => {
    setIsSaving(true);
    try {
      const { error: dbError } = await supabase
        .from('nao3_stores')
        .update({ owner_name: ownerName, phone: phone, address: address })
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
      setIsSaving(false);
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
            <div>
              <label className="block text-[13px] font-extrabold text-gray-800 mb-1.5">연락처</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="연락처 (예: 010-1234-5678)" className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-3 text-[15px] text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#5F0080] focus:border-transparent transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-extrabold text-gray-800 mb-1.5">매장 주소</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="매장 주소를 입력하세요" className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-3 text-[15px] text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#5F0080] focus:border-transparent transition-all" />
            </div>
            <hr className="my-1 border-gray-100" />
            <div>
              <label className="block text-[13px] font-extrabold text-gray-800 mb-1.5">비밀번호 변경</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="변경할 비밀번호 (기존 유지 시 비워둠)" className="w-full bg-white border border-gray-200 rounded-lg px-3.5 py-3 text-[15px] text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#5F0080] focus:border-transparent transition-all placeholder:font-normal placeholder:text-gray-400" />
            </div>
          </div>
          <button onClick={handleSaveAccount} disabled={isSaving} className={`w-full py-4 rounded-xl font-black text-white text-[16px] transition-all shadow-md ${isSaving ? 'bg-gray-400 shadow-none' : 'bg-[#5F0080] hover:bg-[#4A0066] hover:shadow-lg active:scale-[0.98]'}`}>
            {isSaving ? '저장 중...' : '저장하기'}
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
          {/* 1. 구독 상태 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-0"></div>
            <div className="relative z-10">
              <h3 className="text-[14px] font-extrabold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#5F0080]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                내 이용권 상태
              </h3>
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-[#5F0080] text-white text-[12px] font-bold px-2.5 py-1 rounded-md">
                  {businessLabel} 푸시앱 사용중
                </span>
                <span className="text-[13px] font-bold text-gray-500">월 {monthlyFee}원</span>
              </div>
              <p className="text-[13px] text-gray-500 font-medium">매월 5일 정기결제 예정</p>
            </div>
          </div>

          {/* 2. 자동결제 카드 관리 */}
          <div>
            <h3 className="text-[14px] font-extrabold text-gray-800 mb-3 px-1">자동결제 카드 관리</h3>
            {!hasCard ? (
              <button onClick={handleRegisterCard} className="w-full bg-white border border-dashed border-[#5F0080] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-purple-50/30 transition-colors group shadow-sm">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5 text-[#5F0080]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                </div>
                <span className="text-[15px] font-bold text-[#5F0080]">월 구독료 자동결제 카드 등록하기</span>
              </button>
            ) : (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center text-[10px] font-black text-gray-500 border border-gray-200">
                    KB국민
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-gray-900">KB국민카드</p>
                    <p className="text-[12px] text-gray-500 font-medium">끝자리 1234</p>
                  </div>
                </div>
                <button onClick={handleRegisterCard} className="text-[12px] font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200">변경하기</button>
              </div>
            )}
          </div>

          {/* 3. 결제 내역 */}
          <div>
            <h3 className="text-[14px] font-extrabold text-gray-800 mb-3 px-1">결제 및 이용 내역</h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              {[1, 2, 3].map((_, i) => (
                <div key={i} className="p-4 border-b border-gray-50 last:border-0 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-[14px] font-bold text-gray-800 mb-0.5">39,000원 결제</p>
                    <p className="text-[12px] text-gray-400 font-medium">2026.{String(9 - i).padStart(2, '0')}.05 • KB국민카드</p>
                  </div>
                  <button onClick={() => alert('영수증 출력 기능이 연결될 자리입니다.')} className="text-[11px] font-bold text-[#5F0080] border border-[#5F0080]/30 bg-purple-50 px-2.5 py-1.5 rounded flex items-center gap-1 hover:bg-[#5F0080] hover:text-white transition-colors">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    영수증
                  </button>
                </div>
              ))}
            </div>
          </div>

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
            <p className="text-[13px] text-gray-500 font-medium">매장 정보 및 연락처 수정</p>
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
        <div className="bg-white rounded-2xl p-5 flex items-center justify-between shadow-sm border border-gray-100 border-l-4 border-l-[#5F0080] cursor-not-allowed opacity-80">
          <div>
            <h3 className="font-extrabold text-gray-900 text-[16px] mb-1">설정 (준비중)</h3>
            <p className="text-[13px] text-gray-500 font-medium">알림 및 앱 환경 설정</p>
          </div>
          <span className="text-gray-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
          </span>
        </div>

        {/* 고객 서비스 리스트 */}
        <div className="mt-2">
          <h4 className="text-[12px] font-extrabold text-gray-400 mb-2.5 px-1 tracking-tight">고객 서비스</h4>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <button className="w-full flex items-center justify-between p-5 border-b border-gray-50 text-left hover:bg-gray-50 transition-colors">
              <span className="text-[15px] font-bold text-gray-800">이용 가이드</span>
              <span className="text-gray-300"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></span>
            </button>
            <button className="w-full flex items-center justify-between p-5 border-b border-gray-50 text-left hover:bg-gray-50 transition-colors">
              <span className="text-[15px] font-bold text-gray-800">공지사항</span>
              <span className="text-gray-300"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg></span>
            </button>
            <button onClick={handleLogout} className="w-full flex items-center justify-between p-5 text-left hover:bg-red-50 transition-colors group">
              <span className="text-[15px] font-extrabold text-red-500 group-hover:text-red-600">로그아웃</span>
              <span className="text-gray-300"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></span>
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
