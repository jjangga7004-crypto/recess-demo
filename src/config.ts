// 서비스 이름은 가칭이다. 이름을 바꾸려면 이 파일과 index.html의 <title>만 고치면 된다.
export const BRAND = {
  name: 'RECESS',
  meaning: '쉬는 시간',
  oneLiner:
    '학교와 재학 여부가 확인되는 고등학생들이 여러 학교에 걸쳐 일상, 학교생활, 공부, 입시를 이야기하는 커뮤니티',
};

export const DEMO_NOTICE = '발표용 데모 · 학교, 프로필, 게시글과 광고는 예시 데이터입니다.';

// 이 앱이 쓰는 브라우저 저장 공간. 초기화할 때 이 접두어로 시작하는 키만 지운다.
export const STORAGE_PREFIX = 'recess-demo:';
export const STORAGE_KEY = `${STORAGE_PREFIX}state-v1`;

export const MAX_SHOWN_BADGES = 2;
export const TITLE_MAX = 60;
export const BODY_MAX = 2000;
export const COMMENT_MAX = 500;
export const NICKNAME_MIN = 2;
export const NICKNAME_MAX = 10;
