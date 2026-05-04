/* ============================================
   ZÉNIT — app.js
   Main logic for index.html
   ============================================ */

// ── State ──
let currentUser = null;
let xpPoints = 1240;
let streakDays = 7;

// ── Page routing ──
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (page) {
    page.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update nav active state
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));

  if (id === 'home') {
    document.querySelectorAll('.nav-links a')[0]?.classList.add('active');
  } else if (id === 'dashboard') {
    document.querySelectorAll('.nav-links a')[1]?.classList.add('active');
    renderDashboard();
  } else if (id === 'leaderboard') {
    document.querySelectorAll('.nav-links a')[3]?.classList.add('active');
    renderLeaderboard();
  }
}

function requireLogin(page) {
  if (currentUser) {
    showPage(page);
  } else {
    openModal('login');
    // After login, go to that page
    window._pendingPage = page;
  }
}

// ── Mobile nav ──
function toggleMobileNav() {
  document.getElementById('mobileNav').classList.toggle('open');
}

// ── Modals ──
function openModal(id) {
  const overlay = document.getElementById('modal-' + id);
  if (overlay) overlay.classList.add('open');
}
function closeModal(id) {
  const overlay = document.getElementById('modal-' + id);
  if (overlay) overlay.classList.remove('open');
}

// Close on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

// ── Auth ──
function doLogin() {
  const email = document.getElementById('loginEmail')?.value;
  const pass  = document.getElementById('loginPass')?.value;
  if (!email || !pass) { showToast('⚠️', 'Campos vacíos', 'Ingresa tu correo y contraseña'); return; }

  currentUser = { name: email.split('@')[0], email, xp: xpPoints };
  updateUserUI(currentUser.name);
  closeModal('login');
  showToast('🎉', '¡Bienvenido de vuelta!', 'Continuando tu camino...');
  setTimeout(() => {
    const pending = window._pendingPage || 'dashboard';
    window._pendingPage = null;
    showPage(pending);
  }, 1000);
}

function doRegister() {
  const name  = document.getElementById('regName')?.value;
  const email = document.getElementById('regEmail')?.value;
  const pass  = document.getElementById('regPass')?.value;
  const year  = document.getElementById('regYear')?.value;
  if (!name || !email || !pass) { showToast('⚠️', 'Faltan datos', 'Por favor llena todos los campos'); return; }

  currentUser = { name, email, xp: 0 };
  xpPoints = 0;
  streakDays = 1;
  updateUserUI(name);
  closeModal('register');
  showToast('🎉', '¡Cuenta creada!', `Bienvenido a Zénit, ${name}!`);
  setTimeout(() => showPage('dashboard'), 1000);
}

function updateUserUI(name) {
  const initial = name.charAt(0).toUpperCase();
  const avatarEl = document.getElementById('dashAvatar');
  const nameEl   = document.getElementById('dashName');
  const welcomeEl= document.getElementById('dashWelcomeName');
  if (avatarEl) avatarEl.textContent = initial;
  if (nameEl)   nameEl.textContent = name;
  if (welcomeEl) welcomeEl.textContent = name;
}

// ── Subject selection ──
function selectSubject(sub) {
  document.querySelectorAll('.subject-tile').forEach(t => t.classList.remove('selected'));
  document.querySelector(`.subject-tile.${sub}`)?.classList.add('selected');
  openModal('register');
}

function scrollToSubjects() {
  document.getElementById('subjects-section')?.scrollIntoView({ behavior: 'smooth' });
}

