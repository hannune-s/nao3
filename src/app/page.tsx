"use client";
import { useEffect, useState } from 'react';
import { matchSearch } from '@/lib/hangul';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  { id: '정육', icon: '🥩' },
  { id: '청과', icon: '🍎' },
  { id: '야채', icon: '🥬' },
  { id: '공산품', icon: '🛒' },
];

const ITEM_DICT: Record<string, string[]> = {
  '정육': ['한우 등심', '한우 안심', '한우 국거리', '한우 불고기', '국내산 삼겹살', '국내산 목살', '찌개용 앞다리살', '수육용 삼겹살', '양념 돼지갈비', '닭볶음탕용 생닭', '닭가슴살', '호주산 척아이롤'],
  '청과': ['사과', '바나나', '제주 감귤', '샤인머스캣', '고당도 수박', '딸기', '성주 참외', '딱딱이 복숭아', '신고배', '방울토마토', '블루베리', '오렌지'],
  '야채': ['깐마늘', '양파', '대파', '청양고추', '햇감자', '애호박', '상추', '깻잎', '백오이', '당근', '새송이버섯', '팽이버섯', '알배기 배추', '제주 무'],
  '공산품': ['농심 신라면', '오뚜기 진라면', 'CJ 햇반', '코카콜라', '칠성사이다', '동원참치', '스팸 클래식', '서울우유', '카누 아메리카노', '맥심 모카골드']
};

const QTY_DICT = [
  '100g', '200g', '300g', '400g', '500g', '600g(1근)', '800g', '1kg',
  '1개', '2개', '3개', '5개', '10개', '1팩', '2팩', '1단', '1망', '1봉', '1박스'
];

