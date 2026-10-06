:root {
  --paper: #f5f5f7;
  --paper-elevated: #ffffff;
  --paper-soft: #efeff3;
  --ink: #1d1d1f;
  --ink-soft: #4d4d52;
  --muted: #6e6e73;
  --line: rgba(29, 29, 31, 0.12);
  --card: rgba(255, 255, 255, 0.85);
  --brand: #0a84ff;
  --brand-strong: #0066cc;
  --shadow: rgba(15, 23, 42, 0.08);
  --content-max: 1280px;
  --sticky-header-height: 5.4rem;
  --radius-xl: 28px;
  --radius-lg: 22px;
  --radius-md: 16px;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  background: linear-gradient(180deg, #f5f5f7 0%, #f9f9f9 100%);
  color: var(--ink);
  font-family: "SF Pro Text", "Segoe UI", sans-serif;
  line-height: 1.6;
  letter-spacing: -0.02em;
}

img {
  max-width: 100%;
  display: block;
}

a { color: var(--brand); }

h1, h2, h3, h4 {
  margin: 0 0 0.55em;
  line-height: 1.08;
  letter-spacing: -0.06em;
  font-family: "SF Pro Display", "Segoe UI", sans-serif;
}

.skip-link {
  position: absolute;
  left: -999px;
  top: 0;
  z-index: 1000;
  background: #000;
  color: #fff;
  padding: 0.72rem 1rem;
}
.skip-link:focus { left: 0.75rem; top: 0.75rem; }

.section-kicker,
.rail-label,
.kicker {
  margin: 0 0 0.6rem;
  font-size: 0.72rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
  font-family: "SF Mono", "Consolas", monospace;
}

.masthead {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  backdrop-filter: blur(18px);
  background: rgba(245, 245, 247, 0.75);
  border-bottom: 1px solid var(--line);
  padding: 1rem clamp(1rem, 3vw, 2.6rem);
}

.masthead-top {
  max-width: var(--content-max);
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.site-title {
  margin: 0;
  font-size: clamp(2rem, 3vw, 2.9rem);
  letter-spacing: -0.08em;
}

.masthead.is-compact { padding: 0.62rem clamp(1rem, 3vw, 2.6rem); }
.masthead.is-compact .kicker { display: none; }
.masthead.is-compact .site-title { font-size: 1.45rem; }

.site-nav ul {
  list-style: none;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.2rem;
  margin: 0;
  padding: 0;
}

.site-nav a {
  color: var(--ink);
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s ease;
}
.site-nav a:hover { opacity: 0.75; }

.data-saver label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.74rem;
  color: var(--ink-soft);
  font-family: "SF Mono", "Consolas", monospace;
}

.nav-toggle {
  display: none;
  background: transparent;
  border: none;
  padding: 0.2rem;
  cursor: pointer;
}
.nav-toggle span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--ink);
  border-radius: 999px;
  margin: 4px 0;
}

.ticker {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  white-space: nowrap;
  font-family: "SF Mono", "Consolas", monospace;
  font-size: 0.72rem;
}

.featured {
  max-width: var(--content-max);
  margin: 2.4rem auto 1.5rem;
  padding: 0 clamp(1rem, 3vw, 2.6rem);
  margin-top: calc(2.4rem + var(--sticky-header-height));
}

.featured-row {
  display: grid;
  grid-template-columns: 1.15fr 1.7fr 1.05fr;
  gap: 1rem;
  align-items: stretch;
}

.featured-embed,
.featured-banner {
  min-height: 240px;
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: var(--paper-elevated);
  border: 1px solid var(--line);
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.04);
}

.featured-embed iframe,
.featured-banner img {
  display: block;
  width: 100%;
  height: 100%;
  border: none;
  object-fit: cover;
}

#main,
#content,
#contact,
#elsewhere {
  scroll-margin-top: calc(var(--sticky-header-height) + 1rem);
}

.layout {
  max-width: var(--content-max);
  margin: 0 auto 3rem;
  padding: 0 clamp(1rem, 3vw, 2.6rem);
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 270px;
  gap: 1.5rem;
  align-items: start;
}

.rail-contents,
.rail-sponsor {
  position: sticky;
  top: calc(var(--sticky-header-height) + 1rem);
}

.rail-contents {
  padding-right: 0.8rem;
  border-right: 1px solid var(--line);
}

.rail-sponsor {
  padding-left: 0.8rem;
  border-left: 1px solid var(--line);
}

