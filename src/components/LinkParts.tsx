import { CATEGORY_LABEL } from '../data/catalog';
import { SOURCES } from '../data/sources';
import { hostOf, sourceLabel } from '../lib/links';
import { fullDate, timeAgo } from '../lib/format';
import { useApp } from '../store/AppContext';
import type { LinkItem, LinkRef, SourceId } from '../types';
import { IconBookmark, IconChat, IconExternal, IconEyeOff, IconBan, IconEdit, IconTrash } from './icons';
import type { MenuItem } from './Menu';

export function SourceBadge({ source, name }: { source: SourceId; name?: string }) {
  return <span className={`source-badge source-${source}`}>{name ?? SOURCES[source].name}</span>;
}

export function KindTag({ kind }: { kind: LinkItem['kind'] }) {
  if (kind === 'example') return <span className="kind-tag kind-example">예시 콘텐츠</span>;
  if (kind === 'manual') return <span className="kind-tag kind-manual">직접 등록</span>;
  return <span className="kind-tag kind-auto">자동 수집</span>;
}

/** 원문 게시 시각과 등록 시각을 구분해 보여준다. 게시 시각을 모르면 적지 않는다. */
export function LinkTimes({ item }: { item: LinkItem }) {
  const { now } = useApp();
  return (
    <>
      {item.postedAt ? (
        item.kind === 'manual' ? (
          // 직접 등록할 때는 날짜만 입력받으므로 날짜로만 보여준다.
          <span>
            원문 {new Date(item.postedAt).getMonth() + 1}월 {new Date(item.postedAt).getDate()}일 게시
          </span>
        ) : (
          <span title={fullDate(item.postedAt)}>원문 {timeAgo(item.postedAt, now)} 게시</span>
        )
      ) : (
        <span className="muted">원문 게시 시각 모름</span>
      )}
      <span aria-hidden>·</span>
      <span title={fullDate(item.addedAt)}>
        {item.kind === 'auto' ? '수집' : '등록'} {timeAgo(item.addedAt, now)}
      </span>
    </>
  );
}

/** RECESS 안에서 이 링크를 두고 쓴 글 수 */
export function useTalkCount(itemId: string): number {
  const { state } = useApp();
  return state.posts.filter((p) => p.link?.itemId === itemId).length;
}

export function useLinkActions(item: LinkItem) {
  const { state, dispatch, gate, openModal, toast, setView } = useApp();
  // 저장·숨기기·출처 제외는 로그인 없이 이 기기에 저장한다(모아보기 둘러보기용).
  const saved = state.linkPrefs.saved.includes(item.id);
  const label = sourceLabel(item);

  const toggleSave = () => {
    dispatch({ type: 'toggleSaveLink', id: item.id });
    toast(saved ? '저장을 취소했어요' : '저장에 담았어요', saved ? undefined : { label: '저장 보기', run: () => setView('saved') });
  };

  const talk = () => gate(() => openModal({ type: 'compose', linkId: item.id }));
  const openDetail = () => openModal({ type: 'linkDetail', id: item.id });

  const menuItems: MenuItem[] = [
    {
      label: '이 카드 숨기기',
      icon: <IconEyeOff size={18} />,
      onSelect: () => {
        dispatch({ type: 'hideLink', id: item.id });
        toast('카드를 숨겼어요', { label: '되돌리기', run: () => dispatch({ type: 'unhideLink', id: item.id }) });
      },
    },
    {
      label: `${SOURCES[item.source].name} 출처 제외하기`,
      icon: <IconBan size={18} />,
      onSelect: () => {
        dispatch({ type: 'excludeSource', source: item.source });
        toast(`${SOURCES[item.source].name} 글을 모아보기에서 뺐어요`, {
          label: '되돌리기',
          run: () => dispatch({ type: 'includeSource', source: item.source }),
        });
      },
    },
    ...(item.kind === 'manual'
      ? [
          {
            label: '수정하기',
            icon: <IconEdit size={18} />,
            onSelect: () => openModal({ type: 'linkForm', editId: item.id }),
          },
          {
            label: '삭제하기',
            icon: <IconTrash size={18} />,
            danger: true,
            onSelect: () =>
              openModal({
                type: 'confirm',
                title: '이 링크를 삭제할까요?',
                message: '모아보기와 저장 목록에서 사라져요. 이 링크를 참고한 RECESS 글은 남아요.',
                confirmLabel: '삭제',
                danger: true,
                onConfirm: () => {
                  dispatch({ type: 'deleteLink', id: item.id });
                  toast('링크를 삭제했어요');
                },
              }),
          },
        ]
      : []),
  ];

  return { saved, label, toggleSave, talk, openDetail, menuItems };
}

/** 원문 보기: 실제 링크는 새 탭으로, 예시 카드는 앱 안의 예시 상세로 */
export function OpenOriginal({ item, className = 'btn btn-outline btn-sm' }: { item: LinkItem; className?: string }) {
  const { openModal } = useApp();
  if (item.url) {
    return (
      <a className={className} href={item.url} target="_blank" rel="noopener noreferrer nofollow">
        원문 보기 <IconExternal size={15} />
        <span className="sr-only">(새 탭에서 {hostOf(item.url)} 열기)</span>
      </a>
    );
  }
  return (
    <button type="button" className={className} onClick={() => openModal({ type: 'linkDetail', id: item.id })}>
      예시 상세 보기
    </button>
  );
}

export function TalkButton({ item, compact = false }: { item: LinkItem; compact?: boolean }) {
  const { talk } = useLinkActions(item);
  return (
    <button type="button" className="btn btn-soft btn-sm" onClick={talk}>
      <IconChat size={16} /> {compact ? '이야기하기' : 'RECESS에서 이야기하기'}
    </button>
  );
}

export function SaveLinkButton({ item }: { item: LinkItem }) {
  const { saved, toggleSave } = useLinkActions(item);
  return (
    <button type="button" className={`act-btn save${saved ? ' is-on' : ''}`} aria-pressed={saved} onClick={toggleSave}>
      <IconBookmark filled={saved} size={19} />
      <span>{saved ? '저장됨' : '저장'}</span>
    </button>
  );
}

/** RECESS 글에 붙은 참고 링크 상자 */
export function LinkAttachment({ link }: { link: LinkRef }) {
  const { state, openModal } = useApp();
  const live = state.links.find((l) => l.id === link.itemId);
  return (
    <div className="link-attach" onClick={(e) => e.stopPropagation()}>
      <div className="link-attach-top">
        <span className="link-attach-label">참고한 글</span>
        <SourceBadge source={link.source} name={link.sourceName} />
        {link.kind === 'example' && <KindTag kind="example" />}
      </div>
      <div className="link-attach-title clamp-2">{link.title}</div>
      <div className="link-attach-actions">
        {link.url ? (
          <a className="text-btn" href={link.url} target="_blank" rel="noopener noreferrer nofollow">
            원문 보기 ↗<span className="sr-only"> (새 탭)</span>
          </a>
        ) : live ? (
          <button type="button" className="text-btn" onClick={() => openModal({ type: 'linkDetail', id: live.id })}>
            예시 상세 보기
          </button>
        ) : (
          <span className="muted small">원본 카드가 삭제됐어요</span>
        )}
        {link.url && <span className="muted small">{hostOf(link.url)}</span>}
      </div>
    </div>
  );
}

export function topicLabel(item: LinkItem): string {
  return CATEGORY_LABEL[item.topic];
}
