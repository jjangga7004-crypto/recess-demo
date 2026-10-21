export type CategoryId = 'daily' | 'school' | 'study' | 'admission';
export type RegionId = 'daechi' | 'junggye' | 'mokdong';
export type BadgeId = 'math1' | 'all1' | 'kind' | 'share' | 'steady';
export type ThemeChoice = 'light' | 'dark' | 'system';
export type SourceId = 'suman' | 'orbi' | 'dc' | 'etc';

/** example = 앱 안의 예시 카드(원문 없음) · manual = 직접 등록한 실제 링크 · auto = 허용된 연결로 수집한 링크 */
export type LinkKind = 'example' | 'manual' | 'auto';

/** 모아보기 카드. 외부 글의 본문·이미지·댓글·작성자는 저장하지 않는다. */
export interface LinkItem {
  id: string;
  kind: LinkKind;
  source: SourceId;
  /** 출처가 '기타'일 때 등록자가 적은 출처 이름 */
  sourceName?: string;
  /** 실제 원문 주소. 예시 카드에는 없다. */
  url?: string;
  /** 원문 제목 또는 등록자가 직접 쓴 소개 제목 */
  title: string;
  /** 등록자가 직접 쓴 짧은 소개 */
  summary: string;
  topic: CategoryId;
  /** 원문 게시 시각 — 확인된 경우에만 */
  postedAt?: number;
  /** 등록·수집 시각 */
  addedAt: number;
  updatedAt?: number;
  /** 원문 쪽 댓글 수 — 확인된 경우에만(예시 카드는 예시 값) */
  originalReplies?: number;
  /** 예시 상세 화면에만 쓰는 가상 설명 */
  exampleBody?: string;
  /** 자동 수집 글은 승인 전까지 pending */
  status: 'published' | 'pending';
}

/** RECESS 글에 붙인 참고 링크(원본 카드가 지워져도 남도록 복사해 둔다) */
export interface LinkRef {
  itemId: string;
  kind: LinkKind;
  source: SourceId;
  sourceName: string;
  title: string;
  url?: string;
}

/** 모아보기 설정은 로그인 없이 이 기기에 저장한다. */
export interface LinkPrefs {
  saved: string[];
  hidden: string[];
  excludedSources: SourceId[];
  showExamples: boolean;
}

export interface School {
  id: string;
  name: string;
  region: RegionId;
}

export interface BadgeDef {
  id: BadgeId;
  kind: 'grade' | 'activity';
  label: string;
  summary: string;
  details: { label: string; value: string }[];
}

export interface User {
  id: string;
  nickname: string;
  schoolId: string;
  verified: boolean;
  ownedBadges: BadgeId[];
  shownBadges: BadgeId[];
  /** 이 브라우저에서 만든 데모 프로필 */
  local?: boolean;
}

export interface Post {
  id: string;
  authorId: string;
  category: CategoryId;
  title: string;
  body: string;
  createdAt: number;
  editedAt?: number;
  /** 예시 데이터에 미리 들어 있는 좋아요 수(다른 학생들의 반응) */
  baseLikes: number;
  /** '모아보기'의 글을 보고 쓴 의견 글이면 참고 링크 */
  link?: LinkRef;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  body: string;
  createdAt: number;
}

/** 데모 프로필마다 따로 저장하는 반응·설정 */
export interface ProfileState {
  liked: string[];
  saved: string[];
  blocked: string[];
  hidden: string[];
}

export interface Report {
  id: string;
  postId: string;
  postTitle: string;
  reporterId: string;
  reason: string;
  createdAt: number;
}

export interface AppState {
  version: 2;
  users: User[];
  posts: Post[];
  comments: Comment[];
  currentProfileId: string | null;
  profiles: Record<string, ProfileState>;
  reports: Report[];
  theme: ThemeChoice;
  links: LinkItem[];
  linkPrefs: LinkPrefs;
}

export interface CollectFilters {
  query: string;
  source: SourceId | 'all';
  topic: CategoryId | 'all';
}

export type SortId = 'latest' | 'popular';

export interface FeedFilters {
  query: string;
  category: CategoryId | 'all';
  region: RegionId | 'all';
  /** 'all' | 'mine' | 학교 id */
  school: string;
  sort: SortId;
}

export type ViewId = 'collect' | 'community' | 'saved' | 'profile' | 'settings';
