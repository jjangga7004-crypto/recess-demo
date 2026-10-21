import type { ReactElement } from 'react';
import { BRAND, DEMO_NOTICE } from '../config';
import { AUTO_CONNECTED_COUNT } from '../data/sources';
import { useApp } from '../store/AppContext';
import { likeCountOf } from '../store/state';
import { isPostVisible } from '../lib/feed';
import { timeAgo } from '../lib/format';
import type { ViewId } from '../types';
import { AcademyAdCard } from './AdCard';
import { Avatar, SchoolLabel, Verified } from './Author';
import { TrendingRail } from './Trending';
import {
  IconBookmark,
  IconChat,
  IconCompass,
  IconHeart,
  IconLink,
  IconPen,
  IconPlus,
  IconSettings,
  IconUser,
} from './icons';

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
    <button type="button" className="logo" onClick={onClick} aria-label={`${BRAND.name} 모아보기로`}>
      <span className="logo-word">{BRAND.name}</span>
      <span className="logo-sub">{BRAND.meaning}</span>
    </button>
  );
}

// 메인 탐색: 모아보기(초기 기본 홈) · RECESS(자체 커뮤니티) · 저장
const NAV: { id: ViewId; label: string; icon: (active: boolean) => ReactElement }[] = [
  { id: 'collect', label: '모아보기', icon: () => <IconCompass /> },
  { id: 'community', label: 'RECESS', icon: () => <IconChat /> },
  { id: 'saved', label: '저장', icon: (a) => <IconBookmark filled={a} /> },
  { id: 'profile', label: '내 프로필', icon: () => <IconUser /> },
  { id: 'settings', label: '설정', icon: () => <IconSettings /> },
];

function useCompose() {
  const { gate, openModal } = useApp();
  return () => gate(() => openModal({ type: 'compose' }));
}

