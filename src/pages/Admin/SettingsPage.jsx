import { Moon, Sun } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useSiteContent } from '../../context/SiteContentContext';

export default function SettingsPage() {
  const { user, theme, setTheme } = useAuth();
  const { gymName, loading } = useSiteContent();
  return (
    <div>
      <PageHeader title="Settings" eyebrow="Workspace">
        App-level preferences and profile details from the authenticated token.
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-black">Admin profile</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <Row label="Name" value={user?.name} />
            <Row label="Email" value={user?.email} />
            <Row label="Role" value={user?.role} />
          </dl>
        </Card>
        <Card>
          <h2 className="text-xl font-black">Appearance</h2>
          <p className="mt-2 text-sm text-steel">Theme is stored locally in this browser.</p>
          <div className="mt-5 flex gap-3">
            <Button variant={theme === 'light' ? 'accent' : 'subtle'} onClick={() => setTheme('light')}><Sun className="h-5 w-5" /> Light</Button>
            <Button variant={theme === 'dark' ? 'accent' : 'subtle'} onClick={() => setTheme('dark')}><Moon className="h-5 w-5" /> Dark</Button>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-black">Configuration</h2>
          <p className="mt-2 text-sm text-steel">
            Current gym name from the database CMS record: <strong>{loading ? 'Loading...' : gymName}</strong>.
          </p>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return <div className="flex justify-between gap-4 border-b border-slate-100 pb-3 dark:border-white/10"><dt className="font-semibold text-steel">{label}</dt><dd className="font-bold">{value || '-'}</dd></div>;
}
