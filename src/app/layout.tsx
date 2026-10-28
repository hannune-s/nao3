import type { Metadata } from "next";
import "./globals.css";
import VisitorTracker from "@/components/VisitorTracker";

export const metadata: Metadata = {
  title: "NAO3 Sale Push Admin",
  description: "마켓컬리 스타일 세일 푸시 어드민",
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
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
