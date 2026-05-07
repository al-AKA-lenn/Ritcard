/* ============================================================
   RITCORD — app.js
   Ritual Discord Tracker · Client Logic
   ============================================================ */

'use strict';

/* ── DOM refs ───────────────────────────────────────────────── */
const usernameInput = document.getElementById('usernameInput');
const ritualizeBtn  = document.getElementById('ritualizeBtn');
const statusDot     = document.getElementById('statusDot');
const statusText    = document.getElementById('statusText');
const cardSection   = document.getElementById('cardSection');

/* ── Enter key support ──────────────────────────────────────── */
usernameInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') ritualize();
});

/* ── Utilities ──────────────────────────────────────────────── */
const sleep = ms => new Promise(r => setTimeout(r, ms));

function setStatus(msg, mode = 'idle') {
  statusText.textContent = msg;
  statusDot.className = 'dot';
  if (mode === 'loading') statusDot.classList.add('active');
  if (mode === 'success') statusDot.classList.add('success');
  if (mode === 'error')   statusDot.classList.add('error');
}

/* Hash a string to a stable integer (for deterministic mock data) */
function strHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/* Pick a seeded random float 0–1 */
function seededRand(seed, offset = 0) {
  const x = Math.sin(seed + offset) * 10000;
  return x - Math.floor(x);
}

/* Format large numbers */
function fmt(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(n);
}