#post-list-items {
  list-style: none;
  margin: 0.85rem 0 0;
  padding: 0;
  max-height: 450px;
  overflow-y: auto;
}

#post-list-items li + li { margin-top: 0.4rem; }

#post-list-items button {
  width: 100%;
  text-align: left;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 14px;
  padding: 0.7rem 0.75rem;
  cursor: pointer;
  color: var(--ink);
  transition: background 0.2s ease, border-color 0.2s ease;
}
#post-list-items button:hover {
  border-color: var(--line);
  background: rgba(255,255,255,0.52);
}

#post-list-items .num,
#post-list-items .date {
  display: block;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
  font-family: "SF Mono", "Consolas", monospace;
}

#post-list-items .title {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.96rem;
  line-height: 1.35;
}

.see-more-link {
  margin-top: 0.9rem;
  background: transparent;
  border: none;
  color: var(--brand);
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: "SF Mono", "Consolas", monospace;
}

.column-article {
  max-width: 820px;
  width: 100%;
  margin: 0 auto;
}

.homepage-hero {
  background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(248,248,250,0.98));
  border: 1px solid var(--line);
  border-radius: var(--radius-xl);
  padding: clamp(1.5rem, 3vw, 3rem);
  box-shadow: 0 18px 40px rgba(0,0,0,0.04);
  margin-bottom: 1.6rem;
}

.homepage-hero h2 {
  font-size: clamp(2.4rem, 4vw, 4.2rem);
  margin-bottom: 0.3rem;
}

.hero-subtitle {
  margin: 0 0 1.4rem;
  color: var(--muted);
  font-size: 1.08rem;
}

.hero-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0.9rem 1.35rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  text-decoration: none;
}
.btn-primary:hover,
.btn-secondary:hover { transform: translateY(-1px); }

.btn-primary {
  background: linear-gradient(135deg, var(--brand), var(--brand-strong));
  color: #fff;
  border: none;
  box-shadow: 0 18px 28px rgba(10,132,255,0.18);
}

.btn-secondary {
  background: rgba(255,255,255,0.7);
  border: 1px solid var(--line);
  color: var(--ink);
}

.video-feed {
  margin-top: 1rem;
}

.video-feed h3 {
  font-size: clamp(1.7rem, 2.7vw, 2.4rem);
  margin-bottom: 1rem;
}

.video-feed-container {
  display: grid;
  gap: 1.1rem;
}

