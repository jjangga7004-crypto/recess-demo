import { SOURCES, SOURCE_ORDER } from '../data/sources';
import { KEYWORD_BY_ID, matchesKeyword } from './keywords';
import type { CollectFilters, LinkItem, LinkPrefs, LinkRef, SourceId } from '../types';

export const DEFAULT_COLLECT_FILTERS: CollectFilters = { query: '', source: 'all', topic: 'all', keyword: null };

/**
 * 공개 원문 주소를 정리한다. http/https만 받고, #조각과 utm 추적값은 뺀다.
 * 형식만 확인하며 페이지를 열어 내용을 가져오지 않는다.
 */
export function normalizeUrl(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (!url.hostname.includes('.')) return null;
  url.hash = '';
  for (const key of Array.from(url.searchParams.keys())) {
    if (key.toLowerCase().startsWith('utm_')) url.searchParams.delete(key);
  }
  url.hostname = url.hostname.toLowerCase();
  let href = url.toString();
  if (url.pathname !== '/' && href.endsWith('/') && !url.search) href = href.slice(0, -1);
  return href;
}

/** 주소의 도메인으로 출처를 추정한다. 모르면 null. */
export function guessSource(href: string): SourceId | null {
  try {
    const url = new URL(href);
    for (const id of SOURCE_ORDER) {
      if (
        SOURCES[id].match.some(
          (m) => url.hostname === m.host && (!m.pathPrefix || url.pathname.toLowerCase().startsWith(m.pathPrefix)),
        )
      ) {
        return id;
      }
    }
  } catch {
    // 무시
  }
  return null;
}

/** 같은 원문 주소가 이미 있는지(URL 기준 중복 제거) */
export function findDuplicate(links: LinkItem[], href: string, exceptId?: string): LinkItem | undefined {
  return links.find((l) => l.url && l.id !== exceptId && normalizeUrl(l.url) === href);
}

export function sourceLabel(item: Pick<LinkItem, 'source' | 'sourceName'>): string {
  if (item.source === 'etc' && item.sourceName?.trim()) return item.sourceName.trim();
  return SOURCES[item.source].name;
}

export function hostOf(href: string): string {
  try {
    return new URL(href).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function toLinkRef(item: LinkItem): LinkRef {
  return {
    itemId: item.id,
    kind: item.kind,
    source: item.source,
    sourceName: sourceLabel(item),
    title: item.title,
    url: item.url,
  };
}

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '');
}

/** 모아보기에 보일 카드: 승인된 것 · 숨기지 않은 것 · 제외하지 않은 출처 */
export function visibleLinks(links: LinkItem[], prefs: LinkPrefs): LinkItem[] {
  return links.filter(
    (l) =>
      l.status === 'published' &&
      !prefs.hidden.includes(l.id) &&
      !prefs.excludedSources.includes(l.source) &&
      (prefs.showExamples || l.kind !== 'example'),
  );
}

export function filterLinks(links: LinkItem[], prefs: LinkPrefs, f: CollectFilters): LinkItem[] {
  const q = norm(f.query);
  const kw = f.keyword ? KEYWORD_BY_ID[f.keyword] : undefined;
  return visibleLinks(links, prefs).filter(
    (l) =>
      (f.source === 'all' || l.source === f.source) &&
      (f.topic === 'all' || l.topic === f.topic) &&
      (!kw || matchesKeyword(`${l.title} ${l.summary} ${l.excerpt ?? ''}`, kw)) &&
      (!q || norm(l.title).includes(q) || norm(l.summary).includes(q) || norm(l.excerpt ?? '').includes(q)),
  );
}

/** 출처가 허용했거나 예시 카드일 때만 본문 일부를 보여준다. */
export function canShowExcerpt(item: LinkItem): boolean {
  return !!item.excerpt && (item.kind === 'example' || SOURCES[item.source].excerpt === '허용');
}

/**
 * 한 피드에 섞어 최신 등록순으로 보여줘도 되는 카드와, 원래 순서를 지켜 따로 보여줘야 하는 카드를 나눈다.
 * 직접 등록·예시 카드는 RECESS가 쓴 소개라 섞을 수 있다. 자동 수집 카드는 그 출처가 혼합·재정렬을 허용할 때만 섞는다.
 */
export function partitionForDisplay(items: LinkItem[]) {
  const mixed: LinkItem[] = [];
  const separate = new Map<SourceId, LinkItem[]>();
  for (const item of items) {
    const cfg = SOURCES[item.source];
    if (item.kind === 'auto' && (cfg.mix !== '허용' || cfg.reorder !== '허용')) {
      separate.set(item.source, [...(separate.get(item.source) ?? []), item]);
    } else {
      mixed.push(item);
    }
  }
  mixed.sort((a, b) => b.addedAt - a.addedAt);
  return { mixed, separate };
}
