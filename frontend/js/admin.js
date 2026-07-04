// ============================================================
// ICÔNES
// ============================================================
function renderIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach((el) => {
    const name = el.dataset.icon;
    const size = el.dataset.iconSize || 20;
    el.innerHTML = icon(name, size);
  });
}

// ============================================================
// AUTHENTIFICATION
// ============================================================
let authToken = sessionStorage.getItem('adminToken') || null;
const loginScreen = document.getElementById('loginScreen');
const adminApp = document.getElementById('adminApp');

function showApp() {
  loginScreen.style.display = 'none';
  adminApp.classList.add('visible');
  renderIcons(adminApp);
  initAllPanels();
}
function showLogin() {
  loginScreen.style.display = 'flex';
  adminApp.classList.remove('visible');
}

document.getElementById('loginBtn').addEventListener('click', doLogin);
document.getElementById('loginPassword').addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });

async function doLogin() {
  const password = document.getElementById('loginPassword').value;
  const errorEl = document.getElementById('loginError');
  errorEl.innerHTML = '';
  if (!password) { errorEl.textContent = 'Entre le mot de passe.'; return; }
  try {
    const res = await apiPost('/auth/login', { password });
    authToken = res.token;
    sessionStorage.setItem('adminToken', authToken);
    showApp();
  } catch (err) {
    errorEl.innerHTML = `<span data-icon="x" data-icon-size="14"></span> ${err.message || 'Mot de passe incorrect.'}`;
    renderIcons(errorEl);
  }
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  authToken = null;
  sessionStorage.removeItem('adminToken');
  showLogin();
});

if (authToken) { showApp(); } else { showLogin(); }

// ============================================================
// TOAST
// ============================================================
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const iconName = type === 'success' ? 'check' : 'x';
  toast.innerHTML = `<span data-icon="${iconName}" data-icon-size="16"></span> ${message}`;
  toast.className = `toast show ${type}`;
  renderIcons(toast);
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// ============================================================
// NAVIGATION
// ============================================================
const panels = document.querySelectorAll('.admin-panel');
const navBtns = document.querySelectorAll('.nav-btn');
const fab = document.getElementById('fabAdd');
const panelsWithFab = ['hero', 'matches', 'news', 'career', 'trophies', 'partners', 'gallery', 'stats'];

navBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const panelName = btn.dataset.panel;
    navBtns.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    panels.forEach((p) => p.classList.remove('active'));
    document.getElementById(`panel-${panelName}`).classList.add('active');
    fab.hidden = !panelsWithFab.includes(panelName);
    fab.dataset.currentPanel = panelName;
    window.scrollTo(0, 0);
  });
});

fab.addEventListener('click', () => openFormFor(fab.dataset.currentPanel));

// ============================================================
// MODAL GÉNÉRIQUE
// ============================================================
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');

function openModal(title) { modalTitle.textContent = title; modalOverlay.classList.add('open'); }
function closeModal() { modalOverlay.classList.remove('open'); modalBody.innerHTML = ''; }
document.getElementById('modalClose').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target.id === 'modalOverlay') closeModal(); });

// ============================================================
// INITIALISATION
// ============================================================
function initAllPanels() {
  loadHeroAdmin();
  loadMatchesAdmin();
  loadNewsAdmin();
  loadSeasonStatsAdmin();
  loadMatchStatsAdmin();
  loadCareerAdmin();
  loadTrophiesAdmin();
  loadPartnersAdmin();
  loadGalleryAdmin();
  loadProfileAdmin();
  loadAffiliationsAdmin();
  loadMessagesAdmin();
}

// ============================================================
// HERO (ACCUEIL)
// ============================================================
async function loadHeroAdmin() {
  const list = document.getElementById('heroList');
  try {
    const heroes = await apiGet('/hero/admin/all', authToken);
    if (!heroes.length) { list.innerHTML = '<div class="empty-state">Aucun visuel. Appuie sur + pour en ajouter.</div>'; return; }
    list.innerHTML = heroes.map((h) => `
      <div class="item-card">
        ${h.type === 'video' ? `<video src="${h.mediaUrl}" muted></video>` : `<img src="${h.mediaUrl}">`}
        <div class="item-card-body">
          <div class="item-card-title">${h.title || '(sans titre)'}</div>
          <div class="item-card-meta">${h.type === 'video' ? 'Vidéo' : 'Image'} · ordre ${h.order}${h.active ? '' : ' · masqué'}</div>
        </div>
        <div class="item-card-actions">
          <button class="icon-btn danger" data-icon="trash" data-icon-size="16" onclick="deleteItem('hero','${h._id}', loadHeroAdmin)"></button>
        </div>
      </div>`).join('');
    renderIcons(list);
  } catch (err) { list.innerHTML = '<div class="empty-state">Erreur de chargement.</div>'; }
}

