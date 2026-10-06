import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-[#5F0080] p-6 text-white text-center">
          <Link href="/" className="inline-block mb-2 text-purple-200 hover:text-white transition-colors text-sm font-bold">
            ← 메인으로 돌아가기
          </Link>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">이용약관</h1>
        </div>
        
        <div className="p-6 md:p-10 h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="prose prose-sm md:prose-base max-w-none text-gray-700">
            <h3 className="text-lg font-bold text-gray-900 mt-0">제 1 조 (목적)</h3>
            <p>이 약관은 (주)한누네(이하 "회사"라 합니다)가 제공하는 NAO3 서비스(이하 "서비스"라 합니다)의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.</p>
            
            <h3 className="text-lg font-bold text-gray-900 mt-6">제 2 조 (정의)</h3>
            <p>이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>"서비스"라 함은 구현되는 단말기와 상관없이 "회원"이 이용할 수 있는 NAO3 관련 제반 서비스를 의미합니다.</li>
              <li>"회원"이라 함은 회사의 "서비스"에 접속하여 이 약관에 따라 "회사"와 이용계약을 체결하고 "회사"가 제공하는 "서비스"를 이용하는 고객을 말합니다.</li>
              <li>"아이디(ID)"라 함은 "회원"의 식별과 "서비스" 이용을 위하여 "회원"이 정하고 "회사"가 승인하는 문자와 숫자의 조합(이메일 주소 등)을 의미합니다.</li>
              <li>"비밀번호"라 함은 "회원"이 부여 받은 "아이디와 일치되는 "회원"임을 확인하고 비밀보호를 위해 "회원" 자신이 정한 문자 또는 숫자의 조합을 의미합니다.</li>
              <li>"유료서비스"라 함은 "회사"가 유료로 제공하는 각종 온라인디지털콘텐츠 및 제반 서비스를 의미합니다.</li>
            </ol>

            <h3 className="text-lg font-bold text-gray-900 mt-6">제 3 조 (약관의 게시와 개정)</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>"회사"는 이 약관의 내용을 "회원"이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</li>
              <li>"회사"는 "약관의 규제에 관한 법률", "정보통신망 이용촉진 및 정보보호 등에 관한 법률(이하 "정보통신망법")" 등 관련법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
              <li>"회사"가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 제1항의 방식에 따라 그 개정약관의 적용일자 7일 전부터 적용일자 전일까지 공지합니다.</li>
              <li>"회사"가 전항에 따라 개정약관을 공지 또는 통지하면서 회원에게 7일 기간 내에 의사표시를 하지 않으면 의사표시가 표명된 것으로 본다는 뜻을 명확하게 공지 또는 통지하였음에도 회원이 명시적으로 거부의 의사표시를 하지 아니한 경우 회원이 개정약관에 동의한 것으로 봅니다.</li>
            </ol>

            <h3 className="text-lg font-bold text-gray-900 mt-6">제 4 조 (이용계약 체결)</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>이용계약은 "회원"이 되고자 하는 자(이하 "가입신청자")가 약관의 내용에 대하여 동의를 한 다음 회원가입신청을 하고 "회사"가 이러한 신청에 대하여 승낙함으로써 체결됩니다.</li>
              <li>"회사"는 "가입신청자"의 신청에 대하여 "서비스" 이용을 승낙함을 원칙으로 합니다. 다만, "회사"는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.</li>
              <ul className="list-disc pl-5 mt-2">
                <li>가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                <li>허위의 정보를 기재하거나, "회사"가 제시하는 내용을 기재하지 않은 경우</li>
              </ul>
            </ol>

            <h3 className="text-lg font-bold text-gray-900 mt-6">제 5 조 (회원정보의 변경)</h3>
            <p>회원은 개인정보관리화면을 통하여 언제든지 본인의 개인정보를 열람하고 수정할 수 있습니다. 회원은 회원가입신청 시 기재한 사항이 변경되었을 경우 온라인으로 수정을 하거나 전자우편 기타 방법으로 "회사"에 대하여 그 변경사항을 알려야 합니다.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-6">제 6 조 (개인정보보호 의무)</h3>
            <p>"회사"는 "정보통신망법" 등 관계 법령이 정하는 바에 따라 "회원"의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 사용에 대해서는 관련법 및 "회사"의 개인정보처리방침이 적용됩니다.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-6">제 7 조 (회원의 아이디 및 비밀번호의 관리에 대한 의무)</h3>
            <p>"회원"의 "아이디"와 "비밀번호"에 관한 관리책임은 "회원"에게 있으며, 이를 제3자가 이용하도록 하여서는 안 됩니다. "회원"은 "아이디" 및 "비밀번호"가 도용되거나 제3자가 사용하고 있음을 인지한 경우에는 이를 즉시 "회사"에 통지하고 "회사"의 안내에 따라야 합니다.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-6">제 8 조 (회원에 대한 통지)</h3>
            <p>"회사"가 "회원"에 대한 통지를 하는 경우 이 약관에 별도 규정이 없는 한 서비스 내 전자우편주소, 전자쪽지 등으로 할 수 있습니다.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-6">제 9 조 (회사의 의무)</h3>
            <p>"회사"는 관련법과 이 약관이 금지하거나 미풍양속에 반하는 행위를 하지 않으며, 계속적이고 안정적으로 "서비스"를 제공하기 위하여 최선을 다하여 노력합니다.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-6">제 10 조 (회원의 의무)</h3>
            <p>"회원"은 다음 행위를 하여서는 안 됩니다.</p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>신청 또는 변경 시 허위내용의 등록</li>
              <li>타인의 정보도용</li>
              <li>"회사"가 게시한 정보의 변경</li>
              <li>"회사"와 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
              <li>"회사" 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
            </ol>

            <h3 className="text-lg font-bold text-gray-900 mt-6">제 11 조 (서비스의 제공 등)</h3>
            <p>"회사"는 회원에게 아래와 같은 서비스를 제공합니다.</p>
            <ol className="list-decimal pl-5 mt-2">
              <li>모바일 전단지 생성 및 배포 서비스</li>
              <li>푸시 알림 발송 시스템</li>
              <li>기타 "회사"가 추가 개발하거나 제휴계약 등을 통해 제공하는 서비스</li>
            </ol>
            
            <h3 className="text-lg font-bold text-gray-900 mt-6">제 12 조 (서비스의 변경)</h3>
            <p>"회사"는 상당한 이유가 있는 경우에 운영상, 기술상의 필요에 따라 제공하고 있는 전부 또는 일부 "서비스"를 변경할 수 있습니다.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-6">제 13 조 (정보의 제공 및 광고의 게재)</h3>
            <p>"회사"는 "회원"이 "서비스" 이용 중 필요하다고 인정되는 다양한 정보를 공지사항이나 전자우편 등의 방법으로 "회원"에게 제공할 수 있습니다.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-6">제 14 조 (게시물의 저작권)</h3>
            <p>"회원"이 "서비스" 내에 게시한 게시물의 저작권은 해당 게시물의 저작자에게 귀속됩니다.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-6">제 15 조 (유료서비스의 청약철회 등)</h3>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li>"회사"와 "유료서비스" 이용계약을 체결한 "회원"은 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조에 따라 결제일로부터 7일 이내에 청약철회를 할 수 있습니다. 단, "회원"이 유료서비스를 이미 사용하였거나 혜택을 제공받은 경우에는 청약철회가 제한될 수 있습니다.</li>
              <li>"회사"는 전항의 청약철회가 불가능한 유료서비스의 경우 결제 화면 등에 그 사실을 명확하게 고지하거나 테스트용 서비스를 제공하는 등의 방법으로 청약철회 권리 행사가 방해받지 않도록 조치합니다.</li>
            </ol>

            <h3 className="text-lg font-bold text-gray-900 mt-6">제 16 조 (유료서비스의 계약해제 및 해지)</h3>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li>"회원"은 언제든지 "서비스" 내 관리 메뉴 또는 고객센터를 통하여 유료서비스 이용계약의 해지를 신청할 수 있으며, "회사"는 관련 법령이 정하는 바에 따라 신속하게 처리합니다.</li>
              <li>"회원"이 유료서비스를 중도 해지할 경우, 해지 신청일을 기준으로 잔여 이용기간에 비례하여 환불금액을 산정하되, 해지수수료(총 결제대금의 10%) 및 기 이용금액을 공제한 후 환불합니다. 단, 잔여 금액이 공제 금액보다 적을 경우 환불이 불가할 수 있습니다.</li>
            </ol>

            <h3 className="text-lg font-bold text-gray-900 mt-6">제 17 조 (환불 규정 및 절차)</h3>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li>"회사"는 "회원"으로부터 청약철회 또는 해지 신청을 받은 날로부터 3영업일 이내에 환불 사유를 확인하고 결제와 동일한 수단으로 결제대금을 환불합니다. 다만, 동일한 수단으로 환불이 불가능한 경우 "회사"는 이를 사전에 고지하고 다른 방법으로 환불할 수 있습니다.</li>
              <li>정기결제(구독형) 서비스의 경우, "회원"이 다음 결제일 이전에 해지 신청을 하면 다음 결제일로부터 서비스 이용이 중단되며 더 이상 결제가 이루어지지 않습니다. 이미 결제된 해당 월의 요금에 대해서는 제16조의 기준에 따라 부분 환불이 진행됩니다.</li>
            </ol>

            <h3 className="text-lg font-bold text-gray-900 mt-6">제 18 조 (이용제한 등)</h3>
            <p>"회사"는 "회원"이 이 약관의 의무를 위반하거나 "서비스"의 정상적인 운영을 방해한 경우, 경고, 일시정지, 영구이용정지 등으로 "서비스" 이용을 단계적으로 제한할 수 있습니다.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-6">제 19 조 (책임제한)</h3>
            <ol className="list-decimal pl-5 space-y-2 mt-2">
              <li>"회사"는 천재지변 또는 이에 준하는 불가항력으로 인하여 "서비스"를 제공할 수 없는 경우에는 "서비스" 제공에 관한 책임이 면제됩니다.</li>
              <li>"회사"는 "회원"의 귀책사유로 인한 "서비스" 이용의 장애에 대하여는 책임을 지지 않습니다.</li>
            </ol>

            <h3 className="text-lg font-bold text-gray-900 mt-6">제 20 조 (준거법 및 재판관할)</h3>
            <p>"회사"와 "회원" 간 제기된 소송은 대한민국법을 준거법으로 합니다. "회사"와 "회원"간 발생한 분쟁에 관한 소송은 민사소송법 상의 관할법원에 제소합니다.</p>

            <p className="mt-8 text-sm text-gray-500 text-right font-bold">부칙: 이 약관은 2026년 10월 1일부터 적용됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
