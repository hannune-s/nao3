"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  
  // 폼 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [businessType, setBusinessType] = useState<'mart' | 'butcher'>('mart');
  const [file, setFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('사업자등록증을 첨부해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 1. 사업자등록증 Storage 업로드
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${businessType}/${fileName}`; // 폴더별로 정리

      const { error: uploadError } = await supabase.storage
        .from('business_licenses') // 스토리지 버킷명
        .upload(filePath, file);

      if (uploadError) throw new Error(`파일 업로드 실패: ${uploadError.message}`);

      // Public URL 가져오기
      const { data: publicUrlData } = supabase.storage
        .from('business_licenses')
        .getPublicUrl(filePath);

      const licenseUrl = publicUrlData.publicUrl;

      // 2. Supabase Auth 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw new Error(`회원가입 실패: ${authError.message}`);

      // 3. stores 테이블에 가입 정보 저장 (회원가입된 User ID 매핑)
      const { error: dbError } = await supabase.from('stores').insert({
        id: authData.user?.id, // 1사장님 = 1스토어 격리 (Tenant ID)
        email,
        store_name: storeName,
        owner_name: ownerName,
        address,
        business_type: businessType,
        business_license_url: licenseUrl,
      });

      if (dbError) throw new Error(`스토어 정보 저장 실패: ${dbError.message}`);

      alert('나오3 가입이 완료되었습니다! 승인 후 로그인해주세요.');
      router.push('/'); // 로그인/어드민 페이지로 이동

    } catch (err: any) {
      console.error(err);
      alert(err.message || '가입 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
        
        {/* 헤더 */}
        <div className="bg-[#5F0080] text-white p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <h1 className="text-3xl font-black relative z-10 tracking-tight">Nao3 가입하기</h1>
          <p className="text-purple-200 mt-2 relative z-10 text-sm">동네 사장님들을 위한 모바일 전단지 1초 발송</p>
        </div>

        {/* 회원가입 폼 */}
        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
          
          {/* 계정 정보 */}
          <div>
            <h3 className="text-sm font-bold text-[#5F0080] mb-3 border-b pb-1">계정 정보</h3>
            <div className="flex flex-col gap-3">
              <input 
                type="email" required placeholder="이메일 (아이디)" 
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F0080]"
              />
              <input 
                type="password" required placeholder="비밀번호 (6자리 이상)" 
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F0080]"
              />
            </div>
          </div>

          {/* 매장 정보 */}
          <div>
            <h3 className="text-sm font-bold text-[#5F0080] mb-3 border-b pb-1 mt-2">매장 정보</h3>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <input 
                  type="text" required placeholder="상호명" 
                  value={storeName} onChange={e => setStoreName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F0080]"
                />
                <input 
                  type="text" required placeholder="대표자명" 
                  value={ownerName} onChange={e => setOwnerName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F0080]"
                />
              </div>
              <input 
                type="text" required placeholder="매장 주소" 
                value={address} onChange={e => setAddress(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F0080]"
              />
            </div>
          </div>

          {/* 핵심 정보: 업종 및 사업자등록증 */}
          <div className="bg-[#5F0080]/5 p-5 rounded-2xl border border-[#5F0080]/15 mt-2">
            <h3 className="text-sm font-bold text-[#5F0080] mb-3 flex items-center gap-2">
              <span>🌟</span> 나오3 분양 핵심 정보
            </h3>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-600 mb-2">운영하시는 업종을 선택해주세요</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setBusinessType('mart')}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border ${
                    businessType === 'mart' 
                      ? 'bg-[#5F0080] text-white border-[#5F0080] shadow-md' 
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  🛒 슈퍼/마트
                </button>
                <button
                  type="button"
                  onClick={() => setBusinessType('butcher')}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border ${
                    businessType === 'butcher' 
                      ? 'bg-[#5F0080] text-white border-[#5F0080] shadow-md' 
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  🥩 정육점
                </button>
              </div>
              <p className="text-[11px] text-[#5F0080]/70 mt-2 text-center">선택하신 업종에 맞춰 어드민과 전단지 디자인이 맞춤 최적화됩니다.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2">사업자등록증 첨부</label>
              <input 
                type="file" accept="image/*,.pdf" required
                onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-white file:text-[#5F0080] file:shadow-sm hover:file:bg-gray-50 cursor-pointer"
              />
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full mt-4 py-4 bg-[#5F0080] hover:bg-purple-900 disabled:bg-purple-300 text-white font-black text-lg rounded-xl transition-colors shadow-lg"
          >
            {loading ? '가입 처리 중...' : '나오3 시작하기'}
          </button>
          
        </form>
      </div>
    </div>
  );
}
