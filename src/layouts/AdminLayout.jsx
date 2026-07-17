import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CreditCard,
  Dumbbell,
  FileText,
  LayoutDashboard,
  LogOut,
  Moon,
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
  const { user, logout, theme, setTheme } = useAuth();
  const { gymName } = useSiteContent();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-ink dark:bg-[#0f1115] dark:text-white">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200 bg-white/85 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-[#111317]/85 lg:block">
        <NavLink to="/" className="flex items-center gap-3 rounded-lg px-2 py-3">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-white dark:bg-white dark:text-ink">
            <Dumbbell className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-lg font-black">{gymName}</span>
            <span className="text-xs font-semibold text-steel">Control center</span>
          </span>
        </NavLink>
        <nav className="mt-6 space-y-1">
          {navItems
            .filter((item) => !item.superOnly || user?.role === 'SUPER_ADMIN')
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-ink text-white shadow-glow dark:bg-white dark:text-ink'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
        </nav>
      </aside>

      <div className="lg:pl-72">
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
