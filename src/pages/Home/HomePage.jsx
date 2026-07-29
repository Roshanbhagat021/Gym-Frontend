import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CalendarCheck,
  Check,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Moon,
  Phone,
  Quote,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Trophy,
  Zap,
  Dumbbell,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SITE } from '../../config/site';
import { publicApi } from '../../services/api';
import { useAsync } from '../../hooks/useAsync';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { useSiteContent } from '../../context/SiteContentContext';
import { BrandMark } from '../../components/common/BrandMark';
import { useAuth } from '../../context/AuthContext';

const fallbackImages = [
  {
    src: '/images/gym/hero-1600.webp',
    srcSet: '/images/gym/hero-960.webp 960w, /images/gym/hero-1600.webp 1600w',
  },
  {
    src: '/images/gym/training-floor-1200.webp',
    srcSet: '/images/gym/training-floor-640.webp 640w, /images/gym/training-floor-1200.webp 1200w',
  },
  {
    src: '/images/gym/strength-training-1200.webp',
    srcSet: '/images/gym/strength-training-640.webp 640w, /images/gym/strength-training-1200.webp 1200w',
  },
  {
    src: '/images/gym/fitness-equipment-1200.webp',
    srcSet: '/images/gym/fitness-equipment-640.webp 640w, /images/gym/fitness-equipment-1200.webp 1200w',
  },
];

const LOCATION = {
  address: 'Sg Mall, Shop No. 34–35, First Floor, Bhaikakanagar, Thaltej, Ahmedabad, Gujarat 380059',
  hours: '5:00 AM – 11:00 PM',
  phone: '+91 98980 61078',
  phoneHref: 'tel:+919898061078',
  mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3671.280404783397!2d72.51189301129993!3d23.0501792790675!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e9b19f1388491%3A0x825d6b422af27c73!2sRONS%20FITNESS%20CLUB!5e0!3m2!1sen!2sin!4v1768745191050!5m2!1sen!2sin',
};

const features = [
  { icon: Zap, title: 'Performance coaching', text: 'Structured training blocks with expert-led progressions.' },
  { icon: ShieldCheck, title: 'Smart member care', text: 'Plans, payments, status, and history handled cleanly.' },
  { icon: Clock, title: 'Flexible schedules', text: 'Memberships can start today or queue after the current plan.' },
  { icon: Trophy, title: 'Premium experience', text: 'A polished environment designed for consistency and confidence.' },
];

const testimonials = [
  {
    name: 'Aarav Mehta',
    initials: 'AM',
    detail: 'Strength training member',
    quote: 'The coaches made training feel simple and structured. I am stronger, more consistent, and actually look forward to every session.',
    featured: true,
  },
  {
    name: 'Priya Shah',
    initials: 'PS',
    detail: 'Transformation member',
    quote: 'The atmosphere is motivating without being intimidating. I received the right guidance from day one and could see steady progress.',
  },
  {
    name: 'Rohan Patel',
    initials: 'RP',
    detail: 'Fitness member',
    quote: 'Clean equipment, attentive trainers, and a team that remembers your goals. It feels like a gym that genuinely wants you to improve.',
  },
  {
    name: 'Neha Desai',
    initials: 'ND',
    detail: 'Morning batch member',
    quote: 'The flexible timings make consistency possible for me. Even the busiest mornings feel productive once I have trained here.',
  },
  {
    name: 'Kunal Mehta',
    initials: 'KM',
    detail: 'Performance training member',
    quote: 'Every session has purpose. The trainers correct the small details, track progress, and keep the energy high without compromising technique.',
  },
];

const faqs = [
  { question: 'Can I visit the gym before choosing a plan?', answer: 'Yes. Contact the gym to schedule a visit, explore the training floor, and discuss the plan that best matches your goals.' },
  { question: 'Do membership plans include trainer support?', answer: 'Available plans include general trainer guidance. Dedicated personal coaching may depend on the trainer, schedule, and package you select.' },
  { question: 'When does my membership become active?', answer: 'A new membership can begin from its selected start date. If you already have an active plan, the next plan can be scheduled after it ends.' },
  { question: 'How can I renew my membership?', answer: 'Speak with the gym team or sign in to your member account to review your membership. An administrator can renew your plan and record the payment.' },
  { question: 'Can I view payments and membership dates online?', answer: 'Yes. Members can sign in to see their active plan, membership history, important dates, and payment records.' },
  { question: 'Which payment methods are accepted?', answer: 'The gym supports cash and online payments. Contact the team if you need confirmation about a specific payment option.' },
];

