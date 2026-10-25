/* ========================================================================
   ★ 여기만 수정하면 됩니다! — 기몬의 과학서재 관리 파일
   HTML / CSS / 책장 좌표 파일은 수정하지 않아도 됩니다.
   저장 후 index.html을 새로고침하면 변경 내용이 반영됩니다.
   ======================================================================== */

const LIBRARY_DATA = {
  /* ① 책장 이름과 한 줄 소개를 바꾸는 곳 */
  siteTitle: "기몬의 과학서재",       // ← 메인 제목
  siteSubtitle: "과학을 더 가까이, 일상을 더 특별하게", // ← 아래 설명 문구

  /* ② 세 구역 이름을 바꾸는 곳 (id는 그대로 두세요) */
  sections: [
    { id: "lesson",     title: "수업" },
    { id: "assessment", title: "평가" },
    { id: "edutech",    title: "AI&에듀테크" }
  ],

  /* ③ 책을 등록하는 곳

     책 위치 번호:  수업 = lesson / 평가 = assessment / AI = edutech
       - lesson-1-01      : 수업 구역 · 맨 위 선반 · 첫 번째 책
       - assessment-2-03  : 평가 구역 · 두 번째 선반 · 세 번째 책
       - edutech-3-02    : AI 구역 · 세 번째 선반 · 두 번째 책

     ★ 아래 예시처럼 새 항목을 복사한 뒤 번호와 내용을 바꾸세요.
     ★ URL은 사이트 주소 전체(https://...)를 입력하세요.
     ★ URL이 비어 있어도 책을 클릭하여 미리볼 수 있어요.
     ★ 책등에 적힐 이름(spineTitle)은 2~7글자로 짧게 쓰면 예쁩니다.
     ★ section은 위치에서 자동으로 결정되므로 따로 적지 않습니다.
     ★ 책을 추가하더라도 책장 그림이나 HTML을 고칠 필요가 없습니다.

     예시:
     "lesson-2-04": {
       spineTitle: "수업 게임",
       title: "새롭게 만든 수업 게임",
       url: "https://kmonsciclass.vercel.app/여기에폴더명/",
       description: "학생들이 무엇을 하는지 짧게 설명해 주세요."
     },
  */
  books: {
    "lesson-1-03": {
      spineTitle: "레이저 반사",
      title: "레이저 반사 게임: 거울의 방",
      url: "https://kmonsciclass.vercel.app/laserreflection/",
      description: "발사 각도를 정해 레이저를 쏘고, 거울에 반사된 빛으로 표적을 맞히며 빛의 반사 법칙을 탐구하는 게임입니다."
    },
     "lesson-1-04": {
      spineTitle: "레이저 굴절",
      title: "레이저 반사&굴절 게임: 거울과 물의 방",
      url: "https://kmonsciclass.vercel.app/laserrefraction/",
      description: "발사 각도를 정해 레이저를 쏘고, 거울에 반사된 빛으로 표적을 맞히며 빛의 반사 법칙을 탐구하는 게임입니다."
    }

    /* 아래는 배치와 글씨를 시험하기 위한 예시입니다. 실제 주소는 비워 두었습니다. */
    "lesson-2-05": {
      spineTitle: "상태 변화",
      title: "물질의 상태 변화 수업 자료 (예시)",
      url: "",
      description: "이 부분에 수업 자료의 소개를 적으세요."
    },
    "lesson-3-04": {
      spineTitle: "기체 탐정",
      title: "기체 탐정! (예시)",
      url: "",
      description: "기체의 성질과 관련된 사례를 탐구하는 자료를 등록하는 예시입니다."
    },
    "assessment-1-05": {
      spineTitle: "과정 평가",
      title: "학생 평가 자료 (예시)",
      url: "",
      description: "평가 활동을 소개하는 설명을 입력하세요."
    },
    "assessment-3-04": {
      spineTitle: "평가 도구",
      title: "평가 도구 모음 (예시)",
      url: "",
      description: "루브릭이나 채점 자료 등을 등록하는 예시입니다."
    },
    "edutech-1-04": {
      spineTitle: "AI활용연수",
      title: "AI 활용 앱만들기",
      url: "https://kmonsciclass.vercel.app/AIT2026",
      description: "선생님을 위한 앱만들기 기초 연수자료."
    },
    "edutech-2-04": {
      spineTitle: "도구 모음",
      title: "에듀테크 도구 모음 (예시)",
      url: "",
      description: "자주 사용하는 에듀테크 링크를 등록해 보세요."
    }
  }
};
