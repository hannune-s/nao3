"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function HqSettingsPage() {
  const [pgProvider, setPgProvider] = useState('tosspayments');
  const [pgMid, setPgMid] = useState('');
  const [pgClientKey, setPgClientKey] = useState('');
  const [pgSecretKey, setPgSecretKey] = useState('');
  const [isTestMode, setIsTestMode] = useState(true);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Supabase nao3_system_settings 테이블에서 조회 시도
      const { data, error } = await supabase
        .from('nao3_system_settings')
        .select('*');
        
      if (error) {
        // 테이블이 없거나 에러 시 로컬 스토리지로 폴백
        throw error;
      }

      if (data) {
        const midRow = data.find((row: any) => row.setting_key === 'pg_mid');
        const clientKeyRow = data.find((row: any) => row.setting_key === 'pg_client_key');
        const secretKeyRow = data.find((row: any) => row.setting_key === 'pg_secret_key');
        const testModeRow = data.find((row: any) => row.setting_key === 'pg_is_test_mode');
        
        if (midRow) setPgMid(midRow.setting_value);
        if (clientKeyRow) setPgClientKey(clientKeyRow.setting_value);
        if (secretKeyRow) setPgSecretKey(secretKeyRow.setting_value);
        if (testModeRow) setIsTestMode(testModeRow.setting_value === 'true');
      }
    } catch (err) {
      console.warn('DB fetching failed, using localStorage fallback');
      setPgMid(localStorage.getItem('nao3_hq_pg_mid') || '');
      setPgClientKey(localStorage.getItem('nao3_hq_pg_client_key') || '');
      setPgSecretKey(localStorage.getItem('nao3_hq_pg_secret_key') || '');
      setIsTestMode(localStorage.getItem('nao3_hq_pg_test_mode') !== 'false');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 로컬 스토리지에도 무조건 저장 (폴백용)
      localStorage.setItem('nao3_hq_pg_mid', pgMid);
      localStorage.setItem('nao3_hq_pg_client_key', pgClientKey);
      localStorage.setItem('nao3_hq_pg_secret_key', pgSecretKey);
      localStorage.setItem('nao3_hq_pg_test_mode', isTestMode ? 'true' : 'false');

      // DB 저장 시도 (upsert 사용)
      const settingsToSave = [
        { setting_key: 'pg_mid', setting_value: pgMid },
        { setting_key: 'pg_client_key', setting_value: pgClientKey },
        { setting_key: 'pg_secret_key', setting_value: pgSecretKey },
        { setting_key: 'pg_is_test_mode', setting_value: isTestMode ? 'true' : 'false' }
      ];

      const { error } = await supabase
        .from('nao3_system_settings')
        .upsert(settingsToSave, { onConflict: 'setting_key' });

      if (error) throw error;
      alert('설정이 저장되었습니다.');
    } catch (err: any) {
      console.warn('DB upsert failed, saved to localStorage', err);
      alert('설정이 로컬 환경에 저장되었습니다. (DB 연동 시 Supabase에 nao3_system_settings 테이블이 필요합니다.)');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">설정을 불러오는 중...</div>;
  }

  return (
    <div className="max-w-3xl animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">시스템 설정 (PG 연동)</h2>
        <p className="text-gray-500 mt-2 text-sm">가맹점들이 결제(구독 등)를 진행할 때 사용할 전자결제대행사(PG) 정보를 설정합니다.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">결제 연동 설정</h3>
          <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">Toss Payments</span>
        </div>
        
        <form onSubmit={handleSave} className="p-6 space-y-6">
          
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="test_mode"
                checked={isTestMode} 
                onChange={() => setIsTestMode(true)}
                className="w-4 h-4 text-[#5F0080]" 
              />
              <span className="text-sm font-bold text-gray-700">테스트 모드 (Test)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="test_mode"
                checked={!isTestMode} 
                onChange={() => setIsTestMode(false)}
                className="w-4 h-4 text-[#5F0080]" 
              />
              <span className="text-sm font-bold text-gray-700">실 결제 모드 (Live)</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">PG사 선택</label>
            <select 
              value={pgProvider}
              onChange={(e) => setPgProvider(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#5F0080] focus:ring-1 focus:ring-[#5F0080]"
            >
              <option value="tosspayments">토스페이먼츠 (Toss Payments)</option>
              <option value="nicepay" disabled>나이스페이먼츠 (준비중)</option>
              <option value="kcp" disabled>NHN KCP (준비중)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">가맹점 ID (MID)</label>
            <input 
              type="text" 
              value={pgMid}
              onChange={(e) => setPgMid(e.target.value)}
              placeholder="예: tosspayments"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#5F0080] focus:ring-1 focus:ring-[#5F0080]"
            />
            <p className="text-xs text-gray-400 mt-1">PG사에서 발급받은 가맹점 식별 코드입니다.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">클라이언트 키 (Client Key)</label>
            <input 
              type="text" 
              value={pgClientKey}
              onChange={(e) => setPgClientKey(e.target.value)}
              placeholder="예: test_ck_..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#5F0080] focus:ring-1 focus:ring-[#5F0080] font-mono text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">프론트엔드 결제창 호출 시 사용하는 키입니다.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">시크릿 키 (Secret Key)</label>
            <input 
              type="password" 
              value={pgSecretKey}
              onChange={(e) => setPgSecretKey(e.target.value)}
              placeholder="예: test_sk_..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-[#5F0080] focus:ring-1 focus:ring-[#5F0080] font-mono text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">백엔드 결제 승인 시 사용하는 비밀키입니다. 절대 외부에 노출하지 마세요.</p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button 
              type="submit" 
              disabled={saving}
              className="px-8 py-3 bg-[#1A1A1A] hover:bg-black text-white font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {saving ? '저장 중...' : '변경사항 저장'}
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-6 bg-blue-50 text-blue-800 p-4 rounded-xl text-sm leading-relaxed border border-blue-100">
        <strong>💡 테스트 환경 안내</strong><br/>
        현재 토스페이먼츠 기본 테스트 MID인 <code>tosspayments</code>와 테스트 키를 입력하시면 실제 돈이 빠져나가지 않는 결제 테스트가 가능합니다.<br/>
        실 결제를 위해 Live 모드로 전환할 경우 반드시 실제 발급받은 MID와 키로 교체해야 합니다.
      </div>
    </div>
  );
}
