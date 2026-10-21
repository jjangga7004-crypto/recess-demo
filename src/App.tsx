import { BottomNav, DemoBanner, MobileHeader, RightRail, SideNav, Toasts } from './components/Layout';
import { ModalHost } from './modals/ModalHost';
import { AppProvider, useApp } from './store/AppContext';
import { CollectView } from './views/CollectView';
import { CommunityView } from './views/CommunityView';
import { ProfileView } from './views/ProfileView';
import { SavedView } from './views/SavedView';
import { SettingsView } from './views/SettingsView';

function Shell() {
  const { view } = useApp();
  return (
    <>
      <div className="top-sticky">
        <DemoBanner />
        <MobileHeader />
      </div>
      <div className="shell">
        <SideNav />
        <main className="main" id="main">
          {view === 'collect' && <CollectView />}
          {view === 'community' && <CommunityView />}
          {view === 'saved' && <SavedView />}
          {view === 'profile' && <ProfileView />}
          {view === 'settings' && <SettingsView />}
        </main>
        <RightRail />
      </div>
      <BottomNav />
      <Toasts />
      <ModalHost />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
