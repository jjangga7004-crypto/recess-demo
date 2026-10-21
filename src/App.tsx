import { BottomNav, DemoBanner, MobileHeader, RightRail, SideNav, Toasts } from './components/Layout';
import { ModalHost } from './modals/ModalHost';
import { AppProvider, useApp } from './store/AppContext';
import { HomeView } from './views/HomeView';
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
          {view === 'home' && <HomeView />}
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
