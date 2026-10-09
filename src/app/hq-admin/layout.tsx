"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// PIN 번호를 SHA-256으로 해싱하는 함수
async function hashPin(pin: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function HqAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [storedPinHash, setStoredPinHash] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkPinFromDb();
  }, []);

  const checkPinFromDb = async () => {
    try {
      const { data, error } = await supabase
        .from('nao3_system_settings')
        .select('setting_value')
        .eq('setting_key', 'hq_admin_pin')
        .single();
        
      if (data && data.setting_value) {
        setStoredPinHash(data.setting_value);
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    } catch (err) {
      console.warn('보안 설정 불러오기 실패. 설정 전으로 간주합니다.', err);
      setIsAuthorized(true);
    } finally {
      setIsChecking(false);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storedPinHash) return;

    const inputHash = await hashPin(pinInput);
    
    if (inputHash === storedPinHash) {
      setIsAuthorized(true);
    } else {
      alert('비밀번호가 일치하지 않습니다.');
      setPinInput('');
    }
  };

  if (isChecking) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold text-gray-500">안전한 관리자 환경을 준비 중입니다...</div>;
  }

  if (storedPinHash && !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
        <form onSubmit={handlePinSubmit} className="bg-white p-8 rounded-3xl shadow-lg max-w-sm w-full text-center border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">🔒</div>
          <h1 className="text-xl font-black text-gray-900 mb-2">HQ 어드민 접속</h1>
          <p className="text-sm text-gray-500 mb-8">관리자 보안 PIN 번호 6자리를 입력해주세요.</p>
          <input 
            type="password" 
            maxLength={6}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full text-center text-3xl tracking-widest font-mono bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 mb-6"
            placeholder="••••••"
            autoFocus
          />
          <button type="submit" className="w-full py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors">
            접속하기
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* Mobile Header (Sticky) */}
      <header className="md:hidden bg-[#1A1A1A] text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-lg font-bold text-[#E5D7B7]">본사 어드민 (HQ)</h1>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-300 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-[#1A1A1A] text-white flex-shrink-0 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-800 hidden md:block">
          <h1 className="text-xl font-black tracking-tight text-[#E5D7B7]">
            본사 어드민 (HQ)
          </h1>
          <p className="text-gray-400 text-xs mt-1">NAO3 최고 관리자 시스템</p>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto mt-[60px] md:mt-0">
          <ul className="space-y-1">
            <li>
              <Link 
                href="/hq-admin" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${pathname === '/hq-admin' ? 'bg-[#333] text-white border-r-4 border-[#E5D7B7]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                가맹점 대시보드
              </Link>
            </li>
            <li>
              <Link 
                href="/hq-admin/revenue" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${pathname === '/hq-admin/revenue' ? 'bg-[#333] text-white border-r-4 border-[#E5D7B7]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                매출 관리
              </Link>
            </li>
            <li>
              <Link 
                href="/hq-admin/statistics" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${pathname === '/hq-admin/statistics' ? 'bg-[#333] text-white border-r-4 border-[#E5D7B7]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                통계
              </Link>
            </li>
            <li>
              <Link 
                href="/hq-admin/notices" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${pathname === '/hq-admin/notices' ? 'bg-[#333] text-white border-r-4 border-[#E5D7B7]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                본사 공지사항
              </Link>
            </li>
            <li>
              <Link 
                href="/hq-admin/settings" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${pathname === '/hq-admin/settings' ? 'bg-[#333] text-white border-r-4 border-[#E5D7B7]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                시스템 설정 (PG 연동)
              </Link>
            </li>
            <li>
              <Link 
                href="/hq-admin/inquiries" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${pathname === '/hq-admin/inquiries' ? 'bg-[#333] text-white border-r-4 border-[#E5D7B7]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                1:1 문의 관리
              </Link>
            </li>
            <li>
              <Link 
                href="/hq-admin/security" 
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${pathname === '/hq-admin/security' ? 'bg-[#333] text-white border-r-4 border-[#E5D7B7]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                보안 설정 (PIN)
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-4 text-xs text-gray-500 text-center border-t border-gray-800">
          © 2026 NAO3 HQ
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
