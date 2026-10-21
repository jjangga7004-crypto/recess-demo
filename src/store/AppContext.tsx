import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react';
import { DEFAULT_FILTERS } from '../lib/feed';
import type { AppState, BadgeId, FeedFilters, ProfileState, User, ViewId } from '../types';
import { loadState, profileStateOf, reducer, saveState, type Action } from './state';

export type ModalSpec =
  | { type: 'onboarding' }
  | { type: 'compose'; editId?: string }
  | { type: 'post'; id: string; focusComment?: boolean }
  | { type: 'report'; postId: string }
  | {
      type: 'confirm';
      title: string;
      message: string;
      confirmLabel: string;
      danger?: boolean;
      onConfirm: () => void;
    }
  | { type: 'badge'; badgeId: BadgeId }
  | { type: 'academy' }
  | { type: 'planner' };

export type OpenModal = ModalSpec & { key: number };

export interface Toast {
  id: number;
  message: string;
  action?: { label: string; run: () => void };
}

interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
  me: User | null;
  ps: ProfileState;
  userById: (id: string) => User | undefined;
  now: number;
  view: ViewId;
  setView: (v: ViewId) => void;
  filters: FeedFilters;
  setFilters: (patch: Partial<FeedFilters>) => void;
  resetFilters: () => void;
  modals: OpenModal[];
  openModal: (spec: ModalSpec) => void;
  closeModal: (key: number) => void;
  /** 참여 기능 앞에 둔다. 인증된 데모 프로필이 없으면 입장 화면을 먼저 띄운다. */
  gate: (fn: () => void) => void;
  finishOnboarding: (key: number) => void;
  cancelOnboarding: (key: number) => void;
  toasts: Toast[];
  toast: (message: string, action?: Toast['action']) => void;
  dismissToast: (id: number) => void;
  flashId: string | null;
  flashPost: (id: string) => void;
}

const Ctx = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const [view, setViewRaw] = useState<ViewId>('home');
  const [filters, setFiltersRaw] = useState<FeedFilters>(DEFAULT_FILTERS);
  const [modals, setModals] = useState<OpenModal[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [flashId, setFlashId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const keyRef = useRef(0);
  const pendingRef = useRef<(() => void) | null>(null);

  useEffect(() => saveState(state), [state]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(t);
  }, []);

  // 테마: 기본은 밝은 화면. '시스템'을 고르면 기기 설정을 따른다.
  useEffect(() => {
    const root = document.documentElement;
    if (state.theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  const usersById = useMemo(() => new Map(state.users.map((x) => [x.id, x])), [state.users]);
  const me = (state.currentProfileId && usersById.get(state.currentProfileId)) || null;
  const ps = profileStateOf(state);

  const setView = useCallback((v: ViewId) => {
    setViewRaw(v);
    window.scrollTo({ top: 0 });
  }, []);

  const setFilters = useCallback((patch: Partial<FeedFilters>) => setFiltersRaw((f) => ({ ...f, ...patch })), []);
  const resetFilters = useCallback(() => setFiltersRaw((f) => ({ ...DEFAULT_FILTERS, sort: f.sort })), []);

  const openModal = useCallback((spec: ModalSpec) => {
    keyRef.current += 1;
    const key = keyRef.current;
    setModals((m) => [...m, { ...spec, key }]);
  }, []);
  const closeModal = useCallback((key: number) => setModals((m) => m.filter((x) => x.key !== key)), []);

  const gate = useCallback(
    (fn: () => void) => {
      if (me?.verified) {
        fn();
        return;
      }
      pendingRef.current = fn;
      openModal({ type: 'onboarding' });
    },
    [me, openModal],
  );

  const finishOnboarding = useCallback(
    (key: number) => {
      closeModal(key);
      const fn = pendingRef.current;
      pendingRef.current = null;
      // 프로필이 상태에 반영된 다음 이어서 하던 동작을 실행한다.
      if (fn) window.setTimeout(fn, 0);
    },
    [closeModal],
  );
  const cancelOnboarding = useCallback(
    (key: number) => {
      pendingRef.current = null;
      closeModal(key);
    },
    [closeModal],
  );

  const toast = useCallback((message: string, action?: Toast['action']) => {
    keyRef.current += 1;
    const id = keyRef.current;
    setToasts((t) => [...t.slice(-2), { id, message, action }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), action ? 6000 : 3500);
  }, []);
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const flashPost = useCallback((id: string) => {
    setFlashId(id);
    window.setTimeout(() => setFlashId((cur) => (cur === id ? null : cur)), 2600);
  }, []);

  const value: AppContextValue = {
    state,
    dispatch,
    me,
    ps,
    userById: (id) => usersById.get(id),
    now,
    view,
    setView,
    filters,
    setFilters,
    resetFilters,
    modals,
    openModal,
    closeModal,
    gate,
    finishOnboarding,
    cancelOnboarding,
    toasts,
    toast,
    dismissToast,
    flashId,
    flashPost,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): AppContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp must be used inside AppProvider');
  return v;
}
