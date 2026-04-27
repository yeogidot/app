# 여기닷 앱 (yeogidot-app)

Expo + React Native 기반의 하이브리드 앱입니다.  
앱 내부 `WebView`로 웹 서비스를 로드하고, 네이티브 기능(이미지 선택, EXIF 추출, 딥링크 처리)을 웹과 브릿지로 연결합니다.

## 주요 기능

- `WebView` 기반 웹 서비스 렌더링
- 웹 -> 앱 메시지(`SELECT_IMAGES`)를 통한 갤러리 이미지 선택
- 선택 이미지의 Base64, GPS, 촬영 시각(EXIF) 추출 후 웹으로 전달
- Android 하드웨어 백 버튼 `WebView` 뒤로가기 연동

## 기술 스택

- Expo SDK 54
- React 19 / React Native 0.81
- TypeScript
- `react-native-webview`
- `expo-image-picker`, `expo-media-library`
- `@lodev09/react-native-exify`

## 시작하기

### 1) 요구사항

- Node.js LTS
- npm
- Expo 개발 환경
  - iOS: Xcode
  - Android: Android Studio + SDK

### 2) 의존성 설치

```bash
npm install
```

### 3) 환경변수 설정

루트에 `.env` 파일을 만들고 아래 값을 설정합니다.

```env
EXPO_PUBLIC_BASE_URL=https://your-web-domain.com
```

> `EXPO_PUBLIC_BASE_URL`이 없으면 앱이 에러 화면을 렌더링합니다.

### 4) 앱 실행

````bash
# Expo 개발 서버
npm run start

# Android 네이티브 실행
npm run android

# iOS 네이티브 실행
npm run ios

```
## 프로젝트 구조

```text
.
├── App.tsx                 # WebView, 딥링크/뒤로가기, 웹-네이티브 브릿지
├── index.ts                # 앱 엔트리 포인트
├── app.json                # Expo 설정(스킴, 번들 ID, 아이콘 등)
├── constants/regex.ts      # 라우트/URL 파싱 정규식
├── types/photo.type.ts     # 브릿지 응답 타입
└── utils/
    ├── exif.ts             # EXIF(GPS, 촬영시각) 추출
    └── webview.ts          # 딥링크 파싱 및 WebView URL 생성
````

## 주의사항

- 키스토어/인증서 파일(`*.keystore`, `*.jks`, `*.p12` 등)은 저장소에 커밋하지 마세요.
- 실제 배포 전 iOS/Android 번들 식별자, 아이콘, 권한 문구를 환경에 맞게 점검하세요.
