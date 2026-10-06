const fallbackPosts = [{
  title: "Content is loading…",
  image: "",
  date: "",
  body: "If you're seeing this on the live site, content/posts.json failed to load. Try refreshing the page."
}];

const fallbackAds = {
  postAd1: "",
  postAd2: "",
  postAd3: "",
  postAd4: "",
  mainAds: []
};

const fallbackSocial = {
  youtubeChannelId: "",
  youtubeFeaturedVideoId: "",
  facebookUsername: "",
  tiktokUsername: "",
  instagramUsername: "",
  xUsername: "",
  email: "",
  youtubeVideos: [],
  facebookPosts: [],
  tiktokVideos: [],
  instagramReels: [],
  xPosts: []
};

const postListEl = document.getElementById("post-list-items");
const contentEl = document.getElementById("content");
const adPlaceholderEl = document.getElementById("ad-placeholder");

let posts = [];
let ads = fallbackAds;
let currentMainAdIndex = -1;

async function fetchJson(path, fallback) {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error("bad response");
    return await res.json();
  } catch (err) {
    console.warn(`Could not load ${path}; using fallback content.`, err);
    return fallback;
  }
}

function sanitizeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
}

function extractYouTubeEmbedUrl(value) {
  if (!value || typeof value !== "string") return "";
  const cleaned = value.trim();
  if (!cleaned) return "";

  if (/^[A-Za-z0-9_-]{11}$/.test(cleaned)) {
    return `https://www.youtube.com/embed/${cleaned}?rel=0&modestbranding=1`;
  }

  try {
    const url = new URL(cleaned);
    const host = url.hostname.toLowerCase();

    if (host.includes("youtube.com")) {
      const videoId = url.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;

      const path = url.pathname || "";
      if (path.includes("/embed/")) return `${cleaned.includes("?") ? cleaned : cleaned + "?rel=0&modestbranding=1"}`;
      if (path.includes("/shorts/")) {
        const id = path.split("/shorts/")[1]?.split("/")[0];
        if (id) return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
      }
      const segments = path.split("/").filter(Boolean);
      if (segments.length >= 2 && segments[0] === "watch") {
        const id = segments[1];
        if (id) return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
      }
    }

    if (host.includes("youtu.be")) {
      const rawId = url.pathname.replace("/", "").split("/")[0];
      if (rawId) return `https://www.youtube.com/embed/${rawId}?rel=0&modestbranding=1`;
    }
  } catch {
    return "";
  }

  return "";
}

function normalizeAdObject(item, fallbackLabel) {
  if (!item) return null;

  if (typeof item === "string") {
    return { type: "image", src: item, title: "", description: "", label: fallbackLabel };
  }

  if (typeof item === "object") {
    if (item.type === "youtube") {
      return {
        type: "youtube",
        videoId: item.videoId || "",
        title: item.title || "Featured video",
        description: item.description || "",
        label: "Sponsored"
      };
    }

    return {
      type: "image",
      src: item.src || item.image || "",
      title: item.title || "",
      description: item.description || "",
      label: item.label || fallbackLabel
    };
  }

  return null;
}

function advertiseWithUsHtml() {
  return `
    <div class="advertise-with-us">
      <p>Advertise with us</p>
      <a href="mailto:info@eNepal.gov.np">Contact us to place your ad here</a>
    </div>
  `;
}

function buildAdHtml(adData, slotId) {
  const ad = normalizeAdObject(adData, "Sponsored");
  if (!ad || (!ad.src && ad.type !== "youtube")) {
    return `<div class="post-ad" id="${slotId}">${advertiseWithUsHtml()}</div>`;
  }

  if (ad.type === "youtube") {
    const videoId = ad.videoId || "";
    const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : "";
    const title = sanitizeHtml(ad.title || "Featured video");
    const description = sanitizeHtml(ad.description || "");

    if (!embedUrl) {
      return `<div class="post-ad" id="${slotId}">${advertiseWithUsHtml()}</div>`;
    }

    return `
      <div class="post-ad post-ad-video" id="${slotId}">
        <div class="post-ad-video-frame">
          <iframe src="${embedUrl}" title="${title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
        <div class="post-ad-copy">
          <h4>${title}</h4>
          ${description ? `<p>${description}</p>` : ""}
        </div>
      </div>
    `;
  }

  return `
    <div class="post-ad" id="${slotId}">
      <span class="post-ad-label">${sanitizeHtml(ad.label || "Sponsored")}</span>
      <img src="${sanitizeHtml(ad.src)}" alt="${sanitizeHtml(ad.title || "Advertisement")}">
    </div>
  `;
}

