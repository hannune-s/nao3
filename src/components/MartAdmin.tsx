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

interface MartAdminProps {
  storeId: string;
  initialStoreName: string;
}

export default function MartAdmin({ storeId, initialStoreName }: MartAdminProps) {
  const [activeTab, setActiveTab] = useState('정육');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [newItem, setNewItem] = useState({ product_name: '', quantity: '', sale_price: '' });

  // 자동완성 드롭다운 상태
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [showQtyDropdown, setShowQtyDropdown] = useState(false);
  const [nameIdx, setNameIdx] = useState(-1);
  const [qtyIdx, setQtyIdx] = useState(-1);

  // 이력 관리 상태
  const [histories, setHistories] = useState<any[]>([]);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);

  // 상호명, 세일 진행 기간 및 사장님 이야기 상태
  const [storeName, setStoreName] = useState(initialStoreName || '');
  const [saleStart, setSaleStart] = useState('');
  const [saleEnd, setSaleEnd] = useState('');
  const [bossMessage, setBossMessage] = useState('');

  // 탭 변경 시 폼 초기화
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setNewItem({ product_name: '', quantity: '', sale_price: '' });
    setNameIdx(-1);
    setQtyIdx(-1);
  };

  // 자동완성 필터링 리스트
  const matchedNames = ITEM_DICT[activeTab]?.filter(name => matchSearch(newItem.product_name, name)) || [];
  const matchedQtys = QTY_DICT.filter(qty => matchSearch(newItem.quantity, qty));

  // 방향키 스크롤 포커스 처리
  useEffect(() => {
    if (nameIdx >= 0) {
      document.getElementById('name-item-' + nameIdx)?.scrollIntoView({ block: 'nearest' });
    }
  }, [nameIdx]);
  
  useEffect(() => {
    if (qtyIdx >= 0) {
      document.getElementById('qty-item-' + qtyIdx)?.scrollIntoView({ block: 'nearest' });
    }
  }, [qtyIdx]);

  // 이력 수정 모드 상태
  const [editingHistoryItemId, setEditingHistoryItemId] = useState<{pushId: string, itemId: string} | null>(null);

  // 이력 데이터 불러오기 함수
  const fetchHistories = async () => {
    const { data, error } = await supabase
      .from('nao3_push_history')
      .select('*, nao3_sale_items(*)')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setHistories(data);
    }
  };

  // 앱 로드 시 데이터 초기화
  useEffect(() => {
    const loadInitData = async () => {
      const now = new Date();
      const toLocalStr = (d: string | Date) => {
        const dt = typeof d === 'string' ? new Date(d) : d;
        const offset = dt.getTimezoneOffset() * 60000;
        return new Date(dt.getTime() - offset).toISOString().slice(0, 16);
      };

      // 1. 진행 중인 세일이 있는지 확인해서 기간/멘트 기본값으로 깔아주기
      const { data: latestPush } = await supabase
        .from('nao3_push_history')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let isAppendingToActive = false;
      
      if (latestPush && latestPush.sale_end && new Date(latestPush.sale_end) > now) {
        // 아직 종료되지 않은 세일이 있다면 그 시간을 기본값으로
        if (!saleStart) setSaleStart(toLocalStr(latestPush.sale_start));
        if (!saleEnd) setSaleEnd(toLocalStr(latestPush.sale_end));
        isAppendingToActive = true;
      } else {
        if (!saleStart) setSaleStart(toLocalStr(now));
        const tmrw = new Date(now);
        tmrw.setDate(tmrw.getDate() + 1);
        tmrw.setHours(23, 59, 0, 0);
        if (!saleEnd) setSaleEnd(toLocalStr(tmrw));
      }

      // 항상 임시 저장 데이터 로드
      const saved = localStorage.getItem('nao3_staging_items');
      if (saved) {
        try { setItems(JSON.parse(saved)); } catch (e) { console.error(e); }
      }

      const savedBossMsg = localStorage.getItem('nao3_boss_message');
      if (savedBossMsg !== null && savedBossMsg !== undefined) {
        setBossMessage(savedBossMsg);
      } else if (isAppendingToActive && latestPush?.boss_message) {
        setBossMessage(latestPush.boss_message);
      }

      fetchHistories();
    };

    loadInitData();
  }, []);

  // items, bossMessage 상태가 변경될 때마다 로컬 스토리지 업데이트
  useEffect(() => {
    localStorage.setItem('nao3_staging_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('nao3_boss_message', bossMessage);
  }, [bossMessage]);

  // 목록에 추가 또는 즉시 수정
  const handleAddItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItem.product_name.trim() || !newItem.sale_price.trim()) {
      alert('상품명과 세일 가격은 필수입니다.');
      return;
    }

    const rawPrice = newItem.sale_price.replace(/[^0-9]/g, '');
    const formattedPrice = rawPrice ? parseInt(rawPrice, 10).toLocaleString() + '원' : '';

    if (editingHistoryItemId) {
      // 즉시 수정 모드
      try {
        const { error } = await supabase.from('nao3_sale_items')
          .update({ 
            product_name: newItem.product_name, 
            quantity: newItem.quantity, 
            sale_price: formattedPrice,
            category: activeTab
          })
          .eq('id', editingHistoryItemId.itemId);
          
        if (error) throw error;
        
        // 로컬 상태 즉시 갱신
        setHistories(prev => prev.map(h => h.id === editingHistoryItemId.pushId ? {
          ...h,
          nao3_sale_items: h.nao3_sale_items.map((i: any) => i.id === editingHistoryItemId.itemId ? {
            ...i,
            category: activeTab,
            product_name: newItem.product_name,
            quantity: newItem.quantity,
            sale_price: formattedPrice
          } : i)
        } : h));
        
        setEditingHistoryItemId(null);
      } catch (err) {
        alert('이력 수정에 실패했습니다.');
        return;
      }
    } else {
      // 일반 대기열 추가 모드
      const insertData = { 
        id: Date.now().toString(),
        category: activeTab, 
        product_name: newItem.product_name, 
        quantity: newItem.quantity, 
        sale_price: formattedPrice,
        is_sold_out: false
      };
      setItems([...items, insertData]);
    }

    setNewItem({ product_name: '', quantity: '', sale_price: '' });
    setNameIdx(-1);
    setQtyIdx(-1);
  };

  // 수정 기능 (위 폼으로 끌어오기)
  const handleEditItem = (item: any) => {
    setNewItem({ 
      product_name: item.product_name, 
      quantity: item.quantity, 
      sale_price: item.sale_price.replace(/[^0-9]/g, '') 
    });
    setActiveTab(item.category);
    handleRemoveItem(item.id); // 폼으로 끌어올리면서 기존 리스트에서는 제거
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 삭제 기능
  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // 이력 품절 처리/해제 (즉시 반영)
  const handleHistoryToggleSoldOut = async (pushId: string, itemId: string, currentSoldOut: boolean) => {
    try {
      const { error } = await supabase.from('nao3_sale_items').update({ is_sold_out: !currentSoldOut }).eq('id', itemId);
      if (error) throw error;
      setHistories(prev => prev.map(h => h.id === pushId ? {
        ...h,
        nao3_sale_items: h.nao3_sale_items.map((i: any) => i.id === itemId ? { ...i, is_sold_out: !currentSoldOut } : i)
      } : h));
    } catch (err) {
      alert('품절 상태 업데이트에 실패했습니다.');
    }
  };

  // 이력 아이템 삭제 (즉시 반영)
  const handleHistoryDeleteItem = async (pushId: string, itemId: string) => {
    if (!confirm('정말 삭제하시겠습니까? 즉시 반영됩니다.')) return;
    try {
      const { error } = await supabase.from('nao3_sale_items').delete().eq('id', itemId);
      if (error) throw error;
      setHistories(prev => prev.map(h => h.id === pushId ? {
        ...h,
        item_count: h.item_count - 1,
        nao3_sale_items: h.nao3_sale_items.filter((i: any) => i.id !== itemId)
      } : h));
    } catch (err) {
      alert('삭제에 실패했습니다.');
    }
  };

  // 이력 아이템 수정 (폼으로 끌어올림)
  const handleHistoryEditItem = (pushId: string, item: any) => {
    setEditingHistoryItemId({ pushId, itemId: item.id });
    setActiveTab(item.category || '정육');
    setNewItem({ 
      product_name: item.product_name, 
      quantity: item.quantity, 
      sale_price: item.sale_price.replace(/[^0-9]/g, '')
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 기간 및 사장님 이야기 즉시 반영 버튼
  const handleQuickSaveSettings = async () => {
    if (!saleStart || !saleEnd) {
      alert('세일 시작일과 종료일을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      // 1. 가게 상호명 업데이트
      const { data: updatedStore, error: storeError } = await supabase
        .from('nao3_stores')
        .update({ store_name: storeName })
        .eq('id', storeId)
        .select();
      
      if (storeError || !updatedStore || updatedStore.length === 0) {
        console.error('상호명 업데이트 실패:', storeError);
        alert('상호명 수정 권한이 없습니다. (RLS 에러)');
        return;
      }

      // 2. 가장 최근 발송 이력의 기간 및 사장님 멘트 업데이트
      const { data: latestPush } = await supabase.from('nao3_push_history').select('*').eq('store_id', storeId).order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      const newStart = new Date(saleStart).toISOString();
      const newEnd = new Date(saleEnd).toISOString();

      if (latestPush) {
        const { data: updatedData, error } = await supabase.from('nao3_push_history').update({
          sale_start: newStart,
          sale_end: newEnd,
          boss_message: bossMessage.trim() || null
        }).eq('id', latestPush.id).select();
        
        if (error) throw error;
        if (!updatedData || updatedData.length === 0) {
           throw new Error("보안 정책(RLS) 문제로 업데이트가 차단되었습니다. 제공해드린 SQL을 Supabase에서 실행해주세요!");
        }
        alert('진행 중인 세일에 기간과 사장님 이야기가 즉시 반영되었습니다!');
      } else {
        alert('아직 등록된 세일 내역이 없습니다. 먼저 상품과 함께 하단 버튼으로 등록해주세요.');
      }
    } catch (err: any) {
      console.error(err);
      alert('DB 저장 오류: ' + (err.message || '테이블 및 컬럼 생성을 확인해주세요.'));
    } finally {
      setLoading(false);
    }
  };
  // 최종 전송 버튼
  const handleSave = async () => {
    const validItems = items.filter(item => item.product_name && item.sale_price);

    // 상품이 없더라도 보스 메시지나 기간만 업데이트하는 경우를 허용하기 위해 유효성 검사를 나중으로 미룸
    if (!saleStart || !saleEnd) {
      alert('세일 시작일과 종료일을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      // 1. 가장 최근 이력을 가져와서 기간 비교
      const { data: latestPush } = await supabase.from('nao3_push_history').select('*').eq('store_id', storeId).order('created_at', { ascending: false })
        .limit(1)
        .single();

      const newStart = new Date(saleStart).toISOString();
      const newEnd = new Date(saleEnd).toISOString();

      let pushId = '';

      // 만약 방금 입력한 세일 기간이 최근 등록된 이력의 기간과 정확히 일치한다면? (동일 세일 그룹으로 간주)
      const isSamePeriod = latestPush && 
        new Date(latestPush.sale_start).getTime() === new Date(newStart).getTime() && 
        new Date(latestPush.sale_end).getTime() === new Date(newEnd).getTime();

      if (isSamePeriod) {
        // 기존 그룹에 추가 (업데이트)
        pushId = latestPush.id;
        const { data: updatedData, error: updateError } = await supabase.from('nao3_push_history').update({
          item_count: latestPush.item_count + validItems.length,
          boss_message: bossMessage.trim() || null
        }).eq('id', pushId).select();
        
        if (updateError) throw updateError;
        if (!updatedData || updatedData.length === 0) {
           throw new Error("보안 정책(RLS) 문제로 업데이트가 차단되었습니다. 제공해드린 SQL을 Supabase에서 실행해주세요!");
        }
      } else {
        // 완전히 새로운 기간이므로 새로운 세일 그룹 생성
        const { data: historyData, error: historyError } = await supabase
          .from('nao3_push_history')
          .insert([{ 
            item_count: validItems.length,
            sale_start: newStart,
            sale_end: newEnd,
            boss_message: bossMessage.trim() || null
          }])
          .select()
          .single();

        if (historyError) throw historyError;
        pushId = historyData.id;
      }

      // 발급받은 push_id로 아이템 일괄 Insert
      if (validItems.length > 0) {
        const dbPayload = validItems.map(item => ({
          category: item.category,
          product_name: item.product_name,
          quantity: item.quantity,
          sale_price: item.sale_price,
          is_sold_out: item.is_sold_out || false,
          push_id: pushId
        }));

        const { error: itemsError } = await supabase.from('nao3_sale_items').insert(dbPayload);
        if (itemsError) throw itemsError;
      }

      // 3. 성공 후 데이터 갱신
      setItems([]); // 대기열 초기화 (상품만 비움, 기간과 멘트는 유지하여 추가 등록 시 삭제 방지)
      localStorage.removeItem('nao3_staging_items');
      await fetchHistories(); 
      setSubmitted(true);
      
    } catch (err: any) {
      console.error(err);
      alert('DB 저장 오류: ' + (err.message || '테이블 및 컬럼 생성을 확인해주세요.'));
    } finally {
      setLoading(false);
    }
  };

  const currentItems = items;
  const totalItemsCount = items.length;

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full animate-fade-in-up">
          <div className="w-16 h-16 bg-[#5F0080]/10 text-[#5F0080] rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">등록이 완료되었습니다</h2>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            세일 품목이 성공적으로 발송 이력에 저장되었습니다.<br/>
            고객 페이지에 최신 전단지가 즉시 반영됩니다.
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
    <main className="bg-[#F9F9F9] min-h-screen pb-32">
      {/* 상단 영역: 헤더 + 탭 + 입력폼 (스크롤 시 자연스럽게 올라가도록 sticky 제거) */}
      <div className="bg-white shadow-sm flex flex-col border-b border-gray-200">
        
        {/* 헤더 */}
        <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between shadow-sm sticky top-0 z-50">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-[#5F0080] tracking-tight">Nao3</h1>
          <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-md">슈퍼마켓 어드민</span>
            </div>
            {/* 고유 URL 복사 안내 */}
            <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
              🔗 <span className="font-medium text-[#5F0080]">nao3.vercel.app/store/{storeId}/sale</span>
            </div>
          </div>
        <button 
          onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}
          className="text-xs text-gray-500 hover:text-gray-800 underline"
        >
          로그아웃
        </button>
      </div>

        {/* 상단 1단/2단 고정 영역: 상호명, 세일 기간 & 사장님 이야기 */}
        <div className="max-w-2xl mx-auto w-full p-4 bg-[#F9F9F9] border-b border-gray-200 flex flex-col gap-4">
          
          {/* 상호명 설정 */}
          <div>
            <h3 className="text-[13px] font-bold text-gray-800 mb-2 flex items-center gap-1.5">
              🏪 우리 매장 상호명
            </h3>
            <input 
              type="text" 
              value={storeName} 
              onChange={e => setStoreName(e.target.value)} 
              placeholder="예: 우리동네 할인마트"
              className="w-full text-[13px] font-bold text-[#5F0080] border border-gray-200 px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#5F0080]" 
            />
          </div>

          {/* 1단: 세일 진행 기간 */}
          <div>
            <h3 className="text-[13px] font-bold text-gray-800 mb-2 flex items-center gap-1.5">
              🗓️ 이번 세일 진행 기간
            </h3>
            <div className="flex items-center justify-between gap-2">
              <input 
                type="datetime-local" 
                value={saleStart} 
                onChange={e => setSaleStart(e.target.value)} 
                className="flex-1 text-[12px] font-bold text-[#5F0080] border border-gray-200 px-2 py-1.5 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#5F0080]" 
              />
              <span className="text-gray-400 font-bold">~</span>
              <input 
                type="datetime-local" 
                value={saleEnd} 
                onChange={e => setSaleEnd(e.target.value)} 
                className="flex-1 text-[12px] font-bold text-[#5F0080] border border-gray-200 px-2 py-1.5 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#5F0080]" 
              />
            </div>
          </div>
          
          {/* 2단: 사장님 이야기 */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[13px] font-bold text-gray-800 flex items-center gap-1.5">
              🌸 오늘의 사장님 이야기
            </h3>
            <textarea
              value={bossMessage}
              onChange={e => setBossMessage(e.target.value)}
              placeholder="예: 어머님들~ 오늘 들어온 한우 너무 좋습니다! 언능 나오세요~"
              className="w-full bg-[#5F0080]/5 border border-[#5F0080]/15 rounded-lg px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#5F0080] min-h-[60px] resize-y placeholder:text-gray-400"
            />
            <button
              onClick={handleQuickSaveSettings}
              disabled={loading}
              className="w-full py-2 bg-purple-50 text-[#5F0080] border border-purple-100 hover:bg-purple-100 font-bold rounded-lg transition-colors text-[13px]"
            >
              상호명 · 기간 · 멘트 즉시 반영하기
            </button>
          </div>
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
                onBlur={() => setTimeout(() => { setShowNameDropdown(false); setNameIdx(-1); }, 200)}
                onChange={e => {
                  setNewItem({...newItem, product_name: e.target.value});
                  setNameIdx(-1);
                  setShowNameDropdown(true);
                }}
                onKeyDown={(e) => {
                  if (!showNameDropdown || matchedNames.length === 0) return;
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setNameIdx(prev => (prev < matchedNames.length - 1 ? prev + 1 : prev));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setNameIdx(prev => (prev > 0 ? prev - 1 : 0));
                  } else if (e.key === 'Enter' && nameIdx >= 0) {
                    e.preventDefault();
                    setNewItem({...newItem, product_name: matchedNames[nameIdx]});
                    setShowNameDropdown(false);
                    setNameIdx(-1);
                  } else if (e.key === 'Escape') {
                    setShowNameDropdown(false);
                  }
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#5F0080]"
              />
              {/* 상품명 자동완성 드롭다운 */}
              {showNameDropdown && matchedNames.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {matchedNames.map((name, index) => (
                    <li 
                      key={name}
                      id={`name-item-${index}`}
                      onClick={() => {
                        setNewItem({...newItem, product_name: name});
                        setShowNameDropdown(false);
                      }}
                      className={`px-3 py-2 text-sm cursor-pointer border-b border-gray-100 last:border-0 ${
                        index === nameIdx ? 'bg-[#5F0080]/10 text-[#5F0080] font-bold' : 'text-gray-700 hover:bg-[#5F0080]/5 hover:text-[#5F0080]'
                      }`}
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
                  onBlur={() => setTimeout(() => { setShowQtyDropdown(false); setQtyIdx(-1); }, 200)}
                  onChange={e => {
                    setNewItem({...newItem, quantity: e.target.value});
                    setQtyIdx(-1);
                    setShowQtyDropdown(true);
                  }}
                  onKeyDown={(e) => {
                    if (!showQtyDropdown || matchedQtys.length === 0) return;
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setQtyIdx(prev => (prev < matchedQtys.length - 1 ? prev + 1 : prev));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setQtyIdx(prev => (prev > 0 ? prev - 1 : 0));
                    } else if (e.key === 'Enter' && qtyIdx >= 0) {
                      e.preventDefault();
                      setNewItem({...newItem, quantity: matchedQtys[qtyIdx]});
                      setShowQtyDropdown(false);
                      setQtyIdx(-1);
                    } else if (e.key === 'Escape') {
                      setShowQtyDropdown(false);
                    }
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#5F0080]"
                />
                {/* 중량 자동완성 드롭다운 */}
                {showQtyDropdown && matchedQtys.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {matchedQtys.map((qty, index) => (
                      <li 
                        key={qty}
                        id={`qty-item-${index}`}
                        onClick={() => {
                          setNewItem({...newItem, quantity: qty});
                          setShowQtyDropdown(false);
                        }}
                        className={`px-3 py-2 text-sm cursor-pointer border-b border-gray-100 last:border-0 ${
                          index === qtyIdx ? 'bg-[#5F0080]/10 text-[#5F0080] font-bold' : 'text-gray-700 hover:bg-[#5F0080]/5 hover:text-[#5F0080]'
                        }`}
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
                  setNewItem({...newItem, sale_price: raw});
                }}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[14px] font-bold text-[#5F0080] placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-1 focus:ring-[#5F0080]"
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="submit"
                className={`flex-1 py-2 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${editingHistoryItemId ? 'bg-[#5F0080] text-white' : 'bg-white border border-[#5F0080] text-[#5F0080] hover:bg-[#5F0080]/5'}`}
              >
                {editingHistoryItemId ? '✓ 수정 완료 (즉시 반영)' : <><span className="text-lg leading-none">+</span> 추가하기</>}
              </button>
              {editingHistoryItemId && (
                <button 
                  type="button"
                  onClick={() => {
                    setEditingHistoryItemId(null);
                    setNewItem({ product_name: '', quantity: '', sale_price: '' });
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* 등록된 품목 리스트 (컴팩트 뷰) */}
      <div className="max-w-2xl mx-auto p-3 pt-4 pb-6">
        <div className="flex justify-between items-end mb-2 px-1">
          <h3 className="text-sm font-bold text-gray-700">새로운 세일 푸시 등록 대기열</h3>
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
          <div className="flex flex-col gap-2">
            {currentItems.map((item) => (
              <div key={item.id} className={`flex flex-col bg-white rounded-lg border px-3 py-2.5 shadow-sm relative overflow-hidden transition-all border-gray-200`}>
                
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-[#5F0080] border border-[#5F0080]/20 bg-[#5F0080]/5 px-1.5 py-0.5 rounded flex-shrink-0">
                      {item.category}
                    </span>
                    <span className="text-[14px] font-bold text-gray-800 truncate">{item.product_name}</span>
                    <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">{item.quantity}</span>
                  </div>
                  <span className={`text-[15px] font-black flex-shrink-0 text-[#5F0080]`}>
                    {item.sale_price}
                  </span>
                </div>

                <div className="flex justify-end items-center pt-2 border-t border-gray-100">
                  <div className="flex gap-1.5">
                    <button 
                      type="button"
                      onClick={() => handleEditItem(item)}
                      className="text-[11px] font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      수정
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-[11px] font-bold px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 인라인 저장 버튼 (대기열 바로 아래 위치) */}
        <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between gap-4">
          <div className="flex flex-col pl-1">
            <span className="text-[11px] text-[#5F0080]/70 font-semibold">총 등록 대기</span>
            <span className="text-xl font-extrabold text-[#5F0080] leading-none">{totalItemsCount}건</span>
          </div>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3.5 bg-[#5F0080] hover:bg-[#4a0066] disabled:bg-gray-300 text-white font-bold rounded-xl transition-all shadow-sm disabled:shadow-none text-sm"
          >
            {loading ? '저장 중...' : '세일 푸시 등록 완료'}
          </button>
        </div>

      </div>

      {/* 발송 이력 섹션 */}
      <div className="max-w-2xl mx-auto p-3 pt-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3 px-1 flex items-center gap-1.5">
          🕒 지난 세일 발송 내역
        </h3>
        
        <div className="flex flex-col gap-3">
          {histories.map(history => {
            const dateObj = new Date(history.created_at);
            const dateStr = `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
            const isExpanded = expandedHistory === history.id;
            
            return (
              <div key={history.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button 
                  onClick={() => setExpandedHistory(isExpanded ? null : history.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[14px] font-bold text-gray-800">{dateStr} 발송</span>
                    <span className="text-[11px] font-bold text-[#5F0080] bg-[#5F0080]/10 px-2 py-0.5 rounded-full">{history.item_count}건</span>
                  </div>
                  <span className={`text-gray-400 text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                </button>
                
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50">
                    {history.nao3_sale_items?.length > 0 ? (
                      history.nao3_sale_items.map((item: any) => (
                        <div key={item.id} className={`flex flex-col py-3 px-4 border-b border-gray-100/50 last:border-0 ${item.is_sold_out ? 'bg-gray-100/30' : ''}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                              <span className="text-[10px] text-[#5F0080] border border-[#5F0080]/20 bg-[#5F0080]/5 px-1 rounded flex-shrink-0">{item.category}</span>
                              <h4 className={`text-[13px] font-bold truncate ${item.is_sold_out ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item.product_name}</h4>
                              <span className="text-[11px] text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded flex-shrink-0">{item.quantity}</span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className={`text-[14px] font-bold ${item.is_sold_out ? 'text-red-400 line-through' : 'text-gray-900'}`}>{item.sale_price}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <button 
                              type="button"
                              onClick={() => handleHistoryToggleSoldOut(history.id, item.id, item.is_sold_out)}
                              className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-colors ${item.is_sold_out ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                            >
                              {item.is_sold_out ? '품절 해제' : '품절 처리'}
                            </button>
                            <div className="flex gap-1.5">
                              <button 
                                type="button"
                                onClick={() => handleHistoryEditItem(history.id, item)}
                                className="text-[11px] font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                수정
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleHistoryDeleteItem(history.id, item.id)}
                                className="text-[11px] font-bold px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-400">상세 품목 데이터가 없습니다.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {histories.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-300 rounded-xl bg-white">
              아직 발송된 내역이 없습니다.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
