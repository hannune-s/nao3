import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl w-full bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
        <div className="bg-[#5F0080] p-6 text-white text-center">
          <Link href="/" className="inline-block mb-2 text-purple-200 hover:text-white transition-colors text-sm font-bold">
            ← 메인으로 돌아가기
          </Link>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">개인정보 취급방침</h1>
        </div>
        
        <div className="p-6 md:p-10 h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="prose prose-sm md:prose-base max-w-none text-gray-700">
            <h3 className="text-lg font-bold text-gray-900 mt-0">1. 개인정보의 처리 목적</h3>
            <p>‘(주)한누네’(이하 ‘회사’)은(는) 다음의 목적을 위하여 개인정보를 처리하고 있으며, 다음의 목적 이외의 용도로는 이용하지 않습니다.</p>
            <ul className="list-disc pl-5 mt-2">
              <li>고객 가입의사 확인, 고객에 대한 서비스 제공에 따른 본인 식별.인증, 회원자격 유지.관리, 물품 또는 서비스 공급에 따른 금액 결제, 물품 또는 서비스의 공급.배송 등</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900">2. 개인정보의 처리 및 보유 기간</h3>
            <p>회사는 정보주체로부터 개인정보를 수집할 때 동의 받은 개인정보 보유․이용기간 또는 법령에 따른 개인정보 보유․이용기간 내에서 개인정보를 처리․보유합니다.</p>
            <ul className="list-disc pl-5 mt-2">
              <li>회원 가입 및 관리 : 서비스 이용계약 해지시까지 (단, 관계 법령에 따른 보존이 필요한 경우 해당 기간까지)</li>
              <li>대금결제 및 재화 등의 공급에 관한 기록 : 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900">3. 처리하는 개인정보의 항목</h3>
            <p>회사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
            <ul className="list-disc pl-5 mt-2">
              <li>필수항목 : 이메일, 비밀번호, 대표자명, 매장주소, 연락처, 사업자등록증 사본</li>
              <li>선택항목 : 영업시간, 휴무일 정보 등</li>
              <li>자동수집항목 : 서비스 이용기록, 접속 로그, 쿠키, 접속 IP 정보 등</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900">4. 개인정보의 제3자 제공에 관한 사항</h3>
            <p>회사는 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다. 현재 회사는 회원의 개인정보를 제3자에게 제공하고 있지 않습니다.</p>

            <h3 className="text-lg font-bold text-gray-900">5. 개인정보처리의 위탁에 관한 사항</h3>
            <p>회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
            <ul className="list-disc pl-5 mt-2">
              <li>수탁자 : Supabase (데이터베이스 호스팅 및 인증 관리)</li>
              <li>위탁하는 업무의 내용 : 회원 정보 보관 및 로그인 인증 처리</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900">6. 정보주체와 법정대리인의 권리·의무 및 그 행사방법</h3>
            <p>이용자는 개인정보주체로서 언제든지 개인정보 열람, 정정, 삭제, 처리정지 요구 등의 권리를 행사할 수 있습니다.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-6">7. 개인정보의 파기</h3>
            <p>회사는 원칙적으로 개인정보 처리목적이 달성된 경우에는 지체없이 해당 개인정보를 파기합니다. 파기의 절차, 기한 및 방법은 다음과 같습니다.</p>
            <ul className="list-disc pl-5 mt-2">
              <li>파기절차: 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져(종이의 경우 별도의 서류) 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.</li>
              <li>파기방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-6">8. 개인정보의 안전성 확보 조치</h3>
            <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
            <ul className="list-disc pl-5 mt-2">
              <li>관리적 조치 : 내부관리계획 수립 및 시행, 정기적 직원 교육 등</li>
              <li>기술적 조치 : 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
              <li>물리적 조치 : 전산실, 자료보관실 등의 접근통제</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-6">9. 개인정보 보호책임자</h3>
            <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
            <ul className="list-disc pl-5 mt-2">
              <li>성명 : 홍길동</li>
              <li>직책 : 대표이사</li>
              <li>연락처 : 02-123-4567, support@nao3.com</li>
            </ul>

            <h3 className="text-lg font-bold text-gray-900 mt-6">10. 권익침해 구제방법</h3>
            <p>정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.</p>

            <h3 className="text-lg font-bold text-gray-900 mt-6">11. 개인정보 처리방침의 변경</h3>
            <p>이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
            
            <p className="mt-8 text-sm text-gray-500 text-right font-bold">부칙: 이 개인정보처리방침은 2026년 10월 1일부터 적용됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
