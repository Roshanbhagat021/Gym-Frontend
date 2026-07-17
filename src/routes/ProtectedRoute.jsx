import { Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';

export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) {
    const requiredAccess = allowedRoles.includes('MEMBER') ? 'Member access required' : 'Admin access required';
    const roleText = allowedRoles.join(' or ');

    return (
      <main className="grid min-h-screen place-items-center premium-bg p-4">
        <section className="max-w-md rounded-lg bg-white p-8 text-center shadow-panel dark:bg-[#181a20]">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-lg bg-red-100 text-red-600 dark:bg-red-500/15">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-2xl font-black">{requiredAccess}</h1>
          <p className="mt-3 text-sm text-steel">
            You are logged in as <strong>{user?.role || 'UNKNOWN'}</strong>. This page allows only {roleText} accounts.
          </p>
          <Button className="mt-6" variant="accent" onClick={logout}>
            Logout and use another account
          </Button>
        </section>
      </main>
    );
  }

  return children;
}
