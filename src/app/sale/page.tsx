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
}

export default function CustomerSalePage() {
  const [items, setItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // 최신 등록순으로 데이터 가져오기
        const { data, error } = await supabase
          .from('nao3_sale_items')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (data) setItems(data);
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

  return (
    <main className="min-h-screen bg-[#F9F9F9] pb-24 font-sans">
      {/* 고객용 헤더 */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-center">
          <h1 className="text-lg font-extrabold text-[#5F0080] tracking-tight">
            나오3 마켓
          </h1>
        </div>
      </header>

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
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-1.5 border-b-2 border-gray-900 pb-1.5 inline-flex">
                    <span>{cat.icon}</span> {cat.id} 코너
                  </h3>
                  
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-1 flex flex-col">
                    {catItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center flex-1 min-w-0 pr-3 gap-2">
                          <h4 className="text-[14px] font-bold text-gray-900 truncate">
                            {item.product_name}
                          </h4>
                          <span className="text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded whitespace-nowrap flex-shrink-0">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-[15px] font-extrabold text-[#5F0080] tracking-tight">
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
