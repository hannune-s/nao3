"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';

const getIconForProduct = (name: string) => {
  if (!name) return '✨';
  const n = name.replace(/\s/g, '');
  
  // 과일류
  if (n.includes('사과')) return '🍎';
  if (n.includes('귤') || n.includes('오렌지') || n.includes('한라봉') || n.includes('레몬')) return '🍊';
  if (n.includes('바나나')) return '🍌';
  if (n.includes('포도') || n.includes('샤인머스캣')) return '🍇';
  if (n.includes('수박')) return '🍉';
  if (n.includes('딸기')) return '🍓';
  if (n.includes('복숭아')) return '🍑';
  if (n.includes('참외') || n.includes('메론') || n.includes('멜론')) return '🍈';
  if (n.includes('배')) return '🍐';
  if (n.includes('토마토')) return '🍅';
  if (n.includes('블루베리')) return '🫐';
  if (n.includes('키위')) return '🥝';
  if (n.includes('망고')) return '🥭';
  if (n.includes('체리')) return '🍒';
  
  // 채소류
  if (n.includes('마늘')) return '🧄';
  if (n.includes('양파')) return '🧅';
  if (n.includes('파') || n.includes('부추')) return '🌱';
  if (n.includes('고추')) return '🌶️';
  if (n.includes('감자')) return '🥔';
  if (n.includes('고구마')) return '🍠';
  if (n.includes('호박')) return '🎃';
  if (n.includes('당근')) return '🥕';
  if (n.includes('버섯')) return '🍄';
  if (n.includes('옥수수')) return '🌽';
  if (n.includes('브로콜리')) return '🥦';
  if (n.includes('배추') || n.includes('상추') || n.includes('깻잎') || n.includes('시금치') || n.includes('나물') || n.includes('아욱') || n.includes('봄동')) return '🥬';
  if (n.includes('오이')) return '🥒';
  
  // 수산물
  if (n.includes('오징어') || n.includes('주꾸미') || n.includes('쭈꾸미') || n.includes('문어') || n.includes('낙지')) return '🦑';
  if (n.includes('갈치') || n.includes('고등어') || n.includes('동태') || n.includes('생태') || n.includes('명태') || n.includes('꽁치') || n.includes('연어') || n.includes('생선') || n.includes('멸치') || n.includes('수산')) return '🐟';
  if (n.includes('전복') || n.includes('바지락') || n.includes('조개') || n.includes('굴') || n.includes('홍합') || n.includes('가리비') || n.includes('꼬막')) return '🦪';
  if (n.includes('새우') || n.includes('대하')) return '🦐';
  if (n.includes('게') || n.includes('크랩')) return '🦀';
  if (n.includes('미역') || n.includes('다시마')) return '🌿';
  
  // 정육
  if (n.includes('소') || n.includes('한우') || n.includes('등심') || n.includes('안심') || n.includes('국거리') || n.includes('불고기') || n.includes('스테이크')) return '🥩';
  if (n.includes('돼지') || n.includes('삼겹') || n.includes('목살') || n.includes('갈비') || n.includes('앞다리') || n.includes('항정') || n.includes('한돈')) return '🥓';
  if (n.includes('닭') || n.includes('치킨')) return '🍗';
  if (n.includes('계란') || n.includes('달걀') || n.includes('메추리알')) return '🥚';
  
  // 공산품/기타
  if (n.includes('우유')) return '🥛';
  if (n.includes('라면') || n.includes('면')) return '🍜';
  if (n.includes('참치') || n.includes('스팸') || n.includes('통조림') || n.includes('골뱅이') || n.includes('만두')) return '🥫';
  if (n.includes('커피') || n.includes('맥심') || n.includes('카누')) return '☕';
  if (n.includes('과자') || n.includes('고래밥')) return '🍪';
  if (n.includes('콜라') || n.includes('사이다') || n.includes('음료')) return '🥤';
  if (n.includes('휴지') || n.includes('롤') || n.includes('티슈') || n.includes('깨끗한나라')) return '🧻';
  if (n.includes('기름') || n.includes('유') || n.includes('식용유') || n.includes('참기름')) return '🫙';
  if (n.includes('김')) return '🍙';
  if (n.includes('세제') || n.includes('샤프란') || n.includes('퐁퐁')) return '🫧';
  
  return '✨'; // 기본 아이콘
};

