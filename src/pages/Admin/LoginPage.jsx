import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useSiteContent } from '../../context/SiteContentContext';
import { Button } from '../../components/ui/Button';
import { Field, Input } from '../../components/ui/Input';

export default function LoginPage() {
  const { login, logout, user, isAuthenticated } = useAuth();
  const { gymName } = useSiteContent();
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState } = useForm({
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (isAuthenticated && ['SUPER_ADMIN', 'ADMIN'].includes(user?.role)) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, navigate, user?.role]);

  const onSubmit = async (values) => {
    setLoginError('');
    try {
      const user = await login(values);
      if (!['SUPER_ADMIN', 'ADMIN'].includes(user?.role)) {
        await logout();
        setLoginError('This account does not have admin access.');
        toast.error('This account does not have admin access.');
        return;
      }

      navigate(location.state?.from?.pathname || '/admin', { replace: true });
    } catch (error) {
      setLoginError(error.message || 'Unable to sign in. Please check your credentials.');
    }
  };

  return (
    <main className="grid min-h-screen place-items-center premium-bg p-4">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-panel dark:bg-[#14161b] md:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="relative hidden min-h-[620px] bg-ink p-10 text-white md:block">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80"
            alt="Gym training floor"
            className="absolute inset-0 h-full w-full object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/35 to-ember/40" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-white text-ink">
                <Dumbbell className="h-6 w-6" />
              </span>
              <span className="text-2xl font-black">{gymName}</span>
            </div>
            <div>
              <p className="max-w-md text-5xl font-black leading-tight text-balance">
                Manage every rep, member, plan, and payment.
              </p>
              <p className="mt-5 max-w-sm text-sm text-white/75">
                Built around the Nest backend authentication and role model.
              </p>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-10">
          <div className="mb-8 md:hidden">
            <div className="flex items-center gap-3">
              <Dumbbell className="h-7 w-7 text-ember" />
              <span className="text-xl font-black">{gymName}</span>
            </div>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-ember">Secure Login</p>
          <h1 className="mt-2 text-3xl font-black md:text-4xl">Welcome back</h1>
          <p className="mt-3 text-sm text-steel">Use an admin or super admin account from your backend.</p>
          {loginError ? (
            <div
              className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200"
              role="alert"
            >
              {loginError}
            </div>
          ) : null}
          <div className="mt-8 space-y-4">
            <Field label="Email" error={formState.errors.email?.message}>
              <Input
                type="email"
                autoComplete="email"
                {...register('email', { required: 'Email is required' })}
              />
            </Field>
            <Field label="Password" error={formState.errors.password?.message}>
              <Input
                type="password"
                autoComplete="current-password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters' },
                })}
              />
            </Field>
          </div>
          <Button type="submit" variant="accent" className="mt-7 w-full" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </motion.section>
    </main>
  );
}
