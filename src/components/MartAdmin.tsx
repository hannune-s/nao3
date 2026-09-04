"use client";
import { us<div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100 flex flex-col gap-3">
            <div className="flex justify-between items-center pl-1">
              <span className="text-[12px] text-[#5F0080]/70 font-bold">총 등록 대기 상품</span>
              <span className="text-xl font-extrabold text-[#5F0080] leading-none">{totalItemsCount}건</span>
            </div>
            <div className="flex gap-2 w-full">
              <button 
                type="button"
                onClick={handlePreview}
                className="flex-1 py-3.5 bg-white border border-[#5F0080] text-[#5F0080] font-bold rounded-xl transition-all shadow-sm text-[14px]"
              >
                미리보기
              </button>
              <button 
                type="button"
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-3.5 bg-[#5F0080] hover:bg-[#4a0066] disabled:bg-gray-300 text-white font-bold rounded-xl transition-all shadow-sm disabled:shadow-none text-[14px]"
              >
                {loading ? '저장 중...' : '푸시 등록'}
              </button>
            </div>
          </div><div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-center justify-between gap-4">
          <div className="flex flex-col pl-1">
            <span className="text-[11px] text-[#5F0080]/70 font-semibold">총 등록 대기</span>
            <span className="text-xl font-extrabold text-[#5F0080] leading-none">{totalItemsCount}건</span>
          </div>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3.5 bg-[#5F0080] hover:bg-[#4a0066] disabled:bg-gray-300 text-white font-bold rounded-xl transition-all shadow-sm disabled:shadow-none text-sm"
          >
            {loading ? '저장 중...' : '세일 푸시 등록 완료'}
          </button>
        </div>

      </div>

      {/* 발송 이력 섹션 */}
      <div className="max-w-2xl mx-auto p-3 pt-6">
        <h3 className="text-sm font-bold text-gray-700 mb-3 px-1 flex items-center gap-1.5">
          🕒 지난 세일 발송 내역
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
                    <span className="text-[14px] font-bold text-gray-800">{dateStr} 발송</span>
                    <span className="text-[11px] font-bold text-[#5F0080] bg-[#5F0080]/10 px-2 py-0.5 rounded-full">{history.item_count}건</span>
                  </div>
                  <span className={`text-gray-400 text-sm transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
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
                              {item.is_sold_out ? '품절 해제' : '품절 처리'}
                            </button>
                            <div className="flex gap-1.5">
                              <button 
                                type="button"
                                onClick={() => handleHistoryEditItem(history.id, item)}
                                className="text-[11px] font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                              >
                                수정
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleHistoryDeleteItem(history.id, item.id)}
                                className="text-[11px] font-bold px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                삭제
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-sm text-gray-400">상세 품목 데이터가 없습니다.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {histories.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-300 rounded-xl bg-white">
              아직 발송된 내역이 없습니다.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
