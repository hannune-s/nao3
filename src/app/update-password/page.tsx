"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Check if the user has an active session (Supabase handles the #access_token in URL automatically)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Not authenticated, redirect to login
        router.push('/login');
      }
    };
    checkSession();
  }, [router]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('비밀번호는 최소 6자리 이상이어야 합니다.');
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setErrorMsg('비밀번호 변경 실패: ' + error.message);
      setLoading(false);
    } else {
      alert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해 주세요.');
      await supabase.auth.signOut(); // Sign out to force re-login with new password
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 w-full max-w-sm flex flex-col items-center">
        <div className="w-16 h-16 bg-[#5F0080]/10 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">🔒</span>
        </div>
        <h2 className="text-2xl font-black text-[#5F0080] mb-2 tracking-tight">새 비밀번호 설정</h2>
        <p className="text-sm text-gray-500 mb-8 text-center break-keep">
          새롭게 사용할 비밀번호를 입력해 주세요.
        </p>

        <form onSubmit={handleUpdatePassword} className="w-full">
          <div className="flex flex-col gap-3 mb-6">
            <input 
              type="password" required placeholder="새 비밀번호 (6자리 이상)" 
              value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F0080]"
            />
            <input 
              type="password" required placeholder="새 비밀번호 확인" 
              value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F0080]"
            />
            {errorMsg && (
              <p className="text-red-500 text-xs font-bold px-1">{errorMsg}</p>
            )}
          </div>
          
          <button 
            type="submit" disabled={loading}
            className="w-full py-4 bg-[#5F0080] hover:bg-purple-900 disabled:bg-purple-300 text-white font-bold rounded-xl transition-colors shadow-md"
          >
            {loading ? '변경 중...' : '비밀번호 변경하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
