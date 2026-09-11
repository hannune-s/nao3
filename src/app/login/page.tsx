"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminRouterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(true);

  useEffect(() => {
    checkUser();
    
    // Check if there was a saved preference
    const savedAuto = localStorage.getItem('nao3_auto_login');
    if (savedAuto !== null) {
      setAutoLogin(savedAuto === 'true');
    }
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const { data: st } = await supabase.from('nao3_stores').select('slug').eq('id', session.user.id).single();
      if(st) router.push(`/store/${st.slug}`);
    } else {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Save the auto login preference so the custom storage adapter knows where to put the session
    localStorage.setItem('nao3_auto_login', String(autoLogin));

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('로그인 실패: ' + error.message);
      setLoading(false);
    } else if (data.session?.user) {
      const { data: st } = await supabase.from('nao3_stores').select('slug').eq('id', data.session.user.id).single();
      if(st) router.push(`/store/${st.slug}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#5F0080] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 w-full max-w-sm flex flex-col items-center">
        <div className="w-16 h-16 bg-[#5F0080]/10 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">🔑</span>
        </div>
        <h2 className="text-2xl font-black text-[#5F0080] mb-2 tracking-tight">NAO3 어드민</h2>
        <p className="text-sm text-gray-500 mb-8 text-center">매달 나가는 문자비 0원! 3초 만에 쏘는 단골 세일 알림</p>
        
        <input 
          type="email" required placeholder="이메일" 
          value={email} onChange={e => setEmail(e.target.value)}
          className="w-full mb-3 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F0080]"
        />
        <input 
          type="password" required placeholder="비밀번호" 
          value={password} onChange={e => setPassword(e.target.value)}
          className="w-full mb-4 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5F0080]"
        />
        
        <div className="w-full flex items-center mb-6 pl-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input 
                type="checkbox" 
                checked={autoLogin}
                onChange={(e) => setAutoLogin(e.target.checked)}
                className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded cursor-pointer checked:bg-[#5F0080] checked:border-[#5F0080] transition-colors"
              />
              <svg 
                className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" 
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-sm font-bold text-gray-500 group-hover:text-gray-800 transition-colors">자동 로그인</span>
          </label>
        </div>
        
        <button type="submit" className="w-full py-4 bg-[#5F0080] hover:bg-purple-900 text-white font-bold rounded-xl transition-colors shadow-md">
          로그인
        </button>

        <Link href="/register" className="mt-6 text-sm text-gray-500 underline hover:text-[#5F0080]">
          NAO3가 처음이신가요? 가입하기
        </Link>
      </form>
    </div>
  );
}
