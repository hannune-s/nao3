"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HqAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1A1A1A] text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-black tracking-tight text-[#E5D7B7]">
            본사 어드민 (HQ)
          </h1>
          <p className="text-gray-400 text-xs mt-1">NAO3 최고 관리자 시스템</p>
        </div>
        <nav className="flex-1 py-4">
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