export default function Nao3Page() {
  const [activeTab, setActiveTab] = useState('정육');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [newItem, setNewItem] = useState({ product_name: '', quantity: '', sale_price: '' });

  // 자동완성 드롭다운 상태
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [showQtyDropdown, setShowQtyDropdown] = useState(false);

  // 탭 변경 시 폼 초기화
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setNewItem({ product_name: '', quantity: '', sale_price: '' });
  };

  // 자동완성 필터링 리스트
  const matchedNames = ITEM_DICT[activeTab]?.filter(name => matchSearch(newItem.product_name, name)) || [];
  const matchedQtys = QTY_DICT.filter(qty => matchSearch(newItem.quantity, qty));

  // 앱 로드 시 로컬 스토리지에서 임시 저장된 데이터 불러오기 (새로고침 방어)
  useEffect(() => {
    const saved = localStorage.getItem('nao3_staging_items');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse local items', e);
      }
    }
  }, []);

  // items 상태가 변경될 때마다 로컬 스토리지 업데이트
  useEffect(() => {
    localStorage.setItem('nao3_staging_items', JSON.stringify(items));
  }, [items]);

  // 목록에 추가 (메모리 & 로컬스토리지 임시 저장)
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItem.product_name.trim() || !newItem.sale_price.trim()) {
      alert('상품명과 세일 가격은 필수입니다.');
      return;
    }

    const insertData = { 
      id: Date.now().toString(),
      category: activeTab, 
      product_name: newItem.product_name, 
      quantity: newItem.quantity, 
      sale_price: newItem.sale_price 
    };

    setItems([...items, insertData]);
    setNewItem({ product_name: '', quantity: '', sale_price: '' });
  };

  // 삭제 기능
  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // 최종 전송 버튼 (DB에 일괄 전송 후 초기화)
  const handleSave = async () => {
    const validItems = items.filter(item => item.product_name && item.sale_price);
    if (validItems.length === 0) {
      alert('입력된 세일 상품이 없습니다. 최소 1개 이상 추가해주세요.');
      return;
    }

    setLoading(true);
    try {
      const dbPayload = validItems.map(({ id, ...rest }) => rest);
      const { error } = await supabase.from('nao3_sale_items').insert(dbPayload);

      if (error) {
        if (error.code === '42P01') throw new Error('Supabase에 테이블이 생성되지 않았습니다.');
        throw error;
      }

      setItems([]);
      localStorage.removeItem('nao3_staging_items');
      setSubmitted(true);
      
    } catch (err: any) {
      console.error(err);
      alert('DB 저장 오류: ' + (err.message || '알 수 없는 오류가 발생했습니다.'));
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
      {/* 상단 고정 영역: 헤더 + 탭 + 입력폼 (단일 sticky) */}
      <div className="sticky top-0 z-30 bg-white shadow-sm flex flex-col border-b border-gray-200">
        
        {/* 헤더 */}
        <div className="max-w-2xl mx-auto w-full px-4 h-11 flex items-center justify-between border-b border-gray-100">
          <h1 className="text-lg font-extrabold text-[#5F0080] tracking-tight flex items-center gap-2">
            Nao3 <span className="text-gray-400 font-normal text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">Sale Push Admin</span>
          </h1>
        </div>
        
        {/* 카테고리 탭 */}
        <div className="max-w-2xl mx-auto w-full flex border-b border-gray-100">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleTabChange(cat.id)}
              className={`flex-1 py-2 text-[12px] font-bold flex flex-col items-center gap-1 relative transition-colors ${
                activeTab === cat.id ? 'text-[#5F0080]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-lg leading-none">{cat.icon}</span>
              <span>{cat.id}</span>
              {activeTab === cat.id && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#5F0080]" />}
            </button>
          ))}
        </div>

        {/* 단일 고정 입력 폼 (슬림화) */}
        <div className="max-w-2xl mx-auto w-full p-3 bg-white">
          <form onSubmit={handleAddItem} className="flex flex-col gap-2">
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="상품명 (초성 검색 지원, 예: ㅎㅇ)"
                value={newItem.product_name}
                onFocus={() => setShowNameDropdown(true)}
                onBlur={() => setTimeout(() => setShowNameDropdown(false), 200)}
                onChange={e => setNewItem({...newItem, product_name: e.target.value})}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#5F0080]"
              />
              {/* 상품명 자동완성 드롭다운 */}
              {showNameDropdown && matchedNames.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {matchedNames.map(name => (
                    <li 
                      key={name}
                      onClick={() => setNewItem({...newItem, product_name: name})}
                      className="px-3 py-2 text-sm text-gray-700 hover:bg-[#5F0080]/5 hover:text-[#5F0080] cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="중량 (초성 검색)"
                  value={newItem.quantity}
                  onFocus={() => setShowQtyDropdown(true)}
                  onBlur={() => setTimeout(() => setShowQtyDropdown(false), 200)}
                  onChange={e => setNewItem({...newItem, quantity: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#5F0080]"
                />
                {/* 중량 자동완성 드롭다운 */}
                {showQtyDropdown && matchedQtys.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {matchedQtys.map(qty => (
                      <li 
                        key={qty}
                        onClick={() => setNewItem({...newItem, quantity: qty})}
                        className="px-3 py-2 text-sm text-gray-700 hover:bg-[#5F0080]/5 hover:text-[#5F0080] cursor-pointer border-b border-gray-100 last:border-0"
                      >
                        {qty}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <input 
                type="text" 
                placeholder="세일 가격"
                value={newItem.sale_price}
                onChange={e => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  if (!raw) {
                    setNewItem({...newItem, sale_price: ''});
                  } else {
                    setNewItem({...newItem, sale_price: parseInt(raw, 10).toLocaleString() + '원'});
                  }
                }}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[14px] font-bold text-[#5F0080] placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-1 focus:ring-[#5F0080]"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-2 bg-white border border-[#5F0080] text-[#5F0080] font-bold rounded-lg hover:bg-[#5F0080]/5 transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="text-lg leading-none">+</span> 추가하기
            </button>
          </form>
        </div>
      </div>

      {/* 등록된 품목 리스트 (컴팩트 뷰) */}
      <div className="max-w-2xl mx-auto p-3 pt-4 pb-6">
        <div className="flex justify-between items-end mb-2 px-1">
          <h3 className="text-sm font-bold text-gray-700">추가된 {activeTab} 목록</h3>
          <span className="text-[11px] font-bold text-[#5F0080] bg-[#5F0080]/10 px-2 py-0.5 rounded-full">
            {currentItems.length}건
          </span>
        </div>

        {currentItems.length === 0 ? (
          <div className="bg-white py-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
            <span className="text-2xl opacity-50 block mb-2">📝</span>
            <p className="text-[12px]">위 폼에서 상품을 입력해 주세요.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
            {currentItems.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between py-3 px-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors gap-2">
                
                {/* 좌측: 번호 + 상품명 + 중량 (가로 한 줄 배치) */}
                <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                  <span className="text-[10px] font-bold text-gray-400 w-3 text-center shrink-0">{index + 1}</span>
                  <h4 className="text-[15px] font-bold text-gray-900 truncate shrink-0 max-w-[50%]">
                    {item.product_name}
                  </h4>
                  <span className="text-[13px] font-bold text-[#5F0080] bg-[#5F0080]/10 px-2 py-0.5 rounded-md truncate">
                    {item.quantity}
                  </span>
                </div>

                {/* 우측: 가격, 삭제버튼 */}
                <div className="flex items-center justify-end gap-3 flex-shrink-0">
                  <span className="text-[17px] font-extrabold text-[#5F0080] tracking-tight whitespace-nowrap">
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
