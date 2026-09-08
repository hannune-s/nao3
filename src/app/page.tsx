import DemoButton from '@/components/DemoButton';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 selection:bg-[#5F0080] selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-[#5F0080] tracking-tight">NAO3</span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#5F0080]/10 text-[#5F0080] text-[10px] font-bold">사장님 필수앱</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-[#5F0080] transition-colors">
              어드민 로그인
            </Link>
            <DemoButton className="text-sm font-bold text-[#5F0080] bg-purple-50 hover:bg-purple-100 border border-purple-200 px-4 py-2.5 rounded-full transition-all">
              가입 없이 체험하기
            </DemoButton>
            <Link href="/register" className="text-sm font-bold text-white bg-[#5F0080] hover:bg-purple-900 px-4 py-2.5 rounded-full shadow-lg shadow-purple-900/20 transition-all hover:scale-105">
              무료 스토어 개설
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 pb-20 md:pb-32 overflow-hidden bg-white">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-purple-200/50 to-[#5F0080]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-yellow-100 to-purple-100/50 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 shadow-sm text-[#5F0080] text-xs font-bold tracking-widest mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            문자 발송 비용 평생 0원
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl lg:text-5xl lg:text-7xl font-black text-gray-900 tracking-tight mb-8 leading-[1.1] break-keep animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            라이브 홈쇼핑을 내 매장으로.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5F0080] to-purple-500">
              매출이 폭발하는 1초 전단지
            </span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-500 mb-12 max-w-3xl mx-auto font-medium break-keep leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            복잡한 앱 설치도, 값비싼 문자 비용도 필요 없습니다. 단 3초면 끝나는 상품 등록부터 고객의 지갑을 여는 실시간 품절 알림까지, NAO3가 동네 장사를 혁신합니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <DemoButton className="w-full sm:w-auto px-8 py-5 rounded-full bg-white text-[#5F0080] border-2 border-[#5F0080] font-black text-lg hover:bg-purple-50 hover:scale-105 transition-transform">
              👀 가입 없이 어드민 체험하기
            </DemoButton>
            <Link href="/register" className="w-full sm:w-auto px-8 py-5 rounded-full bg-[#5F0080] text-white font-black text-lg hover:scale-105 transition-transform shadow-[0_10px_30px_rgba(95,0,128,0.3)]">
              지금 바로 시작하기 (무료)
            </Link>
          </div>
        </div>
      </section>

      {/* Value Proposition - 핵심 가치 */}
      <section className="py-16 md:py-28 bg-gradient-to-b from-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-6 md:p-10 left-10 w-72 h-72 bg-purple-500 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-500 rounded-full blur-[150px]"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] break-keep mb-6">
              손님이 오길 기다리지 마세요.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                손님의 스마트폰으로 직접 찾아가세요.
              </span>
            </h2>
            <div className="w-20 h-1.5 bg-gradient-to-r from-[#5F0080] to-purple-400 mx-auto rounded-full mt-8"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-purple-900 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              <div className="relative bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 h-full hover:border-purple-500/50 transition-all duration-500">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-3xl mb-6 shadow-lg shadow-purple-900/30">📱</div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight break-keep">디지털 상권 장악</h3>
                <p className="text-gray-300 leading-relaxed text-[15px] break-keep">
                  손님들의 스마트폰 바탕화면에 우리 가게 앱을 심어, 매 순간 단골들의 손 안에서 <strong className="text-white font-bold">살아 숨 쉬는 직거래 상권</strong>을 만듭니다.
                </p>
                <div className="mt-6 pt-6 border-t border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs">👩</div>
                      <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-xs">👨</div>
                      <div className="w-8 h-8 rounded-full bg-purple-400 flex items-center justify-center text-xs">👵</div>
                    </div>
                    <span className="text-xs text-gray-400 font-bold">단골 고객이 내 손 안에</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              <div className="relative bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 h-full hover:border-orange-500/50 transition-all duration-500">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-3xl mb-6 shadow-lg shadow-orange-900/30">🔔</div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight break-keep">폭염·불황 돌파구</h3>
                <p className="text-gray-300 leading-relaxed text-[15px] break-keep">
                  밖으로 한 걸음도 나오지 않는 손님들의 스마트폰 화면을 <strong className="text-white font-bold">푸시 알림으로 번쩍 울려</strong>, 지금 당장 가게 문을 열고 들이닥치게 만듭니다.
                </p>
                <div className="mt-6 pt-6 border-t border-gray-700/50">
                  <div className="flex items-center gap-3 bg-gray-900/50 rounded-xl p-3">
                    <span className="text-xl">🔥</span>
                    <div>
                      <p className="text-[11px] text-gray-500 font-bold">방금 도착한 알림</p>
                      <p className="text-[13px] text-white font-bold break-keep">나오삼마트: 사과 한 박스 천원! 선착순!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              <div className="relative bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 h-full hover:border-yellow-500/50 transition-all duration-500">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-3xl mb-6 shadow-lg shadow-yellow-900/30">👊</div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight break-keep">장사의 주도권 회복</h3>
                <p className="text-gray-300 leading-relaxed text-[15px] break-keep">
                  플랫폼에 수수료를 뜯기는 구조가 아니라, <strong className="text-white font-bold">사장이 직접 단골과 소통하며 매출을 끄집어내는</strong> 진짜 장사의 맛을 경험하세요.
                </p>
                <div className="mt-6 pt-6 border-t border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <p className="text-2xl font-black text-red-400 line-through opacity-60">15~30%</p>
                      <p className="text-[10px] text-gray-500 font-bold">플랫폼 수수료</p>
                    </div>
                    <span className="text-2xl">→</span>
                    <div className="text-center">
                      <p className="text-2xl font-black text-yellow-400">0%</p>
                      <p className="text-[10px] text-gray-500 font-bold">NAO3 수수료</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 1: Admin Speed */}
      <section className="py-20 md:py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              {/* CSS UI Mockup - Admin */}
              <div className="relative rounded-3xl bg-white shadow-[0_30px_60px_rgba(0,0,0,0.08)] border border-gray-100 p-6 sm:p-8 transform rotate-1 hover:rotate-0 transition-all duration-500 max-w-lg mx-auto">
                <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <span className="ml-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">사장님 초고속 어드민</span>
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-400 flex items-center">
                      <span className="w-4 h-4 mr-2 opacity-50">🔍</span> 상품명 (초성 'ㅎㅇ' 검색)
                    </div>
                  </div>
                  <div className="flex gap-2 relative">
                    <div className="flex-1 bg-white border border-purple-200 shadow-sm rounded-xl p-4 text-[15px] text-gray-800 font-bold border-l-4 border-l-[#5F0080]">
                      한우 국거리 1++ (국산)
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-400">
                      세일 가격 (숫자만)
                    </div>
                    <div className="w-24 bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-700 font-black text-center flex items-center justify-center">
                      30%
                    </div>
                  </div>
                  <div className="w-full bg-[#5F0080] rounded-xl p-4 text-white text-center font-black shadow-md mt-6 text-lg hover:bg-purple-900 cursor-pointer transition-colors">
                    + 1초만에 전단지에 올리기
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -right-6 bg-yellow-400 text-yellow-900 font-black text-sm px-6 py-3 rounded-full shadow-lg transform -rotate-12 animate-bounce">
                  업무 시간 90% 단축! ⚡
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="text-sm font-black text-[#5F0080] tracking-widest uppercase mb-3">Ultra-fast Input</h2>
              <h3 className="text-2xl md:text-3xl lg:text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-[1.2] break-keep">
                바쁜 매장 업무 중에도,<br />단 1초면 세일 등록 끝.
              </h3>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed break-keep">
                스마트폰 하나면 충분합니다. <strong>초성 검색 지원</strong>으로 긴 단어를 칠 필요조차 없으며, 상품 내용이 바뀌면 <strong>자동으로 덮어쓰기</strong>되어 고객 화면에 실시간으로 반영됩니다.
              </p>
              <div className="space-y-8 mt-10">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#5F0080]/10 flex items-center justify-center text-2xl shadow-sm border border-purple-100">🎯</div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">초성 검색 & 간편 입력</h4>
                    <p className="text-gray-600 leading-relaxed break-keep">'ㅎㅇ'만 쳐도 한우가 자동 완성! 매대에 손님들이 밀려있어도 누구나 손쉽게 전단지를 만들 수 있습니다.</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#5F0080]/10 flex items-center justify-center text-2xl shadow-sm border border-purple-100">🔄</div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">중복 없는 스마트 덮어쓰기</h4>
                    <p className="text-gray-600 leading-relaxed break-keep">가격을 잘못 올렸거나 재고가 변경되었나요? 똑같은 상품을 입력하면 스마트하게 덮어쓰기가 되어 전단을 매번 새로 보낼 필요가 없습니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 2: Customer Live View */}
      <section className="py-20 md:py-32 bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gray-50/50 -skew-x-12 origin-top transform translate-x-32 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-sm font-black text-red-600 tracking-widest uppercase mb-3">Live Shopping Vibe</h2>
              <h3 className="text-2xl md:text-3xl lg:text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-[1.2] break-keep">
                고객의 지갑을 여는<br /><span className="text-red-600">미친 라이브 홈쇼핑 효과</span>
              </h3>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed break-keep">
                단순하고 지루한 종이 전단지가 아닙니다. 사장님의 목소리를 실시간으로 전하고, 눈앞에서 품절되는 생생한 경험으로 고객의 발걸음을 매장으로 강하게 이끕니다.
              </p>
              <div className="space-y-8 mt-10">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-red-50 flex items-center justify-center text-2xl border border-red-100">✍️</div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">오늘의 사장님 이야기</h4>
                    <p className="text-gray-600 leading-relaxed break-keep">"어머님들! 방금 막 산지직송 배 들어왔습니다!" 고객 화면 최상단에 메시지를 띄워 동네 주민들과 생생하게 소통하세요.</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-red-50 flex items-center justify-center text-2xl border border-red-100">🔥</div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">실시간 품절로 긴박감 극대화</h4>
                    <p className="text-gray-600 leading-relaxed break-keep">버튼 클릭 한 번에 '품절' 도장이 쾅! 찍히며, 망설이는 고객의 구매 욕구를 미친듯이 자극합니다.</p>
                  </div>
                </div>
                                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-red-50 flex items-center justify-center text-2xl border border-red-100">⏰</div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">오후 마감 떨이도 실시간 라이브로!</h4>
                    <p className="text-gray-600 leading-relaxed break-keep">오늘 남은 재고, 폐기할까 걱정 마세요. "마감 30분 전 반짝 세일!" 알림을 즉시 보내 남은 재고를 싹 비우는 짜릿한 라이브 장사가 가능합니다.</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-red-50 flex items-center justify-center text-2xl border border-red-100">🏷️</div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">시선을 뺏는 시각적 할인율</h4>
                    <p className="text-gray-600 leading-relaxed break-keep">방금 적용한 30% 할인이 눈에 확 꽂히는 배지 형태로 즉시 표출됩니다. 오늘 들어온 신선한 제철 상품 사진도 실시간으로 노출하세요.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CSS UI Mockup - Customer Mobile */}
            <div className="relative max-w-[340px] mx-auto w-full lg:mr-0">
              <div className="relative rounded-[2.5rem] bg-[#FAFAFA] shadow-[0_30px_80px_rgba(0,0,0,0.12)] border border-gray-200 transform hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                
                <div className="h-[700px] relative flex flex-col no-scrollbar">
                  
                  {/* Header */}
                  <div className="bg-[#5F0080] py-10 text-center">
                    <h1 className="text-[#E5D7B7] font-bold text-[10px] tracking-[0.3em] uppercase mb-2 border border-[#E5D7B7]/30 px-3 py-1 rounded-full inline-block">NAO3</h1>
                    <h2 className="text-white font-black text-3xl tracking-tight">나오삼마트</h2>
                    <div className="mt-5 inline-block bg-[#F8F0FF] text-[#5F0080] text-[13px] font-black px-4 py-2 rounded-full border border-[#E8D4FF] shadow-sm">
                      행사 기간 2026.9.6 ~ 2026.9.7
                    </div>
                  </div>
                  
                  {/* Boss Story */}
                  <div className="p-4 mt-2">
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <span className="text-[16px]">🖋️</span>
                      <span className="font-black text-[14px] text-gray-900 uppercase tracking-widest">오늘의 사장님 이야기</span>
                    </div>
                    <div className="bg-[#F5F0E6] p-5 border border-[#E8DFD1] text-[14px] font-medium leading-[1.6] text-gray-800 shadow-sm">
                      어머님들 지금 바로 나오시면 사과한박스 천원! 선착순 2명!! 너무 더워서 눈에 뵈는게 없어요ㅋㅋㅋㅋㅋㅋㅋㅋ얼른 나오세용~~~~~
                    </div>
                  </div>

                  {/* Product List */}
                  <div className="p-4 flex-1 space-y-3">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[11px] bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded font-bold">1++</span>
                          <span className="text-[11px] bg-gray-100 text-gray-500 border border-gray-200 px-1.5 py-0.5 rounded font-bold">국산</span>
                        </div>
                        <h4 className="font-black text-[15px] text-gray-800">한우 등심 200g</h4>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div className="bg-red-500 text-white font-black text-sm px-2 py-1 rounded">30%</div>
                        <div>
                          <div className="text-red-500 font-black text-xl">10,000원</div>
                          <div className="text-xs text-gray-400 line-through text-right">15,000원</div>
                        </div>
                      </div>
                    </div>

                    {/* Sold out item */}
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden opacity-50 grayscale-[0.5]">
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1.5px] z-10 flex items-center justify-center">
                        <span className="text-3xl font-black text-red-600 border-4 border-red-600 px-4 py-1 transform -rotate-12 rounded-lg opacity-90 tracking-widest drop-shadow-md">품절</span>
                      </div>
                      <div>
                        <h4 className="font-black text-[15px] text-gray-800 mt-2">샤인머스켓 1박스</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-500 font-black text-xl">18,000원</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3: Live Photo & Special Deals */}
      <section className="py-20 md:py-32 bg-gray-50/50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 relative flex justify-center">
              {/* CSS UI Mockup - Photo Upload Feature */}
              <div className="relative rounded-[2.5rem] bg-white p-5 shadow-[0_30px_80px_rgba(0,0,0,0.1)] border border-gray-200 transform -rotate-2 hover:rotate-0 transition-all duration-500 max-w-sm w-full">
                <div className="bg-[#5F0080] text-white rounded-2xl py-4 px-4 text-center font-black tracking-widest mb-5 shadow-inner">
                  오늘의 추천 특가
                </div>
                <div className="relative rounded-2xl overflow-hidden mb-5 group shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 flex flex-col justify-end p-5">
                    <span className="text-white font-black text-xl drop-shadow-md mb-1">산지직송 달콤 꿀수박 🍉</span>
                    <span className="text-yellow-300 font-bold text-sm tracking-wide">지금 막 들어왔어요! 30수 한정</span>
                  </div>
                  {/* Dummy Unsplash Image */}
                  <img src="https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=800&q=80" alt="수박" className="w-full h-72 object-cover transform group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="flex justify-between items-end px-3 pb-2">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-400 line-through mb-1">25,000원</span>
                    <span className="font-black text-3xl text-red-600 tracking-tight">19,900<span className="text-xl">원</span></span>
                  </div>
                  <div className="bg-red-50 text-red-600 border border-red-200 font-bold px-4 py-2 rounded-xl text-sm">
                    🚨 선착순 득템
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 bg-red-500 text-white font-black text-sm px-6 py-3 rounded-full shadow-xl transform rotate-12 animate-pulse border-4 border-white">
                  실시간 사진 업로드! 📸
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="text-sm font-black text-[#5F0080] tracking-widest uppercase mb-3">Vivid Real-time Photo</h2>
              <h3 className="text-2xl md:text-3xl lg:text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-[1.2] break-keep">
                방금 들어온 제철 상품,<br /><span className="text-[#5F0080]">사진 한 장으로 시선 집중.</span>
              </h3>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed break-keep">
                텍스트만으로는 신선함이 다 안 담기나요? <strong>'오늘의 추천 특가'</strong> 메뉴를 통해 매장에 방금 들어온 싱싱한 고기, 과일 사진을 현장에서 바로 찍어 올리세요. 생생한 사진 한 장이 백 마디 말보다 강력하게 고객의 식욕과 구매 욕구를 200% 자극합니다.
              </p>
              <div className="space-y-8 mt-10">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#5F0080]/10 flex items-center justify-center text-2xl shadow-sm border border-purple-100">📸</div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">현장감 넘치는 실시간 사진 등록</h4>
                    <p className="text-gray-600 leading-relaxed break-keep">복잡한 편집 없이 스마트폰으로 방금 찍은 사진을 그대로! 산지의 신선함을 고객의 스마트폰으로 즉시 전송하세요.</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#5F0080]/10 flex items-center justify-center text-2xl shadow-sm border border-purple-100">✨</div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">압도적인 클릭률과 매출 상승</h4>
                    <p className="text-gray-600 leading-relaxed break-keep">글씨만 있는 딱딱한 전단지보다, 먹음직스러운 이미지형 특가 상품이 3배 이상 높은 주목도와 구매 전환율을 보여줍니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

            {/* Feature 4: Smart Icons & Bakery */}
      <section className="py-20 md:py-32 bg-white overflow-hidden relative border-t border-gray-100">
        <div className="absolute top-0 left-0 w-full h-1/2 bg-yellow-50/30 transform -skew-y-3 origin-bottom-left pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-sm font-black text-yellow-600 tracking-widest uppercase mb-3">Smart Auto Icons</h2>
              <h3 className="text-2xl md:text-3xl lg:text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-[1.2] break-keep">
                제품에 찰떡인 귀여운 아이콘,<br /><span className="text-yellow-500">어떤 업종이든 생동감 200%.</span>
              </h3>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed break-keep">
                마트나 정육점이 아니어도 걱정 마세요! 베이커리, 반찬가게 등 어떤 업종이든 상품명에 맞는 귀여운 아이콘이 <strong>고객 화면에 자동으로 매칭</strong>되어 생동감 넘치는 세일 화면이 연출됩니다.
              </p>
              <div className="space-y-8 mt-10">
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-yellow-100 flex items-center justify-center text-2xl border border-yellow-200">🍞</div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">업종 제한 없는 마법 같은 자동화</h4>
                    <p className="text-gray-600 leading-relaxed break-keep">"우유식빵"을 입력하면 빵 아이콘이, "사과"를 입력하면 과일 아이콘이 고객 화면에 쏙! 밋밋한 텍스트가 순식간에 아기자기한 디자인으로 변신하여 고객의 눈을 즐겁게 합니다.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CSS UI Mockup - Bakery Example */}
            <div className="relative max-w-md mx-auto w-full">
              <div className="bg-gray-50 rounded-3xl p-6 shadow-2xl border border-gray-200 relative transform hover:scale-[1.02] transition-transform duration-500">
                <div className="absolute -top-4 -left-4 bg-yellow-400 text-yellow-900 font-black px-4 py-2 rounded-full shadow-md transform -rotate-6">베이커리 적용 예시</div>
                
                {/* Admin Input */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
                  <div className="text-xs font-bold text-gray-400 mb-3 tracking-wider">사장님 입력 화면</div>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 font-bold border-l-4 border-l-yellow-400">
                        당일 갓구운 우유식빵
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-800 font-bold">
                        3,500원
                      </div>
                    </div>
                    <div className="w-full bg-yellow-400 rounded-lg p-3 text-yellow-900 text-center font-bold shadow-sm">
                      + 등록하기
                    </div>
                  </div>
                </div>

                <div className="text-center text-gray-300 text-2xl mb-6 animate-bounce">⬇</div>

                {/* Customer Output */}
                <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden">
                  <div className="bg-[#FAFAFA] p-6">
                    <div className="text-xs font-bold text-gray-400 mb-3 tracking-wider text-center">고객 전단지 화면</div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center relative overflow-hidden">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-3xl">
                          🍞
                        </div>
                        <div>
                          <h4 className="font-black text-[16px] text-gray-800">당일 갓구운 우유식빵</h4>
                          <span className="text-[11px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-bold mt-1 inline-block">따끈따끈</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-900 font-black text-xl">3,500원</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

            {/* Feature 5: Industry Previews (NEW) */}
      <section className="py-20 md:py-32 bg-gray-50 border-t border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-sm font-black text-[#5F0080] tracking-widest uppercase mb-3">Custom For Every Store</h2>
          <h3 className="text-2xl md:text-3xl lg:text-4xl lg:text-5xl font-black text-gray-900 mb-6 tracking-tight leading-[1.2]">
            내 가게는 어떻게 보일까요?<br />업종별 찰떡 맞춤 화면
          </h3>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-medium break-keep">
            사장님들은 백 마디 글보다 한 장의 그림으로 이해하는 게 빠르죠!<br/>
            가짜 상호명이지만 진짜 내 가게인 것처럼, 각 업종에 맞게 상호명과 아이콘이 자동으로 세팅된 고객 화면을 미리 확인해 보세요.
          </p>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 md:p-10">
            {/* Mockup 1: Butcher */}
            <div className="relative rounded-[2.5rem] bg-[#FAFAFA] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-200 overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-500 hover:shadow-[0_30px_60px_rgba(95,0,128,0.15)]">
              <div className="bg-[#5F0080] py-8 text-center relative shadow-inner">
                <h1 className="text-[#E5D7B7] font-bold text-[9px] tracking-[0.2em] uppercase mb-2 border border-[#E5D7B7]/30 px-3 py-1 rounded-full inline-block">NAO3</h1>
                <h2 className="text-white font-black text-2xl tracking-tight">우리동네 정육점</h2>
              </div>
              <div className="p-5 flex-1">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-[18px]">🖋️</span>
                  <span className="font-black text-[14px] text-gray-900 tracking-widest">한우 갈비 사전예약 🥩</span>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-2xl">🥩</div>
                    <div className="flex-1">
                      <div className="flex gap-1 mb-1">
                        <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">1++</span>
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold">국산</span>
                      </div>
                      <h4 className="font-black text-[15px] text-gray-800">명품 특수부위 모듬</h4>
                    </div>
                  </div>
                  <div className="text-right mt-2 flex items-center justify-end gap-2">
                     <span className="bg-red-500 text-white font-black text-xs px-2 py-0.5 rounded">사전예약</span>
                    <div className="text-red-600 font-black text-xl">89,000원</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup 2: Fruits */}
            <div className="relative rounded-[2.5rem] bg-[#FAFAFA] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-200 overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-500 delay-100 hover:shadow-[0_30px_60px_rgba(95,0,128,0.15)]">
              <div className="bg-[#5F0080] py-8 text-center relative shadow-inner">
                <h1 className="text-[#E5D7B7] font-bold text-[9px] tracking-[0.2em] uppercase mb-2 border border-[#E5D7B7]/30 px-3 py-1 rounded-full inline-block">NAO3</h1>
                <h2 className="text-white font-black text-2xl tracking-tight">싱싱청과</h2>
              </div>
              <div className="p-5 flex-1">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-[18px]">🖋️</span>
                  <span className="font-black text-[14px] text-gray-900 tracking-widest">오늘 들어온 제철 과일 🍎</span>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-2xl">🍎</div>
                    <div className="flex-1">
                      <div className="flex gap-1 mb-1">
                        <span className="text-[10px] bg-yellow-100 text-yellow-600 px-1.5 py-0.5 rounded font-bold">당도최고</span>
                      </div>
                      <h4 className="font-black text-[15px] text-gray-800">꿀사과 1박스 (5kg)</h4>
                    </div>
                  </div>
                  <div className="text-right mt-2 flex items-center justify-end gap-2">
                    <span className="bg-red-500 text-white font-black text-xs px-2 py-0.5 rounded">30%</span>
                    <div className="text-red-600 font-black text-xl">25,000원</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mockup 3: Side Dish */}
            <div className="relative rounded-[2.5rem] bg-[#FAFAFA] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-200 overflow-hidden flex flex-col transform hover:-translate-y-2 transition-transform duration-500 delay-200 hover:shadow-[0_30px_60px_rgba(95,0,128,0.15)]">
              <div className="bg-[#5F0080] py-8 text-center relative shadow-inner">
                <h1 className="text-[#E5D7B7] font-bold text-[9px] tracking-[0.2em] uppercase mb-2 border border-[#E5D7B7]/30 px-3 py-1 rounded-full inline-block">NAO3</h1>
                <h2 className="text-white font-black text-2xl tracking-tight">엄마손 반찬가게</h2>
              </div>
              <div className="p-5 flex-1">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-[18px]">🖋️</span>
                  <span className="font-black text-[14px] text-gray-900 tracking-widest">오늘의 스페셜 반찬 🍱</span>
                </div>
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-2xl">🍱</div>
                    <div className="flex-1">
                      <div className="flex gap-1 mb-1">
                        <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold">당일조리</span>
                      </div>
                      <h4 className="font-black text-[15px] text-gray-800">수제 밥도둑 양념게장</h4>
                    </div>
                  </div>
                  <div className="text-right mt-2 flex items-center justify-end gap-2">
                    <span className="bg-red-500 text-white font-black text-xs px-2 py-0.5 rounded">20%</span>
                    <div className="text-red-600 font-black text-xl">12,000원</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 6: Flexibility & Zero Barrier */}
      <section className="py-20 md:py-32 bg-gray-900 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl md:text-3xl lg:text-4xl lg:text-5xl font-black mb-6 tracking-tight">
            고객은 가입 NO, 사장님은 제약 NO.
          </h2>
          <p className="text-xl text-gray-400 mb-20 max-w-3xl mx-auto font-medium leading-relaxed break-keep">
            슈퍼, 마트, 정육점, 청과야채 등 어떤 업종이든 사장님에게 찰떡같이 맞는 맞춤형 폼이 제공됩니다.<br />
            고객은 귀찮은 앱 설치 없이 링크 하나로 모든 세일 정보를 실시간으로 받아봅니다.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-gray-800/40 border border-gray-700/50 p-6 md:p-10 rounded-3xl backdrop-blur-md hover:bg-gray-800/60 transition-colors">
              <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-blue-500/30">🏪</div>
              <h3 className="text-2xl font-bold mb-4 text-white">업종별 완벽 맞춤형 폼</h3>
              <p className="text-gray-400 leading-relaxed break-keep">마트 전용, 정육점 등급별(1++, 1등급) 폼 등 내 매장에 꼭 맞는 맞춤형 어드민 환경을 자동으로 제공합니다.</p>
            </div>
            <div className="bg-gray-800/40 border border-gray-700/50 p-6 md:p-10 rounded-3xl backdrop-blur-md hover:bg-gray-800/60 transition-colors">
              <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-green-500/30">🤝</div>
              <h3 className="text-2xl font-bold mb-4 text-white">강력한 직원 다중 협업</h3>
              <p className="text-gray-400 leading-relaxed break-keep">여러 명의 직원을 어드민에 초대하세요. 매장 어디서나 각자의 스마트폰으로 동시에 세일 푸시를 관리할 수 있습니다.</p>
            </div>
            <div className="bg-gray-800/40 border border-gray-700/50 p-6 md:p-10 rounded-3xl backdrop-blur-md hover:bg-gray-800/60 transition-colors">
              <div className="w-16 h-16 bg-yellow-500/20 text-yellow-400 rounded-2xl flex items-center justify-center text-3xl mb-6 border border-yellow-500/30">🔗</div>
              <h3 className="text-2xl font-bold mb-4 text-white">설치 제로 PWA 웹앱</h3>
              <p className="text-gray-400 leading-relaxed break-keep">구글 플레이스토어에 갈 필요가 없습니다. 카톡으로 고객에게 링크 하나만 보내면 그곳이 바로 훌륭한 단골 전용 앱이 됩니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Developer's Note / Mission Statement */}
      <section className="py-20 md:py-32 bg-white relative">
        <div className="absolute inset-0 bg-gray-50/50 skew-y-3 transform origin-bottom-left -z-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="bg-white rounded-3xl p-6 md:p-10 md:p-16 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#5F0080] to-purple-400"></div>
            <div className="absolute -top-6 md:p-10 -right-10 text-9xl text-gray-50 font-serif opacity-50 select-none">"</div>
            
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 mb-8 leading-tight break-keep">
              "대기업 수수료에 지치고, 날씨 탓에 한숨 쉬는 자영업자 사장님들을 위해 만들었습니다."
            </h2>
            
            <div className="space-y-6 text-lg text-gray-600 leading-relaxed font-medium break-keep">
              <p>
                이 앱은 단순한 프로그램이 아닙니다. 매일 숨이 턱턱 막히는 폭염과 불황 속에서, 가게 문을 열어놓고도 손님이 오기만을 피가 마르게 기다리던 전국의 모든 마트·정육점 사장님들을 진짜로 돕기 위해 뼛속까지 고민해 만든 어플입니다.
              </p>
              <p>
                비싼 광고비에 휘둘리고 플랫폼에 수수료를 다 뜯기며 지쳐가는 자영업자들이, 이제는 오직 내 힘으로 단골손님들과 직거래하고 장사의 주도권을 되찾기를 바랍니다. 남들이 불황이라 한숨 쉴 때, 사장님들이 다시금 신나게 장사판을 뒤흔들 수 있도록 만드는 것—그것이 바로 이 앱을 만든 단 하나의 이유입니다.
              </p>
              <p className="text-[#5F0080] font-bold text-xl pt-4">
                우리는 앞으로도 겉만 번지르르한 플랫폼이 아니라, 오직 현장에서 땀 흘려 장사하는 자영업자 사장님들의 실질적인 매출을 끌어올리고 든든하게 뒤를 받쳐줄 수 있는 진짜 실전 어플들을 계속해서 만들어 나갈 것입니다. 기대해주세요. 사장님들을 위한 미친 앱으로 보답하겠습니다
              </p>
            </div>
            
            <div className="mt-12 flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl shadow-inner border border-gray-200">
                👨‍🍳
              </div>
              <div>
                <p className="font-bold text-gray-900">NAO3 팀 일동</p>
                <p className="text-sm text-gray-500">사장님들의 성공을 진심으로 응원합니다</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-40 bg-[#5F0080] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-[150px] opacity-40 pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="text-7xl mb-10 animate-bounce">🚀</div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl lg:text-5xl lg:text-7xl font-black text-white mb-10 tracking-tight drop-shadow-lg leading-tight">
            비용은 영원히 줄이고,<br/>매출은 지금 바로 터트리세요.
          </h2>
          <p className="text-xl md:text-3xl text-purple-100 mb-16 font-medium leading-relaxed drop-shadow-md break-keep max-w-3xl mx-auto">
            매달 수십만 원씩 나가는 문자 발송 비용, 이제 평생 0원입니다.<br className="hidden md:block"/>
            지금 바로 무료로 가입하고 1초 모바일 전단지의 기적을 경험하세요.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/register" className="px-8 py-4 md:px-14 md:py-6 rounded-full bg-yellow-400 text-yellow-900 font-black text-xl md:text-2xl w-full sm:w-auto inline-block hover:bg-yellow-300 hover:scale-105 transition-all shadow-[0_15px_40px_rgba(250,204,21,0.5)]">
              지금 당장 내 매장 등록하기 (무료)
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-gray-500 py-16 text-center text-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
          <div className="font-black text-4xl text-white mb-6 tracking-tight">NAO3</div>
          <p className="mb-2 font-medium text-gray-400 text-lg">동네 사장님들을 위한 최고의 매출 파트너.</p>
          <p className="mb-10 text-gray-600">라이브 홈쇼핑 부럽지 않은 미친 전단지 앱</p>
          <div className="w-24 h-[1px] bg-gray-800 mb-10"></div>
          <p>© 2026 NAO3 All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
