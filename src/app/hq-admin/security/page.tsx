"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// PIN 번호를 SHA-256으로 해싱하는 함수
async function hashPin(pin: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function SecuritySettingsPage() {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [hasExistingPin, setHasExistingPin] = useState(false);
  const [storedPinHash, setStoredPinHash] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    checkExistingPin();
  }, []);

  const checkExistingPin = async () => {
    try {
      const { data, error } = await supabase
        .from('nao3_system_settings')
        .select('setting_value')
        .eq('setting_key', 'hq_admin_pin')
        .single();
        
      if (data && data.setting_value) {
        setHasExistingPin(true);
        setStoredPinHash(data.setting_value);
      }
    } catch (err) {
      console.warn('저장된 PIN 번호 확인 실패 (처음 설정하는 상태로 간주)');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasExistingPin) {
      const currentHash = await hashPin(currentPin);
      if (currentHash !== storedPinHash) {
        alert('현재 PIN 번호가 일치하지 않습니다.');
        return;
      }
    }

    if (newPin.length !== 6) {
      alert('새 PIN 번호는 6자리 숫자여야 합니다.');
      return;
    }

    if (newPin !== confirmPin) {
      alert('새 PIN 번호와 확인 번호가 일치하지 않습니다.');
      return;
    }

    setIsSaving(true);
    try {
      const newHash = await hashPin(newPin);
      
      const { error } = await supabase
        .from('nao3_system_settings')
        .upsert([{ setting_key: 'hq_admin_pin', setting_value: newHash }], { onConflict: 'setting_key' });

      if (error) throw error;

      alert('보안 PIN 번호가 안전하게 데이터베이스에 설정되었습니다.\n다음 접속 시부터 PIN 번호를 요구합니다.');
      
      // 폼 초기화 및 상태 업데이트
      setStoredPinHash(newHash);
      setHasExistingPin(true);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (err) {
      console.error(err);
      alert('PIN 설정 중 오류가 발생했습니다. DB 권한 또는 테이블(nao3_system_settings)을 확인하세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!hasExistingPin) return;

    const check = prompt('보안을 해제하시려면 현재 PIN 번호를 입력해주세요.');
    if (check !== null) {
      const checkHash = await hashPin(check);
      if (checkHash === storedPinHash) {
        try {
          const { error } = await supabase
            .from('nao3_system_settings')
            .delete()
            .eq('setting_key', 'hq_admin_pin');
            
          if (error) throw error;

          alert('보안 PIN 번호가 해제되었습니다. 누구나 접속할 수 있습니다.');
          setHasExistingPin(false);
          setStoredPinHash(null);
          setCurrentPin('');
          setNewPin('');
          setConfirmPin('');
        } catch (err) {
          alert('해제 중 오류가 발생했습니다.');
        }
      } else {
        alert('PIN 번호가 일치하지 않습니다.');
      }
    }
  };

  return (
    <div className="max-w-2xl animate-fade-in-up font-sans">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight">보안 설정 (PIN)</h2>
        <p className="text-gray-500 mt-2 text-sm">본사 어드민 페이지 접속 시 사용할 6자리 보안 PIN 번호를 설정합니다.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">어드민 접속 보안</h3>
          {hasExistingPin ? (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              보안 활성화됨
            </span>
          ) : (
            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              보안 미설정 (위험)
            </span>
          )}
        </div>
        
        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6">
          {hasExistingPin && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">현재 PIN 번호</label>
              <input 
                type="password" 
                maxLength={6}
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="현재 6자리 PIN 입력"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 tracking-widest font-mono"
              />
            </div>
          )}

          <div className="pt-2 border-t border-gray-50">
            <label className="block text-sm font-bold text-gray-700 mb-2">새 PIN 번호 (6자리 숫자)</label>
            <input 
              type="password" 
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 tracking-widest font-mono text-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">새 PIN 번호 확인</label>
            <input 
              type="password" 
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="••••••"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 tracking-widest font-mono text-xl"
            />
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
            {hasExistingPin ? (
              <button 
                type="button"
                onClick={handleRemove}
                className="text-sm font-bold text-red-500 hover:text-red-700 px-2 py-2"
              >
                보안 끄기 (삭제)
              </button>
            ) : (
              <div></div>
            )}
            
            <button 
              type="submit" 
              className="px-8 py-3.5 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-colors shadow-md"
            >
              {hasExistingPin ? 'PIN 번호 변경하기' : '보안 PIN 설정하기'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 bg-purple-50 text-purple-800 p-5 rounded-2xl text-sm leading-relaxed border border-purple-100">
        <strong>💡 본사 어드민 보안 안내</strong><br/>
        현재 PIN 번호는 관리자가 사용 중인 이 기기(브라우저)에 안전하게 저장됩니다.<br/>
        최초 설정 후에는 HQ 어드민 접속 시마다 이 PIN 번호를 입력해야만 전체 가맹점 정보 및 설정 메뉴에 접근할 수 있습니다.
      </div>
    </div>
  );
}
