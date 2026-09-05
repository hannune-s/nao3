"use client";
import { useEffect, useState } from 'react';
import { matchSearch } from '@/lib/hangul';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  { id: '정육', icon: '🥩' },
  { id: '청과', icon: '🍎' },
  { id: '야채', label: '야채·수산', icon: '🥬🐟' },
  { id: '공산품', icon: '🛒' },
];

const ITEM_DICT: Record<string, string[]> = {
  '정육': ['한우 등심', '한우 안심', '한우 국거리', '한우 불고기', '한돈 생삼겹살', '국내산 생삼겹살', '국내산 생목살', '그냥 생삼겹살', '생목살', '돼지고기 등심', '돼지고기 안심', '돼지고기 앞다리살', '돼지고기 항정살', '돼지고기 등뼈', '돼지고기 등갈비', '국내산 삼겹살', '국내산 목살', '찌개용 앞다리살', '수육용 삼겹살', '양념 돼지갈비', '닭볶음탕용 생닭', '닭가슴살', '호주산 척아이롤'],
  '청과': ['사과', '홍로사과', '바나나', '제주 감귤', '샤인머스캣', '캠벨포도', '고당도 수박', '딸기', '성주 참외', '딱딱이 복숭아', '신고배', '방울토마토', '블루베리', '오렌지', '골드키위', '그린키위', '애플망고', '노란망고', '석류', '체리'],
  '야채': ['깐마늘', '양파', '대파', '청양고추', '햇감자', '애호박', '상추', '깻잎', '백오이', '당근', '새송이버섯', '팽이버섯', '알배기 배추', '제주 무', '밤', '호박고구마', '밤고구마', '양배추', '시금치', '우엉', '아욱', '참나물', '새송이', '느타리버섯', '참마', '브루콜리', '감자', '취나물', '콩나물', '숙주나물', '봄동', '배추', '생물 오징어', '손질 오징어', '제주 은갈치', '생물 고등어', '활전복', '해감 바지락', '생굴', '꽃게', '생물 새우', '주꾸미', '동태', '생태', '자른 미역', '다시마', '국물용 멸치', '볶음용 멸치'],
  '공산품': ['농심 신라면', '오뚜기 진라면', 'CJ 햇반', '코카콜라', '칠성사이다', '동원참치', '스팸 클래식', '서울우유', '카누 아메리카노', '맥심 모카골드', '오리온왕고래밥', '삼양라면멀티 5입', '오징어짬뽕 6입', '동원양반김 3종', '백설콩식용유1.8L', 'CJ햇반찰기가득쌀밥200g*12입', '국내산천일염 20kg', '맥심모카믹스 160T+20T', '백설고소함가득참기름 450ml', '오뚜기사골곰탕 500g', '비비고진한사골곰탕 500g', '대상순창태양초고추장 1.5kg', '청정원맛술 3종/830ml', '동원쯔유 500g', '백설올리브유 900ml', 'CJ백설올리고당 2종/1.2kg', '농심신라면 5입', '스팸클래식 300g*3', '풀무원 특등급 국산콩물 960g', '유동자연산골뱅이 300g', '동원마일드참치 200g', '동원개성왕만두 2종/630g', '펩시콜라 2L', '카스알뜰캔 370ml*8', '퐁퐁친환경주방세제 1.2L', '샤프란햇빛건조 3종/2L', '깨끗한나라 더순수 30롤']
};

const QTY_DICT = [
  '100g', '200g', '300g', '400g', '500g', '600g(1근)', '800g', '1kg', '1개', '2개', '3개', '5개', '10개', '1팩', '2팩', '1단', '1망', '1봉', '1박스', '1마리', '2마리', '3마리', '4마리', '1손(2마리)', '마리', '팩', '단', '통', '입', 'kg', 'g', '롤', 'L', 'ml', '개', '봉', '망', '박스', '포', '캔', '병', '1통', '2통', '1입', '2입', '5입', '10입', '2kg', '5kg', '10kg', '20kg', '1L', '1.5L', '2L', '500ml', '900ml', '30롤', '100매'
];

interface MartAdminProps {
  storeId: string;
  initialStoreName: string;
  storeSlug?: string;
}

