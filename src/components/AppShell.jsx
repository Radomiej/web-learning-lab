export default function AppShell({ sidebar, main, inspector, sidebarOpen, onSidebarClose }) {
  return (
    <div className={`app-shell${sidebarOpen ? ' app-shell--sidebar-open' : ''}`}>
      <button
        className="sidebar-backdrop"
        type="button"
        aria-label="Zamknij menu"
        onClick={onSidebarClose}
      />
      <aside className="sidebar-region">{sidebar}</aside>
      <main className="main-region">{main}</main>
      <aside className="inspector-region" aria-label="Podgląd i diagnostyka">
        {inspector}
      </aside>
    </div>
  );
}