.video-feed-item {
  background: rgba(255,255,255,0.7);
  border: 1px solid var(--line);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 12px 34px rgba(0,0,0,0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.video-feed-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 38px rgba(0,0,0,0.06);
}

.video-feed-item iframe {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  border: 0;
  background: #000;
}

.video-feed-copy {
  padding: 1rem 1.1rem 1.2rem;
}

.video-feed-copy .video-label {
  display: inline-block;
  margin-bottom: 0.5rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.69rem;
  font-family: "SF Mono", "Consolas", monospace;
}

.video-feed-copy h4 {
  font-size: clamp(1.2rem, 2vw, 1.7rem);
  margin-bottom: 0.2rem;
}

.video-feed-copy p {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.97rem;
}

.ad-placeholder {
  position: relative;
  min-height: 560px;
  width: 100%;
  border-radius: var(--radius-xl);
  background: linear-gradient(180deg, rgba(255,255,255,0.75), rgba(239,239,243,0.96));
  border: 1px solid var(--line);
  overflow: hidden;
  box-shadow: 0 14px 30px rgba(0,0,0,0.04);
}

.ad-placeholder-inner {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: translateY(14px) scale(0.99);
  transition: opacity 0.35s ease, transform 0.35s ease;
  background: rgba(255,255,255,0.3);
}

.ad-placeholder.is-visible .ad-placeholder-inner {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.ad-placeholder-inner img,
.ad-placeholder-inner iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: none;
}

.ad-placeholder-inner img {
  object-fit: cover;
}

.ad-placeholder-copy {
  padding: 1rem 1rem 1.2rem;
  background: rgba(255,255,255,0.82);
}

.ad-placeholder-copy h4 {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.ad-placeholder-copy p {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.92rem;
}

.advertise-with-us {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  padding: 1.2rem;
  gap: 0.6rem;
}

.advertise-with-us p {
  margin: 0;
  font-weight: 600;
  color: var(--ink);
}

.advertise-with-us a {
  color: var(--brand);
  text-decoration: none;
}

.post-article {
  background: rgba(255,255,255,0.7);
  border: 1px solid var(--line);
  border-radius: var(--radius-xl);
  padding: clamp(1.2rem, 3vw, 2rem);
  box-shadow: 0 10px 28px rgba(0,0,0,0.04);
}

.post-article h2 {
  font-size: clamp(2rem, 3vw, 3rem);
}

.post-date,
.post-index-meta {
  display: block;
  color: var(--muted);
  font-size: 0.74rem;
  font-family: "SF Mono", "Consolas", monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.post-article p {
  font-size: 1.02rem;
  color: #2d2d31;
}

.post-ad {
  margin: 1.5rem 0;
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: rgba(255,255,255,0.82);
}

.post-ad-label {
  display: block;
  padding: 0.7rem 1rem 0.2rem;
  color: var(--muted);
  font-size: 0.68rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-family: "SF Mono", "Consolas", monospace;
}

.post-ad img,
.post-ad iframe {
  display: block;
  width: 100%;
  border: none;
}

.post-ad-copy {
  padding: 1rem 1.1rem 1.2rem;
}

.post-ad-copy h4 {
  margin-bottom: 0.25rem;
  font-size: 1.1rem;
}

.post-ad-copy p {
  margin: 0;
  color: var(--ink-soft);
  font-size: 0.94rem;
}

.elsewhere {
  max-width: var(--content-max);
  margin: 2rem auto 0;
  padding: 0 clamp(1rem, 3vw, 2.6rem) 3rem;
}

.elsewhere h2 {
  font-size: clamp(1.8rem, 3vw, 2.5rem);
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin: 1rem 0 1.3rem;
  border-bottom: 1px solid var(--line);
}

.tab-btn {
  border: none;
  background: transparent;
  padding: 0.8rem 0.2rem 0.65rem;
  font-family: "SF Mono", "Consolas", monospace;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  font-size: 0.68rem;
}

.tab-btn.active {
  color: var(--brand);
  border-color: var(--brand);
}

.tab-panel {
  display: none;
}

.tab-panel.active {
  display: block;
}

.social-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.social-item {
  min-height: 250px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #000;
  border: 1px solid rgba(255,255,255,0.08);
}

.social-item iframe {
  width: 100%;
  height: 100%;
  border: none;
  display: block;
}

.facebook-item,
.tiktok-item,
.instagram-item,
.x-item {
  background: rgba(255,255,255,0.8);
  border: 1px solid var(--line);
}

.social-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  height: 100%;
  text-decoration: none;
  color: var(--ink);
  padding: 1.5rem 1rem;
  text-align: center;
}

.social-card i {
  font-size: 2.2rem;
  color: var(--brand);
}

.social-card strong {
  font-size: 1.05rem;
}

.social-card span {
  color: var(--ink-soft);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-family: "SF Mono", "Consolas", monospace;
}

.colophon {
  background: #111214;
  color: rgba(255,255,255,0.8);
  padding: 2rem clamp(1rem, 3vw, 2.6rem) 3rem;
}

.colophon-social {
  max-width: var(--content-max);
  margin: 0 auto 1rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.8rem;
}

.colophon-social a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.78rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.14);
  color: white;
  text-decoration: none;
}

.colophon-copy {
  margin: 0;
  text-align: center;
  color: rgba(255,255,255,0.7);
  font-size: 0.78rem;
  font-family: "SF Mono", "Consolas", monospace;
}

@media (max-width: 980px) {
  .layout {
    grid-template-columns: 1fr;
  }
  .rail-contents,
  .rail-sponsor {
    position: static;
    padding: 0;
    border: none;
  }
  .featured-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .nav-toggle { display: inline-block; }
  .site-nav ul {
    display: none;
    position: absolute;
    top: calc(100% + 0.6rem);
    right: 1rem;
    background: rgba(255,255,255,0.95);
    border: 1px solid var(--line);
    border-radius: 20px;
    padding: 0.75rem 1rem;
    flex-direction: column;
    align-items: flex-start;
    box-shadow: 0 22px 36px rgba(0,0,0,0.08);
  }
  #nav-links.open { display: flex; }
  .hero-cta { flex-direction: column; }
  .btn-primary, .btn-secondary { width: 100%; }
  .ad-placeholder { min-height: 430px; }
}































































































































































































































