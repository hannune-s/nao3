'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

interface DemoButtonProps {
  className?: string;
  children: React.ReactNode;
}

export default function DemoButton({ className, children }: DemoButtonProps) {
  const router = useRouter();
  
  const handleDemo = () => {
    // Generate a random 6 char alphanumeric string
    const randomStr = Math.random().toString(36).substring(2, 8);
    const demoId = `demo-guest-${randomStr}`;
    
    // Clear any previous demo data if needed, or just let them start fresh
    localStorage.removeItem(`nao3_draft_storeName_${demoId}`);
    
    router.push(`/store/${demoId}`);
  };

  return (
    <button onClick={handleDemo} className={className}>
      {children}
    </button>
  );
}
