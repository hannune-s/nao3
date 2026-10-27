"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const getIconForProduct = (name: string) => {
  if (!name) return '✨';
  const n = name.replace(/\s/g, '');
  
  // 과일류
  if (n.includes('사과')) return '🍎';
  if (n.includes('귤') || n.includes('오렌지') || n.includes('한라봉') || n.includes('레몬')) return '🍊';
  if (n.includes('바나나')) return '🍌';
  if (n.includes('포도') || n.includes('샤인머스캣')) return '🍇';
  if (n.includes('수박')) return '🍉';
  if (n.includes('딸기')) return '🍓';
  if (n.includes('복숭아')) return '🍑';
  if (n.includes('참외') || n.includes('메론') || n.includes('멜론')) return '🍈';
  if (n.includes('배')) return '🍐';
  if (n.includes('토마토')) return '🍅';
  if (n.includes('블루베리')) return '🫐';
  if (n.includes('키위')) return '🥝';
  if (n.includes('망고')) return '🥭';
  if (n.includes('체리')) return '🍒';
  
  // 채소류
  if (n.includes('마늘')) return '🧄';
  if (n.includes('양파')) return '🧅';
  if (n.includes('파') || n.includes('부추')) return '🌱';
  if (n.includes('고추')) return '🌶️';
  if (n.includes('감자')) return '🥔';
  if (n.includes('고구마')) return '🍠';
  if (n.includes('호박')) return '🎃';
  if (n.includes('당근')) return '🥕';
  if (n.includes('버섯')) return '🍄';
  if (n.includes('옥수수')) return '🌽';
  if (n.includes('브로콜리')) return '🥦';
  if (n.includes('배추') || n.includes('상추') || n.includes('깻잎') || n.includes('시금치') || n.includes('나물') || n.includes('아욱') || n.includes('봄동')) return '🥬';
  if (n.includes('오이')) return '🥒';
  
  // 수산물
  if (n.includes('오징어') || n.includes('주꾸미') || n.includes('쭈꾸미') || n.includes('문어') || n.includes('낙지')) return '🦑';
  if (n.includes('갈치') || n.includes('고등어') || n.includes('동태') || n.includes('생태') || n.includes('명태') || n.includes('꽁치') || n.includes('연어') || n.includes('생선') || n.includes('멸치') || n.includes('수산')) return '🐟';
  if (n.includes('전복') || n.includes('바지락') || n.includes('조개') || n.includes('굴') || n.includes('홍합') || n.includes('가리비') || n.includes('꼬막')) return '🦪';
  if (n.includes('새우') || n.includes('대하')) return '🦐';
  if (n.includes('게') || n.includes('크랩')) return '🦀';
  if (n.includes('미역') || n.includes('다시마')) return '🌿';
  
  // 정육
  if (n.includes('소') || n.includes('한우') || n.includes('등심') || n.includes('안심') || n.includes('국거리') || n.includes('불고기') || n.includes('스테이크')) return '🥩';
  if (n.includes('돼지') || n.includes('삼겹') || n.includes('목살') || n.includes('갈비') || n.includes('앞다리') || n.includes('항정') || n.includes('한돈')) return '🥓';
  if (n.includes('닭') || n.includes('치킨')) return '🍗';
  if (n.includes('계란') || n.includes('달걀') || n.includes('메추리알')) return '🥚';
  
  // 공산품/기타
  if (n.includes('우유')) return '🥛';
  if (n.includes('라면') || n.includes('면')) return '🍜';
  if (n.includes('참치') || n.includes('스팸') || n.includes('통조림') || n.includes('골뱅이') || n.includes('만두')) return '🥫';
  if (n.includes('커피') || n.includes('맥심') || n.includes('카누')) return '☕';
  if (n.includes('과자') || n.includes('고래밥')) return '🍪';
  if (n.includes('콜라') || n.includes('사이다') || n.includes('음료')) return '🥤';
  if (n.includes('휴지') || n.includes('롤') || n.includes('티슈') || n.includes('깨끗한나라')) return '🧻';
  if (n.includes('기름') || n.includes('유') || n.includes('식용유') || n.includes('참기름')) return '🫙';
  if (n.includes('김')) return '🍙';
  if (n.includes('세제') || n.includes('샤프란') || n.includes('퐁퐁')) return '🫧';
  
  return '✨'; // 기본 아이콘
};

