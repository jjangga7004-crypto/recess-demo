import { useId, useState } from 'react';
import { LinkCard } from '../components/LinkCard';
import { PostCard } from '../components/PostCard';
import { useApp } from '../store/AppContext';
import { JoinPrompt, useSavedPosts } from './ProfileView';

/** 저장: 모아보기에서 담은 외부 링크(이 기기)와 RECESS에서 저장한 글(데모 프로필별) */
export function SavedView() {
  const { state, me, setView } = useApp();
  const [tab, setTab] = useState<'links' | 'posts'>('links');
  const tabsId = useId();
  const savedPosts = useSavedPosts();
  const savedLinks = [...state.linkPrefs.saved]
    .reverse()
    .map((id) => state.links.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => !!l);

  return (
    <div className="view">
      <h1 className="view-title">저장</h1>

      <div className="tabs" role="tablist" aria-label="저장한 항목">
        <button
          type="button"
          role="tab"
          id={`${tabsId}-links`}
          aria-controls={`${tabsId}-panel`}
          aria-selected={tab === 'links'}
          className={`tab${tab === 'links' ? ' is-active' : ''}`}
          onClick={() => setTab('links')}
        >
          모아보기 링크 <span className="tab-count">{savedLinks.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          id={`${tabsId}-posts`}
          aria-controls={`${tabsId}-panel`}
          aria-selected={tab === 'posts'}
          className={`tab${tab === 'posts' ? ' is-active' : ''}`}
          onClick={() => setTab('posts')}
        >
          RECESS 글 <span className="tab-count">{savedPosts.length}</span>
        </button>
      </div>

      <div role="tabpanel" id={`${tabsId}-panel`} aria-labelledby={`${tabsId}-${tab}`}>
        {tab === 'links' ? (
          savedLinks.length === 0 ? (
            <div className="card empty">
              <p className="empty-title">저장한 링크가 없어요</p>
              <p className="empty-text">모아보기 카드의 저장 버튼을 누르면 여기에 모여요. 이 기기에만 저장돼요.</p>
              <button type="button" className="btn btn-primary" onClick={() => setView('collect')}>
                모아보기로 가기
              </button>
            </div>
          ) : (
            <>
              <p className="view-sub">{savedLinks.length}개 · 최근에 저장한 순 · 숨기거나 제외한 출처의 카드도 여기엔 남아요</p>
              <div className="link-list">
                {savedLinks.map((l) => (
                  <LinkCard key={l.id} item={l} />
                ))}
              </div>
            </>
          )
        ) : !me ? (
          <JoinPrompt title="RECESS 글 저장은 데모 프로필로" text="데모 프로필로 입장한 뒤 글의 저장 버튼을 눌러 보세요." />
        ) : savedPosts.length === 0 ? (
          <div className="card empty">
            <p className="empty-title">저장한 RECESS 글이 없어요</p>
            <p className="empty-text">다시 보고 싶은 글은 아래쪽 저장 버튼을 눌러 담아 두세요.</p>
            <button type="button" className="btn btn-primary" onClick={() => setView('community')}>
              RECESS 둘러보기
            </button>
          </div>
        ) : (
          <div className="feed">
            {savedPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
