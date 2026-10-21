import { Fragment, useId } from 'react';
import { AcademyAdCard, PlannerAdCard } from '../components/AdCard';
import { Avatar } from '../components/Author';
import { IconPen, IconSearch, IconX } from '../components/icons';
import { CATEGORIES, REGION_LABEL, REGIONS, SCHOOL_BY_ID, SCHOOLS } from '../data/catalog';
import { filterFeed, hasActiveFilters } from '../lib/feed';
import { PostCard } from '../components/PostCard';
import { useApp } from '../store/AppContext';
import type { CategoryId, RegionId, SortId } from '../types';

// 광고는 피드 n번째 글 뒤에 끼운다.
const AD_SLOTS: Record<number, 'academy' | 'planner'> = { 4: 'academy', 12: 'planner' };

/** RECESS 자체 커뮤니티: 학생 인증·학교 표시 기반으로 직접 쓰고 대화하는 피드 */
export function CommunityView() {
  const { state, me, ps, filters, setFilters, resetFilters, gate, openModal } = useApp();
  const searchId = useId();
  const schoolId = useId();
  const posts = filterFeed(state, filters, me, ps);
  const active = hasActiveFilters(filters);

  const schoolOptions = SCHOOLS.filter((s) => filters.region === 'all' || s.region === filters.region);

  const setRegion = (region: RegionId | 'all') => {
    const keepSchool =
      filters.school === 'all' ||
      filters.school === 'mine' ||
      region === 'all' ||
      SCHOOL_BY_ID[filters.school]?.region === region;
    setFilters({ region, school: keepSchool ? filters.school : 'all' });
  };

  const setSchool = (value: string) => {
    if (value === 'mine' && !me?.verified) {
      gate(() => setFilters({ school: 'mine' }));
      return;
    }
    setFilters({ school: value });
  };

  const summary = describeFilters(filters, me ? SCHOOL_BY_ID[me.schoolId]?.name : undefined);

  return (
    <div className="view home">
      <div className="view-head">
        <div>
          <h1 className="view-title">RECESS</h1>
          <p className="view-sub">학교와 재학 여부가 확인된 학생끼리 이야기하는 곳이에요. 실명·반·번호는 보이지 않아요.</p>
        </div>
      </div>
      <div className="feed-controls">
        <div className="search">
          <label htmlFor={searchId} className="sr-only">
            게시글 검색
          </label>
          <IconSearch size={18} className="search-icon" />
          <input
            id={searchId}
            type="search"
            className="search-input"
            placeholder="제목이나 내용으로 검색"
            value={filters.query}
            onChange={(e) => setFilters({ query: e.target.value })}
            autoComplete="off"
          />
          {filters.query && (
            <button type="button" className="icon-btn icon-btn-sm search-clear" onClick={() => setFilters({ query: '' })} aria-label="검색어 지우기">
              <IconX size={16} />
            </button>
          )}
        </div>

        <div className="cat-tabs" role="group" aria-label="카테고리">
          {[{ id: 'all' as const, label: '전체' }, ...CATEGORIES].map((c) => (
            <button
              key={c.id}
              type="button"
              className={`cat-tab${filters.category === c.id ? ' is-active' : ''}`}
              aria-pressed={filters.category === c.id}
              onClick={() => setFilters({ category: c.id as CategoryId | 'all' })}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="filter-row">
          <div className="seg" role="group" aria-label="지역">
            {[{ id: 'all' as const, label: '전체', note: undefined }, ...REGIONS].map((r) => (
              <button
                key={r.id}
                type="button"
                className={`seg-btn${filters.region === r.id ? ' is-active' : ''}`}
                aria-pressed={filters.region === r.id}
                onClick={() => setRegion(r.id as RegionId | 'all')}
              >
                {r.label}
                {r.note && <span className="seg-note">예시</span>}
              </button>
            ))}
          </div>

          <div className="filter-right">
            <label htmlFor={schoolId} className="sr-only">
              학교
            </label>
            <select id={schoolId} className="select" value={filters.school} onChange={(e) => setSchool(e.target.value)}>
              <option value="all">전체 학교</option>
              <option value="mine">우리 학교{me ? ` (${SCHOOL_BY_ID[me.schoolId]?.name})` : ''}</option>
              {(filters.region === 'all' ? REGIONS : REGIONS.filter((r) => r.id === filters.region)).map((r) => (
                <optgroup key={r.id} label={REGION_LABEL[r.id]}>
                  {schoolOptions
                    .filter((s) => s.region === r.id)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>

            <div className="seg seg-sort" role="group" aria-label="정렬">
              {(
                [
                  ['latest', '최신'],
                  ['popular', '인기'],
                ] as [SortId, string][]
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`seg-btn${filters.sort === id ? ' is-active' : ''}`}
                  aria-pressed={filters.sort === id}
                  onClick={() => setFilters({ sort: id })}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filters.region === 'mokdong' && (
          <p className="inline-note">목동 글은 확장 시나리오를 보여주는 예시 콘텐츠예요.</p>
        )}
      </div>

      <button type="button" className="card compose-prompt" onClick={() => gate(() => openModal({ type: 'compose' }))}>
        {me ? <Avatar user={me} size={36} /> : <span className="compose-prompt-icon"><IconPen size={18} /></span>}
        <span className="compose-prompt-text">쉬는 시간에 나누고 싶은 이야기가 있어요?</span>
        <span className="btn btn-primary btn-sm" aria-hidden>
          글쓰기
        </span>
      </button>

      <div className="result-bar" aria-live="polite">
        <span>
          {summary} · <strong>{posts.length}개</strong>
          <span className="muted"> · {filters.sort === 'latest' ? '최신 작성 순' : '좋아요 많은 순'}</span>
        </span>
        {active && (
          <button type="button" className="text-btn" onClick={resetFilters}>
            필터 초기화
          </button>
        )}
      </div>

      {posts.length === 0 ? (
        <div className="card empty">
          <p className="empty-title">조건에 맞는 글이 없어요</p>
          <p className="empty-text">검색어를 바꾸거나 필터를 초기화해 보세요.</p>
          <button type="button" className="btn btn-primary" onClick={resetFilters}>
            필터 초기화
          </button>
        </div>
      ) : (
        <div className="feed">
          {posts.map((p, i) => (
            <Fragment key={p.id}>
              <PostCard post={p} query={filters.query} />
              {AD_SLOTS[i + 1] === 'academy' && <AcademyAdCard />}
              {AD_SLOTS[i + 1] === 'planner' && <PlannerAdCard />}
            </Fragment>
          ))}
          <p className="feed-end">여기까지가 예시 게시글이에요.</p>
        </div>
      )}
    </div>
  );
}

function describeFilters(
  f: { category: CategoryId | 'all'; region: RegionId | 'all'; school: string; query: string },
  mySchool?: string,
): string {
  const parts: string[] = [];
  if (f.school === 'mine') parts.push(mySchool ? `우리 학교(${mySchool})` : '우리 학교');
  else if (f.school !== 'all') parts.push(SCHOOL_BY_ID[f.school]?.name ?? '');
  else if (f.region !== 'all') parts.push(REGION_LABEL[f.region]);
  if (f.category !== 'all') parts.push(CATEGORIES.find((c) => c.id === f.category)?.label ?? '');
  if (f.query.trim()) parts.push(`"${f.query.trim()}" 검색`);
  return parts.length ? parts.join(' · ') : '모든 학교의 글';
}
