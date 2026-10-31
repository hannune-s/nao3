import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

async function loadKoreanFont(): Promise<ArrayBuffer | null> {
  try {
    const cssRes = await fetch(
      'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700;900&display=swap',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
        },
      }
    );
    const css = await cssRes.text();
    const matches = [...css.matchAll(/src:\s*url\(([^)]+)\)\s*format\(['"]?(?:opentype|truetype|woff)['"]?\)/g)];
    const fontUrl = matches.length > 0 ? matches[matches.length - 1][1] : null;
    if (!fontUrl) return null;
    const fontRes = await fetch(fontUrl);
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const storeName = searchParams.get('store')?.trim() || '';
  const fontData = await loadKoreanFont();

  const fonts = fontData
    ? [
        {
          name: 'NotoSansKR',
          data: fontData,
          style: 'normal' as const,
          weight: 900 as const,
        },
      ]
    : undefined;

  if (storeName) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '50px 64px',
            background: 'linear-gradient(135deg, #1E002E 0%, #4A0066 55%, #5F0080 100%)',
            color: '#ffffff',
            fontFamily: fontData ? 'NotoSansKR' : 'sans-serif',
            position: 'relative',
          }}
        >
          {/* 상단 재치 있는 말풍선 바 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 28px',
                borderRadius: '999px',
                background: '#FACC15',
                color: '#1A1A1A',
                fontSize: '26px',
                fontWeight: 900,
              }}
            >
              &ldquo;어머님들~~~ 빨리 나오삼! 얼른 나오삼!&rdquo;
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px 24px',
                borderRadius: '999px',
                background: 'rgba(255, 255, 255, 0.14)',
                border: '2px solid rgba(229, 215, 183, 0.45)',
                color: '#E5D7B7',
                fontSize: '22px',
                fontWeight: 900,
              }}
            >
              1초 초성 검색 전단지
            </div>
          </div>

          {/* 중앙 매장 상호명 & 타이틀 */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              marginTop: '8px',
            }}
          >
            <div
              style={{
                fontSize: '34px',
                fontWeight: 700,
                color: '#FDE047',
                marginBottom: '10px',
                display: 'flex',
              }}
            >
              지금 당장 나오삼! 오늘의 실시간 깜짝 세일
            </div>
            <div
              style={{
                fontSize: '80px',
                fontWeight: 900,
                color: '#FFFFFF',
                lineHeight: 1.15,
                letterSpacing: '-1.5px',
                display: 'flex',
              }}
            >
              {storeName}
            </div>
            <div
              style={{
                fontSize: '42px',
                fontWeight: 900,
                color: '#E5D7B7',
                marginTop: '12px',
                display: 'flex',
              }}
            >
              망설이면 품절! 오늘의 특가 전단지가 도착했습니다
            </div>
          </div>

          {/* 하단 포인트 배지 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              paddingTop: '24px',
              borderTop: '2px solid rgba(255, 255, 255, 0.16)',
            }}
          >
            <div style={{ display: 'flex', gap: '14px' }}>
              <div
                style={{
                  padding: '12px 22px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.14)',
                  color: '#FFFFFF',
                  fontSize: '23px',
                  fontWeight: 700,
                  display: 'flex',
                }}
              >
                정육 · 청과 · 야채·수산 · 공산품
              </div>
              <div
                style={{
                  padding: '12px 22px',
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.14)',
                  color: '#FDE047',
                  fontSize: '23px',
                  fontWeight: 700,
                  display: 'flex',
                }}
              >
                사고 싶은 세일 상품 1초 검색
              </div>
            </div>
            <div
              style={{
                fontSize: '26px',
                fontWeight: 900,
                color: '#E5D7B7',
                display: 'flex',
              }}
            >
              www.nao3.kr
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts,
      }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 64px',
          background: 'linear-gradient(135deg, #160024 0%, #3E0056 50%, #5F0080 100%)',
          color: '#ffffff',
          fontFamily: fontData ? 'NotoSansKR' : 'sans-serif',
          position: 'relative',
        }}
      >
        {/* 상단 위트 말풍선 배지 바 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 28px',
              borderRadius: '999px',
              background: '#FACC15',
              color: '#1A1A1A',
              fontSize: '25px',
              fontWeight: 900,
            }}
          >
            &ldquo;어머님들~~~ 빨리 나오삼! 얼른 나오삼! 지금 당장 나오삼!&rdquo;
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 24px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.14)',
              border: '2px solid rgba(229, 215, 183, 0.5)',
              color: '#E5D7B7',
              fontSize: '22px',
              fontWeight: 900,
            }}
          >
            문자비 평생 0원
          </div>
        </div>

        {/* 메인 카피 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            marginTop: '6px',
          }}
        >
          <div
            style={{
              fontSize: '31px',
              fontWeight: 700,
              color: '#FDE047',
              marginBottom: '12px',
              display: 'flex',
            }}
          >
            집에 계신 동네 손님들을 당장 가게로 뛰어나오게 만드는 마법!
          </div>
          <div
            style={{
              fontSize: '68px',
              fontWeight: 900,
              color: '#FFFFFF',
              lineHeight: 1.18,
              letterSpacing: '-1.5px',
              display: 'flex',
            }}
          >
            매출이 폭발하는 1초 전단지,
          </div>
          <div
            style={{
              fontSize: '76px',
              fontWeight: 900,
              color: '#E5D7B7',
              lineHeight: 1.18,
              letterSpacing: '-1.5px',
              display: 'flex',
            }}
          >
            그래서 이름이 &lsquo;나오삼(NAO3)&rsquo;입니다!
          </div>
        </div>

        {/* 하단 핵심 기능 3가지 캡슐 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingTop: '24px',
            borderTop: '2px solid rgba(255, 255, 255, 0.16)',
          }}
        >
          <div style={{ display: 'flex', gap: '14px' }}>
            <div
              style={{
                padding: '12px 22px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.14)',
                color: '#FFFFFF',
                fontSize: '22px',
                fontWeight: 700,
                display: 'flex',
              }}
            >
              최초 1초 초성 검색 전단지
            </div>
            <div
              style={{
                padding: '12px 22px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.14)',
                color: '#FFFFFF',
                fontSize: '22px',
                fontWeight: 700,
                display: 'flex',
              }}
            >
              코너별 원터치 탭
            </div>
            <div
              style={{
                padding: '12px 22px',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.14)',
                color: '#FDE047',
                fontSize: '22px',
                fontWeight: 700,
                display: 'flex',
              }}
            >
              실시간 세일 푸시 & 품절 알림
            </div>
          </div>
          <div
            style={{
              fontSize: '26px',
              fontWeight: 900,
              color: '#E5D7B7',
              display: 'flex',
            }}
          >
            www.nao3.kr
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts,
    }
  );
}
