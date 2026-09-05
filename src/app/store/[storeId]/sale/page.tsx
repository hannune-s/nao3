"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';

interface SaleItem {
  id: string;
  category: string;
  product_name: string;
  quantity: string;
  sale_price: string;
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
  const [storeName, setStoreName] = useState('우리동네 마트'); // 가게 이름 상태 추가

  useEffect(() => {
    if (!storeSlug) return;

    const fetchItems = async () => {
      const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true';
      if (isPreview) {
        const stagedSettings = JSON.parse(localStorage.getItem('nao3_staging_settings') || '{}');
        setStoreName(stagedSettings.storeName || '상호명 미리보기');
        
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
      try {
        // 0. URL의 storeId를 기반으로 해당 가게 상호명 가져오기
        const { data: store } = await supabase
          .from('nao3_stores')
          .select('id, store_name')
          .eq('slug', storeSlug)
          .single();
          
        if (store) {
          setStoreName(store.store_name);
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
        <div className="w-8 h-8 border-4 border-[#5F0080] border-t-transparent rounded-full animate-spin"></div>
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
        <div className="bg-[#5F0080] pt-8 pb-8 text-center relative overflow-hidden border-b border-purple-900">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center animate-fade-in-up">
            <h1 className="text-sm font-black tracking-widest text-purple-200 uppercase bg-purple-900/40 px-4 py-1 rounded-full border border-purple-700/50 mb-3">
              Nao3
            </h1>
            <h2 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md tracking-tight break-keep px-4">
              {storeName}
            </h2>
          </div>
        </div>

        {/* 연보라색 래퍼 (특가 배너 + 사장님 이야기 묶음) */}
        <div className="bg-[#F4E8F9] w-full pb-6 shadow-sm border-b border-purple-200">
          
          {/* 2. 특가 배너 영역 */}
          <div className="py-6 px-4 text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-xl font-extrabold text-[#5F0080] mb-1.5 tracking-tight">
              🎉 오늘의 특가 찬스!
            </h3>
            <p className="text-[13px] font-bold text-purple-900/60 mb-3">
              단골 고객님을 위해 준비한 깜짝 한정 세일
            </p>
            
            {periodText && (
              <div className="inline-block bg-white text-[#5F0080] font-black text-[12px] px-5 py-2 rounded-full shadow-sm border border-purple-100">
                {periodText}
              </div>
            )}
          </div>

          {/* 오늘의 사장님 이야기 */}
          {bossMessage && (
            <div className="max-w-md mx-auto px-4 pt-1 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="relative border border-purple-100 rounded-2xl p-6 bg-white shadow-sm">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-[#5F0080] text-[16px] leading-none">🌸</span>
                  <h3 className="text-[14px] font-bold text-[#5F0080] tracking-wide">오늘의 사장님 이야기</h3>
                </div>
                <p className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                  {bossMessage}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

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
              const catItems = groupedItems[cat.id];
              if (!catItems || catItems.length === 0) return null;

              return (
                <section key={cat.id} className="animate-fade-in-up bg-white px-5 py-7 shadow-sm border-y border-gray-200">
                  
                  {/* 고급스러운 좌측 정렬 카테고리 헤더 */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-[#5F0080] rounded-full"></div>
                    <div className="flex flex-col">
                      <h3 className="text-[20px] font-extrabold text-gray-900 tracking-tight leading-none">
                        {cat.title}
                      </h3>
                      <span className="text-[11px] font-black text-[#5F0080]/60 uppercase tracking-[0.2em] mt-1 block">
                        {cat.subtitle}
                      </span>
                    </div>
                  </div>
                  
                  {/* 리스트: 깔끔한 라인 정렬 */}
                  <div className="flex flex-col">
                    {catItems.map((item) => (
                      <div key={item.id} className={`flex items-center justify-between py-3.5 border-b border-gray-200 last:border-b-0 transition-all ${item.is_sold_out ? 'opacity-50' : ''}`}>
                        
                        {/* 좌측: 상품명 & 중량 */}
                        <div className="flex items-center flex-1 min-w-0 pr-3 gap-2.5">
                          {item.is_sold_out && (
                            <span className="text-[11px] font-black text-white bg-red-600 px-2 py-1 rounded shrink-0 leading-none shadow-sm tracking-wide">
                              품절
                            </span>
                          )}
                          <h4 className={`text-[16px] font-bold text-gray-900 truncate ${item.is_sold_out ? 'line-through text-gray-400' : ''}`}>
                            {item.product_name}
                          </h4>
                          <span className={`text-[14px] font-extrabold tracking-tight px-2.5 py-1 rounded-md shrink-0 ${item.is_sold_out ? 'bg-gray-100 text-gray-400' : 'bg-purple-50 text-[#5F0080]'}`}>
                            {item.quantity}
                          </span>
                        </div>
                        
                        {/* 우측: 시선 강탈 가격 */}
                        <div className="text-right flex-shrink-0 flex flex-col items-end justify-center">
                          <span className={`text-[18px] font-black tracking-tight ${item.is_sold_out ? 'text-gray-400 line-through decoration-red-500 decoration-2' : 'text-[#5F0080]'}`}>
                            {item.sale_price}
                          </span>
                        </div>
                        
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

    </main>
  );
}
