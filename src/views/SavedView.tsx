import { PostCard } from '../components/PostCard';
import { useApp } from '../store/AppContext';
import { JoinPrompt, useSavedPosts } from './ProfileView';

export function SavedView() {
  const { me, setView } = useApp();
  const saved = useSavedPosts();

  return (
    <div className="view">
      <h1 className="view-title">저장한 글</h1>
      {!me ? (
        <JoinPrompt title="저장한 글이 여기에 모여요" text="데모 프로필로 입장한 뒤 글의 저장 버튼을 눌러 보세요." />
      ) : saved.length === 0 ? (
        <div className="card empty">
          <p className="empty-title">아직 저장한 글이 없어요</p>
          <p className="empty-text">다시 보고 싶은 글은 아래쪽 저장 버튼을 눌러 담아 두세요.</p>
          <button type="button" className="btn btn-primary" onClick={() => setView('home')}>
            피드 둘러보기
          </button>
        </div>
      ) : (
        <>
          <p className="view-sub">{saved.length}개 · 최근에 저장한 순</p>
          <div className="feed">
            {saved.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