function splitIntoThirds(arr) {
  const size = Math.ceil(arr.length / 3) || 1;
  return [arr.slice(0, size), arr.slice(size, size * 2), arr.slice(size * 2)];
}

function paragraphsFromBody(body) {
  return (body || "")
    .split(/\n\s*\n/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => `<p>${chunk}</p>`);
}

function sortPostsByDate(postsArray) {
  return [...postsArray].sort((a, b) => {
    const dateA = new Date(a.date || "1970-01-01");
    const dateB = new Date(b.date || "1970-01-01");
    return dateB - dateA;
  });
}

function renderPostList() {
  if (!postListEl) return;
  postListEl.innerHTML = "";

  const sorted = sortPostsByDate(posts);
  sorted.forEach((post, index) => {
    const originalIndex = posts.findIndex((item) => item.title === post.title && item.date === post.date);
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";

    const num = document.createElement("span");
    num.className = "num";
    num.textContent = String(index + 1).padStart(2, "0");

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = post.title;

    const date = document.createElement("span");
    date.className = "date";
    date.textContent = formatDate(post.date);

    button.append(num, title, date);
    button.addEventListener("click", () => {
      loadPost(originalIndex);
      if (contentEl) contentEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    li.appendChild(button);
    postListEl.appendChild(li);
  });
}

function loadPost(index) {
  const post = posts[index];
  if (!post) return;

  const paragraphs = paragraphsFromBody(post.body);
  const [part1, part2, part3] = splitIntoThirds(paragraphs);

  let html = `
    <article class="post-article">
      <h2>${sanitizeHtml(post.title)}</h2>
      <span class="post-date">Published: ${formatDate(post.date)}</span>
  `;

  if (post.image) {
    html += `<img src="${sanitizeHtml(post.image)}" alt="${sanitizeHtml(post.title)}">`;
  }

  html += buildAdHtml(ads.postAd1, "post-ad-slot-1");
  html += part1.join("");
  html += buildAdHtml(ads.postAd2, "post-ad-slot-2");
  html += part2.join("");
  html += buildAdHtml(ads.postAd3, "post-ad-slot-3");
  html += part3.join("");
  html += buildAdHtml(ads.postAd4, "post-ad-slot-4");
  html += `</article>`;

  contentEl.innerHTML = html;
}

function renderPostIndex(page = 1) {
  const sortedPosts = sortPostsByDate(posts);
  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / 12));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * 12;
  const pagePosts = sortedPosts.slice(start, start + 12);

  let html = `<h2>All Posts</h2>`;
  html += `<span class="post-index-meta">Page ${safePage} of ${totalPages} — ${sortedPosts.length} posts total</span>`;
  html += `<div class="post-grid">`;

  pagePosts.forEach((post) => {
    const originalIndex = posts.findIndex((item) => item.title === post.title && item.date === post.date);
    html += `
      <div class="post-card">
        <div class="post-card-image">
          ${post.image ? `<img src="${sanitizeHtml(post.image)}" alt="${sanitizeHtml(post.title)}">` : "<div class='no-image'>No image</div>"}
        </div>
        <h3>${sanitizeHtml(post.title)}</h3>
        <p class="post-card-date">${formatDate(post.date)}</p>
        <button type="button" class="read-more" data-post-index="${originalIndex}">Read More</button>
      </div>
    `;
  });

  html += `</div>`;

  if (totalPages > 1) {
    html += `<nav class="post-index-pagination" aria-label="Post pages">`;
    for (let p = 1; p <= totalPages; p++) {
      html += `<button type="button" data-index-page="${p}" class="${p === safePage ? "active" : ""}">${p}</button>`;
    }
    html += `</nav>`;
  }

  contentEl.innerHTML = html;
  contentEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

contentEl.addEventListener("click", (event) => {
  const postBtn = event.target.closest("[data-post-index]");
  if (postBtn) {
    loadPost(Number(postBtn.getAttribute("data-post-index")));
    return;
  }

  const pageBtn = event.target.closest("[data-index-page]");
  if (pageBtn) {
    renderPostIndex(Number(pageBtn.getAttribute("data-index-page")));
  }
});

const seeMoreBtn = document.getElementById("see-more-posts");
if (seeMoreBtn) {
  seeMoreBtn.addEventListener("click", () => renderPostIndex(1));
}

const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const dataSaverToggle = document.getElementById("data-saver-toggle");
function shouldLoadImagesAutomatically() {
  const saved = localStorage.getItem("loadImages");
  if (saved !== null) return saved === "true";
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn && conn.effectiveType) {
    return !["slow-2g", "2g"].includes(conn.effectiveType);
  }
  return true;
}

