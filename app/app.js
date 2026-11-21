// Leonida Ledger — GTA VI trophy tracker: localStorage progress, filters, spoiler
// shield, export/import, demo progress, roadmap, missables and a cited source matrix.
// Loads only app/data/trophies.json (a file under app/); no network at runtime.
const KEY = 'leonida-ledger-earned-v1';
const SPOILER_KEY = 'leonida-ledger-spoiler-v1';
const DEMO_IDS = [2, 3, 8, 16, 19, 20, 21, 35, 53, 55];
const TABS = ['tracker', 'roadmap', 'missables', 'sources'];

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

let earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
let selected = null;
let spoilerOn = localStorage.getItem(SPOILER_KEY) === '1';

const $ = (id) => document.getElementById(id);
const rowsEl = $('rows');
const searchEl = $('search');
const kindEl = $('filter-kind');
const gradeEl = $('filter-grade');
const spoilerEl = $('spoiler');

function save() {
  localStorage.setItem(KEY, JSON.stringify([...earned]));
}

function spoilerHidden(t) {
  return spoilerOn && t.kind === 'story' && !earned.has(t.name);
}

function kindLabel(t) {
  if (t.kind === 'platinum') return 'platinum';
  return t.kind;
}

function renderProgress() {
  const n = earned.size;
  const total = trophies.length;
  $('progress-text').textContent = `${n} of ${total} earned — ${Math.round((n / total) * 100)}% to the platinum`;
  $('progress-fill').style.width = `${(n / total) * 100}%`;
}

function tagHtml(t) {
  let s = `<span class="tag">${kindLabel(t)}</span>`;
  if (t.hidden) s += '<span class="tag">PSN-hidden</span>';
  if (t.missable) s += '<span class="tag warn">MISSABLE — do first</span>';
  if (t.disputed) s += '<span class="tag disputed">unconfirmed method</span>';
  if (t.count) s += `<span class="tag">count: ${t.count}</span>`;
  return s;
}

function renderRows() {
  const q = searchEl.value.trim().toLowerCase();
  const kind = kindEl.value;
  const grade = gradeEl.value;
  rowsEl.replaceChildren();
  let shown = 0;
  for (const t of trophies) {
    if (grade !== 'all' && t.grade !== grade) continue;
    if (kind === 'story' && t.kind !== 'story') continue;
    if (kind === 'missable' && !t.missable) continue;
    if (kind === 'collectibles' && t.kind !== 'collectibles') continue;
    if (kind === 'activities' && t.kind !== 'activities') continue;
    if (kind === 'hidden' && !t.hidden) continue;
    if (kind === 'disputed' && !t.disputed) continue;
    if (kind === 'not-earned' && earned.has(t.name)) continue;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) continue;
    shown++;
    const tr = document.createElement('tr');
    if (earned.has(t.name)) tr.classList.add('earned');
    if (selected === t.name) tr.classList.add('selected');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Mark ${t.name} earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      save();
      renderProgress();
      renderRows();
      renderGuidePanel();
    });
    const tdBox = document.createElement('td');
    tdBox.append(box);
    tr.append(tdBox);
    const tdName = document.createElement('td');
    if (spoilerHidden(t)) {
      tdName.innerHTML = '<strong>Hidden story trophy</strong><br><em>Earn it to reveal the name &amp; description.</em>';
    } else {
      const strong = document.createElement('strong');
      strong.textContent = t.name;
      tdName.append(strong);
      tdName.append(document.createElement('br'));
      tdName.append(document.createTextNode(t.description));
      tdName.append(document.createElement('br'));
      const tags = document.createElement('span');
      tags.innerHTML = tagHtml(t);
      tdName.append(tags);
    }
    tr.append(tdName);
    const tdGrade = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = `badge ${t.grade}`;
    badge.textContent = t.grade;
    tdGrade.append(badge);
    tr.append(tdGrade);
    const tdGuide = document.createElement('td');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = selected === t.name ? 'Guide open ▲' : 'Read guide';
    btn.addEventListener('click', () => {
      selected = selected === t.name ? null : t.name;
      renderRows();
      renderGuidePanel();
      if (selected) $('guide-panel').scrollIntoView({ block: 'nearest' });
    });
    tdGuide.append(btn);
    tr.append(tdGuide);
    rowsEl.append(tr);
  }
  $('result-count').textContent = `Showing ${shown} of ${trophies.length} trophies.`;
}

function renderGuidePanel() {
  const panel = $('guide-panel');
  const t = trophies.find((x) => x.name === selected);
  if (!t) {
    panel.hidden = true;
    panel.replaceChildren();
    return;
  }
  panel.hidden = false;
  panel.replaceChildren();
  const h = document.createElement('h3');
  h.textContent = `${t.name} — ${t.grade}`;
  panel.append(h);
  const desc = document.createElement('p');
  desc.innerHTML = '<strong>Official description:</strong> ';
  desc.append(document.createTextNode(t.description));
  panel.append(desc);
  const guide = document.createElement('p');
  guide.textContent = t.guide;
  panel.append(guide);
  if (t.sourcesDisagree) {
    const warn = document.createElement('p');
    warn.innerHTML = '<strong>Sources disagree / unconfirmed:</strong> ';
    warn.append(document.createTextNode(t.sourcesDisagree));
    panel.append(warn);
  }
  const cite = document.createElement('p');
  cite.className = 'cite';
  cite.textContent = 'Sources: ';
  t.sources.forEach((s, i) => {
    if (i > 0) cite.append(document.createTextNode(' · '));
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.name;
    cite.append(a);
  });
  cite.append(document.createTextNode(' — read 21 Nov 2026.'));
  panel.append(cite);
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Close guide';
  close.addEventListener('click', () => {
    selected = null;
    renderRows();
    renderGuidePanel();
  });
  panel.append(close);
}

