import type { Metadata } from "next";
import "./globals.css";
import VisitorTracker from "@/components/VisitorTracker";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.nao3.kr'),
  title: '나오삼(NAO3) - "어머님들~ 지금 당장 나오삼!" 매출 폭발 1초 전단지',
  description: "빨리 나오삼! 얼른 나오삼! 집에 계신 동네 손님들을 당장 우리 가게로 뛰어나오게 만드는 1초 스마트 전단지 (문자비 평생 0원)",
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  openGraph: {
    title: '나오삼(NAO3) - "어머님들~ 지금 당장 나오삼!" 매출 폭발 1초 전단지',
    description: "빨리 나오삼! 얼른 나오삼! 집에 계신 동네 손님들을 당장 우리 가게로 뛰어나오게 만드는 1초 스마트 전단지 (문자비 평생 0원)",
    url: 'https://www.nao3.kr',
    siteName: '나오삼(NAO3)',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/api/og?v=2',
        width: 1200,
        height: 630,
        alt: '나오삼(NAO3) - 어머님들 지금 당장 나오삼! 매출 폭발 1초 전단지',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '나오삼(NAO3) - "어머님들~ 지금 당장 나오삼!" 매출 폭발 1초 전단지',
    description: "빨리 나오삼! 얼른 나오삼! 집에 계신 동네 손님들을 당장 우리 가게로 뛰어나오게 만드는 1초 스마트 전단지 (문자비 평생 0원)",
    images: ['/api/og?v=2'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var path = window.location.pathname || '';
                  var m = path.match(/^\\/store\\/([^\\/]+)(\\/sale)?/);
                  var manifestHref = '/manifest.json';
                  if (m) {
                    var slug = encodeURIComponent(m[1]);
                    var mode = m[2] ? 'sale' : 'admin';
                    manifestHref = '/api/manifest?mode=' + mode + '&slug=' + slug + '&v=3';
                  }
                  var link = document.head.querySelector('link[rel="manifest"]');
                  if (!link) {
                    link = document.createElement('link');
                    link.rel = 'manifest';
                    document.head.appendChild(link);
                  }
                  link.href = manifestHref;
                } catch (err) {}
              })();
              window.__nao3DeferredPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__nao3DeferredPrompt = e;
                window.dispatchEvent(new Event('nao3-install-ready'));
              });
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(function(registration) {
                  registration.update();
                }).catch(function(err) {
                  console.log('ServiceWorker registration failed: ', err);
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-[#F9F9F9] font-sans pb-24">
        <VisitorTracker />
        {children}
      </body>
    </html>
  );
}
