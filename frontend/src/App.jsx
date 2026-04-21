import { useCallback, useRef, useState } from 'react';
import { Search, Plus } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import HomePanel from './components/HomePanel.jsx';
import DocumentsPanel from './components/DocumentsPanel.jsx';
import UploadDocumentPanel from './components/UploadDocumentPanel.jsx';

export default function App() {
  const [sidebarActive, setSidebarActive] = useState('home');
  const [documentsRefreshKey, setDocumentsRefreshKey] = useState(0);
  const uploadPanelRef = useRef(null);

  const bumpDocuments = useCallback(() => {
    setDocumentsRefreshKey((k) => k + 1);
  }, []);

  const newUploadClick = useCallback(() => {
    setSidebarActive('upload');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        uploadPanelRef.current?.openFilePicker?.();
      });
    });
  }, []);

  return (
    <div className="app-shell">
      <Sidebar active={sidebarActive} onSelect={setSidebarActive} />

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
              onGoToUploadDocument={() => setSidebarActive('upload')}
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
