"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function HqInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'GUEST' | 'STORE'>('ALL');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const [storeRes, guestRes] = await Promise.all([
        supabase
          .from('nao3_inquiries')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('nao3_system_settings')
          .select('setting_key, setting_value')
          .like('setting_key', 'GUEST_INQUIRY_%')
      ]);

      const storeList = (storeRes.data || []).map((item: any) => ({
        ...item,
        is_guest: false,
      }));

      const guestList: any[] = [];
      if (guestRes.data) {
        for (const row of guestRes.data) {
          try {
            const parsed = JSON.parse(row.setting_value);
            guestList.push({
              ...parsed,
              id: row.setting_key,
              setting_key: row.setting_key,
              is_guest: true,
            });
          } catch (e) {
            console.warn('Failed to parse guest inquiry row:', row.setting_key, e);
          }
        }
      }

      const merged = [...storeList, ...guestList].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setInquiries(merged);
    } catch (err) {
      console.warn('DB fetching failed.', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyChange = (id: string, text: string) => {
    setReplyText((prev) => ({ ...prev, [id]: text }));
  };

  const submitReply = async (inq: any) => {
    const reply = replyText[inq.id];
    if (!reply || !reply.trim()) return alert('답변(또는 상담 처리 메모) 내용을 입력해주세요.');

    try {
      if (inq.is_guest) {
        const updatedPayload = {
          ...inq,
          reply: reply.trim(),
          status: '답변완료',
          replied_at: new Date().toISOString(),
        };
        const { error } = await supabase
          .from('nao3_system_settings')
          .update({
            setting_value: JSON.stringify(updatedPayload),
          })
          .eq('setting_key', inq.setting_key || inq.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('nao3_inquiries')
          .update({
            reply: reply.trim(),
            status: '답변완료',
          })
          .eq('id', inq.id);

        if (error) throw error;
      }

      alert(inq.is_guest ? '비회원 상담 처리 내역이 저장되었습니다.' : '답변이 등록되었습니다.');
      fetchInquiries();
    } catch (err) {
      console.error(err);
      alert('답변 등록 실패. DB를 확인하세요.');
    }
  };

  const handleDeleteInquiry = async (inq: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('이 문의 내역을 삭제하시겠습니까?')) return;

    try {
      if (inq.is_guest) {
        const { error } = await supabase
          .from('nao3_system_settings')
          .delete()
          .eq('setting_key', inq.setting_key || inq.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('nao3_inquiries')
          .delete()
          .eq('id', inq.id);
        if (error) throw error;
      }
      setInquiries((prev) => prev.filter((item) => item.id !== inq.id));
    } catch (err) {
      console.error(err);
      alert('문의 삭제 중 오류가 발생했습니다.');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (filterType === 'GUEST') return inq.is_guest;
    if (filterType === 'STORE') return !inq.is_guest;
    return true;
  });

  const guestCount = inquiries.filter((i) => i.is_guest).length;
  const storeCount = inquiries.filter((i) => !i.is_guest).length;

  if (loading) return <div className="p-8 text-gray-500">문의 내역을 불러오는 중...</div>;

  return (
    <div className="max-w-5xl animate-fade-in-up">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">1:1 문의 관리</h2>
          <p className="text-gray-500 mt-1.5 text-sm">
            가맹점 사장님 문의와 랜딩페이지 고객지원 비회원 문의를 한곳에서 확인하고 관리합니다.
          </p>
        </div>

        {/* 필터 탭 */}
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              filterType === 'ALL' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            전체 ({inquiries.length})
          </button>
          <button
            onClick={() => setFilterType('GUEST')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              filterType === 'GUEST' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            비회원 문의 ({guestCount})
          </button>
          <button
            onClick={() => setFilterType('STORE')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              filterType === 'STORE' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            가맹점 문의 ({storeCount})
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredInquiries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            접수된 문의 내역이 없습니다.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredInquiries.map((inq) => {
              const isExpanded = expandedId === inq.id;

              return (
                <li key={inq.id} className="flex flex-col">
                  {/* 게시판 제목 영역 (클릭 시 펼침) */}
                  <button
                    onClick={() => toggleExpand(inq.id)}
                    className={`flex items-center justify-between p-4 sm:p-5 transition-colors text-left ${
                      isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3.5 flex-1 min-w-0 pr-3">
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-md whitespace-nowrap shrink-0 ${
                          inq.status === '답변완료'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {inq.status || '답변대기'}
                      </span>

                      {inq.is_guest ? (
                        <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-purple-100 text-[#5F0080] border border-purple-200 whitespace-nowrap shrink-0">
                          비회원 문의
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 whitespace-nowrap shrink-0">
                          가맹점
                        </span>
                      )}

                      <span className="font-extrabold text-gray-900 shrink-0 text-sm">
                        {inq.is_guest ? inq.guest_name : inq.store_name}
                      </span>

                      {inq.is_guest && inq.guest_phone && (
                        <span className="hidden md:inline-block text-xs font-bold text-[#5F0080] bg-purple-50 px-2 py-0.5 rounded shrink-0">
                          📞 {inq.guest_phone}
                        </span>
                      )}

                      {inq.is_guest && inq.guest_email && (
                        <span className="hidden lg:inline-block text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded shrink-0">
                          ✉️ {inq.guest_email}
                        </span>
                      )}

                      <span className="text-sm text-gray-600 truncate">{inq.content}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-gray-400">
                      <span className="text-xs">
                        {new Date(inq.created_at).toLocaleString('ko-KR', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span
                        onClick={(e) => handleDeleteInquiry(inq, e)}
                        className="text-xs text-gray-400 hover:text-red-600 px-1.5 py-1 rounded hover:bg-red-50 transition-colors"
                        title="문의 삭제"
                      >
                        삭제
                      </span>
                      <svg
                        className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* 상세 내용 영역 */}
                  {isExpanded && (
                    <div className="p-5 sm:p-6 bg-white border-t border-gray-100">
                      {/* 비회원 연락처 정보 카드 */}
                      {inq.is_guest && (
                        <div className="mb-5 p-4 rounded-xl bg-purple-50/70 border border-purple-100 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 font-semibold mr-1.5">문의자명:</span>
                              <span className="font-black text-gray-900">{inq.guest_name}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 font-semibold mr-1.5">연락처:</span>
                              <a
                                href={`tel:${inq.guest_phone}`}
                                className="font-black text-[#5F0080] underline hover:text-purple-900"
                              >
                                {inq.guest_phone}
                              </a>
                            </div>
                            {inq.guest_email && (
                              <div>
                                <span className="text-gray-500 font-semibold mr-1.5">이메일:</span>
                                <a
                                  href={`mailto:${inq.guest_email}`}
                                  className="font-black text-[#5F0080] underline hover:text-purple-900"
                                >
                                  {inq.guest_email}
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {inq.guest_email && (
                              <a
                                href={`mailto:${inq.guest_email}`}
                                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-purple-200 text-[#5F0080] text-xs font-bold hover:bg-purple-100 transition-colors"
                              >
                                ✉️ 이메일 보내기
                              </a>
                            )}
                            <a
                              href={`tel:${inq.guest_phone}`}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#5F0080] text-white text-xs font-bold hover:bg-purple-900 transition-colors"
                            >
                              📞 바로 전화걸기
                            </a>
                          </div>
                        </div>
                      )}

                      <div className="mb-6">
                        <div className="text-sm font-bold text-gray-800 mb-2">문의 내용</div>
                        <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm leading-relaxed whitespace-pre-wrap border border-gray-100">
                          {inq.content}
                        </div>
                      </div>

                      {inq.status === '답변완료' ? (
                        <div>
                          <div className="text-sm font-bold text-blue-600 mb-2">
                            {inq.is_guest ? '본사 상담 처리 완료 (메모)' : '본사 답변'}
                          </div>
                          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {inq.reply}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-bold text-gray-800 mb-2">
                            {inq.is_guest ? '상담 처리 메모 작성 (완료 처리)' : '답변 작성'}
                          </div>
                          <div className="flex flex-col gap-2">
                            <textarea
                              value={replyText[inq.id] || ''}
                              onChange={(e) => handleReplyChange(inq.id, e.target.value)}
                              placeholder={
                                inq.is_guest
                                  ? '비회원 고객님께 유선/문자로 안내드린 내용이나 상담 메모를 기록해 두세요...'
                                  : '사장님께 보내드릴 답변 내용을 작성해주세요...'
                              }
                              className="w-full border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-28 resize-none bg-gray-50"
                            />
                            <div className="flex justify-end mt-2">
                              <button
                                onClick={() => submitReply(inq)}
                                className="bg-black hover:bg-gray-800 text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-colors"
                              >
                                {inq.is_guest ? '상담 완료 저장하기' : '답변 등록하기'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