// ── Dashboard ──
const LESSONS = {
  math: [
    { title:'Fracciones básicas',       desc:'Suma, resta, mult y división de fracciones.',     icon:'🍕', badge:'done',   time:'10 min', xp:25,  id:'math-fracciones'   },
    { title:'Álgebra básica',            desc:'Variables, expresiones y ecuaciones simples.',    icon:'🔢', badge:'done',   time:'12 min', xp:30,  id:'math-algebra'      },
    { title:'Ecuaciones de 2° grado',    desc:'Fórmula general y factorización.',               icon:'📐', badge:'new',    time:'15 min', xp:40,  id:'math-eq2'          },
    { title:'Geometría: perímetro',      desc:'Calcula perímetros de figuras planas.',           icon:'📏', badge:'review', time:'10 min', xp:25,  id:'math-geo'          },
    { title:'Estadística básica',        desc:'Media, mediana, moda y rango.',                  icon:'📊', badge:'new',    time:'14 min', xp:35,  id:'math-stats'        },
    { title:'Funciones trigonométricas', desc:'Seno, coseno y tangente.',                       icon:'🧮', badge:'locked', time:'20 min', xp:60,  id:'math-trig'         },
  ],
  eng: [
    { title:'Simple Present',           desc:'Use it to express habits and general truths.',    icon:'🗓️', badge:'done',   time:'10 min', xp:20,  id:'eng-pres'          },
    { title:'Past Simple',              desc:'Talking about completed actions in the past.',    icon:'⏮️', badge:'review', time:'12 min', xp:30,  id:'eng-past'          },
    { title:'Past vs. Pres. Perfect',   desc:'The key difference between these two tenses.',   icon:'🌍', badge:'new',    time:'12 min', xp:35,  id:'eng-tenses'        },
    { title:'Vocabulary: Daily Life',   desc:'50 essential words for everyday situations.',    icon:'📚', badge:'new',    time:'8 min',  xp:25,  id:'eng-vocab'         },
    { title:'Reading Comprehension',    desc:'Understand texts and answer questions.',         icon:'📖', badge:'locked', time:'18 min', xp:45,  id:'eng-reading'       },
    { title:'Writing: Paragraphs',      desc:'Structure ideas in well-formed paragraphs.',     icon:'✍️', badge:'locked', time:'20 min', xp:50,  id:'eng-writing'       },
  ],
  esp: [
    { title:'Uso de B y V',             desc:'Reglas claras para no confundir estas letras.',  icon:'📝', badge:'done',   time:'8 min',  xp:20,  id:'esp-bv'            },
    { title:'Uso de la coma',           desc:'Cuándo y cómo colocar comas correctamente.',     icon:'✏️', badge:'done',   time:'10 min', xp:25,  id:'esp-coma'          },
    { title:'Acentuación',             desc:'Reglas de acentuación general y diacrítica.',    icon:'á',  badge:'review', time:'12 min', xp:30,  id:'esp-acento'        },
    { title:'Tipos de texto',           desc:'Narrativo, descriptivo, argumentativo.',          icon:'📄', badge:'new',    time:'14 min', xp:35,  id:'esp-tipos'         },
    { title:'Comprensión lectora',      desc:'Identifica ideas principales y secundarias.',    icon:'🔍', badge:'new',    time:'16 min', xp:40,  id:'esp-lectura'       },
    { title:'Redacción avanzada',       desc:'Escribe textos claros, fluidos y estructurados.',icon:'🖊️', badge:'locked', time:'22 min', xp:60,  id:'esp-redaccion'     },
  ]
};

function renderLessons(subject) {
  const lessons = LESSONS[subject];
  const container = document.getElementById(subject + 'Lessons');
  if (!container) return;

  container.innerHTML = lessons.map(l => `
    <div class="lesson-card ${l.badge === 'locked' ? 'locked' : ''}" onclick="${l.badge !== 'locked' ? `goToExercise('${subject}')` : ''}">
      <div class="lc-header">
        <div class="lc-badge ${l.badge}">${badgeLabel(l.badge)}</div>
        <div class="lc-icon">${l.icon}</div>
      </div>
      <div class="lc-title">${l.title}</div>
      <div class="lc-desc">${l.desc}</div>
      <div class="lc-meta">
        <span class="lc-time">⏱ ${l.time}</span>
        <span class="lc-xp">+${l.xp} XP</span>
      </div>
    </div>
  `).join('');
}

function badgeLabel(badge) {
  const map = { done: '✅ Completado', new: '⚡ Nuevo', review: '🔄 Repasar', locked: '🔒 Bloqueado' };
  return map[badge] || badge;
}

function showDashSection(section) {
  // Hide all sections
  ['overview', 'lessons-math', 'lessons-eng', 'lessons-esp', 'achievements'].forEach(s => {
    const el = document.getElementById('dash-' + s);
    if (el) el.style.display = 'none';
  });

  // Show selected
  const target = document.getElementById('dash-' + section);
  if (target) target.style.display = 'block';

  // Render if needed
  if (section === 'lessons-math') renderLessons('math');
  if (section === 'lessons-eng')  renderLessons('eng');
  if (section === 'lessons-esp')  renderLessons('esp');
  if (section === 'achievements') renderAchievements();

  // Update sidebar links
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  const idx = ['overview','lessons-math','lessons-eng','lessons-esp',null,'achievements'].indexOf(section);
  const links = document.querySelectorAll('.sidebar-link');
  if (links[idx]) links[idx].classList.add('active');
}

// ── Achievements ──
const ACHIEVEMENTS = [
  { icon:'🔥', name:'Racha de 7 días',      desc:'7 días seguidos estudiando',     unlocked: true  },
  { icon:'⚡', name:'Primera lección',       desc:'Completaste tu primera lección', unlocked: true  },
  { icon:'🏆', name:'Top 10',               desc:'Entra al top 10 del ranking',    unlocked: true  },
  { icon:'💯', name:'Perfección',            desc:'10 ejercicios seguidos correctos',unlocked:true  },
  { icon:'🧠', name:'Polímata',              desc:'Progreso en las 3 materias',     unlocked: false },
  { icon:'🚀', name:'Despegue',              desc:'Llega al nivel 5',               unlocked: false },
  { icon:'📚', name:'Maratón lector',        desc:'Completa 50 ejercicios de Español',unlocked:false},
  { icon:'🌍', name:'Global citizen',        desc:'Completa 30 ejercicios en inglés',unlocked:false },
];

