import { useState } from 'react';
import Sidebar from './sidebar';
import Header from './header';
import ChatbotPanel from '../pages/ChatbotPanel';
import '../style/Layout_Style.css';

export default function Layout({ children, title, subtitle, showSearch = false }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', String(next));
      } catch {
        console.warn('Gagal menyimpan status sidebar_collapsed ke localStorage');
      }
      return next;
    });
  };

  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  return (
    <div className={`app-shell ${isCollapsed ? 'collapsed' : ''}`}>
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      <main className="main">
        <Header
          user={user}
          showSearch={showSearch}
          onOpenChat={() => {
            console.log('[Layout] onOpenChat dipanggil, isChatOpen -> true');
            setIsChatOpen(true);
          }}
        />

        {(title || subtitle) && (
          <section className="page-intro">
            {title && <div className="page-intro-title">{title}</div>}
            {subtitle && <div className="page-intro-subtitle">{subtitle}</div>}
          </section>
        )}

        {children}
      </main>

      <ChatbotPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}
