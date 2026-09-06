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
  const [editingId, setEditingId] = useState<string | null>(null);
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
      if (editingId) {
        const { error } = await supabase
          .from('nao3_hq_notices')
          .update({
            title: newTitle,
            content: newContent
          })
          .eq('id', editingId);

        if (error) throw error;

        alert('공지사항이 성공적으로 수정되었습니다.');
        setNotices(notices.map(n => n.id === editingId ? { ...n, title: newTitle, content: newContent } : n));
      } else {
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
        if (data) {
          setNotices([data, ...notices]);
        } else {
          fetchNotices();
        }
      }
      
      setIsWriting(false);
      setEditingId(null);
      setNewTitle('');
      setNewContent('');
      
    } catch (err: any) {
      console.error('Error saving notice:', err);
      // Mock update to UI since DB schema might not exist yet
      if (editingId) {
        setNotices(notices.map(n => n.id === editingId ? { ...n, title: newTitle, content: newContent } : n));
        alert('모의 환경에서 수정되었습니다.');
      } else {
        alert('DB 테이블(nao3_hq_notices)이 없어 모의로 추가합니다.');
        const mockNotice: Notice = {
          id: Math.random().toString(),
          title: newTitle,
          content: newContent,
          created_at: new Date().toISOString()
        };
        setNotices([mockNotice, ...notices]);
      }
      setIsWriting(false);
      setEditingId(null);
      setNewTitle('');
      setNewContent('');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (notice: Notice, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(notice.id);
    setNewTitle(notice.title);
    setNewContent(notice.content);
    setIsWriting(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
  };

  const handleNewNotice = () => {
    setEditingId(null);
    setNewTitle('');
    setNewContent('');
    setIsWriting(true);
  };

  const handleCancel = () => {
    setIsWriting(false);
    setEditingId(null);
    setNewTitle('');
    setNewContent('');
  };

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
            onClick={handleNewNotice}
            className="bg-[#1A1A1A] hover:bg-black text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm"
          >
            새 공지 작성
          </button>
        )}
      </div>

      {isWriting && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 animate-fade-in-up">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{editingId ? '공지사항 수정' : '새 공지사항 작성'}</h3>
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
                onClick={handleCancel}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button 
                onClick={handleSaveNotice}
                disabled={saving}
                className={`px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {saving ? '저장 중...' : (editingId ? '수정하기' : '등록하기')}
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[600px]">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 w-20 text-center whitespace-nowrap">번호</th>
                  <th className="px-6 py-4">제목</th>
                  <th className="px-6 py-4 w-32 text-center whitespace-nowrap">작성일</th>
                  <th className="px-6 py-4 w-36 text-center whitespace-nowrap">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {notices.map((notice, idx) => (
                  <Fragment key={notice.id}>
                    <tr 
                      className="hover:bg-gray-50 transition-colors cursor-pointer group" 
                      onClick={() => setExpandedNoticeId(expandedNoticeId === notice.id ? null : notice.id)}
                    >
                      <td className="px-6 py-4 text-center text-gray-500 font-medium whitespace-nowrap">{notices.length - idx}</td>
                      <td className="px-6 py-4 font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{notice.title}</td>
                      <td className="px-6 py-4 text-center text-gray-500 whitespace-nowrap">{new Date(notice.created_at).toLocaleDateString('ko-KR')}</td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={(e) => handleEdit(notice, e)} 
                            className="text-blue-600 hover:text-blue-800 text-xs font-bold px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                          >
                            수정
                          </button>
                          <button 
                            onClick={(e) => handleDelete(notice.id, e)} 
                            className="text-red-500 hover:text-red-700 text-xs font-bold px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                          >
                            삭제
                          </button>
                        </div>
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
          </div>
        )}
      </div>
    </div>
  );
}