if (dataSaverToggle) {
  dataSaverToggle.checked = shouldLoadImagesAutomatically();
  dataSaverToggle.addEventListener("change", () => {
    localStorage.setItem("loadImages", String(dataSaverToggle.checked));
    document.querySelectorAll("img[data-src]").forEach((img) => {
      if (dataSaverToggle.checked) {
        img.src = img.dataset.src;
      } else {
        img.removeAttribute("src");
      }
    });
  });
}

function renderSocialGrid(platform, items) {
  const panel = document.getElementById("panel-" + platform);
  if (!panel) return;

  if (!items || items.length === 0) {
    panel.innerHTML = `<div class="no-content"><p>No ${platform} content added yet.</p></div>`;
    return;
  }

  let html = `<div class="social-grid">`;

  items.forEach((item, index) => {
    if (platform === "youtube") {
      const embedUrl = extractYouTubeEmbedUrl(item);
      if (!embedUrl) return;
      html += `
        <div class="social-item yt-item">
          <iframe src="${embedUrl}" title="YouTube video ${index + 1}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
      `;
    } else if (platform === "facebook") {
      const profileUrl = item && typeof item === "string" ? item : "https://www.facebook.com/";
      const encoded = encodeURIComponent(profileUrl);
      html += `
        <div class="social-item facebook-item">
          <iframe src="https://www.facebook.com/plugins/page.php?href=${encoded}&tabs=timeline&width=500&height=500&small_header=true&adapt_container_width=true&hide_cover=true&show_facepile=false" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"></iframe>
        </div>
      `;
    } else if (platform === "tiktok") {
      html += `
        <div class="social-item tiktok-item">
          <a href="${sanitizeHtml(item || "#")}" class="social-card" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-tiktok"></i>
            <strong>TikTok Reel ${index + 1}</strong>
            <span>Open reel</span>
          </a>
        </div>
      `;
    } else if (platform === "instagram") {
      html += `
        <div class="social-item instagram-item">
          <a href="${sanitizeHtml(item || "#")}" class="social-card" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-instagram"></i>
            <strong>Instagram Reel ${index + 1}</strong>
            <span>Open reel</span>
          </a>
        </div>
      `;
    } else if (platform === "x") {
      html += `
        <div class="social-item x-item">
          <a href="${sanitizeHtml(item || "#")}" class="social-card" target="_blank" rel="noopener noreferrer">
            <i class="fab fa-x-twitter"></i>
            <strong>X Post ${index + 1}</strong>
            <span>Open post</span>
          </a>
        </div>
      `;
    }
  });

  html += `</div>`;
  panel.innerHTML = html;
}

const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-tab");
    tabButtons.forEach((b) => b.classList.remove("active"));
    tabPanels.forEach((panel) => panel.classList.remove("active"));
    btn.classList.add("active");
    const panel = document.getElementById("panel-" + target);
    if (panel) panel.classList.add("active");
  });
});

function renderSidebarAd(ad) {
  if (!adPlaceholderEl) return;

  adPlaceholderEl.classList.remove("is-visible");

  setTimeout(() => {
    adPlaceholderEl.innerHTML = `<div class="ad-placeholder-inner"></div>`;
    const inner = adPlaceholderEl.querySelector(".ad-placeholder-inner");
    if (!inner) return;

    if (ad.type === "youtube") {
      const videoId = ad.videoId || "";
      const title = sanitizeHtml(ad.title || "Featured video");
      const description = sanitizeHtml(ad.description || "");

      if (!videoId) {
        inner.innerHTML = advertiseWithUsHtml();
      } else {
        inner.innerHTML = `
          <div class="main-ad-video">
            <iframe src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1" title="${title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            <div class="ad-placeholder-copy">
              <h4>${title}</h4>
              ${description ? `<p>${description}</p>` : ""}
            </div>
          </div>
        `;
      }
    } else if (ad.type === "image" && ad.src) {
      inner.innerHTML = `<img src="${sanitizeHtml(ad.src)}" alt="${sanitizeHtml(ad.title || "Advertisement")}">`;
    } else {
      inner.innerHTML = advertiseWithUsHtml();
    }

    requestAnimationFrame(() => {
      adPlaceholderEl.classList.add("is-visible");
    });
  }, 100);
}

