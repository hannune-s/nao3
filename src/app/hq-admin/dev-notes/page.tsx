"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type NoteTag = '신규기능' | '업그레이드' | '오류수정' | '디자인' | '아이디어' | '일반메모';

type DevNote = {
  id: string;
  date: string; // YYYY-MM-DD
  tag: NoteTag;
  content: string;
  createdAt: string;
};

const TAG_META: Record<NoteTag, { emoji: string; badgeClass: string; activeClass: string }> = {
  '신규기능': {
    emoji: '✨',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    activeClass: 'bg-purple-700 text-white border-purple-700',
  },
  '업그레이드': {
    emoji: '🚀',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    activeClass: 'bg-blue-600 text-white border-blue-600',
  },
  '오류수정': {
    emoji: '🛠️',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    activeClass: 'bg-amber-600 text-white border-amber-600',
  },
  '디자인': {
    emoji: '🎨',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    activeClass: 'bg-emerald-600 text-white border-emerald-600',
  },
  '아이디어': {
    emoji: '💡',
    badgeClass: 'bg-pink-50 text-pink-700 border-pink-200',
    activeClass: 'bg-pink-600 text-white border-pink-600',
  },
  '일반메모': {
    emoji: '📌',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-200',
    activeClass: 'bg-gray-800 text-white border-gray-800',
  },
};

const SETTING_KEY = 'HQ_DEV_CHANGELOG_NOTES';
const LOCAL_STORAGE_KEY = 'nao3_hq_dev_changelog_notes';

