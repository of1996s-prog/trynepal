/* =========================================================================
   Plain, safe JavaScript only: no eval(), no inline event attributes, no
   unsanitized user input. The only external calls are fetch()-ing your own
   JSON files and the official Facebook/TikTok embed scripts already
   loaded in index.html. Fully supported by GitHub Pages free hosting.

   CONTENT LIVES IN JSON (so Decap CMS can edit it):
     - content/posts.json  -> your posts (title, image, body text, date)
     - content/ads.json    -> your 4 post-ads + rotating sidebar ads (image or YouTube)
     - content/social.json -> youtube/facebook/tiktok embed links (flexible count)
   Edit those directly, or through the /admin panel once Decap CMS's
   one-time GitHub OAuth setup is done (see admin/config.yml).
========================================================================= */

/* ---- 0. Fallback content ---- */
const fallbackPosts = [
  {
    title: "Content is loading…",
    image: "",
    date: "",
    body: "If you're seeing this on the live site, content/posts.json failed to load - try a hard refresh. If you're testing locally by double-clicking index.html, that's expected: run a local server."
  }
];

const fallbackAds = {
  postAd1: "", postAd2: "", postAd3: "", postAd4: "",
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
  tiktokVideos: []
};

async function fetchJson(path, fallback) {
  try {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error("bad response");
    return await res.json();
  } catch (err) {
    console.warn(`Could not load ${path}, using built-in fallback content.`, err);
    return fallback;
  }
}

function sanitizeHtml(html) {
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
}

function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch (e) {
    return "";
  }
}

