// ============================================================
// ICÔNES — injecte les SVG dans tous les éléments [data-icon]
// ============================================================
function renderIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    const name = el.dataset.icon;
    const size = el.dataset.iconSize || 20;
    el.innerHTML = icon(name, size);
  });
}

// ============================================================
// NAVIGATION
// ============================================================
const header = document.getElementById('siteHeader');
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
});

menuToggle.addEventListener('click', () => {
  menuToggle.classList.toggle('open');
  mainNav.classList.toggle('open');
});

mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle.classList.remove('open');
    mainNav.classList.remove('open');
  });
});

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.main-nav a');
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  },
  { rootMargin: '-40% 0px -50% 0px' }
);
sections.forEach((s) => sectionObserver.observe(s));

document.getElementById('footerYear').textContent = new Date().getFullYear();

// ============================================================
// DÉTAIL MODAL GÉNÉRIQUE (prochain match, actu complète...)
// ============================================================
const detailModal = document.getElementById('detailModal');
const detailModalTitle = document.getElementById('detailModalTitle');
const detailModalBody = document.getElementById('detailModalBody');

function openDetailModal(title, html) {
  detailModalTitle.textContent = title;
  detailModalBody.innerHTML = html;
  detailModal.classList.add('open');
  renderIcons(detailModal);
}
document.getElementById('detailModalClose').addEventListener('click', closeDetailModal);
detailModal.addEventListener('click', (e) => {
  if (e.target.id === 'detailModal') closeDetailModal();
});
function closeDetailModal() {
  detailModal.classList.remove('open');
  detailModalBody.innerHTML = '';
}

// ============================================================
// HERO INTRO
// ============================================================
let heroSlideIndex = 0;

async function loadHero() {
  const slidesContainer = document.getElementById('heroSlides');
  const controlsContainer = document.getElementById('heroControls');
  const muteBtn = document.getElementById('heroMuteBtn');

  try {
    const heroes = await apiGet('/hero');
    if (!heroes.length) {
      slidesContainer.innerHTML = `<div class="empty-state" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;">Aucun visuel ajouté pour le moment.</div>`;
      return;
    }

    slidesContainer.innerHTML = heroes
      .map(
        (h, i) => `
      <div class="hero-slide ${i === 0 ? 'active' : ''}" data-index="${i}">
        ${
          h.type === 'video'
            ? `<video class="hero-slide-media" src="${h.mediaUrl}" autoplay muted loop playsinline></video>`
            : `<img class="hero-slide-media" src="${h.mediaUrl}" alt="${h.title || 'Ange Lago'}">`
        }
        <div class="hero-slide-content">
          ${h.title ? `<h1 class="hero-slide-title">${h.title}</h1>` : ''}
          ${h.subtitle ? `<p class="hero-slide-subtitle">${h.subtitle}</p>` : ''}
        </div>
      </div>`
      )
      .join('');

    if (heroes.length > 1) {
      controlsContainer.innerHTML = heroes
        .map((_, i) => `<button class="hero-dot ${i === 0 ? 'active' : ''}" data-index="${i}" aria-label="Slide ${i + 1}"></button>`)
        .join('');
      controlsContainer.querySelectorAll('.hero-dot').forEach((dot) => {
        dot.addEventListener('click', () => showHeroSlide(parseInt(dot.dataset.index)));
      });
      setInterval(() => showHeroSlide((heroSlideIndex + 1) % heroes.length), 6000);
    }

    const hasVideo = heroes.some((h) => h.type === 'video');
    if (hasVideo) {
      muteBtn.hidden = false;
      muteBtn.dataset.icon = 'video';
      renderIcons(muteBtn.parentElement);
      muteBtn.addEventListener('click', () => {
        const videos = slidesContainer.querySelectorAll('video');
        const muted = videos[0]?.muted;
        videos.forEach((v) => (v.muted = !muted));
      });
    }
  } catch (err) {
    slidesContainer.innerHTML = `<div class="empty-state" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;">Impossible de charger les visuels.</div>`;
  }
}

function showHeroSlide(index) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  slides.forEach((s) => s.classList.remove('active'));
  dots.forEach((d) => d.classList.remove('active'));
  slides[index]?.classList.add('active');
  dots[index]?.classList.add('active');
  heroSlideIndex = index;
}

// ============================================================
// PROFIL + ABOUT
// ============================================================
let profileCache = null;

