"use client";
import { useEffect, useState } from 'react';
import { matchSearch } from '@/lib/hangul';
import { supabase } from '@/lib/supabase';

const CATEGORIES = [
  { id: '?ã»‚ãœœ', icon: '?å·? },
  { id: 'éº???, icon: '?ï¿? },
  { id: '?æ½°ï¿½', icon: '??' },
  { id: 'çª¸è›™ï¿??, icon: '?ï¿? },
];

const ITEM_DICT: Record<string, string[]> = {
  '?ã»‚ãœœ': ['?ğ¨°°é»??æ¡¿ğ¡ ?, '?ğ¨°°é»??ï¿½ğ¡ ?, '?ğ¨°°é»?çª?? è¬”?, '?ğ¨°°é»?è³±ï¿½ï¿½ç??, 'çª?ï¿???æ¾ç¡ƒ??, 'çª?ï¿??è«ˆæ‹–ï¿?, 'éº†ã´’ï¿????”ğ ¹»è¬”ç§‘ï¿½', '???œœ???æ¾ç¡ƒ??, '??£ï¿½ ?æ½?ç©ˆï¿½ï¿?, '???€?é¾²ï¿½????ƒğ¤…?, '????æ¸¥ï¿½', '?è³„Ë??éº?»¤ï¿?æ¸ ï¹'],
  'éº???: ['?ç¦¹é ƒ', 'è«»ç«¾ï¿??, '?ğ¨°°? ç©ˆé?æ¥?, '??¨ğ¥˜µè«Ÿè³„æ“ª??, 'çª¸ğ§™–é°Ÿ????ªï¿½', '?è³‡è¼', '?æ¡¿Ë?éº†è³„??, '?æ¢µçœ??è²è›™ï¿??, '?ğ¥»—ï¿½è«»?, 'è«»æ‹–??ğ§™–ï¿??, 'è³³ç«¾?—è²’ğ§™–??, '??ˆï¿½é´”ï¿½'],
  '?æ½°ï¿½': ['ç¯§éŸ’ï¿??, '?ğ£–™ï¿?, '?ï¿??, 'éº?ï¿½çª¸ğ¥”±ï¿?, '?ï¿½ï¿½??, '?ğ¡¥„?¹è«»?, '?ï¿½ï¿½', 'ç¯§é«¦ï¿?, 'è«»æ¡¿?ˆ”??, '?å¯?»‚', '?ï¿½ï¿½?æ¸ ï¿½??, '?è¶£ğ¦š?²’ï¿½ï¿½', '?ğ£•‘?½ç??è«»åŸŸï¿?, '?ğ¨°°? è«?],
  'çª¸è›™ï¿??: ['?ğ£½ğ¡ º ?ğ§™–ğ¦‰˜è«?, '??ˆï¿½ç¯?é´”ï¿½ğ¦‰˜è«?, 'CJ ?ï¿½ï¿½', '? ä‡¹?‘å„ å¶…ğ¦‰?, '??¥”±ï¿½?ç§‘ğ¦š??, '?è»¤ï¿½éº†è³„ï¿?, '?æ¬ è¢ ?æ¸ ï¿½??, '?ğ¨°°???Ÿï¿½', '??¸ ï¿??ï¿½ï¿½è¬”ç§‘???, 'è«¤ä¼Šğ¡ º è«ˆåˆ°?‘çª¸?ºï¿½']
};

const QTY_DICT = [
  '100g', '200g', '300g', '400g', '500g', '600g(1ç¯?', '800g', '1kg',
  '1ç©?, '2ç©?, '3ç©?, '5ç©?, '10ç©?, '1??, '2??, '1??, '1è«?, '1è³?, '1è«»ã»‚??
];

interface MartAdminProps {
  storeId: string;
  initialStoreName: string;
}

export default function MartAdmin({ storeId, initialStoreName }: MartAdminProps) {
  const [activeTab, setActiveTab] = useState('?ã»‚ãœœ');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [newItem, setNewItem] = useState({ product_name: '', quantity: '', sale_price: '' });

  // ??’ï¿½?ï¿½ï¿½ ?å¶…ï¼ƒ??¨ğ ‚??ï¿½ï¿½
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [showQtyDropdown, setShowQtyDropdown] = useState(false);
  const [nameIdx, setNameIdx] = useState(-1);
  const [qtyIdx, setQtyIdx] = useState(-1);

  // ?æ¸ ï¿½ çªµï¿½è¬??ï¿½ï¿½
  const [histories, setHistories] = useState<any[]>([]);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);

  // ?ï¿½çŒ¹è«? ?è³„ğ¦‰?é´”ï¿½ï¿?ç¯£åœ‹ï¿?è«??ç§‘ğ¤Ÿ???æ¸¥ç„©ç¯??ï¿½ï¿½
  const [storeName, setStoreName] = useState(initialStoreName || '');
  const [saleStart, setSaleStart] = useState('');
  const [saleEnd, setSaleEnd] = useState('');
  const [bossMessage, setBossMessage] = useState('');

  // ??è²ï¿½çª?????é»•ï¿½???  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setNewItem({ product_name: '', quantity: '', sale_price: '' });
    setNameIdx(-1);
    setQtyIdx(-1);
  };

  // ??’ï¿½?ï¿½ï¿½ ?ï¿½ï¿½è«?è¬”ç§‘???  const matchedNames = ITEM_DICT[activeTab]?.filter(name => matchSearch(newItem.product_name, name)) || [];
  const matchedQtys = QTY_DICT.filter(qty => matchSearch(newItem.quantity, qty));

  // è«»æ‹—æ£???æ¬ ï¿½è«??ç§‘èª˜??éº?ª??
  useEffect(() => {
    if (nameIdx >= 0) {
      document.getElementById('name-item-' + nameIdx)?.scrollIntoView({ block: 'nearest' });
    }
  }, [nameIdx]);
  
  useEffect(() => {
    if (qtyIdx >= 0) {
      document.getElementById('qty-item-' + qtyIdx)?.scrollIntoView({ block: 'nearest' });
    }
  }, [qtyIdx]);

  // ?æ¸ ï¿½ ???¿½ è«ˆåˆºï¿??ï¿½ï¿½
  const [editingHistoryItemId, setEditingHistoryItemId] = useState<{pushId: string, itemId: string} | null>(null);

  // ?æ¸ ï¿½ ??Ÿğ¦š??è³±ï¿½???°è¼ ??°ï¿½
  const fetchHistories = async () => {
    const { data, error } = await supabase
      .from('nao3_push_history')
      .select('*, nao3_sale_items(*)')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setHistories(data);
    }
  };

  // ??è«¢å¶…ï¿?????Ÿğ¦š??é»•ï¿½???  useEffect(() => {
    const loadInitData = async () => {
      const now = new Date();
      const toLocalStr = (d: string | Date) => {
        const dt = typeof d === 'string' ? new Date(d) : d;
        const offset = dt.getTimezoneOffset() * 60000;
        return new Date(dt.getTime() - offset).toISOString().slice(0, 16);
      };

      // 1. é´”ï¿½ï¿?é´—ğ¡¢¾ğ¥˜??è³„ğ¦‰???ï¿½ï¿½é´”ï¿½ ?ã»‚ğ¥˜?æ¸¥ï¿½ ç¯£åœ‹ï¿?è«°å±??ç¯£åœ‰?©ç©ˆğ¨©†å°è«¢?ç¯§ä‡¹ï¿½é´¥æ¾è¼
      const { data: latestPush } = await supabase
        .from('nao3_push_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let isAppendingToActive = false;
      
      if (latestPush && latestPush.sale_end && new Date(latestPush.sale_end) > now) {
        // ?ï¿½ï¿½ é®ˆï¿½ï¿??? ?ğ¥‡£? ?è³„ğ¦‰???ï¿½ğ ¹»è«°?ç¯??ğ¨ˆï¿??ç¯£åœ‰?©ç©ˆğ¨©†å°è«¢?        if (!saleStart) setSaleStart(toLocalStr(latestPush.sale_start));
        if (!saleEnd) setSaleEnd(toLocalStr(latestPush.sale_end));
        isAppendingToActive = true;
      } else {
        if (!saleStart) setSaleStart(toLocalStr(now));
        const tmrw = new Date(now);
        tmrw.setDate(tmrw.getDate() + 1);
        tmrw.setHours(23, 59, 0, 0);
        if (!saleEnd) setSaleEnd(toLocalStr(tmrw));
      }

      // ??ï¿??ï¿½ï¿½ ?ï¿????Ÿğ¦š??è«¢å¶…ï¿?
      const saved = localStorage.getItem('nao3_staging_items');
      if (saved) {
        try { setItems(JSON.parse(saved)); } catch (e) { console.error(e); }
      }

      const savedBossMsg = localStorage.getItem('nao3_boss_message');
      if (savedBossMsg !== null && savedBossMsg !== undefined) {
        setBossMessage(savedBossMsg);
      } else if (isAppendingToActive && latestPush?.boss_message) {
        setBossMessage(latestPush.boss_message);
      }

      fetchHistories();
    };

    loadInitData();
  }, []);

  // items, bossMessage ?ï¿½ï¿½ç©ˆï¿½ è²ï¿½çª¶è¶Ÿï¿??ğ£•‘ï¿??è«??°è³‘ ?æ¬ ï¿½è¬”ç§‘? ?ï¿½ã«²?æ¸£ä‚»
  useEffect(() => {
    localStorage.setItem('nao3_staging_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('nao3_boss_message', bossMessage);
  }, [bossMessage]);

  // è«ˆæ‹˜ï¿??é»ºğ?? ??’ï¿½ é´å£ï¿????¿½
  const handleAddItem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItem.product_name.trim() || !newItem.sale_price.trim()) {
      alert('?ï¿½ï¿½è«ˆï¿½???è³„ğ¦‰?ç©ˆï¿½çª¶æ‹–? ?ï¿½ï¿½?ï¿½ï¿½??');
      return;
    }

    const rawPrice = newItem.sale_price.replace(/[^0-9]/g, '');
    const formattedPrice = rawPrice ? parseInt(rawPrice, 10).toLocaleString() + '?? : '';

    if (editingHistoryItemId) {
      // é´å£ï¿????¿½ è«ˆåˆºï¿?
      try {
        const { error } = await supabase.from('nao3_sale_items')
          .update({ 
            product_name: newItem.product_name, 
            quantity: newItem.quantity, 
            sale_price: formattedPrice,
            category: activeTab
          })
          .eq('id', editingHistoryItemId.itemId);
          
        if (error) throw error;
        
        // è«??°è³‘ ?ï¿½ï¿½ é´å£ï¿?ç©ˆæ¡¿ï¿?
        setHistories(prev => prev.map(h => h.id === editingHistoryItemId.pushId ? {
          ...h,
          nao3_sale_items: h.nao3_sale_items.map((i: any) => i.id === editingHistoryItemId.itemId ? {
            ...i,
            category: activeTab,
            product_name: newItem.product_name,
            quantity: newItem.quantity,
            sale_price: formattedPrice
          } : i)
        } : h));
        
        setEditingHistoryItemId(null);
      } catch (err) {
        alert('?æ¸ ï¿½ ???¿½???æ¬ ğ¤”?ï¿½ğ ½?ï¿½ğ ¹?');
        return;
      }
    } else {
      // ?æ½ºï¿½ ?ï¿½ç??Ÿğ¡¢?é»ºğ?? è«ˆåˆºï¿?
      const insertData = { 
        id: Date.now().toString(),
        category: activeTab, 
        product_name: newItem.product_name, 
        quantity: newItem.quantity, 
        sale_price: formattedPrice,
        is_sold_out: false
      };
      setItems([...items, insertData]);
    }

    setNewItem({ product_name: '', quantity: '', sale_price: '' });
    setNameIdx(-1);
    setQtyIdx(-1);
  };

  // ???¿½ ç¯£åœ‰ğ¥’ (???æ½°å°è«??åµ¸ğ©¸??°è¼)
  const handleEditItem = (item: any) => {
    setNewItem({ 
      product_name: item.product_name, 
      quantity: item.quantity, 
      sale_price: item.sale_price.replace(/[^0-9]/g, '') 
    });
    setActiveTab(item.category);
    handleRemoveItem(item.id); // ?æ½°å°è«??åµ¸ğ©¸?ç¦ºæ”¶è«°æ¸¥ï¿?ç¯£åŸŸ??è¬”ç§‘??è³„ï¿½?å¶…ï¿½ ?ğ¨ˆ??
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ??ï¿?ç¯£åœ‰ğ¥’
  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // ?æ¸ ï¿½ ?ï¿½ï¿½ éº?ª???æ¸¥ï¿½ (é´å£ï¿?è«»ä¯ï¿?
  const handleHistoryToggleSoldOut = async (pushId: string, itemId: string, currentSoldOut: boolean) => {
    try {
      const { error } = await supabase.from('nao3_sale_items').update({ is_sold_out: !currentSoldOut }).eq('id', itemId);
      if (error) throw error;
      setHistories(prev => prev.map(h => h.id === pushId ? {
        ...h,
        nao3_sale_items: h.nao3_sale_items.map((i: any) => i.id === itemId ? { ...i, is_sold_out: !currentSoldOut } : i)
      } : h));
    } catch (err) {
      alert('?ï¿½ï¿½ ?ï¿½ï¿½ ?ï¿½ã«²?æ¸£ä‚»???æ¬ ğ¤”?ï¿½ğ ½?ï¿½ğ ¹?');
    }
  };

  // ?æ¸ ï¿½ ?ï¿½ğ¦š????ï¿?(é´å£ï¿?è«»ä¯ï¿?
  const handleHistoryDeleteItem = async (pushId: string, itemId: string) => {
    if (!confirm('??…ï¿½ ??ï¿???¿½çª¶ğ¥”±ğ ½?ï¿½ï¿½? é´å£ï¿?è«»ä¯ï¿??˜ï¿½??')) return;
    try {
      const { error } = await supabase.from('nao3_sale_items').delete().eq('id', itemId);
      if (error) throw error;
      setHistories(prev => prev.map(h => h.id === pushId ? {
        ...h,
        item_count: h.item_count - 1,
        nao3_sale_items: h.nao3_sale_items.filter((i: any) => i.id !== itemId)
      } : h));
    } catch (err) {
      alert('??ï¿???æ¬ ğ¤”?ï¿½ğ ½?ï¿½ğ ¹?');
    }
  };

  // ?æ¸ ï¿½ ?ï¿½ğ¦š?????¿½ (?æ½°å°è«??åµ¸ğ©¸?ç¦ºæ±)
  const handleHistoryEditItem = (pushId: string, item: any) => {
    setEditingHistoryItemId({ pushId, itemId: item.id });
    setActiveTab(item.category || '?ã»‚ãœœ');
    setNewItem({ 
      product_name: item.product_name, 
      quantity: item.quantity, 
      sale_price: item.sale_price.replace(/[^0-9]/g, '')
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ç¯£åœ‹ï¿?è«??ç§‘ğ¤Ÿ???æ¸¥ç„©ç¯?é´å£ï¿?è«»ä¯ï¿?è²’ï¿½ğ¢©¦
  const handleQuickSaveSettings = async () => {
    if (!saleStart || !saleEnd) {
      alert('?è³„ğ¦‰??ğ¨°°ï¿?æ¾é ƒ é®ˆï¿½ï¿?æ½°ï¿½ ?ï¿½ï¿½?æ¸¥Ë?è³„ï¿½.');
      return;
    }
    setLoading(true);
    try {
      // 1. ç©ˆï¿½çª??ï¿½çŒ¹è«??ï¿½ã«²?æ¸£ä‚»
      const { data: updatedStore, error: storeError } = await supabase
        .from('nao3_stores')
        .update({ store_name: storeName })
        .eq('id', storeId)
        .select();
      
      if (storeError || !updatedStore || updatedStore.length === 0) {
        console.error('?ï¿½çŒ¹è«??ï¿½ã«²?æ¸£ä‚» ?æ¬ ğ¤”?', storeError);
        alert('?ï¿½çŒ¹è«????¿½ çª·é¾²ï¿???ï¿½ğ ½?ï¿½ğ ¹? (RLS ??’å‰³)');
        return;
      }

      // 2. ç©ˆï¿½??é»–ğ¨ˆæ»‚ è«»ğ?°ï¿½ ?æ¸ ï¿½??ç¯£åœ‹ï¿?è«??ç§‘ğ¤Ÿ??è«°å±???ï¿½ã«²?æ¸£ä‚»
      const { data: latestPush } = await supabase
        .from('nao3_push_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      const newStart = new Date(saleStart).toISOString();
      const newEnd = new Date(saleEnd).toISOString();

      if (latestPush) {
        const { data: updatedData, error } = await supabase.from('nao3_push_history').update({
          sale_start: newStart,
          sale_end: newEnd,
          boss_message: bossMessage.trim() || null
        }).eq('id', latestPush.id).select();
        
        if (error) throw error;
        if (!updatedData || updatedData.length === 0) {
           throw new Error("è²æ¸¥ï¿??ã»‚ï¿½(RLS) è«¡è³„ï¿½è«¢??ï¿½ã«²?æ¸£ä‚»ç©ˆï¿½ éº†åˆºğ¡????¿½??Ÿï¿½?? ?ğ¨ˆ??æ¸ ï¿½è¬?SQL??Supabase?? ï¿½ ?æ¬ ï¿½?æ¸¥Ë?è³„ï¿½!");
        }
        alert('é´”ï¿½ï¿?é´—ğ¡¢¾ğ¥˜??è³„ğ¦‰??ç¯£åœ‹ï¿½çª¸??ç§‘ğ¤Ÿ???æ¸¥ç„©ç¯£åœ‹? é´å£ï¿?è«»ä¯ï¿???¿½??Ÿï¿½??');
      } else {
        alert('?ï¿½ï¿½ ?æ¢µï¿½???è³„ğ¦‰??æ¸¥ğ¡¡???ï¿½ğ ½?ï¿½ğ ¹? è«Ÿæ½°? ?ï¿½ï¿½çª???·ï¿½ ??ªğ¡†€ è²’ï¿½ğ¢©¦?æ½ºï¿½ ?æ¢µï¿½?æ¸¥Ë?è³„ï¿½.');
      }
    } catch (err: any) {
      console.error(err);
      alert('DB ?ï¿????ˆï¿½: ' + (err.message || '?åµ¸ğ¦š?³³?è«??¢ç¦º????–ï¿½???ã»‚ğ¥˜?æ¸¥Ë?è³„ï¿½.'));
    } finally {
      setLoading(false);
    }
  };
  // é»–ğ?°ï¿½ ?ï¿½ï¿½ è²’ï¿½ğ¢©¦
  const handleSave = async () => {
    const validItems = items.filter(item => item.product_name && item.sale_price);

    // ?ï¿½ï¿½???ï¿½ï¿½?æ½ºï¿½ è²æ¸¥??è«°ä‡¹ï¿½é´”ï¿??ç¯£åœ‹ï¿½è«¤??ï¿½ã«²?æ¸£ä‚»??ªï¿½ çª¶è¶£é»±è«??ï¿½é¹»??˜è¼ ?ï¿½ãŸ² ?ğ¡¥„è¾??çª¶ï¿½?ç¦? ???¿½?æ½ºï¿½ è«?³ˆ??
    if (!saleStart || !saleEnd) {
      alert('?è³„ğ¦‰??ğ¨°°ï¿?æ¾é ƒ é®ˆï¿½ï¿?æ½°ï¿½ ?ï¿½ï¿½?æ¸¥Ë?è³„ï¿½.');
      return;
    }

    setLoading(true);
    try {
      // 1. ç©ˆï¿½??é»–ğ¨ˆæ»‚ ?æ¸ ï¿½??ç©ˆï¿½?è³???ç¯£åœ‹ï¿?èµ¬ï¿½ï¿?
      const { data: latestPush } = await supabase
        .from('nao3_push_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const newStart = new Date(saleStart).toISOString();
      const newEnd = new Date(saleEnd).toISOString();

      let pushId = '';

      // è«¤åµ¸??è«»æŠ±ï¿??ï¿½ï¿½???è³„ğ¦‰?ç¯£åœ‹ï¿??é»–ğ¨ˆæ»‚ ?æ¢µï¿½???æ¸ ï¿½??ç¯£åœ‹ï¿½çª¸??ğ¤£¿ï¿???æ½°ï¿½?å¶…ğ ¹»è«°? (?è»¤ğ¦‰??è³„ğ¦‰?ç¯è³ˆ??æ½ºï¿½ ç©ˆï¿½?)
      const isSamePeriod = latestPush && 
        new Date(latestPush.sale_start).getTime() === new Date(newStart).getTime() && 
        new Date(latestPush.sale_end).getTime() === new Date(newEnd).getTime();

      if (isSamePeriod) {
        // ç¯£åŸŸ??ç¯è³ˆ???é»ºğ?? (?ï¿½ã«²?æ¸£ä‚»)
        pushId = latestPush.id;
        const { data: updatedData, error: updateError } = await supabase.from('nao3_push_history').update({
          item_count: latestPush.item_count + validItems.length,
          boss_message: bossMessage.trim() || null
        }).eq('id', pushId).select();
        
        if (updateError) throw updateError;
        if (!updatedData || updatedData.length === 0) {
           throw new Error("è²æ¸¥ï¿??ã»‚ï¿½(RLS) è«¡è³„ï¿½è«¢??ï¿½ã«²?æ¸£ä‚»ç©ˆï¿½ éº†åˆºğ¡????¿½??Ÿï¿½?? ?ğ¨ˆ??æ¸ ï¿½è¬?SQL??Supabase?? ï¿½ ?æ¬ ï¿½?æ¸¥Ë?è³„ï¿½!");
        }
      } else {
        // ?ï¿½ï¿½???ï¿½ï¿½??ç¯£åœ‹ï¿?æ¸?è«??ï¿½ï¿½???è³„ğ¦‰?ç¯è³ˆ????–ï¿½
        const { data: historyData, error: historyError } = await supabase
          .from('nao3_push_history')
          .insert([{ store_id: storeId, 
            item_count: validItems.length,
            sale_start: newStart,
            sale_end: newEnd,
            boss_message: bossMessage.trim() || null
          }])
          .select()
          .single();

        if (historyError) throw historyError;
        pushId = historyData.id;
      }

      // è«»ğ¨ˆè«»?? push_idè«??ğ¦š¯???æ¾?Insert
      if (validItems.length > 0) {
        const dbPayload = validItems.map(item => ({
          category: item.category,
          product_name: item.product_name,
          quantity: item.quantity,
          sale_price: item.sale_price,
          is_sold_out: item.is_sold_out || false,
          push_id: pushId
        }));

        const { error: itemsError } = await supabase.from('nao3_sale_items').insert(dbPayload);
        if (itemsError) throw itemsError;
      }

      // 3. ?æ¢“é™¬ ????Ÿğ¦š??ç©ˆæ¡¿
      setItems([]); // ?ç¯£åŸŸğ¡¢¿ é»•è¼??(?è«?èµ?, ç¯£åœ‹çª?è«°å±????ğ¥”±????¤©?é»ºğ?? ?æ¢????? è«»æ‹–?)
      localStorage.removeItem('nao3_staging_items');
      await fetchHistories(); 
      setSubmitted(true);
      
    } catch (err: any) {
      console.error(err);
      alert('DB ?????? ' + (err.message || '?åµ¸ğ¦š?³³?è«??¢ç¦º???????ã»‚ğ¥˜?æ¸¥Ë?è³?'));
    } finally {
      setLoading(false);
    }
  };

  const currentItems = items;
  const totalItemsCount = items.length;

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#F9F9F9] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full animate-fade-in-up">
          <div className="w-16 h-16 bg-[#5F0080]/10 text-[#5F0080] rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">?ï¿?/span>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">?æ¢µï¿½???ï¿½ï¿½???¿½??Ÿï¿½??/h2>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            ?è³„ğ¦‰??ï¿½ç‰ˆ???æ¢“é™¬?ï¿½å°è«?è«»ğ?°ï¿½ ?æ¸ ï¿½???ï¿?ä¼™ï¿½?ï¿½ğ ½?ï¿½ğ ¹?<br/>
            çª¸ğ?—ï¿½ ???¦š?´”ï¿??é»–ğ?°ï¿½ ?ï¿½ğ¡†€é´”ï¿½ç©ˆï¿½ é´å£ï¿?è«»ä¯ï¿??˜ï¿½??
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full py-4 bg-[#5F0080] hover:bg-[#4a0066] text-white font-bold rounded-2xl transition-all shadow-md"
          >
            ?ï¿½ï¿½???ï¿½ç‰ˆ é»ºğ????˜è¼
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#F9F9F9] min-h-screen pb-32">
      {/* ?ï¿½ğ¡†€ ?ï¿½ğ¡¡? ??ˆï¿½ + ??+ ?ï¿½ï¿½??(?æ¬ ï¿½è«????? ãœŠ??ˆç±°çª??ç¦ºğ¦‰˜ç©ˆï¿?ï¿½ï¿½ sticky ?ğ¨ˆ?? */}
      <div className="bg-white shadow-sm flex flex-col border-b border-gray-200">
        
        {/* ??ˆï¿½ */}
        <div className="bg-white p-4 border-b border-gray-100 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-[#5F0080] tracking-tight">Nao3</h1>
          <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-md">?ï¿½ã?è«¤ï¿½ï¿??æ¸ ï¿½è«?/span>
        </div>
        <button 
          onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}
          className="text-xs text-gray-500 hover:text-gray-800 underline"
        >
          è«?¨ˆæº¢?ï¿½ï¿½
        </button>
      </div>

        {/* ?ï¿½ğ¡†€ 1??2??çª¸ğ¥”±ï¿½ ?ï¿½ğ¡¡? ?ï¿½çŒ¹è«? ?è³„ğ¦‰?ç¯£åœ‹ï¿?& ?ç§‘ğ¤Ÿ???æ¸¥ç„©ç¯?*/}
        <div className="max-w-2xl mx-auto w-full p-4 bg-[#F9F9F9] border-b border-gray-200 flex flex-col gap-4">
          
          {/* ?ï¿½çŒ¹è«???¨ï¿½ */}
          <div>
            <h3 className="text-[13px] font-bold text-gray-800 mb-2 flex items-center gap-1.5">
              ?????‰æ”¶ è«¤æœ¨ğ¤Ÿ  ?ï¿½çŒ¹è«?            </h3>
            <input 
              type="text" 
              value={storeName} 
              onChange={e => setStoreName(e.target.value)} 
              placeholder="?? ??‰æ”¶?è»?¿½ ?ğ¥”±ğ¥˜µè«¤ï¿½??
              className="w-full text-[13px] font-bold text-[#5F0080] border border-gray-200 px-3 py-2 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#5F0080]" 
            />
          </div>

          {/* 1?? ?è³„ğ¦‰?é´”ï¿½ï¿?ç¯£åœ‹ï¿?*/}
          <div>
            <h3 className="text-[13px] font-bold text-gray-800 mb-2 flex items-center gap-1.5">
              ?ï¿½å„­??æ¸ ï¿½ ?è³„ğ¦‰?é´”ï¿½ï¿?ç¯£åœ‹ï¿?
            </h3>
            <div className="flex items-center justify-between gap-2">
              <input 
                type="datetime-local" 
                value={saleStart} 
                onChange={e => setSaleStart(e.target.value)} 
                className="flex-1 text-[12px] font-bold text-[#5F0080] border border-gray-200 px-2 py-1.5 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#5F0080]" 
              />
              <span className="text-gray-400 font-bold">~</span>
              <input 
                type="datetime-local" 
                value={saleEnd} 
                onChange={e => setSaleEnd(e.target.value)} 
                className="flex-1 text-[12px] font-bold text-[#5F0080] border border-gray-200 px-2 py-1.5 rounded bg-white focus:outline-none focus:ring-1 focus:ring-[#5F0080]" 
              />
            </div>
          </div>
          
          {/* 2?? ?ç§‘ğ¤Ÿ???æ¸¥ç„©ç¯?*/}
          <div className="flex flex-col gap-2">
            <h3 className="text-[13px] font-bold text-gray-800 flex items-center gap-1.5">
              ?è¢???ˆï¿½???ç§‘ğ¤Ÿ???æ¸¥ç„©ç¯?            </h3>
            <textarea
              value={bossMessage}
              onChange={e => setBossMessage(e.target.value)}
              placeholder="?? ?æ¸ é‚ª??ªã¨©~ ??ˆï¿½ ??¨ğ©¸???ğ¨°°é»??ï¿½ç‚­ é®ˆé—¨?½Œ?ï¿½ğ ¹? ?è³ˆğ¥???? ˆ?è³„ï¿½~"
              className="w-full bg-[#5F0080]/5 border border-[#5F0080]/15 rounded-lg px-3 py-2 text-[13px] text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#5F0080] min-h-[60px] resize-y placeholder:text-gray-400"
            />
            <button
              onClick={handleQuickSaveSettings}
              disabled={loading}
              className="w-full py-2 bg-purple-50 text-[#5F0080] border border-purple-100 hover:bg-purple-100 font-bold rounded-lg transition-colors text-[13px]"
            >
              ?ï¿½çŒ¹è«?ç¹?ç¯£åœ‹ï¿?ç¹?è«°å±??é´å£ï¿?è«»ä¯ï¿??˜è¼
            </button>
          </div>
        </div>
        
        {/* ??¸£ï¿½çª¸ğ§™–????*/}
        <div className="max-w-2xl mx-auto w-full flex border-b border-gray-100">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleTabChange(cat.id)}
              className={`flex-1 py-2 text-[12px] font-bold flex flex-col items-center gap-1 relative transition-colors ${
                activeTab === cat.id ? 'text-[#5F0080]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-lg leading-none">{cat.icon}</span>
              <span>{cat.id}</span>
              {activeTab === cat.id && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#5F0080]" />}
            </button>
          ))}
        </div>

        {/* ??°ğ¦‰?çª¸ğ¥”±ï¿½ ?ï¿½ï¿½ ??(?ç¦ºæ±?? */}
        <div className="max-w-2xl mx-auto w-full p-3 bg-white">
          <form onSubmit={handleAddItem} className="flex flex-col gap-2">
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="?ï¿½ï¿½è«?(é»•ï¿½ï¿?çª¶ï¿½??é´”ï¿½?? ?? ?æ±¿ï¿½)"
                value={newItem.product_name}
                onFocus={() => setShowNameDropdown(true)}
                onBlur={() => setTimeout(() => { setShowNameDropdown(false); setNameIdx(-1); }, 200)}
                onChange={e => {
                  setNewItem({...newItem, product_name: e.target.value});
                  setNameIdx(-1);
                  setShowNameDropdown(true);
                }}
                onKeyDown={(e) => {
                  if (!showNameDropdown || matchedNames.length === 0) return;
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setNameIdx(prev => (prev < matchedNames.length - 1 ? prev + 1 : prev));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setNameIdx(prev => (prev > 0 ? prev - 1 : 0));
                  } else if (e.key === 'Enter' && nameIdx >= 0) {
                    e.preventDefault();
                    setNewItem({...newItem, product_name: matchedNames[nameIdx]});
                    setShowNameDropdown(false);
                    setNameIdx(-1);
                  } else if (e.key === 'Escape') {
                    setShowNameDropdown(false);
                  }
                }}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#5F0080]"
              />
              {/* ?ï¿½ï¿½è«???’ï¿½?ï¿½ï¿½ ?å¶…ï¼ƒ??¨ğ ‚?*/}
              {showNameDropdown && matchedNames.length > 0 && (
                <ul className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {matchedNames.map((name, index) => (
                    <li 
                      key={name}
                      id={`name-item-${index}`}
                      onClick={() => {
                        setNewItem({...newItem, product_name: name});
                        setShowNameDropdown(false);
                      }}
                      className={`px-3 py-2 text-sm cursor-pointer border-b border-gray-100 last:border-0 ${
                        index === nameIdx ? 'bg-[#5F0080]/10 text-[#5F0080] font-bold' : 'text-gray-700 hover:bg-[#5F0080]/5 hover:text-[#5F0080]'
                      }`}
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="é´—ç‚£ï¿?(é»•ï¿½ï¿?çª¶ï¿½??"
                  value={newItem.quantity}
                  onFocus={() => setShowQtyDropdown(true)}
                  onBlur={() => setTimeout(() => { setShowQtyDropdown(false); setQtyIdx(-1); }, 200)}
                  onChange={e => {
                    setNewItem({...newItem, quantity: e.target.value});
                    setQtyIdx(-1);
                    setShowQtyDropdown(true);
                  }}
                  onKeyDown={(e) => {
                    if (!showQtyDropdown || matchedQtys.length === 0) return;
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setQtyIdx(prev => (prev < matchedQtys.length - 1 ? prev + 1 : prev));
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setQtyIdx(prev => (prev > 0 ? prev - 1 : 0));
                    } else if (e.key === 'Enter' && qtyIdx >= 0) {
                      e.preventDefault();
                      setNewItem({...newItem, quantity: matchedQtys[qtyIdx]});
                      setShowQtyDropdown(false);
                      setQtyIdx(-1);
                    } else if (e.key === 'Escape') {
                      setShowQtyDropdown(false);
                    }
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#5F0080]"
                />
                {/* é´—ç‚£ï¿???’ï¿½?ï¿½ï¿½ ?å¶…ï¼ƒ??¨ğ ‚?*/}
                {showQtyDropdown && matchedQtys.length > 0 && (
                  <ul className="absolute top-full left-0 right-0 mt-1 max-h-40 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {matchedQtys.map((qty, index) => (
                      <li 
                        key={qty}
                        id={`qty-item-${index}`}
                        onClick={() => {
                          setNewItem({...newItem, quantity: qty});
                          setShowQtyDropdown(false);
                        }}
                        className={`px-3 py-2 text-sm cursor-pointer border-b border-gray-100 last:border-0 ${
                          index === qtyIdx ? 'bg-[#5F0080]/10 text-[#5F0080] font-bold' : 'text-gray-700 hover:bg-[#5F0080]/5 hover:text-[#5F0080]'
                        }`}
                      >
                        {qty}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <input 
                type="text" 
                placeholder="?è³„ğ¦‰?ç©ˆï¿½çª?
                value={newItem.sale_price}
                onChange={e => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setNewItem({...newItem, sale_price: raw});
                }}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-[14px] font-bold text-[#5F0080] placeholder:text-gray-400 placeholder:font-normal focus:outline-none focus:ring-1 focus:ring-[#5F0080]"
              />
            </div>
            <div className="flex gap-2">
              <button 
                type="submit"
                className={`flex-1 py-2 font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${editingHistoryItemId ? 'bg-[#5F0080] text-white' : 'bg-white border border-[#5F0080] text-[#5F0080] hover:bg-[#5F0080]/5'}`}
              >
                {editingHistoryItemId ? '?????¿½ ?ï¿½ï¿½ (é´å£ï¿?è«»ä¯ï¿?' : <><span className="text-lg leading-none">+</span> é»ºğ????˜è¼</>}
              </button>
              {editingHistoryItemId && (
                <button 
                  type="button"
                  onClick={() => {
                    setEditingHistoryItemId(null);
                    setNewItem({ product_name: '', quantity: '', sale_price: '' });
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  é¼’åˆ°ï¿?
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* ?æ¢µï¿½???ï¿½ç‰ˆ è¬”ç§‘???(?¢æ¸£???è³? */}
      <div className="max-w-2xl mx-auto p-3 pt-4 pb-6">
        <div className="flex justify-between items-end mb-2 px-1">
          <h3 className="text-sm font-bold text-gray-700">?ï¿½ï¿½???è³„ğ¦‰??è³„ï¿½ ?æ¢µï¿½ ?ï¿½ç??Ÿğ¡¢?/h3>
          <span className="text-[11px] font-bold text-[#5F0080] bg-[#5F0080]/10 px-2 py-0.5 rounded-full">
            {currentItems.length}ç©?          </span>
        </div>

        {currentItems.length === 0 ? (
          <div className="bg-white py-8 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
            <span className="text-2xl opacity-50 block mb-2">?ï¿?/span>
            <p className="text-[12px]">???æ½°ï¿½???ï¿½ï¿½???ï¿½ï¿½??é´¥æ½°ï¿??</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {currentItems.map((item) => (
              <div key={item.id} className={`flex flex-col bg-white rounded-lg border px-3 py-2.5 shadow-sm relative overflow-hidden transition-all border-gray-200`}>
                
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                    <span className="text-[10px] font-bold text-[#5F0080] border border-[#5F0080]/20 bg-[#5F0080]/5 px-1.5 py-0.5 rounded flex-shrink-0">
                      {item.category}
                    </span>
                    <span className="text-[14px] font-bold text-gray-800 truncate">{item.product_name}</span>
                    <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">{item.quantity}</span>
                  </div>
                  <span className={`text-[15px] font-black flex-shrink-0 text-[#5F0080]`}>
                    {item.sale_price}
                  </span>
                </div>

                <div className="flex justify-end items-center pt-2 border-t border-gray-100">
                  <div className="flex gap-1.5">
                    <button 
                      type="button"
                      onClick={() => handleEditItem(item)}
                      className="text-[11px] font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      ???¿½
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-[11px] font-bold px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      ??ï¿?
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ?è³ˆğ¦‰???ï¿??è²’ï¿½ğ¢©¦ (?ï¿½ç??Ÿğ¡¢?è«»ç«¾ï¿??ï¿½ï¿½ ?ï¿½ï¿½) */}
        <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between gap-4">
          <div className="flex flex-col pl-1">
            <span className="text-[11px] text-[#5F0080]/70 font-semibold">é»??æ¢µï¿½ ?ï¿½ç??/span>
            <span className="text-xl font-extrabold text-[#5F0080] leading-none">{totalItemsCount}ç©?/span>
          </div>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3.5 bg-[#5F0080] hover:bg-[#4a0066] disabled:bg-gray-300 text-white font-bold rounded-xl transition-all shadow-sm disabled:shadow-none text-sm"
          >
            {loading ? '?ï¿??é´?..' : '?è³„ğ¦‰??è³„ï¿½ ?æ¢µï¿½ ?ï¿½ï¿½'}
          </button>
        </div>

      </div>

      {/* è«»ğ?°ï¿½ ?æ¸ ï¿½ ?å¯?¿½ */}
      <div className="max-w-2xl mx-auto p-3 pt-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3 px-1 flex items-center gap-1.5">
          ?ï¿?é´”ï¿½???è³„ğ¦‰?è«»ğ?°ï¿½ ?æ¸¥ğ¡¡?
        </h3>
        
        <div className="flex flex-col gap-3">
          {histories.map(history => {
            const dateObj = new Date(history.created_at);
            const dateStr = `${dateObj.getFullYear()}.${String(dateObj.getMonth() + 1).padStart(2, '0')}.${String(dateObj.getDate()).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
            const isExpanded = expandedHistory === history.id;
            
            return (
              <div key={history.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <button 
                  onClick={() => setExpandedHistory(isExpanded ? null : history.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-[14px] font-bold text-gray-800">{dateStr} è«»ğ?°ï¿½</span>
                    <span className="text-[11px] font-bold text-[#5F0080] bg-[#5F0080]/10 px-2 py-0.5 rounded-full">{history.item_count}ç©?/span>
                  </div>
                  <span className={`text-gray-400 text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>??/span>
                </button>
                
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/50">
                    {history.nao3_sale_items?.length > 0 ? (
                      history.nao3_sale_items.map((item: any) => (
                        <div key={item.id} className={`flex flex-col py-3 px-4 border-b border-gray-100/50 last:border-0 ${item.is_sold_out ? 'bg-gray-100/30' : ''}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                              <span className="text-[10px] text-[#5F0080] border border-[#5F0080]/20 bg-[#5F0080]/5 px-1 rounded flex-shrink-0">{item.category}</span>
                              <h4 className={`text-[13px] font-bold truncate ${item.is_sold_out ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item.product_name}</h4>
                              <span className="text-[11px] text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded flex-shrink-0">{item.quantity}</span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className={`text-[14px] font-bold ${item.is_sold_out ? 'text-red-400 line-through' : 'text-gray-900'}`}>{item.sale_price}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <button 
                              type="button"
                              onClick={() => handleHistoryToggleSoldOut(history.id, item.id, item.is_sold_out)}
                              className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-colors ${item.is_sold_out ? 'bg-red-500 text-white border-red-500' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                            >
                              {item.is_sold_out ? '?ï¿½ï¿½ ?æ¸¥ï¿½' : '?ï¿½ï¿½ éº?ª??}
                            </button>
                            <div className="flex gap-1.5">
                              <button 
                                type="button"
                                onClick={() => handleHistoryEditItem(history.id, item)}
                                className="text-[11px] font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                ???¿½
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleHistoryDeleteItem(history.id, item.id)}
                                className="text-[11px] font-bold px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                ??ï¿?
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-400">?ï¿½ï¿½ ?ï¿½ç‰ˆ ??Ÿğ¦š??? ?ï¿½ğ ½?ï¿½ğ ¹?</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {histories.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-300 rounded-xl bg-white">
              ?ï¿½ï¿½ è«»ğ?°ï¿½???æ¸¥ğ¡¡???ï¿½ğ ½?ï¿½ğ ¹?
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
