import { useId, useState } from 'react';
import { IconChat, IconLink } from '../components/icons';
import { KindTag, LinkTimes, OpenOriginal, SaveLinkButton, SourceBadge, TalkButton, useTalkCount } from '../components/LinkParts';
import { Modal } from '../components/Modal';
import { CATEGORIES, CATEGORY_LABEL } from '../data/catalog';
import { SOURCE_ORDER, SOURCES } from '../data/sources';
import { canShowExcerpt, findDuplicate, guessSource, hostOf, normalizeUrl, sourceLabel } from '../lib/links';
import { timeAgo } from '../lib/format';
import { useApp } from '../store/AppContext';
import { newId } from '../store/state';
import type { CategoryId, SourceId } from '../types';

interface Base {
  modalKey: number;
  isTop: boolean;
}

const LINK_TITLE_MAX = 60;
const LINK_SUMMARY_MAX = 160;
const LINK_EXCERPT_MAX = 400;
const SOURCE_NAME_MAX = 20;

function toDateInput(ts?: number): string {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 링크 등록·수정. 페이지를 긁지 않고, 직접 입력한 정보로만 카드를 만든다. */
export function LinkFormModal({ modalKey, isTop, editId }: Base & { editId?: string }) {
  const { state, dispatch, closeModal, toast, setView, resetCollectFilters, flashPost } = useApp();
  const editing = editId ? state.links.find((l) => l.id === editId && l.kind === 'manual') : undefined;
  const [url, setUrl] = useState(editing?.url ?? '');
  const [title, setTitle] = useState(editing?.title ?? '');
  const [summary, setSummary] = useState(editing?.summary ?? '');
  const [excerpt, setExcerpt] = useState(editing?.excerpt ?? '');
  const [source, setSource] = useState<SourceId>(editing?.source ?? 'etc');
  const [sourceTouched, setSourceTouched] = useState(!!editing);
  const [sourceName, setSourceName] = useState(editing?.sourceName ?? '');
  const [topic, setTopic] = useState<CategoryId>(editing?.topic ?? 'study');
  const [posted, setPosted] = useState(toDateInput(editing?.postedAt));
  const [confirmed, setConfirmed] = useState(!!editing);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const ids = { url: useId(), title: useId(), summary: useId(), name: useId(), posted: useId(), check: useId() };
  const excerptId = useId();
  const close = () => closeModal(modalKey);
  const today = toDateInput(Date.now());
  // 본문 일부는 출처가 허용한 경우에만 받는다(직접 붙여넣기, 페이지에서 자동으로 가져오지 않음).
  const excerptAllowed = SOURCES[source].excerpt === '허용';

  const onUrlChange = (value: string) => {
    setUrl(value);
    const href = normalizeUrl(value);
    const guess = href ? guessSource(href) : null;
    if (guess && !sourceTouched) setSource(guess);
  };

  const submit = () => {
    const next: Record<string, string> = {};
    const href = normalizeUrl(url);
    if (!href) next.url = 'http:// 또는 https://로 시작하는 공개 주소를 입력해 주세요.';
    else {
      const dup = findDuplicate(state.links, href, editing?.id);
      if (dup) next.url = `이미 등록된 링크예요: "${dup.title}"`;
    }
    if (!title.trim()) next.title = '소개 제목을 입력해 주세요.';
    if (!summary.trim()) next.summary = '짧은 소개를 입력해 주세요.';
    if (source === 'etc' && !sourceName.trim()) next.name = '출처 이름을 입력해 주세요. 예: 개인 블로그';
    if (posted && posted > today) next.posted = '게시일은 오늘 이후로 정할 수 없어요.';
    if (!confirmed) next.check = '직접 확인한 공개 주소인지 체크해 주세요.';
    setErrors(next);
    const first = Object.keys(next)[0] as keyof typeof ids | undefined;
    if (first) {
      document.getElementById(ids[first])?.focus();
      return;
    }

    const postedAt = posted ? new Date(`${posted}T12:00:00`).getTime() : undefined;
    const fields = {
      url: href!,
      title: title.trim(),
      summary: summary.trim(),
      source,
      sourceName: source === 'etc' ? sourceName.trim() : undefined,
      topic,
      postedAt,
      excerpt: excerptAllowed && excerpt.trim() ? excerpt.trim() : undefined,
    };

    if (editing) {
      dispatch({ type: 'updateLink', id: editing.id, patch: { ...fields, updatedAt: Date.now() } });
      close();
      toast('링크를 수정했어요');
      return;
    }
    const id = newId('link');
    dispatch({ type: 'addLink', item: { id, kind: 'manual', status: 'published', addedAt: Date.now(), ...fields } });
    close();
    resetCollectFilters();
    setView('collect');
    flashPost(id);
    toast('모아보기에 추가했어요');
  };

  const err = (k: string) =>
    errors[k] ? (
      <p id={`${k}-err-${modalKey}`} className="field-error">
        {errors[k]}
      </p>
    ) : null;

  return (
    <Modal
      title={editing ? '링크 수정' : '링크 등록'}
      eyebrow="운영자 기능 · 시연용"
      onClose={close}
      isTop={isTop}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={close}>
            취소
          </button>
          <button type="submit" form="link-form" className="btn btn-primary">
            {editing ? '수정 완료' : '모아보기에 추가'}
          </button>
        </>
      }
    >
      <form
        id="link-form"
        className="stack"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <p className="callout callout-plain">
          <span>
            페이지 내용을 자동으로 가져오지 않아요. 입력한 주소와 직접 쓴 제목·소개(일부 출처는 붙여넣은 본문 일부)로만 카드를
            만들어요. 로그인·카페 가입이 필요한 글이나 개인정보가 보이는 글은 등록하지 마세요.
          </span>
        </p>

        <div className="field">
          <label htmlFor={ids.url} className="field-label">
            공개 원문 주소
          </label>
          <input
            id={ids.url}
            className={`input${errors.url ? ' is-error' : ''}`}
            type="url"
            inputMode="url"
            value={url}
            placeholder="https://"
            onChange={(e) => onUrlChange(e.target.value)}
            aria-invalid={!!errors.url}
            data-autofocus
            autoComplete="off"
            spellCheck={false}
          />
          {err('url') ?? <p className="field-help">브라우저에서 직접 열어 본 주소만 등록해 주세요.</p>}
        </div>

        <fieldset className="field">
          <legend className="field-label">출처</legend>
          <div className="chip-radio">
            {SOURCE_ORDER.map((id) => (
              <label key={id} className={`chip-option${source === id ? ' is-selected' : ''}`}>
                <input
                  type="radio"
                  name="link-source"
                  className="sr-only"
                  checked={source === id}
                  onChange={() => {
                    setSource(id);
                    setSourceTouched(true);
                  }}
                />
                {SOURCES[id].name}
              </label>
            ))}
          </div>
          {SOURCES[source].manualNote && <p className="demo-warning">{SOURCES[source].manualNote}</p>}
        </fieldset>

        {source === 'etc' && (
          <div className="field">
            <label htmlFor={ids.name} className="field-label">
              출처 이름
            </label>
            <input
              id={ids.name}
              className={`input${errors.name ? ' is-error' : ''}`}
              value={sourceName}
              maxLength={SOURCE_NAME_MAX}
              placeholder="예: 개인 블로그"
              onChange={(e) => setSourceName(e.target.value)}
              aria-invalid={!!errors.name}
            />
            {err('name')}
          </div>
        )}

        <div className="field">
          <div className="field-top">
            <label htmlFor={ids.title} className="field-label">
              소개 제목 <span className="muted">(직접 작성)</span>
            </label>
            <span className="counter">
              {title.length}/{LINK_TITLE_MAX}
            </span>
          </div>
          <input
            id={ids.title}
            className={`input${errors.title ? ' is-error' : ''}`}
            value={title}
            maxLength={LINK_TITLE_MAX}
            placeholder="예: 탐구 기출 회독 순서를 두고 의견이 갈린 글"
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={!!errors.title}
            autoComplete="off"
          />
          {err('title')}
        </div>

        <div className="field">
          <div className="field-top">
            <label htmlFor={ids.summary} className="field-label">
              짧은 소개 <span className="muted">(직접 작성)</span>
            </label>
            <span className="counter">
              {summary.length}/{LINK_SUMMARY_MAX}
            </span>
          </div>
          <textarea
            id={ids.summary}
            className={`input textarea${errors.summary ? ' is-error' : ''}`}
            rows={3}
            value={summary}
            maxLength={LINK_SUMMARY_MAX}
            placeholder="어떤 글인지 직접 소개해 주세요."
            onChange={(e) => setSummary(e.target.value)}
            aria-invalid={!!errors.summary}
          />
          {err('summary')}
        </div>

        {excerptAllowed && (
          <div className="field">
            <div className="field-top">
              <label htmlFor={excerptId} className="field-label">
                본문 일부 <span className="muted">(선택)</span>
              </label>
              <span className="counter">
                {excerpt.length}/{LINK_EXCERPT_MAX}
              </span>
            </div>
            <textarea
              id={excerptId}
              className="input textarea"
              rows={4}
              value={excerpt}
              maxLength={LINK_EXCERPT_MAX}
              placeholder="원문에서 보여줄 부분을 붙여넣어요."
              onChange={(e) => setExcerpt(e.target.value)}
              aria-describedby={`${excerptId}-help`}
            />
            <p id={`${excerptId}-help`} className="field-help">
              원문에서 보여줄 부분을 직접 붙여넣어요. 부적절한 글이나 특정 사이트·회사를 비방하는 글은 넣지 마세요. 카드에는 앞부분
              3줄만 보이고, 누르면 원문으로 가요.
            </p>
          </div>
        )}

        <fieldset className="field">
          <legend className="field-label">주제</legend>
          <div className="chip-radio">
            {CATEGORIES.map((c) => (
              <label key={c.id} className={`chip-option${topic === c.id ? ' is-selected' : ''}`}>
                <input type="radio" name="link-topic" className="sr-only" checked={topic === c.id} onChange={() => setTopic(c.id)} />
                {c.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <label htmlFor={ids.posted} className="field-label">
            원문 게시일 <span className="muted">(확인한 경우에만)</span>
          </label>
          <input
            id={ids.posted}
            type="date"
            className={`input input-date${errors.posted ? ' is-error' : ''}`}
            value={posted}
            max={today}
            onChange={(e) => setPosted(e.target.value)}
            aria-invalid={!!errors.posted}
          />
          {err('posted') ?? <p className="field-help">모르면 비워 두세요. 카드에는 등록 시각만 표시돼요.</p>}
        </div>

        <div className="field">
          <label className="check-row" htmlFor={ids.check}>
            <input id={ids.check} type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
            <span>로그인 없이 열리는 공개 주소이고, 제목과 소개는 직접 썼어요.</span>
          </label>
          {err('check')}
        </div>
      </form>
    </Modal>
  );
}

/** 카드 상세. 예시 카드는 앱 안의 예시 설명을, 실제 링크는 원문 이동을 보여준다. */
export function LinkDetailModal({ modalKey, isTop, id }: Base & { id: string }) {
  const { state, closeModal, openModal, now, userById } = useApp();
  const item = state.links.find((l) => l.id === id);
  const talks = useTalkCount(id);
  if (!item) return null;
  const posts = state.posts.filter((p) => p.link?.itemId === id).sort((a, b) => b.createdAt - a.createdAt);
  const saved = state.linkPrefs.saved.includes(id);

  return (
    <Modal
      title={item.title}
      eyebrow={`${sourceLabel(item)} · ${CATEGORY_LABEL[item.topic]}`}
      onClose={() => closeModal(modalKey)}
      isTop={isTop}
      size="md"
      footer={
        <div className="foot-actions">
          {item.url && <OpenOriginal item={item} className="btn btn-outline" />}
          <TalkButton item={item} />
        </div>
      }
    >
      <div className="stack">
        <div className="link-top">
          <SourceBadge source={item.source} name={sourceLabel(item)} />
          <KindTag kind={item.kind} />
          <span className="link-top-spacer" />
          <SaveLinkButton item={item} />
        </div>
        <div className="link-meta">
          <LinkTimes item={item} />
        </div>

        <div className="detail-block">
          <div className="detail-label">{item.kind === 'example' ? '소개 (예시)' : '등록자가 쓴 소개'}</div>
          <p>{item.summary}</p>
        </div>

        {canShowExcerpt(item) && (
          <div className="detail-block">
            <div className="detail-label">본문 일부{item.kind === 'example' ? ' (예시)' : ''}</div>
            <blockquote className="link-excerpt">
              <p>{item.excerpt}</p>
            </blockquote>
          </div>
        )}

        {item.kind === 'example' && (
          <>
            <div className="detail-block">
              <div className="detail-label">예시 상세</div>
              <p>{item.exampleBody}</p>
            </div>
            <p className="demo-warning">예시 콘텐츠예요. 실제 커뮤니티 글을 가져온 것이 아니고, 원문 주소도 없어요.</p>
          </>
        )}

        {item.url && (
          <p className="demo-warning">
            원문은 <strong>{hostOf(item.url)}</strong>에서 확인해 주세요. RECESS는 원문 본문·이미지·댓글·작성자 정보를 저장하지 않아요.
            {SOURCES[item.source].excerpt !== '허용' && ' 이 출처는 본문 일부를 보여주지 않아 직접 쓴 소개만 보여줘요.'}
          </p>
        )}

        <div className="reaction-split">
          <div>
            <div className="detail-label">원문 반응</div>
            <p>
              {typeof item.originalReplies === 'number'
                ? `댓글 ${item.originalReplies}${item.kind === 'example' ? ' (예시 값)' : ''}`
                : '정보 없음'}
            </p>
          </div>
          <div>
            <div className="detail-label">RECESS 반응</div>
            <p>
              이야기 {talks} · {saved ? '이 기기에 저장됨' : '저장 안 함'}
            </p>
          </div>
        </div>

        <section className="stack-sm" aria-label="RECESS에서 나온 이야기">
          <h3 className="mini-title">RECESS에서 나온 이야기</h3>
          {posts.length === 0 ? (
            <p className="muted small">아직 없어요. 이 글을 보고 든 생각을 처음으로 남겨 보세요.</p>
          ) : (
            <ul className="talk-list">
              {posts.map((p) => (
                <li key={p.id}>
                  <button type="button" className="talk-item" onClick={() => openModal({ type: 'post', id: p.id })}>
                    <span className="talk-title">{p.title}</span>
                    <span className="talk-meta">
                      {userById(p.authorId)?.nickname} · {timeAgo(p.createdAt, now)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Modal>
  );
}

/** 모바일 + 버튼: 무엇을 만들지 고른다. */
export function CreateChooserModal({ modalKey, isTop }: Base) {
  const { closeModal, openModal, gate, me } = useApp();
  const close = () => closeModal(modalKey);
  return (
    <Modal title="무엇을 할까요?" onClose={close} isTop={isTop} size="sm">
      <div className="stack-sm">
        <button
          type="button"
          className="choice"
          data-autofocus
          onClick={() => {
            close();
            gate(() => openModal({ type: 'compose' }));
          }}
        >
          <span className="choice-icon">
            <IconChat size={22} />
          </span>
          <span className="choice-text">
            <span className="choice-title">RECESS에 글쓰기</span>
            <span className="choice-sub">
              {me?.verified ? '닉네임·학교·인증 표시와 함께 올라가요' : '데모 프로필로 입장한 뒤 써요'}
            </span>
          </span>
        </button>
        <button
          type="button"
          className="choice"
          onClick={() => {
            close();
            openModal({ type: 'linkForm' });
          }}
        >
          <span className="choice-icon">
            <IconLink size={22} />
          </span>
          <span className="choice-text">
            <span className="choice-title">링크 등록하기</span>
            <span className="choice-sub">찾은 글의 주소와 직접 쓴 소개로 모아보기에 추가해요</span>
          </span>
        </button>
      </div>
    </Modal>
  );
}
