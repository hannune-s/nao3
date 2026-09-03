"use client";
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  { id: '정육', icon: '🥩' },
  { id: '청과', icon: '🍎' },
  { id: '야채', icon: '🥬' },
  { id: '공산품', icon: '🛒' },
];

export default function Nao3Page() {
  const [activeTab, setActiveTab] = useState('정육');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // 단일 입력 폼 상태
  const [newItem, setNewItem] = useState({ product_name: '', quantity: '', sale_price: '' });

  // 목록에 추가 (유효성 검사 포함)
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItem.product_name.trim() || !newItem.sale_price.trim()) {
      alert('상품명과 세일 가격은 필수입니다.');
      return;
    }
    setItems([
      ...items, 
      { id: Date.now().toString(), category: activeTab, ...newItem }
    ]);
    // 폼 초기화 (연속 입력을 위해)
    setNewItem({ product_name: '', quantity: '', sale_price: '' });
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    const validItems = items.filter(item => item.product_name && item.sale_price);
    
    if (validItems.length === 0) {
      alert('입력된 세일 상품이 없습니다. 최소 1개 이상 입력해주세요.');
      return;
    }

    if (!confirm(`총 ${validItems.length}개의 세일 상품을 등록하시겠습니까?`)) return;

    setLoading(true);
    try {
      const { error } = await supabase.from('nao3_sale_items').insert(
        validItems.map(({ id, ...rest }) => rest)
      );

      if (error) {
        if (error.code === '42P01') { 
          throw new Error('Supabase에 테이블이 생성되지 않았습니다. SQL 코드를 먼저 실행해주세요.');
        }
        throw error;
      }
      
      setItems([]);
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const currentItems = items.filter(item => item.category === activeTab);
  const totalItemsCount = items.filter(item => item.product_name && item.sale_price).length;

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full animate-fade-in-up">
          <div className="w-16 h-16 bg-[#5F0080]/10 text-[#5F0080] rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">등록이 완료되었습니다</h2>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            세일 품목이 성공적으로 데이터베이스에 저장되었습니다.<br/>
            추후 세일 템플릿 배너와 연동될 예정입니다.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full py-4 bg-[#5F0080] hover:bg-[#4a0066] text-white font-bold rounded-2xl transition-all shadow-md"
          >
            새로운 품목 추가하기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* 헤더 및 탭 영역 (상단 고정) */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-[#5F0080] tracking-tight flex items-center gap-2">
            Nao3 <span className="text-gray-400 font-normal text-[11px] bg-gray-100 px-2 py-0.5 rounded-full">Sale Push Admin</span>
          </h1>
        </div>
        
        <div className="max-w-2xl mx-auto flex">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`flex-1 pt-3 pb-2 text-[13px] font-bold flex flex-col items-center gap-1.5 relative transition-colors ${
                activeTab === cat.id ? 'text-[#5F0080]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-xl leading-none">{cat.icon}</span>
              <span>{cat.id}</span>
              {activeTab === cat.id && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#5F0080]" />}
            </button>
          ))}
        </div>
      </header>

      {/* 단일 고정 입력 폼 */}
      <div className="bg-white border-b border-gray-200 sticky top-[96px] z-10 shadow-sm p-4">
        <div className="max-w-2xl mx-auto flex flex-col gap-3">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-lg">{CATEGORIES.find(c => c.id === activeTab)?.icon}</span>
            <h2 className="text-[15px] font-bold text-gray-800">{activeTab} 품목 입력</h2>
          </div>
          
          <form onSubmit={handleAddItem} className="flex flex-col gap-2.5">
            <input 
              type="text" 
              placeholder="상품명 (예: 한우 등심 1+ 구이용)"
              value={newItem.product_name}
              onChange={e => setNewItem({...newItem, product_name: e.target.value})}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#5F0080] focus:border-[#5F0080]"
            />
            <div className="flex gap-2.5">
              <input 
                type="text" 
                placeholder="중량/수량 (예: 300g)"
                value={newItem.quantity}
                onChange={e => setNewItem({...newItem, quantity: e.target.value})}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#5F0080] focus:border-[#5F0080]"
              />
              <input 
                type="text" 
                placeholder="세일 가격 (예: 9,900원)"
                value={newItem.sale_price}
                onChange={e => setNewItem({...newItem, sale_price: e.target.value})}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-[14px] font-bold text-[#5F0080] placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-1 focus:ring-[#5F0080] focus:border-[#5F0080]"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-2.5 mt-1 bg-white border border-[#5F0080] text-[#5F0080] font-bold rounded-lg hover:bg-[#5F0080]/5 transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="text-lg leading-none">+</span> 추가하기
            </button>
          </form>
        </div>
      </div>

      {/* 등록된 품목 리스트 (컴팩트 뷰) */}
      <div className="max-w-2xl mx-auto p-4 pt-6 pb-6">
        <div className="flex justify-between items-end mb-3 px-1">
          <h3 className="text-sm font-bold text-gray-700">추가된 {activeTab} 목록</h3>
          <span className="text-[11px] font-bold text-[#5F0080] bg-[#5F0080]/10 px-2 py-0.5 rounded-full">
            {currentItems.length}건
          </span>
        </div>

        {currentItems.length === 0 ? (
          <div className="bg-white py-10 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
            <span className="text-2xl opacity-50 block mb-2">📝</span>
            <p className="text-[13px]">위 폼에서 상품을 입력해 주세요.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            {currentItems.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between py-2.5 px-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                
                {/* 좌측: 번호, 상품명, 중량 (가로 한 줄 배치) */}
                <div className="flex items-center flex-1 min-w-0 pr-2 gap-2">
                  <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">
                    {index + 1}
                  </span>
                  <h4 className="text-[15px] font-bold text-gray-900 truncate">
                    {item.product_name}
                  </h4>
                  <span className="text-[11px] text-gray-500 whitespace-nowrap flex-shrink-0">
                    {item.quantity}
                  </span>
                </div>

                {/* 우측: 가격, 삭제버튼 */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[15px] font-extrabold text-[#5F0080] tracking-tight">
                    {item.sale_price}
                  </span>
                  <button 
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-gray-300 hover:text-red-500 p-1 transition-colors flex-shrink-0"
                    title="삭제"
                  >
                    ✕
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* 하단 플로팅 저장 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col pl-2">
            <span className="text-[11px] text-gray-500 font-semibold">총 등록 대기</span>
            <span className="text-lg font-extrabold text-[#5F0080] leading-none">{totalItemsCount}건</span>
          </div>
          <button 
            onClick={handleSave}
            disabled={loading || totalItemsCount === 0}
            className="flex-1 py-4 bg-[#5F0080] hover:bg-[#4a0066] disabled:bg-gray-300 text-white font-bold rounded-2xl transition-all shadow-[0_4px_14px_rgba(95,0,128,0.3)] disabled:shadow-none"
          >
            {loading ? '저장 중...' : '세일 푸시 등록 완료'}
          </button>
        </div>
      </div>
    </main>
  );
}
