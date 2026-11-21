// Leonida Ledger — GTA VI trophy tracker: checklist, roadmap, missables, sources.
// Offline: the only fetch is this app's own data/trophies.json. Progress lives in localStorage.
const STORE_KEY = 'leonida-ledger-earned-v3';
const DEMO_IDS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const TABS = ['tracker', 'roadmap', 'missables', 'sources'];

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const sources = doc.sources;
const byId = new Map(trophies.map((t) => [t.id, t]));

let earned = new Set(JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]'));
let openGuideId = null;

const $ = (id) => document.getElementById(id);
const listEl = $('trophyList');
const panelEl = $('guidePanel');

function saveProgress() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned]));
}

function gradeLabel(t) {
  return t.grade.charAt(0).toUpperCase() + t.grade.slice(1);
}

function flagText(t) {
  const flags = [];
  if (t.missable) flags.push('POSSIBLY MISSABLE');
  if (t.hidden) flags.push('PSN-HIDDEN');
  if (t.disputed) flags.push('DISPUTED — method unconfirmed');
  return flags.join(' · ');
}

function trophyVisibleName(t) {
  const shielded = $('spoilerShield').checked && t.kind === 'story' && !earned.has(t.name);
  return shielded ? 'Hidden story trophy — earn it to reveal' : t.name;
}

function trophyVisibleDesc(t) {
  const shielded = $('spoilerShield').checked && t.kind === 'story' && !earned.has(t.name);
  return shielded ? 'Spoiler shield is on. The name and description stay hidden until this trophy is earned.' : t.description;
}

function filteredTrophies() {
  const q = $('search').value.trim().toLowerCase();
  const kind = $('kindFilter').value;
  const grade = $('gradeFilter').value;
  return trophies.filter((t) => {
    if (kind !== 'all' && t.kind !== kind) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if ($('hiddenOnly').checked && !t.hidden) return false;
    if ($('disputedOnly').checked && !t.disputed) return false;
    if ($('notEarnedOnly').checked && earned.has(t.name)) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) return false;
    return true;
  });
}

function renderProgress() {
  $('progressCount').textContent = `${earned.size} / ${trophies.length}`;
  $('progressFill').style.width = `${(earned.size / trophies.length) * 100}%`;
}

function renderAudit() {
  const counts = trophies.reduce((a, t) => { a[t.grade] = (a[t.grade] || 0) + 1; return a; }, {});
  const hidden = trophies.filter((t) => t.hidden).length;
  const cited = trophies.filter((t) => t.sources && t.sources.length > 0).length;
  const missable = trophies.filter((t) => t.missable).length;
  $('auditStrip').textContent =
    `${trophies.length}/${trophies.length} official names · ${counts.platinum}P ${counts.gold}G ${counts.silver}S ${counts.bronze}B · ${hidden} PSN-hidden · ${cited}/${trophies.length} guides cited · sources read ${doc.sourcesRead} · ${missable} possibly missable`;
}