const getTodayStr = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function HqDevNotesPage() {
  const [notes, setNotes] = useState<DevNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloadingPdfKey, setDownloadingPdfKey] = useState<string | null>(null);

  // 작성 / 수정 폼 상태
  const [dateInput, setDateInput] = useState<string>(getTodayStr());
  const [tagInput, setTagInput] = useState<NoteTag>('업그레이드');
  const [contentInput, setContentInput] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // 검색 및 필터 상태
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('전체');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('nao3_system_settings')
        .select('setting_value')
        .eq('setting_key', SETTING_KEY)
        .maybeSingle();

      if (!error && data?.setting_value) {
        const parsed = JSON.parse(data.setting_value);
        if (Array.isArray(parsed)) {
          setNotes(parsed);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
          setLoading(false);
          return;
        }
      }

      // DB에 아직 없으면 로컬 스토리지 확인
      const localSaved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed)) {
          setNotes(parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load dev notes:', err);
      const localSaved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localSaved) {
        try {
          setNotes(JSON.parse(localSaved));
        } catch {}
      }
    } finally {
      setLoading(false);
    }
  };

  const persistNotes = async (nextNotes: DevNote[]) => {
    // 날짜 내림차순 + 생성시간 내림차순 정렬
    const sorted = [...nextNotes].sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    setNotes(sorted);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sorted));

    const payload = JSON.stringify(sorted);
    const { data: existing } = await supabase
      .from('nao3_system_settings')
      .select('setting_key')
      .eq('setting_key', SETTING_KEY)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('nao3_system_settings')
        .update({ setting_value: payload })
        .eq('setting_key', SETTING_KEY);
    } else {
      await supabase
        .from('nao3_system_settings')
        .insert({ setting_key: SETTING_KEY, setting_value: payload });
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!contentInput.trim()) {
      alert('기록할 내용을 입력해주세요.');
      return;
    }
    if (!dateInput) {
      alert('날짜를 선택해주세요.');
      return;
    }

    setSaving(true);
    try {
      let nextNotes: DevNote[];
      if (editingId) {
        nextNotes = notes.map((n) =>
          n.id === editingId
            ? {
                ...n,
                date: dateInput,
                tag: tagInput,
                content: contentInput.trim(),
              }
            : n
        );
      } else {
        const newNote: DevNote = {
          id: Date.now().toString(),
          date: dateInput,
          tag: tagInput,
          content: contentInput.trim(),
          createdAt: new Date().toISOString(),
        };
        nextNotes = [newNote, ...notes];
      }

      await persistNotes(nextNotes);
      setContentInput('');
      setEditingId(null);
      if (!editingId) {
        setDateInput(getTodayStr());
      }
    } catch (err) {
      console.error('Error saving dev note:', err);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (note: DevNote) => {
    setEditingId(note.id);
    setDateInput(note.date);
    setTagInput(note.tag);
    setContentInput(note.content);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setDateInput(getTodayStr());
    setTagInput('업그레이드');
    setContentInput('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 기록을 삭제하시겠습니까?')) return;
    try {
      const nextNotes = notes.filter((n) => n.id !== id);
      await persistNotes(nextNotes);
      if (editingId === id) {
        handleCancelEdit();
      }
    } catch (err) {
      console.error('Error deleting dev note:', err);
    }
  };

  const formatDisplayDate = (yyyyMmDd: string) => {
    if (!yyyyMmDd) return '';
    const parts = yyyyMmDd.split('-');
    if (parts.length !== 3) return yyyyMmDd;
    return `${parts[0]}. ${parseInt(parts[1], 10)}. ${parseInt(parts[2], 10)}.`;
  };

  const filteredNotes = notes.filter((n) => {
    const matchTag = selectedTag === '전체' || n.tag === selectedTag;
    const matchFrom = !filterDateFrom || n.date >= filterDateFrom;
    const matchTo = !filterDateTo || n.date <= filterDateTo;
    const q = searchQuery.trim().toLowerCase();
    const matchQuery =
      !q ||
      n.content.toLowerCase().includes(q) ||
      n.date.includes(q) ||
      n.tag.toLowerCase().includes(q);
    return matchTag && matchFrom && matchTo && matchQuery;
  });

  // 날짜별 그룹화
  const groupedByDate = filteredNotes.reduce((acc, note) => {
    if (!acc[note.date]) acc[note.date] = [];
    acc[note.date].push(note);
    return acc;
  }, {} as Record<string, DevNote[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  // HTML 이스케이프 헬퍼
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  // 공통 A4 문서 본문 HTML 생성
  const buildDocumentBodyHtml = (targetNotes: DevNote[], subtitleLabel: string) => {
    const byDate = targetNotes.reduce((acc, n) => {
      if (!acc[n.date]) acc[n.date] = [];
      acc[n.date].push(n);
      return acc;
    }, {} as Record<string, DevNote[]>);
    const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));
    const nowStr = new Date().toLocaleString('ko-KR');

    const sectionsHtml = dates
      .map((d) => {
        const items = byDate[d];
        const rowsHtml = items
          .map(
            (item, idx) => `
            <tr>
              <td style="border:1px solid #d1d5db;padding:10px 12px;font-size:13px;text-align:center;font-weight:700;color:#6b7280;vertical-align:top;">${idx + 1}</td>
              <td style="border:1px solid #d1d5db;padding:10px 12px;font-size:13px;text-align:center;vertical-align:top;">
                <span style="display:inline-block;padding:2px 8px;font-size:11.5px;font-weight:800;border:1px solid #9ca3af;border-radius:4px;background:#fff;color:#111;">${escapeHtml(item.tag)}</span>
              </td>
              <td style="border:1px solid #d1d5db;padding:10px 12px;font-size:13.5px;font-weight:600;color:#111;vertical-align:top;word-break:keep-all;">${escapeHtml(item.content).replace(/\n/g, '<br/>')}</td>
            </tr>
          `
          )
          .join('');

        return `
          <div style="margin-bottom:24px;page-break-inside:avoid;">
            <div style="background:#f3f4f6;border:1px solid #d1d5db;border-bottom:none;padding:9px 14px;display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:15px;font-weight:800;color:#111;">📅 ${formatDisplayDate(d)}</span>
              <span style="font-size:12px;font-weight:700;color:#4b5563;">총 ${items.length}건</span>
            </div>
            <table style="width:100%;border-collapse:collapse;border:1px solid #d1d5db;">
              <thead>
                <tr>
                  <th style="width:52px;background:#fafafa;border:1px solid #d1d5db;padding:8px 10px;font-size:12px;font-weight:800;color:#374151;text-align:center;">번호</th>
                  <th style="width:95px;background:#fafafa;border:1px solid #d1d5db;padding:8px 10px;font-size:12px;font-weight:800;color:#374151;text-align:center;">분류</th>
                  <th style="background:#fafafa;border:1px solid #d1d5db;padding:8px 10px;font-size:12px;font-weight:800;color:#374151;text-align:center;">개발 · 업그레이드 및 수정 내용</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
        `;
      })
      .join('');

    return `
      <div style="font-family:'Pretendard','Malgun Gothic','맑은 고딕',AppleSDGothicNeo,sans-serif;color:#111;background:#fff;line-height:1.55;">
        <div style="border-bottom:2.5px solid #111;padding-bottom:14px;margin-bottom:22px;display:flex;justify-content:space-between;align-items:flex-end;">
          <div>
            <h1 style="font-size:22px;font-weight:900;margin:0 0 4px 0;letter-spacing:-0.5px;">나오삼(NAO3) 개발 · 업그레이드 기록부</h1>
            <p style="font-size:13px;color:#444;margin:0;font-weight:600;">출력 범위: ${escapeHtml(subtitleLabel)} (총 ${targetNotes.length}건 / ${dates.length}일)</p>
          </div>
          <div style="text-align:right;font-size:11.5px;color:#555;">
            <div>작성/출력일시: ${escapeHtml(nowStr)}</div>
            <div>NAO3 본사 어드민 (HQ) 보관용</div>
          </div>
        </div>
        ${sectionsHtml}
      </div>
    `;
  };

  // 인쇄 기능 (전체/필터된 내역 또는 특정 날짜 1일치)
  const handlePrintNotes = (targetNotes: DevNote[], subtitleLabel: string) => {
    if (targetNotes.length === 0) {
      alert('인쇄할 기록이 없습니다.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      alert('팝업 차단이 설정되어 있습니다. 팝업을 허용해주세요.');
      return;
    }

    const bodyContent = buildDocumentBodyHtml(targetNotes, subtitleLabel);

    const html = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <title>나오삼(NAO3) 개발·업그레이드 기록부 - ${escapeHtml(subtitleLabel)}</title>
        <style>
          @page {
            size: A4;
            margin: 16mm 14mm;
          }
          body {
            margin: 0;
            padding: 0;
            background: #fff;
          }
          .no-print-bar {
            background: #111;
            color: #fff;
            padding: 12px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            font-family: "Malgun Gothic", sans-serif;
          }
          .no-print-btn {
            background: #E5D7B7;
            color: #111;
            border: none;
            padding: 8px 18px;
            font-size: 13px;
            font-weight: 900;
            border-radius: 6px;
            cursor: pointer;
          }
          @media print {
            .no-print-bar {
              display: none !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print-bar">
          <span style="font-size: 13px; font-weight: 700;">🖨️ 인쇄 미리보기 창입니다. 바로 종이로 출력하실 수 있습니다.</span>
          <div style="display: flex; gap: 8px;">
            <button class="no-print-btn" onclick="window.print()">지금 인쇄하기</button>
            <button class="no-print-btn" style="background:#374151;color:#fff;" onclick="window.close()">창 닫기</button>
          </div>
        </div>
        ${bodyContent}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 250);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  // PDF 파일(.pdf) 직접 다운로드 기능
  const handleDownloadPdf = async (targetNotes: DevNote[], subtitleLabel: string, fileSuffix: string) => {
    if (targetNotes.length === 0) {
      alert('PDF로 저장할 기록이 없습니다.');
      return;
    }

    setDownloadingPdfKey(fileSuffix);
    try {
      // html2pdf.js 스크립트 동적 로드
      if (!(window as any).html2pdf) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('PDF 생성 라이브러리 로드 실패'));
          document.head.appendChild(script);
        });
      }

      const wrapper = document.createElement('div');
      wrapper.style.padding = '8px';
      wrapper.style.background = '#ffffff';
      wrapper.style.width = '760px';
      wrapper.innerHTML = buildDocumentBodyHtml(targetNotes, subtitleLabel);

      const opt = {
        margin: [12, 12, 12, 12],
        filename: `나오삼_개발업그레이드기록_${fileSuffix}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      await (window as any).html2pdf().set(opt).from(wrapper).save();
    } catch (err) {
      console.error('PDF generation failed:', err);
      // 혹시라도 네트워크 문제 시 인쇄(PDF로 저장) 창으로 폴백
      handlePrintNotes(targetNotes, subtitleLabel);
    } finally {
      setDownloadingPdfKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 font-medium">
        개발/업그레이드 노트를 불러오는 중입니다...
      </div>
    );
  }

  const currentRangeLabel =
    filterDateFrom || filterDateTo
      ? `${filterDateFrom || '처음'} ~ ${filterDateTo || '현재'}`
      : selectedTag !== '전체'
      ? `${selectedTag} 전체`
      : '전체 기록';

  return (
    <div className="max-w-4xl">
      {/* 상단 타이틀 헤더 + 전체 인쇄 / PDF 저장 버튼 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-1 text-[11px] font-black tracking-wider uppercase bg-[#1A1A1A] text-[#E5D7B7] rounded-md">
              NAO3 CHANGELOG
            </span>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              개발 · 업그레이드 노트
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1.5">
            나오삼(NAO3)을 만들면서 새로 추가하거나 개선한 내역을 날짜별로 기록하고 종이 인쇄 및 PDF 파일로 보관합니다.
          </p>
        </div>

        {/* 전체 인쇄 및 PDF 저장 버튼 그룹 */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handlePrintNotes(filteredNotes, currentRangeLabel)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-xs font-extrabold rounded-xl shadow-sm transition-colors"
            title="현재 조회된 기록을 A4 문서 양식으로 깔끔하게 종이 인쇄합니다"
          >
            <span>🖨️</span>
            <span>전체/조회내역 인쇄</span>
          </button>
          <button
            type="button"
            disabled={downloadingPdfKey === 'ALL'}
            onClick={() => handleDownloadPdf(filteredNotes, currentRangeLabel, getTodayStr())}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl shadow-sm transition-colors disabled:opacity-50"
            title="현재 조회된 기록을 A4 문서 양식의 PDF 파일(.pdf)로 즉시 다운로드합니다"
          >
            <span>📄</span>
            <span>{downloadingPdfKey === getTodayStr() ? 'PDF 생성 중...' : '전체/조회내역 PDF 저장'}</span>
          </button>
        </div>
      </div>

      {/* 빠른 메모 작성 / 수정 카드 */}
      <form
        onSubmit={handleSave}
        className={`bg-white rounded-2xl shadow-sm border transition-all p-6 mb-8 ${
          editingId ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
            <span>{editingId ? '✏️ 기록 내용 수정하기' : '📝 새 업그레이드 / 수정내역 메모하기'}</span>
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs font-bold text-gray-500 hover:text-gray-800 px-2.5 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              수정 취소
            </button>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          {/* 날짜 선택 */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-extrabold text-gray-600 shrink-0">날짜</label>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="px-3.5 py-2 text-sm font-bold text-gray-900 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:bg-white focus:border-[#1A1A1A]"
            />
            <button
              type="button"
              onClick={() => setDateInput(getTodayStr())}
              className="px-2.5 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors shrink-0"
            >
              오늘
            </button>
          </div>

          {/* 구분 태그 선택 */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-extrabold text-gray-600 mr-1">분류</span>
            {(Object.keys(TAG_META) as NoteTag[]).map((tag) => {
              const meta = TAG_META[tag];
              const isSelected = tagInput === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTagInput(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all flex items-center gap-1 ${
                    isSelected
                      ? meta.activeClass + ' shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span>{meta.emoji}</span>
                  <span>{tag}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 메모 내용 입력 */}
        <div className="space-y-3">
          <textarea
            value={contentInput}
            onChange={(e) => setContentInput(e.target.value)}
            rows={3}
            placeholder="오늘 새로 만들거나 업그레이드한 내용을 편하게 적어주세요. (예: 고객 전단지 화면에 실시간 초성 검색창 및 코너별 바로가기 탭 추가)"
            className="w-full px-4 py-3 text-sm font-medium text-gray-900 bg-gray-50/70 focus:bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-[#1A1A1A] focus:ring-2 focus:ring-[#1A1A1A]/10 resize-y leading-relaxed"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              💡 저장된 내역은 날짜별로 언제든 종이 인쇄 또는 PDF 파일로 내려받을 수 있습니다.
            </span>
            <button
              type="submit"
              disabled={saving}
              className={`px-6 py-2.5 rounded-xl text-sm font-black text-white shadow-sm transition-all ${
                editingId
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-[#1A1A1A] hover:bg-black'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {saving ? '저장 중...' : editingId ? '수정 완료' : '+ 기록 저장'}
            </button>
          </div>
        </div>
      </form>

      {/* 검색, 분류 필터 및 날짜 범위 선택 바 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedTag('전체')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold shrink-0 transition-colors ${
                selectedTag === '전체'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              전체 ({notes.length})
            </button>
            {(Object.keys(TAG_META) as NoteTag[]).map((tag) => {
              const count = notes.filter((n) => n.tag === tag).length;
              const meta = TAG_META[tag];
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold shrink-0 transition-colors flex items-center gap-1 ${
                    selectedTag === tag
                      ? 'bg-[#1A1A1A] text-white'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <span>{meta.emoji}</span>
                  <span>{tag}</span>
                  <span className="text-[11px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* 키워드 검색 */}
          <div className="relative w-full sm:w-64">
            <svg
              className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="기록 내용 또는 날짜 검색..."
              className="w-full pl-9 pr-8 py-2 text-xs font-medium bg-gray-50 focus:bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#1A1A1A]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 기간별 조회/인쇄 필터 */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold text-gray-600">📅 기간별 모아보기:</span>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1A1A1A]"
            />
            <span className="text-xs text-gray-400 font-bold">~</span>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1A1A1A]"
            />
            {(filterDateFrom || filterDateTo) && (
              <button
                type="button"
                onClick={() => {
                  setFilterDateFrom('');
                  setFilterDateTo('');
                }}
                className="px-2.5 py-1 text-[11px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                기간 초기화
              </button>
            )}
          </div>
          <span className="text-xs font-bold text-gray-500">
            조회된 기록 <strong className="text-gray-900">{filteredNotes.length}건</strong>
          </span>
        </div>
      </div>

      {/* 날짜별 타임라인 리스트 */}
      {sortedDates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-14 text-center shadow-sm">
          <div className="text-3xl mb-3 opacity-40">📒</div>
          <p className="text-gray-700 font-bold text-sm mb-1">
            {searchQuery || selectedTag !== '전체' || filterDateFrom || filterDateTo
              ? '해당 조건에 맞는 기록이 없습니다.'
              : '아직 작성된 개발·업그레이드 기록이 없습니다.'}
          </p>
          <p className="text-gray-400 text-xs">
            위 입력창에서 날짜와 수정 내용을 입력해 첫 번째 히스토리를 남겨보세요!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateStr) => {
            const dayNotes = groupedByDate[dateStr];
            const formattedDate = formatDisplayDate(dateStr);
            const isPdfGenerating = downloadingPdfKey === dateStr;
            return (
              <div key={dateStr} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* 날짜 헤더 바 + 해당 날짜 개별 인쇄 / PDF 저장 버튼 */}
                <div className="bg-gray-50/90 border-b border-gray-200 px-5 py-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A]"></span>
                    <span className="text-[15px] font-black text-gray-900 tracking-tight">
                      {formattedDate}
                    </span>
                    <span className="text-xs font-bold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
                      {dayNotes.length}건
                    </span>
                  </div>

                  {/* 이 날짜만 인쇄 / PDF 저장 */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handlePrintNotes(dayNotes, formattedDate)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11.5px] font-extrabold text-gray-800 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg shadow-xs transition-colors"
                      title={`${formattedDate} 기록만 종이로 인쇄합니다`}
                    >
                      <span>🖨️</span>
                      <span>이 날짜 인쇄</span>
                    </button>
                    <button
                      type="button"
                      disabled={isPdfGenerating}
                      onClick={() => handleDownloadPdf(dayNotes, formattedDate, dateStr)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11.5px] font-extrabold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg shadow-xs transition-colors disabled:opacity-50"
                      title={`${formattedDate} 기록을 PDF 문서(.pdf)로 바로 다운로드합니다`}
                    >
                      <span>📄</span>
                      <span>{isPdfGenerating ? '생성 중...' : 'PDF 저장'}</span>
                    </button>
                  </div>
                </div>

                {/* 해당 날짜의 메모 아이템들 */}
                <div className="divide-y divide-gray-100">
                  {dayNotes.map((note) => {
                    const meta = TAG_META[note.tag] || TAG_META['일반메모'];
                    return (
                      <div
                        key={note.id}
                        className="p-5 hover:bg-gray-50/50 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border shrink-0 mt-0.5 inline-flex items-center gap-1 ${meta.badgeClass}`}
                          >
                            <span>{meta.emoji}</span>
                            <span>{note.tag}</span>
                          </span>
                          <p className="text-[14px] font-semibold text-gray-800 whitespace-pre-wrap leading-relaxed break-keep">
                            {note.content}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                          <button
                            type="button"
                            onClick={() => handleEdit(note)}
                            className="px-2.5 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                          >
                            수정
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(note.id)}
                            className="px-2.5 py-1 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
