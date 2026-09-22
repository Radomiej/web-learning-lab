import { useState } from 'react';

export default function AppShell({ sidebar, main, inspector, sidebarOpen, onSidebarClose }) {
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
          <button className="button button--ghost" type="button" aria-controls="course-sidebar" aria-expanded={!sidebarCollapsed} onClick={() => setSidebarCollapsed(value => !value)}>
            {sidebarCollapsed ? 'Pokaż panel lekcji' : 'Schowaj panel lekcji'}
          </button>
        </div>
        {main}
      </main>
      <aside className="inspector-region" aria-label="Podgląd i diagnostyka">
        {inspector}
      </aside>
    </div>
  );
}