function renderList() {
  const shown = filteredTrophies();
  listEl.replaceChildren();
  for (const t of shown) {
    const li = document.createElement('li');
    if (earned.has(t.name)) li.classList.add('earned');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Earned: ${t.name}`);
    box.addEventListener('click', (event) => event.stopPropagation());
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      saveProgress();
      renderProgress();
      renderList();
      if (openGuideId === t.id) openGuide(t.id);
    });
    const mid = document.createElement('div');
    const name = document.createElement('div');
    name.className = 't-name';
    name.textContent = trophyVisibleName(t);
    const desc = document.createElement('div');
    desc.className = 't-desc';
    desc.textContent = trophyVisibleDesc(t);
    mid.append(name, desc);
    const flags = flagText(t);
    if (flags) {
      const f = document.createElement('div');
      f.className = 't-flags';
      f.textContent = flags;
      mid.append(f);
    }
    const grade = document.createElement('span');
    grade.className = `grade ${t.grade}`;
    grade.textContent = gradeLabel(t);
    li.append(box, mid, grade);
    li.addEventListener('click', () => openGuide(t.id));
    listEl.append(li);
  }
  $('listCount').textContent = `${shown.length} of ${trophies.length} shown`;
}

function openGuide(id) {
  const t = byId.get(id);
  if (!t) return;
  openGuideId = id;
  $('guideName').textContent = t.name;
  $('guideMeta').textContent = `${gradeLabel(t)} · ${t.kind} · ${t.stageLabel}${t.hidden ? ' · PSN-hidden' : ''}${t.missable ? ' · POSSIBLY MISSABLE' : ''}`;
  $('guideDesc').textContent = t.description;
  $('guideText').textContent = t.guide;
  const dispute = $('guideDispute');
  if (t.sourcesDisagree) {
    dispute.hidden = false;
    dispute.textContent = t.sourcesDisagree;
  } else {
    dispute.hidden = true;
    dispute.textContent = '';
  }
  const srcList = $('guideSources');
  srcList.replaceChildren();
  for (const key of t.sources) {
    const s = sources[key];
    if (!s) continue;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    li.append(a);
    srcList.append(li);
  }
  panelEl.hidden = false;
  panelEl.scrollIntoView({ block: 'nearest' });
}

function closeGuide() {
  openGuideId = null;
  panelEl.hidden = true;
}

function renderRoadmap() {
  const wrap = $('roadmapStages');
  wrap.replaceChildren();
  const stageNotes = {
    1: 'Do this before anything else. The balcony moment happens once, in Chapter 1, and cannot be replayed.',
    2: 'Play the story straight through Chapters 1–5. Mission and chapter trophies unlock as you go; none of them can be missed.',
    3: 'Answer stranger missions whenever their markers appear. Givers have windows tied to story progress, but every trophy-related giver returns in free-roam.',
    4: 'Best done while roaming between missions — the map is open and every collectible stays available after the story.',
    5: 'One go at each activity type, then grind the counted ones. All of these stay open in free-roam.',
    6: 'Final sweep. The 100% checklist only becomes viewable after the story, though progress made during the story already counts.',
  };
  const stages = [...new Set(trophies.map((t) => t.stage))].sort((a, b) => a - b);
  for (const stage of stages) {
    const members = trophies.filter((t) => t.stage === stage);
    const div = document.createElement('div');
    div.className = 'stage' + (stage === 1 ? ' hot' : '');
    const h = document.createElement('h3');
    h.textContent = members[0].stageLabel;
    const note = document.createElement('p');
    note.textContent = stageNotes[stage];
    if (stage === 1) {
      const warn = document.createElement('p');
      warn.innerHTML = '';
      const strong = document.createElement('strong');
      strong.className = 'last-chance';
      strong.textContent = 'Last chance: Chapter 1 only — the balcony meditation cannot be replayed.';
      warn.append(strong);
      div.append(h, note, warn);
    } else {
      div.append(h, note);
    }
    const ul = document.createElement('ul');
    for (const t of members) {
      const li = document.createElement('li');
      li.textContent = `${t.name} `;
      const g = document.createElement('span');
      g.className = 't-grade';
      g.textContent = `— ${gradeLabel(t)}${t.missable ? ' · possibly missable' : ''}${earned.has(t.name) ? ' · earned ✓' : ''}`;
      li.append(g);
      ul.append(li);
    }
    div.append(ul);
    wrap.append(div);
  }
}

function renderMissables() {
  const t = trophies.find((x) => x.missable);
  const card = $('missableCard');
  card.replaceChildren();
  const hero = document.createElement('div');
  hero.className = 'missable-hero';
  const h = document.createElement('h3');
  h.textContent = `${t.name} — ${gradeLabel(t)}`;
  const desc = document.createElement('p');
  desc.textContent = t.description;
  const guide = document.createElement('p');
  guide.textContent = t.guide;
  const dispute = document.createElement('p');
  dispute.className = 'dispute';
  dispute.textContent = t.sourcesDisagree;
  const src = document.createElement('p');
  src.textContent = 'Sources: ';
  t.sources.forEach((key, i) => {
    if (i > 0) src.append(document.createTextNode(' · '));
    const a = document.createElement('a');
    a.href = sources[key].url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = sources[key].name;
    src.append(a);
  });
  hero.append(h, desc, guide, dispute, src);
  card.append(hero);
}

function renderSources() {
  const list = $('sourceList');
  list.replaceChildren();
  for (const key of Object.keys(sources)) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = sources[key].url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = sources[key].name;
    li.append(a, document.createTextNode(` — ${sources[key].url}`));
    list.append(li);
  }
  const table = $('matrixTable');
  table.replaceChildren();
  const head = document.createElement('tr');
  const th0 = document.createElement('th');
  th0.textContent = 'Trophy';
  head.append(th0);
  for (const key of Object.keys(sources)) {
    const th = document.createElement('th');
    th.textContent = sources[key].name;
    head.append(th);
  }
  table.append(head);
  for (const t of trophies) {
    const tr = document.createElement('tr');
    const name = document.createElement('td');
    name.textContent = t.name;
    tr.append(name);
    for (const key of Object.keys(sources)) {
      const td = document.createElement('td');
      td.className = 'mark';
      td.textContent = t.sources.includes(key) ? '✓' : '';
      tr.append(td);
    }
    table.append(tr);
  }
}

function showTab(tab) {
  if (!TABS.includes(tab)) tab = 'tracker';
  for (const name of TABS) {
    $(`tab-${name}`).hidden = name !== tab;
  }
  for (const link of document.querySelectorAll('.tabs a')) {
    link.classList.toggle('active', link.dataset.tab === tab);
  }
}

function parseHash() {
  const parts = location.hash.slice(1).split('&').filter(Boolean);
  const tab = parts[0] || 'tracker';
  const params = {};
  for (const part of parts.slice(1)) {
    const [k, v] = part.split('=');
    params[k] = v;
  }
  return { tab, params };
}

function loadDemoProgress() {
  earned = new Set(DEMO_IDS.map((id) => byId.get(id).name));
  saveProgress();
  renderProgress();
  renderList();
  openGuide(28);
}

$('search').addEventListener('input', renderList);
$('kindFilter').addEventListener('change', renderList);
$('gradeFilter').addEventListener('change', renderList);
$('hiddenOnly').addEventListener('change', renderList);
$('disputedOnly').addEventListener('change', renderList);
$('notEarnedOnly').addEventListener('change', renderList);
$('spoilerShield').addEventListener('change', renderList);
$('guideClose').addEventListener('click', closeGuide);
$('demoBtn').addEventListener('click', loadDemoProgress);
$('clearBtn').addEventListener('click', () => {
  earned = new Set();
  saveProgress();
  renderProgress();
  renderList();
});
$('exportBtn').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify([...earned], null, 2)], { type: 'application/json' }));
  a.download = 'leonida-ledger-progress.json';
  a.click();
});
$('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const names = JSON.parse(await file.text());
    earned = new Set(names.filter((n) => trophies.some((t) => t.name === n)));
    saveProgress();
    renderProgress();
    renderList();
  } catch {
    alert('That file is not a valid Leonida Ledger progress export.');
  }
  event.target.value = '';
});
window.addEventListener('hashchange', () => {
  const { tab } = parseHash();
  showTab(tab);
});

renderAudit();
renderProgress();
renderList();
renderRoadmap();
renderMissables();
renderSources();

const { tab, params } = parseHash();
showTab(tab);
if (params.demo === '1') loadDemoProgress();
if (params.guide) openGuide(Number(params.guide));