function renderAchievements() {
  const grid = document.getElementById('achievementsGrid');
  if (!grid) return;
  grid.innerHTML = ACHIEVEMENTS.map(a => `
    <div class="achievement ${a.unlocked ? '' : 'locked'}">
      <div class="ach-icon">${a.icon}</div>
      <div class="ach-name">${a.name}</div>
      <div class="ach-desc">${a.desc}</div>
    </div>
  `).join('');
}

// ── Leaderboard ──
const LEADERBOARD_DATA = [
  { name:'Valentina R.',   xp:3450, badge:'🥇', color:'#ff4d8d' },
  { name:'Tú',             xp:1240, badge:'⭐', color:'#9b5de5', isMe:true },
  { name:'Diego M.',       xp:2980, badge:'🥈', color:'#4cc9f0' },
  { name:'Sofía L.',       xp:2750, badge:'🥉', color:'#ff8c42' },
  { name:'Andrés T.',      xp:2100, badge:'💫', color:'#ffe566' },
  { name:'Mariana C.',     xp:1850, badge:'💫', color:'#00f5d4' },
  { name:'Luis P.',        xp:1680, badge:'💫', color:'#9b5de5' },
  { name:'Camila N.',      xp:1450, badge:'💫', color:'#ff4d8d' },
  { name:'Rodrigo H.',     xp:900,  badge:'💫', color:'#4cc9f0' },
  { name:'Fernanda Q.',    xp:720,  badge:'💫', color:'#ff8c42' },
];

function renderLeaderboard() {
  const sorted = [...LEADERBOARD_DATA].sort((a,b) => b.xp - a.xp);

  // Podium (top 3)
  const podium = document.getElementById('podium');
  if (podium) {
    const order = [sorted[1], sorted[0], sorted[2]]; // 2nd, 1st, 3rd
    const ranks = ['🥈', '🥇', '🥉'];
    podium.innerHTML = order.map((p, i) => `
      <div class="podium-item">
        <div class="podium-avatar" style="background:linear-gradient(135deg,${p.color}44,${p.color}22);">
          ${p.name.charAt(0)}
        </div>
        <div class="podium-name">${p.name}</div>
        <div class="podium-xp">${p.xp.toLocaleString()} XP</div>
        <div class="podium-rank">${ranks[i]}</div>
      </div>
    `).join('');
  }

  // Full list
  const list = document.getElementById('leaderboardList');
  if (list) {
    list.innerHTML = sorted.map((p, i) => `
      <div class="lb-row ${p.isMe ? 'me' : ''}">
        <span class="lb-rank">${i + 1}</span>
        <div class="lb-avatar" style="background:linear-gradient(135deg,${p.color}55,${p.color}22)">
          ${p.name.charAt(0)}
        </div>
        <span class="lb-name">${p.name} ${p.isMe ? '<span style="font-size:.75rem;color:var(--cyan)">(tú)</span>' : ''}</span>
        <span class="lb-xp">${p.xp.toLocaleString()} XP</span>
        <span class="lb-badge">${p.badge}</span>
      </div>
    `).join('');
  }
}

// ── Navigate to exercises ──
function goToExercise(subject) {
  window.location.href = `ejercicios.html?subject=${subject}`;
}

function renderDashboard() {
  // XP bar
  const fill = document.getElementById('xpFill');
  const xpEl = document.getElementById('dashXP');
  const totalXpEl = document.getElementById('totalXP');
  const pct = Math.min((xpPoints / 1500) * 100, 100);
  if (fill) fill.style.width = pct + '%';
  if (xpEl) xpEl.textContent = xpPoints.toLocaleString();
  if (totalXpEl) totalXpEl.textContent = xpPoints.toLocaleString();

  const streakEl = document.getElementById('streakNum');
  if (streakEl) streakEl.textContent = streakDays;

  // Level
  const level = Math.floor(xpPoints / 400) + 1;
  const levelEl = document.getElementById('dashLevel');
  if (levelEl) levelEl.textContent = level;
}

// ── Toast ──
function showToast(icon, title, sub) {
  const toast = document.getElementById('toast');
  const iconEl = document.getElementById('toastIcon');
  const titleEl = document.getElementById('toastTitle');
  const subEl   = document.getElementById('toastSub');
  if (!toast) return;
  iconEl.textContent  = icon;
  titleEl.textContent = title;
  subEl.textContent   = sub;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  showPage('home');
});