const ROADMAP_STAGES = [
  ['1-missable', 'Stage 1 — Missable risk first (Chapter 1)'],
  ['2-story', 'Stage 2 — Story: chapters & named missions (unmissable)'],
  ['3-strangers', 'Stage 3 — Stranger strands (8 strands, silver)'],
  ['4-collectibles', 'Stage 4 — Collectibles & exploration'],
  ['5-activities', 'Stage 5 — Activities, combat & money'],
  ['6-cleanup', 'Stage 6 — Cleanup & disputed trophies'],
  ['platinum', 'Stage 7 — Platinum'],
];

function renderRoadmap() {
  const list = $('roadmap-list');
  list.replaceChildren();
  for (const [stage, title] of ROADMAP_STAGES) {
    const li = document.createElement('li');
    const strong = document.createElement('strong');
    strong.textContent = title;
    li.append(strong);
    const names = trophies
      .filter((t) => t.roadmap === stage)
      .map((t) => (spoilerHidden(t) ? 'Hidden story trophy' : t.name));
    const p = document.createElement('p');
    p.textContent = names.join(' · ');
    li.append(p);
    if (stage === '1-missable') {
      const note = document.createElement('p');
      note.innerHTML = '<strong>Positive Mental Attitude first, in Chapter 1:</strong> after Down to Earth, talk to Lucia in the kitchen in the morning and accept the balcony meditation. It is the only step that may not come back.';
      li.append(note);
    }
    list.append(li);
  }
}

function uniqueSources() {
  const seen = new Map();
  for (const t of trophies) {
    for (const s of t.sources) {
      if (!seen.has(s.url)) seen.set(s.url, s.name);
    }
  }
  return [...seen.entries()].map(([url, name]) => ({ name, url }));
}

function renderSources() {
  const srcs = uniqueSources();
  const list = $('source-list');
  list.replaceChildren();
  srcs.forEach((s, i) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.textContent = s.name;
    li.append(a);
    const n = trophies.filter((t) => t.sources.some((x) => x.url === s.url)).length;
    li.append(document.createTextNode(` — cited for ${n} of 55 trophies. Read 21 Nov 2026.`));
    list.append(li);
  });
  const matrix = $('matrix');
  matrix.replaceChildren();
  const head = document.createElement('tr');
  const th0 = document.createElement('th');
  th0.textContent = 'Trophy';
  head.append(th0);
  srcs.forEach((s, i) => {
    const th = document.createElement('th');
    th.textContent = `S${i + 1}`;
    th.title = s.name;
    head.append(th);
  });
  matrix.append(head);
  for (const t of trophies) {
    const tr = document.createElement('tr');
    const td0 = document.createElement('td');
    td0.textContent = spoilerHidden(t) ? 'Hidden story trophy' : t.name;
    tr.append(td0);
    for (const s of srcs) {
      const td = document.createElement('td');
      if (t.sources.some((x) => x.url === s.url)) {
        td.textContent = '✓';
        td.className = 'hit';
      } else {
        td.textContent = '·';
      }
      tr.append(td);
    }
    matrix.append(tr);
  }
}

function currentTab() {
  const hash = location.hash.replace(/^#/, '');
  const parts = hash.split('&');
  const tab = TABS.includes(parts[0]) ? parts[0] : 'tracker';
  const params = new URLSearchParams(parts.slice(1).join('&'));
  return { tab, params };
}

function applyTab() {
  const { tab, params } = currentTab();
  for (const t of TABS) {
    $(`tab-${t}`).hidden = t !== tab;
    document.querySelector(`[data-tab="${t}"]`).classList.toggle('active', t === tab);
  }
  if (params.get('demo') === '1') {
    loadDemo();
  }
  renderRoadmap();
  renderSources();
}

function loadDemo() {
  const names = trophies.filter((t) => DEMO_IDS.includes(t.id)).map((t) => t.name);
  for (const n of names) earned.add(n);
  save();
  renderProgress();
  renderRows();
  if (!selected) {
    selected = 'Positive Mental Attitude';
    renderRows();
    renderGuidePanel();
  }
}

searchEl.addEventListener('input', renderRows);
kindEl.addEventListener('change', renderRows);
gradeEl.addEventListener('change', renderRows);
spoilerEl.addEventListener('change', () => {
  spoilerOn = spoilerEl.checked;
  localStorage.setItem(SPOILER_KEY, spoilerOn ? '1' : '0');
  renderRows();
  renderRoadmap();
  renderSources();
  renderGuidePanel();
});
spoilerEl.checked = spoilerOn;

$('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify([...earned], null, 2)], { type: 'application/json' }));
  a.download = 'leonida-ledger-progress.json';
  a.click();
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const names = JSON.parse(await file.text());
    const valid = new Set(trophies.map((t) => t.name));
    earned = new Set(names.filter((n) => valid.has(n)));
    save();
    renderProgress();
    renderRows();
  } catch {
    alert('That file is not a valid Leonida Ledger progress export.');
  }
  e.target.value = '';
});
$('demo').addEventListener('click', loadDemo);
$('reset').addEventListener('click', () => {
  earned = new Set();
  selected = null;
  save();
  renderProgress();
  renderRows();
  renderGuidePanel();
});
window.addEventListener('hashchange', applyTab);

renderProgress();
renderRows();
applyTab();
