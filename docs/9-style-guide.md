# TodoList 스타일 가이드

**버전**: 1.0
**작성일**: 2026-04-29
**작성자**: UI Designer / Gemini CLI

이 문서는 제공된 캘린더 화면의 미니멀하고 깨끗한 디자인 시스템을 TodoList 애플리케이션에 적용하기 위한 가이드라인입니다.

---

## 1. 디자인 원칙 (Design Principles)

1.  **공백의 미학 (Generous Whitespace)**: 정보 간의 간격을 충분히 두어 시각적 피로도를 낮추고 가독성을 높입니다.
2.  **미니멀리즘 (Minimalism)**: 불필요한 테두리와 배경색을 배제하고, 선과 색상 포인트만으로 정보를 구분합니다.
3.  **시스템 폰트 우선 (System Font First)**: 플랫폼 네이티브한 느낌을 주기 위해 시스템 기본 산세리프 폰트를 사용합니다.

---

## 2. 색상 팔레트 (Color Palette)

### 2.1 메인 색상 (Primary Colors)
-   **Brand Blue**: `#007AFF` (이벤트 텍스트, 강조 액션)
-   **Brand Red**: `#FF3B30` (오늘 날짜 강조, 경고 상태)
-   **Selection Blue**: `#D1E7FE` (할일/이벤트 배경)

### 2.2 중립 색상 (Neutral Colors)
-   **Background**: `#FFFFFF` (전체 배경)
-   **Text Primary**: `#000000` (헤더, 본문 텍스트)
-   **Text Secondary**: `#8E8E93` (보조 정보, 날짜 레이블)
-   **Border/Grid**: `#E5E5E5` (구분선, 그리드 라인)

---

## 3. 타이포그래피 (Typography)

-   **Font Family**: `San Francisco`, `Segoe UI`, `Roboto`, `sans-serif`
-   **Styles**:
    -   **Heading 1**: `24px`, `Bold`, `#000000` (예: 2026년 4월)
    -   **Heading 2**: `16px`, `Semi-bold`, `#000000` (예: 요일 헤더)
    -   **Body**: `14px`, `Regular`, `#000000` (예: 할일 제목)
    -   **Caption**: `12px`, `Regular`, `#8E8E93` (예: 날짜 숫자, 보조 정보)

---

## 4. UI 컴포넌트 스타일

### 4.1 카드 (Todo Item Card)
-   **배경**: `#D1E7FE` (진행 중인 항목)
-   **테두리**: 없음 (또는 매우 연한 내부 선)
-   **라운딩**: `4px` (약한 곡률)
-   **간격**: `padding: 4px 8px`
-   **텍스트**: `#007AFF`, `13px`, `Truncate` (한 줄 처리)

### 4.2 버튼 (Buttons)
-   **Action Button**: `#F2F2F7` 배경, `#000000` 텍스트, `rounded-md`
-   **Navigation (<, >)**: 아이콘만 사용하거나 연한 회색 원형 배경
-   **Today Button**: 테두리가 있는 흰색 배경, `rounded-md`, `padding: 4px 12px`

### 4.3 배지 (Badges)
-   **상태 표시**: 텍스트 뒤에 `+7개`와 같이 표시
-   **스타일**: 배경 없음, `text-secondary`, `12px`

---

## 5. 레이아웃 가이드

-   **그리드**: 7열 구성을 기본으로 하며, 각 셀은 동일한 너비를 가집니다.
-   **헤더**: 월/년도 정보를 좌측 상단에 크게 배치하고, 네비게이션 도구는 우측 상단에 모아서 배치합니다.
-   **여백**: 컨테이너 패딩은 최소 `16px` 이상을 유지합니다.

---

## 6. 아이콘 활용
-   **유형**: 얇은 선(Outline) 형태의 미니멀한 아이콘 사용
-   **크기**: `14px` ~ `16px` (텍스트와 조화를 이루는 크기)
-   **색상**: 텍스트 색상과 동일하게 적용하여 일체감 부여
