/* Blue PMS – site script (no cart)
   - Theme toggle (persisted)
   - Faster marquee (data-speed)
   - Reveal on scroll
   - Reviews slider controls
   - Live chat widget (demo)
*/

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

/* ---------- Theme ---------- */
function applyTheme(theme /* 'light' | 'dark' | null */) {
  const root = document.documentElement;
  if (theme === 'light') root.setAttribute('data-theme', 'light');
  else root.removeAttribute('data-theme');
  try {
    localStorage.setItem('bluepms_theme', theme || 'dark');
  } catch {}
  // Update theme-color meta for address bars
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', theme === 'light' ? '#0ea5e9' : '#0b1220');
  }
}

function setupThemeToggle() {
  // read saved
  let saved = null;
  try { saved = localStorage.getItem('bluepms_theme'); } catch {}
  applyTheme(saved === 'light' ? 'light' : null);

  $('#themeToggle').addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    applyTheme(isLight ? null : 'light');
  });
}

/* ---------- Marquee ---------- */
function setupMarquee() {
  const m = document.querySelector('[data-marquee]');
  if (!m) return;
  // Optional: speed override from data-speed (e.g., "9s")
  const speed = m.getAttribute('data-speed');
  if (speed) m.style.setProperty('--marquee-dur', speed);

  // Duplicate content to ensure seamless scrolling
  const items = Array.from(m.children).map(el => el.cloneNode(true));
  items.forEach(node => m.appendChild(node));
}

/* ---------- Reveal on scroll ---------- */
function setupReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.14 });
  $$('.reveal').forEach(el => io.observe(el));
}

/* ---------- Reviews slider ---------- */
function setupSlider() {
  const track = $('[data-slider]');
  if (!track) return;
  const prev = $('.slider .prev');
  const next = $('.slider .next');
  const snapWidth = () => track.firstElementChild?.getBoundingClientRect().width + 16 || 320;

  prev.addEventListener('click', () => track.scrollBy({ left: -snapWidth(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: snapWidth(), behavior: 'smooth' }));
}

/* ---------- Live chat (demo) ---------- */
const chatState = {
  history: load('bluepms_chat_history') ?? [
    { who: 'bot', text: 'Hi! 👋 How can we help? Type “pricing”, “demo”, or “support”.' }
  ]
};

function load(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } }
function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

function renderChat() {
  const list = $('[data-chat-messages]');
  if (!list) return;
  list.innerHTML = '';
  chatState.history.forEach(msg => {
    const wrap = document.createElement('div');
    wrap.className = `msg ${msg.who === 'me' ? 'me' : ''}`;
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.textContent = msg.text;
    wrap.appendChild(bubble);
    list.appendChild(wrap);
  });
  list.scrollTop = list.scrollHeight;
}

function botReply(input) {
  const txt = (input || '').toLowerCase();
  let reply = "Thanks! A specialist will follow up shortly. For urgent issues, email support@bluepms.com.";
  if (txt.includes('price') || txt.includes('pricing')) reply = "Our plans start at $49/property/month for Core. See the Pricing section for details.";
  else if (txt.includes('demo')) reply = "Great! I can book a personalized demo. Please share your email and preferred time.";
  else if (txt.includes('support')) reply = "24/7 support via chat & email. What issue are you facing today?";
  setTimeout(() => {
    chatState.history.push({ who: 'bot', text: reply });
    save('bluepms_chat_history', chatState.history);
    renderChat();
  }, 500);
}

function setupChat() {
  const dialog = $('#chatDialog');
  const fab = $('#chatFab');
  const input = $('#chatInput');
  const send = $('#chatSend');

  renderChat();

  function openChat() {
    if (!dialog.open) dialog.showModal();
    fab.setAttribute('aria-expanded', 'true');
    renderChat();
  }
  function closeChat() {
    if (dialog.open) dialog.close();
    fab.setAttribute('aria-expanded', 'false');
  }

  fab.addEventListener('click', openChat);
  $('[data-close-chat]').addEventListener('click', closeChat);
  dialog.addEventListener('click', (e) => { if (e.target === dialog) closeChat(); });

  function submit() {
    const v = input.value.trim();
    if (!v) return;
    chatState.history.push({ who: 'me', text: v });
    save('bluepms_chat_history', chatState.history);
    input.value = '';
    renderChat();
    botReply(v);
  }
  send.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
}

/* ---------- Misc ---------- */
function setYear() { const y = new Date().getFullYear(); const el = $('#year'); if (el) el.textContent = y; }

/* ---------- Init ---------- */
function init() {
  setupThemeToggle();
  setupMarquee();
  setupReveal();
  setupSlider();
  setupChat();
  setYear();
}
document.addEventListener('DOMContentLoaded', init);
