import { useState } from 'react';
import { Modal } from '../components/Modal';
import { BRAND } from '../config';
import { BADGES, REPORT_REASONS } from '../data/catalog';
import { ADS } from '../data/seed';
import { useApp } from '../store/AppContext';
import { newId } from '../store/state';
import type { BadgeId } from '../types';

interface Base {
  modalKey: number;
  isTop: boolean;
}

export function ReportModal({ modalKey, isTop, postId }: Base & { postId: string }) {
  const { state, dispatch, closeModal, toast } = useApp();
  const post = state.posts.find((p) => p.id === postId);
  const [reason, setReason] = useState('');
  const [hide, setHide] = useState(true);
  const [error, setError] = useState('');
  const close = () => closeModal(modalKey);

  const submit = () => {
    if (!reason) {
      setError('신고 사유를 하나 골라 주세요.');
      return;
    }
    dispatch({ type: 'report', id: newId('r'), postId, reason, hide, at: Date.now() });
    close();
    toast(
      hide ? '신고 시연이 완료됐어요. 이 글은 피드에서 숨겼어요.' : '신고 시연이 완료됐어요. 실제로 전송되지는 않아요.',
      hide ? { label: '되돌리기', run: () => dispatch({ type: 'unhidePost', postId }) } : undefined,
    );
  };

  return (
    <Modal
      title="신고하기"
      eyebrow="데모 · 신고 시연"
      onClose={close}
      isTop={isTop}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={close}>
            취소
          </button>
          <button type="button" className="btn btn-danger" onClick={submit}>
            신고 시연하기
          </button>
        </>
      }
    >
      <div className="stack">
        {post && <p className="quote clamp-2">“{post.title}”</p>}
        <fieldset className="field">
          <legend className="field-label">어떤 점이 문제인가요?</legend>
          <div className="radio-list">
            {REPORT_REASONS.map((r, i) => (
              <label key={r} className={`radio-row${reason === r ? ' is-selected' : ''}`}>
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => {
                    setReason(r);
                    setError('');
                  }}
                  data-autofocus={i === 0 ? true : undefined}
                />
                <span>{r}</span>
              </label>
            ))}
          </div>
          {error && <p className="field-error">{error}</p>}
        </fieldset>
        <label className="check-row">
          <input type="checkbox" checked={hide} onChange={(e) => setHide(e.target.checked)} />
          <span>신고한 글을 내 피드에서 숨기기</span>
        </label>
        <p className="muted small">발표용 데모라 신고 내용은 운영자에게 전송되지 않고, 이 브라우저에 기록만 남아요.</p>
      </div>
    </Modal>
  );
}

