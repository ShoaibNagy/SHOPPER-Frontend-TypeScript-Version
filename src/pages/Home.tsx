// ─────────────────────────────────────────────────────────────
// pages/Home.tsx — Landing page with GSAP animations
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useFeaturedProducts, useNewArrivals, useCategories } from '@hooks/useProducts';
import { ROUTES } from '@/router/routes';
import { ProductCard } from '@components/product';
import { Spinner } from '@components/ui';
import styles from './Home.module.scss';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const rootRef     = useRef<HTMLDivElement>(null);
  const subRef      = useRef<HTMLParagraphElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);

  const { data: featured,    isLoading: featLoading } = useFeaturedProducts(8);
  const { data: newArrivals, isLoading: newLoading  } = useNewArrivals(4);
  const { data: categories                           } = useCategories();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero word stagger
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.js-hero-word', { y: 100, opacity: 0, duration: 1.1, stagger: 0.08 })
        .from(subRef.current,  { y: 24,  opacity: 0, duration: 0.7 }, '-=0.5')
        .from(ctaRef.current,  { y: 20,  opacity: 0, duration: 0.6 }, '-=0.4');

      // Marquee
      gsap.to('.js-marquee-inner', {
        xPercent: -50, ease: 'none', duration: 22, repeat: -1,
      });

      // Scroll reveals
      gsap.utils.toArray<HTMLElement>('.js-reveal').forEach((el) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
          y: 40, opacity: 0, duration: 0.8, ease: 'power2.out',
        });
      });

      // Featured cards stagger
      gsap.utils.toArray<HTMLElement>('.js-feat-card').forEach((el, i) => {
        gsap.from(el, {
          scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none none' },
          y: 48, opacity: 0, duration: 0.7, delay: i * 0.06, ease: 'power2.out',
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef}>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.hero__grid} aria-hidden="true" />
        <div className={styles.hero__glow} aria-hidden="true" />

        <div className={styles.hero__inner}>
          <span className={styles.hero__eyebrow}>New collection 2025</span>

          <h1 className={styles.hero__headline} aria-label="Fashion for the Discerning Few.">
            {'Fashion for the'.split(' ').map((w, i) => (
              <span key={i} className={`${styles.hero__word} js-hero-word`} aria-hidden="true">{w}</span>
            ))}
            <br aria-hidden="true" />
            {['Discerning', 'Few.'].map((w, i) => (
              <span key={w} className={`${styles.hero__word} ${i === 0 ? styles['hero__word--accent'] : ''} js-hero-word`} aria-hidden="true">{w}</span>
            ))}
          </h1>

          <p ref={subRef} className={styles.hero__sub}>
            Curated pieces from independent designers.<br />
            Quality that outlasts trends.
          </p>

          <div ref={ctaRef} className={styles.hero__cta}>
            <Link to={ROUTES.SHOP} className={styles.cta_primary}>
              Shop the collection <ArrowIcon />
            </Link>
            <Link to={`${ROUTES.SHOP}?isNew=true`} className={styles.cta_secondary}>
              New arrivals
            </Link>
          </div>

          <div className={styles.hero__scroll} aria-hidden="true">
            <span className={styles.hero__scroll__line} />
            <span className={styles.hero__scroll__label}>Scroll</span>
          </div>
        </div>

        <div className={styles.hero__stats} aria-hidden="true">
          <StatCard value="2,400+" label="Products"     delay="0.8s" />
          <StatCard value="98%"    label="Satisfaction" delay="1.0s" />
          <StatCard value="Free"   label="Returns"      delay="1.2s" />
        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────────── */}
      <div className={styles.marquee} aria-hidden="true">
        <div className={`${styles.marquee__inner} js-marquee-inner`}>
          {[0, 1].map((gi) => (
            <span key={gi} className={styles.marquee__track}>
              {['New Collection', 'Free Returns', 'Independent Designers',
                'Sustainable Fashion', 'Curated Weekly', 'Free Shipping $150+'].map((t) => (
                <span key={t} className={styles.marquee__item}>
                  {t} <span className={styles.marquee__dot}>✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ───────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <header className={`${styles.section__header} js-reveal`}>
            <h2 className={styles.section__title}>Browse by category</h2>
            <Link to={ROUTES.SHOP} className={styles.section__link}>View all <ArrowIcon /></Link>
          </header>
          <div className={styles.categories_grid}>
            {categories?.slice(0, 6).map((cat, i) => (
              <Link key={cat._id} to={`${ROUTES.SHOP}?category=${cat.slug}`}
                className={`${styles.category_card} js-reveal`}
                style={{ animationDelay: `${i * 80}ms` }}>
                {cat.image && <img src={cat.image} alt="" aria-hidden="true" className={styles.category_card__img} loading="lazy" />}
                <div className={styles.category_card__overlay} aria-hidden="true" />
                <span className={styles.category_card__name}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED ──────────────────────────────────────────── */}
      <section className={`${styles.section} ${styles['section--dark']}`}>
        <div className={styles.container}>
          <header className={`${styles.section__header} js-reveal`}>
            <h2 className={styles.section__title}>Featured</h2>
            <Link to={`${ROUTES.SHOP}?isFeatured=true`} className={styles.section__link}>See all <ArrowIcon /></Link>
          </header>
          {featLoading ? (
            <div className={styles.loading_center}><Spinner size="lg" centered /></div>
          ) : (
            <div className={styles.products_grid}>
              {featured?.map((product, i) => (
                <div key={product._id} className="js-feat-card" style={{ '--card-i': i } as React.CSSProperties}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── EDITORIAL BANNER ──────────────────────────────────── */}
      <section className={`${styles.banner_section} js-reveal`}>
        <div className={styles.container}>
          <div className={styles.editorial_banner}>
            <div className={styles.editorial_banner__content}>
              <span className={styles.editorial_banner__tag}>The Edit</span>
              <h2 className={styles.editorial_banner__headline}>
                Pieces that<br /><em>define the season</em>
              </h2>
              <p className={styles.editorial_banner__body}>
                Our curators sift through thousands of new arrivals each week so you don't have to.
                This week's edit: structured outerwear, quiet luxury accessories, and the perfect white shirt.
              </p>
              <Link to={`${ROUTES.SHOP}?isFeatured=true`} className={styles.editorial_banner__cta}>
                Read the edit <ArrowIcon />
              </Link>
            </div>
            <div className={styles.editorial_banner__art} aria-hidden="true">
              <span className={styles.art_circle} />
              <span className={styles.art_line_h} />
              <span className={styles.art_line_v} />
              <span className={styles.art_dot} />
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ──────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.container}>
          <header className={`${styles.section__header} js-reveal`}>
            <div>
              <h2 className={styles.section__title}>New arrivals</h2>
              <p className={styles.section__subtitle}>Dropped this week</p>
            </div>
            <Link to={`${ROUTES.SHOP}?isNew=true`} className={styles.section__link}>View all <ArrowIcon /></Link>
          </header>
          {newLoading ? (
            <div className={styles.loading_center}><Spinner size="lg" centered /></div>
          ) : (
            <div className={`${styles.products_grid} ${styles['products_grid--4']}`}>
              {newArrivals?.map((product) => (
                <div key={product._id} className="js-reveal"><ProductCard product={product} /></div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── USP ROW ───────────────────────────────────────────── */}
      <section className={`${styles.usp_section} js-reveal`}>
        <div className={styles.container}>
          <div className={styles.usp_grid}>
            <UspItem icon={<ShippingIcon />} title="Free shipping"   body="On orders over $150. Express available." />
            <UspItem icon={<ReturnIcon />}   title="Free returns"    body="30-day hassle-free returns on all items." />
            <UspItem icon={<SecureIcon />}   title="Secure checkout" body="Stripe-powered. Your data stays yours." />
            <UspItem icon={<SupportIcon />}  title="Expert support"  body="Real people. Mon–Fri, 9am–6pm." />
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────── */}
      <section className={`${styles.cta_band} js-reveal`}>
        <div className={styles.container}>
          <div className={styles.cta_band__inner}>
            <div>
              <h2 className={styles.cta_band__headline}>Ready to find your next favourite piece?</h2>
              <p className={styles.cta_band__sub}>Join 40,000+ shoppers who trust Shopper for their wardrobe.</p>
            </div>
            <Link to={ROUTES.SHOP} className={styles.cta_band__btn}>Shop now <ArrowIcon /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ value, label, delay }: { value: string; label: string; delay: string }) {
  return (
    <div className={styles.stat_card} style={{ animationDelay: delay }}>
      <span className={styles.stat_card__value}>{value}</span>
      <span className={styles.stat_card__label}>{label}</span>
    </div>
  );
}

function UspItem({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className={styles.usp_item}>
      <span className={styles.usp_item__icon}>{icon}</span>
      <div>
        <h3 className={styles.usp_item__title}>{title}</h3>
        <p className={styles.usp_item__body}>{body}</p>
      </div>
    </div>
  );
}

function ArrowIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>; }
function ShippingIcon() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>; }
function ReturnIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.65"/></svg>; }
function SecureIcon()   { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function SupportIcon()  { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }