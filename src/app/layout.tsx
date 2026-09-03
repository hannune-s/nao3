import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "나오3 (Nao3) Sale Push Admin",
  description: "마켓컬리 스타일 세일 푸시 어드민",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen bg-[#F9F9F9] font-sans pb-24">
        {children}
      </body>
    </html>
  );
}
