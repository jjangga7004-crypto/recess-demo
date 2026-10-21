import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { IconX } from './icons';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface ModalProps {
  title: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  isTop: boolean;
  size?: 'sm' | 'md' | 'lg';
  eyebrow?: ReactNode;
  /** 값이 바뀌면(단계 이동 등) 첫 입력 요소로 포커스를 다시 옮긴다. */
  focusKey?: string | number;
}

/** 접근 가능한 대화상자: Esc로 닫기, 포커스 가두기, 닫으면 원래 위치로 포커스 복귀 */
export function Modal({ title, onClose, children, footer, isTop, size = 'md', eyebrow, focusKey }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // 열릴 때: 배경 스크롤 잠금. 닫힐 때: 원래 요소로 포커스 복귀.
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    document.body.classList.add('modal-open');
    return () => {
      window.setTimeout(() => {
        const backdrops = document.querySelectorAll('.modal-backdrop');
        if (backdrops.length === 0) document.body.classList.remove('modal-open');
        const top = backdrops[backdrops.length - 1];
        // 다른 모달이 위에 떠 있으면 그 안의 요소일 때만 되돌린다.
        if (prev && document.contains(prev) && (!top || top.contains(prev))) {
          prev.focus({ preventScroll: true });
        }
      }, 0);
    };
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const target = panel.querySelector<HTMLElement>('[data-autofocus]') || panel;
    target.focus({ preventScroll: true });
  }, [focusKey]);

  useEffect(() => {
    if (!isTop) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (items.length === 0) {
        e.preventDefault();
        panelRef.current.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (!panelRef.current.contains(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && (active === first || active === panelRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isTop]);

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && isTop) onClose();
      }}
    >
      <div
        ref={panelRef}
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        aria-hidden={isTop ? undefined : true}
      >
        <div className="modal-head">
          <div className="modal-head-text">
            {eyebrow && <div className="modal-eyebrow">{eyebrow}</div>}
            <h2 id={titleId} className="modal-title">
              {title}
            </h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="닫기">
            <IconX />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}
