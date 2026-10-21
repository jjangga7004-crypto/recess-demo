import { BRAND, DEMO_NOTICE } from '../config';
import { useApp } from '../store/AppContext';
import { likeCountOf } from '../store/state';
import { isPostVisible } from '../lib/feed';
import type { ViewId } from '../types';
import { AcademyAdCard } from './AdCard';
import { Avatar, SchoolLabel, Verified } from './Author';
import { IconBookmark, IconHeart, IconHome, IconPen, IconSettings, IconUser } from './icons';

export function DemoBanner() {
  return (
    <div className="demo-banner" role="note">
      <span className="demo-dot" aria-hidden />
      {DEMO_NOTICE}
    </div>
  );
}

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button type="button" className="logo" onClick={onClick} aria-label={`${BRAND.name} 홈으로`}>
      <span className="logo-word">{BRAND.name}</span>
      <span className="logo-sub">{BRAND.meaning}</span>
    </button>
  );
}

const NAV: { id: ViewId; label: string; icon: (active: boolean) => JSX.Element }[] = [
  { id: 'home', label: '홈', icon: () => <IconHome /> },
  { id: 'saved', label: '저장한 글', icon: (a) => <IconBookmark filled={a} /> },
  { id: 'profile', label: '내 프로필', icon: () => <IconUser /> },
  { id: 'settings', label: '설정', icon: () => <IconSettings /> },
];

function useCompose() {
  const { gate, openModal } = useApp();
  return () => gate(() => openModal({ type: 'compose' }));
}

export function SideNav() {
  const { view, setView, me, gate } = useApp();
  const compose = useCompose();
  return (
    <nav className="side-nav" aria-label="주요 메뉴">
      <Logo onClick={() => setView('home')} />
      <ul className="side-list">
        {NAV.map((n) => (
          <li key={n.id}>
            <button
              type="button"
              className={`side-link${view === n.id ? ' is-active' : ''}`}
              aria-current={view === n.id ? 'page' : undefined}
              onClick={() => setView(n.id)}
            >
              {n.icon(view === n.id)}
              <span>{n.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-primary btn-block" onClick={compose}>
        <IconPen size={18} /> 글쓰기
      </button>

      <div className="side-profile">
        {me ? (
          <button type="button" className="side-me" onClick={() => setView('profile')}>
            <Avatar user={me} size={36} />
            <span className="side-me-text">
              <span className="side-me-name">{me.nickname}</span>
              <span className="side-me-meta">
                <SchoolLabel schoolId={me.schoolId} />
                <Verified verified={me.verified} />
              </span>
            </span>
          </button>
        ) : (
          <div className="side-join">
            <p>둘러보기 중이에요. 글을 쓰거나 반응하려면 데모 프로필로 입장해요.</p>
            <button type="button" className="btn btn-soft btn-block btn-sm" onClick={() => gate(() => setView('profile'))}>
              데모 프로필로 입장
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export function MobileHeader() {
  const { setView, me, gate } = useApp();
  return (
    <header className="mobile-header">
      <Logo onClick={() => setView('home')} />
      {me ? (
        <button type="button" className="avatar-btn" onClick={() => setView('profile')} aria-label="내 프로필">
          <Avatar user={me} size={34} />
        </button>
      ) : (
        <button type="button" className="btn btn-soft btn-sm" onClick={() => gate(() => setView('profile'))}>
          데모 입장
        </button>
      )}
    </header>
  );
}

export function BottomNav() {
  const { view, setView } = useApp();
  const compose = useCompose();
  const item = (id: ViewId, label: string, icon: JSX.Element) => (
    <button
      type="button"
      className={`bottom-link${view === id ? ' is-active' : ''}`}
      aria-current={view === id ? 'page' : undefined}
      onClick={() => setView(id)}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
  return (
    <nav className="bottom-nav" aria-label="하단 메뉴">
      {item('home', '홈', <IconHome size={22} />)}
      {item('saved', '저장', <IconBookmark size={22} filled={view === 'saved'} />)}
      <button type="button" className="bottom-compose" onClick={compose} aria-label="글쓰기">
        <IconPen size={22} />
      </button>
      {item('profile', '프로필', <IconUser size={22} />)}
      {item('settings', '설정', <IconSettings size={22} />)}
    </nav>
  );
}

export function RightRail() {
  const { state, ps, me, openModal, setView } = useApp();
  const top = state.posts
    .filter((p) => isPostVisible(p, ps, me?.id ?? null))
    .map((p) => ({ post: p, likes: likeCountOf(state, p) }))
    .sort((a, b) => b.likes - a.likes || b.post.createdAt - a.post.createdAt)
    .slice(0, 5);

  return (
    <aside className="right-rail" aria-label="보조 정보">
      <section className="card rail-card">
        <h2 className="rail-title">지금 인기 있는 글</h2>
        <ol className="hot-list">
          {top.map(({ post, likes }, i) => (
            <li key={post.id}>
              <button type="button" className="hot-item" onClick={() => openModal({ type: 'post', id: post.id })}>
                <span className="hot-rank">{i + 1}</span>
                <span className="hot-title">{post.title}</span>
                <span className="hot-likes">
                  <IconHeart size={13} filled /> {likes}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <p className="rail-note">좋아요 수 기준</p>
      </section>

      <section className="card rail-card">
        <h2 className="rail-title">뱃지는 고른 것만 보여요</h2>
        <p className="rail-text">
          성적 뱃지와 활동 뱃지 중 보여주고 싶은 것만 골라 프로필과 글에 달 수 있어요. 뱃지가 없어도 모든 기능을 똑같이 써요.
        </p>
        <div className="rail-chips">
          <span className="badge-chip badge-grade">성적 뱃지</span>
          <span className="badge-chip badge-activity">활동 뱃지</span>
        </div>
        <button type="button" className="text-btn" onClick={() => setView('profile')}>
          내 뱃지 설정하기
        </button>
      </section>

      <AcademyAdCard compact />

      <section className="rail-foot">
        <p>
          <strong>{BRAND.name}</strong> (가칭) · {BRAND.meaning}
        </p>
        <p>대치·중계에서 시작하는 시나리오예요. 목동 글은 확장을 보여주는 예시예요.</p>
      </section>
    </aside>
  );
}

export function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div className="toasts" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} className="toast" role="status">
          <span>{t.message}</span>
          {t.action && (
            <button
              type="button"
              className="toast-action"
              onClick={() => {
                t.action!.run();
                dismissToast(t.id);
              }}
            >
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
