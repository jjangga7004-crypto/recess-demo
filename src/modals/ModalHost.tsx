import { useApp } from '../store/AppContext';
import { ComposeModal } from './ComposeModal';
import { CreateChooserModal, LinkDetailModal, LinkFormModal } from './LinkModals';
import { OnboardingModal } from './OnboardingModal';
import { PostDetailModal } from './PostDetailModal';
import { AcademyModal, BadgeModal, ConfirmModal, PlannerModal, ReportModal } from './SmallModals';

/** 열린 모달을 쌓인 순서대로 그린다. 맨 위 모달만 키보드 포커스를 가진다. */
export function ModalHost() {
  const { modals } = useApp();
  return (
    <>
      {modals.map((m, i) => {
        const isTop = i === modals.length - 1;
        const common = { modalKey: m.key, isTop };
        switch (m.type) {
          case 'onboarding':
            return <OnboardingModal key={m.key} {...common} />;
          case 'compose':
            return <ComposeModal key={m.key} {...common} editId={m.editId} linkId={m.linkId} />;
          case 'create':
            return <CreateChooserModal key={m.key} {...common} />;
          case 'linkForm':
            return <LinkFormModal key={m.key} {...common} editId={m.editId} />;
          case 'linkDetail':
            return <LinkDetailModal key={m.key} {...common} id={m.id} />;
          case 'post':
            return <PostDetailModal key={m.key} {...common} postId={m.id} focusComment={m.focusComment} />;
          case 'report':
            return <ReportModal key={m.key} {...common} postId={m.postId} />;
          case 'confirm':
            return (
              <ConfirmModal
                key={m.key}
                {...common}
                title={m.title}
                message={m.message}
                confirmLabel={m.confirmLabel}
                danger={m.danger}
                onConfirm={m.onConfirm}
              />
            );
          case 'badge':
            return <BadgeModal key={m.key} {...common} badgeId={m.badgeId} />;
          case 'academy':
            return <AcademyModal key={m.key} {...common} />;
          case 'planner':
            return <PlannerModal key={m.key} {...common} />;
        }
      })}
    </>
  );
}
