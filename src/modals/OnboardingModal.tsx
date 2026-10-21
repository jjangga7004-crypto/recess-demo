import { useEffect, useId, useState } from 'react';
import { AuthorInfo, Avatar, SchoolLabel, Verified } from '../components/Author';
import { IconCheck, IconChevronRight, IconShield } from '../components/icons';
import { Modal } from '../components/Modal';
import { BRAND, NICKNAME_MAX, NICKNAME_MIN } from '../config';
import { PRESET_PROFILES, REGIONS, SCHOOL_BY_ID, SCHOOLS } from '../data/catalog';
import { useApp } from '../store/AppContext';
import { newId } from '../store/state';

type Step = 'choose' | 'create' | 'verify' | 'checking' | 'done';
type DocKind = 'card' | 'certificate';

const CHECKS = ['학교 이름 확인', '재학 기간 확인', '이름·반·번호 가리기'];

export function OnboardingModal({ modalKey, isTop }: { modalKey: number; isTop: boolean }) {
  const { state, me, dispatch, finishOnboarding, cancelOnboarding, toast } = useApp();
  const [step, setStep] = useState<Step>(me && !me.verified ? 'verify' : 'choose');
  const [doc, setDoc] = useState<DocKind>('card');
  const [checked, setChecked] = useState(0);
  const [nickname, setNickname] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [errors, setErrors] = useState<{ nickname?: string; school?: string }>({});
  const nickId = useId();
  const schoolSelId = useId();

  const localProfiles = state.users.filter((x) => x.local);
  const unusedPresets = PRESET_PROFILES.filter(
    (p) => !localProfiles.some((x) => x.nickname === p.nickname && x.schoolId === p.schoolId),
  );

  // 인증 확인 연출: 항목을 하나씩 체크한다.
  useEffect(() => {
    if (step !== 'checking') return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const delay = reduce ? 150 : 520;
    if (checked < CHECKS.length) {
      const t = window.setTimeout(() => setChecked((c) => c + 1), delay);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      dispatch({ type: 'verifyCurrent' });
      setStep('done');
    }, delay);
    return () => window.clearTimeout(t);
  }, [step, checked, dispatch]);

  const close = () => cancelOnboarding(modalKey);

  const pickExisting = (id: string) => {
    const user = localProfiles.find((x) => x.id === id);
    if (!user) return;
    dispatch({ type: 'switchProfile', id });
    if (user.verified) {
      toast(`${user.nickname} 프로필로 입장했어요`);
      finishOnboarding(modalKey);
    } else {
      setStep('verify');
    }
  };

  const createProfile = (nick: string, school: string) => {
    dispatch({ type: 'createProfile', id: newId('me'), nickname: nick, schoolId: school });
    setStep('verify');
  };

  const submitCreate = () => {
    const nick = nickname.trim();
    const next: typeof errors = {};
    if (nick.length < NICKNAME_MIN || nick.length > NICKNAME_MAX) {
      next.nickname = `닉네임은 ${NICKNAME_MIN}~${NICKNAME_MAX}자로 정해 주세요.`;
    } else if (state.users.some((x) => x.nickname === nick)) {
      next.nickname = '이미 있는 닉네임이에요. 다른 닉네임을 정해 주세요.';
    }
    if (!schoolId) next.school = '학교를 골라 주세요.';
    setErrors(next);
    if (Object.keys(next).length) return;
    createProfile(nick, schoolId);
  };

  const current = me;

  let title = '데모 프로필로 입장';
  let body: JSX.Element;
  let footer: JSX.Element | undefined;

  if (step === 'choose') {
    body = (
      <div className="stack">
        <p className="lead">
          실제 회원가입이 아니에요. 이 브라우저에만 저장되는 데모 프로필로 글쓰기, 댓글, 좋아요를 체험해요.
        </p>

        {localProfiles.length > 0 && (
          <div className="stack-sm">
            <h3 className="mini-title">이 브라우저의 데모 프로필</h3>
            <ul className="pick-list">
              {localProfiles.map((x) => (
                <li key={x.id}>
                  <button
                    type="button"
                    className={`pick-item${current?.id === x.id ? ' is-current' : ''}`}
                    onClick={() => pickExisting(x.id)}
                  >
                    <Avatar user={x} size={38} />
                    <span className="pick-text">
                      <span className="pick-name">{x.nickname}</span>
                      <span className="pick-meta">
                        <SchoolLabel schoolId={x.schoolId} />
                        <Verified verified={x.verified} withText />
                      </span>
                    </span>
                    {current?.id === x.id ? <span className="me-tag">사용 중</span> : <IconChevronRight size={18} />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {unusedPresets.length > 0 && (
          <div className="stack-sm">
            <h3 className="mini-title">준비된 예시 프로필</h3>
            <ul className="pick-list">
              {unusedPresets.map((p) => (
                <li key={p.key}>
                  <button type="button" className="pick-item" onClick={() => createProfile(p.nickname, p.schoolId)}>
                    <Avatar user={{ id: p.key, nickname: p.nickname }} size={38} />
                    <span className="pick-text">
                      <span className="pick-name">{p.nickname}</span>
                      <span className="pick-meta">
                        <SchoolLabel schoolId={p.schoolId} />
                        <span className="muted">인증 전</span>
                      </span>
                    </span>
                    <IconChevronRight size={18} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button type="button" className="btn btn-outline btn-block" onClick={() => setStep('create')} data-autofocus>
          새 데모 프로필 만들기
        </button>
      </div>
    );
  } else if (step === 'create') {
    title = '새 데모 프로필';
    body = (
      <form
        className="stack"
        id="create-profile-form"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          submitCreate();
        }}
      >
        <div className="field">
          <label htmlFor={nickId} className="field-label">
            닉네임
          </label>
          <input
            id={nickId}
            className={`input${errors.nickname ? ' is-error' : ''}`}
            value={nickname}
            maxLength={NICKNAME_MAX}
            placeholder="예: 매점가는길"
            onChange={(e) => setNickname(e.target.value)}
            aria-invalid={!!errors.nickname}
            aria-describedby={`${nickId}-help`}
            data-autofocus
            autoComplete="off"
          />
          <p id={`${nickId}-help`} className={errors.nickname ? 'field-error' : 'field-help'}>
            {errors.nickname ?? '실명 대신 닉네임을 써 주세요. 다른 학생에게는 닉네임과 학교만 보여요.'}
          </p>
        </div>
        <div className="field">
          <label htmlFor={schoolSelId} className="field-label">
            학교 <span className="muted">(가상 학교)</span>
          </label>
          <select
            id={schoolSelId}
            className={`select select-block${errors.school ? ' is-error' : ''}`}
            value={schoolId}
            onChange={(e) => setSchoolId(e.target.value)}
            aria-invalid={!!errors.school}
          >
            <option value="">학교를 골라 주세요</option>
            {REGIONS.map((r) => (
              <optgroup key={r.id} label={r.note ? `${r.label} (${r.note})` : r.label}>
                {SCHOOLS.filter((s) => s.region === r.id).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {errors.school && <p className="field-error">{errors.school}</p>}
        </div>
      </form>
    );
    footer = (
      <>
        <button type="button" className="btn btn-ghost" onClick={() => setStep('choose')}>
          이전
        </button>
        <button type="submit" form="create-profile-form" className="btn btn-primary">
          다음: 학생 인증 체험
        </button>
      </>
    );
  } else if (step === 'verify') {
    title = '학생 인증 체험';
    const schoolName = current ? SCHOOL_BY_ID[current.schoolId]?.name : '';
    body = (
      <div className="stack">
        <div className="callout">
          <IconShield size={20} />
          <p>
            {/* 학생 인증 기반이므로 '완전 익명'이라고 말하지 않는다. */}
            {BRAND.name}는 학교와 재학 여부가 확인된 학생끼리 이야기하는 곳이에요. 다른 학생에게는 닉네임, 학교, 인증 표시만 보여요.
          </p>
        </div>
        <p className="demo-warning">
          발표용 데모라 실제 재학 확인을 하지 않아요. 파일을 올리지 않고 준비된 예시 자료로 흐름만 체험해요.
        </p>

        <fieldset className="doc-choice">
          <legend className="mini-title">예시 자료 고르기</legend>
          <div className="doc-grid">
            {(
              [
                ['card', '예시 학생증'],
                ['certificate', '예시 재학증명서'],
              ] as [DocKind, string][]
            ).map(([kind, label]) => (
              <label key={kind} className={`doc-option${doc === kind ? ' is-selected' : ''}`}>
                <input
                  type="radio"
                  name="doc"
                  value={kind}
                  checked={doc === kind}
                  onChange={() => setDoc(kind)}
                  className="sr-only"
                />
                <SampleDoc kind={kind} schoolName={schoolName ?? ''} />
                <span className="doc-label">{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    );
    footer = (
      <>
        <button type="button" className="btn btn-ghost" onClick={close}>
          나중에
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setChecked(0);
            setStep('checking');
          }}
        >
          이 예시 자료로 인증 체험하기
        </button>
      </>
    );
  } else if (step === 'checking') {
    title = '예시 자료 확인 중';
    body = (
      <div className="stack">
        <ul className="check-list" aria-live="polite">
          {CHECKS.map((c, i) => (
            <li key={c} className={i < checked ? 'is-done' : i === checked ? 'is-active' : ''}>
              <span className="check-dot" aria-hidden>
                {i < checked ? <IconCheck size={14} /> : null}
              </span>
              {c}
              {i < checked && <span className="sr-only"> 완료</span>}
            </li>
          ))}
        </ul>
        <p className="muted small">데모 연출이에요. 어떤 정보도 전송되지 않아요.</p>
      </div>
    );
  } else {
    title = '학생 인증 체험 완료';
    body = (
      <div className="stack">
        <div className="done-mark" aria-hidden>
          <IconCheck size={28} />
        </div>
        <p className="lead center">이제 글쓰기, 댓글, 좋아요, 저장을 쓸 수 있어요.</p>
        <div className="badge-preview">
          <div className="preview-label">다른 학생에게는 이렇게 보여요</div>
          <AuthorInfo user={current ?? undefined} meta={<span>방금</span>} interactiveBadges={false} />
        </div>
        <ul className="note-list">
          <li>실명, 반, 번호는 표시되지 않아요.</li>
          <li>학생 인증 기반 커뮤니티라 완전한 익명 서비스는 아니에요.</li>
          <li>이번 인증은 데모라 실제 재학 여부를 확인하지 않았어요.</li>
          <li>체험용 예시 뱃지 5개를 넣어 뒀어요. 내 프로필에서 표시할 뱃지를 고를 수 있어요.</li>
        </ul>
      </div>
    );
    footer = (
      <button type="button" className="btn btn-primary btn-block" onClick={() => finishOnboarding(modalKey)} data-autofocus>
        계속하기
      </button>
    );
  }

  return (
    <Modal
      focusKey={step}
      title={title}
      eyebrow={step === 'verify' || step === 'checking' || step === 'done' ? '데모 · 학생 인증' : '데모 입장'}
      onClose={step === 'done' ? () => finishOnboarding(modalKey) : close}
      isTop={isTop}
      footer={footer}
      size="md"
    >
      {body}
    </Modal>
  );
}

/** 예시 학생증·재학증명서 그림. 실제 파일은 받지 않는다. */
function SampleDoc({ kind, schoolName }: { kind: DocKind; schoolName: string }) {
  if (kind === 'card') {
    return (
      <div className="sample-doc sample-card" aria-hidden>
        <div className="sample-top">{schoolName || '○○고등학교'}</div>
        <div className="sample-body">
          <div className="sample-photo" />
          <div className="sample-lines">
            <span>학생증</span>
            <span>이름 ○○○</span>
            <span>학번 ●●●●●</span>
          </div>
        </div>
        <div className="sample-stamp">SAMPLE</div>
      </div>
    );
  }
  return (
    <div className="sample-doc sample-cert" aria-hidden>
      <div className="sample-cert-title">재학증명서</div>
      <div className="sample-lines">
        <span>학교 {schoolName || '○○고등학교'}</span>
        <span>이름 ○○○</span>
        <span>학년 ●</span>
      </div>
      <div className="sample-stamp">SAMPLE</div>
    </div>
  );
}
