"use client";

import { useEffect, useState, Fragment } from 'react';
import { supabase } from '@/lib/supabase';

type Notice = {
  id: string;
  title: string;
  content: string;
  created_at: string;
};

export default function HqNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWriting, setIsWriting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data, error } = await supabase
        .from('nao3_hq_notices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotices(data || []);
    } catch (err: any) {
      console.error('Error fetching notices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotice = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('nao3_hq_notices')
        .insert({
          title: newTitle,
          content: newContent
        })
        .select()
        .single();

      if (error) throw error;

      alert('공지사항이 성공적으로 등록되었습니다.');
      setIsWriting(false);
      setNewTitle('');
      setNewContent('');
      
      // Update local state directly to show it immediately if db fails to reload real quick or we use mock db
      if (data) {
        setNotices([data, ...notices]);
      } else {
        fetchNotices();
      }
    } catch (err: any) {
      console.error('Error saving notice:', err);
      // Mock update to UI since DB schema might not exist yet
      alert('DB 테이블(nao3_hq_notices)이 없어 모의로 추가합니다.');
      const mockNotice: Notice = {
        id: Math.random().toString(),
        title: newTitle,
        content: newContent,
        created_at: new Date().toISOString()
      };
      setNotices([mockNotice, ...notices]);
      setIsWriting(false);
      setNewTitle('');
      setNewContent('');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 공지사항을 삭제하시겠습니까?')) return;
    try {
      const { error } = await supabase.from('nao3_hq_notices').delete().eq('id', id);
      if (error) throw error;
      setNotices(notices.filter(n => n.id !== id));
    } catch (err: any) {
      console.error(err);
      // Fallback local update
      setNotices(notices.filter(n => n.id !== id));
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">공지사항 불러오는 중...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">본사 공지사항 관리</h2>
          <p className="text-sm text-gray-500 mt-1">가맹점 사장님들의 마이메뉴에 노출되는 전체 공지를 작성합니다.</p>
        </div>
        {!isWriting && (
          <button 
            onClick={() => setIsWriting(true)}
            className="bg-[#1A1A1A] hover:bg-black text-white px-5 py-2.5 rounded-lg font-bold transition-colors"
          >
            새 공지 작성
          </button>
        )}
      </div>

      {isWriting && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 animate-fade-in-up">
          <h3 className="text-lg font-bold text-gray-900 mb-4">새 공지사항 작성</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">제목</label>
              <input 
                type="text" 
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="공지사항 제목을 입력하세요" 
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">내용</label>
              <textarea 
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="공지사항 내용을 상세히 작성하세요..." 
                rows={6}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#1A1A1A] resize-y"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setIsWriting(false)}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50"
              >
                취소
              </button>
              <button 
                onClick={handleSaveNotice}
                disabled={saving}
                className={`px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {saving ? '등록 중...' : '등록하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {notices.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 w-16 text-center">번호</th>
                <th className="px-6 py-4">제목</th>
                <th className="px-6 py-4 w-32 text-center">작성일</th>
                <th className="px-6 py-4 w-24 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {notices.map((notice, idx) => (
                <Fragment key={notice.id}>
                  <tr 
                    className="hover:bg-gray-50 transition-colors cursor-pointer group" 
                    onClick={() => setExpandedNoticeId(expandedNoticeId === notice.id ? null : notice.id)}
                  >
                    <td className="px-6 py-4 text-center text-gray-500 font-medium">{notices.length - idx}</td>
                    <td className="px-6 py-4 font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{notice.title}</td>
                    <td className="px-6 py-4 text-center text-gray-500">{new Date(notice.created_at).toLocaleDateString('ko-KR')}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(notice.id); }} 
                        className="text-red-500 hover:text-red-700 text-xs font-bold px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                  {expandedNoticeId === notice.id && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 bg-gray-50 border-t border-gray-100">
                        <div className="max-w-4xl whitespace-pre-wrap text-[14px] text-gray-700 leading-relaxed mx-auto">
                          {notice.content}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