function showMainAd(index) {
  if (!ads.mainAds || !ads.mainAds.length) {
    if (adPlaceholderEl) {
      adPlaceholderEl.innerHTML = `<div class="ad-placeholder-inner">${advertiseWithUsHtml()}</div>`;
      adPlaceholderEl.classList.add("is-visible");
    }
    return;
  }

  const safeIndex = ((index % ads.mainAds.length) + ads.mainAds.length) % ads.mainAds.length;
  const ad = normalizeAdObject(ads.mainAds[safeIndex], "Sponsored");
  if (!ad) return;

  if (safeIndex === currentMainAdIndex) return;
  currentMainAdIndex = safeIndex;
  renderSidebarAd(ad);
}

function updateMainAdOnScroll() {
  if (!ads.mainAds || !ads.mainAds.length) return;
  const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
  const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
  const index = Math.min(ads.mainAds.length - 1, Math.floor(progress * ads.mainAds.length));
  showMainAd(index);
}

let scrollTicking = false;
window.addEventListener("scroll", () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      updateMainAdOnScroll();
      scrollTicking = false;
    });
    scrollTicking = true;
  }
});

const socialTicker = document.getElementById("social-ticker");
const socialTickerIcon = document.getElementById("social-ticker-icon");
const socialTickerText = document.getElementById("social-ticker-text");
let tickerIndex = 0;
let tickerHovered = false;
let tickerTypingComplete = false;
let tickerTimeout = null;

const socialItems = [
  { label: "Subscribe on YouTube", url: "https://youtube.com/", icon: "fab fa-youtube" },
  { label: "Follow on Facebook", url: "https://facebook.com/", icon: "fab fa-facebook" },
  { label: "Follow on TikTok", url: "https://www.tiktok.com/", icon: "fab fa-tiktok" },
  { label: "Follow on Instagram", url: "https://instagram.com/", icon: "fab fa-instagram" },
  { label: "Follow on X", url: "https://x.com/", icon: "fab fa-twitter" }
];

function typeTickerText(text, charIndex) {
  if (!socialTickerText) return;
  socialTickerText.textContent = text.slice(0, charIndex);
  if (charIndex <= text.length) {
    tickerTypingComplete = false;
    tickerTimeout = setTimeout(() => typeTickerText(text, charIndex + 1), 55);
  } else {
    tickerTypingComplete = true;
    scheduleAdvance();
  }
}

function scheduleAdvance() {
  if (tickerTimeout) clearTimeout(tickerTimeout);
  if (tickerHovered) return;
  tickerTimeout = setTimeout(advanceTicker, 2200);
}

function advanceTicker() {
  tickerIndex = (tickerIndex + 1) % socialItems.length;
  showTickerItem();
}

function showTickerItem() {
  const item = socialItems[tickerIndex];
  if (!item || !socialTicker) return;

  socialTicker.href = item.url;
  if (socialTickerIcon) socialTickerIcon.className = item.icon;
  if (tickerTimeout) clearTimeout(tickerTimeout);
  typeTickerText(item.label, 0);
}

if (socialTicker) {
  socialTicker.addEventListener("mouseenter", () => {
    tickerHovered = true;
    if (tickerTypingComplete && tickerTimeout) clearTimeout(tickerTimeout);
  });

  socialTicker.addEventListener("mouseleave", () => {
    tickerHovered = false;
    if (tickerTypingComplete) scheduleAdvance();
  });

  showTickerItem();
}

function applySocialConfig(social) {
  const featuredYoutube = document.getElementById("featured-youtube-iframe");
  if (featuredYoutube && social.youtubeFeaturedVideoId) {
    const embedUrl = extractYouTubeEmbedUrl(social.youtubeFeaturedVideoId);
    if (embedUrl) featuredYoutube.src = embedUrl;
  }

  const featuredFb = document.getElementById("featured-fb-page");
  if (featuredFb && social.facebookUsername) {
    featuredFb.setAttribute("data-href", `https://www.facebook.com/${social.facebookUsername}`);
  }

  const youtubeVideos = social.youtubeVideos || [];
  const facebookPosts = social.facebookPosts || [];
  const tiktokVideos = social.tiktokVideos || [];
  const instagramReels = social.instagramReels || [];
  const xPosts = social.xPosts || [];

  renderInfiniteVideos(youtubeVideos);
  renderSocialGrid("youtube", youtubeVideos);
  renderSocialGrid("facebook", facebookPosts);
  renderSocialGrid("tiktok", tiktokVideos);
  renderSocialGrid("instagram", instagramReels);
  renderSocialGrid("x", xPosts);

  const links = {
    youtube: social.youtubeChannelId ? `https://www.youtube.com/@${social.youtubeChannelId}` : "https://www.youtube.com/",
    facebook: social.facebookUsername ? `https://www.facebook.com/${social.facebookUsername}` : "https://www.facebook.com/",
    tiktok: social.tiktokUsername ? `https://www.tiktok.com/@${social.tiktokUsername}` : "https://www.tiktok.com/",
    instagram: social.instagramUsername ? `https://www.instagram.com/${social.instagramUsername}/` : "https://www.instagram.com/",
    x: social.xUsername ? `https://x.com/${social.xUsername}` : "https://x.com/",
    email: social.email ? `mailto:${social.email}` : "#"
  };

  const footerLinks = {
    "footer-youtube": links.youtube,
    "footer-tiktok": links.tiktok,
    "footer-instagram": links.instagram,
    "footer-facebook": links.facebook,
    "footer-x": links.x,
    "footer-email": links.email
  };

  Object.entries(footerLinks).forEach(([id, href]) => {
    const el = document.getElementById(id);
    if (el) el.href = href;
  });

  socialItems[0].url = links.youtube;
  socialItems[1].url = links.facebook;
  socialItems[2].url = links.tiktok;
  socialItems[3].url = links.instagram;
  socialItems[4].url = links.x;

  if (socialTicker) socialTicker.href = socialItems[tickerIndex].url;
}

