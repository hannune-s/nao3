"use client";

import { useState } from 'react';

export default function OgPreviewPage() {
  const [sampleStore, setSampleStore] = useState('옛날정육점');
  const [cacheBuster] = useState(() => Date.now());

  return (
    <div className="min-h-screen bg-[#1A1A1A] py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 rounded-full bg-[#5F0080] text-[#E5D7B7] text-xs font-black tracking-wider mb-3">
            KAKAOTALK LINK PREVIEW
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            카카오톡 링크 전송 미리보기 화면
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            &ldquo;어머님들~~~ 나오삼! 빨리 나오삼! 얼른 나오삼! 지금 당장 나오삼!&rdquo; 브랜드 컨셉이 반영된 카톡 미리보기입니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 1. 본사 메인 링크 (www.nao3.kr) */}
          <div className="bg-[#ABC1D1] rounded-3xl p-6 shadow-2xl border border-white/10">
            <div className="text-center mb-4">
              <span className="inline-block bg-black/25 text-white text-xs font-bold px-3 py-1 rounded-full">
                ① 본사 홍보 링크 보낼 때 (www.nao3.kr)
              </span>
            </div>

            {/* 카톡 노란 말풍선 */}
            <div className="flex justify-end mb-2.5">
              <div className="bg-[#FEE500] text-gray-900 text-sm font-semibold px-4 py-2.5 rounded-2xl rounded-tr-xs shadow-xs">
                https://www.nao3.kr
              </div>
            </div>

            {/* 카톡 OG 카드 */}
            <div className="flex justify-end items-end gap-2">
              <span className="text-[11px] text-gray-700 font-medium">오후 12:31</span>
              <div className="w-[310px] bg-white rounded-2xl overflow-hidden shadow-md border border-black/5">
                <img
                  src={`/api/og?v=${cacheBuster}`}
                  alt="나오삼 대표 이미지"
                  className="w-full h-[162px] object-cover border-b border-gray-100"
                />
                <div className="p-3.5">
                  <h3 className="text-[14px] font-bold text-gray-900 leading-snug line-clamp-2">
                    나오삼(NAO3) - &ldquo;어머님들~ 지금 당장 나오삼!&rdquo; 매출 폭발 1초 전단지
                  </h3>
                  <p className="text-[12px] text-gray-500 mt-1 line-clamp-2 leading-snug">
                    빨리 나오삼! 얼른 나오삼! 집에 계신 동네 손님들을 당장 우리 가게로 뛰어나오게 만드는 1초 스마트 전단지 (문자비 평생 0원)
                  </p>
                  <p className="text-[11.5px] text-blue-600 mt-2 font-medium">
                    www.nao3.kr
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. 가맹점 전단지 링크 (www.nao3.kr/store/가게명/sale) */}
          <div className="bg-[#ABC1D1] rounded-3xl p-6 shadow-2xl border border-white/10">
            <div className="text-center mb-4">
              <span className="inline-block bg-black/25 text-white text-xs font-bold px-3 py-1 rounded-full">
                ② 사장님이 손님께 매장 전단지 보낼 때
              </span>
            </div>

            {/* 테스트 상호명 변경 입력 */}
            <div className="mb-3 flex items-center gap-2 bg-white/70 backdrop-blur-xs rounded-xl px-3 py-1.5">
              <span className="text-xs font-extrabold text-gray-700 shrink-0">상호명 테스트:</span>
              <input
                type="text"
                value={sampleStore}
                onChange={(e) => setSampleStore(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-900 focus:outline-none"
                placeholder="매장 이름 입력"
              />
            </div>

            {/* 카톡 노란 말풍선 */}
            <div className="flex justify-end mb-2.5">
              <div className="bg-[#FEE500] text-gray-900 text-sm font-semibold px-4 py-2.5 rounded-2xl rounded-tr-xs shadow-xs">
                https://www.nao3.kr/store/{sampleStore || '우리매장'}/sale
              </div>
            </div>

            {/* 카톡 OG 카드 */}
            <div className="flex justify-end items-end gap-2">
              <span className="text-[11px] text-gray-700 font-medium">오후 12:31</span>
              <div className="w-[310px] bg-white rounded-2xl overflow-hidden shadow-md border border-black/5">
                <img
                  src={`/api/og?store=${encodeURIComponent(sampleStore || '우리매장')}&v=${cacheBuster}`}
                  alt="매장 전단지 대표 이미지"
                  className="w-full h-[162px] object-cover border-b border-gray-100"
                />
                <div className="p-3.5">
                  <h3 className="text-[14px] font-bold text-gray-900 leading-snug line-clamp-2">
                    [{sampleStore || '우리매장'}] &ldquo;어머님들~ 빨리 나오삼!&rdquo; 오늘의 특가 전단지 도착
                  </h3>
                  <p className="text-[12px] text-gray-500 mt-1 line-clamp-2 leading-snug">
                    얼른 나오삼! 지금 당장 나오삼! 사고 싶은 세일 상품을 1초 만에 검색해 보세요.
                  </p>
                  <p className="text-[11.5px] text-blue-600 mt-2 font-medium">
                    www.nao3.kr
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
