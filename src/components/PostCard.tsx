import { useEffect, useRef } from 'react';
import { CATEGORY_LABEL } from '../data/catalog';
import { splitHighlight } from '../lib/feed';
import { timeAgo } from '../lib/format';
import { useApp } from '../store/AppContext';
import type { Post } from '../types';
import { AuthorInfo } from './Author';
import { IconBookmark, IconComment, IconHeart } from './icons';
import { ActionMenu } from './Menu';
import { usePostActions } from './usePostActions';

function Highlight({ text, query }: { text: string; query: string }) {
  return (
    <>
      {splitHighlight(text, query).map((part, i) =>
        part.hit ? <mark key={i}>{part.text}</mark> : <span key={i}>{part.text}</span>,
      )}
    </>
  );
}

export function PostCard({ post, query = '' }: { post: Post; query?: string }) {
  const { openModal, now, flashId } = useApp();
  const { liked, saved, likes, comments, isMine, author, toggleLike, toggleSave, menuItems } = usePostActions(post);
  const ref = useRef<HTMLElement>(null);
  const isNew = flashId === post.id;

  useEffect(() => {
    if (isNew) ref.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [isNew]);

  const open = (focusComment = false) => openModal({ type: 'post', id: post.id, focusComment });

  return (
    <article
      ref={ref}
      className={`card post-card${isNew ? ' is-new' : ''}`}
      onClick={(e) => {
        // 카드 안의 버튼·링크를 누른 경우가 아니면 상세를 연다.
        if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return;
        open();
      }}
    >
      <header className="post-head">
        <AuthorInfo
          user={author}
          meta={
            <>
              <span className="cat-tag">{CATEGORY_LABEL[post.category]}</span>
              <span aria-hidden>·</span>
              <time dateTime={new Date(post.createdAt).toISOString()}>{timeAgo(post.createdAt, now)}</time>
              {post.editedAt && <span className="muted">· 수정됨</span>}
              {isMine && <span className="mine-tag">내 글</span>}
            </>
          }
        />
        <ActionMenu items={menuItems} label="게시글 메뉴" />
      </header>

      <h3 className="post-title">
        <button type="button" className="title-btn" onClick={() => open()}>
          <Highlight text={post.title} query={query} />
        </button>
      </h3>
      <p className="post-body clamp-3">
        <Highlight text={post.body} query={query} />
      </p>

      <footer className="post-actions">
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
        <button
          type="button"
          className="act-btn"
          aria-label={`댓글 ${comments}개 보기`}
          onClick={() => open(true)}
        >
          <IconComment size={19} />
          <span className="num">{comments}</span>
        </button>
        <button
          type="button"
          className={`act-btn save${saved ? ' is-on' : ''}`}
          aria-pressed={saved}
          onClick={toggleSave}
        >
          <IconBookmark filled={saved} size={19} />
          <span>{saved ? '저장됨' : '저장'}</span>
        </button>
      </footer>
    </article>
  );
}
