import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, imgUrl } from '../api.js';
import { useStore } from '../context/StoreContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';
import { Chevron, Truck, Shield, Return, Spark } from '../components/Icons.jsx';

function CtaPair({ a, aLink, b, bLink, dark }) {
  return (
    <div className="cta-pair">
      {a && <Link to={aLink || '/shop'} className={`btn ${dark ? 'on-dark' : ''}`}>{a}</Link>}
      {b && <Link to={bLink || '/shop'} className="link-arrow">{b} <Chevron /></Link>}
    </div>
  );
}

function Tile({ b }) {
  return (
    <Reveal className={`tile ${b.theme} ${b.size}`}>
      <div className="tile-copy">
        {b.eyebrow && <p className="eyebrow">{b.eyebrow}</p>}
        <h2>{b.title}</h2>
        {b.subtitle && <p className="tile-sub">{b.subtitle}</p>}
        <CtaPair a={b.ctaText} aLink={b.ctaLink} b={b.secondaryText} bLink={b.secondaryLink} dark={b.theme === 'dark'} />
      </div>
      {b.image && <div className="tile-media"><img src={imgUrl(b.image)} alt={b.title} loading="lazy" /></div>}
    </Reveal>
  );
}

export default function Home() {
  const { settings, categories } = useStore();
  const [banners, setBanners] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [popular, setPopular] = useState([]);
  const heroImg = useRef(null);
  const scroller = useRef(null);

  useEffect(() => {
    api('/banners').then(setBanners).catch(() => {});
    api('/products?featured=true&limit=10').then((d) => setFeatured(d.items)).catch(() => {});
    api('/products?sort=popular&limit=8').then((d) => setPopular(d.items)).catch(() => {});
  }, []);

  // Gentle scroll-linked zoom on the hero image
  useEffect(() => {
    const onScroll = () => {
      const el = heroImg.current; if (!el) return;
      const y = Math.min(window.scrollY, 700);
      el.style.transform = `scale(${1 + y / 3500}) translateY(${y * -0.04}px)`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const s = settings || {};
  const heroImage = s.heroImage || featured[0]?.images?.[0];
  const full = banners.filter((b) => b.size !== 'half');
  const half = banners.filter((b) => b.size === 'half');
  const scrollBy = (d) => scroller.current?.scrollBy({ left: d * 360, behavior: 'smooth' });

  return (
    <div className="home">
      <section className="hero">
        {!settings ? <div className="hero-copy"><div className="skeleton" style={{ height: 220, maxWidth: 760, margin: '0 auto' }} /></div> : <div className="hero-copy">
          {s.heroEyebrow && <p className="eyebrow accent fade-up">{s.heroEyebrow}</p>}
          <h1 className="fade-up d1">{(s.heroTitle || '').split('\n').map((l, i) => <span key={i}>{l}<br /></span>)}</h1>
          <p className="hero-sub fade-up d2">{s.heroSubtitle}</p>
          <div className="fade-up d3"><CtaPair a={s.heroCtaText} aLink={s.heroCtaLink} b="See what’s new" bLink="/shop?sort=newest" /></div>
        </div>}
        {heroImage && <div className="hero-media fade-up d3"><img ref={heroImg} src={imgUrl(heroImage)} alt="" /></div>}
      </section>

      {full.length > 0 && <section className="tiles">{full.map((b) => <Tile key={b._id} b={b} />)}</section>}
      {half.length > 0 && <section className="tiles grid2">{half.map((b) => <Tile key={b._id} b={b} />)}</section>}

      {featured.length > 0 && (
        <section className="shelf">
          <div className="wrap shelf-head">
            <Reveal as="h2" className="section-title"><b>The latest.</b> <span className="muted">Take a look at what’s new right now.</span></Reveal>
            <div className="shelf-nav"><button onClick={() => scrollBy(-1)} aria-label="Previous">‹</button><button onClick={() => scrollBy(1)} aria-label="Next">›</button></div>
          </div>
          <div className="scroller" ref={scroller}>
            {featured.map((p, i) => <Reveal key={p._id} delay={i * 60} className="scroller-item"><ProductCard p={p} variant="tall" /></Reveal>)}
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="wrap cats">
          <Reveal as="h2" className="section-title"><b>Shop by category.</b> <span className="muted">Find exactly what you’re looking for.</span></Reveal>
          <div className="cat-grid">
            {categories.map((c, i) => (
              <Reveal key={c.slug} delay={i * 50}>
                <Link to={`/shop?category=${c.slug}`} className="cat">
                  <div className="cat-img"><img src={imgUrl(c.image)} alt="" loading="lazy" /></div>
                  <h3>{c.name}</h3><p className="muted small">{c.tagline}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="why">
        <div className="wrap">
          <Reveal as="h2" className="section-title"><b>Why {s.storeName || 'Lumen'}.</b> <span className="muted">Even more reasons to shop with us.</span></Reveal>
          <div className="why-grid">
            {[
              [Truck, 'Free delivery', `On every order over ₹${(s.freeShippingThreshold ?? 999).toLocaleString('en-IN')}. Most orders arrive in 2–5 days.`],
              [Return, 'Easy returns', 'Changed your mind? Return within 10 days, no questions asked.'],
              [Shield, 'Secure checkout', 'UPI, cards, netbanking and wallets, all protected by Razorpay.'],
              [Spark, 'Curated quality', 'Every product is hand-picked and tested before it reaches you.'],
            ].map(([Ic, t, d], i) => (
              <Reveal key={t} delay={i * 80} className="why-card"><Ic /><h3>{t}</h3><p className="muted">{d}</p></Reveal>
            ))}
          </div>
        </div>
      </section>

      {popular.length > 0 && (
        <section className="wrap popular">
          <Reveal as="h2" className="section-title"><b>Best sellers.</b> <span className="muted">Loved by thousands.</span></Reveal>
          <div className="pgrid">{popular.map((p, i) => <Reveal key={p._id} delay={(i % 4) * 60}><ProductCard p={p} /></Reveal>)}</div>
          <div className="center mt"><Link to="/shop" className="link-arrow">Shop all products <Chevron /></Link></div>
        </section>
      )}
    </div>
  );
}
