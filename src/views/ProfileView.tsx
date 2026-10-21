import { useId, useState } from 'react';
import { AuthorInfo, Avatar, BadgeChip, SchoolLabel, Verified } from '../components/Author';
import { IconPen, IconShield } from '../components/icons';
import { PostCard } from '../components/PostCard';
import { MAX_SHOWN_BADGES } from '../config';
import { BADGE_ORDER, BADGES, REGION_LABEL, SCHOOL_BY_ID } from '../data/catalog';
import { isPostVisible } from '../lib/feed';
import { useApp } from '../store/AppContext';
import { likeCountOf } from '../store/state';
import type { BadgeId } from '../types';

export function JoinPrompt({ title, text }: { title: string; text: string }) {
  const { gate } = useApp();
  return (
    <div className="card empty">
      <span className="empty-icon" aria-hidden>
        <IconShield size={26} />
      </span>
      <p className="empty-title">{title}</p>
      <p className="empty-text">{text}</p>
      <button type="button" className="btn btn-primary" onClick={() => gate(() => undefined)}>
        데모 프로필로 입장하기
      </button>
    </div>
  );
}

export function useSavedPosts() {
  const { state, ps, me } = useApp();
  return [...ps.saved]
    .reverse()
    .map((id) => state.posts.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p && isPostVisible(p, ps, me?.id ?? null));
}

