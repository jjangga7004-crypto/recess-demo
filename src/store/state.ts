import { STORAGE_KEY, STORAGE_PREFIX } from '../config';
import { DEMO_OWNED_BADGES } from '../data/catalog';
import { createSeedState } from '../data/seed';
import type { AppState, BadgeId, CategoryId, Post, ProfileState, ThemeChoice } from '../types';

export type Action =
  | { type: 'createProfile'; id: string; nickname: string; schoolId: string }
  | { type: 'switchProfile'; id: string | null }
  | { type: 'verifyCurrent' }
  | { type: 'createPost'; id: string; category: CategoryId; title: string; body: string; at: number }
  | { type: 'updatePost'; id: string; category: CategoryId; title: string; body: string; at: number }
  | { type: 'deletePost'; id: string }
  | { type: 'addComment'; id: string; postId: string; body: string; at: number }
  | { type: 'deleteComment'; id: string }
  | { type: 'toggleLike'; postId: string }
  | { type: 'toggleSave'; postId: string }
  | { type: 'setShownBadges'; badges: BadgeId[] }
  | { type: 'report'; id: string; postId: string; reason: string; hide: boolean; at: number }
  | { type: 'hidePost'; postId: string }
  | { type: 'unhidePost'; postId: string }
  | { type: 'block'; userId: string }
  | { type: 'unblock'; userId: string }
  | { type: 'setTheme'; theme: ThemeChoice }
  | { type: 'reset'; at: number };

export const EMPTY_PROFILE_STATE: ProfileState = { liked: [], saved: [], blocked: [], hidden: [] };

function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

/** 현재 프로필의 반응 상태를 바꾼다. 프로필이 없으면 아무것도 하지 않는다. */
function withProfile(state: AppState, fn: (p: ProfileState) => ProfileState): AppState {
  const id = state.currentProfileId;
  if (!id) return state;
  const prev = state.profiles[id] ?? EMPTY_PROFILE_STATE;
  return { ...state, profiles: { ...state.profiles, [id]: fn(prev) } };
}