export function SideNav() {
  const { view, setView, me, gate, openModal } = useApp();
  const compose = useCompose();
  return (
    <nav className="side-nav" aria-label="주요 메뉴">
      <Logo onClick={() => setView('collect')} />
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
      <div className="side-actions">
        <button type="button" className="btn btn-primary btn-block" onClick={compose}>
          <IconPen size={18} /> RECESS에 글쓰기
        </button>
        <button type="button" className="btn btn-outline btn-block btn-sm" onClick={() => openModal({ type: 'linkForm' })}>
          <IconLink size={16} /> 링크 등록
        </button>
      </div>

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
            <p>둘러보기 중이에요. RECESS에 글을 쓰거나 반응하려면 데모 프로필로 입장해요.</p>
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
  const { setView, me, gate, view } = useApp();
  return (
    <header className="mobile-header">
      <Logo onClick={() => setView('collect')} />
      <div className="mobile-header-actions">
        <button
          type="button"
          className={`icon-btn${view === 'settings' ? ' is-active' : ''}`}
          onClick={() => setView('settings')}
          aria-label="설정"
          aria-current={view === 'settings' ? 'page' : undefined}
        >
          <IconSettings />
        </button>
        {me ? (
          <button type="button" className="avatar-btn" onClick={() => setView('profile')} aria-label="내 프로필">
            <Avatar user={me} size={34} />
          </button>
        ) : (
          <button type="button" className="btn btn-soft btn-sm" onClick={() => gate(() => setView('profile'))}>
            데모 입장
          </button>
        )}
      </div>
    </header>
  );
}

export function BottomNav() {
  const { view, setView, openModal } = useApp();
  const item = (id: ViewId, label: string, icon: ReactElement) => (
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
      {item('collect', '모아보기', <IconCompass size={22} />)}
      {item('community', 'RECESS', <IconChat size={22} />)}
      <button
        type="button"
        className="bottom-compose"
        onClick={() => openModal({ type: 'create' })}
        aria-label="글쓰기 또는 링크 등록"
      >
        <IconPlus size={24} />
      </button>
      {item('saved', '저장', <IconBookmark size={22} filled={view === 'saved'} />)}
      {item('profile', '프로필', <IconUser size={22} />)}
    </nav>
  );
}

function HotPosts({ title, onlyLinked = false }: { title: string; onlyLinked?: boolean }) {
  const { state, ps, me, openModal, now } = useApp();
  const visible = state.posts.filter((p) => isPostVisible(p, ps, me?.id ?? null));
  const list = onlyLinked
    ? visible
        .filter((p) => p.link)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
        .map((p) => ({ post: p, likes: likeCountOf(state, p) }))
    : visible
        .map((p) => ({ post: p, likes: likeCountOf(state, p) }))
        .sort((a, b) => b.likes - a.likes || b.post.createdAt - a.post.createdAt)
        .slice(0, 5);

  return (
    <section className="card rail-card">
      <h2 className="rail-title">{title}</h2>
      {list.length === 0 ? (
        <p className="rail-text">
          아직 없어요. 모아보기 카드의 ‘이야기하기’를 누르면 그 글을 두고 RECESS에서 대화를 시작할 수 있어요.
        </p>
      ) : (
        <ol className="hot-list">
          {list.map(({ post, likes }, i) => (
            <li key={post.id}>
              <button type="button" className="hot-item" onClick={() => openModal({ type: 'post', id: post.id })}>
                <span className="hot-rank">{i + 1}</span>
                <span className="hot-title">{post.title}</span>
                <span className="hot-likes">
                  {onlyLinked ? (
                    <span>{timeAgo(post.createdAt, now)}</span>
                  ) : (
                    <>
                      <IconHeart size={13} filled /> {likes}
                    </>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ol>
      )}
      {!onlyLinked && <p className="rail-note">RECESS 글 · 좋아요 수 기준</p>}
    </section>
  );
}

function BadgeInfo() {
  const { setView } = useApp();
  return (
    <section className="card rail-card">
      <h2 className="rail-title">뱃지는 고른 것만 보여요</h2>
      <p className="rail-text">
        성적 뱃지와 활동 뱃지 중 보여주고 싶은 것만 골라 프로필과 RECESS 글에 달 수 있어요. 뱃지가 없어도 모든 기능을 똑같이 써요.
      </p>
      <div className="rail-chips">
        <span className="badge-chip badge-grade">성적 뱃지</span>
        <span className="badge-chip badge-activity">활동 뱃지</span>
      </div>
      <button type="button" className="text-btn" onClick={() => setView('profile')}>
        내 뱃지 설정하기
      </button>
    </section>
  );
}

function CollectStatus() {
  const { state, setView } = useApp();
  const manual = state.links.filter((l) => l.kind === 'manual').length;
  const example = state.links.filter((l) => l.kind === 'example').length;
  return (
    <section className="card rail-card">
      <h2 className="rail-title">모아보기는 이렇게 채워져요</h2>
      <dl className="mini-stats">
        <div>
          <dt>자동 연결</dt>
          <dd>{AUTO_CONNECTED_COUNT}곳</dd>
        </div>
        <div>
          <dt>직접 등록</dt>
          <dd>{manual}개</dd>
        </div>
        <div>
          <dt>예시</dt>
          <dd>{example}개</dd>
        </div>
      </dl>
      <p className="rail-text">출처마다 이용 조건을 확인한 뒤에만 자동으로 가져와요. 지금은 직접 등록한 링크와 예시로 시연해요.</p>
      <button type="button" className="text-btn" onClick={() => setView('settings')}>
        출처별 연결 상태 보기
      </button>
    </section>
  );
}

function RailFoot() {
  return (
    <section className="rail-foot">
      <p>
        <strong>{BRAND.name}</strong> (가칭) · {BRAND.meaning}
      </p>
      <p>대치·중계에서 시작하는 시나리오예요. 목동 글은 확장을 보여주는 예시예요.</p>
    </section>
  );
}

/**
 * 오른쪽 보조 영역. 광고는 RECESS 자체 피드 옆에만 둔다.
 * 외부 데이터의 이용 조건을 확인하기 전에는 그 데이터가 보이는 화면에 광고를 붙이지 않는다.
 */
export function RightRail() {
  const { view } = useApp();
  return (
    <aside className="right-rail" aria-label="보조 정보">
      {view === 'collect' ? (
        <>
          <TrendingRail />
          <HotPosts title="RECESS에서 이야기 중인 링크" onlyLinked />
          <CollectStatus />
        </>
      ) : view === 'community' ? (
        <>
          <HotPosts title="지금 인기 있는 글" />
          <BadgeInfo />
          <AcademyAdCard compact />
        </>
      ) : (
        <>
          <HotPosts title="지금 인기 있는 글" />
          <BadgeInfo />
        </>
      )}
      <RailFoot />
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
