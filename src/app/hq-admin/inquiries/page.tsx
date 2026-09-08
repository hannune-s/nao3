"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function HqInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('nao3_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setInquiries(data);
    } catch (err) {
      console.warn('DB fetching failed. Check if nao3_inquiries table exists.', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReplyChange = (id: string, text: string) => {
    setReplyText((prev) => ({ ...prev, [id]: text }));
  };

  const submitReply = async (id: string) => {
    const reply = replyText[id];
    if (!reply || !reply.trim()) return alert('답변 내용을 입력해주세요.');

    try {
      const { error } = await supabase
        .from('nao3_inquiries')
        .update({
          reply: reply.trim(),
          status: '답변완료'
        })
        .eq('id', id);

      if (error) throw error;
      
      alert('답변이 등록되었습니다.');
      fetchInquiries();
    } catch (err) {
      console.error(err);
      alert('답변 등록 실패. DB를 확인하세요.');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) return <div className="p-8 text-gray-500">문의 내역을 불러오는 중...</div>;

  return (
    <div className="max-w-5xl animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">1:1 문의 관리</h2>
        <p className="text-gray-500 mt-2 text-sm">가맹점 사장님들이 남긴 문의사항을 확인하고 답변할 수 있습니다.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {inquiries.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            접수된 문의 내역이 없습니다.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {inquiries.map((inq) => {
              const isExpanded = expandedId === inq.id;
              
              return (
                <li key={inq.id} className="flex flex-col">
                  {/* 게시판 제목 영역 (클릭 시 펼침) */}
                  <button 
                    onClick={() => toggleExpand(inq.id)}
                    className={`flex items-center justify-between p-5 transition-colors text-left ${isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md whitespace-nowrap ${inq.status === '답변완료' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                        {inq.status || '답변대기'}
                      </span>
                      <span className="font-bold text-gray-900 shrink-0">{inq.store_name}</span>
                      <span className="text-sm text-gray-600 truncate">{inq.content}</span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 text-gray-400">
                      <span className="text-xs">{new Date(inq.created_at).toLocaleDateString()}</span>
                      <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </button>

                  {/* 상세 내용 영역 */}
                  {isExpanded && (
                    <div className="p-6 bg-white border-t border-gray-50">
                      <div className="mb-6">
                        <div className="text-sm font-bold text-gray-800 mb-2">문의 내용</div>
                        <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm leading-relaxed whitespace-pre-wrap border border-gray-100">
                          {inq.content}
                        </div>
                      </div>

                      {inq.status === '답변완료' ? (
                        <div>
                          <div className="text-sm font-bold text-blue-600 mb-2">본사 답변</div>
                          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                            {inq.reply}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="text-sm font-bold text-gray-800 mb-2">답변 작성</div>
                          <div className="flex flex-col gap-2">
                            <textarea 
                              value={replyText[inq.id] || ''}
                              onChange={(e) => handleReplyChange(inq.id, e.target.value)}
                              placeholder="사장님께 보내드릴 답변 내용을 작성해주세요..."
                              className="w-full border border-gray-200 rounded-xl p-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-28 resize-none bg-gray-50"
                            />
                            <div className="flex justify-end mt-2">
                              <button 
                                onClick={() => submitReply(inq.id)}
                                className="bg-black hover:bg-gray-800 text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-colors"
                              >
                                답변 등록하기
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
