import { ADS } from '../data/seed';
import { useApp } from '../store/AppContext';
import { IconChevronRight } from './icons';

/** 광고는 항상 '광고' 표시를 달고, 학생 글과 다른 모양으로 보인다. */
export function AcademyAdCard({ compact = false }: { compact?: boolean }) {
  const { openModal } = useApp();
  const ad = ADS.academy;
  return (
    <aside className={`card ad-card ad-academy${compact ? ' is-compact' : ''}`} aria-label="광고">
      <div className="ad-label">{ad.label}</div>
      <div className="ad-brand">
        <span className="ad-logo" aria-hidden>
          쉼
        </span>
        <div>
          <div className="ad-name">{ad.name}</div>
          <div className="ad-area">{ad.area}</div>
        </div>
      </div>
      <div className="ad-title">{ad.title}</div>
      <p className="ad-summary">{ad.summary}</p>
      <button type="button" className="btn btn-outline btn-sm" onClick={() => openModal({ type: 'academy' })}>
        자세히 보기 <IconChevronRight size={16} />
      </button>
    </aside>
  );
}

export function PlannerAdCard() {
  const { openModal } = useApp();
  const ad = ADS.planner;
  return (
    <aside className="card ad-card ad-planner" aria-label="광고">
      <div className="ad-label">{ad.label}</div>
      <div className="ad-brand">
        <span className="ad-logo ad-logo-planner" aria-hidden>
          H
        </span>
        <div>
          <div className="ad-name">{ad.name}</div>
          <div className="ad-area">스터디 용품</div>
        </div>
      </div>
      <div className="ad-title">{ad.title}</div>
      <p className="ad-summary">{ad.summary}</p>
      <button type="button" className="btn btn-outline btn-sm" onClick={() => openModal({ type: 'planner' })}>
        자세히 보기 <IconChevronRight size={16} />
      </button>
    </aside>
  );
}