export default function HomePage() {
  const { content, loading: contentLoading, gymName, logo } = useSiteContent();
  const { theme, setTheme } = useAuth();
  const { data: plans = [], loading: plansLoading } = useAsync(() => publicApi.plans(true), []);
  const { data: trainers = [], loading: trainersLoading } = useAsync(() => publicApi.trainers(true), []);

  const heroImage = content?.heroBanners?.[0] || fallbackImages[0];
  const gallery = content?.galleryImages?.length ? content.galleryImages : fallbackImages;
  const contact = content?.contactInformation || {};

  useEffect(() => {
    const description = `${gymName} is a premium fitness club in Ahmedabad offering expert coaching, flexible memberships, and a fully equipped training floor.`;
    const pageUrl = window.location.origin;
    const heroUrl = typeof heroImage === 'string' ? heroImage : `${pageUrl}${heroImage.src}`;
    const metadata = {
      description,
      'og:title': `${gymName} · Premium Fitness Club in Ahmedabad`,
      'og:description': description,
      'og:image': heroUrl,
      'og:url': pageUrl,
      'twitter:title': `${gymName} · Premium Fitness Club in Ahmedabad`,
      'twitter:description': description,
      'twitter:image': heroUrl,
    };

    Object.entries(metadata).forEach(([name, value]) => {
      const attribute = name.startsWith('og:') ? 'property' : 'name';
      let meta = document.head.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', value);
    });

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = pageUrl;

    let structuredData = document.getElementById('local-business-schema');
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.id = 'local-business-schema';
      structuredData.type = 'application/ld+json';
      document.head.appendChild(structuredData);
    }
    structuredData.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'HealthClub',
      name: gymName,
      description,
      image: heroUrl,
      url: pageUrl,
      telephone: contact.phone || LOCATION.phone,
      email: contact.email || undefined,
      address: {
        '@type': 'PostalAddress',
        streetAddress: contact.address || LOCATION.address,
        addressLocality: 'Ahmedabad',
        addressRegion: 'Gujarat',
        postalCode: '380059',
        addressCountry: 'IN',
      },
      openingHours: contact.hours || LOCATION.hours,
    });
  }, [contact.address, contact.email, contact.hours, contact.phone, gymName, heroImage]);

  return (
    <main className="overflow-hidden bg-white text-ink dark:bg-[#0f1115] dark:text-white">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-black/35 px-4 py-3 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <a href="#hero" className="flex min-w-0 items-center gap-3 text-white">
            <BrandMark logo={logo} />
            <span className="truncate font-black">{gymName}</span>
          </a>
          <div className="hidden items-center gap-5 text-sm font-semibold text-white/80 lg:flex">
            {['About', 'Plans', 'Trainers', 'Gallery', 'FAQ', 'Contact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-white">
                {item}
              </a>
            ))}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-pressed={theme === 'dark'}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 bg-white/10 text-white shadow-lg shadow-black/10 backdrop-blur transition hover:-translate-y-0.5 hover:border-ember/60 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-ember focus:ring-offset-2 focus:ring-offset-black/60"
            >
              {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
            <Link
              to="/admin/login"
              aria-label="Open admin panel"
              title="Admin panel"
              className="group relative grid h-10 w-10 place-items-center overflow-hidden rounded-lg border border-white/15 bg-white/10 text-white shadow-lg shadow-black/10 backdrop-blur transition hover:-translate-y-0.5 hover:border-ember/60 hover:bg-ember sm:h-auto sm:w-auto sm:border-0 sm:bg-transparent sm:shadow-none"
            >
              <span className="absolute inset-0 translate-y-full bg-gradient-to-t from-ember to-orange-400 transition-transform duration-300 group-hover:translate-y-0 sm:hidden" />
              <ShieldCheck className="relative h-[18px] w-[18px] sm:hidden" />
              <span className="hidden items-center justify-center rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/25 sm:inline-flex">
                Admin
              </span>
              <span className="pointer-events-none absolute -bottom-1 right-0 h-2 w-2 rounded-full border-2 border-[#1b1b1b] bg-mint sm:hidden" />
            </Link>
            <Link to="/member/login">
              <Button variant="accent">
                Member
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <section id="hero" className="relative min-h-[92vh] overflow-hidden">
        <img
          src={typeof heroImage === 'string' ? heroImage : heroImage.src}
          srcSet={typeof heroImage === 'string' ? undefined : heroImage.srcSet}
          sizes="100vw"
          alt={`${gymName} training space`}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
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

      <section id="about" className="premium-bg scroll-mt-16 px-4 py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-ember">About</p>
            <h2 className="mt-3 text-3xl font-black text-balance sm:text-4xl md:text-5xl">
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

      <section id="plans" className="relative scroll-mt-16 overflow-hidden px-4 py-16 md:py-24">
        <div aria-hidden="true" className="absolute -left-40 top-1/3 h-80 w-80 rounded-full bg-ember/10 blur-3xl" />
        <div className="relative">
          <SectionTitle eyebrow="Membership Plans" title="Choose the plan that fits your momentum." />
          <p className="mx-auto mt-5 max-w-2xl text-center text-sm leading-7 text-steel sm:text-base">Straightforward memberships with the coaching, flexibility, and support you need to stay consistent.</p>
        </div>
        <div className="relative mx-auto mt-12 grid max-w-7xl items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plansLoading
            ? [1, 2, 3].map((key) => <Skeleton key={key} className="h-[470px] rounded-lg" />)
            : (plans.length ? plans : [{ name: 'Starter', duration: 30, price: 999, description: 'Add plans in admin to replace this preview.' }]).map((plan) => (
                <PlanCard key={plan.id || plan.name} plan={plan} />
              ))}
        </div>
      </section>

      <section id="trainers" className="scroll-mt-16 bg-slate-50 px-4 py-16 dark:bg-white/[0.02] md:py-24">
        <SectionTitle eyebrow="Expert guidance" title="Meet the coaches behind your progress." />
        <p className="mx-auto mt-5 max-w-2xl text-center text-sm leading-7 text-steel sm:text-base">Personal attention, practical guidance, and training that moves at the right pace for you.</p>
        <div className="mx-auto mt-10 grid max-w-6xl gap-7">
          {trainersLoading
            ? [1, 2].map((key) => <Skeleton key={key} className="h-[520px] rounded-lg lg:h-[480px]" />)
            : (trainers.length ? trainers : []).map((trainer) => (
                <TrainerCard key={trainer.id} trainer={trainer} gymName={gymName} ownerPhone={contact.phone || LOCATION.phone} />
              ))}
          {!trainersLoading && !trainers.length ? (
            <p className="rounded-lg border border-slate-200 bg-white p-10 text-center text-steel shadow-panel dark:border-white/10 dark:bg-white/[0.06]">
              Add trainers in the admin dashboard to show them here.
            </p>
          ) : null}
        </div>
      </section>

      <section id="gallery" className="scroll-mt-16 px-4 py-16 md:py-24">
        <SectionTitle eyebrow="Gallery" title="A training floor that looks as good as it works." />
        <div className="mx-auto mt-10 grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {gallery.slice(0, 8).map((image, index) => (
            <img
              key={typeof image === 'string' ? image : image.src}
              src={typeof image === 'string' ? image : image.src}
              srcSet={typeof image === 'string' ? undefined : image.srcSet}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              alt={`${gymName} gallery ${index + 1}`}
              loading="lazy"
              decoding="async"
              className={`h-56 w-full rounded-lg object-cover shadow-panel sm:h-64 ${index === 0 || index === 3 ? 'sm:col-span-2' : ''}`}
            />
          ))}
        </div>
      </section>

      <section className="premium-bg px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-5 md:grid-cols-[1.2fr_0.8fr] md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-ember">Member stories</p>
              <h2 className="mt-3 max-w-3xl text-3xl font-black text-balance sm:text-4xl md:text-5xl">Real people. Real progress. A community that keeps showing up.</h2>
            </div>
            <p className="max-w-lg text-sm leading-7 text-steel md:justify-self-end">More than workouts, members find expert support, genuine accountability, and a space where progress feels personal.</p>
          </div>

          <div className="mt-10 grid auto-rows-fr gap-5 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={testimonial.name} testimonial={testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-16 px-4 py-16 md:py-24">
        <SectionTitle eyebrow="Frequently Asked Questions" title="Everything you need to start with confidence." />
        <div className="mx-auto mt-10 grid max-w-4xl gap-3">
          {faqs.map((faq) => (
            <details key={faq.question} className="group rounded-lg border border-slate-200 bg-white shadow-sm transition open:border-ember/40 open:shadow-panel dark:border-white/10 dark:bg-white/[0.06]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-left font-bold marker:content-none sm:px-6">
                <span>{faq.question}</span><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-steel transition group-open:rotate-180 group-open:bg-ember group-open:text-white dark:bg-white/10"><ChevronDown className="h-4 w-4" /></span>
              </summary>
              <div className="px-5 pb-5 sm:px-6 sm:pb-6"><p className="max-w-3xl text-sm leading-7 text-steel">{faq.answer}</p></div>
            </details>
          ))}
        </div>
      </section>

      <section id="contact" className="relative scroll-mt-16 overflow-hidden bg-ink px-4 py-16 text-white dark:bg-black md:py-24">
        <div aria-hidden="true" className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-ember/15 blur-3xl" />
        <div aria-hidden="true" className="absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-mint/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-ember">Contact us</p>
            <h2 className="mt-3 text-3xl font-black text-balance sm:text-4xl md:text-5xl">Let’s talk about your fitness goals.</h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/60">Have a question about memberships, trainers, or your first visit? Send us a message and continue the conversation directly on WhatsApp.</p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ContactCard icon={Phone} label="Phone" value={contact.phone || LOCATION.phone} href={contact.phone ? `tel:${contact.phone.replace(/[^+\d]/g, '')}` : LOCATION.phoneHref} />
          <ContactCard icon={Mail} label="Email" value={contact.email || 'contact@gym.com'} href={`mailto:${contact.email || 'contact@gym.com'}`} />
          <ContactCard icon={MapPin} label="Address" value={contact.address || LOCATION.address} />
          <ContactCard icon={Clock} label="Timings" value={contact.hours || LOCATION.hours} />
          </div>

          <div className="mt-6 grid overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur lg:grid-cols-[minmax(0,1.3fr)_minmax(380px,0.7fr)]">
            <ContactForm gymName={gymName} ownerPhone={contact.phone || LOCATION.phone} />
            <div className="relative order-1 min-h-[430px] border-b border-white/10 sm:min-h-[500px] lg:min-h-[680px] lg:border-b-0 lg:border-r">
              <iframe
                className="absolute inset-0 h-full w-full border-0 grayscale-[20%] contrast-[1.05]"
                src={LOCATION.mapUrl}
                title={`${gymName} location on Google Maps`}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-lg border border-white/20 bg-black/75 p-4 backdrop-blur-md sm:inset-x-6 sm:bottom-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-ember">Find us</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-white">{contact.address || LOCATION.address}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative overflow-hidden bg-[#090b0f] px-4 pb-8 pt-16 text-white md:pt-20">
        <div aria-hidden="true" className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-ember/15 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-40 left-1/4 h-80 w-80 rounded-full bg-mint/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-14 flex flex-col gap-6 rounded-lg border border-white/10 bg-white/[0.06] p-6 backdrop-blur sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-ember">Your strongest chapter starts here</p>
              <h2 className="mt-3 text-2xl font-black text-balance sm:text-3xl">Ready to make your goals non-negotiable?</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="#plans"><Button variant="accent" className="w-full sm:w-auto">View plans <ArrowRight className="h-5 w-5" /></Button></a>
              <a href="#contact"><Button variant="subtle" className="w-full bg-white/10 text-white ring-white/15 hover:bg-white/20 sm:w-auto">Book a visit</Button></a>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.75fr_0.75fr_1.15fr]">
            <div className="sm:col-span-2 lg:col-span-1">
              <a href="#hero" className="inline-flex items-center gap-3" aria-label={`${gymName} home`}>
                <BrandMark logo={logo} />
                <span className="text-lg font-black">{gymName}</span>
              </a>
              <p className="mt-5 max-w-sm text-sm leading-7 text-white/55">A premium training space built for better movement, stronger habits, and progress you can feel.</p>
              <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/65">
                <Dumbbell className="h-4 w-4 text-ember" /> Train with intent
              </div>
            </div>

            <FooterLinks title="Explore" links={[['About', '#about'], ['Plans', '#plans'], ['Trainers', '#trainers'], ['Gallery', '#gallery']]} />
            <FooterLinks title="Support" links={[['FAQs', '#faq'], ['Contact', '#contact'], ['Member login', '/member/login'], ['Admin login', '/admin/login']]} internal />

            <div>
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">Visit us</h3>
              <ul className="mt-5 space-y-4 text-sm text-white/55">
                <li className="flex gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ember" /><span className="leading-6">{contact.address || LOCATION.address}</span></li>
                <li><a href={contact.phone ? `tel:${contact.phone.replace(/[^+\d]/g, '')}` : LOCATION.phoneHref} className="flex items-center gap-3 transition hover:text-white"><Phone className="h-4 w-4 shrink-0 text-ember" />{contact.phone || LOCATION.phone}</a></li>
                <li className="flex items-center gap-3"><Clock className="h-4 w-4 shrink-0 text-ember" />{contact.hours || LOCATION.hours}</li>
              </ul>
            </div>
          </div>

          <div className="mt-14 flex flex-col gap-3 border-t border-white/10 pt-7 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} {gymName}. All rights reserved.</p>
            <p>{contentLoading ? 'Syncing website content...' : 'Stronger every day. Together.'}</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FooterLinks({ title, links, internal = false }) {
  return (
    <div>
      <h3 className="text-sm font-black uppercase tracking-[0.16em] text-white">{title}</h3>
      <ul className="mt-5 space-y-3 text-sm text-white/55">
        {links.map(([label, href]) => (
          <li key={label}>
            {internal && href.startsWith('/')
              ? <Link to={href} className="transition hover:text-ember">{label}</Link>
              : <a href={href} className="transition hover:text-ember">{label}</a>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlanCard({ plan }) {
  const popular = Boolean(plan.isPopular);
  const benefits = ['Full training-floor access', 'Trainer guidance', 'Progress tracking', 'Friendly member support'];

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4 }}
      className={`relative flex h-full min-h-[470px] flex-col overflow-hidden rounded-lg border p-6 sm:p-7 ${
        popular
          ? 'border-ember bg-ink text-white shadow-glow ring-1 ring-ember/40'
          : 'border-slate-200 bg-white text-ink shadow-panel hover:shadow-xl dark:border-white/10 dark:bg-white/[0.06] dark:text-white'
      }`}
    >
      {popular ? (
        <>
          <div aria-hidden="true" className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-ember/25 blur-3xl" />
          <div className="relative -mx-1 mb-6 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ember px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-white shadow-lg shadow-ember/20">
              <Star className="h-3.5 w-3.5 fill-current" /> Most popular
            </span>
            <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">Member favorite</span>
          </div>
        </>
      ) : (
        <p className="mb-6 text-xs font-bold uppercase tracking-[0.18em] text-ember">Membership</p>
      )}

      <div className="relative">
        <h3 className="text-2xl font-black sm:text-3xl">{plan.name}</h3>
        <p className={`mt-3 min-h-12 text-sm leading-6 ${popular ? 'text-white/60' : 'text-steel'}`}>
          {plan.description || 'Everything you need to train consistently and make meaningful progress.'}
        </p>
      </div>

      <div className={`relative mt-7 border-y py-6 ${popular ? 'border-white/10' : 'border-slate-100 dark:border-white/10'}`}>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-black tracking-tight sm:text-5xl">₹{Number(plan.price).toLocaleString('en-IN')}</span>
        </div>
        <p className={`mt-2 text-xs font-semibold ${popular ? 'text-white/45' : 'text-steel'}`}>+ 5% GST · {plan.duration} days of membership</p>
      </div>

      <ul className={`relative mt-6 flex-1 space-y-3.5 text-sm ${popular ? 'text-white/75' : 'text-slate-700 dark:text-slate-200'}`}>
        {benefits.map((item) => (
          <li key={item} className="flex items-center gap-3">
            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${popular ? 'bg-mint/15 text-mint' : 'bg-emerald-50 text-emerald-600 dark:bg-mint/10 dark:text-mint'}`}>
              <Check className="h-3.5 w-3.5" />
            </span>
            {item}
          </li>
        ))}
      </ul>

      <a href="#contact" className="relative mt-8">
        <Button variant={popular ? 'accent' : 'primary'} className="w-full py-3">
          Choose {plan.name} <ArrowRight className="h-4 w-4" />
        </Button>
      </a>
    </motion.article>
  );
}

function TrainerCard({ trainer, gymName, ownerPhone }) {
  const experience = Number(trainer.experience) || 0;
  const phoneHref = `tel:${ownerPhone.replace(/[^+\d]/g, '')}`;
  const specialties = String(trainer.specialization || 'Fitness coaching')
    .split(/[,/|]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className="group grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel transition-shadow hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.06] lg:grid-cols-[minmax(320px,420px)_1fr]"
    >
      <div className="p-4 pb-0 sm:p-6 sm:pb-0 lg:p-7 lg:pr-0">
        <div className="relative h-[390px] overflow-hidden rounded-lg bg-slate-100 sm:h-[460px] lg:h-full lg:min-h-[430px] dark:bg-white/5">
          <img
            src={trainer.image || fallbackImages[2].src}
            alt={`${trainer.name}, ${trainer.specialization || 'fitness coach'}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top transition duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />
          <span className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
            {experience ? `${experience}+ years coaching` : 'Professional coach'}
          </span>
        </div>
      </div>

      <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ember">Meet your coach</p>
        <h3 className="mt-3 text-3xl font-black text-ink sm:text-4xl dark:text-white">{trainer.name}</h3>
        <p className="mt-2 text-sm font-bold text-steel">{trainer.specialization || 'Fitness'} Coach · {gymName}</p>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-steel sm:text-base">
          {trainer.bio || 'Focused coaching for better movement, stronger habits, and steady progress you can measure.'}
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <CoachStat value={experience ? `${experience}+ yrs` : 'Expert'} label="Experience" />
          <CoachStat value={trainer.specialization || 'Fitness'} label="Training focus" />
          <CoachStat value="Personal" label="Coaching approach" />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {specialties.map((specialty) => (
            <span key={specialty} className="rounded-full border border-ember/20 bg-ember/[0.07] px-3 py-1.5 text-xs font-bold text-ember">{specialty}</span>
          ))}
          <span className="rounded-full border border-mint/25 bg-mint/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-mint">Goal-focused</span>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a href="#contact"><Button variant="accent" className="w-full sm:w-auto"><CalendarCheck className="h-4 w-4" /> Book a session</Button></a>
          <a href={phoneHref}><Button variant="subtle" className="w-full sm:w-auto"><Phone className="h-4 w-4 text-ember" /> Call the gym</Button></a>
        </div>
      </div>
    </motion.article>
  );
}

function CoachStat({ value, label }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.05]">
      <p className="truncate text-sm font-black text-ink dark:text-white" title={String(value)}>{value}</p>
      <p className="mt-1 text-xs font-semibold text-steel">{label}</p>
    </div>
  );
}

function TestimonialCard({ testimonial, index }) {
  const featured = testimonial.featured;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      className={`relative flex h-full min-h-72 flex-col overflow-hidden rounded-lg border p-6 transition-shadow sm:p-7 ${
        featured
          ? 'border-white/10 bg-ink text-white shadow-glow lg:col-span-2'
          : 'border-slate-200 bg-white text-ink shadow-panel hover:shadow-xl dark:border-white/10 dark:bg-white/[0.07] dark:text-white'
      }`}
    >
      {featured ? (
        <>
          <div aria-hidden="true" className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-ember/20 blur-3xl" />
          <div aria-hidden="true" className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-mint/10 blur-3xl" />
        </>
      ) : null}

      <div className="relative flex items-center justify-between gap-4">
        <div className="flex gap-1 text-gold" aria-label="5 out of 5 stars">
          {[1, 2, 3, 4, 5].map((star) => <Star key={star} className="h-4 w-4 fill-current" />)}
        </div>
        <Quote className={`h-8 w-8 ${featured ? 'text-white/15' : 'text-ember/15 dark:text-white/15'}`} />
      </div>

      <blockquote className={`relative mt-7 flex-1 font-semibold leading-relaxed ${featured ? 'max-w-3xl text-xl sm:text-2xl' : 'text-base'}`}>
        “{testimonial.quote}”
      </blockquote>

      <div className={`relative mt-8 flex items-center gap-3 border-t pt-5 ${featured ? 'border-white/10' : 'border-slate-100 dark:border-white/10'}`}>
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-ember to-orange-400 text-xs font-black text-white shadow-lg shadow-ember/20">
          {testimonial.initials}
        </span>
        <div>
          <p className="text-sm font-black">{testimonial.name}</p>
          <p className={`mt-0.5 text-xs ${featured ? 'text-white/50' : 'text-steel'}`}>{testimonial.detail}</p>
        </div>
      </div>
    </motion.article>
  );
}

function SectionTitle({ eyebrow, title, light = false }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-ember">{eyebrow}</p>
      <h2 className={`mt-3 text-3xl font-black text-balance sm:text-4xl md:text-5xl ${light ? 'text-white' : ''}`}>{title}</h2>
    </div>
  );
}

function ContactCard({ icon: Icon, label, value, href }) {
  return (
    <div className="group rounded-lg border border-white/10 bg-white/[0.06] p-5 transition hover:-translate-y-1 hover:border-ember/40 hover:bg-white/[0.09]">
      <span className="grid h-10 w-10 place-items-center rounded-lg bg-ember/15 text-ember transition group-hover:bg-ember group-hover:text-white"><Icon className="h-5 w-5" /></span>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-white/40">{label}</p>
      {href ? <a href={href} className="mt-2 block break-words text-sm font-bold leading-6 text-white transition hover:text-ember">{value}</a> : <p className="mt-2 break-words text-sm font-bold leading-6 text-white">{value}</p>}
    </div>
  );
}

function ContactForm({ gymName, ownerPhone }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const message = [
      `Hello ${gymName}, I have an enquiry.`,
      '',
      `Name: ${data.get('name')}`,
      `Phone: ${data.get('phone')}`,
      data.get('email') ? `Email: ${data.get('email')}` : null,
      '',
      `Message: ${data.get('message')}`,
    ].filter(Boolean).join('\n');
    const phoneDigits = ownerPhone.replace(/\D/g, '');
    const whatsappNumber = phoneDigits.length === 10 ? `91${phoneDigits}` : phoneDigits;

    window.location.href = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  const fieldClassName = 'mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-ember focus:ring-2 focus:ring-ember/20';

  return (
    <div className="order-2 flex flex-col justify-center p-6 sm:p-8 lg:p-9 xl:p-10">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#25D366]/15 text-[#54e685]"><MessageCircle className="h-5 w-5" /></span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#54e685]">WhatsApp us</p>
          <h3 className="mt-1 text-2xl font-black">Send a message</h3>
        </div>
      </div>
      <p className="mt-5 text-sm leading-6 text-white/50">Fill in the details below. We’ll open WhatsApp with your message ready to send.</p>

      <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold text-white/75">
            Your name <span className="text-ember">*</span>
            <input className={fieldClassName} name="name" type="text" placeholder="Enter your name" autoComplete="name" required />
          </label>
          <label className="text-sm font-semibold text-white/75">
            Phone number <span className="text-ember">*</span>
            <input className={fieldClassName} name="phone" type="tel" placeholder="Enter your number" autoComplete="tel" required />
          </label>
        </div>
        <label className="block text-sm font-semibold text-white/75">
          Email address <span className="font-normal text-white/35">(optional)</span>
          <input className={fieldClassName} name="email" type="email" placeholder="you@example.com" autoComplete="email" />
        </label>
        <label className="block text-sm font-semibold text-white/75">
          How can we help? <span className="text-ember">*</span>
          <textarea className={`${fieldClassName} min-h-32 resize-y`} name="message" placeholder="Tell us about your goals or ask a question..." required />
        </label>
        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-3.5 text-sm font-black text-[#07170d] shadow-lg shadow-[#25D366]/15 transition hover:-translate-y-0.5 hover:bg-[#54e685] focus:outline-none focus:ring-2 focus:ring-[#54e685] focus:ring-offset-2 focus:ring-offset-ink">
          Continue to WhatsApp <Send className="h-4 w-4" />
        </button>
        <p className="text-center text-xs leading-5 text-white/35">WhatsApp will open with your details pre-filled. Review the message, then tap send.</p>
      </form>
    </div>
  );
}