function extractYouTubeEmbedUrl(value) {
  if (!value || typeof value !== "string") return "";
  const cleaned = value.trim();
  if (!cleaned) return "";

  if (/^[A-Za-z0-9_-]{11}$/.test(cleaned)) {
    return `https://www.youtube.com/embed/${cleaned}`;
  }

  try {
    const url = new URL(cleaned);
    const hostname = url.hostname.toLowerCase();

    if (hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      const path = url.pathname || "";
      if (path.includes("/embed/")) return cleaned;
      if (path.includes("/shorts/")) {
        const id = path.split("/shorts/")[1]?.split("/")[0];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      const segments = path.split("/").filter(Boolean);
      if (segments.length >= 2 && segments[0] === "watch") {
        const id = segments[1];
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    }

    if (hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "").split("/")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch (err) {
    return "";
  }

  return "";
}

function normalizeAdObject(item, fallbackLabel) {
  if (!item) return null;

  if (typeof item === "string") {
    return {
      type: "image",
      src: item,
      title: "",
      description: "",
      label: fallbackLabel
    };
  }

  if (typeof item === "object") {
    if (item.type === "youtube") {
      return {
        type: "youtube",
        videoId: item.videoId || "",
        title: item.title || "Featured video",
        description: item.description || "",
        label: ""
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
  return `<div class="advertise-with-us">
            <p>Advertise with us</p>
            <a href="mailto:you@example.com">Contact us to place your ad here</a>
          </div>`;
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

    return `<div class="post-ad post-ad-video" id="${slotId}">
      <div class="post-ad-video-frame">
        <iframe
          src="${embedUrl}"
          title="${title}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
      <div class="post-ad-copy">
        <h4>${title}</h4>
        ${description ? `<p>${description}</p>` : ""}
      </div>
    </div>`;
  }

  return `<div class="post-ad" id="${slotId}">
    <span class="post-ad-label">${ad.label}</span>
    <img class="lazy-img" data-src="${sanitizeHtml(ad.src)}" alt="${sanitizeHtml(ad.title || "Advertisement")}">
  </div>`;
}

function attachAdErrorFallback(imgEl, containerEl) {
  imgEl.addEventListener("error", () => {
    containerEl.innerHTML = advertiseWithUsHtml();
  }, { once: true });
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

const postListEl = document.getElementById("post-list-items");
const contentEl = document.getElementById("content");

let posts = [];
let ads = fallbackAds;

function sortPostsByDate(postsArray) {
  return [...postsArray].sort((a, b) => {
    const dateA = new Date(a.date || "1970-01-01");
    const dateB = new Date(b.date || "1970-01-01");
    return dateB - dateA;
  });
}

function renderPostList() {
  postListEl.innerHTML = "";
  const sortedPosts = sortPostsByDate(posts);
  sortedPosts.forEach((post, index) => {
    const originalIndex = posts.findIndex(p => p.title === post.title);
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

    button.appendChild(num);
    button.appendChild(title);
    button.appendChild(date);
    button.addEventListener("click", () => {
      loadPost(originalIndex);
      contentEl.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    li.appendChild(button);
    postListEl.appendChild(li);
  });
}

function loadPost(index) {
  const post = posts[index];
  const paragraphs = paragraphsFromBody(post.body);
  const [part1, part2, part3] = splitIntoThirds(paragraphs);

  let html = `<article class="post-article">
    <h2>${sanitizeHtml(post.title)}</h2>
    <p class="post-date">Published: ${formatDate(post.date)}</p>`;

  if (post.image) {
    html += `<img data-src="${sanitizeHtml(post.image)}" alt="${sanitizeHtml(post.title)}" class="lazy-img">`;
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
  applyImageLoadingPreference();

  ["post-ad-slot-1", "post-ad-slot-2", "post-ad-slot-3", "post-ad-slot-4"].forEach((id) => {
    const slot = document.getElementById(id);
    const img = slot ? slot.querySelector("img") : null;
    if (img) attachAdErrorFallback(img, slot);
  });
}

const POSTS_PER_PAGE = 12;

function renderPostIndex(page) {
  const sortedPosts = sortPostsByDate(posts);
  const totalPages = Math.max(1, Math.ceil(sortedPosts.length / POSTS_PER_PAGE));
  page = Math.min(Math.max(1, page), totalPages);
  const start = (page - 1) * POSTS_PER_PAGE;
  const pagePosts = sortedPosts.slice(start, start + POSTS_PER_PAGE);

  let html = `<h2>All Posts</h2>`;
  html += `<p class="post-index-meta">Page ${page} of ${totalPages} — ${sortedPosts.length} posts total</p>`;
  html += `<div class="post-grid">`;
  pagePosts.forEach((post) => {
    const originalIndex = posts.findIndex(p => p.title === post.title);
    html += `<div class="post-card">
      <div class="post-card-image">
        ${post.image ? `<img src="${sanitizeHtml(post.image)}" alt="${sanitizeHtml(post.title)}" class="lazy-img">` : `<div class="no-image">No Image</div>`}
      </div>
      <h3>${sanitizeHtml(post.title)}</h3>
      <p class="post-card-date">${formatDate(post.date)}</p>
      <button type="button" data-post-index="${originalIndex}" class="read-more">Read More</button>
    </div>`;
  });
  html += `</div>`;

  if (totalPages > 1) {
    html += `<nav class="post-index-pagination" aria-label="Post pages">`;
    for (let p = 1; p <= totalPages; p++) {
      html += `<button type="button" data-index-page="${p}" class="${p === page ? "active" : ""}">${p}</button>`;
    }
    html += `</nav>`;
  }

  contentEl.innerHTML = html;
  contentEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

contentEl.addEventListener("click", (e) => {
  const postBtn = e.target.closest("[data-post-index]");
  if (postBtn) {
    loadPost(Number(postBtn.getAttribute("data-post-index")));
    return;
  }
  const pageBtn = e.target.closest("[data-index-page]");
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

function getSavedPreference() {
  const stored = localStorage.getItem("loadImages");
  return stored === null ? null : stored === "true";
}

function shouldLoadImagesAutomatically() {
  const manual = getSavedPreference();
  if (manual !== null) return manual;
  const conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
  if (conn && conn.effectiveType) {
    return !["slow-2g", "2g"].includes(conn.effectiveType);
  }
  return true;
}

function applyImageLoadingPreference() {
  const shouldLoad = shouldLoadImagesAutomatically();
  document.querySelectorAll("img.lazy-img[data-src]").forEach((img) => {
    if (shouldLoad) {
      if (img.getAttribute("data-src")) img.src = img.getAttribute("data-src");
      img.loading = "lazy";
    } else {
      img.removeAttribute("src");
      if (!img.alt.includes("(image hidden")) {
        img.alt += " (image hidden to save data — tap 'Load images' in the menu to view)";
      }
    }
  });
}

if (dataSaverToggle) {
  dataSaverToggle.checked = shouldLoadImagesAutomatically();
  dataSaverToggle.addEventListener("change", () => {
    localStorage.setItem("loadImages", String(dataSaverToggle.checked));
    applyImageLoadingPreference();
  });
}

window.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("banner-img");
  if (banner && !shouldLoadImagesAutomatically()) {
    banner.dataset.fullSrc = banner.src;
    banner.removeAttribute("src");
    banner.alt += " (hidden to save data)";
  }
});

const tabButtons = document.querySelectorAll(".tab-btn");
const tabPanels = document.querySelectorAll(".tab-panel");

function renderSocialGrid(platform, items) {
  const panel = document.getElementById("panel-" + platform);
  if (!panel) return;

  if (!items || items.length === 0) {
    panel.innerHTML = `<div class="no-content"><p>No ${platform} content added yet. Edit social.json to add embed links.</p></div>`;
    return;
  }

  let html = `<div class="social-grid" data-items="${items.length}">`;
  items.forEach((item, index) => {
    if (platform === "youtube") {
      const embedUrl = extractYouTubeEmbedUrl(item);
      if (!embedUrl) return;
      html += `<div class="social-item">
        <iframe 
          width="100%" 
          height="315" 
          src="${sanitizeHtml(embedUrl)}" 
          title="YouTube Video ${index + 1}"
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>`;
    } else if (platform === "facebook") {
      html += `<div class="social-item facebook-item">
        <iframe 
          src="${sanitizeHtml(item)}" 
          width="100%" 
          height="300" 
          style="border:none;overflow:hidden" 
          scrolling="no" 
          frameborder="0" 
          allowfullscreen="true" 
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
        </iframe>
      </div>`;
    } else if (platform === "tiktok") {
      html += `<div class="social-item tiktok-item">
        <a href="${sanitizeHtml(item)}" target="_blank" rel="noopener noreferrer" class="tiktok-card-small">
          <i class="fab fa-tiktok"></i>
          <span>TikTok Video ${index + 1}</span>
        </a>
      </div>`;
    }
  });
  html += `</div>`;

  panel.innerHTML = html;
}

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute("data-tab");
    tabButtons.forEach((b) => b.classList.remove("active"));
    tabPanels.forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById("panel-" + target).classList.add("active");
  });
});

const adPlaceholderEl = document.querySelector(".ad-placeholder");
let currentMainAdIndex = -1;

function showAdvertiseWithUsInSidebar() {
  if (adPlaceholderEl) adPlaceholderEl.innerHTML = advertiseWithUsHtml();
}

function renderSidebarAd(ad) {
  if (!adPlaceholderEl) return;

  if (ad.type === "youtube") {
    const videoId = ad.videoId || "";
    const title = sanitizeHtml(ad.title || "Featured video");
    const description = sanitizeHtml(ad.description || "");

    if (!videoId) {
      showAdvertiseWithUsInSidebar();
      return;
    }

    adPlaceholderEl.innerHTML = `
      <div class="main-ad-video">
        <div class="main-ad-video-frame">
          <iframe
            src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1"
            title="${title}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
        <div class="main-ad-video-copy">
          <h4>${title}</h4>
          ${description ? `<p>${description}</p>` : ""}
        </div>
      </div>
    `;
    return;
  }

  if (ad.type === "image" && ad.src) {
    adPlaceholderEl.innerHTML = `
      <img
        class="lazy-img"
        alt="${sanitizeHtml(ad.title || "Advertisement")}" 
        data-src="${sanitizeHtml(ad.src)}"
      >
    `;
    applyImageLoadingPreference();
    return;
  }

  showAdvertiseWithUsInSidebar();
}

function showMainAd(index) {
  if (!ads.mainAds || !ads.mainAds.length) {
    showAdvertiseWithUsInSidebar();
    return;
  }

  const ad = normalizeAdObject(ads.mainAds[index], "Sponsored");
  if (!ad) {
    showAdvertiseWithUsInSidebar();
    return;
  }

  if (index === currentMainAdIndex) return;
  currentMainAdIndex = index;

  renderSidebarAd(ad);
}

function updateMainAdOnScroll() {
  if (!ads.mainAds || !ads.mainAds.length) return;
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = scrollable > 0 ? window.scrollY / scrollable : 0;
  const index = Math.min(ads.mainAds.length - 1, Math.floor(scrollPercent * ads.mainAds.length));
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

const socialItems = [
  { label: "Subscribe on YouTube", url: "https://youtube.com/@yourchannel", icon: "fab fa-youtube" },
  { label: "Follow along on Facebook", url: "https://facebook.com/yourpage", icon: "fab fa-facebook" },
  { label: "Follow along on TikTok", url: "https://www.tiktok.com/@yourhandle", icon: "fab fa-tiktok" },
  { label: "Follow along on Instagram", url: "https://instagram.com/yourhandle", icon: "fab fa-instagram" },
  { label: "Follow along on X", url: "https://x.com/yourhandle", icon: "fab fa-twitter" }
];

const socialTicker = document.getElementById("social-ticker");
const socialTickerIcon = document.getElementById("social-ticker-icon");
const socialTickerText = document.getElementById("social-ticker-text");
let tickerIndex = 0;
let tickerHovered = false;
let tickerTypingComplete = false;
let tickerTimeout;

function typeTickerText(text, charIndex) {
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
  clearTimeout(tickerTimeout);
  if (tickerHovered) return;
  tickerTimeout = setTimeout(advanceTicker, 2200);
}

function advanceTicker() {
  tickerIndex = (tickerIndex + 1) % socialItems.length;
  showTickerItem();
}

function showTickerItem() {
  const item = socialItems[tickerIndex];
  socialTicker.href = item.url;
  socialTickerIcon.className = item.icon;
  clearTimeout(tickerTimeout);
  typeTickerText(item.label, 0);
}

if (socialTicker) {
  socialTicker.addEventListener("mouseenter", () => {
    tickerHovered = true;
    if (tickerTypingComplete) clearTimeout(tickerTimeout);
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

  renderHomeVideoCarousel(youtubeVideos);

  if (youtubeVideos.length > 0) {
    renderSocialGrid("youtube", youtubeVideos);
  }
  if (facebookPosts.length > 0) {
    renderSocialGrid("facebook", facebookPosts);
  }
  if (tiktokVideos.length > 0) {
    renderSocialGrid("tiktok", tiktokVideos);
  }

  const links = {
    youtube: social.youtubeChannelId ? `https://www.youtube.com/channel/${social.youtubeChannelId}` : "#",
    facebook: social.facebookUsername ? `https://facebook.com/${social.facebookUsername}` : "#",
    tiktok: social.tiktokUsername ? `https://www.tiktok.com/@${social.tiktokUsername}` : "#",
    instagram: social.instagramUsername ? `https://instagram.com/${social.instagramUsername}` : "#",
    x: social.xUsername ? `https://x.com/${social.xUsername}` : "#",
    email: social.email ? `mailto:${social.email}` : "#"
  };

  const idToLink = {
    "footer-youtube": links.youtube,
    "footer-tiktok": links.tiktok,
    "footer-instagram": links.instagram,
    "footer-facebook": links.facebook,
    "footer-x": links.x,
    "footer-email": links.email
  };

  Object.keys(idToLink).forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.href = idToLink[id];
  });

  if (socialItems.length) {
    socialItems[0].url = links.youtube;
    socialItems[1].url = links.facebook;
    socialItems[2].url = links.tiktok;
    socialItems[3].url = links.instagram;
    socialItems[4].url = links.x;
    if (socialTicker) socialTicker.href = socialItems[tickerIndex].url;
  }
}

function renderHomeVideoCarousel(videos) {
  const track = document.getElementById("carousel-track");
  const dots = document.getElementById("carousel-dots");
  const prevBtn = document.querySelector(".carousel-prev");
  const nextBtn = document.querySelector(".carousel-next");

  if (!track || !dots) return;

  const validVideos = (videos || []).map((video) => extractYouTubeEmbedUrl(video)).filter(Boolean);

  if (!validVideos.length) {
    track.innerHTML = `<div class="carousel-video-item"><iframe src="https://www.youtube.com/embed/hws97JEXYX8?rel=0&modestbranding=1" title="Featured video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;
    dots.innerHTML = `<button class="carousel-dot active" type="button" aria-label="Show slide 1"></button>`;
    return;
  }

  let currentSlide = 0;

  function renderSlide() {
    track.innerHTML = validVideos.map((video) => `
      <div class="carousel-video-item">
        <iframe src="${video}" title="Featured video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
      </div>
    `).join("");

    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    dots.innerHTML = validVideos.map((_, idx) => `
      <button class="carousel-dot ${idx === currentSlide ? "active" : ""}" type="button" aria-label="Show slide ${idx + 1}"></button>
    `).join("");

    dots.querySelectorAll(".carousel-dot").forEach((dot, idx) => {
      dot.addEventListener("click", () => {
        currentSlide = idx;
        renderSlide();
      });
    });

    if (prevBtn) prevBtn.disabled = validVideos.length <= 1;
    if (nextBtn) nextBtn.disabled = validVideos.length <= 1;
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      currentSlide = (currentSlide - 1 + validVideos.length) % validVideos.length;
      renderSlide();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      currentSlide = (currentSlide + 1) % validVideos.length;
      renderSlide();
    });
  }

  renderSlide();
}

function setupHomeButtons() {
  const explorePostsBtn = document.getElementById("explore-posts-btn");
  const exploreVideosBtn = document.getElementById("explore-videos-btn");

  if (explorePostsBtn) {
    explorePostsBtn.addEventListener("click", () => {
      renderPostIndex(1);
    });
  }

  if (exploreVideosBtn) {
    exploreVideosBtn.addEventListener("click", () => {
      const videoSection = document.getElementById("video-carousel-section");
      if (videoSection) {
        videoSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
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
  const isCompact = masthead.classList.contains("is-compact");
  if (!isCompact && window.scrollY > 70) {
    masthead.classList.add("is-compact");
  } else if (isCompact && window.scrollY < 20) {
    masthead.classList.remove("is-compact");
  }
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

updateMastheadCompact();

const navPostsLink = document.getElementById("nav-posts-link");
if (navPostsLink) {
  navPostsLink.addEventListener("click", (e) => {
    e.preventDefault();
    renderPostIndex(1);
  });
}

const navContactLink = document.getElementById("nav-contact-link");
if (navContactLink) {
  navContactLink.addEventListener("click", (e) => {
    e.preventDefault();
    const footer = document.getElementById("contact");
    if (footer) {
      footer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

document.getElementById("year").textContent = new Date().getFullYear();

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
}

init();
