"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function ButcherAdmin({ storeId, storeName }: { storeId: string, storeName: string }) {
  return (
    <div className="min-h-screen bg-red-50 p-4">
      <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-sm border border-red-100">
        <h1 className="text-2xl font-bold text-red-700 mb-2">🥩 {storeName} (정육점 어드민)</h1>
        <p className="text-gray-600 mb-4">정육점 전용 상품 등록 폼이 이곳에 구현될 예정입니다.</p>
        
        <button 
          onClick={() => supabase.auth.signOut().then(() => window.location.reload())}
          className="text-sm text-gray-500 underline"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
