import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useSiteContent } from '../../context/SiteContentContext';
import { Button } from '../../components/ui/Button';
import { Field, Input } from '../../components/ui/Input';
import { BrandMark } from '../../components/common/BrandMark';

export default function MemberLoginPage() {
  const { login, logout, user, isAuthenticated } = useAuth();
  const { gymName, logo } = useSiteContent();
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();
  const { register, handleSubmit, formState } = useForm({
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (isAuthenticated && user?.role === 'MEMBER') {
      navigate('/member/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, user?.role]);

  const onSubmit = async (values) => {
    setLoginError('');
    try {
      const loggedInUser = await login(values);
      if (loggedInUser?.role !== 'MEMBER') {
        await logout();
        setLoginError('This login is only for members.');
        toast.error('This login is only for members.');
        return;
      }
      navigate('/member/dashboard', { replace: true });
    } catch (error) {
      setLoginError(error.message || 'Unable to sign in. Please check your credentials.');
    }
  };

  return (
    <main className="grid min-h-screen place-items-center premium-bg p-4">
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-panel dark:bg-[#14161b] md:p-8"
      >
        <Link to="/" className="flex items-center gap-3">
          <BrandMark logo={logo} className="h-11 w-11" />
          <span className="text-xl font-black">{gymName}</span>
        </Link>

        <div className="mt-8">
          <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-ember">
            <UserRound className="h-4 w-4" />
            Member Login
          </p>
          <h1 className="mt-2 text-3xl font-black">Your fitness profile</h1>
          <p className="mt-3 text-sm text-steel">View your membership, plan dates, and payment history.</p>
        </div>

        {loginError ? (
          <div
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200"
            role="alert"
          >
            {loginError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
          <Field label="Email" error={formState.errors.email?.message}>
            <Input type="email" autoComplete="email" {...register('email', { required: 'Email is required' })} />
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
          <Button type="submit" variant="accent" className="w-full" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </motion.section>
    </main>
  );
}
