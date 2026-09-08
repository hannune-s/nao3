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
    localStorage.setItem(ao3_staging_settings_\, JSON.stringify(demoSettings));

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
      media_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Shine_Muscat_1.jpg/800px-Shine_Muscat_1.jpg' // 샤인머스캣 대체 이미지 (청포도)
    };
    localStorage.setItem(`nao3_draft_special_${demoId}`, JSON.stringify(demoSpecial));
    // 고객화면에서 읽을 수 있도록 staging_settings 에도 병합
    demoSettings.special_title = demoSpecial.title;
    demoSettings.special_price = demoSpecial.price;
    demoSettings.special_message = demoSpecial.message;
    demoSettings.special_image_url = demoSpecial.media_url;
    localStorage.setItem(ao3_staging_settings_\, JSON.stringify(demoSettings));

    // 3. 세일 상품 목록
    const demoItems = [
      { id: '1', category: '청과', product_name: '꿀사과 1박스', sale_price: '15,000원', discount_rate: 30, is_sold_out: false },
      { id: '2', category: '청과', product_name: '성주 참외 1봉', sale_price: '8,900원', discount_rate: 20, is_sold_out: false },
      { id: '3', category: '정육', product_name: '한우 등심 200g', sale_price: '10,000원', discount_rate: 30, is_sold_out: false },
      { id: '4', category: '야채', product_name: '햇감자 1박스', sale_price: '5,000원', discount_rate: 50, is_sold_out: false },
    ];
    localStorage.setItem(`nao3_staging_items_${demoId}`, JSON.stringify(demoItems));
    localStorage.setItem(`nao3_staging_settings_${demoId}`, JSON.stringify(demoSettings));
    
    router.push(`/store/${demoId}`);
  };

  return (
    <button onClick={handleDemo} className={className}>
      {children}
    </button>
  );
}