export function ConfirmModal({
  modalKey,
  isTop,
  title,
  message,
  confirmLabel,
  danger,
  onConfirm,
}: Base & { title: string; message: string; confirmLabel: string; danger?: boolean; onConfirm: () => void }) {
  const { closeModal } = useApp();
  const close = () => closeModal(modalKey);
  return (
    <Modal
      title={title}
      onClose={close}
      isTop={isTop}
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={close} data-autofocus>
            취소
          </button>
          <button
            type="button"
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => {
              close();
              onConfirm();
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="confirm-text">{message}</p>
    </Modal>
  );
}

export function BadgeModal({ modalKey, isTop, badgeId }: Base & { badgeId: BadgeId }) {
  const { closeModal } = useApp();
  const b = BADGES[badgeId];
  const close = () => closeModal(modalKey);
  return (
    <Modal
      title={b.label}
      eyebrow={b.kind === 'grade' ? '성적 뱃지 · 예시' : '활동·기여 뱃지 · 예시'}
      onClose={close}
      isTop={isTop}
      size="sm"
      footer={
        <button type="button" className="btn btn-primary btn-block" onClick={close} data-autofocus>
          확인
        </button>
      }
    >
      <div className="stack">
        <div>
          <span className={`badge-chip badge-${b.kind} badge-chip-lg`}>{b.label}</span>
        </div>
        <p>{b.summary}</p>
        <dl className="facts">
          {b.details.map((d) => (
            <div key={d.label}>
              <dt>{d.label}</dt>
              <dd>{d.value}</dd>
            </div>
          ))}
        </dl>
        <p className="demo-warning">
          {b.kind === 'grade'
            ? '예시 인증 기록이에요. 실제 성적을 확인한 기록이 아니에요. 성적 뱃지는 본인이 고를 때만 보여요.'
            : '예시 기준이에요. 활동 뱃지는 커뮤니티 활동으로만 받고, 학원 등록이나 결제로는 받을 수 없어요.'}
        </p>
      </div>
    </Modal>
  );
}

export function AcademyModal({ modalKey, isTop }: Base) {
  const { closeModal } = useApp();
  const ad = ADS.academy;
  const [step, setStep] = useState<'info' | 'consult' | 'done'>('info');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [time, setTime] = useState('');
  const [grade, setGrade] = useState('');
  const [error, setError] = useState('');
  const close = () => closeModal(modalKey);

  const finish = () => {
    if (subjects.length === 0 || !time) {
      setError('관심 과목과 희망 시간을 하나 이상 골라 주세요.');
      return;
    }
    setError('');
    setStep('done');
  };

  let body: JSX.Element;
  let footer: JSX.Element;

  if (step === 'info') {
    body = (
      <div className="stack">
        <div className="ad-hero">
          <span className="ad-logo ad-logo-lg" aria-hidden>
            쉼
          </span>
          <div>
            <div className="ad-name">{ad.name}</div>
            <div className="ad-area">{ad.area}</div>
          </div>
        </div>
        <p className="lead">{ad.description}</p>
        <ol className="step-list">
          {ad.points.map((p) => (
            <li key={p.title}>
              <strong>{p.title}</strong>
              <span>{p.text}</span>
            </li>
          ))}
        </ol>
        <dl className="facts">
          {ad.facts.map((f) => (
            <div key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
        <p className="muted small">
          {BRAND.name} 팀이 운영하는 학원을 가정한 예시 광고예요. 학원 이름과 강좌 내용은 가상이고, 커뮤니티 활동이나 뱃지와는 관계없어요.
        </p>
      </div>
    );
    footer = (
      <>
        <button type="button" className="btn btn-ghost" onClick={close}>
          닫기
        </button>
        <button type="button" className="btn btn-primary" onClick={() => setStep('consult')} data-autofocus>
          상담 체험하기
        </button>
      </>
    );
  } else if (step === 'consult') {
    const toggleSubject = (s: string) =>
      setSubjects((list) => (list.includes(s) ? list.filter((x) => x !== s) : [...list, s]));
    body = (
      <div className="stack">
        <p className="lead">관심 있는 내용만 골라 주세요. 이름이나 연락처는 받지 않아요.</p>
        <fieldset className="field">
          <legend className="field-label">관심 과목 (여러 개 선택 가능)</legend>
          <div className="chip-radio">
            {ad.subjects.map((s, i) => (
              <label key={s} className={`chip-option${subjects.includes(s) ? ' is-selected' : ''}`}>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={subjects.includes(s)}
                  onChange={() => toggleSubject(s)}
                  data-autofocus={i === 0 ? true : undefined}
                />
                {s}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="field">
          <legend className="field-label">희망 시간</legend>
          <div className="chip-radio">
            {ad.times.map((t) => (
              <label key={t} className={`chip-option${time === t ? ' is-selected' : ''}`}>
                <input type="radio" name="time" className="sr-only" checked={time === t} onChange={() => setTime(t)} />
                {t}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="field">
          <legend className="field-label">
            학년 <span className="muted">(선택)</span>
          </legend>
          <div className="chip-radio">
            {ad.grades.map((g) => (
              <label key={g} className={`chip-option${grade === g ? ' is-selected' : ''}`}>
                <input
                  type="radio"
                  name="grade"
                  className="sr-only"
                  checked={grade === g}
                  onChange={() => setGrade(g)}
                />
                {g}
              </label>
            ))}
          </div>
        </fieldset>
        {error && <p className="field-error">{error}</p>}
      </div>
    );
    footer = (
      <>
        <button type="button" className="btn btn-ghost" onClick={() => setStep('info')}>
          이전
        </button>
        <button type="button" className="btn btn-primary" onClick={finish}>
          상담 체험 마치기
        </button>
      </>
    );
  } else {
    body = (
      <div className="stack">
        <div className="done-mark" aria-hidden>
          ✓
        </div>
        <p className="lead center">상담 체험이 끝났어요</p>
        <dl className="facts">
          <div>
            <dt>관심 과목</dt>
            <dd>{subjects.join(', ')}</dd>
          </div>
          <div>
            <dt>희망 시간</dt>
            <dd>{time}</dd>
          </div>
          {grade && (
            <div>
              <dt>학년</dt>
              <dd>{grade}</dd>
            </div>
          )}
        </dl>
        <p className="demo-warning">
          고른 내용은 어디에도 전송되지 않았어요. 실제 서비스에서는 이 단계에서 학원 상담 예약으로 이어지는 흐름을 가정했어요.
        </p>
      </div>
    );
    footer = (
      <button type="button" className="btn btn-primary btn-block" onClick={close} data-autofocus>
        피드로 돌아가기
      </button>
    );
  }

  return (
    <Modal
      title={step === 'consult' ? '상담 체험' : step === 'done' ? '상담 체험 완료' : ad.title}
      eyebrow={ad.label}
      onClose={close}
      isTop={isTop}
      size="md"
      focusKey={step}
      footer={footer}
    >
      {body}
    </Modal>
  );
}

export function PlannerModal({ modalKey, isTop }: Base) {
  const { closeModal } = useApp();
  const ad = ADS.planner;
  const close = () => closeModal(modalKey);
  return (
    <Modal
      title={ad.title}
      eyebrow={ad.label}
      onClose={close}
      isTop={isTop}
      size="sm"
      footer={
        <button type="button" className="btn btn-primary btn-block" onClick={close} data-autofocus>
          닫기
        </button>
      }
    >
      <div className="stack">
        <div className="ad-hero">
          <span className="ad-logo ad-logo-planner ad-logo-lg" aria-hidden>
            H
          </span>
          <div>
            <div className="ad-name">{ad.name}</div>
            <div className="ad-area">스터디 용품</div>
          </div>
        </div>
        <p>{ad.summary}</p>
        <p className="muted">{ad.description}</p>
        <p className="demo-warning">예시 광고예요. 구매 페이지로 연결되지 않아요.</p>
      </div>
    </Modal>
  );
}