export function ProfileView() {
  const { me, state, dispatch, openModal, toast, gate } = useApp();
  const [tab, setTab] = useState<'mine' | 'saved'>('mine');
  const tabsId = useId();
  const saved = useSavedPosts();

  if (!me) {
    return (
      <div className="view">
        <h1 className="view-title">내 프로필</h1>
        <JoinPrompt
          title="아직 둘러보기 중이에요"
          text="데모 프로필로 입장하면 내가 쓴 글, 저장한 글, 뱃지 표시 설정을 볼 수 있어요."
        />
      </div>
    );
  }

  const school = SCHOOL_BY_ID[me.schoolId];
  const myPosts = state.posts.filter((p) => p.authorId === me.id).sort((a, b) => b.createdAt - a.createdAt);
  const myLikes = myPosts.reduce((n, p) => n + likeCountOf(state, p), 0);
  const myComments = state.comments.filter((c) => c.authorId === me.id).length;

  const toggleBadge = (id: BadgeId) => {
    const shown = me.shownBadges;
    if (shown.includes(id)) {
      dispatch({ type: 'setShownBadges', badges: shown.filter((b) => b !== id) });
    } else if (shown.length >= MAX_SHOWN_BADGES) {
      toast(`뱃지는 ${MAX_SHOWN_BADGES}개까지 보여줄 수 있어요. 하나를 끄고 다시 골라 주세요.`);
    } else {
      dispatch({ type: 'setShownBadges', badges: [...shown, id] });
    }
  };

  const groups: { kind: 'grade' | 'activity'; title: string }[] = [
    { kind: 'grade', title: '성적 뱃지' },
    { kind: 'activity', title: '활동·기여 뱃지' },
  ];

  return (
    <div className="view">
      <h1 className="view-title">내 프로필</h1>

      <section className="card profile-card">
        <Avatar user={me} size={64} />
        <div className="profile-main">
          <div className="profile-name">{me.nickname}</div>
          <div className="profile-meta">
            <SchoolLabel schoolId={me.schoolId} />
            {school && <span className="muted">{REGION_LABEL[school.region]}</span>}
            <Verified verified={me.verified} withText />
            {me.verified && <span className="demo-tag">데모 인증</span>}
          </div>
          {me.shownBadges.length > 0 && (
            <div className="profile-badges">
              {me.shownBadges.map((b) => (
                <BadgeChip key={b} badgeId={b} />
              ))}
            </div>
          )}
          <p className="profile-privacy">실명, 반, 번호는 다른 학생에게 보이지 않아요.</p>
        </div>
        <div className="profile-actions">
          {!me.verified && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => gate(() => undefined)}>
              학생 인증 체험하기
            </button>
          )}
          <button type="button" className="btn btn-outline btn-sm" onClick={() => openModal({ type: 'onboarding' })}>
            프로필 바꾸기
          </button>
        </div>
        <dl className="profile-stats">
          <div>
            <dt>쓴 글</dt>
            <dd>{myPosts.length}</dd>
          </div>
          <div>
            <dt>댓글</dt>
            <dd>{myComments}</dd>
          </div>
          <div>
            <dt>받은 좋아요</dt>
            <dd>{myLikes}</dd>
          </div>
          <div>
            <dt>저장</dt>
            <dd>{saved.length}</dd>
          </div>
        </dl>
      </section>

      <section className="card badge-settings" aria-labelledby="badge-settings-title">
        <div className="section-head">
          <h2 id="badge-settings-title" className="section-title">
            뱃지 표시 설정
          </h2>
          <span className="count-pill">
            {me.shownBadges.length}/{MAX_SHOWN_BADGES} 표시 중
          </span>
        </div>
        <p className="section-text">
          보여주고 싶은 뱃지를 {MAX_SHOWN_BADGES}개까지 골라요. 고른 뱃지는 프로필, 내 글과 댓글에 함께 보여요. 성적 뱃지를 켜지 않아도 모든 기능을 똑같이 쓸 수 있어요.
        </p>

        <div className="badge-preview">
          <div className="preview-label">게시글에는 이렇게 보여요</div>
          <AuthorInfo user={me} meta={<span>공부 · 방금</span>} />
        </div>

        {groups.map((g) => (
          <div key={g.kind} className="badge-group">
            <h3 className="badge-group-title">
              {g.title} <span className="muted">· 예시</span>
            </h3>
            <ul className="badge-list">
              {BADGE_ORDER.filter((id) => BADGES[id].kind === g.kind && me.ownedBadges.includes(id)).map((id) => {
                const b = BADGES[id];
                const on = me.shownBadges.includes(id);
                return (
                  <li key={id} className="badge-row">
                    <div className="badge-row-main">
                      <span className={`badge-chip badge-${b.kind}`}>{b.label}</span>
                      <span className="badge-row-text">{b.summary}</span>
                      <button type="button" className="text-btn" onClick={() => openModal({ type: 'badge', badgeId: id })}>
                        {b.kind === 'grade' ? '시험·과목 보기' : '기준 보기'}
                      </button>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      aria-label={`${b.label} 뱃지 표시`}
                      className={`switch${on ? ' is-on' : ''}`}
                      onClick={() => toggleBadge(id)}
                    >
                      <span className="switch-knob" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <p className="fine-print">
          모든 뱃지와 인증 기록은 발표용 예시예요. 전교 등수나 교내 석차 뱃지는 만들지 않고, 학원 등록이나 결제로 받는 뱃지도 없어요.
        </p>
      </section>

      <section aria-label="내 활동">
        <div className="tabs" role="tablist" aria-label="내 활동">
          <button
            type="button"
            role="tab"
            id={`${tabsId}-mine`}
            aria-controls={`${tabsId}-panel`}
            aria-selected={tab === 'mine'}
            className={`tab${tab === 'mine' ? ' is-active' : ''}`}
            onClick={() => setTab('mine')}
          >
            내가 쓴 글 <span className="tab-count">{myPosts.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            id={`${tabsId}-saved`}
            aria-controls={`${tabsId}-panel`}
            aria-selected={tab === 'saved'}
            className={`tab${tab === 'saved' ? ' is-active' : ''}`}
            onClick={() => setTab('saved')}
          >
            저장한 글 <span className="tab-count">{saved.length}</span>
          </button>
        </div>
        <div role="tabpanel" id={`${tabsId}-panel`} aria-labelledby={`${tabsId}-${tab}`} className="feed">
          {tab === 'mine' &&
            (myPosts.length ? (
              myPosts.map((p) => <PostCard key={p.id} post={p} />)
            ) : (
              <div className="card empty">
                <p className="empty-title">아직 쓴 글이 없어요</p>
                <p className="empty-text">첫 글을 올리면 여기에서 모아 볼 수 있어요.</p>
                <button type="button" className="btn btn-primary" onClick={() => openModal({ type: 'compose' })}>
                  <IconPen size={18} /> 글쓰기
                </button>
              </div>
            ))}
          {tab === 'saved' &&
            (saved.length ? (
              saved.map((p) => <PostCard key={p.id} post={p} />)
            ) : (
              <div className="card empty">
                <p className="empty-title">저장한 글이 없어요</p>
                <p className="empty-text">글 아래의 저장 버튼을 누르면 여기에 모여요.</p>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
