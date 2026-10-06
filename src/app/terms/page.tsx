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
            
            <h3 className="text-lg font-bold text-gray-900">제 2 조 (정의)</h3>
            <p>이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>"서비스"라 함은 구현되는 단말기(PC, TV, 휴대형단말기 등의 각종 유무선 장치를 포함)와 상관없이 "회원"이 이용할 수 있는 NAO3 관련 제반 서비스를 의미합니다.</li>
              <li>"회원"이라 함은 회사의 "서비스"에 접속하여 이 약관에 따라 "회사"와 이용계약을 체결하고 "회사"가 제공하는 "서비스"를 이용하는 고객을 말합니다.</li>
              <li>"아이디(ID)"라 함은 "회원"의 식별과 "서비스" 이용을 위하여 "회원"이 정하고 "회사"가 승인하는 문자와 숫자의 조합을 의미합니다.</li>
              <li>"비밀번호"라 함은 "회원"이 부여 받은 "아이디와 일치되는 "회원"임을 확인하고 비밀보호를 위해 "회원" 자신이 정한 문자 또는 숫자의 조합을 의미합니다.</li>
            </ol>

            <h3 className="text-lg font-bold text-gray-900">제 3 조 (약관의 게시와 개정)</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>"회사"는 이 약관의 내용을 "회원"이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</li>
              <li>"회사"는 "약관의 규제에 관한 법률", "정보통신망 이용촉진 및 정보보호 등에 관한 법률(이하 "정보통신망법")" 등 관련법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
              <li>"회사"가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 제1항의 방식에 따라 그 개정약관의 적용일자 7일 전부터 적용일자 전일까지 공지합니다.</li>
            </ol>

            <h3 className="text-lg font-bold text-gray-900">제 4 조 (이용계약 체결)</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>이용계약은 "회원"이 되고자 하는 자(이하 "가입신청자")가 약관의 내용에 대하여 동의를 한 다음 회원가입신청을 하고 "회사"가 이러한 신청에 대하여 승낙함으로써 체결됩니다.</li>
              <li>"회사"는 "가입신청자"의 신청에 대하여 "서비스" 이용을 승낙함을 원칙으로 합니다. 다만, "회사"는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.</li>
              <ul className="list-disc pl-5 mt-2">
                <li>가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                <li>허위의 정보를 기재하거나, "회사"가 제시하는 내용을 기재하지 않은 경우</li>
              </ul>
            </ol>

            <h3 className="text-lg font-bold text-gray-900">제 5 조 (회원정보의 변경)</h3>
            <p>회원은 개인정보관리화면을 통하여 언제든지 본인의 개인정보를 열람하고 수정할 수 있습니다. 회원은 회원가입신청 시 기재한 사항이 변경되었을 경우 온라인으로 수정을 하거나 전자우편 기타 방법으로 "회사"에 대하여 그 변경사항을 알려야 합니다.</p>

            <h3 className="text-lg font-bold text-gray-900">제 6 조 (개인정보보호 의무)</h3>
            <p>"회사"는 "정보통신망법" 등 관계 법령이 정하는 바에 따라 "회원"의 개인정보를 보호하기 위해 노력합니다. 개인정보의 보호 및 사용에 대해서는 관련법 및 "회사"의 개인정보처리방침이 적용됩니다.</p>

            <h3 className="text-lg font-bold text-gray-900">제 7 조 (서비스의 제공 등)</h3>
            <p>"회사"는 회원에게 아래와 같은 서비스를 제공합니다.</p>
            <ol className="list-decimal pl-5 mt-2">
              <li>모바일 전단지 생성 및 배포 서비스</li>
              <li>푸시 알림 발송 시스템</li>
              <li>기타 "회사"가 추가 개발하거나 다른 회사와의 제휴계약 등을 통해 "회원"에게 제공하는 일체의 서비스</li>
            </ol>
            <p className="mt-4 text-sm text-gray-500 text-right">부칙: 이 약관은 2026년 10월 1일부터 적용됩니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
