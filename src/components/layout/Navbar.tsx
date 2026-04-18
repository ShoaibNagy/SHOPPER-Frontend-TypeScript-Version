// ─────────────────────────────────────────────────────────────
// components/layout/Navbar.tsx
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/auth.store';
import { useCartStore } from '@store/cart.store';
import { useLogout } from '@hooks/useAuth';
import { ROUTES } from '@/router/routes';
import { cn } from '@utils/cn';
import styles from './Navbar.module.scss';

// ── Nav link definitions ──────────────────────────────────────
const NAV_LINKS = [
  { label: 'Shop',     to: ROUTES.SHOP },
  { label: 'New In',   to: `${ROUTES.SHOP}?isNew=true` },
  { label: 'Sale',     to: `${ROUTES.SHOP}?sale=true` },
] as const;

export default function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const [searchOpen,   setSearchOpen]   = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const location       = useLocation();

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user            = useAuthStore((s) => s.user);
  const { openCart, toggleCart }   = useCartStore();
  const itemCount       = useCartStore((s) => s.optimisticCount);
  const { mutate: logout } = useLogout();

  // ── Scroll state ─────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Close mobile menu on route change ────────────────────────
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // ── Lock body scroll when mobile menu is open ─────────────────
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // ── Focus search input when opened ───────────────────────────
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  }

  return (
    <>
      <header
        className={cn(
          styles.navbar,
          scrolled   && styles['navbar--scrolled'],
          menuOpen   && styles['navbar--menu-open'],
        )}
        role="banner"
      >
        <div className={styles.navbar__inner}>

          {/* ── Logo ─────────────────────────────────────────── */}
          <Link to={ROUTES.HOME} className={styles.navbar__logo} aria-label="Shopper — Home">
            <LogoMark />
            <span className={styles.navbar__logo__text}>SHOPPER</span>
          </Link>

          {/* ── Desktop nav ──────────────────────────────────── */}
          <nav className={styles.navbar__nav} aria-label="Primary navigation">
            {NAV_LINKS.map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  cn(styles.navbar__link, isActive && styles['navbar__link--active'])
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* ── Actions row ──────────────────────────────────── */}
          <div className={styles.navbar__actions}>

            {/* Search toggle */}
            <button
              className={cn(styles.navbar__icon_btn, searchOpen && styles['navbar__icon_btn--active'])}
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Toggle search"
              aria-expanded={searchOpen}
            >
              <SearchIcon />
            </button>

            {/* Auth */}
            {isAuthenticated ? (
              <div className={styles.navbar__user}>
                <Link
                  to={ROUTES.PROFILE}
                  className={styles.navbar__icon_btn}
                  aria-label="My account"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className={styles.navbar__avatar}
                    />
                  ) : (
                    <UserIcon />
                  )}
                </Link>
                <div className={styles.navbar__user__dropdown}>
                  <Link to={ROUTES.PROFILE}      className={styles.dropdown__item}>Profile</Link>
                  <Link to={ROUTES.ORDER_HISTORY} className={styles.dropdown__item}>Orders</Link>
                  <button
                    className={cn(styles.dropdown__item, styles['dropdown__item--danger'])}
                    onClick={() => logout()}
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <Link to={ROUTES.LOGIN} className={styles.navbar__icon_btn} aria-label="Sign in">
                <UserIcon />
              </Link>
            )}

            {/* Cart */}
            <button
              className={styles.navbar__cart_btn}
              onClick={() => toggleCart()}
              aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ''}`}
            >
              <BagIcon />
              {itemCount > 0 && (
                <span className={styles.navbar__cart_badge} aria-hidden="true">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              className={cn(styles.navbar__hamburger, menuOpen && styles['navbar__hamburger--open'])}
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* ── Search bar (slides down) ──────────────────────── */}
        <div
          className={cn(styles.navbar__search, searchOpen && styles['navbar__search--open'])}
          aria-hidden={!searchOpen}
        >
          <form onSubmit={handleSearchSubmit} className={styles.navbar__search__form}>
            <SearchIcon />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search for products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.navbar__search__input}
              tabIndex={searchOpen ? 0 : -1}
            />
            <button type="submit" className={styles.navbar__search__submit}>
              Search
            </button>
            <button
              type="button"
              className={styles.navbar__search__close}
              onClick={() => setSearchOpen(false)}
              tabIndex={searchOpen ? 0 : -1}
              aria-label="Close search"
            >
              <CloseIcon />
            </button>
          </form>
        </div>
      </header>

      {/* ── Mobile menu overlay ───────────────────────────────── */}
      <div
        className={cn(styles.mobile_menu, menuOpen && styles['mobile_menu--open'])}
        aria-hidden={!menuOpen}
      >
        <nav className={styles.mobile_menu__nav} aria-label="Mobile navigation">
          {NAV_LINKS.map(({ label, to }, i) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) =>
                cn(styles.mobile_menu__link, isActive && styles['mobile_menu__link--active'])
              }
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {label}
            </NavLink>
          ))}

          <div className={styles.mobile_menu__divider} />

          {isAuthenticated ? (
            <>
              <Link to={ROUTES.PROFILE}      className={styles.mobile_menu__link} style={{ animationDelay: '180ms' }}>Profile</Link>
              <Link to={ROUTES.ORDER_HISTORY} className={styles.mobile_menu__link} style={{ animationDelay: '240ms' }}>Orders</Link>
              <button
                className={cn(styles.mobile_menu__link, styles['mobile_menu__link--danger'])}
                onClick={() => logout()}
                style={{ animationDelay: '300ms' }}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to={ROUTES.LOGIN}    className={styles.mobile_menu__link} style={{ animationDelay: '180ms' }}>Sign in</Link>
              <Link to={ROUTES.REGISTER} className={cn(styles.mobile_menu__link, styles['mobile_menu__link--cta'])} style={{ animationDelay: '240ms' }}>Create account</Link>
            </>
          )}
        </nav>

        {/* Cart button at the bottom of the mobile menu */}
        <button
          className={styles.mobile_menu__cart}
          onClick={() => { setMenuOpen(false); openCart(); }}
        >
          <BagIcon />
          View bag
          {itemCount > 0 && <span className={styles.navbar__cart_badge}>{itemCount}</span>}
        </button>
      </div>

      {/* Backdrop that closes the mobile menu */}
      {menuOpen && (
        <div
          className={styles.mobile_menu__backdrop}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}

// ── Inline SVG icons ──────────────────────────────────────────
function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect width="28" height="28" rx="6" fill="#f97316" />
      <path d="M8 10h12M8 14h8M8 18h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
  );
}
function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}