export default function MartAdmin({ storeId, initialStoreName, storeSlug }: MartAdminProps) {
  const [activeTab, setActiveTab] = useState('정육');
  const [items, setItems] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nao3_staging_items');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [newItem, setNewItem] = useState({ product_name: '', quantity: '', sale_price: '', discount_rate: '' });

  // 자동완성 드롭다운 상태
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [showQtyDropdown, setShowQtyDropdown] = useState(false);
  const [nameIdx, setNameIdx] = useState(-1);
  const [qtyIdx, setQtyIdx] = useState(-1);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [priceIdx, setPriceIdx] = useState(-1);

  // 이력 관리 상태
  const [histories, setHistories] = useState<any[]>([]);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [historyPage, setHistoryPage] = useState(1);

  // 상호명, 세일 진행 기간 및 사장님 이야기 상태
  const [storeName, setStoreName] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`nao3_draft_storeName_${storeId}`);
      if (saved) return saved;
    }
    return initialStoreName || '';
  });
  const [saleStart, setSaleStart] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`nao3_draft_saleStart_${storeId}`);
      if (saved) return saved;
    }
    return '';
  });
  const [saleEnd, setSaleEnd] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`nao3_draft_saleEnd_${storeId}`);
      if (saved) return saved;
    }
    return '';
  });
  const [bossMessage, setBossMessage] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`nao3_draft_bossMessage_${storeId}`);
      if (saved !== null) return saved;
    }
    return '';
  });

  // 탭 변경 시 폼 초기화
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setNewItem({ product_name: '', quantity: '', sale_price: '', discount_rate: '' });
    setNameIdx(-1);
    setQtyIdx(-1);
    setPriceIdx(-1);
  };

  // 이력에서 추출한 최근 사용 데이터
  const recentNames = Array.from(new Set(histories.flatMap(h => h.nao3_sale_items.filter((i: any) => i.category === activeTab).map((i: any) => i.product_name)))).filter(Boolean);
  const recentQtys = Array.from(new Set(histories.flatMap(h => h.nao3_sale_items.map((i: any) => i.quantity)))).filter(Boolean);
  const recentPrices = Array.from(new Set(histories.flatMap(h => h.nao3_sale_items.map((i: any) => i.sale_price.replace(/[^0-9]/g, ''))))).filter(Boolean);

  // 자동완성 필터링 리스트 (기본 제공 + 내 이력)
  const allNames = Array.from(new Set([...recentNames, ...(ITEM_DICT[activeTab] || [])]));
  const matchedNames = newItem.product_name.trim() === '' 
    ? allNames.slice(0, 30) // 빈 칸일 때는 내 최근 이력 + 기본 예제 표시
    : allNames.filter(name => matchSearch(newItem.product_name, name));

  const defaultQtys = Array.from(new Set([...recentQtys, ...QTY_DICT])).slice(0, 15);
  const matchedQtys = newItem.quantity.trim() === ''
    ? defaultQtys
    : Array.from(new Set([...recentQtys, ...QTY_DICT])).filter(qty => matchSearch(newItem.quantity, qty));

  const defaultPrices = Array.from(new Set([...recentPrices, '1000', '2000', '3000', '5000', '9900', '10000'])).slice(0, 15);
  const matchedPrices = newItem.sale_price.trim() === ''
    ? defaultPrices
    : defaultPrices.filter(price => price.includes(newItem.sale_price));

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

  useEffect(() => {
    if (priceIdx >= 0) {
      document.getElementById('price-item-' + priceIdx)?.scrollIntoView({ block: 'nearest' });
    }
  }, [priceIdx]);

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

      if (isAppendingToActive && latestPush?.boss_message) {
        setBossMessage(prev => prev || latestPush.boss_message);
      }

      fetchHistories();
    };

    loadInitData();
  }, []);

  // 상태가 변경될 때마다 로컬 스토리지에 자동 임시 저장 (새로고침 방지)
  useEffect(() => {
    localStorage.setItem('nao3_staging_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(`nao3_draft_storeName_${storeId}`, storeName);
  }, [storeName, storeId]);

  useEffect(() => {
    localStorage.setItem(`nao3_draft_saleStart_${storeId}`, saleStart);
  }, [saleStart, storeId]);

  useEffect(() => {
    localStorage.setItem(`nao3_draft_saleEnd_${storeId}`, saleEnd);
  }, [saleEnd, storeId]);

  useEffect(() => {
    localStorage.setItem(`nao3_draft_bossMessage_${storeId}`, bossMessage);
  }, [bossMessage, storeId]);

  // 목록에 추가 또는 즉시 수정
  const handleAddItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItem.product_name.trim() || !newItem.sale_price.trim()) {
      alert('상품명과 세일 가격은 필수입니다.');
      return;
    }

    const rawPrice = newItem.sale_price.replace(/[^0-9]/g, '');
    const formattedPrice = rawPrice ? parseInt(rawPrice, 10).toLocaleString() + '원' : '';

    const existingIndex = items.findIndex(i => i.product_name === newItem.product_name);
    
    // 현재 작성 중인 기간이 최신 이력(Active)과 같은지 확인
    const newStart = saleStart ? new Date(saleStart).getTime() : 0;
    const newEnd = saleEnd ? new Date(saleEnd).getTime() : 0;
    const latestPush = histories[0];
    const isSamePeriod = latestPush && 
      new Date(latestPush.sale_start).getTime() === newStart && 
      new Date(latestPush.sale_end).getTime() === newEnd;

    let targetHistoryItemId = editingHistoryItemId;

    // 만약 현재 Active 기간이고, DB에 이미 같은 상품이 있다면?
    if (!targetHistoryItemId && isSamePeriod && latestPush.nao3_sale_items) {
      const dbMatches = latestPush.nao3_sale_items.filter((i: any) => i.product_name === newItem.product_name);
      if (dbMatches.length > 0) {
        // 기존 중복 데이터가 있을 경우 가장 마지막 항목(화면에 렌더링되는 항목)을 타겟으로 함
        targetHistoryItemId = { pushId: latestPush.id, itemId: dbMatches[dbMatches.length - 1].id };
      }
    }

    if (targetHistoryItemId) {
      // 즉시 수정 모드
      try {
        const targetPush = histories.find(h => h.id === targetHistoryItemId.pushId);
        const originalItem = targetPush?.nao3_sale_items?.find((i: any) => i.id === targetHistoryItemId.itemId);
        const originalName = originalItem ? originalItem.product_name : newItem.product_name;
        
        let updateIds = [targetHistoryItemId.itemId];
        if (targetPush && targetPush.nao3_sale_items) {
          updateIds = targetPush.nao3_sale_items
            .filter((i: any) => i.product_name === originalName)
            .map((i: any) => i.id);
        }

        const { error } = await supabase.from('nao3_sale_items')
          .update({ 
            product_name: newItem.product_name, 
            quantity: newItem.quantity, 
            sale_price: formattedPrice,
            category: activeTab,
            discount_rate: newItem.discount_rate ? parseInt(newItem.discount_rate, 10) : null
          })
          .in('id', updateIds);
          
        if (error) throw error;
        
        // 로컬 상태 즉시 갱신
        setHistories(prev => prev.map(h => h.id === targetHistoryItemId.pushId ? {
          ...h,
          nao3_sale_items: h.nao3_sale_items.map((i: any) => updateIds.includes(i.id) ? {
            ...i,
            category: activeTab,
            product_name: newItem.product_name,
            quantity: newItem.quantity,
            sale_price: formattedPrice,
            discount_rate: newItem.discount_rate ? parseInt(newItem.discount_rate, 10) : null
          } : i)
        } : h));
        
        setEditingHistoryItemId(null);
        // 대기열에도 업데이트 반영
        if (existingIndex !== -1) {
          const newItems = [...items];
          newItems[existingIndex] = { ...newItems[existingIndex], quantity: newItem.quantity, sale_price: formattedPrice, category: activeTab, discount_rate: newItem.discount_rate || '' };
          setItems(newItems);
        } else {
          setItems([...items, { id: targetHistoryItemId.itemId, category: activeTab, product_name: newItem.product_name, quantity: newItem.quantity, sale_price: formattedPrice, discount_rate: newItem.discount_rate || '', is_sold_out: false }]);
        }
      } catch (err) {
        alert('이력 수정에 실패했습니다.');
        return;
      }
    } else {
      // 일반 대기열 추가 모드
      if (existingIndex !== -1) {
        // 이미 동일한 이름의 품목이 있다면 중량과 가격을 모두 최신으로 덮어씌움 (완벽한 Update)
        const newItems = [...items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItem.quantity,
          sale_price: formattedPrice,
          category: activeTab,
          discount_rate: newItem.discount_rate || ''
        };
        setItems(newItems);
      } else {
        const insertData = { 
          id: Date.now().toString(),
          category: activeTab, 
          product_name: newItem.product_name, 
          quantity: newItem.quantity, 
          sale_price: formattedPrice,
          discount_rate: newItem.discount_rate || '',
          is_sold_out: false
        };
        setItems([...items, insertData]);
        
      }
    }

    setNewItem({ product_name: '', quantity: '', sale_price: '', discount_rate: '' });
    setNameIdx(-1);
    setQtyIdx(-1);
  };

  // 수정 기능 (위 폼으로 끌어오기)
  const handleEditItem = (item: any) => {
    setNewItem({ 
      product_name: item.product_name, 
      quantity: item.quantity, 
      sale_price: item.sale_price.replace(/[^0-9]/g, ''),
      discount_rate: item.discount_rate || ''
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
      sale_price: item.sale_price.replace(/[^0-9]/g, ''),
      discount_rate: item.discount_rate ? String(item.discount_rate) : ''
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
  const handlePreview = () => {
    localStorage.setItem('nao3_staging_settings', JSON.stringify({
      storeName,
      saleStart,
      saleEnd,
      bossMessage
    }));
    localStorage.setItem('nao3_staging_items', JSON.stringify(items));
    window.open(`/store/${storeSlug}/sale?preview=true`, '_blank');
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
        
        const existingItemsInDb = latestPush.nao3_sale_items || [];
        const toUpdate: any[] = [];
        const toInsert: any[] = [];

        for (const item of validItems) {
          const dbMatch = existingItemsInDb.find((dbItem: any) => dbItem.product_name === item.product_name);
          if (dbMatch) {
            toUpdate.push({ id: dbMatch.id, quantity: item.quantity, sale_price: item.sale_price, category: item.category });
          } else {
            toInsert.push(item);
          }
        }

        // Run updates for existing DB items
        for (const up of toUpdate) {
           await supabase.from('nao3_sale_items').update({ quantity: up.quantity, sale_price: up.sale_price, category: up.category, discount_rate: up.discount_rate ? parseInt(up.discount_rate, 10) : null }).eq('id', up.id);
        }
        
        // Update the validItems array to only contain the items we need to insert
        validItems.length = 0;
        validItems.push(...toInsert);

        const { data: updatedData, error: updateError } = await supabase.from('nao3_push_history').update({
          item_count: latestPush.item_count + toInsert.length,
          boss_message: bossMessage.trim() || null
        }).eq('id', pushId).select();
        
        if (updateError) throw updateError;
      } else {
        // 완전히 새로운 기간이므로 새로운 세일 그룹 생성
        const { data: historyData, error: historyError } = await supabase
          .from('nao3_push_history')
          .insert([{ store_id: storeId, item_count: validItems.length,
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
          discount_rate: item.discount_rate ? parseInt(item.discount_rate, 10) : null,
          is_sold_out: item.is_sold_out || false,
          push_id: pushId,
          store_id: storeId
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
        <div className="bg-[#5F0080] p-4 border-b border-purple-900 flex items-center justify-between shadow-md sticky top-0 z-50 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
          
          <div className="flex flex-col gap-1 relative z-10">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-tight drop-shadow-sm">Nao3</h1>
              <span className="bg-purple-900/50 text-purple-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-700/50">슈퍼마켓 어드민</span>
            </div>
          </div>
          
          <button 
            onClick={() => window.open(`/store/${storeSlug}/sale`, '_blank')}
            className="text-[11px] font-extrabold text-[#5F0080] bg-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-purple-50 transition-colors flex items-center gap-1 relative z-10"
          >
            고객 화면 보기
          </button>
        </div>

        {/* 상단 1단/2단 고정 영역: 상호명, 세일 기간 & 사장님 이야기 */}
        <div className="max-w-2xl mx-auto w-full p-5 sm:p-6 bg-white border-b border-gray-100 shadow-sm flex flex-col gap-7">
          
          {/* 상호명 설정 */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[15px] font-extrabold text-gray-900 tracking-tight">
              우리 매장 상호명
            </h3>
            <input 
              type="text" 
              value={storeName} 
              onChange={e => setStoreName(e.target.value)} 
              placeholder="예: 우리동네 할인마트"
              className="w-full text-[15px] font-bold text-[#5F0080] border border-gray-200 px-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5F0080]/30 transition-all" 
            />
          </div>

          {/* 1단: 세일 진행 기간 */}
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[15px] font-extrabold text-gray-900 tracking-tight">
              이번 세일 진행 기간
            </h3>
            <div className="flex flex-col gap-2.5">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-gray-400 pointer-events-none">시작</span>
                <input 
                  type="datetime-local" 
                  value={saleStart} 
                  onChange={e => setSaleStart(e.target.value)} 
                  className="w-full text-[14px] font-bold text-[#5F0080] border border-gray-200 pl-12 pr-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5F0080]/30 transition-all" 
                />
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-gray-400 pointer-events-none">종료</span>
                <input 
                  type="datetime-local" 
                  value={saleEnd} 
                  onChange={e => setSaleEnd(e.target.value)} 
                  className="w-full text-[14px] font-bold text-[#5F0080] border border-gray-200 pl-12 pr-4 py-3 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5F0080]/30 transition-all" 
                />
              </div>
            </div>
          </div>
          
          {/* 2단: 사장님 이야기 */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[15px] font-extrabold text-gray-900 tracking-tight flex items-center gap-1.5">
              <span className="text-[16px] drop-shadow-sm">🌸</span> 오늘의 사장님 이야기
            </h3>
            <textarea
              value={bossMessage}
              onChange={e => setBossMessage(e.target.value)}
              placeholder="예: 어머님들~ 오늘 들어온 한우 너무 좋습니다! 언능 나오세요~"
              className="w-full bg-purple-50/50 border border-purple-100 rounded-xl px-4 py-3.5 text-[14px] text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#5F0080]/30 min-h-[90px] resize-y placeholder:text-gray-400 transition-all"
            />
            <button
              onClick={handleQuickSaveSettings}
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-[#5F0080] text-white hover:bg-purple-900 font-extrabold rounded-xl shadow-[0_4px_14px_rgba(95,0,128,0.25)] transition-all text-[15px] tracking-tight"
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
              <span>{cat.label || cat.id}</span>
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
              
              <div className="relative flex-1">
              <input 
                type="text" 
                placeholder="세일 가격 (숫자)"
                value={newItem.sale_price}
                onFocus={() => setShowPriceDropdown(true)}
                onBlur={() => setTimeout(() => { setShowPriceDropdown(false); setPriceIdx(-1); }, 200)}
                onChange={e => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setNewItem({...newItem, sale_price: raw});
                  setPriceIdx(-1);
                  setShowPriceDropdown(true);
                }}
                onKeyDown={(e) => {
                  if (!showPriceDropdown || matchedPrices.length === 0) return;
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setPriceIdx(prev => (prev < matchedPrices.length - 1 ? prev + 1 : prev));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setPriceIdx(prev => (prev > 0 ? prev - 1 : 0));
                  } else if (e.key === 'Enter' && priceIdx >= 0) {
                    e.preventDefault();
                    setNewItem({...newItem, sale_price: matchedPrices[priceIdx]});
                    setShowPriceDropdown(false);
                    setPriceIdx(-1);
                  } else if (e.key === 'Escape') {
                    setShowPriceDropdown(false);
                  }
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[14px] font-bold text-[#5F0080] placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-1 focus:ring-[#5F0080]"
              />
              {/* 세일 가격 자동완성 드롭다운 */}
              {showPriceDropdown && matchedPrices.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto top-full left-0">
                  
                  {matchedPrices.map((price, index) => (
                    <li 
                      key={index}
                      id={'price-item-' + index}
                      onMouseEnter={() => setPriceIdx(index)}
                      onClick={() => {
                        setNewItem({...newItem, sale_price: price});
                        setShowPriceDropdown(false);
                      }}
                      className={`px-3 py-2 text-sm cursor-pointer border-b border-gray-100 last:border-0 ${
                        index === priceIdx ? 'bg-[#5F0080]/10 text-[#5F0080] font-bold' : 'text-gray-700 hover:bg-[#5F0080]/5 hover:text-[#5F0080]'
                      }`}
                    >
                      {parseInt(price, 10).toLocaleString()}원
                    </li>
                  ))}
                </ul>
              )}
            </div>
            </div>

            {/* 할인율 입력 (인풋 박스 + 퀵 태그) */}
            <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 flex flex-col gap-2">
              <div className="flex items-center gap-2.5">
                <span className="text-[15px] font-black text-red-600 flex-shrink-0 tracking-tight pl-1">할인율</span>
                <div className="relative flex items-center flex-1">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="숫자 입력 (예: 50)"
                    value={newItem.discount_rate}
                    onChange={e => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setNewItem({...newItem, discount_rate: raw});
                    }}
                    className="w-full bg-white border border-red-200 rounded-lg px-3 py-1.5 text-[14px] font-bold text-red-500 placeholder:text-gray-300 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-red-400 pr-6"
                  />
                  {newItem.discount_rate && (
                    <span className="absolute right-2 text-[12px] font-black text-red-400 pointer-events-none">%</span>
                  )}
                </div>
                {newItem.discount_rate && (
                  <button
                    type="button"
                    onClick={() => setNewItem({...newItem, discount_rate: ''})}
                    className="text-[12px] text-gray-400 hover:text-red-400 font-bold flex-shrink-0 px-1"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="flex gap-1">
                {['5', '10', '15', '20', '30'].map(pct => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setNewItem({...newItem, discount_rate: newItem.discount_rate === pct ? '' : pct})}
                    className={`flex-1 py-1 text-[12px] font-bold rounded transition-colors ${
                      newItem.discount_rate === pct
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'bg-white text-red-400 border border-red-200 hover:bg-red-100'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-red-500 font-bold leading-tight tracking-tight mt-0.5 text-center break-keep opacity-80">
                ※ 입력하신 할인율은 실제 가격 계산에 반영되지 않으며, 고객 화면에 강조 표시용으로만 노출됩니다.
              </p>
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
        // 대기열에도 업데이트 반영
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

        {/* 하단 액션 버튼 그룹 */}
        <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100 flex flex-col gap-3">
          <div className="flex justify-between items-center pl-1">
            <span className="text-[12px] text-[#5F0080]/70 font-bold">총 등록 대기 상품</span>
            <span className="text-xl font-extrabold text-[#5F0080] leading-none">{totalItemsCount}건</span>
          </div>
          <div className="flex gap-2 w-full">
            <button 
              type="button"
              onClick={handlePreview}
              className="flex-1 py-3.5 bg-white border border-[#5F0080] text-[#5F0080] font-bold rounded-xl transition-all shadow-sm text-[14px]"
            >
              미리보기
            </button>
            <button 
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-3.5 bg-[#5F0080] hover:bg-[#4a0066] disabled:bg-gray-300 text-white font-bold rounded-xl transition-all shadow-sm disabled:shadow-none text-[14px]"
            >
              {loading ? '저장 중...' : '푸시 등록'}
            </button>
          </div>
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
            const uniqueItemCount = history.nao3_sale_items ? new Set(history.nao3_sale_items.map((i: any) => i.product_name)).size : 0;
            
            return (
              <div key={history.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button 
                  onClick={() => setExpandedHistory(isExpanded ? null : history.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[14px] font-bold text-gray-800">{dateStr} 발송</span>
                    <span className="text-[11px] font-bold text-[#5F0080] bg-[#5F0080]/10 px-2 py-0.5 rounded-full">{uniqueItemCount}건</span>
                  </div>
                  <span className={`text-gray-400 text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
                </button>
                
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50">
                    {history.nao3_sale_items?.length > 0 ? (
                      (() => {
                        const sortedItems = Array.from(new Map(history.nao3_sale_items.map((i: any) => [i.product_name, i])).values()).sort((a: any, b: any) => {
                          const order = ['정육', '청과', '야채', '야채·수산', '공산품'];
                          const idxA = order.indexOf(a.category);
                          const idxB = order.indexOf(b.category);
                          return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
                        });
                        
                        const ITEMS_PER_PAGE = 5;
                        const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);
                        const currentStart = (historyPage - 1) * ITEMS_PER_PAGE;
                        const paginatedItems = sortedItems.slice(currentStart, currentStart + ITEMS_PER_PAGE);
                        
                        return (
                          <>
                            {paginatedItems.map((item: any) => (
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
                            ))}
                            {totalPages > 1 && (
                              <div className="flex justify-center items-center gap-1.5 py-3 border-t border-gray-100 bg-white">
                                <button
                                  type="button"
                                  disabled={historyPage === 1}
                                  onClick={(e) => { e.stopPropagation(); setHistoryPage(p => p - 1); }}
                                  className="px-2 py-1 text-[12px] rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors font-medium"
                                >
                                  이전
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                  <button
                                    key={pageNum}
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setHistoryPage(pageNum); }}
                                    className={`w-7 h-7 rounded-full text-[12px] font-bold flex items-center justify-center transition-colors ${
                                      historyPage === pageNum 
                                        ? 'bg-[#5F0080] text-white shadow-sm' 
                                        : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                ))}
                                <button
                                  type="button"
                                  disabled={historyPage === totalPages}
                                  onClick={(e) => { e.stopPropagation(); setHistoryPage(p => p + 1); }}
                                  className="px-2 py-1 text-[12px] rounded text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors font-medium"
                                >
                                  다음
                                </button>
                              </div>
                            )}
                          </>
                        );
                      })()
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
