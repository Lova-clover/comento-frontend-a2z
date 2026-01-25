# 🚀 Comento Frontend A to Z

> **코멘토 직무부트캠프** - 프론트엔드 현직자와 함께하는 개발 직무 A to Z (4주 과정)

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/ko/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/ko/docs/Web/CSS)
[![SCSS](https://img.shields.io/badge/SCSS-CC6699?style=flat&logo=sass&logoColor=white)](https://sass-lang.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/ko/docs/Web/JavaScript)

---

## 📋 프로젝트 소개

프론트엔드 개발의 기초부터 실전까지, 4주간 현직 개발자의 피드백을 받으며 진행한 직무부트캠프 결과물입니다.

---

## 📁 폴더 구조

```
comento-frontend-a2z/
├── 1주차 과제/          # 자기소개 페이지 (HTML + SCSS + 반응형)
├── 2주차 과제/          # 자판기 UI (CSS Only)
├── 3주차 과제/          # 계산기 + 디지털 시계 (JavaScript)
│   ├── calculator/
│   └── clock/
├── 4주차 과제/          # To-Do-List + 회원가입 (실전 프로젝트)
│   ├── To-Do-List/
│   └── signup/
└── README.md
```

---

## 🎯 주차별 과제

### 1주차: 자기소개 페이지

| 항목 | 내용 |
|:---|:---|
| **목표** | HTML/SCSS로 반응형 자기소개 페이지 제작 |
| **기술** | HTML5, SCSS, CSS Variables |
| **주요 기능** | 반응형(360/768/1024), Sticky 헤더, 다크/라이트 테마, 모바일 메뉴 |

![1주차 자기소개 페이지](./1주차%20과제/자기소개%20페이지%20캡처%20화면.jpeg)

```bash
cd "1주차 과제"
npm install
npm run build   # SCSS → CSS 컴파일
```

---

### 2주차: 자판기 UI

| 항목 | 내용 |
|:---|:---|
| **목표** | CSS만으로 자판기 시각 요소 구현 |
| **기술** | HTML5, CSS3 (그라디언트, 애니메이션) |
| **주요 기능** | 3단 음료 진열대, 광고판 애니메이션, 결제 패널 UI |

![2주차 자판기 UI](./2주차%20과제/2주차%20캡처%20화면.jpeg)

---

### 3주차: 계산기 + 디지털 시계

#### 🔢 계산기
| 항목 | 내용 |
|:---|:---|
| **목표** | 버튼/키보드 입력 계산기 |
| **기술** | JavaScript (DOM, Event) |
| **주요 기능** | 사칙연산, 괄호, C/CE, History(최근 10개) |

![3주차 계산기](./3주차%20과제/calculator/3주차%20결과물%20캡처(계산기).jpeg)

#### ⏰ 디지털 시계
| 항목 | 내용 |
|:---|:---|
| **목표** | 배터리 + 알람 기능이 있는 시계 |
| **기술** | JavaScript (setInterval, 상태관리) |
| **주요 기능** | 실시간 시계, 배터리 시뮬레이션, 알람 3개, 스누즈 |

![3주차 디지털 시계](./3주차%20과제/clock/3주차%20결과물%20캡처(시계).jpeg)

---

### 4주차: To-Do-List + 회원가입

#### 📅 To-Do-List
| 항목 | 내용 |
|:---|:---|
| **목표** | 일정 관리 앱 |
| **기술** | JavaScript, LocalStorage |
| **주요 기능** | CRUD, 필터(전체/오늘/다가오는/지난), 정렬, 검색 |

![4주차 To-Do-List](./4주차%20과제/To-Do-List/4주차%20결과물%20캡처(To-Do-List).jpeg)

#### 👤 회원가입
| 항목 | 내용 |
|:---|:---|
| **목표** | 폼 유효성 검사 |
| **기술** | JavaScript, 정규표현식, LocalStorage |
| **주요 기능** | 아이디 중복체크, 비밀번호 규칙 실시간 검사, 폼 검증 |

![4주차 회원가입](./4주차%20과제/signup/4주차%20결과물%20캡처(회원가입).jpeg)

---

## 🛠️ 기술 스택

- **마크업**: HTML5, 시맨틱 태그, 접근성(ARIA)
- **스타일**: CSS3, SCSS, CSS Variables, Flexbox, Grid
- **스크립트**: Vanilla JavaScript (ES6+)
- **저장소**: LocalStorage
- **빌드**: npm, sass

---

## 🚀 실행 방법

```bash
# 1주차 (SCSS 컴파일 필요)
cd "1주차 과제"
npm install
npm run build

# 나머지 주차는 index.html 직접 열기
```

---

## 📝 배운 점

- **반응형 설계**: 미디어쿼리와 SCSS 믹스인을 활용한 효율적인 반응형 구현
- **접근성**: 스킵 링크, aria 속성, 키보드 네비게이션
- **상태 관리**: LocalStorage를 활용한 클라이언트 데이터 영속화
- **폼 유효성**: 정규표현식과 실시간 피드백을 통한 UX 개선
- **코드 구조화**: 기능별 분리와 재사용 가능한 컴포넌트 설계

---

## 👤 Author

**Seongju (Lova-clover)**
- GitHub: [@Lova-clover](https://github.com/Lova-clover)
- Velog: [@lova-clover](https://velog.io/@lova-clover)

---

## 📄 License

This project is for educational purposes as part of the Comento Frontend Bootcamp.
