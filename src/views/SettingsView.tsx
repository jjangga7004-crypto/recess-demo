import { Avatar, SchoolLabel, Verified } from '../components/Author';
import { SourceBadge } from '../components/LinkParts';
import { BRAND } from '../config';
import { SOURCE_ORDER, SOURCES } from '../data/sources';
import { useApp } from '../store/AppContext';
import { clearAppStorage } from '../store/state';
import { fullDate } from '../lib/format';
import { hostOf, sourceLabel } from '../lib/links';
import type { SourceId, ThemeChoice } from '../types';

function SourceStatusCard({ id }: { id: SourceId }) {
  const s = SOURCES[id];
  const rows: [string, string][] = [
    ['연결 방식', s.method],
    ['자동 수집', s.autoEnabled ? '켜짐' : '꺼짐'],
    ['확인 날짜', s.checkedAt ?? '해당 없음'],
    ['수집 필드', s.fields],
    ['요청 빈도', s.rate],
    ['저장 기간', s.retention],
    ['한 피드에 섞기', s.mix],
    ['순서 바꾸기', s.reorder],
    ['광고 함께 표시', s.ads],
    ['본문 일부 표시', s.excerpt],
    ['마지막 성공', s.lastSuccessAt ? fullDate(s.lastSuccessAt) : '없음'],
    ['오류', s.error ?? '없음'],
  ];
  return (
    <details className="source-card">
      <summary>
        <SourceBadge source={id} />
        <span className="source-card-method">{s.method}</span>
        <span className={`state-pill ${s.autoEnabled ? 'is-on' : 'is-off'}`}>자동 수집 {s.autoEnabled ? '켜짐' : '꺼짐'}</span>
      </summary>
      <div className="source-card-body">
        <p className="section-text">{s.basis}</p>
        {s.manualNote && <p className="demo-warning">{s.manualNote}</p>}
        <dl className="facts">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="fine-print">{s.permBasis}</p>
        {s.docs.length > 0 && (
          <ul className="doc-list">
            {s.docs.map((d) => (
              <li key={d.url}>
                <a href={d.url} target="_blank" rel="noopener noreferrer">
                  {d.label} ↗
                </a>
                <span>{d.result}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  );
}

export function SettingsView() {
  const { state, me, ps, dispatch, openModal, toast, userById, resetFilters, resetCollectFilters, setView } = useApp();
  const manualLinks = state.links.filter((l) => l.kind === 'manual').sort((a, b) => b.addedAt - a.addedAt);
  const exampleCount = state.links.filter((l) => l.kind === 'example').length;
  const autoCount = state.links.filter((l) => l.kind === 'auto').length;
  const hiddenLinks = state.linkPrefs.hidden
    .map((id) => state.links.find((l) => l.id === id))
    .filter((x): x is NonNullable<typeof x> => !!x);

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
        '이 데모에서 만든 프로필, 글, 댓글, 좋아요·저장, 뱃지 설정, 신고·차단 기록, 직접 등록한 링크가 모두 지워지고 처음 예시 상태로 돌아가요. 다른 사이트의 데이터는 건드리지 않아요.',
      confirmLabel: '초기화',
      danger: true,
      onConfirm: () => {
        clearAppStorage();
        dispatch({ type: 'reset', at: Date.now() });
        resetFilters();
        resetCollectFilters();
        setView('collect');
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

      <section className="card settings-section" aria-labelledby="collect-content-title">
        <h2 id="collect-content-title" className="section-title">
          모아보기 콘텐츠
        </h2>
        <dl className="kind-stats">
          <div>
            <dt>
              <span className="kind-tag kind-auto">실제 연결</span>
            </dt>
            <dd>{autoCount}개</dd>
            <p>허용 근거를 확인한 출처에서 자동으로 가져온 글. 지금은 연결된 출처가 없어요.</p>
          </div>
          <div>
            <dt>
              <span className="kind-tag kind-manual">직접 등록</span>
            </dt>
            <dd>{manualLinks.length}개</dd>
            <p>운영자가 확인한 공개 링크와 직접 쓴 소개. 원문으로 이동해요.</p>
          </div>
          <div>
            <dt>
              <span className="kind-tag kind-example">예시 콘텐츠</span>
            </dt>
            <dd>{exampleCount}개</dd>
            <p>흐름을 보여주는 가상 카드. 원문이 없어 앱 안의 예시 상세로 열려요.</p>
          </div>
        </dl>
        <div className="settings-row">
          <span className="row-label" id="show-examples-label">
            모아보기에 예시 콘텐츠 보이기
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={state.linkPrefs.showExamples}
            aria-labelledby="show-examples-label"
            className={`switch${state.linkPrefs.showExamples ? ' is-on' : ''}`}
            onClick={() => dispatch({ type: 'setShowExamples', value: !state.linkPrefs.showExamples })}
          >
            <span className="switch-knob" />
          </button>
        </div>
      </section>

      <section className="card settings-section" aria-labelledby="source-status-title">
        <h2 id="source-status-title" className="section-title">
          출처별 연결 상태
        </h2>
        <p className="section-text">
          공식 API·공식 피드·명시적 허락이 있는 공개 페이지 순서로 연결을 검토하고, 허용 근거를 확인한 출처만 자동 수집을 켜요. 로그인·카페
          가입·CAPTCHA·접근 차단은 우회하지 않아요.
        </p>
        <div className="source-cards">
          {SOURCE_ORDER.map((id) => (
            <SourceStatusCard key={id} id={id} />
          ))}
        </div>
      </section>

      <section className="card settings-section" aria-labelledby="manual-links-title">
        <div className="section-head">
          <h2 id="manual-links-title" className="section-title">
            직접 등록한 링크
          </h2>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => openModal({ type: 'linkForm' })}>
            링크 등록
          </button>
        </div>
        {manualLinks.length === 0 ? (
          <p className="row-empty">아직 없어요. 공개 원문 주소와 직접 쓴 소개로 모아보기 카드를 만들 수 있어요.</p>
        ) : (
          <ul className="settings-list">
            {manualLinks.map((l) => (
              <li key={l.id} className="settings-row">
                <div className="row-text">
                  <div className="row-title clamp-1">{l.title}</div>
                  <div className="row-meta muted">
                    <SourceBadge source={l.source} name={sourceLabel(l)} />
                    <span className="clamp-1">{l.url ? hostOf(l.url) : ''}</span>
                  </div>
                </div>
                <div className="row-actions">
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => openModal({ type: 'linkForm', editId: l.id })}>
                    수정
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() =>
                      openModal({
                        type: 'confirm',
                        title: '이 링크를 삭제할까요?',
                        message: '원문 삭제나 삭제 요청이 있을 때도 여기서 지워요. 이 링크를 참고한 RECESS 글은 남아요.',
                        confirmLabel: '삭제',
                        danger: true,
                        onConfirm: () => {
                          dispatch({ type: 'deleteLink', id: l.id });
                          toast('링크를 삭제했어요');
                        },
                      })
                    }
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card settings-section">
        <h2 className="section-title">숨긴 카드 · 제외한 출처</h2>
        {hiddenLinks.length === 0 && state.linkPrefs.excludedSources.length === 0 ? (
          <p className="row-empty">숨기거나 제외한 것이 없어요. 모아보기 카드의 ⋯ 메뉴에서 정할 수 있어요.</p>
        ) : (
          <ul className="settings-list">
            {state.linkPrefs.excludedSources.map((s) => (
              <li key={s} className="settings-row">
                <div className="row-main">
                  <SourceBadge source={s} />
                  <span className="row-meta muted">출처 전체 제외</span>
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => dispatch({ type: 'includeSource', source: s })}>
                  다시 포함
                </button>
              </li>
            ))}
            {hiddenLinks.map((l) => (
              <li key={l.id} className="settings-row">
                <div className="row-text">
                  <div className="row-title clamp-1">{l.title}</div>
                  <div className="row-meta muted">{sourceLabel(l)}</div>
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => dispatch({ type: 'unhideLink', id: l.id })}>
                  다시 보기
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

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
        <p>
          검증하려는 가설: 학생들이 여러 사이트를 오가며 찾는 정보를 한곳에서 발견하게 하면 방문할 이유가 생기고, 이후 RECESS 자체
          커뮤니티 참여로 이어질 수 있다. 아직 검증되지 않았어요.
        </p>
        <p>기본 이용은 무료이고, 광고와 자체 운영 학원 수강 연결로 운영하는 모델을 시연해요.</p>
      </section>
    </div>
  );
}
