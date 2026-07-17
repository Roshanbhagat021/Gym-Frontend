import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './layouts/AdminLayout.jsx';
import { PublicLayout } from './layouts/PublicLayout.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { PageLoader } from './components/ui/PageLoader.jsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.jsx';

const HomePage = lazy(() => import('./pages/Home/HomePage.jsx'));
const LoginPage = lazy(() => import('./pages/Admin/LoginPage.jsx'));
const MemberLoginPage = lazy(() => import('./pages/Member/MemberLoginPage.jsx'));
const MemberDashboardPage = lazy(() => import('./pages/Member/MemberDashboardPage.jsx'));
const DashboardPage = lazy(() => import('./pages/Admin/DashboardPage.jsx'));
const MembersPage = lazy(() => import('./pages/Admin/MembersPage.jsx'));
const PlansPage = lazy(() => import('./pages/Admin/PlansPage.jsx'));
const PaymentsPage = lazy(() => import('./pages/Admin/PaymentsPage.jsx'));
const TrainersPage = lazy(() => import('./pages/Admin/TrainersPage.jsx'));
const UsersPage = lazy(() => import('./pages/Admin/UsersPage.jsx'));
const CmsPage = lazy(() => import('./pages/Admin/CmsPage.jsx'));
const CouponsPage = lazy(() => import('./pages/Admin/CouponsPage.jsx'));
const ReportsPage = lazy(() => import('./pages/Admin/ReportsPage.jsx'));
const SettingsPage = lazy(() => import('./pages/Admin/SettingsPage.jsx'));

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
              <Route element={<PublicLayout />}>
                <Route index element={<HomePage />} />
              </Route>
              <Route path="/admin/login" element={<LoginPage />} />
              <Route path="/member/login" element={<MemberLoginPage />} />
              <Route
                path="/member/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['MEMBER']}>
                    <MemberDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="members" element={<MembersPage />} />
                <Route path="plans" element={<PlansPage />} />
                <Route path="payments" element={<PaymentsPage />} />
                <Route path="trainers" element={<TrainersPage />} />
                <Route
                  path="users"
                  element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="cms" element={<CmsPage />} />
                <Route path="coupons" element={<CouponsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
