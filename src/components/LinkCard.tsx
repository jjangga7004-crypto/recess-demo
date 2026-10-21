import { splitHighlight } from '../lib/feed';
import { canShowExcerpt } from '../lib/links';
import { useApp } from '../store/AppContext';
import type { LinkItem } from '../types';
import { IconExternal } from './icons';
import { KindTag, LinkTimes, OpenOriginal, SaveLinkButton, SourceBadge, TalkButton, topicLabel, useLinkActions, useTalkCount } from './LinkParts';
import { ActionMenu } from './Menu';

function Hl({ text, query }: { text: string; query: string }) {
  return (
    <>
      {splitHighlight(text, query).map((p, i) => (p.hit ? <mark key={i}>{p.text}</mark> : <span key={i}>{p.text}</span>))}
    </>
  );
}

/**
 * 모아보기 카드. 출처와 제목이 먼저 읽히도록 배치한다.
 * 실제 링크는 카드를 누르면 원문이 새 탭으로 열린다. 예시 카드는 앱 안의 예시 상세로 열린다.
 * 본문 일부는 예시 카드이거나 출처가 허용한 경우에만 보여주고, 그 밖에는 직접 쓴 소개를 보여준다.
 * 외부 글에는 RECESS 학생 인증·학교 표시를 붙이지 않는다.
 */
export function LinkCard({ item, query = '' }: { item: LinkItem; query?: string }) {
  const { flashId } = useApp();
  const { label, openDetail, menuItems } = useLinkActions(item);
  const talks = useTalkCount(item.id);
  const showExcerpt = canShowExcerpt(item);

  const openPrimary = () => {
    if (item.url) window.open(item.url, '_blank', 'noopener,noreferrer');
    else openDetail();
  };

  return (
    <article
      className={`link-card${flashId === item.id ? ' is-new' : ''}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return;
        openPrimary();
      }}
    >
      <div className="link-top">
        <SourceBadge source={item.source} name={label} />
        <span className="topic-tag">{topicLabel(item)}</span>
        <KindTag kind={item.kind} />
        <span className="link-top-spacer" />
        <ActionMenu items={menuItems} label="카드 메뉴" />
      </div>
      <h3 className="link-title">
        {item.url ? (
          <a className="title-link" href={item.url} target="_blank" rel="noopener noreferrer nofollow">
            <Hl text={item.title} query={query} />
            <IconExternal size={14} className="title-ext" />
            <span className="sr-only"> (새 탭에서 원문 열기)</span>
          </a>
        ) : (
          <button type="button" className="title-btn" onClick={openDetail}>
            <Hl text={item.title} query={query} />
          </button>
        )}
      </h3>
      {showExcerpt ? (
        <blockquote className="link-excerpt">
          <span className="excerpt-label">본문 일부{item.kind === 'example' ? ' · 예시' : ''}</span>
          <p className="clamp-3">
            <Hl text={item.excerpt!} query={query} />
          </p>
        </blockquote>
      ) : (
        <p className="link-summary clamp-2">
          <span className="summary-label">소개</span>
          <Hl text={item.summary} query={query} />
        </p>
      )}
      <div className="link-meta">
        <LinkTimes item={item} />
      </div>
      <div className="link-stats">
        <span className="stat stat-origin">
          {typeof item.originalReplies === 'number'
            ? `원문 댓글 ${item.originalReplies}${item.kind === 'example' ? ' (예시)' : ''}`
            : '원문 반응 정보 없음'}
        </span>
        <button type="button" className="stat stat-recess" onClick={openDetail}>
          RECESS 이야기 {talks}
        </button>
      </div>
      <div className="link-actions">
        <OpenOriginal item={item} />
        <TalkButton item={item} compact />
        <SaveLinkButton item={item} />
      </div>
    </article>
  );
}
