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
    
    // 1. 가게 설정 (상호명, 기간, 사장님 이야기)
    const demoSettings: any = {
      storeName: '나오삼마트',
      saleStart: '2026-09-06T08:48',
      saleEnd: '2026-09-08T23:59',
      bossMessage: '어머님들 지금 바로 나오시면 사과한박스 천원! 선착순 2명!! 너무 더워서 눈에 뵈는게 없어요ㅋㅋㅋㅋㅋㅋㅋㅋ얼른 나오세용~~~~~'
    };
    localStorage.setItem('nao3_staging_settings', JSON.stringify(demoSettings));

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
      media_url: 'https://images.unsplash.com/photo-1537249826354-9464e837699d?auto=format&fit=crop&q=80&w=800' // 샤인머스캣 대체 이미지 (청포도)
    };
    localStorage.setItem(`nao3_draft_special_${demoId}`, JSON.stringify(demoSpecial));
    // 고객화면에서 읽을 수 있도록 staging_settings 에도 병합
    demoSettings.special_title = demoSpecial.title;
    demoSettings.special_price = demoSpecial.price;
    demoSettings.special_message = demoSpecial.message;
    demoSettings.special_image_url = demoSpecial.media_url;
    localStorage.setItem('nao3_staging_settings', JSON.stringify(demoSettings));

    // 3. 세일 상품 목록
    const demoItems = [
      { id: '1', category: '청과', name: '꿀사과 1박스', price: 15000, discount_rate: 30, original_price: 21500, stock_status: 'in_stock' },
      { id: '2', category: '청과', name: '성주 참외 1봉', price: 8900, discount_rate: 20, original_price: 11100, stock_status: 'in_stock' },
      { id: '3', category: '정육', name: '한우 등심 200g', price: 10000, discount_rate: 30, original_price: 14300, stock_status: 'in_stock' },
      { id: '4', category: '야채', name: '햇감자 1박스', price: 5000, discount_rate: 50, original_price: 10000, stock_status: 'in_stock' },
    ];
    localStorage.setItem('nao3_staging_items', JSON.stringify(demoItems));
    
    router.push(`/store/${demoId}`);
  };

  return (
    <button onClick={handleDemo} className={className}>
      {children}
    </button>
  );
}
