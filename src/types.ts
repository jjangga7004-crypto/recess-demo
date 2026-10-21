export type CategoryId = 'daily' | 'school' | 'study' | 'admission';
export type RegionId = 'daechi' | 'junggye' | 'mokdong';
export type BadgeId = 'math1' | 'all1' | 'kind' | 'share' | 'steady';
export type ThemeChoice = 'light' | 'dark' | 'system';

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
  version: 1;
  users: User[];
  posts: Post[];
  comments: Comment[];
  currentProfileId: string | null;
  profiles: Record<string, ProfileState>;
  reports: Report[];
  theme: ThemeChoice;
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

export type ViewId = 'home' | 'saved' | 'profile' | 'settings';
