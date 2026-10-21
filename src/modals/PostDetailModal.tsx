import { useEffect, useId, useRef, useState } from 'react';
import { AuthorInfo } from '../components/Author';
import { IconBookmark, IconComment, IconHeart } from '../components/icons';
import { ActionMenu } from '../components/Menu';
import { Modal } from '../components/Modal';
import { usePostActions } from '../components/usePostActions';
import { COMMENT_MAX } from '../config';
import { CATEGORY_LABEL } from '../data/catalog';
import { isPostVisible, visibleComments } from '../lib/feed';
import { fullDate, timeAgo } from '../lib/format';
import { useApp } from '../store/AppContext';
import { newId } from '../store/state';
import type { Post } from '../types';

export function PostDetailModal({
  modalKey,
  isTop,
  postId,
  focusComment,
}: {
  modalKey: number;
  isTop: boolean;
  postId: string;
  focusComment?: boolean;
}) {
  const { state, ps, me, closeModal } = useApp();
  const post = state.posts.find((p) => p.id === postId);
  const visible = !!post && isPostVisible(post, ps, me?.id ?? null);

  // 삭제·숨김·차단되면 상세 화면도 닫는다.
  useEffect(() => {
    if (!visible) closeModal(modalKey);
  }, [visible, closeModal, modalKey]);

  if (!post || !visible) return null;
  return <PostDetail post={post} modalKey={modalKey} isTop={isTop} focusComment={focusComment} />;
}

function PostDetail({
  post,
  modalKey,
  isTop,
  focusComment,
}: {
  post: Post;
  modalKey: number;
  isTop: boolean;
  focusComment?: boolean;
}) {
  const { state, ps, me, now, dispatch, closeModal, gate, toast, openModal, userById } = useApp();
  const { liked, saved, likes, isMine, author, toggleLike, toggleSave, menuItems } = usePostActions(post);
  const comments = visibleComments(state, post.id, ps);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const inputId = useId();
  const listRef = useRef<HTMLOListElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (focusComment) {
      window.setTimeout(() => {
        inputRef.current?.scrollIntoView({ block: 'center' });
        inputRef.current?.focus({ preventScroll: true });
      }, 50);
    }
  }, [focusComment]);

  const submitComment = () => {
    const body = draft.trim();
    if (!body) {
      setError('댓글 내용을 입력해 주세요.');
      inputRef.current?.focus();
      return;
    }
    gate(() => {
      dispatch({ type: 'addComment', id: newId('c'), postId: post.id, body, at: Date.now() });
      setDraft('');
      setError('');
      window.setTimeout(() => {
        const last = listRef.current?.lastElementChild as HTMLElement | null;
        last?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }, 30);
    });
  };

  return (
    <Modal
      title={post.title}
      eyebrow={CATEGORY_LABEL[post.category]}
      onClose={() => closeModal(modalKey)}
      isTop={isTop}
      size="lg"
    >
      <article className="detail">
        <div className="detail-head">
          <AuthorInfo
            user={author}
            meta={
              <>
                <time dateTime={new Date(post.createdAt).toISOString()} title={fullDate(post.createdAt)}>
                  {timeAgo(post.createdAt, now)}
                </time>
                {post.editedAt && <span className="muted">· 수정됨</span>}
                {isMine && <span className="mine-tag">내 글</span>}
              </>
            }
          />
          <ActionMenu items={menuItems} label="게시글 메뉴" />
        </div>

        <div className="detail-body">{post.body}</div>

        <div className="post-actions detail-actions">
          <button
            type="button"
            className={`act-btn like${liked ? ' is-on' : ''}`}
            aria-pressed={liked}
            aria-label={`좋아요 ${likes}개${liked ? ', 누름' : ''}`}
            onClick={toggleLike}
          >
            <IconHeart filled={liked} size={19} />
            <span className="num">{likes}</span>
          </button>
          <span className="act-btn is-static" aria-label={`댓글 ${comments.length}개`}>
            <IconComment size={19} />
            <span className="num">{comments.length}</span>
          </span>
          <button
            type="button"
            className={`act-btn save${saved ? ' is-on' : ''}`}
            aria-pressed={saved}
            onClick={toggleSave}
          >
            <IconBookmark filled={saved} size={19} />
            <span>{saved ? '저장됨' : '저장'}</span>
          </button>
        </div>
      </article>

      <section className="comments" aria-label="댓글">
        <h3 className="comments-title">
          댓글 <span className="num">{comments.length}</span>
        </h3>
        {comments.length === 0 ? (
          <p className="muted small">아직 댓글이 없어요. 첫 댓글을 남겨 보세요.</p>
        ) : (
          <ol className="comment-list" ref={listRef}>
            {comments.map((c) => {
              const cu = userById(c.authorId);
              const mine = !!me && c.authorId === me.id;
              return (
                <li key={c.id} className="comment">
                  <AuthorInfo
                    user={cu}
                    size="sm"
                    meta={
                      <>
                        <time dateTime={new Date(c.createdAt).toISOString()}>{timeAgo(c.createdAt, now)}</time>
                        {mine && (
                          <button
                            type="button"
                            className="text-btn text-btn-sm"
                            onClick={() =>
                              openModal({
                                type: 'confirm',
                                title: '댓글을 삭제할까요?',
                                message: '삭제한 댓글은 되돌릴 수 없어요.',
                                confirmLabel: '삭제',
                                danger: true,
                                onConfirm: () => {
                                  dispatch({ type: 'deleteComment', id: c.id });
                                  toast('댓글을 삭제했어요');
                                },
                              })
                            }
                          >
                            삭제
                          </button>
                        )}
                      </>
                    }
                  />
                  <p className="comment-body">{c.body}</p>
                </li>
              );
            })}
          </ol>
        )}

        <form
          className="comment-form"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submitComment();
          }}
        >
          <label htmlFor={inputId} className="sr-only">
            댓글 쓰기
          </label>
          <textarea
            id={inputId}
            ref={inputRef}
            className={`input textarea comment-input${error ? ' is-error' : ''}`}
            rows={2}
            maxLength={COMMENT_MAX}
            value={draft}
            placeholder={me?.verified ? '댓글을 남겨 주세요' : '댓글을 쓰려면 데모 프로필로 입장해요'}
            onChange={(e) => {
              setDraft(e.target.value);
              if (error) setError('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                submitComment();
              }
            }}
            aria-invalid={!!error}
            aria-describedby={`${inputId}-help`}
          />
          <div className="comment-form-foot">
            <span id={`${inputId}-help`} className={error ? 'field-error' : 'field-help'}>
              {error || '닉네임, 학교, 인증 표시와 함께 보여요.'}
            </span>
            <button type="submit" className="btn btn-primary btn-sm">
              등록
            </button>
          </div>
        </form>
      </section>
    </Modal>
  );
}
