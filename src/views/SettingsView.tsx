import { Avatar, SchoolLabel, Verified } from '../components/Author';
import { BRAND } from '../config';
import { useApp } from '../store/AppContext';
import { clearAppStorage } from '../store/state';
import { fullDate } from '../lib/format';
import type { ThemeChoice } from '../types';

export function SettingsView() {
  const { state, me, ps, dispatch, openModal, toast, userById, resetFilters, setView } = useApp();

  const blockedUsers = ps.blocked.map((id) => userById(id)).filter((x): x is NonNullable<typeof x> => !!x);
  const hiddenPosts = ps.hidden
    .map((id) => state.posts.find((p) => p.id === id))
    .filter((x): x is NonNullable<typeof x> => !!x);
  const myReports = me ? state.reports.filter((r) => r.reporterId === me.id).slice().reverse() : [];

  const confirmReset = () =>
    openModal({
      type: 'confirm',
      title: '데모를 처음 상태로 되돌릴까요?',
      message:
        '이 데모에서 만든 프로필, 글, 댓글, 좋아요·저장, 뱃지 설정, 신고·차단 기록이 모두 지워지고 처음 예시 상태로 돌아가요. 다른 사이트의 데이터는 건드리지 않아요.',
      confirmLabel: '초기화',
      danger: true,
      onConfirm: () => {
        clearAppStorage();
        dispatch({ type: 'reset', at: Date.now() });
        resetFilters();
        setView('home');
        toast('처음 예시 상태로 돌아왔어요');
      },
    });

  const themes: [ThemeChoice, string][] = [
    ['light', '밝게'],
    ['dark', '어둡게'],
    ['system', '기기 설정'],
  ];

  return (
    <div className="view">
      <h1 className="view-title">설정</h1>

      <section className="card settings-section">
        <h2 className="section-title">데모 프로필</h2>
        {me ? (
          <div className="settings-row">
            <div className="row-main">
              <Avatar user={me} size={40} />
              <div className="row-text">
                <div className="row-title">{me.nickname}</div>
                <div className="row-meta">
                  <SchoolLabel schoolId={me.schoolId} />
                  <Verified verified={me.verified} withText />
                </div>
              </div>
            </div>
            <div className="row-actions">
              <button type="button" className="btn btn-outline btn-sm" onClick={() => openModal({ type: 'onboarding' })}>
                바꾸기
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  dispatch({ type: 'switchProfile', id: null });
                  toast('둘러보기 모드로 나왔어요. 데모 프로필은 그대로 남아 있어요.');
                }}
              >
                나가기
              </button>
            </div>
          </div>
        ) : (
          <div className="settings-row">
            <p className="row-empty">둘러보기 중이에요. 참여 기능을 누르면 데모 프로필로 입장할 수 있어요.</p>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => openModal({ type: 'onboarding' })}>
              입장하기
            </button>
          </div>
        )}
      </section>

      <section className="card settings-section">
        <h2 className="section-title">화면</h2>
        <div className="settings-row">
          <span className="row-label" id="theme-label">
            화면 밝기
          </span>
          <div className="seg" role="group" aria-labelledby="theme-label">
            {themes.map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`seg-btn${state.theme === id ? ' is-active' : ''}`}
                aria-pressed={state.theme === id}
                onClick={() => dispatch({ type: 'setTheme', theme: id })}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card settings-section">
        <h2 className="section-title">차단한 학생</h2>
        {!me ? (
          <p className="row-empty">데모 프로필로 입장하면 차단 목록을 관리할 수 있어요.</p>
        ) : blockedUsers.length === 0 ? (
          <p className="row-empty">차단한 학생이 없어요. 글의 ⋯ 메뉴에서 작성자를 차단할 수 있어요.</p>
        ) : (
          <ul className="settings-list">
            {blockedUsers.map((x) => (
              <li key={x.id} className="settings-row">
                <div className="row-main">
                  <Avatar user={x} size={34} />
                  <div className="row-text">
                    <div className="row-title">{x.nickname}</div>
                    <div className="row-meta">
                      <SchoolLabel schoolId={x.schoolId} />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    dispatch({ type: 'unblock', userId: x.id });
                    toast(`${x.nickname}님 차단을 해제했어요`);
                  }}
                >
                  차단 해제
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card settings-section">
        <h2 className="section-title">숨긴 글</h2>
        {!me ? (
          <p className="row-empty">데모 프로필로 입장하면 숨긴 글을 관리할 수 있어요.</p>
        ) : hiddenPosts.length === 0 ? (
          <p className="row-empty">숨긴 글이 없어요.</p>
        ) : (
          <ul className="settings-list">
            {hiddenPosts.map((p) => (
              <li key={p.id} className="settings-row">
                <div className="row-text">
                  <div className="row-title clamp-1">{p.title}</div>
                  <div className="row-meta muted">{userById(p.authorId)?.nickname}</div>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => {
                    dispatch({ type: 'unhidePost', postId: p.id });
                    toast('글을 다시 보이게 했어요');
                  }}
                >
                  다시 보기
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card settings-section">
        <h2 className="section-title">신고 시연 기록</h2>
        <p className="section-text">데모 기록이에요. 운영자에게 전송되거나 검토되지 않아요.</p>
        {myReports.length === 0 ? (
          <p className="row-empty">신고 시연 기록이 없어요.</p>
        ) : (
          <ul className="settings-list">
            {myReports.map((r) => (
              <li key={r.id} className="settings-row">
                <div className="row-text">
                  <div className="row-title clamp-1">{r.postTitle || '삭제된 글'}</div>
                  <div className="row-meta muted">
                    {r.reason} · {fullDate(r.createdAt)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card settings-section">
        <h2 className="section-title">데모 초기화</h2>
        <p className="section-text">
          이 데모가 브라우저에 저장한 데이터만 지우고 처음 예시 상태로 돌아가요. 발표 전에 한 번 눌러 두면 깔끔하게 시작할 수 있어요.
        </p>
        <button type="button" className="btn btn-danger" onClick={confirmReset}>
          데모 초기화
        </button>
      </section>

      <section className="settings-about">
        <p>
          <strong>{BRAND.name}</strong>는 가칭이에요 · {BRAND.meaning}
        </p>
        <p>{BRAND.oneLiner}.</p>
        <p>기본 이용은 무료이고, 광고와 자체 운영 학원 수강 연결로 운영하는 모델을 시연해요.</p>
      </section>
    </div>
  );
}