/* ── Mock data generator (Discord-style, Ritual-community themed) ── */
function generateProfile(username) {
  const seed = strHash(username);
  const r    = (off) => seededRand(seed, off);

  /* Deterministic values */
  const rank        = 1 + Math.floor(r(1) * 1500);
  const level       = 1 + Math.floor(r(2) * 80);
  const contrib     = Math.floor(r(3) * 30);
  const messages    = 100 + Math.floor(r(4) * 9900);
  const blessings   = Math.floor(r(5) * 20);
  const servers     = 1 + Math.floor(r(6) * 10);
  const events      = Math.floor(r(7) * 8);
  const writing     = Math.floor(r(8) * 50);

  /* Deltas (live-ish feel) */
  const contribSub  = `+${Math.floor(r(10) * 5)} TODAY`;
  const msgSub      = `${fmt(Math.floor(r(11) * messages * 0.8))} MSGS`;
  const blessSub    = `+${Math.floor(r(12) * 3)} TODAY`;
  const serversSub  = `${Math.floor(r(13) * servers * 0.7)} LIVE`;
  const eventsSub   = `${fmt(Math.floor(r(14) * 500))} PENGGUNA`;
  const writingSub  = `${Math.floor(r(15) * writing * 0.9)} LIVE`;

  /* Quotes / bios */
  const quotes = [
    '"Laid Forger of Ritual ✨"',
    '"Building in the void"',
    '"Signal in the noise"',
    '"Community is everything"',
    '"Ritual every day"',
    '"Shape the future"',
    '"Early supporter 🔮"',
    '"Lost in the protocol"',
  ];
  const quote = quotes[Math.floor(r(20) * quotes.length)];

  /* Roles */
  const allRoles = [
    { label: 'Server Booster', cls: 'purple' },
    { label: 'Ritual Member', cls: 'pink' },
    { label: 'Contributor',   cls: 'green' },
    { label: 'Early Access',  cls: 'purple' },
    { label: 'Community OG',  cls: 'pink' },
    { label: 'Moderator',     cls: 'green' },
  ];
  const roleCount = 2 + Math.floor(r(21) * 3);
  const startIdx  = Math.floor(r(22) * (allRoles.length - roleCount));
  const roles     = allRoles.slice(startIdx, startIdx + roleCount);

  /* Status */
  const statusOptions = ['online', 'idle', 'dnd', 'offline'];
  const statusWeights = [0.6, 0.2, 0.1, 0.1]; // weighted
  let statusIdx = 0;
  const roll = r(30);
  let acc = 0;
  for (let i = 0; i < statusWeights.length; i++) {
    acc += statusWeights[i];
    if (roll < acc) { statusIdx = i; break; }
  }
  const status = statusOptions[statusIdx];

  /* Avatar seed (DiceBear) — pixel-art style avatars */
  const avatarSeed  = encodeURIComponent(username + '_ritual');
  const avatarStyle = r(40) > 0.5 ? 'adventurer' : 'personas';
  const avatarUrl   = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${avatarSeed}&backgroundColor=1a0535,2d0a5a,0a1533,1a1033`;

  /* Banner — abstract gradient via placeholder SVG data URI */
  /* We use a CSS background on the banner element instead */
  const bannerHues = [
    'linear-gradient(135deg, #1a0535 0%, #2d0a5a 40%, #0a1533 70%, #0d0a20 100%)',
    'linear-gradient(135deg, #200a35 0%, #3d0a5a 40%, #0a2533 70%, #0d0a20 100%)',
    'linear-gradient(135deg, #0a1535 0%, #1d2a5a 40%, #0a0a33 70%, #0d0d20 100%)',
    'linear-gradient(135deg, #2a0520 0%, #5a0a40 40%, #330a0a 70%, #200d0d 100%)',
  ];
  const bannerGrad = bannerHues[Math.floor(r(50) * bannerHues.length)];

  /* User ID (fake snowflake-ish) */
  const userId = String(900000000000000000n + BigInt(Math.floor(r(60) * 1e17)));

  return {
    username,
    displayName: username.charAt(0).toUpperCase() + username.slice(1).replace(/[_.-]/g, ' '),
    usernameTag: `@${username}`,
    avatarUrl,
    bannerGrad,
    status,
    roles,
    quote,
    rank,
    level,
    contrib, contribSub,
    messages, msgSub,
    blessings, blessSub,
    servers, serversSub,
    events, eventsSub,
    writing, writingSub,
    userId,
  };
}

/* ── Render profile card ────────────────────────────────────── */
function renderCard(profile) {
  /* Banner */
  const banner = document.getElementById('cardBanner');
  banner.style.background = profile.bannerGrad;
  /* Hide img tag since we're using gradient */
  document.getElementById('bannerImg').style.display = 'none';

  /* Avatar */
  const avatarEl = document.getElementById('userAvatar');
  avatarEl.src = profile.avatarUrl;
  avatarEl.onerror = () => {
    /* Fallback: coloured initial */
    avatarEl.style.display = 'none';
    const parent = avatarEl.parentElement;
    parent.style.background = `hsl(${strHash(profile.username) % 360}, 55%, 30%)`;
    if (!parent.querySelector('.initial-fallback')) {
      const fb = document.createElement('div');
      fb.className = 'initial-fallback';
      fb.textContent = profile.displayName.charAt(0).toUpperCase();
      fb.style.cssText = `position:absolute;inset:0;display:flex;align-items:center;
        justify-content:center;font-size:30px;font-weight:700;color:#fff;`;
      parent.appendChild(fb);
    }
  };

  /* Status dot */
  const statusEl = document.getElementById('avatarStatus');
  statusEl.className = 'status-dot-avatar ' + profile.status;

  /* Text fields */
  document.getElementById('displayName').textContent  = profile.displayName;
  document.getElementById('usernameTag').textContent  = profile.usernameTag;

  /* Role badges */
  const badgesEl = document.getElementById('roleBadges');
  badgesEl.innerHTML = '';
  profile.roles.forEach(role => {
    const span = document.createElement('span');
    span.className = `role-badge ${role.cls}`;
    span.innerHTML = `<span class="dot-role"></span>${role.label}`;
    badgesEl.appendChild(span);
  });

  /* Bio / quote */
  document.getElementById('bioText').textContent = profile.quote;

  /* Right stats */
  document.getElementById('statContrib').textContent     = profile.contrib;
  document.getElementById('statContribSub').textContent  = profile.contribSub;
  document.getElementById('statMessages').textContent    = fmt(profile.messages);
  document.getElementById('statMessagesSub').textContent = profile.msgSub;
  document.getElementById('statBlessings').textContent   = profile.blessings;
  document.getElementById('statBlessingsSub').textContent = profile.blessSub;

  /* Big stats */
  document.getElementById('statRank').textContent  = `#${profile.rank}`;
  document.getElementById('statLevel').textContent = profile.level;
  document.getElementById('quoteArea').textContent = profile.quote;

  /* Small stats */
  document.getElementById('statServers').textContent    = profile.servers;
  document.getElementById('statServersSub').textContent = profile.serversSub;
  document.getElementById('statEvents').textContent     = profile.events;
  document.getElementById('statEventsSub').textContent  = profile.eventsSub;
  document.getElementById('statWriting').textContent    = profile.writing;
  document.getElementById('statWritingSub').textContent = profile.writingSub;

  /* Footer */
  document.getElementById('footUserId').textContent = profile.userId;
}

