import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-[#5F0080] tracking-tight">NAO3</span>
            <span className="hidden sm:block px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold">사장님 필수앱</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-[#5F0080] transition-colors">
              로그인
            </Link>
            <Link href="/register" className="text-sm font-bold text-white bg-[#5F0080] hover:bg-purple-900 px-5 py-2 rounded-full shadow-sm transition-all">
              무료로 시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#5F0080]">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-500 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-800 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-purple-100 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            매달 나가는 문자 비용 0원
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tight mb-6 leading-tight break-keep drop-shadow-lg">
            3초 만에 쏘는 단골 세일 알림, <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-100">NAO3 라이브 푸시</span>
          </h1>
          <p className="text-lg md:text-xl text-purple-100 mb-10 max-w-2xl mx-auto font-medium break-keep leading-relaxed drop-shadow-md">
            마치 라이브 홈쇼핑처럼 도전적인 장사를 시작하세요!<br/>
            어떤 업종이든, 복잡한 앱 설치 없이 1초만에 전단지를 완성하고<br className="hidden sm:block" /> 실시간으로 고객과 소통할 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-[#5F0080] font-black text-lg hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              내 매장 10초만에 세팅하기
            </Link>
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 rounded-full bg-purple-800/50 text-white font-bold text-lg hover:bg-purple-800 transition-colors border border-purple-400/30 backdrop-blur-sm">
              어드민 로그인
            </Link>
          </div>
        </div>
      </section>

      {/* Feature 1: Admin Speed */}
      <section className="py-24 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-200 transform hover:-translate-y-2 transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent z-10 pointer-events-none"></div>
              <Image src="/screenshots/admin.png" alt="어드민 압도적 입력" width={800} height={600} className="w-full h-auto object-cover" />
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl mb-6 shadow-sm border border-purple-200">⚡</div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight leading-tight break-keep">
                바쁜 매장 업무 중에도<br/><span className="text-[#5F0080]">압도적인 1초컷 입력</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed break-keep">
                스마트폰 하나로 충분합니다! 초성 검색, 원터치 등록으로 상품명부터 중량, 금액까지 단 1초 만에 툭툭! 바쁜 시간에도 누구나 손쉽게 할인 정보를 올릴 수 있습니다.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-700 font-bold">
                  <span className="w-6 h-6 rounded-full bg-[#5F0080] text-white flex items-center justify-center text-sm font-black">✓</span>
                  스마트한 초성 검색 지원 (예: 'ㅎㅇ' ➔ 한우)
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-bold">
                  <span className="w-6 h-6 rounded-full bg-[#5F0080] text-white flex items-center justify-center text-sm font-black">✓</span>
                  내용이 바뀌어도 자동 덮어쓰기로 실시간 업데이트
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-bold">
                  <span className="w-6 h-6 rounded-full bg-[#5F0080] text-white flex items-center justify-center text-sm font-black">✓</span>
                  매번 전단을 새로 보낼 필요 없는 실시간 관리
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Customer View & Real-time */}
      <section className="py-24 bg-white border-b border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl mb-6 shadow-sm border border-red-200">🔥</div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight leading-tight break-keep">
                고객의 지갑을 여는<br/><span className="text-red-600">미친 라이브 홈쇼핑 효과</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed break-keep">
                '오늘의 사장님 이야기'로 사장님의 목소리를 곧바로 전달하고, 실시간 품절 처리로 긴박감을 줍니다. 방금 적용한 30% 할인이 고객 전단지에 강력하게 꽂힙니다.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-gray-700 font-bold">
                  <span className="w-6 h-6 shrink-0 mt-0.5 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-black">✓</span>
                  <span className="break-keep">실시간 소통과 즉시 반영 (사장님 이야기 패널)</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700 font-bold">
                  <span className="w-6 h-6 shrink-0 mt-0.5 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-black">✓</span>
                  <span className="break-keep">원클릭 실시간 품절처리로 구매 욕구 및 긴박감 극대화</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700 font-bold">
                  <span className="w-6 h-6 shrink-0 mt-0.5 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-black">✓</span>
                  <span className="break-keep">시선을 사로잡는 강력한 시각적 할인율 배지 시스템</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700 font-bold">
                  <span className="w-6 h-6 shrink-0 mt-0.5 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-black">✓</span>
                  <span className="break-keep">오늘 들어온 신선한 제철 상품의 생생한 사진 실시간 전송</span>
                </li>
              </ul>
            </div>
            <div className="relative rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] overflow-hidden border-8 border-gray-100 transform hover:scale-[1.02] transition-transform duration-500 bg-gray-50 flex justify-center max-w-sm mx-auto lg:mx-0 lg:ml-auto">
              <Image src="/screenshots/customer.png" alt="고객 화면 뷰" width={400} height={800} className="w-full h-auto object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3: No barrier, any business */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-200 transform hover:-translate-y-2 transition-transform duration-500">
              <Image src="/screenshots/register.png" alt="모든 업종 지원" width={800} height={600} className="w-full h-auto object-cover" />
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-6 shadow-sm border border-blue-200">🤝</div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight leading-tight break-keep">
                진입 장벽 제로,<br/><span className="text-blue-600">어떤 업종이든 완벽 호환</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed break-keep">
                고객은 복잡하게 회원가입을 하거나 앱을 설치할 필요가 없습니다! 전달된 링크 하나만 누르면 끝. 직원들을 손쉽게 추가해 알림 푸시를 함께 관리하고 공유하세요.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-700 font-bold">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-black">✓</span>
                  회원가입 필요 없는 완벽한 웹앱(PWA) 접근성
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-bold">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-black">✓</span>
                  마트, 정육점, 청과야채 등 맞춤형 폼 자동 적용
                </li>
                <li className="flex items-center gap-3 text-gray-700 font-bold">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-black">✓</span>
                  직원 다중 접속 및 유기적인 협업 관리 기능
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-[#5F0080] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>
        
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight drop-shadow-md">
            혁신적인 비용 절감,<br/>
            매출 폭발을 경험하세요!
          </h2>
          <p className="text-xl text-purple-100 mb-10 font-medium leading-relaxed drop-shadow-sm">
            기존 문자 메시지 발송 대비 입력 속도 극단적 단축!<br/>
            업무 시간 절약은 물론 <span className="font-bold text-yellow-300">문자 비용을 0원</span>으로 혁신적으로 줄였습니다.<br/>
            마치 라이브 홈쇼핑을 운영하듯 도전적인 장사를 시작해보세요.
          </p>
          <Link href="/register" className="inline-block px-12 py-5 rounded-full bg-yellow-400 text-yellow-900 font-black text-xl hover:bg-yellow-300 hover:-translate-y-1 transition-all shadow-[0_10px_30px_rgba(250,204,21,0.4)]">
            지금 무료로 스토어 개설하기
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-center text-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="font-black text-3xl text-white mb-4 tracking-tight">NAO3</div>
          <p className="mb-2">동네 사장님들을 위한 최고의 매출 파트너.</p>
          <p>© 2026 NAO3 All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
