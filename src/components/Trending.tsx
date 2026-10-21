import { useMemo } from 'react';
import { computeTrending } from '../lib/trending';
import { useApp } from '../store/AppContext';

export function useTrending(limit = 8) {
  const { state, ps, me, now } = useApp();
  return useMemo(() => computeTrending(state, ps, me?.id ?? null, now, limit), [state, ps, me, now, limit]);
}

/** 인기 주제를 누르면 그 주제의 모아보기 카드와 RECESS 글을 한 화면에 모은다. */
export function useSelectKeyword() {
  const { collectFilters, setCollectFilters, setView } = useApp();
  return (id: string) => {
    setCollectFilters({ keyword: collectFilters.keyword === id ? null : id, query: '', source: 'all', topic: 'all' });
    setView('collect');
  };
}

const NOTE = '모아보기·RECESS 글과 이 기기의 검색을 기준으로 계산해요. 전체 사용자 실시간 집계는 아니에요.';

/** 데스크톱 오른쪽 영역용 순위 목록 */
export function TrendingRail() {
  const trends = useTrending(8);
  const select = useSelectKeyword();
  const { collectFilters } = useApp();
  if (trends.length === 0) return null;
  return (
    <section className="card rail-card" aria-labelledby="trend-rail-title">
      <h2 id="trend-rail-title" className="rail-title">
        인기 주제
      </h2>
      <ol className="trend-list">
        {trends.map((t, i) => (
          <li key={t.keyword.id}>
            <button
              type="button"
              className={`trend-item${collectFilters.keyword === t.keyword.id ? ' is-active' : ''}`}
              aria-pressed={collectFilters.keyword === t.keyword.id}
              onClick={() => select(t.keyword.id)}
            >
              <span className={`trend-rank${i < 3 ? ' is-top' : ''}`}>{i + 1}</span>
              <span className="trend-label">{t.keyword.label}</span>
              <span className="trend-count">글 {t.count}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="rail-note">{NOTE}</p>
    </section>
  );
}

/** 모바일·태블릿용 가로 띠 (오른쪽 영역이 없을 때) */
export function TrendingStrip() {
  const trends = useTrending(8);
  const select = useSelectKeyword();
  const { collectFilters } = useApp();
  if (trends.length === 0) return null;
  return (
    <div className="trend-strip">
      <div className="chip-row" role="group" aria-label="인기 주제" title={NOTE}>
        <span className="chip-row-label" aria-hidden>
          인기
        </span>
        {trends.map((t, i) => (
          <button
            key={t.keyword.id}
            type="button"
            className={`chip trend-chip${collectFilters.keyword === t.keyword.id ? ' is-active' : ''}`}
            aria-pressed={collectFilters.keyword === t.keyword.id}
            onClick={() => select(t.keyword.id)}
          >
            <span className={`trend-rank${i < 3 ? ' is-top' : ''}`}>{i + 1}</span>
            {t.keyword.label}
          </button>
        ))}
      </div>
    </div>
  );
}