async function loadProfile() {
  try {
    const p = await apiGet('/profile');
    profileCache = p;

    // About
    const aboutBio = document.getElementById('aboutBio');
    if (aboutBio) aboutBio.textContent = p.bio || 'Biographie à venir.';

    if (p.profileImageUrl) {
      const img = document.getElementById('aboutPhoto');
      if (img) {
        img.src = p.profileImageUrl;
        img.style.display = 'block';
        document.getElementById('aboutPhotoPlaceholder')?.style.setProperty('display', 'none');
      }
    }

    // Footer réseaux sociaux
    const footerSocials = document.getElementById('footerSocials');
    if (footerSocials) {
      const socialsHtml = [];
      if (p.instagramUrl) {
        socialsHtml.push(`<a class="footer-social-link ${p.hasActiveStory ? 'has-story' : ''}" href="${p.instagramUrl}" target="_blank" rel="noopener" aria-label="Instagram" data-icon="instagram"></a>`);
      }
      if (p.youtubeUrl) {
        socialsHtml.push(`<a class="footer-social-link" href="${p.youtubeUrl}" target="_blank" rel="noopener" aria-label="YouTube" data-icon="youtube"></a>`);
      }
      if (p.facebookUrl) {
        socialsHtml.push(`<a class="footer-social-link" href="${p.facebookUrl}" target="_blank" rel="noopener" aria-label="Facebook" data-icon="facebook"></a>`);
      }
      footerSocials.innerHTML = socialsHtml.join('');
      renderIcons(footerSocials);
    }

    const footerContact = document.getElementById('footerContact');
    if (footerContact) {
      const footerContactItems = [];
      if (p.club && p.clubUrl) {
        footerContactItems.push(`<a class="footer-contact-item" href="${p.clubUrl}" target="_blank" rel="noopener"><span class="icon-wrap" data-icon="externalLink"></span><span>${p.club}</span></a>`);
      }
      if (p.agentName) {
        footerContactItems.push(`<div class="footer-contact-item"><span class="icon-wrap" data-icon="user"></span><span>${p.agentName}</span></div>`);
      }
      if (p.agentEmail) {
        footerContactItems.push(`<a class="footer-contact-item" href="mailto:${p.agentEmail}"><span class="icon-wrap" data-icon="mail"></span><span>${p.agentEmail}</span></a>`);
      }
      if (p.agentPhone) {
        footerContactItems.push(`<a class="footer-contact-item" href="tel:${p.agentPhone}"><span class="icon-wrap" data-icon="phone"></span><span>${p.agentPhone}</span></a>`);
      }
      footerContact.innerHTML = footerContactItems.length ? footerContactItems.join('') : '<div class="footer-contact-empty">Coordonnées à venir.</div>';
      renderIcons(footerContact);
    }

    const contactHero = document.getElementById('contactHero');
    const contactHeroTitle = document.getElementById('contactHeroTitle');
    const contactHeroSubtitle = document.getElementById('contactHeroSubtitle');
    const openContactModalBtn = document.getElementById('openContactModalBtn');
    if (contactHero) {
      contactHero.style.setProperty('--contact-hero-image', p.contactHeroImageUrl ? `url("${p.contactHeroImageUrl}")` : 'linear-gradient(135deg, var(--color-blue-dark), var(--color-blue))');
    }
    if (contactHeroTitle) contactHeroTitle.textContent = p.contactHeroTitle || 'Contacter Ange Lago';
    if (contactHeroSubtitle) contactHeroSubtitle.textContent = p.contactHeroSubtitle || 'Pour une demande professionnelle, un sponsoring ou toute autre question.';
    if (openContactModalBtn) openContactModalBtn.textContent = p.contactHeroButtonLabel || 'Contacter';

    // Agent
    const agentLinks = document.getElementById('agentLinks');
    if (agentLinks) {
      const rows = [];
      if (p.agentName) rows.push(`<div class="agent-link-row"><span class="icon-wrap" data-icon="user"></span><div><div class="agent-link-name">Agent</div><div class="agent-link-value">${p.agentName}</div></div></div>`);
      if (p.agentEmail) rows.push(`<a class="agent-link-row" href="mailto:${p.agentEmail}"><span class="icon-wrap" data-icon="mail"></span><div><div class="agent-link-name">Email</div><div class="agent-link-value">${p.agentEmail}</div></div></a>`);
      if (p.agentPhone) rows.push(`<a class="agent-link-row" href="tel:${p.agentPhone}"><span class="icon-wrap" data-icon="phone"></span><div><div class="agent-link-name">Téléphone</div><div class="agent-link-value">${p.agentPhone}</div></div></a>`);
      if (p.agentInstagramUrl) rows.push(`<a class="agent-link-row" href="${p.agentInstagramUrl}" target="_blank" rel="noopener"><span class="icon-wrap" data-icon="instagram"></span><div><div class="agent-link-name">Instagram</div><div class="agent-link-value">Voir le profil</div></div></a>`);
      if (p.agentFacebookUrl) rows.push(`<a class="agent-link-row" href="${p.agentFacebookUrl}" target="_blank" rel="noopener"><span class="icon-wrap" data-icon="facebook"></span><div><div class="agent-link-name">Facebook</div><div class="agent-link-value">Voir le profil</div></div></a>`);
      agentLinks.innerHTML = rows.length ? rows.join('') : '<div class="empty-state">Coordonnées à venir.</div>';
      renderIcons(agentLinks);
    }

    // Affiliations (club + éventuels autres badges)
    await loadFooterAffiliations(p);
  } catch (err) {
    console.error(err);
  }
}