/* ── Animate stats count-up ─────────────────────────────────── */
function animateCounter(id, target, duration = 600) {
  const el = document.getElementById(id);
  const isHash = String(target).startsWith('#');
  const numTarget = isHash ? parseInt(target.replace('#', '')) : parseInt(target);
  if (isNaN(numTarget)) return;

  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
    const current = Math.floor(numTarget * eased);
    el.textContent = isHash ? `#${current}` : fmt(current);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = isHash ? `#${numTarget}` : fmt(numTarget);
  }
  requestAnimationFrame(step);
}

/* ── Main ritualize function ────────────────────────────────── */
async function ritualize() {
  const raw = usernameInput.value.trim();
  if (!raw) {
    setStatus('Masukkan username terlebih dahulu!', 'error');
    usernameInput.focus();
    return;
  }

  /* Validate: no spaces, basic length */
  if (raw.length < 2 || /\s/.test(raw)) {
    setStatus(`Username "${raw}" tidak valid.`, 'error');
    return;
  }

  /* Hide previous card */
  cardSection.classList.remove('visible');
  ritualizeBtn.classList.add('loading');
  ritualizeBtn.disabled = true;

  /* Loading sequence */
  const steps = [
    ['Menghubungi server Ritual...', 'loading'],
    [`Mencari @${raw}...`, 'loading'],
    ['Memuat data profil Discord...', 'loading'],
    ['Menghitung stats komunitas...', 'loading'],
    ['Membangun kartu profil...', 'loading'],
  ];

  for (const [msg, mode] of steps) {
    setStatus(msg, mode);
    await sleep(320 + Math.random() * 180);
  }

  /* Generate + render */
  const profile = generateProfile(raw);
  renderCard(profile);

  /* Show card */
  cardSection.classList.add('visible');
  cardSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  /* Animate counters */
  await sleep(200);
  animateCounter('statContrib',  profile.contrib,   500);
  animateCounter('statMessages', profile.messages,  700);
  animateCounter('statBlessings',profile.blessings, 500);
  animateCounter('statRank',    `#${profile.rank}`, 800);
  animateCounter('statLevel',    profile.level,     600);
  animateCounter('statServers',  profile.servers,   400);
  animateCounter('statEvents',   profile.events,    500);
  animateCounter('statWriting',  profile.writing,   600);

  /* Done */
  setStatus(`✓ Profil @${raw} berhasil di-ritualize!`, 'success');
  ritualizeBtn.classList.remove('loading');
  ritualizeBtn.disabled = false;
}

/* ── Share card ─────────────────────────────────────────────── */
function shareCard() {
  const username = usernameInput.value.trim();
  const text = `Cek profil Ritual Discord @${username} di Ritcord!`;
  if (navigator.share) {
    navigator.share({ title: 'Ritcord', text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(`${text} — ritcord.xyz`).then(() => {
      setStatus('Link tersalin ke clipboard!', 'success');
    }).catch(() => {
      setStatus('Tidak bisa menyalin link.', 'error');
    });
  }
}

/* ── Reset / search again ───────────────────────────────────── */
function resetCard() {
  cardSection.classList.remove('visible');
  usernameInput.value = '';
  usernameInput.focus();
  setStatus('Siap — masukkan username untuk memulai', 'idle');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}