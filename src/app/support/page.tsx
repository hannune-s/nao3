"use client";

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import DemoButton from '@/components/DemoButton';

export default function SupportPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const formatPhoneInput = (val: string) => {
    const digits = val.replace(/[^0-9]/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      alert('이름(또는 상호명)을 입력해주세요.');
      return;
    }
    if (!guestPhone.trim()) {
      alert('연락받으실 전화번호를 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('문의하실 내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const nowIso = new Date().toISOString();
      const inquiryId = `GUEST_INQUIRY_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const payload = {
        id: inquiryId,
        setting_key: inquiryId,
        is_guest: true,
        guest_name: guestName.trim(),
        guest_phone: guestPhone.trim(),
        guest_email: guestEmail.trim(),
        store_name: `[비회원] ${guestName.trim()}`,
        content: content.trim(),
        status: '답변대기',
        reply: '',
        created_at: nowIso,
      };

      const { error } = await supabase.from('nao3_system_settings').insert({
        setting_key: inquiryId,
        setting_value: JSON.stringify(payload),
      });

      if (error) throw error;

      setSubmittedSuccess(true);
      setGuestName('');
      setGuestPhone('');
      setGuestEmail('');
      setContent('');
    } catch (err) {
      console.error('Failed to submit guest inquiry:', err);
      alert('문의 접수 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = () => {
    setSubmittedSuccess(false);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-gray-900 flex flex-col justify-between selection:bg-[#5F0080] selection:text-white">
      {/* Top Navigation */}
      <nav className="fixed w-full z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black text-[#5F0080] tracking-tight">NAO3</span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#5F0080]/10 text-[#5F0080] text-[10px] font-bold">
              사장님 필수앱
            </span>
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center h-8 sm:h-9 px-2.5 sm:px-4 rounded-full text-[11px] sm:text-[13px] font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 transition-all whitespace-nowrap"
            >
              로그인
            </Link>
            <DemoButton className="inline-flex items-center justify-center h-8 sm:h-9 px-2.5 sm:px-4 rounded-full text-[11px] sm:text-[13px] font-bold text-[#5F0080] bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-all whitespace-nowrap">
              체험하기
            </DemoButton>
            <Link
              href="/register"
              className="inline-flex items-center justify-center h-8 sm:h-9 px-3 sm:px-4 rounded-full text-[11px] sm:text-[13px] font-bold text-white bg-[#5F0080] hover:bg-purple-900 border border-[#5F0080] shadow-sm shadow-purple-900/15 transition-all whitespace-nowrap"
            >
              스토어 개설
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center justify-center h-8 sm:h-9 px-2.5 sm:px-4 rounded-full text-[11px] sm:text-[13px] font-extrabold text-[#5F0080] bg-purple-100/80 border border-purple-200 transition-all whitespace-nowrap"
            >
              고객지원
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Support Content */}
      <main className="pt-32 sm:pt-40 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Header Copy */}
        <div className="text-center mb-14 sm:mb-16 animate-fade-in-up">
          <span className="inline-block px-3.5 py-1 rounded-full bg-purple-100 text-[#5F0080] text-xs font-extrabold tracking-wide mb-4">
            NAO3 CUSTOMER CENTER
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-5 break-keep">
            무엇을 도와드릴까요?
          </h1>
          <p className="text-base sm:text-lg text-gray-500 font-medium leading-relaxed break-keep">
            도움이 필요하다면 언제든 편하게 문의해 주세요.<br />
            나오삼(NAO3) 팀이 함께 빠르고 친절하게 해결해 드릴게요!
          </p>
        </div>

        {/* 2 Cards Grid: 전화 문의 & 이메일(1:1) 문의 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Card 1: 전화 문의 */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.04)] flex flex-col items-center text-center justify-between hover:border-purple-200 transition-all">
            <div className="w-full flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-6 shadow-xs">
                <svg className="w-10 h-10 text-[#5F0080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
                전화 문의
              </h2>

              <div className="space-y-1.5 text-sm sm:text-[15px] text-gray-500 font-medium mb-6 leading-relaxed">
                <p className="text-gray-700 font-bold">
                  월~금요일 10:00 ~ 16:00 (평일 영업)
                </p>
                <p>점심시간 12:00 ~ 13:00 (주말·공휴일 휴무)</p>
              </div>

              <div className="px-5 py-3 rounded-2xl bg-[#FAF8FF] border border-purple-100 mb-8 w-full max-w-xs">
                <p className="text-xs font-bold text-gray-400 mb-0.5">고객센터 대표번호</p>
                <p className="text-2xl font-black text-[#5F0080] tracking-tight">070-4233-5553</p>
              </div>
            </div>

            <a
              href="tel:070-4233-5553"
              className="w-full max-w-xs py-4 px-6 rounded-xl border-2 border-gray-200 hover:border-[#5F0080] bg-white hover:bg-purple-50/40 text-gray-900 hover:text-[#5F0080] font-black text-[15px] transition-all flex items-center justify-center gap-2"
            >
              📞 전화 문의하기
            </a>
          </div>

          {/* Card 2: 이메일 (1:1 온라인) 문의 */}
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200/80 shadow-[0_12px_40px_rgba(0,0,0,0.04)] flex flex-col items-center text-center justify-between hover:border-purple-200 transition-all">
            <div className="w-full flex flex-col items-center">
              <div className="w-20 h-20 rounded-3xl bg-purple-50 border border-purple-100 flex items-center justify-center mb-6 shadow-xs">
                <svg className="w-10 h-10 text-[#5F0080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
                이메일 문의
              </h2>

              <div className="space-y-1.5 text-sm sm:text-[15px] text-gray-500 font-medium mb-6 leading-relaxed">
                <p className="text-gray-700 font-bold">
                  365일 24시간 언제든 접수 가능
                </p>
                <p>회원가입 없이도 궁금한 점을 남겨주시면 빠르게 연락드려요</p>
              </div>

              <div className="px-5 py-3 rounded-2xl bg-[#FAF8FF] border border-purple-100 mb-8 w-full max-w-xs">
                <p className="text-xs font-bold text-gray-400 mb-0.5">공식 이메일 · 1:1 온라인 접수</p>
                <p className="text-base font-extrabold text-gray-700">hangose7@gmail.com</p>
              </div>
            </div>

            <button
              type="button"
              onClick={openModal}
              className="w-full max-w-xs py-4 px-6 rounded-xl bg-[#5F0080] hover:bg-[#4A0066] text-white font-black text-[15px] shadow-md shadow-purple-900/15 transition-all cursor-pointer"
            >
              이메일 보내기 (1:1 문의)
            </button>
          </div>
        </div>
      </main>

      {/* 1:1 비회원 문의 모달창 */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-100 text-[#5F0080] text-[11px] font-black mb-1">
                  비회원 · 예비 사장님 문의 가능
                </span>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  1:1 문의 보내기
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            {submittedSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl mx-auto">
                  ✓
                </div>
                <h4 className="text-xl font-black text-gray-900">
                  문의가 정상적으로 접수되었습니다!
                </h4>
                <p className="text-sm text-gray-500 leading-relaxed">
                  남겨주신 내용을 본사 담당자가 확인한 후,<br />
                  입력하신 전화번호로 빠르고 친절하게 안내해 드리겠습니다.
                </p>
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-3.5 rounded-xl bg-[#5F0080] text-white font-black text-sm hover:bg-[#4A0066] transition-colors"
                  >
                    확인
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitInquiry} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1.5">
                    이름 (또는 매장 상호명) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="예: 홍길동 / 대박정육점"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/70 focus:bg-white text-sm font-bold text-gray-900 outline-none focus:border-[#5F0080] focus:ring-2 focus:ring-[#5F0080]/15 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1.5">
                    연락받으실 전화번호 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(formatPhoneInput(e.target.value))}
                    placeholder="예: 010-1234-5678"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/70 focus:bg-white text-sm font-bold text-gray-900 outline-none focus:border-[#5F0080] focus:ring-2 focus:ring-[#5F0080]/15 transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1.5">
                    이메일 주소 <span className="text-gray-400 font-normal">(선택)</span>
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="예: example@naver.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/70 focus:bg-white text-sm font-bold text-gray-900 outline-none focus:border-[#5F0080] focus:ring-2 focus:ring-[#5F0080]/15 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 mb-1.5">
                    문의 내용 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="궁금하신 점이나 도입 문의 내용을 편하게 적어주세요."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/70 focus:bg-white text-sm font-medium text-gray-900 outline-none focus:border-[#5F0080] focus:ring-2 focus:ring-[#5F0080]/15 transition-all resize-none"
                    required
                  />
                </div>

                <p className="text-[11px] text-gray-400 leading-relaxed">
                  * 운영시간(평일 10:00~16:00, 점심 12:00~13:00 제외) 내 접수 건은 당일 순차 안내드리며, 운영시간 외 접수 건은 다음 영업일에 가장 먼저 연락드립니다.
                </p>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/3 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-2/3 py-3.5 rounded-xl bg-[#5F0080] hover:bg-[#4A0066] text-white font-black text-sm shadow-md shadow-purple-900/15 transition-all disabled:opacity-50"
                  >
                    {submitting ? '전송 중...' : '문의 보내기'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Simple Footer */}
      <footer className="bg-black text-gray-500 py-10 text-center text-xs border-t border-gray-900">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-black text-lg text-white">NAO3</span>
            <span>고객센터 070-4233-5553 (월~금 10:00~16:00 / 점심 12:00~13:00)</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-gray-300">이용약관</Link>
            <Link href="/privacy" className="hover:text-gray-300 font-bold text-gray-400">개인정보 처리방침</Link>
            <span>© 2026 NAO3</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