async function loadFooterAffiliations(profile) {
  const container = document.getElementById('footerAffiliations');
  const items = [];

  if (profile.club && profile.clubUrl) {
    items.push(`
      <a class="footer-affiliation-link" href="${profile.clubUrl}" target="_blank" rel="noopener">
        ${profile.clubLogoUrl ? `<img src="${profile.clubLogoUrl}" alt="${profile.club}">` : ''}
        <span>${profile.club}</span>
      </a>`);
  }

  try {
    const affiliations = await apiGet('/affiliations');
    affiliations.forEach((a) => {
      items.push(`
        <a class="footer-affiliation-link" href="${a.url || '#'}" target="_blank" rel="noopener">
          <img src="${a.logoUrl}" alt="${a.name}">
          <span>${a.name}</span>
        </a>`);
    });
  } catch (err) {
    console.error(err);
  }

  container.innerHTML = items.join('');
}

// ============================================================
// PROCHAIN MATCH
// ============================================================
async function loadNextMatch() {
  const container = document.getElementById('nextMatchContent');
  try {
    const matches = await apiGet('/matches');
    if (!matches.length) return;

    const m = matches[0];
    const starterHtml =
      m.isLagoStarter === true
        ? `<span class="starter-badge yes">✓ Titulaire probable</span>`
        : m.isLagoStarter === false
        ? `<span class="starter-badge no">Remplaçant probable</span>`
        : `<span class="starter-badge unknown">Composition à venir</span>`;

    const section = document.getElementById('next-match');
    if (m.backgroundImageUrl) {
      section.style.background = `linear-gradient(135deg, rgba(11,30,61,0.85), rgba(11,30,61,0.75)), url('${m.backgroundImageUrl}') center/cover no-repeat`;
      section.style.backgroundAttachment = 'scroll';
    } else {
      section.style.background = 'linear-gradient(135deg, var(--color-blue-dark), var(--color-blue))';
      section.style.backgroundAttachment = 'scroll';
    }

    container.innerHTML = `
      <div class="next-match-card">
        ${m.opponentLogoUrl ? `<img class="next-match-logo" src="${m.opponentLogoUrl}" alt="${m.opponent}">` : ''}
        <div>
          <div class="next-match-eyebrow">${m.competition || 'PROCHAIN MATCH'}</div>
          <div class="next-match-teams">OM vs ${m.opponent}</div>
          <div class="next-match-meta">${formatDate(m.date)} ${m.venue ? '· ' + m.venue : ''}</div>
        </div>
        <div class="next-match-cta">
          Voir le détail <span data-icon="chevronRight"></span>
        </div>
      </div>
    `;

    container.querySelector('.next-match-card').addEventListener('click', () => {
      openDetailModal(
        `OM vs ${m.opponent}`,
        `
        <p style="color:var(--color-text-muted);margin-bottom:10px;">${m.competition || ''} — ${formatDate(m.date)} ${m.venue ? '· ' + m.venue : ''}</p>
        ${starterHtml}
        ${m.lineupNotes ? `<div class="match-detail-notes">${m.lineupNotes}</div>` : ''}
      `
      );
    });

    renderIcons(container);
  } catch (err) {
    console.error(err);
  }
}

