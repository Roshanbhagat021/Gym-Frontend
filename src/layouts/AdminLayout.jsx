import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CreditCard,
  Dumbbell,
  FileText,
  LayoutDashboard,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Percent,
  Settings,
  Sun,
  Users,
  UserCog,
  WandSparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSiteContent } from '../context/SiteContentContext';
import { Button } from '../components/ui/Button';
import { BrandMark } from '../components/common/BrandMark';

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/members', label: 'Members', icon: Users },
  { to: '/admin/plans', label: 'Plans', icon: Dumbbell },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/trainers', label: 'Trainers', icon: UserCog },
  { to: '/admin/coupons', label: 'Coupons', icon: Percent },
  { to: '/admin/cms', label: 'Website', icon: WandSparkles },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/users', label: 'Users', icon: FileText, superOnly: true },
];

export function AdminLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const { user, logout, theme, setTheme } = useAuth();
  const { gymName, logo } = useSiteContent();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-ink dark:bg-[#0f1115] dark:text-white">
      <aside className={`fixed inset-y-0 left-0 z-30 hidden overflow-visible border-r border-slate-200 bg-white/90 p-3 backdrop-blur-xl transition-[width] duration-300 ease-in-out dark:border-white/10 dark:bg-[#111317]/90 lg:block ${sidebarExpanded ? 'w-52' : 'w-16'}`}>
        <button
          type="button"
          onClick={() => setSidebarExpanded((current) => !current)}
          className="absolute -right-3 bottom-5 z-10 grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:text-ember dark:border-white/10 dark:bg-[#202228] dark:text-slate-300"
          aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          aria-expanded={sidebarExpanded}
        >
          {sidebarExpanded ? <PanelLeftClose className="h-3.5 w-3.5" /> : <PanelLeftOpen className="h-3.5 w-3.5" />}
        </button>
        <NavLink to="/" className={`flex h-14 items-center rounded-lg px-1 transition-all duration-300 ease-in-out ${sidebarExpanded ? 'gap-3' : 'gap-0'}`} title={!sidebarExpanded ? gymName : undefined}>
          <BrandMark logo={logo} />
          <span className={`min-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${sidebarExpanded ? 'max-w-48 translate-x-0 opacity-100' : 'max-w-0 -translate-x-2 opacity-0'}`}>
            <span className="block text-lg font-black">{gymName}</span>
            <span className="text-xs font-semibold text-steel">Control center</span>
          </span>
        </NavLink>
        <nav className="mt-5 space-y-0.5">
          {navItems
            .filter((item) => !item.superOnly || user?.role === 'SUPER_ADMIN')
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `group relative flex h-9 items-center rounded-md px-3 text-xs font-semibold transition-all duration-300 ease-in-out ${sidebarExpanded ? 'gap-2.5' : 'gap-0'} ${
                    isActive
                      ? 'bg-ink text-white shadow-glow dark:bg-white dark:text-ink'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
                  }`
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${sidebarExpanded ? 'max-w-44 translate-x-0 opacity-100' : 'max-w-0 -translate-x-2 opacity-0'}`}>{item.label}</span>
                {!sidebarExpanded && <span className="pointer-events-none absolute left-[calc(100%+12px)] z-50 hidden whitespace-nowrap rounded-md bg-ink px-2.5 py-1.5 text-xs font-bold text-white shadow-lg group-hover:block dark:bg-white dark:text-ink">{item.label}</span>}
              </NavLink>
            ))}
        </nav>
      </aside>

      <div className={`transition-[padding] duration-300 ease-in-out ${sidebarExpanded ? 'lg:pl-52' : 'lg:pl-16'}`}>
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#111317]/80 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Admin Dashboard</p>
              <p className="text-sm font-semibold text-steel">{user?.name} · {user?.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="subtle"
                className="!min-h-8 h-8 w-8 px-0"
                aria-label="Toggle theme"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {navItems
              .filter((item) => !item.superOnly || user?.role === 'SUPER_ADMIN')
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `inline-flex min-w-max items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold ${
                      isActive ? 'bg-ink text-white dark:bg-white dark:text-ink' : 'bg-slate-100 dark:bg-white/10'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}
          </nav>
        </header>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
