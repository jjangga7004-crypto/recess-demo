import type { ReactNode } from 'react';
import { BADGES, SCHOOL_BY_ID } from '../data/catalog';
import { avatarHue, initialOf } from '../lib/format';
import { useApp } from '../store/AppContext';
import type { BadgeId, User } from '../types';
import { VerifiedIcon } from './icons';

export function Avatar({ user, size = 36 }: { user: Pick<User, 'id' | 'nickname'>; size?: number }) {
  const hue = avatarHue(user.id);
  return (
    <span
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.42, ['--hue' as string]: hue }}
      aria-hidden
    >
      {initialOf(user.nickname)}
    </span>
  );
}

export function SchoolLabel({ schoolId }: { schoolId: string }) {
  const school = SCHOOL_BY_ID[schoolId];
  return <span className="school-label">{school?.name ?? '학교 미정'}</span>;
}

export function Verified({ verified, withText = false }: { verified: boolean; withText?: boolean }) {
  if (!verified) return <span className="unverified">미인증</span>;
  return (
    <span className="verified" title="학생 인증 (데모)">
      <VerifiedIcon />
      {withText ? <span>학생 인증</span> : <span className="sr-only">학생 인증</span>}
    </span>
  );
}

export function BadgeChip({ badgeId, interactive = true }: { badgeId: BadgeId; interactive?: boolean }) {
  const { openModal } = useApp();
  const b = BADGES[badgeId];
  const cls = `badge-chip badge-${b.kind}`;
  if (!interactive) return <span className={cls}>{b.label}</span>;
  return (
    <button
      type="button"
      className={cls}
      onClick={(e) => {
        e.stopPropagation();
        openModal({ type: 'badge', badgeId });
      }}
      aria-label={`${b.label} 뱃지 설명 보기`}
    >
      {b.label}
    </button>
  );
}

/** 작성자 표시: 닉네임 + 학교 + 학생 인증 + 선택한 뱃지. 실명·반·번호는 없다. */
export function AuthorInfo({
  user,
  size = 'md',
  meta,
  interactiveBadges = true,
}: {
  user: User | undefined;
  size?: 'sm' | 'md';
  meta?: ReactNode;
  interactiveBadges?: boolean;
}) {
  const { me } = useApp();
  if (!user) return <div className="author author-missing">알 수 없는 사용자</div>;
  const isMe = me?.id === user.id;
  return (
    <div className={`author author-${size}`}>
      <Avatar user={user} size={size === 'sm' ? 30 : 38} />
      <div className="author-text">
        <div className="author-line">
          <span className="nickname">{user.nickname}</span>
          {isMe && <span className="me-tag">나</span>}
          <SchoolLabel schoolId={user.schoolId} />
          <Verified verified={user.verified} />
          {user.shownBadges.map((b) => (
            <BadgeChip key={b} badgeId={b} interactive={interactiveBadges} />
          ))}
        </div>
        {meta && <div className="author-meta">{meta}</div>}
      </div>
    </div>
  );
}
