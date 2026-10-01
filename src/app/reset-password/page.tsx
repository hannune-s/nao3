"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      alert('비밀번호 재설정 링크 발송에 실패했습니다: ' + error.message);
      setLoading(false);
    } else {
      setIsSent(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 w-full max-w-sm flex flex-col items-center">
        <div className="w-16 h-16 bg-[#5F0080]/10 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">🔑</span>
        </div>
        <h2 className="text-2xl font-black text-[#5F0080] mb-2 tracking-tight">비밀번호 찾기</h2>
        
        {!isSent ? (
          <>
            <p className="text-sm text-gray-500 mb-8 text-center break-keep">
              가입 시 사용한 이메일 주소를 입력해 주시면,<br/>비밀번호 재설정 링크를 보내드립니다.
            </p>
            <form onSubmit={handleResetPassword} className="w-full">
              <input 
                type="email" required placeholder="이메일 주소" 
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full mb-6 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F0080]"
              />
              <button 
                type="submit" disabled={loading}
                className="w-full py-4 bg-[#5F0080] hover:bg-purple-900 disabled:bg-purple-300 text-white font-bold rounded-xl transition-colors shadow-md"
              >
                {loading ? '발송 중...' : '재설정 링크 받기'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-700 mb-8 text-center font-medium bg-purple-50 p-4 rounded-xl border border-purple-100">
              해당 이메일로 비밀번호 재설정 링크가 발송되었습니다.<br/><br/>
              메일함(또는 스팸메일함)을 확인해 주세요.
            </p>
            <Link href="/login" className="w-full py-4 bg-[#5F0080] hover:bg-purple-900 text-white font-bold rounded-xl transition-colors shadow-md text-center block">
              로그인 화면으로 돌아가기
            </Link>
          </>
        )}

        {!isSent && (
          <Link href="/login" className="mt-6 text-sm text-gray-500 underline hover:text-[#5F0080]">
            로그인 화면으로 돌아가기
          </Link>
        )}
      </div>
    </div>
  );
}
