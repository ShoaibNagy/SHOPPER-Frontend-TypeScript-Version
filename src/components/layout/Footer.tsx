// ─────────────────────────────────────────────────────────────
// components/layout/Footer.tsx
// ─────────────────────────────────────────────────────────────

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import styles from './Footer.module.scss';

const FOOTER_LINKS = {
  Shop: [
    { label: 'New Arrivals',  to: `${ROUTES.SHOP}?isNew=true`      },
    { label: 'Featured',      to: `${ROUTES.SHOP}?isFeatured=true`  },
    { label: 'Sale',          to: `${ROUTES.SHOP}?sale=true`        },
    { label: 'All Products',  to: ROUTES.SHOP                       },
  ],
  Account: [
    { label: 'Sign In',       to: ROUTES.LOGIN         },
    { label: 'Register',      to: ROUTES.REGISTER      },
    { label: 'My Orders',     to: ROUTES.ORDER_HISTORY },
    { label: 'Profile',       to: ROUTES.PROFILE       },
  ],
  Support: [
    { label: 'FAQ',           to: '#faq'             },
    { label: 'Shipping',      to: '#shipping'        },
    { label: 'Returns',       to: '#returns'         },
    { label: 'Contact',       to: '#contact'         },
  ],
} as const;

const SOCIAL_LINKS = [
  { label: 'Instagram', href: '#', icon: <InstagramIcon /> },
  { label: 'Twitter/X', href: '#', icon: <XIcon />        },
  { label: 'TikTok',    href: '#', icon: <TikTokIcon />   },
] as const;

export default function Footer() {
  const [email, setEmail]       = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleNewsletterSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) {
      // Newsletter signup — wire to backend when available
      setSubmitted(true);
      setEmail('');
    }
  }

  return (
    <footer className={styles.footer} role="contentinfo">

      {/* ── Main grid ──────────────────────────────────────── */}
      <div className={styles.footer__grid}>

        {/* Brand column */}
        <div className={styles.footer__brand}>
          <Link to={ROUTES.HOME} className={styles.footer__logo} aria-label="Shopper — Home">
            <LogoMark />
            <span>SHOPPER</span>
          </Link>

          <p className={styles.footer__tagline}>
            Curated fashion for the&nbsp;discerning&nbsp;few.
          </p>

          {/* Social icons */}
          <div className={styles.footer__social}>
            {SOCIAL_LINKS.map(({ label, href, icon }) => (
              <a
                key={label}
                href={href}
                className={styles.footer__social__link}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Nav columns */}
        {(Object.entries(FOOTER_LINKS) as [string, readonly { label: string; to: string }[]][]).map(
          ([heading, links]) => (
            <div key={heading} className={styles.footer__col}>
              <h3 className={styles.footer__col__heading}>{heading}</h3>
              <ul className={styles.footer__col__list}>
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className={styles.footer__col__link}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ),
        )}

        {/* Newsletter column */}
        <div className={styles.footer__newsletter}>
          <h3 className={styles.footer__col__heading}>Newsletter</h3>
          <p className={styles.footer__newsletter__copy}>
            Early access, drops &amp; exclusive offers.
          </p>

          {submitted ? (
            <p className={styles.footer__newsletter__success}>
              You're on the list ✦
            </p>
          ) : (
            <form
              onSubmit={handleNewsletterSubmit}
              className={styles.footer__newsletter__form}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className={styles.footer__newsletter__input}
                aria-label="Email address for newsletter"
              />
              <button type="submit" className={styles.footer__newsletter__btn}>
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ── Bottom legal bar ───────────────────────────────── */}
      <div className={styles.footer__bottom}>
        <p className={styles.footer__copyright}>
          &copy; {new Date().getFullYear()} Shopper. All rights reserved.
        </p>
        <div className={styles.footer__legal}>
          <a href="#privacy" className={styles.footer__legal__link}>Privacy</a>
          <a href="#terms"   className={styles.footer__legal__link}>Terms</a>
          <a href="#cookies" className={styles.footer__legal__link}>Cookies</a>
        </div>
      </div>
    </footer>
  );
}

// ── Inline SVG icons ──────────────────────────────────────────
function LogoMark() {
  return (
    <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect width="28" height="28" rx="6" fill="#f97316" />
      <path d="M8 10h12M8 14h8M8 18h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function TikTokIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.79a4.85 4.85 0 0 1-1.01-.1z" />
    </svg>
  );
}