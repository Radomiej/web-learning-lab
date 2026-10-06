import { useState } from 'react';

export default function AppShell({ sidebar, main, inspector, sidebarOpen, onSidebarClose, toolbarActions }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return (
    <div className={`app-shell${sidebarOpen ? ' app-shell--sidebar-open' : ''}${sidebarCollapsed ? ' app-shell--sidebar-collapsed' : ''}`}>
      <button
        className="sidebar-backdrop"
        type="button"
        aria-label="Zamknij menu"
        onClick={onSidebarClose}
      />
      <aside className="sidebar-region" id="course-sidebar">{sidebar}</aside>
      <main className="main-region">
        <div className="workspace-toolbar">
          <button className="button button--ghost" type="button" title={sidebarCollapsed ? 'Pokaż panel lekcji' : 'Schowaj panel lekcji'} aria-controls="course-sidebar" aria-expanded={!sidebarCollapsed} onClick={() => setSidebarCollapsed(value => !value)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <path d="M9 4v16" />
              <path d={sidebarCollapsed ? 'm13 9 3 3-3 3' : 'm16 9-3 3 3 3'} />
            </svg>
            {sidebarCollapsed ? 'Pokaż panel lekcji' : 'Schowaj panel lekcji'}
          </button>
          {toolbarActions}
        </div>
        {main}
      </main>
      <aside className="inspector-region" aria-label="Podgląd i diagnostyka">
        {inspector}
      </aside>
    </div>
  );
}
