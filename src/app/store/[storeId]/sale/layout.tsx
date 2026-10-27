import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '오늘의 특가 전단지',
  description: '실시간 깜짝 세일과 오늘의 특가 소식을 확인하세요.',
  appleWebApp: {
    capable: true,
    title: '특가 전단지',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
};

export default function CustomerSaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}