// ============================================================
// STATS
// ============================================================
async function loadStats() {
  try {
    const season = await apiGet('/stats/season');
    const statsHero = document.getElementById('statsHero');
    const statsModalTitle = document.getElementById('statsModalTitle');
    statsHero.style.setProperty('--stats-hero-image', season.backgroundImageUrl ? `url("${season.backgroundImageUrl}")` : 'linear-gradient(135deg, var(--color-blue-dark), var(--color-blue))');
    document.getElementById('statsSeasonLabel').textContent = `SAISON ${season.season || ''}`;
    if (statsModalTitle) statsModalTitle.textContent = `Saison ${season.season || 'en cours'}`;
    document.getElementById('statsHeroTitle').textContent = `Saison ${season.season || 'en cours'}`;
    document.getElementById('statsHeroSubtitle').textContent = 'Découvrez les performances, le rythme de jeu et les derniers matchs de la saison.';
    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-box"><div class="stat-box-value">${season.matchesPlayed ?? 0}</div><div class="stat-box-label">Matchs</div></div>
      <div class="stat-box"><div class="stat-box-value">${season.goals ?? 0}</div><div class="stat-box-label">Buts</div></div>
      <div class="stat-box"><div class="stat-box-value">${season.assists ?? 0}</div><div class="stat-box-label">Passes déc.</div></div>
      <div class="stat-box"><div class="stat-box-value">${season.distanceKm ?? 0} km</div><div class="stat-box-label">Endurance</div></div>
    `;

    const matches = await apiGet('/stats/matches');
    const matchList = document.getElementById('matchList');
    if (!matches.length) { matchList.innerHTML = '<div class="empty-state">Aucun match renseigné pour le moment.</div>'; return; }
    matchList.innerHTML = matches
      .slice(0, 8)
      .map(
        (m) => `
      <div class="match-row">
        <div class="match-date">${formatDate(m.date)}</div>
        <div>
          <div class="match-opponent">vs ${m.opponent} ${m.result ? `(${m.result})` : ''}</div>
          <div class="match-competition">${m.competition || ''}</div>
        </div>
        <div class="match-badges">
          ${m.goals ? `<span class="match-badge goals">⚽ ${m.goals}</span>` : ''}
          ${m.assists ? `<span class="match-badge assists">🎯 ${m.assists}</span>` : ''}
          ${m.yellowCard ? `<span class="match-badge yellow">🟨</span>` : ''}
          ${m.redCard ? `<span class="match-badge red">🟥</span>` : ''}
        </div>
        <div class="match-competition">${m.minutesPlayed || 0}'</div>
      </div>`
      )
      .join('');
  } catch (err) {
    console.error(err);
  }
}

// ============================================================
// ACTUALITÉS — mosaïque
// ============================================================
async function loadNews() {
  const layout = document.getElementById('newsHeroLayout');
  try {
    const news = await apiGet('/news');
    if (!news.length) {
      layout.innerHTML = '<div class="empty-state">Aucune actualité pour le moment.</div>';
      return;
    }

    const [featured, ...rest] = news;
    const mosaicItems = rest.slice(0, 4);

    layout.innerHTML = `
      <article class="news-featured" data-id="${featured._id}">
        ${featured.imageUrl ? `<img class="news-featured-image" src="${featured.imageUrl}" alt="${featured.title}">` : ''}
        <div class="news-featured-body">
          <span class="news-card-category">${featured.category || 'Actu'}</span>
          <span class="news-card-date"> · ${formatDate(featured.date)}</span>
          <h3 class="news-card-title">${featured.title}</h3>
          <p class="news-card-excerpt">${featured.excerpt || ''}</p>
        </div>
      </article>
      <div class="news-mosaic">
        ${mosaicItems
          .map(
            (n) => `
          <div class="news-mosaic-item" data-id="${n._id}">
            ${n.imageUrl ? `<img src="${n.imageUrl}" alt="${n.title}">` : ''}
            <div class="news-mosaic-caption">${n.title}</div>
          </div>`
          )
          .join('')}
      </div>
    `;

    const allNews = [featured, ...mosaicItems];
    layout.querySelectorAll('[data-id]').forEach((el) => {
      el.addEventListener('click', () => {
        const item = allNews.find((n) => n._id === el.dataset.id);
        if (!item) return;
        openDetailModal(
          item.title,
          `
          <p style="color:var(--color-text-muted);font-size:0.85rem;margin-bottom:10px;">${item.category || ''} · ${formatDate(item.date)}</p>
          ${item.imageUrl ? `<img src="${item.imageUrl}" style="width:100%;border-radius:8px;margin-bottom:14px;">` : ''}
          <p style="line-height:1.7;">${item.content || item.excerpt || ''}</p>
        `
        );
      });
    });
  } catch (err) {
    layout.innerHTML = '<div class="empty-state">Impossible de charger les actualités.</div>';
  }
}

// ============================================================
// PARCOURS
// ============================================================
async function loadCareer() {
  const container = document.getElementById('timelineList');
  try {
    const steps = await apiGet('/career');
    if (!steps.length) { container.innerHTML = '<div class="empty-state">Parcours à venir.</div>'; return; }
    container.innerHTML = steps
      .map(
        (s) => `
      <div class="timeline-item">
        <div class="timeline-year">${s.year}</div>
        <h3 class="timeline-title">${s.title}</h3>
        <p class="timeline-desc">${s.description || ''}</p>
        ${s.imageUrl ? `<img class="timeline-image" src="${s.imageUrl}" alt="${s.title}">` : ''}
      </div>`
      )
      .join('');
  } catch (err) {
    container.innerHTML = '<div class="empty-state">Impossible de charger le parcours.</div>';
  }
}

// ============================================================
// PALMARÈS
// ============================================================
async function loadTrophies() {
  const grid = document.getElementById('trophyGrid');
  try {
    const trophies = await apiGet('/trophies');
    if (!trophies.length) { grid.innerHTML = '<div class="empty-state">Palmarès à venir.</div>'; return; }
    grid.innerHTML = trophies
      .map(
        (t) => `
      <div class="trophy-card">
        ${t.imageUrl ? `<img class="trophy-icon" src="${t.imageUrl}" alt="">` : '<div class="trophy-icon"></div>'}
        <div>
          <div class="trophy-title">${t.title}</div>
          <div class="trophy-meta">${t.competition || ''} — ${t.year}</div>
        </div>
      </div>`
      )
      .join('');
  } catch (err) {
    grid.innerHTML = '<div class="empty-state">Impossible de charger le palmarès.</div>';
  }
}

// ============================================================
// PARTENAIRES
// ============================================================
async function loadPartners() {
  const strip = document.getElementById('partnersStrip');
  try {
    const partners = await apiGet('/partners');
    if (!partners.length) { strip.innerHTML = '<div class="empty-state">Aucun partenaire pour le moment.</div>'; return; }
    strip.innerHTML = partners
      .map((p) => `<a class="partner-logo-link" href="${p.websiteUrl || '#'}" target="_blank" rel="noopener"><img src="${p.logoUrl}" alt="${p.name}"></a>`)
      .join('');
  } catch (err) {
    strip.innerHTML = '<div class="empty-state">Impossible de charger les partenaires.</div>';
  }
}

// ============================================================
// GALERIE / MÉDIAS
// ============================================================
let galleryData = [];

async function loadGallery() {
  const grid = document.getElementById('galleryGrid');
  const filtersContainer = document.getElementById('galleryFilters');
  try {
    galleryData = await apiGet('/gallery');
    if (!galleryData.length) { grid.innerHTML = '<div class="empty-state">Galerie à venir.</div>'; return; }

    const categories = ['all', ...new Set(galleryData.map((g) => g.category).filter(Boolean))];
    filtersContainer.innerHTML = categories
      .map((c) => `<button class="gallery-filter-btn ${c === 'all' ? 'active' : ''}" data-filter="${c}">${c === 'all' ? 'Tout' : c}</button>`)
      .join('');

    filtersContainer.querySelectorAll('.gallery-filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        filtersContainer.querySelectorAll('.gallery-filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        renderGallery(btn.dataset.filter);
      });
    });

    renderGallery('all');
    renderMediaModal();
  } catch (err) {
    grid.innerHTML = '<div class="empty-state">Impossible de charger la galerie.</div>';
  }
}

function renderGallery(filter) {
  const grid = document.getElementById('galleryGrid');
  const items = filter === 'all' ? galleryData : galleryData.filter((g) => g.category === filter);
  grid.innerHTML = items
    .map(
      (item, i) => `
    <div class="gallery-item ${item.type === 'video' ? 'video-item' : ''}" data-index="${i}">
      ${item.type === 'video' ? `<video src="${item.mediaUrl}" muted></video>` : `<img src="${item.mediaUrl}" alt="${item.caption || ''}" loading="lazy">`}
    </div>`
    )
    .join('');

  grid.querySelectorAll('.gallery-item').forEach((el) => {
    el.addEventListener('click', () => openLightbox(items[parseInt(el.dataset.index)]));
  });
}

function renderMediaModal() {
  const container = document.getElementById('mediaModalGrid');
  if (!container) return;

  const videoItems = galleryData.filter((item) => item.type === 'video');
  if (!videoItems.length) {
    container.innerHTML = '<div class="empty-state">Aucune vidéo ajoutée pour le moment. Ajoutez-en depuis l’admin → Médias.</div>';
    return;
  }

  container.innerHTML = videoItems
    .map((item) => `
      <div class="media-modal-item" data-media-id="${item._id || item.mediaUrl || ''}">
        <div class="media-modal-item-preview">
          <video src="${item.mediaUrl}" muted preload="metadata"></video>
        </div>
        <div class="media-modal-item-body">
          <div class="media-modal-item-title">${item.caption || 'Vidéo'}</div>
          <div class="media-modal-item-meta">${item.category || 'Médias'} · ${item.type === 'video' ? 'Vidéo' : 'Photo'}</div>
        </div>
      </div>`)
    .join('');

  container.querySelectorAll('.media-modal-item').forEach((el) => {
    el.addEventListener('click', () => {
      const item = videoItems.find((g) => (g._id || g.mediaUrl) === el.dataset.mediaId);
      if (item) {
        closeMediaModal();
        openLightbox(item);
      }
    });
  });
}

function openLightbox(item) {
  const lightbox = document.getElementById('lightbox');
  const content = document.getElementById('lightboxContent');
  content.innerHTML = item.type === 'video'
    ? `<video src="${item.mediaUrl}" controls autoplay></video>`
    : `<img src="${item.mediaUrl}" alt="${item.caption || ''}">`;
  lightbox.classList.add('open');
}

document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightbox').addEventListener('click', (e) => { if (e.target.id === 'lightbox') closeLightbox(); });
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lightboxContent').innerHTML = '';
}

// ============================================================
// MODAL MÉDIAS
// ============================================================
const mediaModalOverlay = document.getElementById('mediaModalOverlay');
const mediaModalClose = document.getElementById('mediaModalClose');
const openMediaModalBtn = document.getElementById('openMediaModalBtn');

function openMediaModal() {
  renderMediaModal();
  mediaModalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMediaModal() {
  mediaModalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

openMediaModalBtn?.addEventListener('click', openMediaModal);
mediaModalClose?.addEventListener('click', closeMediaModal);
mediaModalOverlay?.addEventListener('click', (e) => {
  if (e.target === mediaModalOverlay) closeMediaModal();
});

// ============================================================
// MODAL STATS
// ============================================================
const statsModalOverlay = document.getElementById('statsModalOverlay');
const statsModalClose = document.getElementById('statsModalClose');
const openStatsModalBtn = document.getElementById('openStatsModalBtn');

function openStatsModal() {
  statsModalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeStatsModal() {
  statsModalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

openStatsModalBtn?.addEventListener('click', openStatsModal);
statsModalClose?.addEventListener('click', closeStatsModal);
statsModalOverlay?.addEventListener('click', (e) => {
  if (e.target === statsModalOverlay) closeStatsModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeContactModal();
    closeStatsModal();
    closeMediaModal();
  }
});

// ============================================================
// FORMULAIRE DE CONTACT
// ============================================================
const contactModalOverlay = document.getElementById('contactModalOverlay');
const contactModalClose = document.getElementById('contactModalClose');
const openContactModalBtn = document.getElementById('openContactModalBtn');

function openContactModal() {
  contactModalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeContactModal() {
  contactModalOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

openContactModalBtn?.addEventListener('click', openContactModal);
contactModalClose?.addEventListener('click', closeContactModal);
contactModalOverlay?.addEventListener('click', (e) => {
  if (e.target === contactModalOverlay) closeContactModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeContactModal();
});

document.getElementById('contactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const status = document.getElementById('formStatus');
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');

  const data = {
    name: form.name.value,
    email: form.email.value,
    subject: form.subject.value,
    message: form.message.value,
  };

  submitBtn.disabled = true;
  status.textContent = 'Envoi en cours…';
  status.className = 'form-status';

  try {
    await apiPost('/contact', data);
    status.textContent = 'Message envoyé avec succès';
    status.className = 'form-status success';
    form.reset();
    setTimeout(closeContactModal, 900);
  } catch (err) {
    status.textContent = err.message || "Erreur lors de l'envoi. Réessaie.";
    status.className = 'form-status error';
  } finally {
    submitBtn.disabled = false;
  }
});

// ============================================================
// INITIALISATION
// ============================================================
renderIcons();
loadHero();
loadProfile();
loadNextMatch();
loadStats();
loadNews();
loadCareer();
loadTrophies();
loadPartners();
loadGallery();