function formHero() {
  return `
    <div class="form-row">
      <label>Fichier (image ou vidéo)</label>
      <div class="file-input-wrap"><span data-icon="video" data-icon-size="16"></span><span>Choisir un fichier</span><input type="file" id="f-media" accept="image/*,video/*"></div>
    </div>
    <div class="form-row"><label>Titre</label><input type="text" id="f-title" placeholder="Ange Lago"></div>
    <div class="form-row"><label>Sous-titre</label><input type="text" id="f-subtitle" placeholder="Attaquant — Olympique de Marseille"></div>
    <div class="form-row"><label>Ordre d'affichage</label><input type="number" id="f-order" value="0"></div>
    <div class="checkbox-row" style="margin-bottom:16px;"><input type="checkbox" id="f-active" checked><label for="f-active">Visible sur le site</label></div>
    <button class="btn btn-primary" id="submitHero">Ajouter le visuel</button>
  `;
}

// ============================================================
// PROCHAIN MATCH
// ============================================================
async function loadMatchesAdmin() {
  const list = document.getElementById('matchesList');
  try {
    const matches = await apiGet('/matches/admin/all', authToken);
    if (!matches.length) { list.innerHTML = '<div class="empty-state">Aucun match programmé. Appuie sur + pour en ajouter.</div>'; return; }
    list.innerHTML = matches.map((m) => `
      <div class="item-card">
        ${m.opponentLogoUrl ? `<img src="${m.opponentLogoUrl}">` : `<div class="item-card-icon-fallback" data-icon="shirt" data-icon-size="24"></div>`}
        <div class="item-card-body">
          <div class="item-card-title">vs ${m.opponent}</div>
          <div class="item-card-meta">${new Date(m.date).toLocaleDateString('fr-FR')} · ${m.competition || ''}${m.active ? '' : ' · masqué'}</div>
        </div>
        <div class="item-card-actions">
          <button class="icon-btn danger" data-icon="trash" data-icon-size="16" onclick="deleteItem('matches','${m._id}', loadMatchesAdmin)"></button>
        </div>
      </div>`).join('');
    renderIcons(list);
  } catch (err) { list.innerHTML = '<div class="empty-state">Erreur de chargement.</div>'; }
}

function formMatch() {
  return `
    <div class="form-row"><label>Adversaire</label><input type="text" id="f-opponent" placeholder="PSG"></div>
    <div class="form-row">
      <label>Logo de l'adversaire</label>
      <div class="file-input-wrap"><span>Choisir un logo</span><input type="file" id="f-opponentLogo" accept="image/*"></div>
    </div>
    <div class="form-row-inline">
      <div class="form-row"><label>Date</label><input type="datetime-local" id="f-date"></div>
      <div class="form-row"><label>Lieu</label><input type="text" id="f-venue" placeholder="Domicile"></div>
    </div>
    <div class="form-row"><label>Compétition</label><input type="text" id="f-competition" placeholder="Ligue 1"></div>
    <div class="form-row">
      <label>Ange Lago titulaire ?</label>
      <div class="segmented" id="starterSegmented">
        <button type="button" data-value="true">Oui</button>
        <button type="button" data-value="false">Non</button>
        <button type="button" data-value="null" class="active">Pas annoncé</button>
      </div>
    </div>
    <div class="form-row"><label>Notes / composition</label><textarea id="f-lineupNotes" placeholder="Détails sur la composition, contexte du match..."></textarea></div>
    <div class="form-row">
      <label>Image de fond (optionnelle)</label>
      <div class="file-input-wrap"><span>Choisir une image</span><input type="file" id="f-backgroundImage" accept="image/*"></div>
    </div>
    <div class="checkbox-row" style="margin-bottom:16px;"><input type="checkbox" id="f-active" checked><label for="f-active">Afficher sur le site</label></div>
    <button class="btn btn-primary" id="submitMatch">Ajouter le match</button>
  `;
}

