import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NAO3 Sale Push Admin",
  description: "마켓컬리 스타일 세일 푸시 어드민",
  manifest: "/manifest.json",
  icons: {
    icon: '/icon.jpg',
    apple: '/icon.jpg',
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
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful');
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-[#F9F9F9] font-sans pb-24">
        {children}
      </body>
    </html>
  );
}
