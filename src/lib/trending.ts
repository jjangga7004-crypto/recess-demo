import { likeCountOf } from '../store/state';
import type { AppState, Post, ProfileState } from '../types';
import { commentCount, isPostVisible } from './feed';
import { matchesKeyword, TREND_KEYWORDS, type TrendKeyword } from './keywords';
import { visibleLinks } from './links';

export interface TrendItem {
  keyword: TrendKeyword;
  score: number;
  /** 이 주제가 나온 모아보기 카드 + RECESS 글 수 */
  count: number;
}

// 최근에 많이 나온 주제가 올라오도록 12시간마다 무게가 약 1/e로 줄어든다.
const HALF_LIFE_MS = 12 * 3600_000;

/**
 * 인기 주제 순위. 서버가 없으므로 전체 사용자의 실시간 검색어가 아니라
 * 이 앱에 보이는 글(최근일수록·반응이 많을수록 가중)과 이 기기의 검색 기록으로 계산한다.
 */
export function computeTrending(state: AppState, ps: ProfileState, meId: string | null, now: number, limit = 8): TrendItem[] {
  const links = visibleLinks(state.links, state.linkPrefs);
  const posts = state.posts.filter((p) => isPostVisible(p, ps, meId));
  const talks = new Map<string, number>();
  for (const p of posts) if (p.link) talks.set(p.link.itemId, (talks.get(p.link.itemId) ?? 0) + 1);
  const recency = (ts: number) => Math.exp(-Math.max(0, now - ts) / HALF_LIFE_MS);

  return TREND_KEYWORDS.map((keyword) => {
    let score = 0;
    let count = 0;
    for (const l of links) {
      if (!matchesKeyword(`${l.title} ${l.summary} ${l.excerpt ?? ''}`, keyword)) continue;
      count++;
      score += recency(l.addedAt) * (1 + (talks.get(l.id) ?? 0));
    }
    for (const p of posts) {
      if (!matchesKeyword(postText(p), keyword)) continue;
      count++;
      score += recency(p.createdAt) * (1 + likeCountOf(state, p) / 40 + commentCount(state, p.id, ps) / 4);
    }
    for (const q of state.linkPrefs.searches) if (matchesKeyword(q, keyword)) score += 1.5;
    return { keyword, score, count };
  })
    .filter((t) => t.count > 0)
    .sort((a, b) => b.score - a.score || b.count - a.count)
    .slice(0, limit);
}

export function postText(p: Post): string {
  return `${p.title} ${p.body} ${p.link?.title ?? ''}`;
}