function isMine(state: AppState, post: Post | undefined): boolean {
  return !!post && post.authorId === state.currentProfileId;
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'createProfile': {
      const user = {
        id: action.id,
        nickname: action.nickname,
        schoolId: action.schoolId,
        verified: false,
        ownedBadges: [...DEMO_OWNED_BADGES],
        shownBadges: [],
        local: true,
      };
      return {
        ...state,
        users: [...state.users, user],
        currentProfileId: user.id,
        profiles: { ...state.profiles, [user.id]: { ...EMPTY_PROFILE_STATE } },
      };
    }
    case 'switchProfile':
      return { ...state, currentProfileId: action.id };
    case 'verifyCurrent':
      return {
        ...state,
        users: state.users.map((x) => (x.id === state.currentProfileId ? { ...x, verified: true } : x)),
      };
    case 'createPost': {
      if (!state.currentProfileId) return state;
      const post: Post = {
        id: action.id,
        authorId: state.currentProfileId,
        category: action.category,
        title: action.title,
        body: action.body,
        createdAt: action.at,
        baseLikes: 0,
      };
      return { ...state, posts: [post, ...state.posts] };
    }
    case 'updatePost': {
      const target = state.posts.find((p) => p.id === action.id);
      if (!isMine(state, target)) return state;
      return {
        ...state,
        posts: state.posts.map((p) =>
          p.id === action.id
            ? { ...p, category: action.category, title: action.title, body: action.body, editedAt: action.at }
            : p,
        ),
      };
    }
    case 'deletePost': {
      const target = state.posts.find((p) => p.id === action.id);
      if (!isMine(state, target)) return state;
      const strip = (p: ProfileState): ProfileState => ({
        ...p,
        liked: p.liked.filter((x) => x !== action.id),
        saved: p.saved.filter((x) => x !== action.id),
        hidden: p.hidden.filter((x) => x !== action.id),
      });
      return {
        ...state,
        posts: state.posts.filter((p) => p.id !== action.id),
        comments: state.comments.filter((c) => c.postId !== action.id),
        profiles: Object.fromEntries(Object.entries(state.profiles).map(([k, v]) => [k, strip(v)])),
      };
    }
    case 'addComment': {
      if (!state.currentProfileId) return state;
      return {
        ...state,
        comments: [
          ...state.comments,
          {
            id: action.id,
            postId: action.postId,
            authorId: state.currentProfileId,
            body: action.body,
            createdAt: action.at,
          },
        ],
      };
    }
    case 'deleteComment':
      return {
        ...state,
        comments: state.comments.filter((c) => !(c.id === action.id && c.authorId === state.currentProfileId)),
      };
    case 'toggleLike':
      return withProfile(state, (p) => ({ ...p, liked: toggle(p.liked, action.postId) }));
    case 'toggleSave':
      return withProfile(state, (p) => ({ ...p, saved: toggle(p.saved, action.postId) }));
    case 'setShownBadges':
      return {
        ...state,
        users: state.users.map((x) =>
          x.id === state.currentProfileId
            ? { ...x, shownBadges: action.badges.filter((b) => x.ownedBadges.includes(b)) }
            : x,
        ),
      };
    case 'report': {
      if (!state.currentProfileId) return state;
      const post = state.posts.find((p) => p.id === action.postId);
      const next: AppState = {
        ...state,
        reports: [
          ...state.reports,
          {
            id: action.id,
            postId: action.postId,
            postTitle: post?.title ?? '',
            reporterId: state.currentProfileId,
            reason: action.reason,
            createdAt: action.at,
          },
        ],
      };
      return action.hide
        ? withProfile(next, (p) => ({ ...p, hidden: p.hidden.includes(action.postId) ? p.hidden : [...p.hidden, action.postId] }))
        : next;
    }
    case 'hidePost':
      return withProfile(state, (p) => ({
        ...p,
        hidden: p.hidden.includes(action.postId) ? p.hidden : [...p.hidden, action.postId],
      }));
    case 'unhidePost':
      return withProfile(state, (p) => ({ ...p, hidden: p.hidden.filter((x) => x !== action.postId) }));
    case 'block':
      if (action.userId === state.currentProfileId) return state;
      return withProfile(state, (p) => ({
        ...p,
        blocked: p.blocked.includes(action.userId) ? p.blocked : [...p.blocked, action.userId],
      }));
    case 'unblock':
      return withProfile(state, (p) => ({ ...p, blocked: p.blocked.filter((x) => x !== action.userId) }));
    case 'setTheme':
      return { ...state, theme: action.theme };
    case 'reset':
      return createSeedState(action.at);
  }
}

// ---------- 저장 ----------

function isValidState(x: unknown): x is AppState {
  if (!x || typeof x !== 'object') return false;
  const s = x as Partial<AppState>;
  return (
    s.version === 1 &&
    Array.isArray(s.users) &&
    Array.isArray(s.posts) &&
    Array.isArray(s.comments) &&
    Array.isArray(s.reports) &&
    typeof s.profiles === 'object' &&
    s.profiles !== null
  );
}

export function loadState(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isValidState(parsed)) {
        return { ...parsed, theme: parsed.theme ?? 'light' };
      }
    }
  } catch {
    // 저장 공간을 쓸 수 없는 환경(사생활 보호 모드 등)에서는 예시 상태로 시작한다.
  }
  return createSeedState();
}

export function saveState(state: AppState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 저장 실패는 화면 동작에 영향을 주지 않는다.
  }
}

/** 이 앱이 만든 키만 지운다. 다른 사이트·앱의 저장 데이터는 건드리지 않는다. */
export function clearAppStorage(): void {
  try {
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) keys.push(k);
    }
    keys.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // 무시
  }
}

// ---------- 조회 ----------

export function newId(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${rand}`;
}

export function profileStateOf(state: AppState): ProfileState {
  return (state.currentProfileId && state.profiles[state.currentProfileId]) || EMPTY_PROFILE_STATE;
}

/** 좋아요 수 = 예시 데이터의 기본값 + 이 브라우저의 데모 프로필들이 누른 수 */
export function likeCountOf(state: AppState, post: Post): number {
  let n = post.baseLikes;
  for (const p of Object.values(state.profiles)) if (p.liked.includes(post.id)) n++;
  return n;
}