function setupStarterSegmented() {
  const seg = document.getElementById('starterSegmented');
  if (!seg) return;
  seg.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      seg.querySelectorAll('button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

async function submitMatch() {
  const fd = new FormData();
  const opponentLogo = document.getElementById('f-opponentLogo').files[0];
  const backgroundImage = document.getElementById('f-backgroundImage').files[0];
  if (opponentLogo) fd.append('opponentLogo', opponentLogo);
  if (backgroundImage) fd.append('backgroundImage', backgroundImage);
  fd.append('opponent', document.getElementById('f-opponent').value);
  fd.append('date', document.getElementById('f-date').value);
  fd.append('venue', document.getElementById('f-venue').value);
  fd.append('competition', document.getElementById('f-competition').value);
  fd.append('lineupNotes', document.getElementById('f-lineupNotes').value);
  fd.append('active', document.getElementById('f-active').checked);
  const starterBtn = document.querySelector('#starterSegmented button.active');
  fd.append('isLagoStarter', starterBtn ? starterBtn.dataset.value : 'null');

  await runSubmit('/matches', fd, closeModal, loadMatchesAdmin, 'Match ajouté');
}

// ============================================================
// STATS SAISON
// ============================================================
async function loadSeasonStatsAdmin() {
  try {
    const s = await apiGet('/stats/season');
    document.getElementById('s-season').value = s.season || '2025-2026';
    document.getElementById('s-matchesPlayed').value = s.matchesPlayed ?? 0;
    document.getElementById('s-minutesPlayed').value = s.minutesPlayed ?? 0;
    document.getElementById('s-goals').value = s.goals ?? 0;
    document.getElementById('s-assists').value = s.assists ?? 0;
    document.getElementById('s-yellowCards').value = s.yellowCards ?? 0;
    document.getElementById('s-redCards').value = s.redCards ?? 0;
    document.getElementById('s-distanceKm').value = s.distanceKm ?? 0;
    document.getElementById('statsBackgroundLabel').textContent = s.backgroundImageUrl ? 'Image ajoutée' : 'Choisir une image';
  } catch (err) { showToast('Impossible de charger les stats', 'error'); }
}

document.getElementById('statsBackgroundImage').addEventListener('change', (e) => {
  document.getElementById('statsBackgroundLabel').textContent = e.target.files[0]?.name || 'Choisir une image';
});

document.getElementById('saveSeasonBtn').addEventListener('click', async () => {
  const fd = new FormData();
  fd.append('season', document.getElementById('s-season').value);
  fd.append('matchesPlayed', Number(document.getElementById('s-matchesPlayed').value));
  fd.append('minutesPlayed', Number(document.getElementById('s-minutesPlayed').value));
  fd.append('goals', Number(document.getElementById('s-goals').value));
  fd.append('assists', Number(document.getElementById('s-assists').value));
  fd.append('yellowCards', Number(document.getElementById('s-yellowCards').value));
  fd.append('redCards', Number(document.getElementById('s-redCards').value));
  fd.append('distanceKm', Number(document.getElementById('s-distanceKm').value));
  const backgroundImage = document.getElementById('statsBackgroundImage').files[0];
  if (backgroundImage) fd.append('backgroundImage', backgroundImage);
  try {
    await apiPut('/stats/season', fd, authToken, true);
    document.getElementById('statsBackgroundImage').value = '';
    document.getElementById('statsBackgroundLabel').textContent = 'Choisir une image';
    loadSeasonStatsAdmin();
    showToast('Stats saison mises à jour');
  } catch (err) { showToast(err.message || 'Erreur', 'error'); }
});

// ============================================================
// STATS PAR MATCH
// ============================================================
async function loadMatchStatsAdmin() {
  const list = document.getElementById('matchStatsList');
  try {
    const matches = await apiGet('/stats/matches');
    if (!matches.length) { list.innerHTML = '<div class="empty-state">Aucun match enregistré.</div>'; return; }
    list.innerHTML = matches.map((m) => `
      <div class="item-card">
        <div class="item-card-icon-fallback" data-icon="goal" data-icon-size="22"></div>
        <div class="item-card-body">
          <div class="item-card-title">vs ${m.opponent} ${m.result ? `(${m.result})` : ''}</div>
          <div class="item-card-meta">${new Date(m.date).toLocaleDateString('fr-FR')} · ${m.goals} but(s), ${m.assists} passe(s) · ${m.minutesPlayed}'</div>
        </div>
        <div class="item-card-actions">
          <button class="icon-btn danger" data-icon="trash" data-icon-size="16" onclick="deleteItem('stats/matches','${m._id}', loadMatchStatsAdmin)"></button>
        </div>
      </div>`).join('');
    renderIcons(list);
  } catch (err) { list.innerHTML = '<div class="empty-state">Erreur de chargement.</div>'; }
}

function formMatchStat() {
  return `
    <div class="form-row"><label>Adversaire</label><input type="text" id="f-opponent" placeholder="PSG"></div>
    <div class="form-row-inline">
      <div class="form-row"><label>Date</label><input type="date" id="f-date"></div>
      <div class="form-row"><label>Résultat</label><input type="text" id="f-result" placeholder="2-1"></div>
    </div>
    <div class="form-row"><label>Compétition</label><input type="text" id="f-competition" placeholder="Ligue 1"></div>
    <div class="form-row-inline">
      <div class="form-row"><label>Buts</label><input type="number" id="f-goals" value="0"></div>
      <div class="form-row"><label>Passes déc.</label><input type="number" id="f-assists" value="0"></div>
    </div>
    <div class="form-row"><label>Minutes jouées</label><input type="number" id="f-minutesPlayed" value="90"></div>
    <div class="checkbox-row" style="margin-bottom:10px;"><input type="checkbox" id="f-yellowCard"><label for="f-yellowCard">Carton jaune</label></div>
    <div class="checkbox-row" style="margin-bottom:16px;"><input type="checkbox" id="f-redCard"><label for="f-redCard">Carton rouge</label></div>
    <button class="btn btn-primary" id="submitMatchStat">Ajouter le match</button>
  `;
}

async function submitMatchStat() {
  const data = {
    opponent: document.getElementById('f-opponent').value,
    date: document.getElementById('f-date').value,
    result: document.getElementById('f-result').value,
    competition: document.getElementById('f-competition').value,
    goals: Number(document.getElementById('f-goals').value),
    assists: Number(document.getElementById('f-assists').value),
    minutesPlayed: Number(document.getElementById('f-minutesPlayed').value),
    yellowCard: document.getElementById('f-yellowCard').checked,
    redCard: document.getElementById('f-redCard').checked,
  };
  const btn = document.getElementById('submitMatchStat');
  btn.disabled = true;
  try {
    await apiPost('/stats/matches', data, authToken, false);
    showToast('Match ajouté');
    closeModal();
    loadMatchStatsAdmin();
    loadSeasonStatsAdmin();
  } catch (err) { showToast(err.message || 'Erreur', 'error'); }
  finally { btn.disabled = false; }
}

// ============================================================
// ACTUALITÉS
// ============================================================
async function loadNewsAdmin() {
  const list = document.getElementById('newsList');
  try {
    const news = await apiGet('/news/admin/all', authToken);
    if (!news.length) { list.innerHTML = '<div class="empty-state">Aucune actualité. Appuie sur + pour en ajouter.</div>'; return; }
    list.innerHTML = news.map((n) => `
      <div class="item-card">
        ${n.imageUrl ? `<img src="${n.imageUrl}">` : `<div class="item-card-icon-fallback" data-icon="newspaper" data-icon-size="22"></div>`}
        <div class="item-card-body">
          <div class="item-card-title">${n.title}</div>
          <div class="item-card-meta">${new Date(n.date).toLocaleDateString('fr-FR')}${n.published ? '' : ' · masqué'}</div>
        </div>
        <div class="item-card-actions">
          <button class="icon-btn danger" data-icon="trash" data-icon-size="16" onclick="deleteItem('news','${n._id}', loadNewsAdmin)"></button>
        </div>
      </div>`).join('');
    renderIcons(list);
  } catch (err) { list.innerHTML = '<div class="empty-state">Erreur de chargement.</div>'; }
}

function formNews() {
  return `
    <div class="form-row">
      <label>Image</label>
      <div class="file-input-wrap"><span>Choisir une image</span><input type="file" id="f-image" accept="image/*"></div>
    </div>
    <div class="form-row"><label>Titre</label><input type="text" id="f-title"></div>
    <div class="form-row-inline">
      <div class="form-row"><label>Catégorie</label><input type="text" id="f-category" placeholder="Formation, Mercato…"></div>
      <div class="form-row"><label>Date</label><input type="date" id="f-date"></div>
    </div>
    <div class="form-row"><label>Résumé court</label><textarea id="f-excerpt"></textarea></div>
    <div class="form-row"><label>Contenu complet</label><textarea id="f-content" style="min-height:130px;"></textarea></div>
    <div class="checkbox-row" style="margin-bottom:16px;"><input type="checkbox" id="f-published" checked><label for="f-published">Publié sur le site</label></div>
    <button class="btn btn-primary" id="submitNews">Publier l'actualité</button>
  `;
}

// ============================================================
// PARCOURS
// ============================================================
async function loadCareerAdmin() {
  const list = document.getElementById('careerList');
  try {
    const steps = await apiGet('/career');
    if (!steps.length) { list.innerHTML = '<div class="empty-state">Aucune étape. Appuie sur + pour en ajouter.</div>'; return; }
    list.innerHTML = steps.map((s) => `
      <div class="item-card">
        ${s.imageUrl ? `<img src="${s.imageUrl}">` : `<div class="item-card-icon-fallback" data-icon="bolt" data-icon-size="22"></div>`}
        <div class="item-card-body">
          <div class="item-card-title">${s.title}</div>
          <div class="item-card-meta">${s.year}</div>
        </div>
        <div class="item-card-actions">
          <button class="icon-btn danger" data-icon="trash" data-icon-size="16" onclick="deleteItem('career','${s._id}', loadCareerAdmin)"></button>
        </div>
      </div>`).join('');
    renderIcons(list);
  } catch (err) { list.innerHTML = '<div class="empty-state">Erreur de chargement.</div>'; }
}

function formCareer() {
  return `
    <div class="form-row">
      <label>Image (optionnelle)</label>
      <div class="file-input-wrap"><span>Choisir une image</span><input type="file" id="f-image" accept="image/*"></div>
    </div>
    <div class="form-row"><label>Année</label><input type="text" id="f-year" placeholder="2023"></div>
    <div class="form-row"><label>Titre</label><input type="text" id="f-title" placeholder="Olympique de Marseille"></div>
    <div class="form-row"><label>Description</label><textarea id="f-description"></textarea></div>
    <div class="form-row"><label>Ordre d'affichage</label><input type="number" id="f-order" value="0"></div>
    <button class="btn btn-primary" id="submitCareer">Ajouter l'étape</button>
  `;
}

// ============================================================
// PALMARÈS
// ============================================================
async function loadTrophiesAdmin() {
  const list = document.getElementById('trophiesList');
  try {
    const trophies = await apiGet('/trophies');
    if (!trophies.length) { list.innerHTML = '<div class="empty-state">Aucun trophée. Appuie sur + pour en ajouter.</div>'; return; }
    list.innerHTML = trophies.map((t) => `
      <div class="item-card">
        ${t.imageUrl ? `<img src="${t.imageUrl}">` : `<div class="item-card-icon-fallback" data-icon="star" data-icon-size="22"></div>`}
        <div class="item-card-body">
          <div class="item-card-title">${t.title}</div>
          <div class="item-card-meta">${t.competition || ''} · ${t.year}</div>
        </div>
        <div class="item-card-actions">
          <button class="icon-btn danger" data-icon="trash" data-icon-size="16" onclick="deleteItem('trophies','${t._id}', loadTrophiesAdmin)"></button>
        </div>
      </div>`).join('');
    renderIcons(list);
  } catch (err) { list.innerHTML = '<div class="empty-state">Erreur de chargement.</div>'; }
}

function formTrophy() {
  return `
    <div class="form-row">
      <label>Image (optionnelle)</label>
      <div class="file-input-wrap"><span>Choisir une image</span><input type="file" id="f-image" accept="image/*"></div>
    </div>
    <div class="form-row"><label>Titre</label><input type="text" id="f-title" placeholder="Meilleur buteur U18"></div>
    <div class="form-row"><label>Compétition</label><input type="text" id="f-competition" placeholder="Championnat ivoirien"></div>
    <div class="form-row"><label>Année</label><input type="text" id="f-year" placeholder="2023"></div>
    <button class="btn btn-primary" id="submitTrophy">Ajouter le trophée</button>
  `;
}

// ============================================================
// PARTENAIRES
// ============================================================
async function loadPartnersAdmin() {
  const list = document.getElementById('partnersList');
  try {
    const partners = await apiGet('/partners');
    if (!partners.length) { list.innerHTML = '<div class="empty-state">Aucun partenaire. Appuie sur + pour en ajouter.</div>'; return; }
    list.innerHTML = partners.map((p) => `
      <div class="item-card">
        <img src="${p.logoUrl}">
        <div class="item-card-body">
          <div class="item-card-title">${p.name}</div>
          <div class="item-card-meta">${p.websiteUrl || 'Pas de lien'}</div>
        </div>
        <div class="item-card-actions">
          <button class="icon-btn danger" data-icon="trash" data-icon-size="16" onclick="deleteItem('partners','${p._id}', loadPartnersAdmin)"></button>
        </div>
      </div>`).join('');
    renderIcons(list);
  } catch (err) { list.innerHTML = '<div class="empty-state">Erreur de chargement.</div>'; }
}

function formPartner() {
  return `
    <div class="form-row">
      <label>Logo</label>
      <div class="file-input-wrap"><span>Choisir un logo</span><input type="file" id="f-logo" accept="image/*"></div>
    </div>
    <div class="form-row"><label>Nom</label><input type="text" id="f-name"></div>
    <div class="form-row"><label>Lien vers leur site</label><input type="url" id="f-websiteUrl"></div>
    <button class="btn btn-primary" id="submitPartner">Ajouter le partenaire</button>
  `;
}

// ============================================================
// GALERIE
// ============================================================
async function loadGalleryAdmin() {
  const list = document.getElementById('galleryList');
  try {
    const items = await apiGet('/gallery');
    if (!items.length) { list.innerHTML = '<div class="empty-state">Galerie vide. Appuie sur + pour ajouter une photo ou vidéo.</div>'; return; }
    list.innerHTML = items.map((g) => `
      <div class="item-card">
        ${g.type === 'video' ? `<video src="${g.mediaUrl}" muted></video>` : `<img src="${g.mediaUrl}">`}
        <div class="item-card-body">
          <div class="item-card-title">${g.caption || '(sans légende)'}</div>
          <div class="item-card-meta">${g.type === 'video' ? 'Vidéo' : 'Photo'} · ${g.category}</div>
        </div>
        <div class="item-card-actions">
          <button class="icon-btn danger" data-icon="trash" data-icon-size="16" onclick="deleteItem('gallery','${g._id}', loadGalleryAdmin)"></button>
        </div>
      </div>`).join('');
    renderIcons(list);
  } catch (err) { list.innerHTML = '<div class="empty-state">Erreur de chargement.</div>'; }
}

function formGallery() {
  return `
    <div class="form-row">
      <label>Photo ou vidéo</label>
      <div class="file-input-wrap"><span>Choisir un fichier</span><input type="file" id="f-media" accept="image/*,video/*"></div>
    </div>
    <div class="form-row"><label>Légende</label><input type="text" id="f-caption"></div>
    <div class="form-row"><label>Catégorie</label><input type="text" id="f-category" placeholder="match, entrainement…"></div>
    <button class="btn btn-primary" id="submitGallery">Ajouter à la galerie</button>
  `;
}

// ============================================================
// AFFILIATIONS (badges footer)
// ============================================================
async function loadAffiliationsAdmin() {
  const list = document.getElementById('affiliationsList');
  try {
    const items = await apiGet('/affiliations');
    if (!items.length) { list.innerHTML = '<div class="empty-state">Aucun badge ajouté.</div>'; return; }
    list.innerHTML = items.map((a) => `
      <div class="item-card">
        <img src="${a.logoUrl}">
        <div class="item-card-body">
          <div class="item-card-title">${a.name}</div>
          <div class="item-card-meta">${a.url || 'Pas de lien'}</div>
        </div>
        <div class="item-card-actions">
          <button class="icon-btn danger" data-icon="trash" data-icon-size="16" onclick="deleteItem('affiliations','${a._id}', loadAffiliationsAdmin)"></button>
        </div>
      </div>`).join('');
    renderIcons(list);
  } catch (err) { list.innerHTML = '<div class="empty-state">Erreur de chargement.</div>'; }

  // Bouton d'ajout dédié (ce panneau n'a pas de FAB, il vit dans "Profil")
  const addBtnId = 'addAffiliationBtn';
  if (!document.getElementById(addBtnId)) {
    const btn = document.createElement('button');
    btn.id = addBtnId;
    btn.className = 'btn btn-secondary';
    btn.style.marginTop = '10px';
    btn.innerHTML = `<span data-icon="plus" data-icon-size="16"></span> Ajouter un badge`;
    btn.addEventListener('click', () => openFormFor('affiliations'));
    list.after(btn);
    renderIcons(btn);
  }
}

function formAffiliation() {
  return `
    <div class="form-row">
      <label>Logo</label>
      <div class="file-input-wrap"><span>Choisir un logo</span><input type="file" id="f-logo" accept="image/*"></div>
    </div>
    <div class="form-row"><label>Nom</label><input type="text" id="f-name" placeholder="Équipe nationale de Côte d'Ivoire"></div>
    <div class="form-row"><label>Lien</label><input type="url" id="f-url"></div>
    <button class="btn btn-primary" id="submitAffiliation">Ajouter le badge</button>
  `;
}

// ============================================================
// PROFIL & CONTACT
// ============================================================
async function loadProfileAdmin() {
  try {
    const p = await apiGet('/profile');
    document.getElementById('p-fullName').value = p.fullName || '';
    document.getElementById('p-position').value = p.position || '';
    document.getElementById('p-foot').value = p.foot || '';
    document.getElementById('p-birthDate').value = p.birthDate ? p.birthDate.split('T')[0] : '';
    document.getElementById('p-height').value = p.height || '';
    document.getElementById('p-birthPlace').value = p.birthPlace || '';
    document.getElementById('p-nationality').value = p.nationality || '';
    document.getElementById('p-bio').value = p.bio || '';
    document.getElementById('p-club').value = p.club || '';
    document.getElementById('p-clubUrl').value = p.clubUrl || '';
    document.getElementById('p-instagramUrl').value = p.instagramUrl || '';
    document.getElementById('p-hasActiveStory').checked = !!p.hasActiveStory;
    document.getElementById('p-facebookUrl').value = p.facebookUrl || '';
    document.getElementById('p-youtubeUrl').value = p.youtubeUrl || '';
    document.getElementById('p-contactHeroTitle').value = p.contactHeroTitle || 'Contacter Ange Lago';
    document.getElementById('p-contactHeroSubtitle').value = p.contactHeroSubtitle || 'Pour une demande professionnelle, un sponsoring ou toute autre question.';
    document.getElementById('p-contactHeroButtonLabel').value = p.contactHeroButtonLabel || 'Contacter';
    document.getElementById('contactHeroImageLabel').textContent = p.contactHeroImageUrl ? 'Image ajoutée' : 'Choisir une image';
    document.getElementById('p-agentName').value = p.agentName || '';
    document.getElementById('p-agentPhone').value = p.agentPhone || '';
    document.getElementById('p-agentInstagramUrl').value = p.agentInstagramUrl || '';
    document.getElementById('p-agentFacebookUrl').value = p.agentFacebookUrl || '';
  } catch (err) { showToast('Impossible de charger le profil', 'error'); }
}

document.getElementById('profilePhoto').addEventListener('change', (e) => {
  document.getElementById('profilePhotoLabel').textContent = e.target.files[0]?.name || 'Choisir une photo';
});
document.getElementById('clubLogo').addEventListener('change', (e) => {
  document.getElementById('clubLogoLabel').textContent = e.target.files[0]?.name || 'Choisir un logo';
});
document.getElementById('contactHeroImage').addEventListener('change', (e) => {
  document.getElementById('contactHeroImageLabel').textContent = e.target.files[0]?.name || 'Choisir une image';
});

document.getElementById('saveProfileBtn').addEventListener('click', async () => {
  const btn = document.getElementById('saveProfileBtn');
  btn.disabled = true;
  btn.textContent = 'Enregistrement…';

  const fd = new FormData();
  const fields = {
    fullName: 'p-fullName', position: 'p-position', foot: 'p-foot', birthDate: 'p-birthDate',
    height: 'p-height', birthPlace: 'p-birthPlace', nationality: 'p-nationality', bio: 'p-bio',
    club: 'p-club', clubUrl: 'p-clubUrl', instagramUrl: 'p-instagramUrl', facebookUrl: 'p-facebookUrl',
    youtubeUrl: 'p-youtubeUrl', contactHeroTitle: 'p-contactHeroTitle', contactHeroSubtitle: 'p-contactHeroSubtitle',
    contactHeroButtonLabel: 'p-contactHeroButtonLabel', agentName: 'p-agentName', agentEmail: 'p-agentEmail', agentPhone: 'p-agentPhone',
    agentInstagramUrl: 'p-agentInstagramUrl', agentFacebookUrl: 'p-agentFacebookUrl',
  };
  Object.entries(fields).forEach(([key, id]) => fd.append(key, document.getElementById(id).value));
  fd.append('hasActiveStory', document.getElementById('p-hasActiveStory').checked);

  const photoFile = document.getElementById('profilePhoto').files[0];
  if (photoFile) fd.append('photo', photoFile);
  const clubLogoFile = document.getElementById('clubLogo').files[0];
  if (clubLogoFile) fd.append('clubLogo', clubLogoFile);
  const contactHeroFile = document.getElementById('contactHeroImage').files[0];
  if (contactHeroFile) fd.append('contactHeroImage', contactHeroFile);

  try {
    await apiPut('/profile', fd, authToken, true);
    showToast('Profil enregistré');
  } catch (err) { showToast(err.message || 'Erreur', 'error'); }
  finally { btn.disabled = false; btn.textContent = 'Enregistrer tout le profil'; }
});

// ============================================================
// MESSAGES
// ============================================================
async function loadMessagesAdmin() {
  const list = document.getElementById('messagesList');
  try {
    const res = await fetch(`${window.API_URL}/contact`, { headers: { Authorization: `Bearer ${authToken}` } });
    const messages = await res.json();
    if (!res.ok) throw new Error(messages.error);
    if (!messages.length) { list.innerHTML = '<div class="empty-state">Aucun message reçu.</div>'; return; }
    list.innerHTML = messages.map((m) => `
      <div class="item-card" style="align-items:flex-start;">
        <div class="item-card-icon-fallback" data-icon="mail" data-icon-size="20"></div>
        <div class="item-card-body">
          <div class="item-card-title">${m.name} ${m.read ? '' : '<span style="color:var(--color-accent);">●</span>'}</div>
          <div class="item-card-meta">${m.email} · ${new Date(m.createdAt).toLocaleDateString('fr-FR')}</div>
          <div style="margin-top:6px;font-size:0.85rem;color:var(--color-text-muted);">${m.subject ? `<strong>${m.subject}</strong><br>` : ''}${m.message}</div>
        </div>
        <div class="item-card-actions">
          <button class="icon-btn danger" data-icon="trash" data-icon-size="16" onclick="deleteItem('contact','${m._id}', loadMessagesAdmin)"></button>
        </div>
      </div>`).join('');
    renderIcons(list);
  } catch (err) { list.innerHTML = '<div class="empty-state">Erreur de chargement des messages.</div>'; }
}

// ============================================================
// OUVERTURE DES FORMULAIRES + SOUMISSION
// ============================================================
function openFormFor(panel) {
  const formMap = {
    hero: { title: 'Ajouter un visuel', html: formHero, submitId: 'submitHero', handler: submitHero },
    matches: { title: 'Ajouter un prochain match', html: formMatch, submitId: 'submitMatch', handler: submitMatch, after: setupStarterSegmented },
    news: { title: 'Ajouter une actualité', html: formNews, submitId: 'submitNews', handler: submitNews },
    career: { title: 'Ajouter une étape', html: formCareer, submitId: 'submitCareer', handler: submitCareer },
    trophies: { title: 'Ajouter un trophée', html: formTrophy, submitId: 'submitTrophy', handler: submitTrophy },
    partners: { title: 'Ajouter un partenaire', html: formPartner, submitId: 'submitPartner', handler: submitPartner },
    gallery: { title: 'Ajouter un média', html: formGallery, submitId: 'submitGallery', handler: submitGallery },
    stats: { title: 'Ajouter un match joué', html: formMatchStat, submitId: 'submitMatchStat', handler: submitMatchStat },
    affiliations: { title: 'Ajouter un badge', html: formAffiliation, submitId: 'submitAffiliation', handler: submitAffiliation },
  };
  const config = formMap[panel];
  if (!config) return;
  openModal(config.title);
  modalBody.innerHTML = config.html();
  renderIcons(modalBody);
  if (config.after) config.after();
  document.getElementById(config.submitId).addEventListener('click', config.handler);
}

async function submitHero() {
  const file = document.getElementById('f-media').files[0];
  if (!file) return showToast('Choisis un fichier', 'error');
  const fd = new FormData();
  fd.append('media', file);
  fd.append('title', document.getElementById('f-title').value);
  fd.append('subtitle', document.getElementById('f-subtitle').value);
  fd.append('order', document.getElementById('f-order').value);
  fd.append('active', document.getElementById('f-active').checked);
  await runSubmit('/hero', fd, closeModal, loadHeroAdmin, 'Visuel ajouté');
}

async function submitNews() {
  const fd = new FormData();
  const file = document.getElementById('f-image').files[0];
  if (file) fd.append('image', file);
  fd.append('title', document.getElementById('f-title').value);
  fd.append('category', document.getElementById('f-category').value);
  fd.append('date', document.getElementById('f-date').value || new Date().toISOString());
  fd.append('excerpt', document.getElementById('f-excerpt').value);
  fd.append('content', document.getElementById('f-content').value);
  fd.append('published', document.getElementById('f-published').checked);
  await runSubmit('/news', fd, closeModal, loadNewsAdmin, 'Actualité publiée');
}

async function submitCareer() {
  const fd = new FormData();
  const file = document.getElementById('f-image').files[0];
  if (file) fd.append('image', file);
  fd.append('year', document.getElementById('f-year').value);
  fd.append('title', document.getElementById('f-title').value);
  fd.append('description', document.getElementById('f-description').value);
  fd.append('order', document.getElementById('f-order').value);
  await runSubmit('/career', fd, closeModal, loadCareerAdmin, 'Étape ajoutée');
}

async function submitTrophy() {
  const fd = new FormData();
  const file = document.getElementById('f-image').files[0];
  if (file) fd.append('image', file);
  fd.append('title', document.getElementById('f-title').value);
  fd.append('competition', document.getElementById('f-competition').value);
  fd.append('year', document.getElementById('f-year').value);
  await runSubmit('/trophies', fd, closeModal, loadTrophiesAdmin, 'Trophée ajouté');
}

async function submitPartner() {
  const file = document.getElementById('f-logo').files[0];
  if (!file) return showToast('Choisis un logo', 'error');
  const fd = new FormData();
  fd.append('logo', file);
  fd.append('name', document.getElementById('f-name').value);
  fd.append('websiteUrl', document.getElementById('f-websiteUrl').value);
  await runSubmit('/partners', fd, closeModal, loadPartnersAdmin, 'Partenaire ajouté');
}

async function submitGallery() {
  const file = document.getElementById('f-media').files[0];
  if (!file) return showToast('Choisis un fichier', 'error');
  const fd = new FormData();
  fd.append('media', file);
  fd.append('caption', document.getElementById('f-caption').value);
  fd.append('category', document.getElementById('f-category').value || 'general');
  await runSubmit('/gallery', fd, closeModal, loadGalleryAdmin, 'Ajouté à la galerie');
}

async function submitAffiliation() {
  const file = document.getElementById('f-logo').files[0];
  if (!file) return showToast('Choisis un logo', 'error');
  const fd = new FormData();
  fd.append('logo', file);
  fd.append('name', document.getElementById('f-name').value);
  fd.append('url', document.getElementById('f-url').value);
  await runSubmit('/affiliations', fd, closeModal, loadAffiliationsAdmin, 'Badge ajouté');
}

async function runSubmit(path, formData, closeFn, reloadFn, successMsg) {
  const btn = modalBody.querySelector('.btn-primary');
  if (btn) btn.disabled = true;
  try {
    await apiPost(path, formData, authToken, true);
    showToast(successMsg);
    closeFn();
    reloadFn();
  } catch (err) {
    showToast(err.message || "Erreur lors de l'ajout", 'error');
  } finally {
    if (btn) btn.disabled = false;
  }
}

// ============================================================
// SUPPRESSION GÉNÉRIQUE
// ============================================================
async function deleteItem(resource, id, reloadFn) {
  if (!confirm('Supprimer cet élément ? Cette action est définitive.')) return;
  try {
    await apiDelete(`/${resource}/${id}`, authToken);
    showToast('Supprimé');
    reloadFn();
  } catch (err) {
    showToast(err.message || 'Erreur lors de la suppression', 'error');
  }
}
