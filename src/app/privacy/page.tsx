import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-[#5F0080] p-6 text-white text-center">
          <Link href="/" className="inline-block mb-2 text-purple-200 hover:text-white transition-colors text-sm font-bold">
            ← 메인으로 돌아가기
          </Link>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">개인정보 처리방침</h1>
        </div>
        
        <div className="p-6 md:p-10 h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="prose prose-sm md:prose-base max-w-none text-gray-700">
            <p className="mb-6">
              ‘싹(SSAK)’(이하 ‘회사’라 합니다)은(는) 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.
            </p>

            <h3 className="text-lg font-bold text-gray-900 mt-0">1. 개인정보의 처리 목적</h3>
            <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>회원 가입 및 관리 :</strong> 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지, 고충처리 목적</li>
              <li><strong>재화 또는 서비스 제공 :</strong> 모바일 전단지 생성·배포 및 알림 발송 서비스 제공, 콘텐츠 제공, 맞춤서비스 제공, 유료구독 서비스 요금 결제·정산 목적</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-6">2. 개인정보의 처리 및 보유 기간</h3>
            <p>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의 받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>회원 가입 및 관리 :</strong> 서비스 이용계약 해지(회원 탈퇴) 시까지. 다만, 관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우에는 해당 수사·조사 종료 시까지, 채권·채무관계 잔존 시에는 해당 채권·채무관계 정산 시까지 보관합니다.</li>
              <li><strong>관계 법령에 따른 보존 기간 :</strong>
                <ul className="list-disc pl-5 mt-1 space-y-0.5">
                  <li>계약 또는 청약철회 등에 관한 기록 : 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
                  <li>대금결제 및 재화 등의 공급에 관한 기록 : 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
                  <li>소비자의 불만 또는 분쟁처리에 관한 기록 : 3년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
                  <li>서비스 접속 및 방문기록 : 3개월 (통신비밀보호법)</li>
                </ul>
              </li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-6">3. 처리하는 개인정보의 항목</h3>
            <p>회사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>필수항목 :</strong> 이메일(아이디), 비밀번호, 상호명(매장명), 대표자명, 연락처(전화번호), 매장주소, 사업자등록번호, 사업자등록증 사본</li>
              <li><strong>선택항목 :</strong> 영업시간, 정기휴무일, 주차안내, 기타 매장 안내사항</li>
              <li><strong>유료서비스 결제 시 :</strong> 카드사명, 승인번호 등 결제 및 정산 처리에 필요한 정보</li>
              <li><strong>자동수집항목 :</strong> 서비스 이용기록, 접속 로그, 쿠키(Cookie), 접속 IP 정보, 기기정보(푸시 알림 토큰 등)</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-6">4. 개인정보의 제3자 제공에 관한 사항</h3>
            <p>회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다. 현재 회사는 회원의 개인정보를 제3자에게 제공하고 있지 않습니다.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-6">5. 개인정보처리의 위탁에 관한 사항</h3>
            <p>회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>클라우드 인프라 및 인증 관리 :</strong> Supabase Inc. (회원 정보 보관, 데이터베이스 호스팅 및 로그인 인증 처리)</li>
              <li><strong>전자결제 수단 제공 및 결제대행 :</strong> 포트원(PortOne), NHN KCP 등 해당 결제대행사 (유료 서비스 요금 결제 및 정산 처리)</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-6">6. 정보주체와 법정대리인의 권리·의무 및 행사방법</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>정보주체는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.</li>
              <li>권리 행사는 회사에 대해 서면, 전자우편, 고객센터 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.</li>
              <li>권리 행사는 정보주체의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수도 있습니다.</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-6">7. 개인정보의 파기절차 및 방법</h3>
            <p>회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다. 파기의 절차 및 방법은 다음과 같습니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>파기절차 :</strong> 파기 사유가 발생한 개인정보를 선정하고, 회사의 개인정보 보호책임자의 승인을 받아 개인정보를 파기합니다.</li>
              <li><strong>파기방법 :</strong> 전자적 파일 형태로 기록·저장된 개인정보는 기록을 재생할 수 없도록 기술적 방법을 사용하여 파기하며, 종이 문서에 기록·저장된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-6">8. 개인정보의 안전성 확보조치</h3>
            <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>관리적 조치 :</strong> 내부관리계획 수립·시행, 개인정보 취급 직원의 최소화 및 교육</li>
              <li><strong>기술적 조치 :</strong> 개인정보처리시스템 등의 접근권한 관리, 비밀번호 등 중요 정보의 암호화, 보안프로그램 설치 및 주기적 점검</li>
              <li><strong>물리적 조치 :</strong> 전산실, 자료보관실 등의 접근통제</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-6">9. 개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항</h3>
            <p>회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는 ‘쿠키(cookie)’를 사용합니다. 이용자는 웹브라우저 옵션 설정을 통해 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다. 단, 쿠키 저장을 거부할 경우 맞춤형 서비스 이용에 어려움이 발생할 수 있습니다.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-6">10. 개인정보 보호책임자</h3>
            <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>성명 : 송하나</li>
              <li>연락처 : 070-4233-5553, hangose7@gmail.com</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-6">11. 권익침해 구제방법</h3>
            <p>정보주체는 개인정보침해로 인한 구제를 받기 위하여 아래의 기관에 분쟁해결이나 상담 등을 신청할 수 있습니다.</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>개인정보분쟁조정위원회 : (국번없이) 1833-6972 (www.kopico.go.kr)</li>
              <li>개인정보침해신고센터 : (국번없이) 118 (privacy.kisa.or.kr)</li>
              <li>대검찰청 : (국번없이) 1301 (www.spo.go.kr)</li>
              <li>경찰청 : (국번없이) 182 (ecrm.cyber.go.kr)</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-6">12. 개인정보 처리방침의 변경</h3>
            <p>이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
            
            <p className="mt-8 text-sm text-gray-500 text-right font-bold">부칙: 이 개인정보처리방침은 2026년 10월 1일부터 적용됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
