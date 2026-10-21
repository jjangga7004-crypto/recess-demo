import type { BadgeDef, BadgeId, CategoryId, RegionId, School } from '../types';

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'daily', label: '일상' },
  { id: 'school', label: '학교생활' },
  { id: 'study', label: '공부' },
  { id: 'admission', label: '입시' },
];

export const CATEGORY_LABEL: Record<CategoryId, string> = {
  daily: '일상',
  school: '학교생활',
  study: '공부',
  admission: '입시',
};

export const REGIONS: { id: RegionId; label: string; note?: string }[] = [
  { id: 'daechi', label: '대치' },
  { id: 'junggye', label: '중계' },
  { id: 'mokdong', label: '목동', note: '확장 시나리오 예시' },
];

export const REGION_LABEL: Record<RegionId, string> = {
  daechi: '대치',
  junggye: '중계',
  mokdong: '목동',
};

// 모든 학교는 가상이다.
export const SCHOOLS: School[] = [
  { id: 'daechi-a', name: '대치 A고', region: 'daechi' },
  { id: 'daechi-b', name: '대치 B고', region: 'daechi' },
  { id: 'daechi-c', name: '대치 C여고', region: 'daechi' },
  { id: 'junggye-a', name: '중계 A고', region: 'junggye' },
  { id: 'junggye-b', name: '중계 B고', region: 'junggye' },
  { id: 'junggye-c', name: '중계 C고', region: 'junggye' },
  { id: 'mokdong-a', name: '목동 A고', region: 'mokdong' },
  { id: 'mokdong-b', name: '목동 B여고', region: 'mokdong' },
];

export const SCHOOL_BY_ID: Record<string, School> = Object.fromEntries(SCHOOLS.map((s) => [s.id, s]));

export const BADGE_ORDER: BadgeId[] = ['math1', 'all1', 'kind', 'share', 'steady'];

// 성적 뱃지는 어떤 시험·시점·과목인지 함께 보여준다. 모든 기록은 예시다.
export const BADGES: Record<BadgeId, BadgeDef> = {
  math1: {
    id: 'math1',
    kind: 'grade',
    label: '수학 1등급',
    summary: '한 번의 시험에서 수학 1등급을 받은 기록',
    details: [
      { label: '기준 시험', value: '전국연합학력평가 (고2)' },
      { label: '시점', value: '2026년 9월' },
      { label: '포함 과목', value: '수학' },
      { label: '확인 방식', value: '성적표 확인 (데모에서는 생략)' },
    ],
  },
  all1: {
    id: 'all1',
    kind: 'grade',
    label: '국수영탐 올1',
    summary: '한 번의 시험에서 국어·수학·영어·탐구 모두 1등급을 받은 기록',
    details: [
      { label: '기준 시험', value: '전국연합학력평가 (고2)' },
      { label: '시점', value: '2026년 6월' },
      { label: '포함 과목', value: '국어 · 수학 · 영어 · 탐구 2과목' },
      { label: '확인 방식', value: '성적표 확인 (데모에서는 생략)' },
    ],
  },
  kind: {
    id: 'kind',
    kind: 'activity',
    label: '친절한 답변',
    summary: '다른 학생의 질문에 정성껏 답한 활동',
    details: [
      { label: '받는 기준', value: '좋아요를 많이 받은 댓글 20개 (예시 기준)' },
      { label: '성격', value: '커뮤니티 활동으로만 받아요' },
    ],
  },
  share: {
    id: 'share',
    kind: 'activity',
    label: '자료 공유',
    summary: '직접 만든 정리 자료나 공부법을 나눈 활동',
    details: [
      { label: '받는 기준', value: '공부 자료 글 5개 (예시 기준)' },
      { label: '성격', value: '커뮤니티 활동으로만 받아요' },
    ],
  },
  steady: {
    id: 'steady',
    kind: 'activity',
    label: '꾸준한 참여',
    summary: '여러 주 동안 꾸준히 글이나 댓글을 남긴 활동',
    details: [
      { label: '받는 기준', value: '4주 연속 활동 (예시 기준)' },
      { label: '성격', value: '커뮤니티 활동으로만 받아요' },
    ],
  },
};

export const REPORT_REASONS = [
  '욕설·비하 표현',
  '개인정보 노출',
  '광고·홍보 글',
  '음란하거나 불쾌한 내용',
  '특정인을 겨냥한 글',
  '기타',
];

// 데모 프로필 선택 화면에 보여줄 예시 프로필(선택하면 이 브라우저에 만들어진다).
export const PRESET_PROFILES = [
  { key: 'preset-1', nickname: '쉬는시간러', schoolId: 'daechi-a' },
  { key: 'preset-2', nickname: '중계러너', schoolId: 'junggye-b' },
];

// 체험용 프로필에는 표시 설정을 해 볼 수 있도록 예시 뱃지를 모두 넣어 둔다.
export const DEMO_OWNED_BADGES: BadgeId[] = ['math1', 'all1', 'kind', 'share', 'steady'];
