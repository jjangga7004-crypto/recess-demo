import { splitHighlight } from '../lib/feed';
import { useApp } from '../store/AppContext';
import type { LinkItem } from '../types';
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
 * 외부 글에는 RECESS 학생 인증·학교 표시를 붙이지 않는다.
 */
export function LinkCard({ item, query = '' }: { item: LinkItem; query?: string }) {
  const { flashId } = useApp();
  const { label, openDetail, menuItems } = useLinkActions(item);
  const talks = useTalkCount(item.id);

  return (
    <article
      className={`link-card${flashId === item.id ? ' is-new' : ''}`}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return;
        openDetail();
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
        <button type="button" className="title-btn" onClick={openDetail}>
          <Hl text={item.title} query={query} />
        </button>
      </h3>
      <p className="link-summary clamp-2">
        <Hl text={item.summary} query={query} />
      </p>
      <div className="link-meta">
        <LinkTimes item={item} />
      </div>
      <div className="link-stats">
        <span className="stat stat-origin">
          {typeof item.originalReplies === 'number'
            ? `원문 댓글 ${item.originalReplies}${item.kind === 'example' ? ' (예시)' : ''}`
            : '원문 반응 정보 없음'}
        </span>
        <span className="stat stat-recess">RECESS 이야기 {talks}</span>
      </div>
      <div className="link-actions">
        <OpenOriginal item={item} />
        <TalkButton item={item} compact />
        <SaveLinkButton item={item} />
      </div>
    </article>
  );
}
