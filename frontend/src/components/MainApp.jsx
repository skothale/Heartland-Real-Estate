import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';
import Sidebar from './Sidebar.jsx';
import HomePanel from './HomePanel.jsx';
import DocumentsPanel from './DocumentsPanel.jsx';
import UploadDocumentPanel from './UploadDocumentPanel.jsx';
import AgentsPanel from './AgentsPanel.jsx';

const SettingsPanel = lazy(() => import('./SettingsPanel.jsx'));

const KNOWN_HASH_TABS = ['home', 'documents', 'upload', 'agents', 'settings'];

function getTabFromHash() {
  const raw = String(window.location.hash || '').replace(/^#/, '').trim();
  return raw || null;
}

function setHashForTab(tabId) {
  const next = `#${tabId}`;
  if (window.location.hash !== next) {
    window.location.hash = next;
  }
}

function readInitialTabFromUrl() {
  const h = getTabFromHash();
  if (h && KNOWN_HASH_TABS.includes(h)) return h;
  return 'home';
}

export default function MainApp({ onLogout }) {
  const { user } = useAuth();
  const [sidebarActive, setSidebarActive] = useState(readInitialTabFromUrl);
  const [documentsRefreshKey, setDocumentsRefreshKey] = useState(0);
  const uploadPanelRef = useRef(null);

  const allowedTabs = useMemo(() => {
    const base = ['home', 'documents', 'upload', 'settings'];
    return user?.role === 'admin' ? [...base, 'agents'] : base;
  }, [user?.role]);

  const selectTab = useCallback((id) => {
    setSidebarActive(id);
    setHashForTab(id);
  }, []);

  const bumpDocuments = useCallback(() => {
    setDocumentsRefreshKey((k) => k + 1);
  }, []);

  /** If URL has no hash, record the current tab once (shareable / refresh-safe). */
  useEffect(() => {
    if (!getTabFromHash()) {
      setHashForTab(sidebarActive);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Normalize unknown hash fragments. */
  useEffect(() => {
    const h = getTabFromHash();
    if (h && !KNOWN_HASH_TABS.includes(h)) {
      setHashForTab('home');
    }
  }, []);

  /** When role is known, drop tabs the user cannot use (e.g. #agents for non-admin). */
  useEffect(() => {
    if (!allowedTabs.includes(sidebarActive)) {
      setSidebarActive('home');
      setHashForTab('home');
    }
  }, [allowedTabs, sidebarActive]);

  useEffect(() => {
    const onHashChange = () => {
      const next = getTabFromHash();
      if (!next) return;
      if (!allowedTabs.includes(next)) {
        setSidebarActive('home');
        setHashForTab('home');
        return;
      }
      setSidebarActive(next);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [allowedTabs]);

  const newUploadClick = useCallback(() => {
    selectTab('upload');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        uploadPanelRef.current?.openFilePicker?.();
      });
    });
  }, [selectTab]);

  return (
    <div className="app-shell">
      <Sidebar
        active={sidebarActive}
        onSelect={selectTab}
        onLogout={onLogout}
        userRole={user?.role}
      />

      <div className="main">
        <header className="main__top">
          <div className="search-pill" role="search">
            <Search size={17} strokeWidth={2} />
            <span>Search documents…</span>
            <kbd>⌘ K</kbd>
          </div>
          <button type="button" className="btn-primary" onClick={newUploadClick}>
            <Plus size={17} strokeWidth={2.5} />
            New upload
          </button>
        </header>

        <div className="chat-scroll">
          <div
            className="tab-panel"
            style={{ display: sidebarActive === 'home' ? 'block' : 'none' }}
            aria-hidden={sidebarActive !== 'home'}
          >
            <HomePanel
              onGoToUploadDocument={() => selectTab('upload')}
              onGoToDocuments={() => selectTab('documents')}
            />
          </div>
          <div
            className="tab-panel"
            style={{ display: sidebarActive === 'documents' ? 'block' : 'none' }}
            aria-hidden={sidebarActive !== 'documents'}
          >
            <DocumentsPanel refreshKey={documentsRefreshKey} />
          </div>
          <div
            className="tab-panel"
            style={{ display: sidebarActive === 'agents' ? 'block' : 'none' }}
            aria-hidden={sidebarActive !== 'agents'}
          >
            <AgentsPanel
              onAgentsChanged={() => {
                setDocumentsRefreshKey((k) => k + 1);
              }}
            />
          </div>
          <div
            className="tab-panel"
            style={{ display: sidebarActive === 'settings' ? 'block' : 'none' }}
            aria-hidden={sidebarActive !== 'settings'}
          >
            {sidebarActive === 'settings' ? (
              <Suspense fallback={<p className="documents-loading">Loading settings…</p>}>
                <SettingsPanel />
              </Suspense>
            ) : null}
          </div>
          <div
            className="tab-panel"
            style={{ display: sidebarActive === 'upload' ? 'block' : 'none' }}
            aria-hidden={sidebarActive !== 'upload'}
          >
            <UploadDocumentPanel
              ref={uploadPanelRef}
              onUploadSuccess={bumpDocuments}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
