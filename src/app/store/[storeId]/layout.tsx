import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '사장님 NAO3 어드민',
  description: '사장님 전용 스마트 전단지 관리 어드민',
  appleWebApp: {
    capable: true,
    title: '사장님 NAO3',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/icon-admin-192.png',
    apple: '/icon-admin-192.png',
  },
};

export default function StoreAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