interface SaleItem {
  id: string;
  category: string;
  product_name: string;
  quantity: string;
  sale_price: string;
  discount_rate?: number | null;
  created_at: string;
  is_sold_out?: boolean;
}

export default function CustomerSalePage() {
  const params = useParams();
  const storeSlug = params.storeId as string;
  const [items, setItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnded, setIsEnded] = useState(false);
  const [periodText, setPeriodText] = useState('');
  const [bossMessage, setBossMessage] = useState('');
  const [storeName, setStoreName] = useState('우리동네 마트');
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [isStoreInfoOpen, setIsStoreInfoOpen] = useState(false); // 가게 이름 상태 추가

  useEffect(() => {
    if (!storeSlug) return;

    const fetchItems = async () => {
      try {
        // 0. URL의 storeId를 기반으로 해당 가게 상호명 가져오기 (미리보기 모드라도 항상 가져와서 가게정보/특가 정보를 렌더링해야 함)
        const { data: store } = await supabase
          .from('nao3_stores')
          .select('id, store_name, address, phone, operating_hours, closed_days, special_image_url, special_title, special_price, special_message')
          .eq('slug', storeSlug)
          .single();
          
        if (store) {
          setStoreName(store.store_name);
          setStoreInfo(store);
        }

        const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
        if (isPreview) {
          const stagedSettings = JSON.parse(localStorage.getItem('nao3_staging_settings') || '{}');
          if (stagedSettings.storeName) setStoreName(stagedSettings.storeName);
          
          if (stagedSettings.saleStart && stagedSettings.saleEnd) {
            const start = new Date(stagedSettings.saleStart);
            const end = new Date(stagedSettings.saleEnd);
            const formattedStart = start.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' });
            const formattedEnd = end.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' });
            setPeriodText(formattedStart + ' ~ ' + formattedEnd);
          }
          setBossMessage(stagedSettings.bossMessage || '');

          const stagedItems = JSON.parse(localStorage.getItem('nao3_staging_items') || '[]');
          setItems(stagedItems);
          setLoading(false);
          return;
        }

        // 1. 해당 가게의 가장 최근 발송 이력(push_id) 가져오기
        const { data: latestPush, error: pushError } = await supabase
          .from('nao3_push_history')
          .select('id, sale_start, sale_end, boss_message')
          .eq('store_id', store?.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (pushError && pushError.code !== 'PGRST116') throw pushError;

        if (latestPush) {
          // 세일 기간 체크 로직
          if (latestPush.sale_start && latestPush.sale_end) {
            const now = new Date();
            const end = new Date(latestPush.sale_end);
            const start = new Date(latestPush.sale_start);
            setIsEnded(now > end);
            
            const format = (d: Date) => `${d.getFullYear()}. ${d.getMonth()+1}. ${d.getDate()}.`;
            setPeriodText(`행사 기간 ${format(start)} ~ ${format(end)}`);
          }

          if (latestPush.boss_message) {
            setBossMessage(latestPush.boss_message);
          }

          if (!latestPush.sale_end || new Date() <= new Date(latestPush.sale_end)) {
            // 2. 해당 push_id에 속한 아이템만 가져오기
            const { data, error } = await supabase
              .from('nao3_sale_items')
              .select('*')
              .eq('push_id', latestPush.id)
              .order('created_at', { ascending: true });

            if (error) throw error;
            if (data) setItems(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch sale items', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // 카테고리별로 그룹화
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SaleItem[]>);

  // 출력할 카테고리 순서 정의
  const categoryOrder = [
    { id: '정육', title: '프리미엄 미트 존', subtitle: 'Premium Meat' },
    { id: '청과', title: '엄선된 신선 과일', subtitle: 'Fresh Fruits' },
    { id: '야채', title: '신선채소 · 수산', subtitle: 'Vegetables & Seafood' },
    { id: '공산품', title: '데일리 생필품', subtitle: 'Daily & Groceries' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1A1A1A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isEnded) {
    return (
      <main className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-sm w-full">
          <span className="text-4xl block mb-4 opacity-50">⏳</span>
          <h2 className="text-xl font-bold text-gray-900 mb-2">세일이 종료되었습니다</h2>
          <p className="text-sm text-gray-500">
            고객님의 성원에 감사드립니다.<br/>다음 세일 행사를 기대해 주세요!
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F1F2F4] pb-24 font-sans">
      {/* 헤더 영역 (투톤 분리 - 직선형) */}
      <div className="flex flex-col">
        
        {/* 1. 브랜드 & 상호명 영역 (진한 보라색 딥톤) */}
        <div className="bg-[#1A1A1A] pt-8 pb-8 text-center relative overflow-hidden border-b border-[#222]">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center animate-fade-in-up">
            <h1 className="text-sm font-bold tracking-[0.25em] text-[#E5D7B7] uppercase bg-black/40 px-4 py-1 rounded-full border border-[#E5D7B7]/30 mb-3">
              Nao3
            </h1>
            <h2 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md tracking-tight break-keep px-4">
              {storeName}
            </h2>
          </div>
        </div>

        {/* 연보라색 래퍼 (특가 배너 + 사장님 이야기 묶음) */}
        <div className="bg-[#F8F9FA] w-full pb-6 shadow-sm border-b border-gray-200">
          
          {/* 2. 특가 배너 영역 */}
          <div className="py-6 px-4 text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-xl font-extrabold text-[#1A1A1A] mb-1.5 tracking-tight">
              🎉 오늘의 특가 찬스!
            </h3>
            <p className="text-[13px] font-bold text-gray-500 mb-3">
              단골 고객님을 위해 준비한 깜짝 한정 세일
            </p>
            
            {periodText && (
              <div className="mt-3 inline-flex bg-white text-[#1A1A1A] font-bold text-[14px] sm:text-[16px] px-5 py-3.5 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.06)] border border-gray-200 items-center justify-center w-auto max-w-[96%] mx-auto transition-all">
                <div className="flex items-center gap-1.5 tracking-tighter whitespace-nowrap">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span className="leading-tight">{periodText}</span>
                </div>
              </div>
            )}
          </div>

          {/* 오늘의 사장님 이야기 */}
          {bossMessage && (
            <div className="max-w-md mx-auto px-4 pt-4 pb-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {/* 타이틀을 바깥으로 빼고, 수평 라인과 연결 (미니멀 인포메이션 패널 스타일) */}
              <div className="flex items-center gap-3 mb-3 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#1A1A1A] text-[15px] leading-none opacity-90">🖋️</span>
                  <h3 className="text-[13px] font-black text-[#1A1A1A] tracking-[0.2em] uppercase whitespace-nowrap">
                    오늘의 사장님 이야기
                  </h3>
                </div>
                <div className="flex-1 h-[1px] bg-[#1A1A1A]/20"></div>
              </div>
              
              {/* 날렵한 사각 모서리 텍스트 전용 박스 */}
              <div className="border border-[#EBE4D8] rounded-none px-6 py-6 bg-[#FBF9F5] shadow-sm">
                <p className="text-[14.5px] text-[#38332E] leading-[1.85] whitespace-pre-wrap font-medium tracking-wide">
                  {bossMessage}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 오늘의 강력 추천 특가 존 */}
      {storeInfo && (storeInfo.special_title || storeInfo.special_image_url) && (
        <div className="max-w-md mx-auto w-full px-4 mb-8 mt-2 animate-fade-in-up">
          {/* 깊은 그림자와 순백색 배경으로 포장된 상자처럼 띄우기 */}
          <div className="bg-white rounded-[20px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)] border border-gray-100/50 overflow-hidden flex flex-col relative">
            
            {/* 다크 챠콜 & 골드빛 텍스트 헤더 */}
            <div className="bg-[#1A1A1A] py-4 text-center border-b border-[#1A1A1A]">
              <h3 className="text-[16px] font-bold text-[#E5D7B7] tracking-[0.2em] uppercase">
                오늘의 추천 특가
              </h3>
            </div>
            
            <div className="flex flex-col items-center">
              {/* 시원한 사진 영역 */}
              {storeInfo.special_image_url && (
                <div className="w-full aspect-[4/3] bg-gray-50 overflow-hidden relative">
                  {storeInfo.special_image_url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={storeInfo.special_image_url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                  ) : (
                    <img src={storeInfo.special_image_url} alt={storeInfo.special_title} className="w-full h-full object-cover" />
                  )}
                </div>
              )}
              
              {/* 텍스트 영역 */}
              <div className="w-full px-6 pt-7 pb-8 flex flex-col items-center">
                
                {(storeInfo.special_title || storeInfo.special_price) && (
                  <div className="text-center w-full mb-1">
                    {storeInfo.special_title && (
                      <h4 className="text-[22px] font-black text-gray-900 tracking-tight leading-tight mb-2">
                        {storeInfo.special_title}
                      </h4>
                    )}
                    {storeInfo.special_price && (
                      <p className="text-[26px] font-semibold text-[#8B1818] tracking-tight">
                        {storeInfo.special_price}{/^\d/.test(storeInfo.special_price) && !storeInfo.special_price.includes('원') && !storeInfo.special_price.match(/[a-zA-Z]/) ? '원' : ''}
                      </p>
                    )}
                  </div>
                )}
                
                {/* 감성적인 메모 형태의 사장님 한마디 (큰 따옴표 엠블럼 활용) */}
                {storeInfo.special_message && (
                  <div className="w-full mt-6 flex items-start justify-center gap-2 px-1">
                    <svg className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                    <p className="text-[14.5px] font-medium text-gray-600 text-center leading-relaxed break-keep">
                      {storeInfo.special_message}
                    </p>
                    <svg className="w-5 h-5 text-gray-300 shrink-0 mt-0.5 rotate-180" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 세일 품목 리스트 */}
      <div className="max-w-md mx-auto w-full flex flex-col gap-3 pt-3 pb-8">
        {items.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-4xl block mb-4 opacity-30">✨</span>
            <p className="font-bold text-gray-500 text-[15px]">현재 진행 중인 세일 행사가 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {categoryOrder.map(cat => {
              let catItems = groupedItems[cat.id];
              if (!catItems || catItems.length === 0) return null;

              // 야채/수산 카테고리 내부 정렬 로직 (채소 먼저, 수산물 나중에)
              if (cat.id === '야채' || cat.id === '야채·수산') {
                const isSeafood = (name: string) => {
                  const keywords = ['오징어', '갈치', '고등어', '전복', '바지락', '굴', '꽃게', '게', '새우', '주꾸미', '쭈꾸미', '동태', '생태', '명태', '미역', '다시마', '멸치', '낙지', '문어', '조개', '가리비', '해물', '수산', '연어', '광어', '우럭', '꽁치', '삼치', '장어', '홍합', '해파리', '꼬막', '미꾸라지', '대하', '소라'];
                  return keywords.some(kw => name.includes(kw));
                };
                catItems = [...catItems].sort((a, b) => {
                  const aIsSeafood = isSeafood(a.product_name) ? 1 : 0;
                  const bIsSeafood = isSeafood(b.product_name) ? 1 : 0;
                  return aIsSeafood - bIsSeafood;
                });
              }

              return (
                <section key={cat.id} className="animate-fade-in-up bg-white px-5 py-7 shadow-sm border-y border-gray-200">
                  
                  {/* 고급스러운 좌측 정렬 카테고리 헤더 */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-[#1A1A1A] rounded-full"></div>
                    <div className="flex flex-col">
                      <h3 className="text-[20px] font-extrabold text-gray-900 tracking-tight leading-none">
                        {cat.title}
                      </h3>
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1 block">
                        {cat.subtitle}
                      </span>
                    </div>
                  </div>
                  
                  {/* 리스트: 깔끔한 라인 정렬 (옵션 병합 처리) */}
                  <div className="flex flex-col">
                    {(() => {
                      const mergedItems: any[] = [];
                      catItems.forEach(item => {
                        const existing = mergedItems.find(mi => mi.product_name === item.product_name);
                        if (existing) {
                          // 기존 옵션을 배열에 추가하지 않고 완전히 최신값으로 덮어씌움 (단일 라인 유지)
                          existing.options = [{
                            id: item.id,
                            quantity: item.quantity,
                            sale_price: item.sale_price,
                            discount_rate: item.discount_rate,
                            is_sold_out: item.is_sold_out
                          }];
                        } else {
                          mergedItems.push({
                            ...item,
                            options: [{
                              id: item.id,
                              quantity: item.quantity,
                              sale_price: item.sale_price,
                              discount_rate: item.discount_rate,
                              is_sold_out: item.is_sold_out
                            }]
                          });
                        }
                      });

                      return mergedItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-3.5 border-b border-gray-200 last:border-b-0 transition-all">
                          
                          {/* 좌측: 상품명 & 품절 상태 */}
                          <div className="flex items-center flex-1 min-w-0 pr-3 gap-2.5">
                            {item.options.every((opt: any) => opt.is_sold_out) && (
                              <span className="text-[11px] font-black text-white bg-gray-700 px-2 py-1 rounded shrink-0 leading-none shadow-sm tracking-wide">
                                품절
                              </span>
                            )}
                            <span className="flex-shrink-0 w-[26px] h-[26px] bg-[#F9F9F9] rounded-full flex items-center justify-center border border-gray-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] text-[14px]">
                              {getIconForProduct(item.product_name)}
                            </span>
                            <h4 className={`text-[16px] font-bold text-gray-900 truncate ${item.options.every((opt: any) => opt.is_sold_out) ? 'line-through text-gray-400' : ''}`}>
                              {item.product_name}
                            </h4>
                          </div>
                          
                          {/* 우측: 중량 & 가격 옵션 그룹 */}
                          <div className="text-right flex-shrink-0 flex flex-col items-end justify-center gap-1.5">
                            {item.options.map((opt: any, idx: number) => (
                              <div key={opt.id || idx} className={`flex items-center gap-2 ${opt.is_sold_out ? 'opacity-50' : ''}`}>
                                {opt.discount_rate && !opt.is_sold_out && (
                                  <span className="text-[13px] font-black text-white bg-[#8B1818] px-2 py-0.5 rounded-md shrink-0 tracking-tight shadow-sm">
                                    {opt.discount_rate}%
                                  </span>
                                )}
                                <span className={`text-[13px] font-extrabold tracking-tight px-2 py-0.5 rounded-md shrink-0 ${opt.is_sold_out ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-[#1A1A1A]'}`}>
                                  {opt.quantity}
                                </span>
                                <span className={`text-[16px] font-black tracking-tight ${opt.is_sold_out ? 'text-gray-400 line-through decoration-gray-400 decoration-2' : 'text-[#8B1818]'}`}>
                                  {opt.sale_price}
                                </span>
                              </div>
                            ))}
                          </div>
                          
                        </div>
                      ));
                    })()}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

          {/* 가게 정보 아코디언 */}
      {storeInfo && (
        <div className="w-full bg-white border-t border-gray-200 pb-8 mt-4">
          <button 
            onClick={() => setIsStoreInfoOpen(!isStoreInfoOpen)}
            className="w-full py-4 flex items-center justify-center gap-2 text-[14px] font-bold text-gray-500 hover:text-gray-700 transition-colors"
          >
            가게정보 {isStoreInfoOpen ? 'ᐱ' : 'ᐯ'}
          </button>
          
          {isStoreInfoOpen && (
            <div className="px-6 pb-6 pt-2 animate-fade-in-up">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col gap-3">
                {storeInfo.address && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-gray-400">매장 주소</span>
                    <span className="text-[13px] font-medium text-gray-800">{storeInfo.address}</span>
                  </div>
                )}
                {storeInfo.operating_hours && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-gray-400">영업시간</span>
                    <span className="text-[13px] font-medium text-gray-800">{storeInfo.operating_hours}</span>
                  </div>
                )}
                {storeInfo.closed_days && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-gray-400">휴무일</span>
                    <span className="text-[13px] font-medium text-gray-800">{storeInfo.closed_days}</span>
                  </div>
                )}
                {storeInfo.phone && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold text-gray-400">전화번호</span>
                    <span className="text-[13px] font-medium text-gray-800"><a href={`tel:${storeInfo.phone}`}>{storeInfo.phone}</a></span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

    </main>
  );
}
