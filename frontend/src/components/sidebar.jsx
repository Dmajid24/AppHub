import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Grid3x3,
  Network,
  Users,
  FileText,
  Database,
  ShieldCheck,
  KeyRound,
  Inbox,
  MessageSquare,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import '../style/Sidebar_Style.css';
import { Users2 } from 'lucide-react';
import { UserCheck } from 'lucide-react';

const navItems = [
  { label: 'Executive Summary', path: '/dashboard', icon: LayoutDashboard },
  { label: 'App Portofolio', path: '/applications', icon: Grid3x3 },
  { label: 'Infrastructure Visibility', path: '/infrastructure', icon: Network },
  { label: 'TSA Information Management', path: '/tsa-information', icon: FileText },
  { label: 'OSS Data Integration', path: '/oss-data', icon: Database },
  { label: 'Security Assessment', path: '/security-assessment', icon: ShieldCheck },
  { label: 'Log User', path: '/log-user', icon: UserCheck },
  { label: 'User Access', path: '/user-access', icon: KeyRound, hasDivider: true },
  {
    label: 'Request',
    icon: Inbox,
    children: [
      { label: 'Application Registration', path: '/request/app-registration' },
      { label: 'Use Case Request', path: '/request/use-case' },
    ],
  },
  {
    label: 'Feedback',
    icon: MessageSquare,
    children: [
      { label: 'Result', path: '/feedback/result' },
      { label: 'Bot Registration', path: '/feedback/bot-registration' },
    ],
  },
];

export default function Sidebar({ isCollapsed = false, onToggle }) {
  const { pathname } = useLocation();

  const [openGroups, setOpenGroups] = useState(() => {
    const initial = {};
    navItems.forEach((item) => {
      if (item.children) {
        initial[item.label] = item.children.some((child) => child.path === pathname);
      }
    });
    return initial;
  });

  const toggleGroup = (label) => {
    if (isCollapsed && onToggle) {
      onToggle(); // Open sidebar if clicked when collapsed
      return;
    }
    setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="brand">
        <div className="brand-left">
          <div className="brand-mark">A</div>
          {!isCollapsed && (
            <div className="brand-details">
              <div className="brand-text">APPHUB</div>
              <div className="brand-sub">Application Hub</div>
            </div>
          )}
        </div>
        {onToggle && (
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={onToggle}
            title={isCollapsed ? 'Perluas Sidebar' : 'Kecilkan Sidebar'}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        )}
      </div>

      {!isCollapsed && <div className="nav-group-label">Menu</div>}

      <nav className="nav-list">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.children) {
            const isOpen = openGroups[item.label];
            const isChildActive = item.children.some((child) => child.path === pathname);
            return (
              <div key={item.label} className="nav-block">
                <button
                  type="button"
                  className={`nav-item nav-parent ${isChildActive ? 'parent-active' : ''}`}
                  onClick={() => toggleGroup(item.label)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={18} />
                  {!isCollapsed && <span>{item.label}</span>}
                  {!isCollapsed && (
                    <ChevronDown
                      size={14}
                      className={`chevron ${isOpen ? 'chevron-open' : ''}`}
                    />
                  )}
                </button>

                {!isCollapsed && isOpen && (
                  <div className="nav-children">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          `nav-child ${isActive ? 'nav-child-active' : ''}`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={item.path} style={{ display: 'contents' }}>
              {item.hasDivider && <div className="nav-divider" />}
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={18} />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
