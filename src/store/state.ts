import { STORAGE_KEY, STORAGE_PREFIX } from '../config';
import { DEMO_OWNED_BADGES } from '../data/catalog';
import { createCuratedLinks } from '../data/curatedLinks';
import { createSeedLinks } from '../data/linkSeed';
import { normalizeUrl } from '../lib/links';
import { createSeedState, DEFAULT_LINK_PREFS, V4_POST_IDS } from '../data/seed';
import type { AppState, BadgeId, CategoryId, LinkItem, LinkPrefs, LinkRef, Post, ProfileState, SourceId, ThemeChoice } from '../types';

export type Action =
  | { type: 'createProfile'; id: string; nickname: string; schoolId: string }
  | { type: 'switchProfile'; id: string | null }
  | { type: 'verifyCurrent' }
  | { type: 'createPost'; id: string; category: CategoryId; title: string; body: string; at: number; link?: LinkRef }
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
  | { type: 'addLink'; item: LinkItem }
  | { type: 'updateLink'; id: string; patch: Partial<Omit<LinkItem, 'id' | 'kind'>> }
  | { type: 'deleteLink'; id: string }
  | { type: 'toggleSaveLink'; id: string }
  | { type: 'hideLink'; id: string }
  | { type: 'unhideLink'; id: string }
  | { type: 'excludeSource'; source: SourceId }
  | { type: 'includeSource'; source: SourceId }
  | { type: 'setShowExamples'; value: boolean }
  | { type: 'recordSearch'; query: string }
  | { type: 'reset'; at: number };

function withPrefs(state: AppState, fn: (p: LinkPrefs) => LinkPrefs): AppState {
  return { ...state, linkPrefs: fn(state.linkPrefs) };
}

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
        ...(action.link ? { link: action.link } : {}),
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
    case 'addLink':
      return { ...state, links: [action.item, ...state.links] };
    case 'updateLink':
      return {
        ...state,
        links: state.links.map((l) => (l.id === action.id && l.kind === 'manual' ? { ...l, ...action.patch } : l)),
      };
    case 'deleteLink':
      // 원문 삭제·삭제 요청에 대응: 카드와 저장·숨김 기록을 함께 지운다.
      return withPrefs(
        { ...state, links: state.links.filter((l) => l.id !== action.id) },
        (p) => ({ ...p, saved: p.saved.filter((x) => x !== action.id), hidden: p.hidden.filter((x) => x !== action.id) }),
      );
    case 'toggleSaveLink':
      return withPrefs(state, (p) => ({ ...p, saved: toggle(p.saved, action.id) }));
    case 'hideLink':
      return withPrefs(state, (p) => ({ ...p, hidden: p.hidden.includes(action.id) ? p.hidden : [...p.hidden, action.id] }));
    case 'unhideLink':
      return withPrefs(state, (p) => ({ ...p, hidden: p.hidden.filter((x) => x !== action.id) }));
    case 'excludeSource':
      return withPrefs(state, (p) => ({
        ...p,
        excludedSources: p.excludedSources.includes(action.source) ? p.excludedSources : [...p.excludedSources, action.source],
      }));
    case 'includeSource':
      return withPrefs(state, (p) => ({ ...p, excludedSources: p.excludedSources.filter((x) => x !== action.source) }));
    case 'setShowExamples':
      return withPrefs(state, (p) => ({ ...p, showExamples: action.value }));
    case 'recordSearch': {
      const q = action.query.trim();
      if (q.length < 2) return state;
      return withPrefs(state, (p) => ({ ...p, searches: [q, ...p.searches.filter((x) => x !== q)].slice(0, 30) }));
    }
    case 'reset':
      return createSeedState(action.at);
  }
}

// ---------- 저장 ----------

type StoredState = Omit<AppState, 'version' | 'links' | 'linkPrefs'> & {
  version: 1 | 2 | 3 | 4 | 5;
  links?: LinkItem[];
  linkPrefs?: LinkPrefs;
};

function isValidState(x: unknown): x is StoredState {
  if (!x || typeof x !== 'object') return false;
  const s = x as Partial<StoredState>;
  return (
    typeof s.version === 'number' &&
    s.version >= 1 &&
    s.version <= 5 &&
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
        const now = Date.now();
        // 1판(모아보기 이전)에서 만든 글·프로필은 그대로 두고 모아보기 데이터만 더한다.
        let links = Array.isArray(parsed.links) ? parsed.links : createSeedLinks(now);
        // 3판 이전 데이터에는 실제 링크 12개를 한 번만 더한다(같은 주소를 이미 등록했으면 건너뛴다).
        // 3판부터는 사용자가 지운 링크를 다시 살리지 않는다.
        if (parsed.version < 3) {
          const missing = createCuratedLinks(now).filter(
            (c) => !links.some((l) => l.id === c.id || (l.url && c.url && normalizeUrl(l.url) === normalizeUrl(c.url))),
          );
          links = [...missing, ...links];
        }
        let posts = parsed.posts;
        let comments = parsed.comments;
        // 4판: 예시 카드 본문 일부, 10월 모의고사 예시 카드·RECESS 글을 한 번만 더한다.
        if (parsed.version < 4) {
          const fresh = createSeedState(now);
          const freshExamples = new Map(fresh.links.filter((l) => l.kind === 'example').map((l) => [l.id, l]));
          links = links.map((l) =>
            l.kind === 'example' && !l.excerpt && freshExamples.get(l.id)?.excerpt
              ? { ...l, excerpt: freshExamples.get(l.id)!.excerpt }
              : l,
          );
          const newExamples = [...freshExamples.values()].filter((e) => !links.some((l) => l.id === e.id));
          links = [...links, ...newExamples];
          const newPosts = fresh.posts.filter((p) => V4_POST_IDS.includes(p.id) && !posts.some((x) => x.id === p.id));
          posts = [...newPosts, ...posts];
          comments = [
            ...comments,
            ...fresh.comments.filter((c) => newPosts.some((p) => p.id === c.postId)),
          ];
        }
        const linkPrefs = { ...DEFAULT_LINK_PREFS, ...(parsed.linkPrefs ?? {}) };
        // 5판: 예시 카드를 한 번 숨긴다. 그 뒤로는 설정에서 켠 값을 그대로 둔다.
        if (parsed.version < 5) linkPrefs.showExamples = false;
        return {
          ...parsed,
          version: 5,
          theme: parsed.theme ?? 'light',
          posts,
          comments,
          links,
          linkPrefs,
        };
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
