"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

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
  const [items, setItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnded, setIsEnded] = useState(false);
  const [periodText, setPeriodText] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // 1. 가장 최근의 발송 이력(push_id) 가져오기
        const { data: latestPush, error: pushError } = await supabase
          .from('nao3_push_history')
          .select('id, sale_start, sale_end')
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
            
            const format = (d: Date) => `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
            setPeriodText(`${format(start)} ~ ${format(end)}`);
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
    { id: '정육', icon: '🥩' },
    { id: '청과', icon: '🍎' },
    { id: '야채', icon: '🥬' },
    { id: '공산품', icon: '🛒' },
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
    <main className="min-h-screen bg-[#F9F9F9] pb-24 font-sans">
      {/* 메인 히어로 배너 */}
      <div className="bg-[#5F0080] text-white px-4 py-10 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <h2 className="text-2xl font-extrabold mb-2 relative z-10 animate-fade-in-up">오늘의 특가 찬스!</h2>
        <p className="text-sm text-purple-200 relative z-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          푸시 알림을 받고 오신 고객님을 위한 한정 세일
        </p>
      </div>

      {/* 세일 품목 리스트 */}
      <div className="max-w-md mx-auto px-4 py-6">
        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <span className="text-4xl block mb-3 opacity-50">😲</span>
            <p>현재 진행 중인 세일 행사가 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {categoryOrder.map(cat => {
              const catItems = groupedItems[cat.id];
              if (!catItems || catItems.length === 0) return null;

              return (
                <section key={cat.id} className="animate-fade-in-up">
                  
                  {/* 세련된 카테고리 헤더 */}
                  <div className="flex items-center gap-2.5 mb-3 px-1">
                    <span className="text-2xl bg-white p-2 rounded-2xl shadow-sm border border-gray-100 leading-none flex items-center justify-center">
                      {cat.icon}
                    </span>
                    <h3 className="text-[19px] font-extrabold text-gray-900 tracking-tight">
                      {cat.id} <span className="text-[#5F0080]">특가</span>
                    </h3>
                  </div>
                  
                  {/* 리스트 카드 (컴팩트 1단 레이아웃) */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-1.5 flex flex-col">
                    {catItems.map((item) => (
                      <div key={item.id} className={`flex items-center justify-between py-3 px-2 -mx-2 border-b border-gray-100 last:border-b-0 gap-2 relative transition-all overflow-hidden rounded-lg ${item.is_sold_out ? 'bg-gray-100/60 grayscale' : ''}`}>
                        
                        {item.is_sold_out && (
                          <>
                            {/* 어두운 오버레이 */}
                            <div className="absolute inset-0 bg-black/[0.03] z-10 pointer-events-none rounded-lg"></div>
                            {/* 도장 효과 */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 -rotate-[12deg] pointer-events-none">
                              <div className="border-[3px] border-red-600 text-red-600 text-[20px] leading-none font-black uppercase tracking-[0.1em] px-3 py-1.5 rounded-md bg-white/95 shadow-[0_0_8px_rgba(255,255,255,0.8)] whitespace-nowrap">
                                SOLD OUT
                              </div>
                            </div>
                          </>
                        )}

                        {/* 좌측: 상품명 & 중량 (가로 나란히) */}
                        <div className={`flex items-center flex-1 min-w-0 gap-2 pr-2 relative z-0 ${item.is_sold_out ? 'opacity-40' : ''}`}>
                          <h4 className="text-[16px] font-bold text-gray-900 truncate shrink-0 max-w-[55%]">
                            {item.product_name}
                          </h4>
                          <span className="text-[13px] font-extrabold text-[#5F0080] bg-[#5F0080]/10 px-2 py-0.5 rounded-md truncate shrink-0">
                            {item.quantity}
                          </span>
                        </div>
                        
                        {/* 우측: 시선 강탈 가격 */}
                        <div className={`text-right flex-shrink-0 flex flex-col items-end relative z-0 ${item.is_sold_out ? 'opacity-60' : ''}`}>
                          <span className={`text-[19px] font-black tracking-tight ${item.is_sold_out ? 'text-gray-600 line-through decoration-red-600 decoration-[3px]' : 'text-[#5F0080]'}`}>
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
