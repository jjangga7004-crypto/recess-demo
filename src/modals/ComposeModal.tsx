import { useId, useState } from 'react';
import { AuthorInfo } from '../components/Author';
import { Modal } from '../components/Modal';
import { BODY_MAX, TITLE_MAX } from '../config';
import { CATEGORIES } from '../data/catalog';
import { DEFAULT_FILTERS } from '../lib/feed';
import { useApp } from '../store/AppContext';
import { newId } from '../store/state';
import type { CategoryId } from '../types';

export function ComposeModal({ modalKey, isTop, editId }: { modalKey: number; isTop: boolean; editId?: string }) {
  const { state, me, dispatch, closeModal, toast, setView, setFilters, filters, flashPost, openModal } = useApp();
  const editing = editId ? state.posts.find((p) => p.id === editId) : undefined;
  const [category, setCategory] = useState<CategoryId>(
    editing?.category ?? (filters.category !== 'all' ? filters.category : 'daily'),
  );
  const [title, setTitle] = useState(editing?.title ?? '');
  const [body, setBody] = useState(editing?.body ?? '');
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});
  const titleId = useId();
  const bodyId = useId();
  const close = () => closeModal(modalKey);

  const submit = () => {
    const t = title.trim();
    const b = body.trim();
    const next: typeof errors = {};
    if (!t) next.title = '제목을 입력해 주세요.';
    if (!b) next.body = '내용을 입력해 주세요.';
    setErrors(next);
    if (next.title) {
      document.getElementById(titleId)?.focus();
      return;
    }
    if (next.body) {
      document.getElementById(bodyId)?.focus();
      return;
    }

    if (editing) {
      dispatch({ type: 'updatePost', id: editing.id, category, title: t, body: b, at: Date.now() });
      close();
      toast('글을 수정했어요');
      return;
    }

    const id = newId('p');
    dispatch({ type: 'createPost', id, category, title: t, body: b, at: Date.now() });
    close();
    // 방금 쓴 글이 바로 보이도록 홈의 최신순 전체 피드로 이동하고 잠깐 강조한다.
    setFilters({ ...DEFAULT_FILTERS });
    setView('home');
    flashPost(id);
    toast('글을 올렸어요', { label: '열어 보기', run: () => openModal({ type: 'post', id }) });
  };

  if (!me) return null;

  return (
    <Modal
      title={editing ? '글 수정' : '글쓰기'}
      onClose={close}
      isTop={isTop}
      size="lg"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={close}>
            취소
          </button>
          <button type="submit" form="compose-form" className="btn btn-primary">
            {editing ? '수정 완료' : '올리기'}
          </button>
        </>
      }
    >
      <form
        id="compose-form"
        className="stack"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <fieldset className="field">
          <legend className="field-label">카테고리</legend>
          <div className="chip-radio">
            {CATEGORIES.map((c) => (
              <label key={c.id} className={`chip-option${category === c.id ? ' is-selected' : ''}`}>
                <input
                  type="radio"
                  name="category"
                  value={c.id}
                  checked={category === c.id}
                  onChange={() => setCategory(c.id)}
                  className="sr-only"
                />
                {c.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="field">
          <div className="field-top">
            <label htmlFor={titleId} className="field-label">
              제목
            </label>
            <span className="counter">
              {title.length}/{TITLE_MAX}
            </span>
          </div>
          <input
            id={titleId}
            className={`input${errors.title ? ' is-error' : ''}`}
            value={title}
            maxLength={TITLE_MAX}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((x) => ({ ...x, title: undefined }));
            }}
            placeholder="예: 수학 오답노트 다들 어떻게 정리함?"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? `${titleId}-err` : undefined}
            data-autofocus
            autoComplete="off"
          />
          {errors.title && (
            <p id={`${titleId}-err`} className="field-error">
              {errors.title}
            </p>
          )}
        </div>

        <div className="field">
          <div className="field-top">
            <label htmlFor={bodyId} className="field-label">
              내용
            </label>
            <span className="counter">
              {body.length}/{BODY_MAX}
            </span>
          </div>
          <textarea
            id={bodyId}
            className={`input textarea${errors.body ? ' is-error' : ''}`}
            value={body}
            maxLength={BODY_MAX}
            rows={7}
            onChange={(e) => {
              setBody(e.target.value);
              if (errors.body) setErrors((x) => ({ ...x, body: undefined }));
            }}
            placeholder="다른 학교 학생들과 나누고 싶은 이야기를 적어 주세요."
            aria-invalid={!!errors.body}
            aria-describedby={`${bodyId}-help`}
          />
          <p id={`${bodyId}-help`} className={errors.body ? 'field-error' : 'field-help'}>
            {errors.body ?? '내 이름이나 다른 사람의 실명·반·번호는 적지 않도록 주의해 주세요.'}
          </p>
        </div>

        <div className="badge-preview">
          <div className="preview-label">작성자는 이렇게 표시돼요</div>
          <AuthorInfo user={me} meta={<span>{CATEGORIES.find((c) => c.id === category)?.label} · 방금</span>} interactiveBadges={false} />
        </div>
      </form>
    </Modal>
  );
}