const getIconForEventTitle = (title: string) => {
  if (!title) return '🎉';
  const t = title.replace(/\s/g, '').toLowerCase();

  // 시즌/명절/기념일
  if (t.includes('크리스마스') || t.includes('성탄') || t.includes('산타') || t.includes('xmas') || t.includes('christmas')) return '🎄';
  if (t.includes('할로윈') || t.includes('halloween')) return '🎃';
  if (t.includes('추석') || t.includes('한가위') || t.includes('보름')) return '🌕';
  if (t.includes('설날') || t.includes('구정') || t.includes('명절') || t.includes('새해') || t.includes('신년')) return '🧧';
  if (t.includes('발렌타인') || t.includes('화이트데이') || t.includes('빼빼로') || t.includes('사랑')) return '💝';
  if (t.includes('어버이') || t.includes('스승') || t.includes('감사') || t.includes('효도')) return '💐';
  if (t.includes('어린이') || t.includes('생일') || t.includes('기념') || t.includes('주년') || t.includes('오픈') || t.includes('창립')) return '🎂';
  if (t.includes('복날') || t.includes('초복') || t.includes('중복') || t.includes('말복') || t.includes('삼계탕')) return '🐓';
  if (t.includes('김장')) return '🥬';
  if (t.includes('캠핑') || t.includes('바베큐') || t.includes('바비큐') || t.includes('나들이') || t.includes('소풍')) return '⛺';

  // 계절/날씨
  if (t.includes('봄') || t.includes('벚꽃') || t.includes('꽃')) return '🌸';
  if (t.includes('여름') || t.includes('바캉스') || t.includes('휴가') || t.includes('무더위') || t.includes('시원')) return '🏖️';
  if (t.includes('가을') || t.includes('단풍') || t.includes('수확')) return '🍁';
  if (t.includes('겨울') || t.includes('연말') || t.includes('눈') || t.includes('방한')) return '⛄';
  if (t.includes('비오는') || t.includes('장마')) return '☔';

  // 품목/테마
  if (t.includes('한우') || t.includes('소고기') || t.includes('정육') || t.includes('고기') || t.includes('스테이크')) return '🥩';
  if (t.includes('삼겹') || t.includes('한돈') || t.includes('돼지')) return '🥓';
  if (t.includes('수산') || t.includes('생선') || t.includes('회') || t.includes('해산물') || t.includes('바다')) return '🐟';
  if (t.includes('과일') || t.includes('청과') || t.includes('사과') || t.includes('딸기') || t.includes('수박')) return '🍎';
  if (t.includes('야채') || t.includes('채소') || t.includes('신선')) return '🥬';

  // 세일 강조 키워드
  if (t.includes('타임') || t.includes('번개') || t.includes('마감') || t.includes('긴급') || t.includes('선착순')) return '⚡';
  if (t.includes('주말') || t.includes('불금') || t.includes('폭탄') || t.includes('초특가') || t.includes('대박') || t.includes('파격') || t.includes('핫')) return '🔥';
  if (t.includes('왕') || t.includes('최고') || t.includes('프리미엄') || t.includes('명품')) return '👑';
  if (t.includes('선물') || t.includes('사은') || t.includes('보너스') || t.includes('혜택')) return '🎁';

  return '🎉';
};

const emojiToTwemojiUrl = (emoji: string) => {
  const cps = Array.from(emoji).map((c) => c.codePointAt(0)!.toString(16));
  const code = cps.includes('200d') ? cps.join('-') : cps.filter((c) => c !== 'fe0f').join('-');
  return `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${code}.svg`;
};

function EmojiIcon({ emoji, className = 'w-[16px] h-[16px]' }: { emoji: string; className?: string }) {
  const [isMobileOs, setIsMobileOs] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent.toLowerCase();
      if (/android|iphone|ipad|ipod/.test(ua)) {
        setIsMobileOs(true);
      }
    }
  }, []);

  if (isMobileOs || imgError) {
    return <span>{emoji}</span>;
  }

  return (
    <img
      src={emojiToTwemojiUrl(emoji)}
      alt={emoji}
      className={`${className} inline-block object-contain select-none`}
      draggable={false}
      onError={() => setImgError(true)}
    />
  );
}

interface SaleItem {
  id: string;
  category: string;
  product_name: string;
  quantity: string;
  sale_price: string;
  discount_rate?: number | null;
  grade?: string | null;
  origin?: string | null;
  created_at: string;
  is_sold_out?: boolean;
}

