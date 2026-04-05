# Running Dashboard

## 프로젝트 개요
삼성 헬스 / 런데이 GPX 파일 기반 러닝 기록 대시보드.  
지도에 경로를 시각화하고, 목표 달성률을 추적한다.

## 규칙
모든 작업 전 `.claude/rules/global.md` 를 반드시 참고한다.  
역할별 작업 시 해당 규칙 파일을 추가로 참고한다:
- 프론트엔드 작업 → `.claude/rules/frontend.md`
- 백엔드 작업 → `.claude/rules/backend.md`
- QA 작업 → `.claude/rules/qa.md`

## 프로젝트 구조
```
running-dashboard/
├── CLAUDE.md
├── .claude/
│   └── rules/
│       ├── global.md
│       ├── frontend.md
│       ├── backend.md
│       └── qa.md
├── frontend/                → Vite + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/      → 공통 컴포넌트
│   │   ├── pages/           → 화면 단위
│   │   │   ├── MapPage.tsx      → 지도 화면
│   │   │   ├── UploadPage.tsx   → 기록 업로드 화면
│   │   │   └── GoalPage.tsx     → 목표치 화면
│   │   └── api/             → 백엔드 API 호출
│   └── package.json
└── backend/                 → Spring Boot + H2
    └── src/main/
        ├── java/com/running/
        │   ├── controller/
        │   ├── service/
        │   ├── repository/
        │   ├── entity/
        │   └── dto/
        └── resources/
            ├── application.yml
            └── data.sql
```

## 로컬 실행 방법

### Frontend
```bash
cd frontend
pnpm install
pnpm dev
```

### Backend
```bash
cd backend
./gradlew bootRun
```

## 주요 화면
| 화면 | 경로 | 설명 |
|------|------|------|
| 지도 | `/` | GPX 기반 러닝 경로 시각화 |
| 기록 업로드 | `/upload` | 파일 업로드 및 캘린더 |
| 목표치 | `/goal` | 목표 설정 및 달성률 |