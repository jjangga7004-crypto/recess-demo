import { useId } from 'react';
import { IconLink, IconSearch, IconX } from '../components/icons';
import { LinkCard } from '../components/LinkCard';
import { CATEGORIES } from '../data/catalog';
import { AUTO_CONNECTED_COUNT, SOURCE_ORDER, SOURCES } from '../data/sources';
import { filterLinks, partitionForDisplay, visibleLinks } from '../lib/links';
import { useApp } from '../store/AppContext';
import type { CategoryId, SourceId } from '../types';

export function CollectView() {
  const { state, dispatch, collectFilters: f, setCollectFilters, resetCollectFilters, openModal, setView } = useApp();
  const searchId = useId();
  const prefs = state.linkPrefs;
  const items = filterLinks(state.links, prefs, f);
  const { mixed, separate } = partitionForDisplay(items);
  const manualCount = state.links.filter((l) => l.kind === 'manual').length;
  const exampleCount = state.links.filter((l) => l.kind === 'example').length;
  const active = f.query.trim() !== '' || f.source !== 'all' || f.topic !== 'all';
  const visibleCount = (src: SourceId) => visibleLinks(state.links, prefs).filter((l) => l.source === src).length;
  const selectedExcluded = f.source !== 'all' && prefs.excludedSources.includes(f.source);

  return (
    <div className="view collect">
      <div className="view-head">
        <div>
          <h1 className="view-title">모아보기</h1>
          <p className="view-sub">여러 커뮤니티의 학생 이야기를 한곳에서 찾고, RECESS에서 이야기해요.</p>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => openModal({ type: 'linkForm' })}>
          <IconLink size={16} /> 링크 등록
        </button>
      </div>

      <div className="status-strip" role="note">
        <span>
          {AUTO_CONNECTED_COUNT === 0 ? '자동으로 가져오는 출처는 없어요. ' : `자동 연결 ${AUTO_CONNECTED_COUNT}곳 · `}
          직접 등록한 링크 <strong>{manualCount}</strong>개
          {prefs.showExamples && (
            <>
              {' '}
              · 예시 콘텐츠 <strong>{exampleCount}</strong>개
            </>
          )}
          로 채워져 있어요.
        </span>
        <button type="button" className="text-btn" onClick={() => setView('settings')}>
          연결 상태 보기
        </button>
      </div>

      <div className="feed-controls">
        <div className="search">
          <label htmlFor={searchId} className="sr-only">
            모아보기 검색
          </label>
          <IconSearch size={18} className="search-icon" />
          <input
            id={searchId}
            type="search"
            className="search-input"
            placeholder="제목이나 소개로 검색"
            value={f.query}
            onChange={(e) => setCollectFilters({ query: e.target.value })}
            autoComplete="off"
          />
          {f.query && (
            <button
              type="button"
              className="icon-btn icon-btn-sm search-clear"
              onClick={() => setCollectFilters({ query: '' })}
              aria-label="검색어 지우기"
            >
              <IconX size={16} />
            </button>
          )}
        </div>

        <div className="chip-row" role="group" aria-label="출처">
          <span className="chip-row-label" aria-hidden>
            출처
          </span>
          <button
            type="button"
            className={`chip${f.source === 'all' ? ' is-active' : ''}`}
            aria-pressed={f.source === 'all'}
            onClick={() => setCollectFilters({ source: 'all' })}
          >
            전체
          </button>
          {SOURCE_ORDER.map((id) => {
            const excluded = prefs.excludedSources.includes(id);
            return (
              <button
                key={id}
                type="button"
                className={`chip chip-source-${id}${f.source === id ? ' is-active' : ''}${excluded ? ' is-excluded' : ''}`}
                aria-pressed={f.source === id}
                onClick={() => setCollectFilters({ source: id })}
              >
                {SOURCES[id].name}
                <span className="chip-count">{excluded ? '제외' : visibleCount(id)}</span>
              </button>
            );
          })}
        </div>

        <div className="chip-row" role="group" aria-label="주제">
          <span className="chip-row-label" aria-hidden>
            주제
          </span>
          {[{ id: 'all' as const, label: '전체' }, ...CATEGORIES].map((c) => (
            <button
              key={c.id}
              type="button"
              className={`chip${f.topic === c.id ? ' is-active' : ''}`}
              aria-pressed={f.topic === c.id}
              onClick={() => setCollectFilters({ topic: c.id as CategoryId | 'all' })}
            >
              {c.label}
            </button>
          ))}
        </div>

        {prefs.excludedSources.length > 0 && (
          <div className="inline-note excluded-note">
            <span>제외한 출처: {prefs.excludedSources.map((s) => SOURCES[s].name).join(', ')}</span>
            {prefs.excludedSources.map((s) => (
              <button key={s} type="button" className="text-btn" onClick={() => dispatch({ type: 'includeSource', source: s })}>
                {SOURCES[s].name} 다시 보기
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="result-bar" aria-live="polite">
        <span>
          카드 <strong>{items.length}개</strong>
          <span className="muted"> · 최신 등록순</span>
        </span>
        {active && (
          <button type="button" className="text-btn" onClick={resetCollectFilters}>
            필터 초기화
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="card empty">
          {selectedExcluded ? (
            <>
              <p className="empty-title">{SOURCES[f.source as SourceId].name}는 제외한 출처예요</p>
              <p className="empty-text">다시 포함하면 이 출처의 카드가 모아보기에 보여요.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => dispatch({ type: 'includeSource', source: f.source as SourceId })}
              >
                다시 포함하기
              </button>
            </>
          ) : (
            <>
              <p className="empty-title">조건에 맞는 카드가 없어요</p>
              <p className="empty-text">검색어나 필터를 바꾸거나, 찾은 글을 직접 등록해 보세요.</p>
              <div className="empty-actions">
                <button type="button" className="btn btn-outline" onClick={resetCollectFilters}>
                  필터 초기화
                </button>
                <button type="button" className="btn btn-primary" onClick={() => openModal({ type: 'linkForm' })}>
                  링크 등록
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="link-list">
            {mixed.map((item) => (
              <LinkCard key={item.id} item={item} query={f.query} />
            ))}
          </div>
          {/* 혼합·재정렬이 허용되지 않은 자동 수집 출처는 원래 순서 그대로 따로 보여준다. */}
          {Array.from(separate.entries()).map(([src, list]) => (
            <section key={src} className="separate-area" aria-label={`${SOURCES[src].name} 원래 순서`}>
              <h2 className="section-title">{SOURCES[src].name} · 원래 순서 그대로</h2>
              <div className="link-list">
                {list.map((item) => (
                  <LinkCard key={item.id} item={item} query={f.query} />
                ))}
              </div>
            </section>
          ))}
          <p className="feed-end">예시 콘텐츠는 실제 커뮤니티 글이 아니에요. 실제 링크는 직접 등록한 것만 원문으로 연결돼요.</p>
        </>
      )}
    </div>
  );
}
