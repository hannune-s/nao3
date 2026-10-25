'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

interface DemoButtonProps {
  className?: string;
  children: React.ReactNode;
}

export default function DemoButton({ className, children }: DemoButtonProps) {
  const router = useRouter();
  
  const handleDemo = () => {
    // Generate a random 6 char alphanumeric string
    const randomStr = Math.random().toString(36).substring(2, 8);
    const demoId = `demo-guest-${randomStr}`;

    // 동적 날짜 (오늘 ~ 이틀 후 23:59)
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const toLocalStr = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    const saleEnd = new Date(now);
    saleEnd.setDate(saleEnd.getDate() + 2);
    saleEnd.setHours(23, 59, 0, 0);

    // 1. 가게 설정 (상호명, 기간, 사장님 이야기)
    const demoSettings: any = {
      storeName: '나오삼마트',
      saleStart: toLocalStr(now),
      saleEnd: toLocalStr(saleEnd),
      bossMessage: '어머님들 지금 바로 나오시면 사과한박스 천원! 선착순 2명!! 너무 더워서 눈에 뵈는게 없어요ㅋㅋㅋㅋㅋㅋㅋㅋ얼른 나오세용~~~~~'
    };
    localStorage.setItem(`nao3_staging_settings_${demoId}`, JSON.stringify(demoSettings));

    // 개별 키들도 채워줌 (MartAdmin에서 개별 키로 로드할 수도 있으므로)
    localStorage.setItem(`nao3_draft_storeName_${demoId}`, demoSettings.storeName);
    localStorage.setItem(`nao3_draft_saleStart_${demoId}`, demoSettings.saleStart);
    localStorage.setItem(`nao3_draft_saleEnd_${demoId}`, demoSettings.saleEnd);
    localStorage.setItem(`nao3_draft_bossMessage_${demoId}`, demoSettings.bossMessage);

    // 2. 추천 특가 (특가 이미지 및 상품)
    const demoSpecial = {
      title: '상큼한 샤인머스캣',
      price: '9,900',
      message: '상큼하게 번지는 달콤함 가득~',
      media_url: '/shine_muscat.jpg'
    };
    localStorage.setItem(`nao3_draft_special_${demoId}`, JSON.stringify(demoSpecial));
    // 고객화면에서 읽을 수 있도록 staging_settings 에도 병합
    demoSettings.special_title = demoSpecial.title;
    demoSettings.special_price = demoSpecial.price;
    demoSettings.special_message = demoSpecial.message;
    demoSettings.special_image_url = demoSpecial.media_url;
    localStorage.setItem(`nao3_staging_settings_${demoId}`, JSON.stringify(demoSettings));

    // 3. 세일 상품 목록 (품절 예시 포함)
    const demoItems = [
      { id: '1', category: '청과', product_name: '꿀사과 1박스', quantity: '', sale_price: '15,000원', discount_rate: 30, grade: '', origin: '', is_sold_out: false },
      { id: '2', category: '청과', product_name: '성주 참외 1봉', quantity: '', sale_price: '8,900원', discount_rate: 20, grade: '', origin: '', is_sold_out: false },
      { id: '3', category: '청과', product_name: '블루베리 1팩', quantity: '', sale_price: '6,900원', discount_rate: 30, grade: '', origin: '', is_sold_out: true },
      { id: '4', category: '정육', product_name: '한우 등심', quantity: '200g', sale_price: '10,000원', discount_rate: 30, grade: '1++', origin: '국산', is_sold_out: false },
      { id: '5', category: '정육', product_name: '국내산 생삼겹살', quantity: '300g', sale_price: '5,500원', discount_rate: 20, grade: '', origin: '국산', is_sold_out: true },
      { id: '6', category: '야채', product_name: '햇감자 1박스', quantity: '', sale_price: '5,000원', discount_rate: 50, grade: '', origin: '', is_sold_out: false },
      { id: '7', category: '야채', product_name: '대파 1단', quantity: '', sale_price: '1,500원', discount_rate: 40, grade: '', origin: '', is_sold_out: false },
    ];
    localStorage.setItem(`nao3_staging_items_${demoId}`, JSON.stringify(demoItems));
    localStorage.setItem(`nao3_staging_settings_${demoId}`, JSON.stringify(demoSettings));

    // 체험 모드에서 '지난 세일 발송 내역 (실시간 품절 처리)'도 바로 체험할 수 있도록 기본 이력 세팅
    const initialDemoHistory = [
      {
        id: `demo-push-init-${demoId}`,
        store_id: demoId,
        sale_start: new Date(now).toISOString(),
        sale_end: new Date(saleEnd).toISOString(),
        boss_message: demoSettings.bossMessage,
        created_at: new Date(now).toISOString(),
        item_count: demoItems.length,
        nao3_sale_items: demoItems,
      },
    ];
    localStorage.setItem('nao3_demo_histories', JSON.stringify(initialDemoHistory));
    
    router.push(`/store/${demoId}`);
  };

  return (
    <button onClick={handleDemo} className={className}>
      {children}
    </button>
  );
}