export default function CustomerSalePage() {
  const params = useParams();
  const storeSlug = params.storeId as string;
  const [items, setItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnded, setIsEnded] = useState(false);
  const [periodText, setPeriodText] = useState('');
  const [durationBadge, setDurationBadge] = useState('');
  const [bossMessage, setBossMessage] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventSubtitle, setEventSubtitle] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeInfo, setStoreInfo] = useState<any>(null);
  const [isStoreInfoOpen, setIsStoreInfoOpen] = useState(false);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(true);
  const [isStandaloneMode, setIsStandaloneMode] = useState(false);
  const [installGuideMode, setInstallGuideMode] = useState<'ios' | 'android' | null>(null);
  const [installCompleteModal, setInstallCompleteModal] = useState(false);

  // iOS 홈화면 타이틀 및 head 내 manifest 링크 보장
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (storeSlug) {
      let manifestLink = document.head.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
      if (!manifestLink) {
        manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        document.head.appendChild(manifestLink);
      }
      const targetHref = `/api/manifest?mode=sale&slug=${encodeURIComponent(storeSlug)}&v=3`;
      if (!manifestLink.getAttribute('href')?.includes(`slug=${encodeURIComponent(storeSlug)}`)) {
        manifestLink.href = targetHref;
      }
    }
    if (storeName) {
      const appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]') as HTMLMetaElement | null;
      if (appleTitleMeta) {
        appleTitleMeta.content = storeName;
      }
    }
  }, [storeSlug, storeName]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
      window.location.replace(`https://www.nao3.kr${window.location.pathname}${window.location.search}`);
      return;
    }

    if (typeof window !== 'undefined') {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandaloneMode(standalone);

      const alreadySubbed = localStorage.getItem(`nao3_push_sub_${storeSlug}`) === 'true';
      const notifGranted = 'Notification' in window && Notification.permission === 'granted';
      if (standalone && alreadySubbed && notifGranted) {
        setShowInstallBanner(false);
      }

      if ((window as any).__nao3DeferredPrompt) {
        setDeferredPrompt((window as any).__nao3DeferredPrompt);
      }
    }

    const handler = (e: any) => {
      e.preventDefault();
      (window as any).__nao3DeferredPrompt = e;
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };
    const readyHandler = () => {
      if ((window as any).__nao3DeferredPrompt) {
        setDeferredPrompt((window as any).__nao3DeferredPrompt);
      }
    };
    const installedHandler = () => {
      setShowInstallBanner(false);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('nao3-install-ready', readyHandler);
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('nao3-install-ready', readyHandler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, [storeSlug]);

  const subscribeToStorePush = async (showCompleteModal: boolean): Promise<boolean> => {
    if (!('Notification' in window)) return false;

    const perm = await Notification.requestPermission();
    if (perm === 'granted' && 'serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        let sub = await reg.pushManager.getSubscription();

        const urlBase64ToUint8Array = (base64String: string) => {
          const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
          const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
          const rawData = window.atob(base64);
          const outputArray = new Uint8Array(rawData.length);
          for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
          }
          return outputArray;
        };

        const vapidKey = urlBase64ToUint8Array(
          'BPjk-7gccGn9cI7r_mWhS2bRC_-FbApH8Tg8YhIPBDL6s1WIybDbDUT0E6u0IfrDNR_rR7sUzVXPboyKqL6-KTU'
        );

        if (!sub) {
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: vapidKey,
          });
        }

        const targetStoreUuid = storeInfo?.id;
        if (targetStoreUuid && sub) {
          const { error: dbError } = await supabase.from('nao3_system_settings').insert({
            setting_key: 'PUSH_SUB_' + targetStoreUuid + '_' + Date.now().toString(),
            setting_value: JSON.stringify(sub),
          });
          if (dbError) {
            console.error('Push DB insert error:', dbError);
            return false;
          }
        }

        localStorage.setItem(`nao3_push_sub_${storeSlug}`, 'true');
        if (showCompleteModal) {
          setInstallCompleteModal(true);
        }
        return true;
      } catch (e) {
        console.error('Push sub error', e);
        return false;
      }
    } else if (perm === 'denied') {
      alert('휴대폰 브라우저에서 알림이 차단되어 있습니다.\n브라우저 주소창 옆 자물쇠(설정) 아이콘을 눌러 [알림]을 허용해 주세요.');
      return false;
    }
    return false;
  };

  const handleInstallAndPush = async () => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
    const isIos = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    const isInApp = /kakaotalk|naver|instagram|fb_iab|fban|fbav|line/.test(ua);

    // 1. 안드로이드 카카오톡/네이버 등 인앱 브라우저일 때 -> 즉시 크롬 외부 브라우저로 연결
    if (isAndroid && isInApp) {
      const targetUrl = window.location.href.replace(/^https?:\/\//i, '');
      window.location.href = `intent://${targetUrl}#Intent;scheme=https;package=com.android.chrome;end`;
      return;
    }

    // 2. 아이폰(iOS) 처리
    if (isIos) {
      if (!isStandaloneMode) {
        setInstallGuideMode('ios');
        return;
      }
      const ok = await subscribeToStorePush(true);
      if (ok) {
        setShowInstallBanner(false);
      }
      return;
    }

    // 3. 이미 홈 화면 앱(standalone)에서 실행 중인 경우 -> 푸시 알림만 즉시 켜기
    if (isStandaloneMode) {
      const ok = await subscribeToStorePush(true);
      if (ok) {
        setShowInstallBanner(false);
      }
      return;
    }

    // 4. 안드로이드(크롬/삼성인터넷 등) 및 PC 브라우저:
    // 페이지 열자마자 빠르게 누른 경우를 대비해 최대 1.2초간 네이티브 설치 이벤트 대기
    let promptEvent = deferredPrompt || (typeof window !== 'undefined' ? (window as any).__nao3DeferredPrompt : null);
    if (!promptEvent && typeof window !== 'undefined') {
      for (let i = 0; i < 12; i++) {
        await new Promise((r) => setTimeout(r, 100));
        if ((window as any).__nao3DeferredPrompt) {
          promptEvent = (window as any).__nao3DeferredPrompt;
          break;
        }
      }
    }

    if (promptEvent) {
      let accepted = false;
      try {
        promptEvent.prompt();
        const choiceResult = await promptEvent.userChoice;
        if (choiceResult?.outcome === 'accepted') {
          accepted = true;
        }
      } catch (e) {
        console.warn('Install prompt error', e);
      }
      (window as any).__nao3DeferredPrompt = null;
      setDeferredPrompt(null);

      if (accepted) {
        setShowInstallBanner(false);
        // 네이티브 설치 창이 닫히고 백그라운드 설치가 시작될 여유 시간(600ms) 확보 후 푸시 알림 권한 요청 (블로킹 alert 미사용)
        await new Promise((r) => setTimeout(r, 600));
        await subscribeToStorePush(true);
      }
      return;
    }

    // 5. 이미 휴대폰(앱스/바탕화면)에 설치되어 있어 브라우저가 중복 설치 창을 생략한 경우 -> 푸시 알림 등록 후 안내 모달 표시
    const pushOk = await subscribeToStorePush(false);
    setInstallGuideMode('android');
    if (pushOk) {
      setShowInstallBanner(false);
    }
  };

  useEffect(() => {
    if (!storeSlug) return;

    const fetchItems = async () => {
      try {
        // 0. URL의 storeId를 기반으로 해당 가게 상호명 가져오기 (미리보기 모드라도 항상 가져와서 가게정보/특가 정보를 렌더링해야 함)
        let storeIdForQuery = storeSlug;
        if (storeSlug.startsWith('demo-guest-')) {
          setStoreName('체험용 마트');
          setStoreInfo({ id: storeSlug, store_name: '체험용 마트' });
        } else {
          const isUuidSlug = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(storeSlug);
          const { data: store } = await supabase
            .from('nao3_stores')
            .select('id, store_name, address, phone, operating_hours, closed_days, special_image_url, special_title, special_price, special_message')
            .eq(isUuidSlug ? 'id' : 'slug', storeSlug)
            .maybeSingle();
            
          if (store) {
            storeIdForQuery = store.id;
            setStoreName(store.store_name);
            if (typeof document !== 'undefined' && store.store_name) {
              document.title = `NAO3 - ${store.store_name}`;
            }
            const { data: etcRow } = await supabase
              .from('nao3_system_settings')
              .select('setting_value')
              .eq('setting_key', `STORE_ETC_INFO_${store.id}`)
              .maybeSingle();
            setStoreInfo({ ...store, etc_info: etcRow?.setting_value || '' });

            const { data: bannerRow } = await supabase
              .from('nao3_system_settings')
              .select('setting_value')
              .eq('setting_key', `STORE_EVENT_BANNER_${store.id}`)
              .maybeSingle();
            if (bannerRow?.setting_value) {
              try {
                const parsed = JSON.parse(bannerRow.setting_value);
                if (parsed.eventTitle) setEventTitle(parsed.eventTitle);
                if (parsed.eventSubtitle) setEventSubtitle(parsed.eventSubtitle);
              } catch (e) {}
            }
          }
        }

        const isPreview = new URLSearchParams(window.location.search).get('preview') === 'true' || storeSlug.startsWith('demo-guest-');
        if (isPreview) {
          // storeSlug 또는 storeIdForQuery 둘 다로 검색하여 확실하게 로드
          const rawSettings = localStorage.getItem(`nao3_staging_settings_${storeSlug}`) || 
                              (storeIdForQuery ? localStorage.getItem(`nao3_staging_settings_${storeIdForQuery}`) : null);
          const stagedSettings = JSON.parse(rawSettings || '{}');
          if (stagedSettings.storeName) setStoreName(stagedSettings.storeName);
          if (stagedSettings.eventTitle !== undefined) setEventTitle(stagedSettings.eventTitle);
          if (stagedSettings.eventSubtitle !== undefined) setEventSubtitle(stagedSettings.eventSubtitle);
          
          setStoreInfo((prev: any) => ({
            ...prev,
            id: prev?.id || storeIdForQuery || storeSlug,
            store_name: stagedSettings.storeName || prev?.store_name || storeSlug,
            special_title: stagedSettings.special_title || prev?.special_title,
            special_price: stagedSettings.special_price || prev?.special_price,
            special_message: stagedSettings.special_message || prev?.special_message,
            special_image_url: stagedSettings.special_image_url || prev?.special_image_url
          }));
          
          if (stagedSettings.saleStart && stagedSettings.saleEnd) {
            const start = new Date(stagedSettings.saleStart);
            const end = new Date(stagedSettings.saleEnd);
            const formattedStart = start.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' });
            const formattedEnd = end.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' });
            setPeriodText(formattedStart + ' ~ ' + formattedEnd);
            
            const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
            const diffDays = Math.ceil((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            setDurationBadge(diffDays > 0 ? `단 ${diffDays}일간` : '단 하루');
          }
          setBossMessage(stagedSettings.bossMessage || '');

          const rawItems = localStorage.getItem(`nao3_staging_items_${storeSlug}`) || 
                           (storeIdForQuery ? localStorage.getItem(`nao3_staging_items_${storeIdForQuery}`) : null);
          let stagedItems = JSON.parse(rawItems || '[]');
          
          if (stagedItems.length === 0 && storeSlug.startsWith('demo-guest-')) {
            const histories = JSON.parse(localStorage.getItem('nao3_demo_histories') || '[]');
            const latest = histories.find((h: any) => h.store_id === storeSlug);
            if (latest && latest.nao3_sale_items) {
              stagedItems = latest.nao3_sale_items;
            }
          }

          setItems(stagedItems);
          setLoading(false);
          return;
        }

        // 1. 해당 가게의 가장 최근 발송 이력(push_id) 가져오기
        const { data: latestPush, error: pushError } = await supabase
          .from('nao3_push_history')
          .select('id, sale_start, sale_end, boss_message')
          .eq('store_id', storeIdForQuery)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (pushError && pushError.code !== 'PGRST116') throw pushError;

        if (latestPush) {
          // 세일 기간 체크 로직
          if (latestPush.sale_start && latestPush.sale_end) {
            const now = new Date();
            const end = new Date(latestPush.sale_end);
            const start = new Date(latestPush.sale_start);
            setIsEnded(now > end);
            
            const format = (d: Date) => `${d.getFullYear()}. ${d.getMonth()+1}. ${d.getDate()}.`;
            setPeriodText(`행사 기간 ${format(start)} ~ ${format(end)}`);
            
            const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
            const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
            const diffDays = Math.ceil((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            setDurationBadge(diffDays > 0 ? `단 ${diffDays}일간` : '단 하루');
          }

          if (latestPush.boss_message) {
            setBossMessage(latestPush.boss_message);
          }

          if (!latestPush.sale_end || new Date() <= new Date(latestPush.sale_end)) {
            // 2. 해당 push_id에 속한 아이템만 가져오기
            const { data, error } = await supabase
              .from('nao3_sale_items')
              .select('*')
              .eq('push_id', latestPush.id)
              .order('created_at', { ascending: true });

            if (error) throw error;
            if (data) setItems(data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch sale items', error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // 카테고리별로 그룹화
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SaleItem[]>);

  // 출력할 카테고리 순서 정의
  const categoryOrder = [
    { id: '정육', title: '프리미엄 미트 존', subtitle: 'Premium Meat' },
    { id: '청과', title: '엄선된 신선 과일', subtitle: 'Fresh Fruits' },
    { id: '야채', title: '신선채소 · 수산', subtitle: 'Vegetables & Seafood' },
    { id: '공산품', title: '데일리 생필품', subtitle: 'Daily & Groceries' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1A1A1A] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isEnded) {
    return (
      <main className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-sm w-full">
          <span className="text-4xl block mb-4 opacity-50">⏳</span>
          <h2 className="text-xl font-bold text-gray-900 mb-2">세일이 종료되었습니다</h2>
          <p className="text-sm text-gray-500">
            고객님의 성원에 감사드립니다.<br/>다음 세일 행사를 기대해 주세요!
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen bg-[#F1F2F4] pb-24 font-sans ${showInstallBanner ? 'pt-12' : ''}`}>
      {/* 최상단 PWA 설치 및 푸시 유도 배너 */}
      {showInstallBanner && (
        <div className="fixed top-0 left-0 right-0 h-12 bg-gray-900 z-50 flex items-center justify-between px-4 shadow-md animate-fade-in-down">
          <div className="flex items-center gap-2 min-w-0 pr-2">
            <span className="text-xl shrink-0">{isStandaloneMode ? '🔔' : '🎁'}</span>
            <span className="text-white text-[12px] font-bold tracking-tight truncate">
              {isStandaloneMode
                ? '마지막 1단계! 실시간 세일 알림을 켜주세요'
                : '터치 한 번으로 세일 소식 받기!'}
            </span>
          </div>
          <button 
            onClick={handleInstallAndPush}
            className="shrink-0 bg-yellow-400 text-yellow-900 font-black text-[11.5px] px-3.5 py-1.5 rounded-full hover:bg-yellow-300 transition-colors shadow-sm"
          >
            {isStandaloneMode ? '세일 알림 켜기' : '홈 화면에 추가'}
          </button>
        </div>
      )}

      {/* iOS / 안드로이드 수동 홈화면 추가 시각 안내 모달 */}
      {installGuideMode && (
        <div
          className="fixed inset-0 z-[100] bg-black/65 flex items-center justify-center p-4 animate-fade-in-up"
          onClick={() => setInstallGuideMode(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-[#5F0080]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <span className="inline-block bg-purple-100 text-[#5F0080] text-[12px] font-black px-3 py-1 rounded-full mb-2">
                {installGuideMode === 'ios' ? '🍎 아이폰(iOS) 단골 등록 안내' : '📱 홈 화면 바로가기 안내'}
              </span>
              <h3 className="text-[20px] font-black text-gray-900 leading-snug break-keep">
                [{storeName || '우리 매장'}]<br />홈 화면에 추가하는 방법
              </h3>
            </div>

            {installGuideMode === 'ios' ? (
              <div className="space-y-3 text-left bg-[#FAF5FF] border border-purple-200 rounded-2xl p-4 mb-5">
                <div className="flex items-start gap-2.5">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[#5F0080] text-white text-[13px] font-black flex items-center justify-center mt-0.5">1</span>
                  <p className="text-[14px] font-bold text-gray-800 leading-snug break-keep">
                    화면 맨 아래 가운데(또는 우측 상단)의 <strong className="text-[#5F0080]">[공유 📤] (네모 안 화살표)</strong> 버튼을 눌러주세요.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[#B81D5C] text-white text-[13px] font-black flex items-center justify-center mt-0.5">2</span>
                  <p className="text-[14px] font-bold text-gray-800 leading-snug break-keep">
                    메뉴를 아래로 조금 내려서 <strong className="text-[#B81D5C]">[홈 화면에 추가 ➕]</strong>를 누른 뒤 우측 상단 <strong>[추가]</strong>를 눌러주세요.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[#5F0080] text-white text-[13px] font-black flex items-center justify-center mt-0.5">3</span>
                  <p className="text-[14px] font-bold text-gray-800 leading-snug break-keep">
                    바탕화면에 생긴 <strong className="text-[#5F0080]">[{storeName || '우리 매장'}]</strong> 아이콘을 눌러 들어오신 뒤 상단 <strong>[세일 알림 켜기]</strong>를 누르면 완료됩니다!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-left bg-[#FAF5FF] border border-purple-200 rounded-2xl p-4 mb-5">
                <div className="bg-white border border-purple-100 rounded-xl p-3 text-center">
                  <p className="text-[14px] font-black text-[#5F0080] break-keep">
                    🎉 [{storeName || '우리 매장'}] 특가 알림 수신 설정 완료!
                  </p>
                </div>
                <p className="text-[13.5px] font-bold text-gray-700 leading-relaxed break-keep">
                  휴대폰 바탕화면에도 매장 아이콘을 추가하시려면 아래 순서대로 눌러주세요:
                </p>
                <div className="flex items-start gap-2.5">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[#5F0080] text-white text-[13px] font-black flex items-center justify-center mt-0.5">1</span>
                  <p className="text-[14px] font-bold text-gray-800 leading-snug break-keep">
                    화면 우측 상단 <strong className="text-[#5F0080]">[ ⋮ ]</strong> 버튼 (삼성인터넷은 하단 <strong className="text-[#5F0080]">[ ≡ ]</strong> 메뉴)을 눌러주세요.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[#B81D5C] text-white text-[13px] font-black flex items-center justify-center mt-0.5">2</span>
                  <p className="text-[14px] font-bold text-gray-800 leading-snug break-keep">
                    메뉴에서 <strong className="text-[#B81D5C]">[홈 화면에 추가]</strong> (또는 <strong>[현재 페이지 추가 ➔ 홈 화면]</strong>)를 누르면 바탕화면에 <strong className="text-[#5F0080]">[{storeName || '우리 매장'}]</strong> 아이콘이 생깁니다!
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setInstallGuideMode(null)}
              className="w-full py-3.5 bg-[#5F0080] hover:bg-purple-900 text-white font-black rounded-2xl text-[15px] shadow-md transition-colors"
            >
              확인했습니다
            </button>
          </div>
        </div>
      )}

      {/* 홈화면 추가 + 특가 알림 설정 완료 모달 (브라우저 백그라운드 설치를 멈추지 않는 비블로킹 UI) */}
      {installCompleteModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/65 flex items-center justify-center p-4 animate-fade-in-up"
          onClick={() => setInstallCompleteModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-[#5F0080] text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-purple-50 text-[#5F0080] rounded-full flex items-center justify-center mx-auto mb-3 text-3xl shadow-inner">
              🎉
            </div>
            <h3 className="text-[20px] font-black text-gray-900 leading-snug break-keep mb-2">
              [{storeName || '우리 매장'}]<br />홈 화면 추가 및 알림 설정 완료!
            </h3>
            <p className="text-[14px] font-bold text-gray-600 leading-relaxed break-keep mb-5">
              휴대폰 바탕화면에 바로가기 아이콘이 생성 중이며, 이제부터 실시간 특가 소식을 가장 먼저 받아보실 수 있습니다.
            </p>
            <button
              onClick={() => setInstallCompleteModal(false)}
              className="w-full py-3.5 bg-[#5F0080] hover:bg-purple-900 text-white font-black rounded-2xl text-[15px] shadow-md transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 헤더 영역 (투톤 분리 - 직선형) */}
      <div className="flex flex-col">
        
        {/* 1. 브랜드 & 상호명 영역 (진한 보라색 딥톤) */}
        <div className="bg-[#5F0080] pt-8 pb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          
          <div className="relative z-10 flex flex-col items-center justify-center animate-fade-in-up">
            <h1 className="text-sm font-bold tracking-[0.25em] text-[#E5D7B7] uppercase bg-black/40 px-4 py-1 rounded-full border border-[#E5D7B7]/30 mb-3">
              NAO3
            </h1>
            <h2 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md tracking-tight break-keep px-4">
              {storeName}
            </h2>
          </div>
        </div>

        {/* 연보라색 래퍼 (특가 배너 + 사장님 이야기 묶음) */}
        <div className="bg-[#F8F9FA] w-full pb-6 shadow-sm border-b border-gray-200">
          
          {/* 2. 특가 배너 영역 */}
          <div className="py-7 px-4 text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {durationBadge && (
              <div className="mb-4">
                <span className="inline-flex items-center gap-2 px-5 py-2 sm:px-6 sm:py-2.5 rounded-full bg-gradient-to-r from-[#5F0080] to-[#7A00A3] text-white font-black text-[15px] sm:text-[17px] shadow-[0_4px_14px_rgba(95,0,128,0.3)] animate-pulse tracking-wide ring-2 ring-[#5F0080]/20">
                  <svg className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <span>{durationBadge}</span>
                  <span className="text-[#FFD700] font-extrabold">단독 특가</span>
                </span>
              </div>
            )}
            <h3 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] mb-2 tracking-tight leading-snug break-keep whitespace-pre-line">
              <EmojiIcon emoji={getIconForEventTitle(eventTitle || '오늘의 특가 찬스!')} className="w-7 h-7 sm:w-8 sm:h-8 align-middle mr-1" /> {eventTitle || '오늘의 특가 찬스!'}
            </h3>
            <p className="text-[16px] sm:text-[18px] font-extrabold text-[#B81D5C] mb-4 tracking-tight leading-snug break-keep whitespace-pre-line">
              {eventSubtitle || '단골 고객님을 위해 준비한 깜짝 한정 세일'}
            </p>
            
            {periodText && (
              <div className="mt-2 inline-flex bg-[#F8F0FF] text-[#5F0080] font-black text-[16px] sm:text-[18px] px-7 py-3.5 sm:px-9 sm:py-4 rounded-2xl shadow-[0_4px_12px_rgba(95,0,128,0.08)] border-2 border-[#D8B4FE] items-center justify-center w-auto max-w-[96%] mx-auto transition-all">
                <div className="flex items-center tracking-tight whitespace-nowrap">
                  <span className="leading-tight">🗓️ {periodText}</span>
                </div>
              </div>
            )}
          </div>

          {/* 오늘의 사장님 이야기 */}
          {bossMessage && (
            <div className="max-w-md mx-auto px-4 pt-4 pb-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {/* 타이틀을 바깥으로 빼고, 수평 라인과 연결 (미니멀 인포메이션 패널 스타일) */}
              <div className="flex items-center gap-3 mb-3 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#1A1A1A] text-[18px] leading-none opacity-90">🖋️</span>
                  <h3 className="text-[16px] font-black text-[#1A1A1A] tracking-[0.1em] uppercase whitespace-nowrap">
                    오늘의 사장님 이야기
                  </h3>
                </div>
                <div className="flex-1 h-[1px] bg-[#1A1A1A]/20"></div>
              </div>
              
              {/* 날렵한 사각 모서리 텍스트 전용 박스 */}
              <div className="border border-[#E8DFD1] rounded-none px-6 py-6 bg-[#F5F0E6] shadow-sm">
                <p className="text-[14.5px] text-[#38332E] leading-[1.85] whitespace-pre-wrap font-medium tracking-wide">
                  {bossMessage}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 오늘의 강력 추천 특가 존 */}
      {storeInfo && (storeInfo.special_title || storeInfo.special_image_url) && (
        <div className="max-w-md mx-auto w-full px-4 mb-8 mt-2 animate-fade-in-up">
          {/* 깊은 그림자와 순백색 배경으로 포장된 상자처럼 띄우기 */}
          <div className="bg-white rounded-[20px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)] border border-gray-100/50 overflow-hidden flex flex-col relative">
            
            {/* 다크 챠콜 & 골드빛 텍스트 헤더 */}
            <div className="bg-[#5F0080] py-4 text-center">
              <h3 className="text-[16px] font-bold text-[#E5D7B7] tracking-[0.2em] uppercase">
                오늘의 추천 특가
              </h3>
            </div>
            
            <div className="flex flex-col items-center">
              {/* 시원한 사진 영역 */}
              {storeInfo.special_image_url && (
                <div className="w-full aspect-[4/3] bg-gray-50 overflow-hidden relative">
                  {storeInfo.special_image_url.match(/\.(mp4|webm|ogg)$/i) ? (
                    <video src={storeInfo.special_image_url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                  ) : (
                    <img src={storeInfo.special_image_url} alt={storeInfo.special_title} className="w-full h-full object-cover" />
                  )}
                </div>
              )}
              
              {/* 텍스트 영역 */}
              <div className="w-full px-6 pt-7 pb-8 flex flex-col items-center">
                
                {(storeInfo.special_title || storeInfo.special_price) && (
                  <div className="text-center w-full mb-1">
                    {storeInfo.special_title && (
                      <h4 className="text-[22px] font-black text-gray-900 tracking-tight leading-tight mb-2">
                        {storeInfo.special_title}
                      </h4>
                    )}
                    {storeInfo.special_price && (
                      <p className="text-[26px] font-semibold text-[#8B1818] tracking-tight">
                        {storeInfo.special_price}{/^\d/.test(storeInfo.special_price) && !storeInfo.special_price.includes('원') && !storeInfo.special_price.match(/[a-zA-Z]/) ? '원' : ''}
                      </p>
                    )}
                  </div>
                )}
                
                {/* 감성적인 메모 형태의 사장님 한마디 (큰 따옴표 엠블럼 활용) */}
                {storeInfo.special_message && (
                  <div className="w-full mt-6 flex items-start justify-center gap-2 px-1">
                    <svg className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                    <p className="text-[14.5px] font-medium text-gray-600 text-center leading-relaxed break-keep">
                      {storeInfo.special_message}
                    </p>
                    <svg className="w-5 h-5 text-gray-300 shrink-0 mt-0.5 rotate-180" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 세일 품목 리스트 */}
      <div className="max-w-md mx-auto w-full flex flex-col gap-3 pt-3 pb-8">
        {items.length === 0 ? (
          <div className="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-4xl block mb-4 opacity-30">✨</span>
            <p className="font-bold text-gray-500 text-[15px]">현재 진행 중인 세일 행사가 없습니다.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {categoryOrder.map(cat => {
              let catItems = groupedItems[cat.id];
              if (!catItems || catItems.length === 0) return null;

              // 야채/수산 카테고리 내부 정렬 로직 (채소 먼저, 수산물 나중에)
              if (cat.id === '야채' || cat.id === '야채·수산') {
                const isSeafood = (name: string) => {
                  const keywords = ['오징어', '갈치', '고등어', '전복', '바지락', '굴', '꽃게', '게', '새우', '주꾸미', '쭈꾸미', '동태', '생태', '명태', '미역', '다시마', '멸치', '낙지', '문어', '조개', '가리비', '해물', '수산', '연어', '광어', '우럭', '꽁치', '삼치', '장어', '홍합', '해파리', '꼬막', '미꾸라지', '대하', '소라'];
                  return keywords.some(kw => name.includes(kw));
                };
                catItems = [...catItems].sort((a, b) => {
                  const aIsSeafood = isSeafood(a.product_name) ? 1 : 0;
                  const bIsSeafood = isSeafood(b.product_name) ? 1 : 0;
                  return aIsSeafood - bIsSeafood;
                });
              }

              return (
                <section key={cat.id} className="animate-fade-in-up bg-white px-5 py-7 shadow-sm border-y border-gray-200">
                  
                  {/* 고급스러운 좌측 정렬 카테고리 헤더 */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1.5 h-6 bg-[#1A1A1A] rounded-full"></div>
                    <div className="flex flex-col">
                      <h3 className="text-[20px] font-extrabold text-gray-900 tracking-tight leading-none">
                        {cat.title}
                      </h3>
                      <span className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1 block">
                        {cat.subtitle}
                      </span>
                    </div>
                  </div>
                  
                  {/* 리스트: 깔끔한 라인 정렬 (옵션 병합 처리) */}
                  <div className="flex flex-col">
                    {(() => {
                      const mergedItems: any[] = [];
                      catItems.forEach(item => {
                        const existing = mergedItems.find(mi => mi.product_name === item.product_name);
                        if (existing) {
                          // 기존 옵션을 배열에 추가하지 않고 완전히 최신값으로 덮어씌움 (단일 라인 유지)
                          existing.options = [{
                            id: item.id,
                            quantity: item.quantity,
                            sale_price: item.sale_price,
                            discount_rate: item.discount_rate,
                            grade: item.grade,
                            origin: item.origin,
                            is_sold_out: item.is_sold_out
                          }];
                        } else {
                          mergedItems.push({
                            ...item,
                            options: [{
                              id: item.id,
                              quantity: item.quantity,
                              sale_price: item.sale_price,
                              discount_rate: item.discount_rate,
                              grade: item.grade,
                              origin: item.origin,
                              is_sold_out: item.is_sold_out
                            }]
                          });
                        }
                      });

                      return mergedItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-3.5 border-b border-gray-200 last:border-b-0 transition-all">
                          
                          {/* 좌측: 상품명 & 품절 상태 */}
                            <div className="flex flex-col flex-1 min-w-0 pr-3">
                              <div className="flex items-center gap-2.5">
                                {item.options.every((opt: any) => opt.is_sold_out) && (
                                  <span className="text-[11px] font-black text-white bg-[#E52525] px-2 py-1 rounded shrink-0 leading-none shadow-sm tracking-wide">
                                    품절
                                  </span>
                                )}
                                <span className="flex-shrink-0 w-[26px] h-[26px] bg-[#F9F9F9] rounded-full flex items-center justify-center border border-gray-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] text-[14px]">
                                  <EmojiIcon emoji={getIconForProduct(item.product_name)} className="w-[16px] h-[16px]" />
                                </span>
                                <h4 className={`text-[16px] font-bold text-gray-900 truncate ${item.options.every((opt: any) => opt.is_sold_out) ? 'line-through text-gray-400' : ''}`}>
                                  {item.product_name}
                                </h4>
                              </div>
                              {(item.options[0]?.grade || item.options[0]?.origin) && (
                                <div className="flex items-center gap-1.5 mt-1 ml-9">
                                  {item.options[0]?.grade && (
                                    <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded flex-shrink-0">
                                      {item.options[0].grade}
                                    </span>
                                  )}
                                  {item.options[0]?.origin && (
                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded flex-shrink-0">
                                      {item.options[0].origin === '국내산(국산)' ? '국산' : item.options[0].origin}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          
                          {/* 우측: 중량 & 가격 옵션 그룹 */}
                          <div className="text-right flex-shrink-0 flex flex-col items-end justify-center gap-1.5">
                            {item.options.map((opt: any, idx: number) => (
                              <div key={opt.id || idx} className={`flex items-center gap-2 ${opt.is_sold_out ? 'opacity-50' : ''}`}>
                                {opt.discount_rate && !opt.is_sold_out && (
                                  <span className="text-[13px] font-black text-white bg-[#8B1818] px-2 py-0.5 rounded-md shrink-0 tracking-tight shadow-sm">
                                    {opt.discount_rate}%
                                  </span>
                                )}
                                <span className={`text-[13px] font-extrabold tracking-tight px-2 py-0.5 rounded-md shrink-0 ${opt.is_sold_out ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-[#1A1A1A]'}`}>
                                  {opt.quantity}
                                </span>
                                <span className={`text-[16px] font-black tracking-tight ${opt.is_sold_out ? 'text-gray-400 line-through decoration-gray-400 decoration-2' : 'text-[#8B1818]'}`}>
                                  {opt.sale_price}
                                </span>
                              </div>
                            ))}
                          </div>
                          
                        </div>
                      ));
                    })()}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* 매장 안내 (항상 펼침 노출) */}
      {storeInfo && (
        <div className="w-full bg-white border-t-8 border-[#F4F4F4] pb-8 mt-6">
          <div className="py-5 px-5 flex items-center justify-between text-[16px] font-black text-gray-900">
            <span>{storeName} 매장 안내</span>
          </div>
          
          <div className="px-5 pb-6">
            <div className="bg-[#FAFAFA] rounded-xl p-5 border border-gray-200">
              <div className="flex flex-col gap-4">
                
                {storeInfo.operating_hours && (
                  <div className="flex items-start gap-4">
                    <span className="text-[13px] font-bold text-gray-400 w-[55px] shrink-0 pt-0.5 tracking-tight">영업시간</span>
                    <span className="text-[15px] font-black text-gray-900 leading-snug break-keep">{storeInfo.operating_hours}</span>
                  </div>
                )}

                {storeInfo.closed_days && (
                  <div className="flex items-start gap-4">
                    <span className="text-[13px] font-bold text-gray-400 w-[55px] shrink-0 pt-0.5 tracking-tight">휴무일</span>
                    <span className="text-[15px] font-black text-[#E52525] leading-snug break-keep">{storeInfo.closed_days}</span>
                  </div>
                )}

                {storeInfo.address && (
                  <div className="flex items-start gap-4">
                    <span className="text-[13px] font-bold text-gray-400 w-[55px] shrink-0 pt-0.5 tracking-tight">오시는길</span>
                    <span className="text-[14px] font-bold text-gray-700 leading-snug break-keep">{storeInfo.address}</span>
                  </div>
                )}
                
                {storeInfo.phone && (
                  <div className="flex items-start gap-4">
                    <span className="text-[13px] font-bold text-gray-400 w-[55px] shrink-0 pt-0.5 tracking-tight">고객센터</span>
                    <span className="text-[15px] font-black text-[#5F0080]">
                      <a href={`tel:${storeInfo.phone}`} className="hover:underline">{storeInfo.phone}</a>
                    </span>
                  </div>
                )}

                {storeInfo.etc_info && (
                  <div className="flex items-start gap-4">
                    <span className="text-[13px] font-bold text-gray-400 w-[55px] shrink-0 pt-0.5 tracking-tight">기타안내</span>
                    <span className="text-[14px] font-bold text-gray-700 leading-snug break-keep whitespace-pre-line">{storeInfo.etc_info}</span>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Powered by NAO3 */}
          <div className="text-center pt-4 pb-2">
            <p className="text-[15px] font-bold text-gray-500">
              Powered by{' '}
              <Link href="/" className="font-black text-[#5F0080] hover:underline transition-colors">
                NAO3
              </Link>
            </p>
          </div>
        </div>
      )}

    </main>
  );
}
