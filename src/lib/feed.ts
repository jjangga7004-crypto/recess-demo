import { SCHOOL_BY_ID } from '../data/catalog';
import { likeCountOf } from '../store/state';
import type { AppState, Comment, FeedFilters, Post, ProfileState, User } from '../types';

export const DEFAULT_FILTERS: FeedFilters = {
  query: '',
  category: 'all',
  region: 'all',
  school: 'all',
  sort: 'latest',
};

export function hasActiveFilters(f: FeedFilters): boolean {
  return f.query.trim() !== '' || f.category !== 'all' || f.region !== 'all' || f.school !== 'all';
}

/** 띄어쓰기·대소문자 차이를 무시하고 비교한다("오답 노트" = "오답노트"). */
function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '');
}

export function matchesQuery(post: Post, query: string): boolean {
  const q = norm(query);
  if (!q) return true;
  return norm(post.title).includes(q) || norm(post.body).includes(q);
}

/** 차단·숨김을 반영해 지금 프로필에게 보이는 글인지 */
export function isPostVisible(post: Post, ps: ProfileState, meId: string | null): boolean {
  if (ps.hidden.includes(post.id)) return false;
  if (post.authorId !== meId && ps.blocked.includes(post.authorId)) return false;
  return true;
}

export function visibleComments(state: AppState, postId: string, ps: ProfileState): Comment[] {
  return state.comments
    .filter((c) => c.postId === postId && (c.authorId === state.currentProfileId || !ps.blocked.includes(c.authorId)))
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function commentCount(state: AppState, postId: string, ps: ProfileState): number {
  return visibleComments(state, postId, ps).length;
}

export function sortPosts(state: AppState, posts: Post[], sort: FeedFilters['sort'], ps: ProfileState): Post[] {
  const list = [...posts];
  if (sort === 'latest') {
    list.sort((a, b) => b.createdAt - a.createdAt);
  } else {
    // 인기 = 좋아요 수. 같으면 댓글 수, 그다음 최신 순.
    const likes = new Map(list.map((p) => [p.id, likeCountOf(state, p)]));
    const comments = new Map(list.map((p) => [p.id, commentCount(state, p.id, ps)]));
    list.sort(
      (a, b) =>
        likes.get(b.id)! - likes.get(a.id)! ||
        comments.get(b.id)! - comments.get(a.id)! ||
        b.createdAt - a.createdAt,
    );
  }
  return list;
}

export function filterFeed(state: AppState, filters: FeedFilters, me: User | null, ps: ProfileState): Post[] {
  const meId = me?.id ?? null;
  const list = state.posts.filter((post) => {
    if (!isPostVisible(post, ps, meId)) return false;
    if (filters.category !== 'all' && post.category !== filters.category) return false;
    const author = state.users.find((x) => x.id === post.authorId);
    const school = author ? SCHOOL_BY_ID[author.schoolId] : undefined;
    if (filters.region !== 'all' && school?.region !== filters.region) return false;
    if (filters.school === 'mine') {
      if (!me || author?.schoolId !== me.schoolId) return false;
    } else if (filters.school !== 'all' && author?.schoolId !== filters.school) {
      return false;
    }
    return matchesQuery(post, filters.query);
  });
  return sortPosts(state, list, filters.sort, ps);
}

/** 검색어와 일치하는 부분을 강조하기 위해 문자열을 나눈다(띄어쓰기까지 같은 경우만). */
export function splitHighlight(text: string, query: string): { text: string; hit: boolean }[] {
  const q = query.trim();
  if (!q) return [{ text, hit: false }];
  const lower = text.toLowerCase();
  const ql = q.toLowerCase();
  const parts: { text: string; hit: boolean }[] = [];
  let i = 0;
  while (i < text.length) {
    const j = lower.indexOf(ql, i);
    if (j === -1) {
      parts.push({ text: text.slice(i), hit: false });
      break;
    }
    if (j > i) parts.push({ text: text.slice(i, j), hit: false });
    parts.push({ text: text.slice(j, j + q.length), hit: true });
    i = j + q.length;
  }
  return parts;
}