function renderInfiniteVideos(videos) {
  const feed = document.getElementById("video-feed-container");
  if (!feed) return;

  const validVideos = (videos || []).map((video) => extractYouTubeEmbedUrl(video)).filter(Boolean);
  if (!validVideos.length) {
    feed.innerHTML = `
      <article class="video-feed-item">
        <iframe src="https://www.youtube.com/embed/M7lc1UVf-VE?rel=0&modestbranding=1" title="Fallback video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        <div class="video-feed-copy">
          <span class="video-label">Featured</span>
          <h4>Herne Katha</h4>
          <p>New channel video will appear here when available.</p>
        </div>
      </article>
    `;
    return;
  }

  const items = validVideos.map((embedUrl, index) => `
    <article class="video-feed-item" data-video-index="${index}">
      <iframe src="${embedUrl}" title="Video ${index + 1}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      <div class="video-feed-copy">
        <span class="video-label">Featured</span>
        <h4>Video ${index + 1}</h4>
        <p>Curated from your YouTube channel.</p>
      </div>
    </article>
  `).join("");

  feed.innerHTML = items;
}

function setupHomeButtons() {
  const explorePostsBtn = document.getElementById("explore-posts-btn");
  const exploreVideosBtn = document.getElementById("explore-videos-btn");

  if (explorePostsBtn) {
    explorePostsBtn.addEventListener("click", () => renderPostIndex(1));
  }

  if (exploreVideosBtn) {
    exploreVideosBtn.addEventListener("click", () => {
      document.getElementById("video-feed-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}

function injectEmbedScripts() {
  const fbScript = document.createElement("script");
  fbScript.async = true;
  fbScript.defer = true;
  fbScript.crossOrigin = "anonymous";
  fbScript.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0";
  document.body.appendChild(fbScript);
}

const masthead = document.querySelector(".masthead");
function updateMastheadCompact() {
  if (!masthead) return;
  if (window.scrollY > 70) masthead.classList.add("is-compact");
  else masthead.classList.remove("is-compact");
}

let mastheadTicking = false;
window.addEventListener("scroll", () => {
  if (!mastheadTicking) {
    requestAnimationFrame(() => {
      updateMastheadCompact();
      mastheadTicking = false;
    });
    mastheadTicking = true;
  }
});

if (document.getElementById("year")) {
  document.getElementById("year").textContent = new Date().getFullYear();
}

const navPostsLink = document.getElementById("nav-posts-link");
if (navPostsLink) {
  navPostsLink.addEventListener("click", (event) => {
    event.preventDefault();
    renderPostIndex(1);
  });
}

const navContactLink = document.getElementById("nav-contact-link");
if (navContactLink) {
  navContactLink.addEventListener("click", (event) => {
    event.preventDefault();
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

async function init() {
  const [postsData, adsData, socialData] = await Promise.all([
    fetchJson("content/posts.json", { posts: fallbackPosts }),
    fetchJson("content/ads.json", fallbackAds),
    fetchJson("content/social.json", fallbackSocial)
  ]);

  posts = postsData.posts || fallbackPosts;
  ads = adsData || fallbackAds;

  renderPostList();
  setupHomeButtons();
  showMainAd(0);
  applySocialConfig(socialData || fallbackSocial);
  injectEmbedScripts();
  updateMastheadCompact();
}

init();
