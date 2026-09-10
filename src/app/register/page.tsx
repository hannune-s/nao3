"use client";

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  
  // 폼 상태
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [address, setAddress] = useState('');
  const [businessNumber, setBusinessNumber] = useState(''); // 사업자등록번호 추가
  const [businessType, setBusinessType] = useState('마트/슈퍼');
  const [customBusinessType, setCustomBusinessType] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) {
      alert('매장 아이디를 입력해주세요.');
      return;
    }
    if (!file) {
      alert('사업자등록증을 첨부해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 0. 슬러그(아이디) 중복 체크
      const { data: existingStore } = await supabase
        .from('nao3_stores')
        .select('slug')
        .eq('slug', slug)
        .single();

      if (existingStore) {
        alert('이미 사용 중인 매장 아이디(주소)입니다. 다른 영문 아이디를 입력해주세요.');
        setLoading(false);
        return;
      }
      // 1. 사업자등록증 Storage 업로드
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${slug || 'unnamed'}/${fileName}`; // 스토어 ID(slug) 폴더로 정리

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

      // 3. nao3_stores 테이블에 가입 정보 저장 (회원가입된 User ID 매핑)
      // 1개월 무료 체험 만료일 계산
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      const typeMap: Record<string, string> = {
        '마트/슈퍼': 'mart',
        '정육점': 'butcher',
        '청과야채': 'produce',
        '기타': 'other',
      };
      const dbBusinessType = typeMap[businessType] || 'other';
      
      const { error: dbError } = await supabase.from('nao3_stores').insert({
        id: authData.user?.id, // 1사장님 = 1스토어 격리 (Tenant ID)
        email,
        store_name: storeName,
        slug,
        owner_name: ownerName,
        address,
        business_number: businessNumber, // 사업자등록번호 저장
        business_type: dbBusinessType,
        business_license_url: licenseUrl,
        expires_at: expiresAt.toISOString(),
      });

      if (dbError) throw new Error(`스토어 정보 저장 실패: ${dbError.message}`);

      alert('NAO3 가입이 완료되었습니다! 승인 후 로그인해주세요.');
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
          <h1 className="text-3xl font-black relative z-10 tracking-tight">NAO3 가입하기</h1>
          <p className="text-purple-200 mt-2 relative z-10 text-sm">매달 나가는 문자비 0원! 3초 만에 쏘는 단골 세일 알림</p>
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
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">매장 전용 영문 아이디 (예: naosuper)</label>
                <input 
                  type="text" required placeholder="영문 소문자/숫자만 입력" 
                  value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F0080]"
                />
                <input 
                  type="text" required placeholder="대표자명" 
                  value={ownerName} onChange={e => setOwnerName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F0080]"
                />
              </div>
              <input 
                type="text" required placeholder="사업자등록번호 (예: 123-45-67890)" 
                value={businessNumber} onChange={e => setBusinessNumber(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F0080]"
              />
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
              <span>🌟</span> 업종 선택
            </h3>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-600 mb-2">운영하시는 업종을 선택해주세요</label>
              
              <div className="flex flex-col gap-3 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="businessType" value="마트/슈퍼" checked={businessType === '마트/슈퍼'} onChange={() => setBusinessType('마트/슈퍼')} className="text-[#5F0080] focus:ring-[#5F0080] w-4 h-4" />
                  <span className="text-sm text-gray-700 font-bold">마트/슈퍼</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="businessType" value="정육점" checked={businessType === '정육점'} onChange={() => setBusinessType('정육점')} className="text-[#5F0080] focus:ring-[#5F0080] w-4 h-4" />
                  <span className="text-sm text-gray-700 font-bold">정육점</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="businessType" value="청과야채" checked={businessType === '청과야채'} onChange={() => setBusinessType('청과야채')} className="text-[#5F0080] focus:ring-[#5F0080] w-4 h-4" />
                  <span className="text-sm text-gray-700 font-bold">청과야채</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="businessType" value="기타" checked={businessType === '기타'} onChange={() => setBusinessType('기타')} className="text-[#5F0080] focus:ring-[#5F0080] w-4 h-4" />
                  <span className="text-sm text-gray-700 font-bold">기타 (수기입력)</span>
                </label>
              </div>
              
              {businessType === '기타' && (
                <input 
                  type="text" 
                  required
                  placeholder="업종을 직접 입력해주세요" 
                  value={customBusinessType} 
                  onChange={e => setCustomBusinessType(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F0080] mt-1 mb-2"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-2">사업자등록증 첨부</label>
              <div className="flex items-center gap-2">
                <input 
                  type="file" accept="image/*,.pdf" required={!file}
                  ref={fileInputRef}
                  onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-white file:text-[#5F0080] file:shadow-sm hover:file:bg-gray-50 cursor-pointer"
                />
                {file && (
                  <button 
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="shrink-0 bg-red-50 text-red-600 px-3 py-2 rounded-xl text-xs font-black border border-red-200 hover:bg-red-100 transition-colors shadow-sm"
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 1개월 무료 혜택 안내 */}
          <div className="mt-4 border-t pt-6">
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-2 text-sm text-gray-700 leading-relaxed shadow-sm text-center">
              <p className="font-black text-[#5F0080] flex items-center justify-center gap-1 mb-1">
                <span className="text-base">🎁</span> 가입 시 1개월 무료 체험 혜택 제공!
              </p>
              <p className="text-gray-700 text-xs">부담 없이 시작해 보세요. 요금제 및 결제 정보 등록은<br/><strong className="text-gray-900">1개월 무료 체험 후 어드민 메뉴에서</strong> 진행하실 수 있습니다.</p>
            </div>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full mt-4 py-4 bg-[#5F0080] hover:bg-purple-900 disabled:bg-purple-300 text-white font-black text-lg rounded-xl transition-colors shadow-lg"
          >
            {loading ? '가입 처리 중...' : 'NAO3 시작하기'}
          </button>
          
          <div className="mt-7 text-center">
            <p className="text-[14px] text-gray-500 font-medium">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="text-[#5F0080] font-extrabold hover:underline ml-1">
                로그인
              </Link>
            </p>
          </div>
          
        </form>
      </div>
    </div>
  );
}
