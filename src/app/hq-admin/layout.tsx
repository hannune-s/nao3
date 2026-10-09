"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function HqAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // 로컬 스토리지에서 PIN 번호를 확인
    const pin = localStorage.getItem('nao3_hq_pin');
    if (pin) {
      setStoredPin(pin);
      setIsAuthorized(false);
    } else {
      // 핀 번호가 설정되어 있지 않으면 초기 통과 (보안 설정 메뉴에서 핀 등록 유도)
      setIsAuthorized(true);
    }
    setIsChecking(false);
  }, []);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (storedPin && pinInput === storedPin) {
      setIsAuthorized(true);
    } else {
      alert('비밀번호가 일치하지 않습니다.');
      setPinInput('');
    }
  };

  if (isChecking) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">보안 확인 중...</div>;
  }

  if (storedPin && !isAuthorized) {
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
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1A1A1A] text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-black tracking-tight text-[#E5D7B7]">
            본사 어드민 (HQ)
          </h1>
          <p className="text-gray-400 text-xs mt-1">NAO3 최고 관리자 시스템</p>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1">
            <li>
              <Link 
                href="/hq-admin" 
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${pathname === '/hq-admin' ? 'bg-[#333] text-white border-r-4 border-[#E5D7B7]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                가맹점 대시보드
              </Link>
            </li>
            <li>
              <Link 
                href="/hq-admin/revenue" 
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${pathname === '/hq-admin/revenue' ? 'bg-[#333] text-white border-r-4 border-[#E5D7B7]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                매출 관리
              </Link>
            </li>
            <li>
              <Link 
                href="/hq-admin/statistics" 
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${pathname === '/hq-admin/statistics' ? 'bg-[#333] text-white border-r-4 border-[#E5D7B7]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                통계
              </Link>
            </li>
            <li>
              <Link 
                href="/hq-admin/notices" 
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${pathname === '/hq-admin/notices' ? 'bg-[#333] text-white border-r-4 border-[#E5D7B7]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                본사 공지사항
              </Link>
            </li>
            <li>
              <Link 
                href="/hq-admin/settings" 
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${pathname === '/hq-admin/settings' ? 'bg-[#333] text-white border-r-4 border-[#E5D7B7]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                시스템 설정 (PG 연동)
              </Link>
            </li>
            <li>
              <Link 
                href="/hq-admin/inquiries" 
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${pathname === '/hq-admin/inquiries' ? 'bg-[#333] text-white border-r-4 border-[#E5D7B7]' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                1:1 문의 관리
              </Link>
            </li>
            <li>
              <Link 
                href="/hq-admin/security" 
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
        {/* Mobile Header */}
        <header className="md:hidden bg-[#1A1A1A] text-white p-4 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#E5D7B7]">본사 어드민 (HQ)</h1>
        </header>
        
        <div className="p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
