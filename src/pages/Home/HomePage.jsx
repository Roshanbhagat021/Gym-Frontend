import { motion } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Clock,
  Dumbbell,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE } from '../../config/site';
import { publicApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useSiteContent } from '../../context/SiteContentContext';

const fallbackImages = [
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80',
];

const features = [
  { icon: Zap, title: 'Performance coaching', text: 'Structured training blocks with expert-led progressions.' },
  { icon: ShieldCheck, title: 'Smart member care', text: 'Plans, payments, status, and history handled cleanly.' },
  { icon: Clock, title: 'Flexible schedules', text: 'Memberships can start today or queue after the current plan.' },
  { icon: Trophy, title: 'Premium experience', text: 'A polished environment designed for consistency and confidence.' },
];

export default function HomePage() {
  const { content, loading: contentLoading, gymName } = useSiteContent();
  const { data: plans = [], loading: plansLoading } = useAsync(() => publicApi.plans(true), []);
  const { data: trainers = [], loading: trainersLoading } = useAsync(() => publicApi.trainers(true), []);

  const heroImage = content?.heroBanners?.[0] || fallbackImages[0];
  const gallery = content?.galleryImages?.length ? content.galleryImages : fallbackImages;
  const contact = content?.contactInformation || {};

  return (
    <main className="overflow-hidden bg-white text-ink dark:bg-[#0f1115] dark:text-white">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/35 px-4 py-3 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <a href="#hero" className="flex items-center gap-3 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-white text-ink">
              <Dumbbell className="h-5 w-5" />
            </span>
            <span className="font-black">{gymName}</span>
          </a>
          <div className="hidden items-center gap-6 text-sm font-semibold text-white/80 md:flex">
            {['About', 'Plans', 'Trainers', 'Gallery', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-white">
                {item}
              </a>
            ))}
          </div>
          <Link to="/admin/login">
            <Button variant="subtle" className="bg-white/15 text-white ring-white/20 hover:bg-white/25">
              Admin
            </Button>
          </Link>
          <Link to="/member/login" className="hidden sm:block">
            <Button variant="accent">
              Member
            </Button>
          </Link>
        </nav>
      </header>

      <section id="hero" className="relative min-h-[92vh] overflow-hidden">
        <img src={heroImage} alt={`${gymName} training space`} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/45 to-ember/35" />
        <div className="relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 md:pb-20">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl text-white">
            <p className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur">
              <Sparkles className="h-4 w-4 text-gold" />
              Premium training club
            </p>
            <h1 className="mt-6 text-5xl font-black leading-[0.96] text-balance md:text-7xl">
              {gymName}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/78 md:text-xl">
              {content?.aboutSection || SITE.tagline}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#plans">
                <Button variant="accent" className="w-full sm:w-auto">
                  Explore plans <ArrowRight className="h-5 w-5" />
                </Button>
              </a>
              <a href="#contact">
                <Button variant="subtle" className="w-full bg-white/15 text-white ring-white/20 hover:bg-white/25 sm:w-auto">
                  Book a visit
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="about" className="premium-bg px-4 py-20">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-ember">About</p>
            <h2 className="mt-3 text-4xl font-black text-balance md:text-5xl">
              Built for people who want training to feel serious and energizing.
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature) => (
              <motion.article
                key={feature.title}
                whileHover={{ y: -6 }}
                className="rounded-lg border border-white/60 bg-white/75 p-5 shadow-panel backdrop-blur dark:border-white/10 dark:bg-white/10"
              >
                <feature.icon className="h-6 w-6 text-ember" />
                <h3 className="mt-4 font-black">{feature.title}</h3>
                <p className="mt-2 text-sm text-steel">{feature.text}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="plans" className="px-4 py-20">
        <SectionTitle eyebrow="Membership Plans" title="Simple plans. Strong reasons to show up." />
        <div className="mx-auto mt-10 grid max-w-7xl gap-5 md:grid-cols-3">
          {plansLoading
            ? [1, 2, 3].map((key) => <Skeleton key={key} className="h-72" />)
            : (plans.length ? plans : [{ name: 'Starter', duration: 30, price: 999, description: 'Add plans in admin to replace this preview.' }]).map((plan) => (
                <motion.article key={plan.id || plan.name} whileHover={{ y: -8 }} className="rounded-lg border border-slate-200 bg-white p-6 shadow-panel dark:border-white/10 dark:bg-white/[0.06]">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-ember">{plan.duration} days</p>
                  <h3 className="mt-3 text-2xl font-black">{plan.name}</h3>
                  <p className="mt-3 min-h-12 text-sm text-steel">{plan.description || 'Access to training floor, coaching support, and club facilities.'}</p>
                  <p className="mt-6 text-4xl font-black">₹{Number(plan.price).toLocaleString('en-IN')}</p>
                  <ul className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-200">
                    {['Progress tracking', 'Trainer guidance', 'Clean member support'].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-mint" /> {item}
                      </li>
                    ))}
                  </ul>
                </motion.article>
              ))}
        </div>
      </section>

      <section id="trainers" className="bg-ink px-4 py-20 text-white dark:bg-black">
        <SectionTitle eyebrow="Trainers" title="Coaches with presence, precision, and personality." light />
        <div className="mx-auto mt-10 grid max-w-7xl gap-5 md:grid-cols-3">
          {trainersLoading
            ? [1, 2, 3].map((key) => <Skeleton key={key} className="h-80 bg-white/10" />)
            : (trainers.length ? trainers : []).map((trainer) => (
                <article key={trainer.id} className="overflow-hidden rounded-lg bg-white/10">
                  <img
                    src={trainer.image || fallbackImages[2]}
                    alt={trainer.name}
                    className="h-64 w-full object-cover"
                  />
                  <div className="p-5">
                    <h3 className="text-xl font-black">{trainer.name}</h3>
                    <p className="mt-1 text-sm text-ember">{trainer.specialization} · {trainer.experience} yrs</p>
                    <p className="mt-3 text-sm text-white/70">{trainer.bio || 'Focused coaching for better movement and stronger habits.'}</p>
                  </div>
                </article>
              ))}
          {!trainersLoading && !trainers.length ? (
            <p className="col-span-full rounded-lg border border-white/10 p-8 text-center text-white/70">
              Add trainers in the admin dashboard to show them here.
            </p>
          ) : null}
        </div>
      </section>

      <section id="gallery" className="px-4 py-20">
        <SectionTitle eyebrow="Gallery" title="A training floor that looks as good as it works." />
        <div className="mx-auto mt-10 grid max-w-7xl gap-4 md:grid-cols-4">
          {gallery.slice(0, 8).map((image, index) => (
            <img
              key={image}
              src={image}
              alt={`${gymName} gallery ${index + 1}`}
              className={`h-64 w-full rounded-lg object-cover shadow-panel ${index === 0 || index === 3 ? 'md:col-span-2' : ''}`}
            />
          ))}
        </div>
      </section>

      <section className="premium-bg px-4 py-20">
        <div className="mx-auto max-w-7xl rounded-lg bg-ink p-8 text-white shadow-glow md:p-12">
          <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-gold">Testimonials</p>
              <h2 className="mt-3 text-4xl font-black text-balance">Members stay because the experience is clean, focused, and personal.</h2>
            </div>
            <div className="rounded-lg bg-white/10 p-6">
              <p className="text-lg font-semibold">“The best part is how organized everything feels, from joining to renewals. Training feels premium without feeling complicated.”</p>
              <p className="mt-4 text-sm text-white/60">Aarav M. · Member</p>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="px-4 py-20">
        <SectionTitle eyebrow="Contact" title="Ready when you are." />
        <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
          <ContactCard icon={Phone} label="Phone" value={contact.phone || '+91 98765 43210'} />
          <ContactCard icon={Mail} label="Email" value={contact.email || 'contact@gym.com'} />
          <ContactCard icon={MapPin} label="Address" value={contact.address || 'Your city training district'} />
        </div>
      </section>

      <footer className="border-t border-slate-200 px-4 py-8 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-steel md:flex-row md:items-center md:justify-between">
          <p className="font-semibold">{gymName}</p>
          <p>{contentLoading ? 'Syncing website content...' : 'Train with intent. Manage with clarity.'}</p>
        </div>
      </footer>
    </main>
  );
}

function SectionTitle({ eyebrow, title, light = false }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-ember">{eyebrow}</p>
      <h2 className={`mt-3 text-4xl font-black text-balance md:text-5xl ${light ? 'text-white' : ''}`}>{title}</h2>
    </div>
  );
}

function ContactCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-panel dark:border-white/10 dark:bg-white/[0.06]">
      <Icon className="h-6 w-6 text-ember" />
      <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-steel">{label}</p>
      <p className="mt-2 font-black">{value}</p>
    </div>
  );
}
