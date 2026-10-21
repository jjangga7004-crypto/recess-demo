import { commentCount } from '../lib/feed';
import { useApp } from '../store/AppContext';
import { likeCountOf } from '../store/state';
import type { Post } from '../types';
import { IconBan, IconEdit, IconEyeOff, IconFlag, IconTrash } from './icons';
import type { MenuItem } from './Menu';

/** 게시글 카드와 상세 화면이 함께 쓰는 반응·메뉴 동작 */
export function usePostActions(post: Post) {
  const { state, dispatch, me, ps, gate, openModal, toast, userById } = useApp();
  const liked = ps.liked.includes(post.id);
  const saved = ps.saved.includes(post.id);
  const likes = likeCountOf(state, post);
  const comments = commentCount(state, post.id, ps);
  const isMine = !!me && post.authorId === me.id;
  const author = userById(post.authorId);

  const toggleLike = () => gate(() => dispatch({ type: 'toggleLike', postId: post.id }));

  const toggleSave = () =>
    gate(() => {
      const wasSaved = ps.saved.includes(post.id);
      dispatch({ type: 'toggleSave', postId: post.id });
      toast(wasSaved ? '저장을 취소했어요' : '저장한 글에 담았어요');
    });

  const menuItems: MenuItem[] = isMine
    ? [
        {
          label: '수정하기',
          icon: <IconEdit size={18} />,
          onSelect: () => openModal({ type: 'compose', editId: post.id }),
        },
        {
          label: '삭제하기',
          icon: <IconTrash size={18} />,
          danger: true,
          onSelect: () =>
            openModal({
              type: 'confirm',
              title: '이 글을 삭제할까요?',
              message: '삭제한 글과 달린 댓글은 되돌릴 수 없어요.',
              confirmLabel: '삭제',
              danger: true,
              onConfirm: () => {
                dispatch({ type: 'deletePost', id: post.id });
                toast('글을 삭제했어요');
              },
            }),
        },
      ]
    : [
        {
          label: '신고하기',
          icon: <IconFlag size={18} />,
          onSelect: () => gate(() => openModal({ type: 'report', postId: post.id })),
        },
        {
          label: '이 글 숨기기',
          icon: <IconEyeOff size={18} />,
          onSelect: () =>
            gate(() => {
              dispatch({ type: 'hidePost', postId: post.id });
              toast('글을 숨겼어요', {
                label: '되돌리기',
                run: () => dispatch({ type: 'unhidePost', postId: post.id }),
              });
            }),
        },
        {
          label: `${author?.nickname ?? '작성자'} 차단하기`,
          icon: <IconBan size={18} />,
          danger: true,
          onSelect: () =>
            gate(() =>
              openModal({
                type: 'confirm',
                title: `${author?.nickname ?? '이 학생'}님을 차단할까요?`,
                message: '차단하면 이 학생의 글과 댓글이 보이지 않아요. 설정에서 언제든 해제할 수 있어요.',
                confirmLabel: '차단',
                danger: true,
                onConfirm: () => {
                  dispatch({ type: 'block', userId: post.authorId });
                  toast(`${author?.nickname ?? '작성자'}님을 차단했어요`, {
                    label: '해제',
                    run: () => dispatch({ type: 'unblock', userId: post.authorId }),
                  });
                },
              }),
            ),
        },
      ];

  return { liked, saved, likes, comments, isMine, author, toggleLike, toggleSave, menuItems };
}
