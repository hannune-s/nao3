"use client";

export default function LandingPaymentButton() {
  const loadPortOneV2 = () => {
    return new Promise((resolve, reject) => {
      if ((window as any).PortOne) {
        resolve((window as any).PortOne);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdn.portone.io/v2/browser-sdk.js';
      script.onload = () => resolve((window as any).PortOne);
      script.onerror = () => reject(new Error('포트원 V2 결제 모듈을 불러오지 못했습니다.'));
      document.head.appendChild(script);
    });
  };

  const handlePayNow = async () => {
    try {
      const portOneStoreId = 'store-3b8b6f42-8b0f-4b2f-bd5a-e8472da95ea3';
      const channelKey = 'channel-key-4370f11d-f43f-487b-b46d-e40dc2a1c600';
      const PortOne = (await loadPortOneV2()) as any;
      const paymentId = `nao3_landing_${Date.now()}`;

      const response = await PortOne.requestPayment({
        storeId: portOneStoreId,
        channelKey: channelKey,
        paymentId: paymentId,
        orderName: 'NAO3 월간 구독권 (1개월)',
        totalAmount: 14900,
        currency: 'CURRENCY_KRW',
        payMethod: 'CARD',
        customer: {
          fullName: '가맹점주',
          phoneNumber: '010-0000-0000',
          email: 'customer@nao3.kr',
        },
      });

      if (response?.code != null) {
        alert(`결제에 실패했습니다: ${response.message || response.pgMessage || '결제가 취소되었습니다.'}`);
        return;
      }

      alert('결제가 완료되었습니다! 스토어 계정 설정 페이지로 이동합니다.');
      window.location.href = '/register';
    } catch (err: any) {
      alert('결제 준비 중 오류가 발생했습니다: ' + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <button
        type="button"
        onClick={handlePayNow}
        className="block w-full py-4 text-center rounded-xl font-black text-white bg-[#4F46E5] hover:bg-indigo-700 transition-colors shadow-md cursor-pointer"
      >
        월간 이용권 바로 결제하기 (14,900원)
      </button>
      <a
        href="/register"
        className="block w-full py-3 text-center rounded-xl font-bold text-[#4F46E5] bg-indigo-50 hover:bg-indigo-100 transition-colors text-sm"
      >
        1개월 무료로 먼저 시작하기
      </a>
    </div>
  );
}
